import { BaseValueObject } from "./BaseValueObject";

export class Identifier extends BaseValueObject<string> {
  constructor(id: string) {
    super(id);
    if (!id) {
      throw new Error("Identifier requires a non-empty value.");
    }
  }
}
