// Global variables
let currentUser = null;
let currentTab = 'plant';
let chartsInitialized = false;
let choicesChart = null;
let predictionChart = null;
let correlationChart = null;

// Good eco-friendly choices
const GOOD_CHOICES = [
    { id: 'recycle', text: 'Recycle paper and plastics', icon: 'ri-recycle-line' },
    { id: 'publictransport', text: 'Use public transportation', icon: 'ri-bus-line' },
    { id: 'lightoff', text: 'Turn off lights when leaving', icon: 'ri-lightbulb-flash-line' },
    { id: 'reusablebag', text: 'Use reusable shopping bags', icon: 'ri-shopping-bag-line' },
    { id: 'waterbottle', text: 'Use a reusable water bottle', icon: 'ri-water-flash-line' },
    { id: 'localfood', text: 'Buy local produce', icon: 'ri-store-2-line' },
    { id: 'digitalreceipts', text: 'Choose digital receipts', icon: 'ri-file-list-3-line' },
    { id: 'walkbike', text: 'Walk or bike for short trips', icon: 'ri-bike-line' }
];

// Bad eco-unfriendly choices
const BAD_CHOICES = [
    { id: 'plasticbag', text: 'Use single-use plastic bags', icon: 'ri-bank-card-line' },
    { id: 'bottledwater', text: 'Buy disposable water bottles', icon: 'ri-water-flash-line' },
    { id: 'foodwaste', text: 'Waste food', icon: 'ri-restaurant-line' },
    { id: 'longshower', text: 'Take extra long showers', icon: 'ri-shower-line' },
    { id: 'driveshort', text: 'Drive for very short trips', icon: 'ri-car-line' },
    { id: 'lighton', text: 'Leave lights on unnecessarily', icon: 'ri-lightbulb-line' },
    { id: 'standby', text: 'Leave electronics on standby', icon: 'ri-tv-line' },
    { id: 'excesspackaging', text: 'Buy items with excess packaging', icon: 'ri-archive-line' }
];

// Initialize the application
function init() {
    document.getElementById('current-year').textContent = new Date().getFullYear();
    addEventListeners();
    checkLoggedInUser();
    renderChoiceButtons();
}

// Set up event listeners
function addEventListeners() {
    // Auth tab switching
    document.getElementById('login-tab-btn').addEventListener('click', () => switchAuthTab('login'));
    document.getElementById('signup-tab-btn').addEventListener('click', () => switchAuthTab('signup'));
    document.getElementById('login-tab').addEventListener('click', () => switchAuthTab('login'));
    document.getElementById('signup-tab').addEventListener('click', () => switchAuthTab('signup'));

    // Main navigation tabs
    document.getElementById('plant-tab-btn').addEventListener('click', () => switchTab('plant'));
    document.getElementById('stats-tab-btn').addEventListener('click', () => switchTab('stats'));
    document.getElementById('leaderboard-tab-btn').addEventListener('click', () => switchTab('leaderboard'));

    // Auth forms submission
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('signup-form').addEventListener('submit', handleSignup);
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
}

// Check if user is already logged in
function checkLoggedInUser() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        try {
            currentUser = JSON.parse(storedUser);
            showGamePage();
        } catch (error) {
            console.error('Error parsing stored user:', error);
            localStorage.removeItem('currentUser');
            showHomePage();
        }
    } else {
        showHomePage();
    }
}

