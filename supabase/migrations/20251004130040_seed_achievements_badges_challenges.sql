/*
  # Seed Data for Achievements, Badges, and Challenges

  Populates the database with predefined achievements, badges, and initial challenges
*/

-- Insert Achievements
INSERT INTO achievements (code, title, description, icon, category, xp_reward, requirement) VALUES
  ('first_choice', 'First Step', 'Make your first eco-friendly choice', 'ri-foot-print-line', 'choices', 10, 1),
  ('eco_warrior_10', 'Eco Warrior', 'Make 10 good choices', 'ri-shield-star-line', 'choices', 50, 10),
  ('eco_champion_50', 'Eco Champion', 'Make 50 good choices', 'ri-award-line', 'choices', 200, 50),
  ('eco_legend_100', 'Eco Legend', 'Make 100 good choices', 'ri-vip-crown-line', 'choices', 500, 100),
  ('eco_master_500', 'Eco Master', 'Make 500 good choices', 'ri-medal-line', 'choices', 2000, 500),
  
  ('streak_3', '3 Day Streak', 'Maintain a 3-day streak', 'ri-fire-line', 'streaks', 30, 3),
  ('streak_7', 'Week Warrior', 'Maintain a 7-day streak', 'ri-flashlight-line', 'streaks', 100, 7),
  ('streak_30', 'Month Master', 'Maintain a 30-day streak', 'ri-calendar-check-line', 'streaks', 500, 30),
  ('streak_100', 'Century Streak', 'Maintain a 100-day streak', 'ri-trophy-line', 'streaks', 2000, 100),
  
  ('perfect_health', 'Perfect Health', 'Reach 100% plant health', 'ri-heart-pulse-fill', 'health', 100, 100),
  ('health_recovery', 'Phoenix Rising', 'Recover from below 20% to above 80%', 'ri-restart-line', 'health', 150, 1),
  ('health_maintainer', 'Steady Gardener', 'Keep health above 70% for 7 days', 'ri-plant-line', 'health', 200, 7),
  
  ('social_butterfly', 'Social Butterfly', 'Add 5 friends', 'ri-group-line', 'social', 100, 5),
  ('challenge_master', 'Challenge Master', 'Complete 10 challenges', 'ri-flag-line', 'social', 300, 10),
  
  ('early_adopter', 'Early Adopter', 'Join in the first week', 'ri-star-line', 'special', 50, 1),
  ('night_owl', 'Night Owl', 'Make a choice after midnight', 'ri-moon-line', 'special', 25, 1),
  ('early_bird', 'Early Bird', 'Make a choice before 6 AM', 'ri-sun-line', 'special', 25, 1),
  ('weekend_warrior', 'Weekend Warrior', 'Make 10 good choices on weekends', 'ri-calendar-event-line', 'special', 75, 10)
ON CONFLICT (code) DO NOTHING;

-- Insert Badges
INSERT INTO badges (code, title, description, icon, color, requirement) VALUES
  ('recycler', 'Recycler Pro', 'Master of recycling', 'ri-recycle-line', '#4CAF50', 'Make 50 recycling choices'),
  ('commuter', 'Green Commuter', 'Public transport expert', 'ri-bus-line', '#2196F3', 'Use public transport 50 times'),
  ('energy_saver', 'Energy Guardian', 'Energy conservation hero', 'ri-lightbulb-flash-line', '#FFC107', 'Save energy 50 times'),
  ('water_warrior', 'Water Warrior', 'Water conservation champion', 'ri-water-flash-line', '#00BCD4', 'Conserve water 50 times'),
  ('sustainable_shopper', 'Sustainable Shopper', 'Eco-shopping expert', 'ri-shopping-bag-line', '#8BC34A', 'Make 50 sustainable purchases'),
  
  ('level_5', 'Novice Gardener', 'Reached level 5', 'ri-seedling-line', '#4CAF50', 'Reach level 5'),
  ('level_10', 'Skilled Gardener', 'Reached level 10', 'ri-plant-line', '#4CAF50', 'Reach level 10'),
  ('level_25', 'Master Gardener', 'Reached level 25', 'ri-leaf-line', '#4CAF50', 'Reach level 25'),
  ('level_50', 'Legendary Gardener', 'Reached level 50', 'ri-flower-line', '#FFD700', 'Reach level 50'),
  
  ('streak_veteran', 'Streak Veteran', 'Maintained longest streak', 'ri-fire-fill', '#FF5722', 'Achieve 30+ day streak'),
  ('perfectionist', 'Perfectionist', 'All challenges completed', 'ri-checkbox-circle-line', '#9C27B0', 'Complete all available challenges'),
  ('social_leader', 'Community Leader', 'Most friends added', 'ri-team-line', '#E91E63', 'Add 20+ friends'),
  
  ('ancient_tree', 'Ancient Tree', 'Evolved plant to ancient stage', 'ri-ancient-pavilion-line', '#795548', 'Reach ancient plant stage'),
  ('xp_master', 'XP Master', 'Earned massive XP', 'ri-medal-2-line', '#FF9800', 'Earn 10,000 total XP')
ON CONFLICT (code) DO NOTHING;

-- Insert Active Challenges
INSERT INTO challenges (title, description, challenge_type, goal, xp_reward, start_date, end_date, is_active) VALUES
  ('Daily Green Challenge', 'Make 5 good eco-choices today', 'daily', 5, 50, now(), now() + interval '1 day', true),
  ('Weekly Eco Warrior', 'Make 25 good choices this week', 'weekly', 25, 200, now(), now() + interval '7 days', true),
  ('Monthly Champion', 'Make 100 good choices this month', 'monthly', 100, 1000, now(), now() + interval '30 days', true),
  ('Zero Waste Week', 'Make only recycling and sustainable shopping choices for a week', 'weekly', 20, 300, now(), now() + interval '7 days', true),
  ('Transport Hero', 'Use public transport or bike 15 times this week', 'weekly', 15, 250, now(), now() + interval '7 days', true)
ON CONFLICT DO NOTHING;
