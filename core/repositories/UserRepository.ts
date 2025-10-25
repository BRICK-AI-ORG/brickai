import { SupabaseClient } from "@supabase/supabase-js";
import { UserEntity } from "@/core/domain/entities/UserEntity";

interface ProfileRecord {
  user_id: string;
  email?: string | null;
  name?: string | null;
  subscription_plan?: string | null;
  tasks_limit?: number | null;
  stripe_customer_id?: string | null;
  tasks_created?: number;
  created_at?: string | null;
  updated_at?: string | null;
}

interface UsageTrackingRecord {
  tasks_created?: number;
}

export class UserRepository {
  public constructor(private readonly client: SupabaseClient) {}

  public async findById(userId: string, emailFallback?: string): Promise<UserEntity | null> {
    const { data: profile, error } = await this.client
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle<ProfileRecord>();

    if (error) {
      throw error;
    }

    if (!profile) {
      return null;
    }

    const { data: usageData, error: usageError } = await this.client
      .from("usage_tracking")
      .select("tasks_created")
      .eq("user_id", userId)
      .eq("year_month", new Date().toISOString().slice(0, 7))
      .maybeSingle<UsageTrackingRecord>();

    if (usageError && usageError.code !== "PGRST116") {
      throw usageError;
    }

    const tasksCreated = usageData?.tasks_created ?? 0;

    return UserEntity.fromRecord({
      user_id: profile.user_id,
      email: profile.email ?? emailFallback ?? "",
      name: profile.name ?? null,
      subscription_plan: profile.subscription_plan ?? null,
      tasks_limit: profile.tasks_limit ?? null,
      stripe_customer_id: profile.stripe_customer_id ?? null,
      tasks_created: tasksCreated,
      created_at: profile.created_at ?? undefined,
      updated_at: profile.updated_at ?? undefined,
    } as any);
  }

  public async ensureProfile(userId: string): Promise<void> {
    const { data, error } = await this.client
      .from("profiles")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    if (!data) {
      const { error: insertError } = await this.client.from("profiles").insert({ user_id: userId, name: null });
      if (insertError && insertError.code !== "23505") {
        throw insertError;
      }
    }
  }
}
