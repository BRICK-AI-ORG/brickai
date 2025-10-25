import { registerClientServices } from "./registerServices";

let registered = false;

export function ensureServicesRegistered(): void {
  if (registered) return;
  registerClientServices();
  registered = true;
}
