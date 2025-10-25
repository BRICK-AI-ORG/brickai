import { BaseService } from "./BaseService";
import { UserRepository } from "@/core/repositories/UserRepository";
import { UserEntity } from "@/core/domain/entities/UserEntity";
import type { AuthError, AuthTokenResponsePassword, OAuthResponse, Session, User } from "@supabase/supabase-js";

export interface AuthInitializationOptions {
  emailRedirectTo?: string;
}

export class AuthService extends BaseService {
  private readonly userRepository: UserRepository;

  public constructor(client: BaseService["client"], repository = new UserRepository(client)) {
    super(client);
    this.userRepository = repository;
  }

  public async getSession(): Promise<Session | null> {
    const { data } = await this.client.auth.getSession();
    return data.session ?? null;
  }

  public async getUser(): Promise<User | null> {
    const { data, error } = await this.client.auth.getUser();
    if (error) {
      throw error;
    }
    return data.user ?? null;
  }

  public async initializeSession(): Promise<Session | null> {
    const session = await this.getSession();
    if (session?.access_token) {
      await this.ensureUserValid();
    }
    const refreshed = await this.getSession();
    return refreshed;
  }

  public async ensureUserValid(): Promise<void> {
    const { data, error } = await this.client.auth.getUser();
    if (error || !data?.user) {
      await this.client.auth.signOut();
      throw error ?? new Error("User session is no longer valid.");
    }
  }

  public async exchangeCodeForSession(code: string): Promise<void> {
    await this.client.auth.exchangeCodeForSession(code);
  }

  public onAuthStateChange(listener: (event: string, session: Session | null) => void): () => void {
    const { data } = this.client.auth.onAuthStateChange((event, session) => {
      listener(event, session);
    });
    return () => data.subscription.unsubscribe();
  }

  public async loadUserProfile(userId: string, email?: string | null): Promise<UserEntity | null> {
    await this.userRepository.ensureProfile(userId);
    return this.userRepository.findById(userId, email ?? undefined);
  }

  public async signInWithPassword(email: string, password: string): Promise<AuthTokenResponsePassword> {
    const response = await this.client.auth.signInWithPassword({ email, password });
    if (response.error) {
      throw response.error;
    }
    return response;
  }

  public async reauthenticateWithPassword(email: string, password: string): Promise<void> {
    const response = await this.client.auth.signInWithPassword({ email, password });
    if (response.error) {
      throw response.error;
    }
  }

  public async signInWithOAuth(provider: "google", redirectTo: string): Promise<OAuthResponse> {
    const response = await this.client.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        queryParams: { prompt: "select_account" },
      },
    });

    if (response.error) {
      throw response.error;
    }

    return response;
  }

  public async signUp(email: string, password: string, redirectTo: string): Promise<void> {
    const { error } = await this.client.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectTo },
    });
    if (error) {
      throw error;
    }
  }

  public async resendConfirmation(email: string, redirectTo: string): Promise<void> {
    const { error } = (await this.client.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: redirectTo },
    } as any)) as { error: AuthError | null };

    if (error) {
      throw error;
    }
  }

  public async signOut(): Promise<void> {
    await this.client.auth.signOut();
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("supabase.auth.token");
    }
  }
}
