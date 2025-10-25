import { BaseSupabaseRepository } from "./BaseSupabaseRepository";
import { PortfolioEntity } from "@/core/domain/entities/PortfolioEntity";
import { SupabaseClient } from "@supabase/supabase-js";
import { Portfolio } from "@/types/models";

export class PortfolioRepository extends BaseSupabaseRepository<PortfolioEntity> {
  constructor(client: SupabaseClient) {
    super(client, "portfolios");
  }

  protected mapToEntity(record: Portfolio): PortfolioEntity {
    return PortfolioEntity.fromRecord(record);
  }

  protected mapFromEntity(entity: PortfolioEntity): Partial<Portfolio> {
    return entity.toRecord();
  }
}
