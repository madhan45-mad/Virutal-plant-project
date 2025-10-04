import { DataService } from './dataService.js';
import { showToast, calculateLevel, getPlantStage, calculateXpReward, isToday, isYesterday } from './utils.js';
import { GOOD_CHOICES, BAD_CHOICES } from './gameData.js';

export class GameManager {
  constructor(userId) {
    this.userId = userId;
    this.dataService = new DataService();
    this.profile = null;
    this.achievements = [];
    this.badges = [];
    this.challenges = [];
  }

  async initialize() {
    this.profile = await this.dataService.getUserProfile(this.userId);
    this.achievements = await this.dataService.getAllAchievements();
    this.badges = await this.dataService.getAllBadges();
    this.challenges = await this.dataService.getActiveChallenges();

    await this.initializeUserChallenges();

    return this.profile;
  }

  async initializeUserChallenges() {
    for (const challenge of this.challenges) {
      const userChallenge = await this.dataService.getUserChallenges(this.userId);
      const exists = userChallenge.find(uc => uc.challenge_id === challenge.id);

      if (!exists) {
        await this.dataService.updateChallengeProgress(this.userId, challenge.id, 0, false);
      }
    }
  }

  async makeChoice(choiceId, isGood) {
    const choiceData = isGood
      ? GOOD_CHOICES.find(c => c.id === choiceId)
      : BAD_CHOICES.find(c => c.id === choiceId);

    if (!choiceData) return null;

    const impact = isGood ? 5 : -5;
    const xpEarned = calculateXpReward(isGood);

    const newHealth = Math.max(0, Math.min(100, this.profile.health + impact));
    const newXp = this.profile.xp + xpEarned;
    const newTotalXp = this.profile.total_xp + xpEarned;
    const newLevel = calculateLevel(newTotalXp);
    const newPlantStage = getPlantStage(newHealth, newLevel);

    const leveledUp = newLevel > this.profile.level;
    const stageChanged = newPlantStage !== this.profile.plant_stage;

    const today = new Date().toISOString().split('T')[0];
    const lastActionDate = this.profile.last_action_date;

    let newStreakDays = this.profile.streak_days;

    if (!lastActionDate || !isToday(lastActionDate)) {
      if (lastActionDate && isYesterday(lastActionDate)) {
        newStreakDays += 1;
      } else if (!lastActionDate) {
        newStreakDays = 1;
      } else {
        newStreakDays = 1;
      }
    }

    const newLongestStreak = Math.max(this.profile.longest_streak, newStreakDays);

    await this.dataService.addAction(this.userId, {
      choiceId,
      text: choiceData.text,
      icon: choiceData.icon,
      impact,
      xpEarned,
      isGood
    });

    this.profile = await this.dataService.updateUserProfile(this.userId, {
      health: newHealth,
      xp: newXp,
      total_xp: newTotalXp,
      level: newLevel,
      plant_stage: newPlantStage,
      good_choices: isGood ? this.profile.good_choices + 1 : this.profile.good_choices,
      bad_choices: isGood ? this.profile.bad_choices : this.profile.bad_choices + 1,
      streak_days: newStreakDays,
      longest_streak: newLongestStreak,
      last_action_date: today
    });

    await this.updateDailyStats(today, isGood, xpEarned, newHealth);
    await this.updateCategoryStats(choiceData.category);
    await this.updateChallengeProgress(isGood);
    await this.checkAchievements();

    if (leveledUp) {
      showToast('Level Up!', `You reached level ${newLevel}!`, 'success');
      await this.dataService.createNotification(
        this.userId,
        'level',
        'Level Up!',
        `Congratulations! You've reached level ${newLevel}!`
      );
    }

    if (stageChanged) {
      showToast('Plant Evolved!', `Your plant is now a ${newPlantStage}!`, 'success');
      await this.dataService.createNotification(
        this.userId,
        'achievement',
        'Plant Evolution!',
        `Your plant has evolved into a ${newPlantStage}!`
      );
    }

    return {
      profile: this.profile,
      leveledUp,
      stageChanged
    };
  }

  async updateDailyStats(date, isGood, xpEarned, currentHealth) {
    const existingStats = await this.dataService.getDailyStats(this.userId, 1);
    const todayStats = existingStats.find(s => s.date === date);

    const stats = {
      goodCount: (todayStats?.good_count || 0) + (isGood ? 1 : 0),
      badCount: (todayStats?.bad_count || 0) + (isGood ? 0 : 1),
      xpEarned: (todayStats?.xp_earned || 0) + xpEarned,
      healthStart: todayStats?.health_start || currentHealth,
      healthEnd: currentHealth
    };

    await this.dataService.upsertDailyStats(this.userId, date, stats);
  }

