import { SupabaseClient } from "@supabase/supabase-js";

export abstract class BaseService {
  protected constructor(protected readonly client: SupabaseClient) {}
}
