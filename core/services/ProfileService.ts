import { BaseService } from "./BaseService";

export type BillingAddressInput = {
  line1: string;
  line2?: string | null;
  city: string;
  region?: string | null;
  postal_code: string;
  country?: string;
};

export type ProfileCompletionStatus = {
  hasFullName: boolean;
  hasDob: boolean;
  hasBilling: boolean;
  complete: boolean;
};

export class ProfileService extends BaseService {
  public constructor(client: BaseService["client"]) {
    super(client);
  }

  public async getCompletionStatus(userId: string): Promise<ProfileCompletionStatus> {
    const { data: profile, error: profileError } = await this.client
      .from("profiles")
      .select("full_name, name, date_of_birth")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError && profileError.code !== "PGRST116") {
      throw profileError;
    }

    const fullName =
      (profile as any)?.full_name ??
      (profile as any)?.name ??
      "";
    const hasFullName = typeof fullName === "string" && fullName.trim().length > 0;
    const dobValue = (profile as any)?.date_of_birth as string | null | undefined;
    const hasDob = !!dobValue && new Date(dobValue).getTime() <= Date.now();

    const { data: address, error: addressError } = await this.client
      .from("profile_addresses")
      .select("profile_address_id")
      .eq("user_id", userId)
      .eq("kind", "billing")
      .eq("is_primary", true)
      .is("valid_to", null)
      .limit(1)
      .maybeSingle();

    if (addressError && addressError.code !== "PGRST116") {
      throw addressError;
    }

    const hasBilling = !!address;

    return {
      hasFullName,
      hasDob,
      hasBilling,
      complete: hasFullName && hasDob && hasBilling,
    };
  }

  public async saveProfileBasics(
    userId: string,
    fullName: string,
    dateOfBirth?: string | null
  ): Promise<void> {
    const payload: Record<string, unknown> = {
      full_name: fullName.trim(),
    };
    if (dateOfBirth) {
      payload.date_of_birth = dateOfBirth;
    }

    const { error } = await this.client
      .from("profiles")
      .update(payload)
      .eq("user_id", userId);
    if (error) {
      throw error;
    }
  }

  public async upsertPrimaryBillingAddress(userId: string, addr: BillingAddressInput): Promise<void> {
    const upperCountry = (addr.country ?? "GB").toUpperCase();
    const { data: rpcId, error: rpcError } = await this.client.rpc("get_or_create_address", {
      p_line1: addr.line1,
      p_line2: addr.line2 ?? null,
      p_city: addr.city,
      p_region: addr.region ?? null,
      p_postal_code: addr.postal_code,
      p_country: upperCountry,
    });
    if (rpcError) {
      throw rpcError;
    }

    const addressId = rpcId as unknown as string;
    const now = new Date();
    const startIso = now.toISOString();
    const endPrevIso = new Date(now.getTime() - 1000).toISOString();

    await this.client
      .from("profile_addresses")
      .update({ valid_to: endPrevIso, is_primary: false })
      .eq("user_id", userId)
      .eq("kind", "billing")
      .eq("is_primary", true)
      .is("valid_to", null);

    const { error: insertError } = await this.client.from("profile_addresses").insert({
      user_id: userId,
      address_id: addressId,
      kind: "billing",
      is_primary: true,
      valid_from: startIso,
    } as any);

    if (insertError) {
      throw insertError;
    }
  }
}