  async updateCategoryStats(category) {
    const categoryStats = await this.dataService.getCategoryStats(this.userId);

    const updates = { ...categoryStats };
    updates[category] = (categoryStats[category] || 0) + 1;

    await this.dataService.updateCategoryStats(this.userId, updates);
  }

  async updateChallengeProgress(isGood) {
    if (!isGood) return;

    const userChallenges = await this.dataService.getUserChallenges(this.userId);

    for (const userChallenge of userChallenges) {
      if (userChallenge.completed) continue;

      const challenge = userChallenge.challenges;
      if (!challenge || !challenge.is_active) continue;

      const newProgress = userChallenge.progress + 1;
      const completed = newProgress >= challenge.goal;

      await this.dataService.updateChallengeProgress(
        this.userId,
        challenge.id,
        newProgress,
        completed
      );

      if (completed) {
        this.profile = await this.dataService.updateUserProfile(this.userId, {
          xp: this.profile.xp + challenge.xp_reward,
          total_xp: this.profile.total_xp + challenge.xp_reward
        });

        showToast('Challenge Complete!', `You completed: ${challenge.title}`, 'success');
        await this.dataService.createNotification(
          this.userId,
          'challenge',
          'Challenge Completed!',
          `You completed "${challenge.title}" and earned ${challenge.xp_reward} XP!`
        );
      }
    }
  }

  async checkAchievements() {
    const userAchievements = await this.dataService.getUserAchievements(this.userId);
    const earnedAchievementIds = userAchievements.map(ua => ua.achievement_id);

    for (const achievement of this.achievements) {
      if (earnedAchievementIds.includes(achievement.id)) continue;

      let earned = false;

      switch (achievement.category) {
        case 'choices':
          if (this.profile.good_choices >= achievement.requirement) {
            earned = true;
          }
          break;
        case 'streaks':
          if (this.profile.streak_days >= achievement.requirement) {
            earned = true;
          }
          break;
        case 'health':
          if (achievement.code === 'perfect_health' && this.profile.health === 100) {
            earned = true;
          }
          break;
      }

      if (earned) {
        await this.dataService.awardAchievement(this.userId, achievement.id);

        this.profile = await this.dataService.updateUserProfile(this.userId, {
          xp: this.profile.xp + achievement.xp_reward,
          total_xp: this.profile.total_xp + achievement.xp_reward
        });

        showToast('Achievement Unlocked!', achievement.title, 'success');
        await this.dataService.createNotification(
          this.userId,
          'achievement',
          'Achievement Unlocked!',
          `You earned "${achievement.title}" and gained ${achievement.xp_reward} XP!`
        );
      }
    }
  }

  async checkBadges() {
    const userBadges = await this.dataService.getUserBadges(this.userId);
    const earnedBadgeIds = userBadges.map(ub => ub.badge_id);
    const categoryStats = await this.dataService.getCategoryStats(this.userId);

    for (const badge of this.badges) {
      if (earnedBadgeIds.includes(badge.id)) continue;

      let earned = false;

      switch (badge.code) {
        case 'recycler':
          if (categoryStats.recycling >= 50) earned = true;
          break;
        case 'commuter':
          if (categoryStats.public_transport >= 50) earned = true;
          break;
        case 'energy_saver':
          if (categoryStats.energy_saving >= 50) earned = true;
          break;
        case 'water_warrior':
          if (categoryStats.water_conservation >= 50) earned = true;
          break;
        case 'sustainable_shopper':
          if (categoryStats.sustainable_shopping >= 50) earned = true;
          break;
        case 'level_5':
          if (this.profile.level >= 5) earned = true;
          break;
        case 'level_10':
          if (this.profile.level >= 10) earned = true;
          break;
        case 'level_25':
          if (this.profile.level >= 25) earned = true;
          break;
        case 'level_50':
          if (this.profile.level >= 50) earned = true;
          break;
      }

      if (earned) {
        await this.dataService.awardBadge(this.userId, badge.id);
        showToast('Badge Earned!', badge.title, 'success');
        await this.dataService.createNotification(
          this.userId,
          'badge',
          'Badge Earned!',
          `You earned the "${badge.title}" badge!`
        );
      }
    }
  }

  getProfile() {
    return this.profile;
  }
}
