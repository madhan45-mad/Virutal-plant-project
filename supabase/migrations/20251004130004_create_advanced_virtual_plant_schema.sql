/*
  # Advanced Virtual Plant Project Database Schema

  ## Overview
  Complete database schema with advanced features including achievements, badges,
  social features, challenges, plant evolution, and comprehensive analytics.

  ## New Tables

  ### 1. profiles
  Extended user profile with avatar and bio
  - `id` (uuid, primary key) - References auth.users
  - `username` (text, unique) - Display name
  - `email` (text) - User email
  - `avatar_url` (text) - Profile picture URL
  - `bio` (text) - User biography
  - `health` (integer) - Plant health (0-100)
  - `level` (integer) - User level
  - `xp` (integer) - Experience points
  - `total_xp` (integer) - Lifetime XP earned
  - `streak_days` (integer) - Current daily streak
  - `longest_streak` (integer) - Longest streak achieved
  - `good_choices` (integer) - Total good choices
  - `bad_choices` (integer) - Total bad choices
  - `plant_stage` (text) - seedling, sprout, sapling, tree, ancient
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  - `last_action_date` (date) - For streak tracking

  ### 2. actions
  User choice history
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `choice_id` (text) - ID of the choice made
  - `text` (text) - Action description
  - `icon` (text) - Icon class
  - `impact` (integer) - Health change
  - `xp_earned` (integer) - XP gained
  - `is_good` (boolean)
  - `created_at` (timestamptz)

  ### 3. achievements
  Predefined achievements
  - `id` (uuid, primary key)
  - `code` (text, unique) - Achievement identifier
  - `title` (text) - Achievement name
  - `description` (text)
  - `icon` (text) - Icon class
  - `category` (text) - choices, streaks, health, social, special
  - `xp_reward` (integer)
  - `requirement` (integer) - Numeric requirement
  - `created_at` (timestamptz)

  ### 4. user_achievements
  Tracks earned achievements
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `achievement_id` (uuid, foreign key)
  - `earned_at` (timestamptz)

  ### 5. badges
  Visual badges users can earn
  - `id` (uuid, primary key)
  - `code` (text, unique)
  - `title` (text)
  - `description` (text)
  - `icon` (text)
  - `color` (text) - Badge color
  - `requirement` (text) - How to earn
  - `created_at` (timestamptz)

  ### 6. user_badges
  Tracks earned badges
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `badge_id` (uuid, foreign key)
  - `earned_at` (timestamptz)

  ### 7. challenges
  Time-limited challenges
  - `id` (uuid, primary key)
  - `title` (text)
  - `description` (text)
  - `challenge_type` (text) - daily, weekly, monthly, special
  - `goal` (integer) - Target to reach
  - `xp_reward` (integer)
  - `start_date` (timestamptz)
  - `end_date` (timestamptz)
  - `is_active` (boolean)
  - `created_at` (timestamptz)

  ### 8. user_challenges
  Tracks user progress on challenges
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `challenge_id` (uuid, foreign key)
  - `progress` (integer)
  - `completed` (boolean)
  - `completed_at` (timestamptz)
  - `created_at` (timestamptz)

  ### 9. friendships
  User connections
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `friend_id` (uuid, foreign key)
  - `status` (text) - pending, accepted, blocked
  - `created_at` (timestamptz)

  ### 10. daily_stats
  Daily aggregated statistics
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `date` (date)
  - `good_count` (integer)
  - `bad_count` (integer)
  - `xp_earned` (integer)
  - `health_start` (integer)
  - `health_end` (integer)

  ### 11. category_stats
  Tracks performance by action category
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `recycling` (integer)
  - `public_transport` (integer)
  - `energy_saving` (integer)
  - `water_conservation` (integer)
  - `sustainable_shopping` (integer)
  - `updated_at` (timestamptz)

  ### 12. notifications
  User notifications
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `type` (text) - achievement, badge, friend, challenge, streak
  - `title` (text)
  - `message` (text)
  - `read` (boolean)
  - `created_at` (timestamptz)

  ## Security
  All tables have RLS enabled with appropriate policies
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text,
  avatar_url text,
  bio text,
  health integer DEFAULT 50 CHECK (health >= 0 AND health <= 100),
  level integer DEFAULT 1 CHECK (level >= 1),
  xp integer DEFAULT 0,
  total_xp integer DEFAULT 0,
  streak_days integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  good_choices integer DEFAULT 0,
  bad_choices integer DEFAULT 0,
  plant_stage text DEFAULT 'seedling' CHECK (plant_stage IN ('seedling', 'sprout', 'sapling', 'tree', 'ancient')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_action_date date
);

-- Actions table
CREATE TABLE IF NOT EXISTS actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  choice_id text NOT NULL,
  text text NOT NULL,
  icon text NOT NULL,
  impact integer NOT NULL,
  xp_earned integer DEFAULT 0,
  is_good boolean NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  category text NOT NULL CHECK (category IN ('choices', 'streaks', 'health', 'social', 'special')),
  xp_reward integer DEFAULT 0,
  requirement integer,
  created_at timestamptz DEFAULT now()
);

-- User achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  color text DEFAULT '#4CAF50',
  requirement text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- User badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  challenge_type text NOT NULL CHECK (challenge_type IN ('daily', 'weekly', 'monthly', 'special')),
  goal integer NOT NULL,
  xp_reward integer DEFAULT 0,
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- User challenges table
CREATE TABLE IF NOT EXISTS user_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  progress integer DEFAULT 0,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Daily stats table
CREATE TABLE IF NOT EXISTS daily_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  good_count integer DEFAULT 0,
  bad_count integer DEFAULT 0,
  xp_earned integer DEFAULT 0,
  health_start integer,
  health_end integer,
  UNIQUE(user_id, date)
);

-- Category stats table
CREATE TABLE IF NOT EXISTS category_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recycling integer DEFAULT 0,
  public_transport integer DEFAULT 0,
  energy_saving integer DEFAULT 0,
  water_conservation integer DEFAULT 0,
  sustainable_shopping integer DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('achievement', 'badge', 'friend', 'challenge', 'streak', 'level')),
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_actions_user_id ON actions(user_id);
CREATE INDEX IF NOT EXISTS idx_actions_created_at ON actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON user_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_id ON daily_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_health ON profiles(health DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_level ON profiles(level DESC);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Anyone can view profiles for leaderboard"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for actions
CREATE POLICY "Users can view own actions"
  ON actions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own actions"
  ON actions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for achievements
CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for badges
CREATE POLICY "Anyone can view badges"
  ON badges FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_badges
CREATE POLICY "Users can view own badges"
  ON user_badges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges"
  ON user_badges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for challenges
CREATE POLICY "Anyone can view active challenges"
  ON challenges FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_challenges
CREATE POLICY "Users can view own challenges"
  ON user_challenges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenges"
  ON user_challenges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenges"
  ON user_challenges FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for friendships
CREATE POLICY "Users can view own friendships"
  ON friendships FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can insert friendships"
  ON friendships FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own friendships"
  ON friendships FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = friend_id)
  WITH CHECK (auth.uid() = user_id OR auth.uid() = friend_id);

-- RLS Policies for daily_stats
CREATE POLICY "Users can view own stats"
  ON daily_stats FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats"
  ON daily_stats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON daily_stats FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for category_stats
CREATE POLICY "Users can view own category stats"
  ON category_stats FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own category stats"
  ON category_stats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own category stats"
  ON category_stats FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_category_stats_updated_at
  BEFORE UPDATE ON category_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
