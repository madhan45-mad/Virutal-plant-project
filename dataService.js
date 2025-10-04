import { supabase } from './supabaseClient.js';

export class DataService {
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  }

  async updateUserProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating profile:', error);
      return null;
    }

    return data;
  }

  async getUserActions(userId, limit = 50) {
    const { data, error } = await supabase
      .from('actions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching actions:', error);
      return [];
    }

    return data;
  }

  async addAction(userId, action) {
    const { data, error } = await supabase
      .from('actions')
      .insert({
        user_id: userId,
        choice_id: action.choiceId,
        text: action.text,
        icon: action.icon,
        impact: action.impact,
        xp_earned: action.xpEarned,
        is_good: action.isGood
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error adding action:', error);
      return null;
    }

    return data;
  }

  async getDailyStats(userId, days = 7) {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const { data, error } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching daily stats:', error);
      return [];
    }

    return data;
  }

  async upsertDailyStats(userId, date, stats) {
    const { data, error } = await supabase
      .from('daily_stats')
      .upsert({
        user_id: userId,
        date,
        good_count: stats.goodCount,
        bad_count: stats.badCount,
        xp_earned: stats.xpEarned,
        health_start: stats.healthStart,
        health_end: stats.healthEnd
      }, {
        onConflict: 'user_id,date'
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error upserting daily stats:', error);
      return null;
    }

    return data;
  }

  async getCategoryStats(userId) {
    const { data, error } = await supabase
      .from('category_stats')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching category stats:', error);
      return null;
    }

    return data;
  }

  async updateCategoryStats(userId, updates) {
    const { data, error } = await supabase
      .from('category_stats')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating category stats:', error);
      return null;
    }

    return data;
  }

  async getLeaderboard(limit = 50) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, health, level, good_choices, bad_choices, plant_stage, avatar_url')
      .order('health', { ascending: false })
      .order('level', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    return data;
  }

  async getAllAchievements() {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('requirement', { ascending: true });

    if (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }

    return data;
  }

  async getUserAchievements(userId) {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievements (*)
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) {
      console.error('Error fetching user achievements:', error);
      return [];
    }

    return data;
  }

  async awardAchievement(userId, achievementId) {
    const { data, error } = await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_id: achievementId
      })
      .select()
      .maybeSingle();

    if (error) {
      if (error.code === '23505') {
        return null;
      }
      console.error('Error awarding achievement:', error);
      return null;
    }

    return data;
  }

  async getAllBadges() {
    const { data, error } = await supabase
      .from('badges')
      .select('*');

    if (error) {
      console.error('Error fetching badges:', error);
      return [];
    }

    return data;
  }

  async getUserBadges(userId) {
    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        *,
        badges (*)
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) {
      console.error('Error fetching user badges:', error);
      return [];
    }

    return data;
  }

  async awardBadge(userId, badgeId) {
    const { data, error } = await supabase
      .from('user_badges')
      .insert({
        user_id: userId,
        badge_id: badgeId
      })
      .select()
      .maybeSingle();

    if (error) {
      if (error.code === '23505') {
        return null;
      }
      console.error('Error awarding badge:', error);
      return null;
    }

    return data;
  }

  async getActiveChallenges() {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true)
      .gte('end_date', new Date().toISOString())
      .order('end_date', { ascending: true });

    if (error) {
      console.error('Error fetching challenges:', error);
      return [];
    }

    return data;
  }

  async getUserChallenges(userId) {
    const { data, error } = await supabase
      .from('user_challenges')
      .select(`
        *,
        challenges (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user challenges:', error);
      return [];
    }

    return data;
  }

  async updateChallengeProgress(userId, challengeId, progress, completed = false) {
    const updates = {
      progress,
      completed
    };

    if (completed) {
      updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('user_challenges')
      .upsert({
        user_id: userId,
        challenge_id: challengeId,
        ...updates
      }, {
        onConflict: 'user_id,challenge_id'
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating challenge progress:', error);
      return null;
    }

    return data;
  }

  async getFriends(userId) {
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        *,
        friend:profiles!friendships_friend_id_fkey (*)
      `)
      .eq('user_id', userId)
      .eq('status', 'accepted');

    if (error) {
      console.error('Error fetching friends:', error);
      return [];
    }

    return data;
  }

  async sendFriendRequest(userId, friendId) {
    const { data, error } = await supabase
      .from('friendships')
      .insert({
        user_id: userId,
        friend_id: friendId,
        status: 'pending'
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error sending friend request:', error);
      return null;
    }

    return data;
  }

  async acceptFriendRequest(friendshipId) {
    const { data, error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error accepting friend request:', error);
      return null;
    }

    return data;
  }

  async getNotifications(userId, unreadOnly = false) {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId);

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return data;
  }

  async markNotificationAsRead(notificationId) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }

    return true;
  }

  async createNotification(userId, type, title, message) {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        read: false
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }

    return data;
  }

  async searchUsers(searchTerm, limit = 10) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, level, plant_stage, avatar_url')
      .ilike('username', `%${searchTerm}%`)
      .limit(limit);

    if (error) {
      console.error('Error searching users:', error);
      return [];
    }

    return data;
  }
}
