import type { SupabaseClient } from "@supabase/supabase-js";
import { ServiceContainer } from "./ServiceContainer";
import { SERVICE_TOKENS } from "./tokens";
import { SupabaseClientFactory } from "@/core/infrastructure/supabase/SupabaseClientFactory";
import { TaskService } from "@/core/services/TaskService";
import { PortfolioService } from "@/core/services/PortfolioService";
import { AuthService } from "@/core/services/AuthService";
import { StorageService } from "@/core/services/StorageService";
import { ProfileService } from "@/core/services/ProfileService";


export function registerClientServices(container = ServiceContainer.instance): void {
  container.register<SupabaseClient>(SERVICE_TOKENS.supabaseClient, () =>
    SupabaseClientFactory.create()
  );

  container.register(SERVICE_TOKENS.storageService, () => {
    const client = container.resolve<SupabaseClient>(SERVICE_TOKENS.supabaseClient);
    return new StorageService(client);
  });

  container.register(SERVICE_TOKENS.taskService, () => {
    const client = container.resolve<SupabaseClient>(SERVICE_TOKENS.supabaseClient);
    const storage = container.resolve<StorageService>(SERVICE_TOKENS.storageService);
    return new TaskService(client, storage);
  });

  container.register(SERVICE_TOKENS.portfolioService, () => {
    const client = container.resolve<SupabaseClient>(SERVICE_TOKENS.supabaseClient);
    return new PortfolioService(client);
  });

  container.register(SERVICE_TOKENS.authService, () => {
    const client = container.resolve<SupabaseClient>(SERVICE_TOKENS.supabaseClient);
    return new AuthService(client);
  });

  container.register(SERVICE_TOKENS.profileService, () => {
    const client = container.resolve<SupabaseClient>(SERVICE_TOKENS.supabaseClient);
    return new ProfileService(client);
  });
}






