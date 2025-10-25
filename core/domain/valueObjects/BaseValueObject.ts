export abstract class BaseValueObject<T> {
  protected constructor(protected readonly value: T) {}

  public getValue(): T {
    return this.value;
  }

  public equals(other?: BaseValueObject<T>): boolean {
    if (!other) return false;
    if (this === other) return true;
    if (this.constructor !== other.constructor) return false;
    return JSON.stringify(this.value) === JSON.stringify(other.value);
  }

  public toString(): string {
    return String(this.value);
  }
}
