import { AuthManager } from './auth.js';
import { GameManager } from './gameManager.js';
import { DataService } from './dataService.js';
import { showToast, getTimeAgo, formatDate } from './utils.js';
import { GOOD_CHOICES, BAD_CHOICES, PLANT_STAGES } from './gameData.js';
import Chart from 'chart.js/auto';

class VirtualPlantApp {
  constructor() {
    this.authManager = new AuthManager();
    this.gameManager = null;
    this.dataService = new DataService();
    this.currentTab = 'plant';
    this.charts = {
      choices: null,
      prediction: null,
      correlation: null
    };
  }

  async init() {
    document.getElementById('current-year').textContent = new Date().getFullYear();
    this.addEventListeners();

    const isLoggedIn = await this.authManager.initialize();

    if (isLoggedIn) {
      await this.showGamePage();
    } else {
      this.showHomePage();
    }

    this.authManager.setupAuthListener(async (isLoggedIn, user) => {
      if (isLoggedIn) {
        await this.showGamePage();
      } else {
        this.showHomePage();
      }
    });
  }

  addEventListeners() {
    document.getElementById('login-tab-btn').addEventListener('click', () => this.switchAuthTab('login'));
    document.getElementById('signup-tab-btn').addEventListener('click', () => this.switchAuthTab('signup'));
    document.getElementById('login-tab').addEventListener('click', () => this.switchAuthTab('login'));
    document.getElementById('signup-tab').addEventListener('click', () => this.switchAuthTab('signup'));

    document.getElementById('plant-tab-btn').addEventListener('click', () => this.switchTab('plant'));
    document.getElementById('stats-tab-btn').addEventListener('click', () => this.switchTab('stats'));
    document.getElementById('leaderboard-tab-btn').addEventListener('click', () => this.switchTab('leaderboard'));
    document.getElementById('achievements-tab-btn')?.addEventListener('click', () => this.switchTab('achievements'));
    document.getElementById('challenges-tab-btn')?.addEventListener('click', () => this.switchTab('challenges'));
    document.getElementById('friends-tab-btn')?.addEventListener('click', () => this.switchTab('friends'));

    document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
    document.getElementById('signup-form').addEventListener('submit', (e) => this.handleSignup(e));
    document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());