// Switch between tabs
function switchTab(tab) {
    currentTab = tab;
    
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${tab}-tab-btn`).classList.add('active');
    
    // Update content tabs
    document.querySelectorAll('.tab').forEach(tabContent => tabContent.classList.remove('active'));
    document.getElementById(`${tab}-tab`).classList.add('active');
    
    // Initialize charts if needed and if on stats tab
    if (tab === 'stats' && !chartsInitialized && currentUser) {
        initializeCharts();
        updateStatsTab();
        chartsInitialized = true;
    }
    
    // Update leaderboard if on leaderboard tab
    if (tab === 'leaderboard') {
        updateLeaderboardTab();
    }
}

// Switch between login and signup forms
function switchAuthTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.auth-tab').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${tab}-tab`).classList.add('active');
    
    document.querySelectorAll('.auth-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${tab}-tab-btn`).classList.add('active');
    
    // Update form visibility
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    document.getElementById(`${tab}-form`).classList.add('active');
}

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (!username || !password) {
        showToast('Error', 'Please enter both username and password', 'error');
        return;
    }
    
    // Check if user exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showGamePage();
        showToast('Success', 'Logged in successfully!');
    } else {
        showToast('Error', 'Invalid username or password', 'error');
    }
}

// Handle signup form submission
function handleSignup(e) {
    e.preventDefault();
    
    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (!username || !password || !confirmPassword) {
        showToast('Error', 'Please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showToast('Error', 'Passwords do not match', 'error');
        return;
    }
    
    // Check if username already exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.some(u => u.username === username)) {
        showToast('Error', 'Username already taken', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        username,
        password,
        data: {
            health: 50,
            goodChoices: 0,
            badChoices: 0,
            actions: [],
            dailyStats: {},
            topActions: {
                recycling: 0,
                publicTransport: 0,
                energySaving: 0
            },
            createdAt: new Date().toISOString()
        }
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    showGamePage();
    showToast('Success', 'Account created successfully!');
}

// Handle logout
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showHomePage();
    chartsInitialized = false;
}

// Show home page with auth forms
function showHomePage() {
    document.getElementById('home-page').classList.add('active');
    document.getElementById('game-page').classList.remove('active');
    document.getElementById('main-nav').classList.add('hidden');
    document.getElementById('user-info').classList.add('hidden');
    document.getElementById('auth-buttons').classList.remove('hidden');
}

// Show game page with plants and statistics
function showGamePage() {
    document.getElementById('home-page').classList.remove('active');
    document.getElementById('game-page').classList.add('active');
    document.getElementById('main-nav').classList.remove('hidden');
    document.getElementById('user-info').classList.remove('hidden');
    document.getElementById('auth-buttons').classList.add('hidden');
    
    // Update username display
    document.getElementById('username-display').textContent = currentUser.username;
    
    // Update UI based on current user data
    updateUI();
}

// Update the user interface based on current user data
function updateUI() {
    // Update plant health
    document.getElementById('plant-health-value').textContent = `${currentUser.data.health}%`;
    
    // Update plant visuals based on health
    updatePlantVisuals();
    
    // Update action feed
    updateActionFeed();
    
    // Update stats tab if already initialized
    if (chartsInitialized) {
        updateStatsTab();
    }
}

// Update the plant visualization based on health
function updatePlantVisuals() {
    const plantVisual = document.getElementById('plant-visual');
    const health = currentUser.data.health;
    
    // Adjust plant size based on health
    const scale = 0.5 + (health / 100) * 0.5;
    plantVisual.style.transform = `scale(${scale})`;
    
    // Adjust plant color based on health
    let greenHue;
    if (health >= 70) {
        greenHue = 120; // Healthy green
    } else if (health >= 40) {
        greenHue = 90; // Yellowish green
    } else {
        greenHue = 60; // Yellow
    }
    
    const healthySvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect x="95" y="170" width="10" height="20" fill="#795548"/>
        <path d="M100,170 C100,170 120,140 120,110 C120,80 100,70 100,70 C100,70 80,80 80,110 C80,140 100,170 100,170 Z" fill="hsl(${greenHue}, 50%, 50%)"/>
        <path d="M100,70 C100,70 110,50 95,30 C80,10 60,20 60,20 C60,20 50,40 65,60 C80,80 100,70 100,70 Z" fill="hsl(${greenHue}, 50%, 60%)"/>
        <path d="M100,70 C100,70 90,50 105,30 C120,10 140,20 140,20 C140,20 150,40 135,60 C120,80 100,70 100,70 Z" fill="hsl(${greenHue}, 50%, 60%)"/>
    </svg>
    `;
    
    plantVisual.innerHTML = healthySvg;
}

// Update the action feed with recent actions
function updateActionFeed() {
    const actionFeed = document.getElementById('action-feed');
    const actions = currentUser.data.actions || [];
    
    if (actions.length === 0) {
        actionFeed.innerHTML = '<div class="no-actions">No actions yet. Make some eco-choices!</div>';
        return;
    }
    
    // Sort actions by timestamp (most recent first)
    const sortedActions = [...actions].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    let html = '';
    sortedActions.slice(0, 10).forEach(action => {
        const timeAgo = getTimeAgo(new Date(action.timestamp));
        html += `
            <div class="action-item ${action.isGood ? 'good' : 'bad'}">
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

// Make a good eco-friendly choice
function makeGoodChoice(choice) {
    // Find the chosen choice from GOOD_CHOICES array
    const chosenChoice = GOOD_CHOICES.find(c => c.id === choice);
    if (!chosenChoice) return;
    
    // Create action
    const action = {
        text: chosenChoice.text,
        icon: chosenChoice.icon,
        impact: 5, // Each good choice increases health by 5%
        isGood: true,
        timestamp: new Date().toISOString()
    };
    
    // Update user data
    currentUser.data.actions.push(action);
    currentUser.data.goodChoices++;
    
    // Update health (max 100%)
    currentUser.data.health = Math.min(100, currentUser.data.health + action.impact);
    
    // Update top actions stats
    if (chosenChoice.id === 'recycle' || chosenChoice.id === 'digitalreceipts') {
        currentUser.data.topActions.recycling++;
    } else if (chosenChoice.id === 'publictransport' || chosenChoice.id === 'walkbike') {
        currentUser.data.topActions.publicTransport++;
    } else if (chosenChoice.id === 'lightoff') {
        currentUser.data.topActions.energySaving++;
    }
    
    // Update daily stats
    const today = new Date().toISOString().split('T')[0];
    if (!currentUser.data.dailyStats[today]) {
        currentUser.data.dailyStats[today] = { good: 0, bad: 0 };
    }
    currentUser.data.dailyStats[today].good++;
    
    // Save updated user data
    saveUserData();
    
    // Update UI
    updateUI();
    
    // Play grow animation
    playGrowAnimation();
    
    // Show toast message
    showToast('Good Choice!', `+5% health: ${chosenChoice.text}`);
}

// Make a bad eco-unfriendly choice
function makeBadChoice(choice) {
    // Find the chosen choice from BAD_CHOICES array
    const chosenChoice = BAD_CHOICES.find(c => c.id === choice);
    if (!chosenChoice) return;
    
    // Create action
    const action = {
        text: chosenChoice.text,
        icon: chosenChoice.icon,
        impact: -5, // Each bad choice decreases health by 5%
        isGood: false,
        timestamp: new Date().toISOString()
    };
    
    // Update user data
    currentUser.data.actions.push(action);
    currentUser.data.badChoices++;
    
    // Update health (min 0%)
    currentUser.data.health = Math.max(0, currentUser.data.health + action.impact);
    
    // Update daily stats
    const today = new Date().toISOString().split('T')[0];
    if (!currentUser.data.dailyStats[today]) {
        currentUser.data.dailyStats[today] = { good: 0, bad: 0 };
    }
    currentUser.data.dailyStats[today].bad++;
    
    // Save updated user data
    saveUserData();
    
    // Update UI
    updateUI();
    
    // Play wilt animation
    playWiltAnimation();
    
    // Show toast message
    showToast('Bad Choice', `-5% health: ${chosenChoice.text}`, 'error');
}

// Play plant growth animation
function playGrowAnimation() {
    const plantVisual = document.getElementById('plant-visual');
    
    // Add grow animation class
    plantVisual.classList.add('grow-animation');
    
    // Remove class after animation completes
    setTimeout(() => {
        plantVisual.classList.remove('grow-animation');
    }, 1000);
}

// Play plant wilting animation
function playWiltAnimation() {
    const plantVisual = document.getElementById('plant-visual');
    
    // Add wilt animation class
    plantVisual.classList.add('wilt-animation');
    
    // Remove class after animation completes
    setTimeout(() => {
        plantVisual.classList.remove('wilt-animation');
    }, 1000);
}

// Render eco-choice buttons
function renderChoiceButtons() {
    const goodChoicesContainer = document.getElementById('good-choices');
    const badChoicesContainer = document.getElementById('bad-choices');
    
    let goodHtml = '';
    let badHtml = '';
    
    // Render good choices
    GOOD_CHOICES.forEach(choice => {
        goodHtml += `
            <button class="choice-button good" data-id="${choice.id}" onclick="makeGoodChoice('${choice.id}')">
                <i class="${choice.icon}"></i>
                <p>${choice.text}</p>
            </button>
        `;
    });
    
    // Render bad choices
    BAD_CHOICES.forEach(choice => {
        badHtml += `
            <button class="choice-button bad" data-id="${choice.id}" onclick="makeBadChoice('${choice.id}')">
                <i class="${choice.icon}"></i>
                <p>${choice.text}</p>
            </button>
        `;
    });
    
    goodChoicesContainer.innerHTML = goodHtml;
    badChoicesContainer.innerHTML = badHtml;
}

// Initialize charts for statistics page
function initializeCharts() {
    // Daily choices chart
    const choicesChartCtx = document.getElementById('choices-chart').getContext('2d');
    choicesChart = new Chart(choicesChartCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Good Choices',
                    data: [],
                    backgroundColor: 'rgba(76, 175, 80, 0.5)',
                    borderColor: 'rgba(76, 175, 80, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Bad Choices',
                    data: [],
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
                x: {
                    stacked: false,
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Choices'
                    }
                }
            }
        }
    });
    
    // Prediction chart
    const predictionChartCtx = document.getElementById('prediction-chart').getContext('2d');
    predictionChart = new Chart(predictionChartCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Plant Health',
                data: [],
                fill: true,
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                borderColor: 'rgba(76, 175, 80, 1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Health %'
                    }
                }
            }
        }
    });
    
    // Correlation chart
    const correlationChartCtx = document.getElementById('correlation-chart').getContext('2d');
    correlationChart = new Chart(correlationChartCtx, {
        type: 'radar',
        data: {
            labels: ['CO2 Reduction', 'Energy Saved', 'Waste Reduced', 'Water Saved', 'Health Impact'],
            datasets: [{
                label: 'Environmental Impact',
                data: [0, 0, 0, 0, 0],
                fill: true,
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                borderColor: 'rgba(76, 175, 80, 1)',
                pointBackgroundColor: 'rgba(76, 175, 80, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(76, 175, 80, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            }
        }
    });
}

// Update statistics tab
function updateStatsTab() {
    // Update summary stats
    const goodChoices = currentUser.data.goodChoices;
    const badChoices = currentUser.data.badChoices;
    const totalChoices = goodChoices + badChoices;
    
    document.getElementById('good-choices-count').textContent = goodChoices;
    document.getElementById('bad-choices-count').textContent = badChoices;
    
    const goodPercent = totalChoices > 0 ? Math.round((goodChoices / totalChoices) * 100) : 0;
    const badPercent = totalChoices > 0 ? Math.round((badChoices / totalChoices) * 100) : 0;
    
    document.getElementById('good-choices-percent').textContent = `${goodPercent}% of total choices`;
    document.getElementById('bad-choices-percent').textContent = `${badPercent}% of total choices`;
    document.getElementById('eco-score').textContent = `${goodPercent}%`;
    
    // Update top actions progress bars
    const recycling = currentUser.data.topActions.recycling || 0;
    const transport = currentUser.data.topActions.publicTransport || 0;
    const energy = currentUser.data.topActions.energySaving || 0;
    const totalActions = recycling + transport + energy;
    
    const recyclingPercent = totalActions > 0 ? Math.round((recycling / totalActions) * 100) : 0;
    const transportPercent = totalActions > 0 ? Math.round((transport / totalActions) * 100) : 0;
    const energyPercent = totalActions > 0 ? Math.round((energy / totalActions) * 100) : 0;
    
    document.getElementById('recycling-progress').style.width = `${recyclingPercent}%`;
    document.getElementById('transport-progress').style.width = `${transportPercent}%`;
    document.getElementById('energy-progress').style.width = `${energyPercent}%`;
    
    document.getElementById('recycling-percent').textContent = `${recyclingPercent}%`;
    document.getElementById('transport-percent').textContent = `${transportPercent}%`;
    document.getElementById('energy-percent').textContent = `${energyPercent}%`;
    
    // Update charts
    updateChoicesChart(currentUser.data.dailyStats);
    updatePredictionChart();
    updateCorrelationChart();
    
    // Generate data science components
    generateInsights();
    generateRecommendations();
}

// Update choices chart with daily stats
function updateChoicesChart(dailyStats) {
    // Convert dailyStats object to arrays for chart
    const dates = Object.keys(dailyStats).sort();
    
    // Only show the last 7 days if there are more than 7 days of data
    const recentDates = dates.length > 7 ? dates.slice(-7) : dates;
    
    const goodData = recentDates.map(date => dailyStats[date].good || 0);
    const badData = recentDates.map(date => dailyStats[date].bad || 0);
    
    // Format dates to be more readable
    const formattedDates = recentDates.map(date => {
        const [year, month, day] = date.split('-');
        return `${month}/${day}`;
    });
    
    // Update chart data
    choicesChart.data.labels = formattedDates;
    choicesChart.data.datasets[0].data = goodData;
    choicesChart.data.datasets[1].data = badData;
    choicesChart.update();
}

// Update prediction chart
function updatePredictionChart() {
    // Current health
    const currentHealth = currentUser.data.health;
    
    // Calculate trend based on recent choices
    const actions = currentUser.data.actions || [];
    const recentActions = actions.slice(-10); // Last 10 actions
    
    let trend = 0;
    if (recentActions.length > 0) {
        const goodCount = recentActions.filter(a => a.isGood).length;
        const badCount = recentActions.filter(a => !a.isGood).length;
        if (goodCount > badCount) {
            trend = 5; // Positive trend: +5% per day
        } else if (badCount > goodCount) {
            trend = -5; // Negative trend: -5% per day
        }
    }
    
    // Generate prediction for next 7 days
    const days = ['Today'];
    for (let i = 1; i <= 6; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        days.push(`Day ${i}`);
    }
    
    const healthPrediction = [currentHealth];
    for (let i = 1; i <= 6; i++) {
        // Calculate predicted health (clamped between 0-100)
        const predicted = Math.max(0, Math.min(100, healthPrediction[i-1] + trend));
        healthPrediction.push(predicted);
    }
    
    // Update chart
    predictionChart.data.labels = days;
    predictionChart.data.datasets[0].data = healthPrediction;
    predictionChart.update();
    
    // Update prediction text
    const trendText = document.getElementById('prediction-trend');
    if (trend > 0) {
        trendText.textContent = 'improve significantly';
        trendText.style.color = 'var(--primary-color)';
    } else if (trend < 0) {
        trendText.textContent = 'decline';
        trendText.style.color = 'var(--danger-color)';
    } else {
        trendText.textContent = 'stay stable';
        trendText.style.color = '';
    }
}

// Update correlation chart
function updateCorrelationChart() {
    // Calculate environmental impact scores based on user's choices
    const goodChoices = currentUser.data.goodChoices;
    const totalChoices = goodChoices + currentUser.data.badChoices;
    const ratio = totalChoices > 0 ? goodChoices / totalChoices : 0;
    
    // Calculate impact scores (simulated data science model)
    const co2Reduction = Math.round(ratio * 100 * 0.8); // 80% efficiency
    const energySaved = Math.round(ratio * 100 * 0.7); // 70% efficiency
    const wasteReduced = Math.round(ratio * 100 * 0.9); // 90% efficiency
    const waterSaved = Math.round(ratio * 100 * 0.6); // 60% efficiency
    const healthImpact = Math.round(ratio * 100 * 0.5); // 50% efficiency
    
    // Update chart
    correlationChart.data.datasets[0].data = [
        co2Reduction,
        energySaved,
        wasteReduced,
        waterSaved,
        healthImpact
    ];
    correlationChart.update();
}

// Generate AI insights based on user data
function generateInsights() {
    const insightsContainer = document.getElementById('insights-container');
    const goodChoices = currentUser.data.goodChoices;
    const badChoices = currentUser.data.badChoices;
    const totalChoices = goodChoices + badChoices;
    const ratio = totalChoices > 0 ? goodChoices / totalChoices : 0;
    
    // Get recent trends
    const dailyStats = currentUser.data.dailyStats;
    const dates = Object.keys(dailyStats).sort();
    
    // Only analyze if there are enough data points
    if (dates.length < 2) {
        insightsContainer.innerHTML = `
            <div class="insight">
                <i class="ri-information-line"></i>
                <p>Make more eco-choices to generate personalized insights about your environmental impact.</p>
            </div>
        `;
        return;
    }
    
    // Calculate recent vs older trends
    const recentDates = dates.slice(-3); // Last 3 days
    const olderDates = dates.slice(-6, -3); // 3 days before that
    
    const recentGoodChoices = recentDates.reduce((sum, date) => sum + (dailyStats[date].good || 0), 0);
    const recentBadChoices = recentDates.reduce((sum, date) => sum + (dailyStats[date].bad || 0), 0);
    
    const olderGoodChoices = olderDates.reduce((sum, date) => sum + (dailyStats[date].good || 0), 0);
    const olderBadChoices = olderDates.reduce((sum, date) => sum + (dailyStats[date].bad || 0), 0);
    
    const recentRatio = (recentGoodChoices + recentBadChoices) > 0 
        ? recentGoodChoices / (recentGoodChoices + recentBadChoices) 
        : 0;
    
    const olderRatio = (olderGoodChoices + olderBadChoices) > 0 
        ? olderGoodChoices / (olderGoodChoices + olderBadChoices) 
        : 0;
    
    // Data science insights
    let insights = [];
    
    // Overall performance
    if (ratio > 0.8) {
        insights.push('Your eco-choices are excellent! You\'re in the top 20% of environmentally conscious users.');
    } else if (ratio > 0.6) {
        insights.push('You\'re making good eco-choices. Your plant is thriving due to your positive actions.');
    } else if (ratio > 0.4) {
        insights.push('Your eco-choices are balanced, but your plant would benefit from more positive actions.');
    } else {
        insights.push('Your plant is struggling due to too many harmful choices. Try focusing on eco-friendly actions.');
    }
    
    // Trend insights
    if (recentRatio > olderRatio + 0.1) {
        insights.push('Your recent choices show significant improvement! Keep up this positive trend for better plant health.');
    } else if (recentRatio < olderRatio - 0.1) {
        insights.push('Your recent choices show a decline in eco-friendly actions. Try to get back on track with more positive choices.');
    }
    
    // CO2 impact 
    const estimatedCO2Saved = (goodChoices * 0.5).toFixed(1); // Simplified model: 0.5kg CO2 per good choice
    insights.push(`Based on our model, your eco-friendly choices have prevented approximately ${estimatedCO2Saved}kg of CO2 emissions.`);
    
    // Generate HTML
    let insightsHtml = '';
    insights.forEach(insight => {
        insightsHtml += `
            <div class="insight">
                <i class="ri-lightbulb-line"></i>
                <p>${insight}</p>
            </div>
        `;
    });
    
    insightsContainer.innerHTML = insightsHtml;
}

// Generate personalized recommendations
function generateRecommendations() {
    const recommendationsContainer = document.getElementById('recommendations-container');
    
    // Analyze user behavior
    const actions = currentUser.data.actions || [];
    const goodActions = actions.filter(a => a.isGood);
    const badActions = actions.filter(a => !a.isGood);
    
    // Count occurrences of each type of good and bad action
    const goodActionTypes = {};
    GOOD_CHOICES.forEach(choice => {
        goodActionTypes[choice.id] = 0;
    });
    
    goodActions.forEach(action => {
        const choiceId = GOOD_CHOICES.find(c => c.text === action.text)?.id;
        if (choiceId) {
            goodActionTypes[choiceId]++;
        }
    });
    
    const badActionTypes = {};
    BAD_CHOICES.forEach(choice => {
        badActionTypes[choice.id] = 0;
    });
    
    badActions.forEach(action => {
        const choiceId = BAD_CHOICES.find(c => c.text === action.text)?.id;
        if (choiceId) {
            badActionTypes[choiceId]++;
        }
    });
    
    // Find least common good actions to recommend
    const sortedGoodActions = Object.entries(goodActionTypes)
        .sort(([, countA], [, countB]) => countA - countB);
    
    // Find most common bad actions to reduce
    const sortedBadActions = Object.entries(badActionTypes)
        .sort(([, countA], [, countB]) => countB - countA);
    
    // Generate recommendations
    let recommendations = [];
    
    // Recommend good actions that are underutilized
    if (sortedGoodActions.length > 0) {
        const [leastUsedGoodId] = sortedGoodActions[0];
        const leastUsedGood = GOOD_CHOICES.find(c => c.id === leastUsedGoodId);
        if (leastUsedGood) {
            recommendations.push(`Try to increase your "${leastUsedGood.text}" action, which you haven't chosen often.`);
        }
    }
    
    // Recommend reducing most common bad actions
    if (sortedBadActions.length > 0 && sortedBadActions[0][1] > 0) {
        const [mostUsedBadId] = sortedBadActions[0];
        const mostUsedBad = BAD_CHOICES.find(c => c.id === mostUsedBadId);
        if (mostUsedBad) {
            recommendations.push(`Consider reducing your "${mostUsedBad.text}" action, which negatively impacts your plant's health.`);
        }
    }
    
    // Add general recommendations
    if (currentUser.data.health < 30) {
        recommendations.push('Your plant health is critical. Focus on making several consecutive good choices to recover.');
    } else if (currentUser.data.health < 60) {
        recommendations.push('Your plant needs more care. Try to maintain a 2:1 ratio of good to bad choices to improve health.');
    }
    
    // Add data-driven tips
    if (currentUser.data.topActions.recycling < currentUser.data.topActions.publicTransport && 
        currentUser.data.topActions.recycling < currentUser.data.topActions.energySaving) {
        recommendations.push('You could improve your impact by focusing more on recycling and reducing waste.');
    } else if (currentUser.data.topActions.publicTransport < currentUser.data.topActions.recycling && 
               currentUser.data.topActions.publicTransport < currentUser.data.topActions.energySaving) {
        recommendations.push('Consider using public transportation or walking/biking more often to reduce your carbon footprint.');
    } else if (currentUser.data.topActions.energySaving < currentUser.data.topActions.recycling && 
               currentUser.data.topActions.energySaving < currentUser.data.topActions.publicTransport) {
        recommendations.push('You could save more energy by turning off lights and electronics when not in use.');
    }
    
    // If not enough recommendations, add a general one
    if (recommendations.length < 3) {
        recommendations.push('Creating a daily eco-friendly routine will help stabilize and improve your plant\ health');
    }
    
    // Generate HTML
    let recommendationsHtml = '';
    recommendations.forEach(recommendation => {
        recommendationsHtml += `
            <div class="recommendation">
                <i class="ri-thumb-up-line"></i>
                <p>${recommendation}</p>
            </div>
        `;
    });
    
    recommendationsContainer.innerHTML = recommendationsHtml;
}

// Update leaderboard tab
function updateLeaderboardTab() {
    const users = getAllUsers();
    
    // Sort users by plant health (descending)
    const sortedUsers = [...users].sort((a, b) => b.data.health - a.data.health);
    
    // Find current user's rank
    const currentUserRank = sortedUsers.findIndex(u => u.username === currentUser.username) + 1;
    
    // Get top 3 users for special display
    const topUsers = sortedUsers.slice(0, 3);
    
    // Get other users (excluding top 3)
    const otherUsers = sortedUsers.slice(3);
    
    updateTopUsers(topUsers, currentUserRank);
    updateLeaderboardList(otherUsers, currentUserRank);
}

// Update top users display on leaderboard
function updateTopUsers(topUsers, currentUserRank) {
    const topUsersContainer = document.getElementById('top-users');
    
    if (topUsers.length === 0) {
        topUsersContainer.innerHTML = '<p>No users on the leaderboard yet.</p>';
        return;
    }
    
    let html = '';
    
    // Class names for ranking colors
    const rankClasses = ['gold', 'silver', 'bronze'];
    
    topUsers.forEach((user, index) => {
        const rank = index + 1;
        const isCurrentUser = user.username === currentUser.username;
        
        html += `
            <div class="top-user ${isCurrentUser ? 'current-user' : ''}">
                <div class="top-user-rank ${rankClasses[index]}">${rank}</div>
                <div class="top-user-avatar">
                    <i class="ri-user-line"></i>
                </div>
                <div class="top-user-name">${user.username}</div>
                <div class="top-user-health">${user.data.health}% health</div>
            </div>
        `;
    });
    
    topUsersContainer.innerHTML = html;
}

// Update the leaderboard list
function updateLeaderboardList(otherUsers, currentUserRank) {
    const leaderboardList = document.getElementById('leaderboard-list');
    
    if (otherUsers.length === 0 && currentUserRank > 3) {
        leaderboardList.innerHTML = '<div class="no-users">No other users on the leaderboard.</div>';
        return;
    }
    
    let html = '';
    
    otherUsers.forEach((user, index) => {
        const rank = index + 4; // Starting at 4 since top 3 are displayed separately
        const isCurrentUser = user.username === currentUser.username;
        
        html += `
            <div class="leaderboard-item ${isCurrentUser ? 'current-user' : ''}">
                <div class="user-rank">${rank}</div>
                <div class="user-info">
                    <div class="user-avatar">
                        <i class="ri-user-line"></i>
                    </div>
                    <div class="user-name">${user.username}</div>
                </div>
                <div class="user-health">${user.data.health}%</div>
            </div>
        `;
    });
    
    leaderboardList.innerHTML = html;
}

// Get all users from localStorage
function getAllUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
}

// Save current user data to localStorage
function saveUserData() {
    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.username === currentUser.username);
    
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
}

// Format date to time ago string
function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) {
        return 'just now';
    } else if (diffMin < 60) {
        return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else if (diffHour < 24) {
        return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else {
        return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    }
}

// Show toast message
function showToast(title, message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    toast.innerHTML = `
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <p class="toast-message">${message}</p>
        </div>
        <button class="toast-close">&times;</button>
    `;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Add event listener to close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.remove();
    });
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 3000);
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);