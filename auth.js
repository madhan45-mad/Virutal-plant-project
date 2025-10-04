import { supabase } from './supabaseClient.js';
import { showToast } from './utils.js';

export class AuthManager {
  constructor() {
    this.currentUser = null;
    this.currentSession = null;
  }

  async initialize() {
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      this.currentSession = session;
      this.currentUser = session.user;
      return true;
    }

    return false;
  }

  setupAuthListener(onAuthChange) {
    supabase.auth.onAuthStateChange((async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        this.currentSession = session;
        this.currentUser = session.user;
        await onAuthChange(true, session.user);
      } else if (event === 'SIGNED_OUT') {
        this.currentSession = null;
        this.currentUser = null;
        await onAuthChange(false, null);
      }
    }));
  }

  async signUp(email, password, username) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            username,
            email,
            health: 50,
            level: 1,
            xp: 0,
            total_xp: 0,
            streak_days: 0,
            longest_streak: 0,
            good_choices: 0,
            bad_choices: 0,
            plant_stage: 'seedling'
          });

        if (profileError) throw profileError;

        const { error: categoryError } = await supabase
          .from('category_stats')
          .insert({
            user_id: authData.user.id,
            recycling: 0,
            public_transport: 0,
            energy_saving: 0,
            water_conservation: 0,
            sustainable_shopping: 0
          });

        if (categoryError) throw categoryError;

        showToast('Success', 'Account created successfully!');
        return { success: true, user: authData.user };
      }
    } catch (error) {
      console.error('Signup error:', error);
      showToast('Error', error.message, 'error');
      return { success: false, error };
    }
  }

  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      showToast('Success', 'Logged in successfully!');
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login error:', error);
      showToast('Error', error.message, 'error');
      return { success: false, error };
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      this.currentUser = null;
      this.currentSession = null;

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      showToast('Error', error.message, 'error');
      return { success: false, error };
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return !!this.currentUser;
  }
}
