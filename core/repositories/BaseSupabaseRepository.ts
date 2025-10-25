import { Repository, RepositoryFindOptions } from "@/core/contracts/Repository";
import { BaseEntity } from "@/core/domain/entities/BaseEntity";
import { SupabaseClient } from "@supabase/supabase-js";

export abstract class BaseSupabaseRepository<TEntity extends BaseEntity> implements Repository<TEntity> {
  protected constructor(
    protected readonly client: SupabaseClient,
    private readonly tableName: string
  ) {}

  protected abstract mapToEntity(record: any): TEntity;
  protected abstract mapFromEntity(entity: TEntity): Record<string, unknown>;

  public async findById(id: string): Promise<TEntity | null> {
    const { data, error } = await this.client.from(this.tableName).select("*").eq(this.primaryKey(), id).maybeSingle();
    if (error) throw error;
    return data ? this.mapToEntity(data) : null;
  }

  public async findAll(options: RepositoryFindOptions = {}): Promise<TEntity[]> {
    let query = this.client.from(this.tableName).select("*");

    if (options.filters) {
      Object.entries(options.filters).forEach(([column, value]) => {
        if (Array.isArray(value)) {
          query = query.in(column, value);
        } else if (value === null) {
          query = query.is(column, null);
        } else {
          query = query.eq(column, value as any);
        }
      });
    }

    if (options.orderBy) {
      const orders = Array.isArray(options.orderBy) ? options.orderBy : [options.orderBy];
      orders.forEach(({ column, ascending }) => {
        query = query.order(column, { ascending: ascending ?? true });
      });
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((record) => this.mapToEntity(record));
  }

  public async save(entity: TEntity): Promise<void> {
    const payload = this.mapFromEntity(entity);
    const { error } = await this.client.from(this.tableName).upsert(payload);
    if (error) throw error;
  }

  public async delete(entity: TEntity): Promise<void> {
    const { error } = await this.client.from(this.tableName).delete().eq(this.primaryKey(), entity.getId());
    if (error) throw error;
  }

  protected primaryKey(): string {
    return `${this.tableName.slice(0, -1)}_id`;
  }
}
