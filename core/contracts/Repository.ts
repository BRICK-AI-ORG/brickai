import { BaseEntity } from "@/core/domain/entities/BaseEntity";

export interface RepositoryFindOptions {
  filters?: Record<string, unknown>;
  orderBy?:
    | { column: string; ascending?: boolean }
    | Array<{ column: string; ascending?: boolean }>;
  limit?: number;
}

export interface Repository<T extends BaseEntity> {
  findById(id: string): Promise<T | null>;
  findAll(options?: RepositoryFindOptions): Promise<T[]>;
  save(entity: T): Promise<void>;
  delete(entity: T): Promise<void>;
}
