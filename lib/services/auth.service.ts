import { createClient } from '@supabase/supabase-js';

export class AuthService {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async signUp(email: string, password: string, userType: 'client' | 'boyfriend') {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: { user_type: userType }
      }
    });

    if (error) throw error;

    // Create profile record
    if (data.user) {
      await this.createProfile(data.user.id, email, userType);
    }

    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  async resetPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`
    });

    if (error) throw error;
  }

  async updatePassword(password: string) {
    const { error } = await this.supabase.auth.updateUser({
      password
    });

    if (error) throw error;
  }

  private async createProfile(userId: string, email: string, userType: 'client' | 'boyfriend') {
    const { error } = await this.supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        user_type: userType
      });

    if (error) throw error;
  }

  getCurrentUser() {
    return this.supabase.auth.getUser();
  }

  getSession() {
    return this.supabase.auth.getSession();
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }
}
