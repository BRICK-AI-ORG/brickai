import { BaseEntity, EntityProps } from "./BaseEntity";
import { User } from "@/types/models";

export interface UserEntityProps extends EntityProps {
  email: string;
  name: string | null;
  tasksCreated: number;
  subscriptionPlan?: string | null;
  tasksLimit?: number | null;
  stripeCustomerId?: string | null;
}

export class UserEntity extends BaseEntity<UserEntityProps> {
  public static fromRecord(record: User): UserEntity {
    return new UserEntity(record.user_id, {
      email: record.email,
      name: record.name ?? null,
      tasksCreated: record.tasks_created ?? 0,
      subscriptionPlan: (record as any).subscription_plan ?? null,
      tasksLimit: (record as any).tasks_limit ?? null,
      stripeCustomerId: (record as any).stripe_customer_id ?? null,
      createdAt: record.created_at ? new Date(record.created_at) : undefined,
      updatedAt: record.updated_at ? new Date(record.updated_at) : undefined,
    });
  }

  public anonymise(): void {
    this.setProps({ ...this.props, name: null });
  }

  public getEmail(): string {
    return this.props.email;
  }

  public getName(): string | null {
    return this.props.name;
  }

  public getTasksCreated(): number {
    return this.props.tasksCreated;
  }

  public getSubscriptionPlan(): string | null | undefined {
    return this.props.subscriptionPlan;
  }

  public getTasksLimit(): number | null | undefined {
    return this.props.tasksLimit;
  }

  public getStripeCustomerId(): string | null | undefined {
    return this.props.stripeCustomerId;
  }
}