    this.renderChoiceButtons();
  }

  switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${tab}-tab`).classList.add('active');

    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    document.getElementById(`${tab}-form`).classList.add('active');
  }

  async switchTab(tab) {
    this.currentTab = tab;

    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${tab}-tab-btn`)?.classList.add('active');

    document.querySelectorAll('.tab').forEach(tabContent => tabContent.classList.remove('active'));
    document.getElementById(`${tab}-tab`)?.classList.add('active');

    switch (tab) {
      case 'stats':
        await this.updateStatsTab();
        break;
      case 'leaderboard':
        await this.updateLeaderboardTab();
        break;
      case 'achievements':
        await this.updateAchievementsTab();
        break;
      case 'challenges':
        await this.updateChallengesTab();
        break;
      case 'friends':
        await this.updateFriendsTab();
        break;
    }
  }

  async handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
      showToast('Error', 'Please enter both email and password', 'error');
      return;
    }

    const result = await this.authManager.signIn(email, password);

    if (result.success) {
      await this.showGamePage();
    }
  }

  async handleSignup(e) {
    e.preventDefault();

    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (!username || !email || !password || !confirmPassword) {
      showToast('Error', 'Please fill in all fields', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Error', 'Passwords do not match', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Error', 'Password must be at least 6 characters', 'error');
      return;
    }

    const result = await this.authManager.signUp(email, password, username);

    if (result.success) {
      await this.showGamePage();
    }
  }

  async handleLogout() {
    await this.authManager.signOut();
    this.gameManager = null;
    this.showHomePage();
  }

  showHomePage() {
    document.getElementById('home-page').classList.add('active');
    document.getElementById('game-page').classList.remove('active');
    document.getElementById('main-nav').classList.add('hidden');
    document.getElementById('user-info').classList.add('hidden');
    document.getElementById('auth-buttons').classList.remove('hidden');
  }

  async showGamePage() {
    const user = this.authManager.getCurrentUser();

    if (!user) return;

    this.gameManager = new GameManager(user.id);
    const profile = await this.gameManager.initialize();

    if (!profile) {
      showToast('Error', 'Failed to load profile', 'error');
      return;
    }

    document.getElementById('home-page').classList.remove('active');
    document.getElementById('game-page').classList.add('active');
    document.getElementById('main-nav').classList.remove('hidden');
    document.getElementById('user-info').classList.remove('hidden');
    document.getElementById('auth-buttons').classList.add('hidden');

    document.getElementById('username-display').textContent = profile.username;

    await this.updateUI();
  }

  async updateUI() {
    const profile = this.gameManager.getProfile();

    document.getElementById('plant-health-value').textContent = `${profile.health}%`;
    document.getElementById('user-level').textContent = `Level ${profile.level}`;
    document.getElementById('user-xp').textContent = `${profile.xp} XP`;

    this.updatePlantVisuals(profile);
    await this.updateActionFeed();
  }

  updatePlantVisuals(profile) {
    const plantVisual = document.getElementById('plant-visual');
    const health = profile.health;

    const scale = 0.5 + (health / 100) * 0.5;
    plantVisual.style.transform = `scale(${scale})`;

    const stageInfo = PLANT_STAGES[profile.plant_stage];
    const color = stageInfo.color;

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect x="95" y="170" width="10" height="20" fill="#795548"/>
        <path d="M100,170 C100,170 120,140 120,110 C120,80 100,70 100,70 C100,70 80,80 80,110 C80,140 100,170 100,170 Z" fill="${color}"/>
        <path d="M100,70 C100,70 110,50 95,30 C80,10 60,20 60,20 C60,20 50,40 65,60 C80,80 100,70 100,70 Z" fill="${color}" opacity="0.8"/>
        <path d="M100,70 C100,70 90,50 105,30 C120,10 140,20 140,20 C140,20 150,40 135,60 C120,80 100,70 100,70 Z" fill="${color}" opacity="0.8"/>
    </svg>
    `;

    plantVisual.innerHTML = svg;
  }

  async updateActionFeed() {
    const user = this.authManager.getCurrentUser();
    const actions = await this.dataService.getUserActions(user.id, 10);

    const actionFeed = document.getElementById('action-feed');

    if (actions.length === 0) {
      actionFeed.innerHTML = '<div class="no-actions">No actions yet. Make some eco-choices!</div>';
      return;
    }

    let html = '';
    actions.forEach(action => {
      const timeAgo = getTimeAgo(action.created_at);
      html += `
        <div class="action-item ${action.is_good ? 'good' : 'bad'}">
          <i class="${action.icon}"></i>
          <div class="action-content">
            <p>${action.text}</p>
            <span class="action-time">${timeAgo}</span>
          </div>
        </div>
      `;
    });

    actionFeed.innerHTML = html;
  }

  renderChoiceButtons() {
    const goodChoicesContainer = document.getElementById('good-choices');
    const badChoicesContainer = document.getElementById('bad-choices');

    let goodHtml = '';
    let badHtml = '';

    GOOD_CHOICES.forEach(choice => {
      goodHtml += `
        <button class="choice-button good" data-id="${choice.id}">
          <i class="${choice.icon}"></i>
          <p>${choice.text}</p>
        </button>
      `;
    });

    BAD_CHOICES.forEach(choice => {
      badHtml += `
        <button class="choice-button bad" data-id="${choice.id}">
          <i class="${choice.icon}"></i>
          <p>${choice.text}</p>
        </button>
      `;
    });

    goodChoicesContainer.innerHTML = goodHtml;
    badChoicesContainer.innerHTML = badHtml;

    goodChoicesContainer.querySelectorAll('.choice-button').forEach(btn => {
      btn.addEventListener('click', () => this.makeChoice(btn.dataset.id, true));
    });

    badChoicesContainer.querySelectorAll('.choice-button').forEach(btn => {
      btn.addEventListener('click', () => this.makeChoice(btn.dataset.id, false));
    });
  }

  async makeChoice(choiceId, isGood) {
    const result = await this.gameManager.makeChoice(choiceId, isGood);

    if (result) {
      await this.updateUI();

      const choiceData = isGood
        ? GOOD_CHOICES.find(c => c.id === choiceId)
        : BAD_CHOICES.find(c => c.id === choiceId);

      if (isGood) {
        this.playGrowAnimation();
        showToast('Good Choice!', `+5% health: ${choiceData.text}`);
      } else {
        this.playWiltAnimation();
        showToast('Bad Choice', `-5% health: ${choiceData.text}`, 'error');
      }
    }
  }

  playGrowAnimation() {
    const plantVisual = document.getElementById('plant-visual');
    plantVisual.classList.add('grow-animation');
    setTimeout(() => plantVisual.classList.remove('grow-animation'), 1000);
  }

  playWiltAnimation() {
    const plantVisual = document.getElementById('plant-visual');
    plantVisual.classList.add('wilt-animation');
    setTimeout(() => plantVisual.classList.remove('wilt-animation'), 1000);
  }

  async updateStatsTab() {
    const profile = this.gameManager.getProfile();
    const totalChoices = profile.good_choices + profile.bad_choices;

    document.getElementById('good-choices-count').textContent = profile.good_choices;
    document.getElementById('bad-choices-count').textContent = profile.bad_choices;

    const goodPercent = totalChoices > 0 ? Math.round((profile.good_choices / totalChoices) * 100) : 0;
    const badPercent = totalChoices > 0 ? Math.round((profile.bad_choices / totalChoices) * 100) : 0;

    document.getElementById('good-choices-percent').textContent = `${goodPercent}% of total`;
    document.getElementById('bad-choices-percent').textContent = `${badPercent}% of total`;
    document.getElementById('eco-score').textContent = `${goodPercent}%`;

    const categoryStats = await this.dataService.getCategoryStats(this.authManager.getCurrentUser().id);

    if (categoryStats) {
      const total = categoryStats.recycling + categoryStats.public_transport + categoryStats.energy_saving;

      const recyclingPercent = total > 0 ? Math.round((categoryStats.recycling / total) * 100) : 0;
      const transportPercent = total > 0 ? Math.round((categoryStats.public_transport / total) * 100) : 0;
      const energyPercent = total > 0 ? Math.round((categoryStats.energy_saving / total) * 100) : 0;

      document.getElementById('recycling-progress').style.width = `${recyclingPercent}%`;
      document.getElementById('transport-progress').style.width = `${transportPercent}%`;
      document.getElementById('energy-progress').style.width = `${energyPercent}%`;

      document.getElementById('recycling-percent').textContent = `${recyclingPercent}%`;
      document.getElementById('transport-percent').textContent = `${transportPercent}%`;
      document.getElementById('energy-percent').textContent = `${energyPercent}%`;
    }

    await this.updateCharts();
  }

  async updateCharts() {
    const dailyStats = await this.dataService.getDailyStats(this.authManager.getCurrentUser().id, 7);

    const labels = dailyStats.map(s => formatDate(s.date));
    const goodData = dailyStats.map(s => s.good_count);
    const badData = dailyStats.map(s => s.bad_count);

    if (!this.charts.choices) {
      const ctx = document.getElementById('choices-chart').getContext('2d');
      this.charts.choices = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Good Choices',
              data: goodData,
              backgroundColor: 'rgba(76, 175, 80, 0.5)',
              borderColor: 'rgba(76, 175, 80, 1)',
              borderWidth: 1
            },
            {
              label: 'Bad Choices',
              data: badData,
              backgroundColor: 'rgba(244, 67, 54, 0.5)',
              borderColor: 'rgba(244, 67, 54, 1)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    } else {
      this.charts.choices.data.labels = labels;
      this.charts.choices.data.datasets[0].data = goodData;
      this.charts.choices.data.datasets[1].data = badData;
      this.charts.choices.update();
    }
  }

  async updateLeaderboardTab() {
    const leaderboard = await this.dataService.getLeaderboard(50);
    const currentUserId = this.authManager.getCurrentUser().id;

    const topUsers = leaderboard.slice(0, 3);
    const otherUsers = leaderboard.slice(3);

    this.renderTopUsers(topUsers, currentUserId);
    this.renderLeaderboardList(otherUsers, currentUserId);
  }

  renderTopUsers(topUsers, currentUserId) {
    const container = document.getElementById('top-users');
    const rankClasses = ['gold', 'silver', 'bronze'];

    let html = '';
    topUsers.forEach((user, index) => {
      const isCurrentUser = user.id === currentUserId;
      html += `
        <div class="top-user ${isCurrentUser ? 'current-user' : ''}">
          <div class="top-user-rank ${rankClasses[index]}">${index + 1}</div>
          <div class="top-user-avatar">
            <i class="ri-user-line"></i>
          </div>
          <div class="top-user-name">${user.username}</div>
          <div class="top-user-health">${user.health}% health</div>
          <div class="top-user-level">Level ${user.level}</div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  renderLeaderboardList(users, currentUserId) {
    const container = document.getElementById('leaderboard-list');

    let html = '';
    users.forEach((user, index) => {
      const rank = index + 4;
      const isCurrentUser = user.id === currentUserId;
      html += `
        <div class="leaderboard-item ${isCurrentUser ? 'current-user' : ''}">
          <div class="user-rank">${rank}</div>
          <div class="user-info">
            <div class="user-avatar">
              <i class="ri-user-line"></i>
            </div>
            <div class="user-name">${user.username}</div>
          </div>
          <div class="user-health">${user.health}%</div>
        </div>
      `;
    });

    container.innerHTML = html || '<div class="no-users">No more users</div>';
  }

  async updateAchievementsTab() {
    const userAchievements = await this.dataService.getUserAchievements(this.authManager.getCurrentUser().id);
    const container = document.getElementById('achievements-list');

    let html = '';
    userAchievements.forEach(ua => {
      const achievement = ua.achievements;
      html += `
        <div class="achievement-item earned">
          <i class="${achievement.icon}"></i>
          <div class="achievement-content">
            <h4>${achievement.title}</h4>
            <p>${achievement.description}</p>
            <span class="achievement-xp">+${achievement.xp_reward} XP</span>
          </div>
        </div>
      `;
    });

    container.innerHTML = html || '<div class="no-achievements">No achievements yet</div>';
  }

  async updateChallengesTab() {
    const userChallenges = await this.dataService.getUserChallenges(this.authManager.getCurrentUser().id);
    const container = document.getElementById('challenges-list');

    let html = '';
    userChallenges.forEach(uc => {
      const challenge = uc.challenges;
      const progress = (uc.progress / challenge.goal) * 100;

      html += `
        <div class="challenge-item ${uc.completed ? 'completed' : ''}">
          <div class="challenge-header">
            <h4>${challenge.title}</h4>
            <span class="challenge-type">${challenge.challenge_type}</span>
          </div>
          <p>${challenge.description}</p>
          <div class="progress-container">
            <div class="progress-bar" style="width: ${progress}%"></div>
          </div>
          <div class="challenge-footer">
            <span>${uc.progress} / ${challenge.goal}</span>
            <span class="challenge-reward">+${challenge.xp_reward} XP</span>
          </div>
        </div>
      `;
    });

    container.innerHTML = html || '<div class="no-challenges">No challenges</div>';
  }

  async updateFriendsTab() {
    const friends = await this.dataService.getFriends(this.authManager.getCurrentUser().id);
    const container = document.getElementById('friends-list');

    let html = '';
    friends.forEach(friendship => {
      const friend = friendship.friend;
      html += `
        <div class="friend-item">
          <div class="friend-avatar">
            <i class="ri-user-line"></i>
          </div>
          <div class="friend-info">
            <div class="friend-name">${friend.username}</div>
            <div class="friend-stats">Level ${friend.level} • ${friend.health}% health</div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html || '<div class="no-friends">No friends yet</div>';
  }
}

const app = new VirtualPlantApp();
document.addEventListener('DOMContentLoaded', () => app.init());
