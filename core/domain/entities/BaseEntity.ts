export interface EntityProps {
  createdAt?: Date;
  updatedAt?: Date;
}

export class BaseEntity<TProps extends EntityProps = EntityProps> {
  protected constructor(
    protected readonly id: string,
    protected props: TProps
  ) {}

  public getId(): string {
    return this.id;
  }

  public getCreatedAt(): Date | undefined {
    return this.props.createdAt;
  }

  public getUpdatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  public equals(other?: BaseEntity<TProps>): boolean {
    if (!other) return false;
    if (this === other) return true;
    return this.getId() === other.getId();
  }

  public toJSON(): Record<string, unknown> {
    return {
      id: this.getId(),
      ...(this.props as Record<string, unknown>),
    };
  }

  protected setProps(props: TProps): void {
    this.props = props;
  }
}





