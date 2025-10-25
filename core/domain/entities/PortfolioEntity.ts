import { BaseEntity, EntityProps } from "./BaseEntity";
import { Portfolio } from "@/types/models";
import { createUuid } from "@/core/utils/uuid";
import { Identifier } from "@/core/domain/valueObjects/Identifier";

export interface PortfolioEntityProps extends EntityProps {
  userId: string;
  name: string;
  description: string | null;
}

export class PortfolioEntity extends BaseEntity<PortfolioEntityProps> {
  public static fromRecord(record: Portfolio): PortfolioEntity {
    return new PortfolioEntity(record.portfolio_id, {
      userId: record.user_id,
      name: record.name,
      description: record.description ?? null,
      createdAt: record.created_at ? new Date(record.created_at) : undefined,
      updatedAt: record.updated_at ? new Date(record.updated_at) : undefined,
    });
  }

  public static create(props: PortfolioEntityProps, id?: Identifier): PortfolioEntity {
    return new PortfolioEntity(id ? id.getValue() : createUuid(), props);
  }

  public rename(name: string): void {
    this.setProps({ ...this.props, name });
  }

  public changeDescription(description: string | null): void {
    this.setProps({ ...this.props, description });
  }

  public getName(): string {
    return this.props.name;
  }

  public getDescription(): string | null {
    return this.props.description;
  }

  public getUserId(): string {
    return this.props.userId;
  }

  public toRecord(): Partial<Portfolio> {
    return {
      portfolio_id: this.getId(),
      user_id: this.props.userId,
      name: this.props.name,
      description: this.props.description,
      updated_at: new Date().toISOString(),
    };
  }
}
