"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";

type Props = {
  onCompleted?: () => void;
};

export default function CompleteProfileForm({ onCompleted }: Props) {
  const { status, loading, error, saveProfileBasics, upsertPrimaryBillingAddress, refresh } = useProfileCompletion();

  // Step 1: basics
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState<Date | undefined>(undefined);

  // Step 2: billing address
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!loading && status.complete) {
      onCompleted?.();
    }
  }, [loading, status.complete, onCompleted]);

  const canContinueStep1 = useMemo(() => {
    const okName = fullName.trim().length > 0;
    const okDob = !!dob && dob.getTime() <= Date.now();
    return okName && okDob;
  }, [fullName, dob]);

  const canFinish = useMemo(() => {
    const ok = [line1, city, postalCode].every((s) => s.trim().length > 0);
    return ok;
  }, [line1, city, postalCode]);

  const handleStep1 = async () => {
    if (!canContinueStep1) return;
    try {
      setBusy(true);
      await saveProfileBasics(fullName.trim(), dob!.toISOString().slice(0, 10));
      setStep(1);
    } finally {
      setBusy(false);
    }
  };

  const handleFinish = async () => {
    if (!canFinish) return;
    try {
      setBusy(true);
      await upsertPrimaryBillingAddress({
        line1: line1.trim(),
        line2: line2.trim() || null,
        city: city.trim(),
        region: region.trim() || null,
        postal_code: postalCode.trim(),
        country: "GB",
      });
      await refresh();
      onCompleted?.();
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="py-8 text-center text-sm">Checking your profile…</div>;

  return (
    <div className="space-y-5">
      {step === 0 ? (
        <div className="space-y-4">
          <div>
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label>Date of birth</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !dob && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dob ? format(dob, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dob}
                  onSelect={setDob}
                  toYear={new Date().getFullYear()}
                  disabled={{ after: new Date() }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="pt-2 flex justify-end">
            <Button disabled={!canContinueStep1 || busy} onClick={handleStep1}>Save & Continue</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <Label htmlFor="line1">Address line 1</Label>
            <Input id="line1" value={line1} onChange={(e) => setLine1(e.target.value)} placeholder="123 Example St" />
          </div>
          <div>
            <Label htmlFor="line2">Address line 2 (optional)</Label>
            <Input id="line2" value={line2} onChange={(e) => setLine2(e.target.value)} placeholder="Apartment, suite, etc." />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="region">Region/State (optional)</Label>
            <Input id="region" value={region} onChange={(e) => setRegion(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="postal">Postal code</Label>
            <Input id="postal" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
          </div>
          {/* Country is assumed GB for all users */}
          <div className="pt-2 flex justify-between">
            <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
            <Button disabled={!canFinish || busy} onClick={handleFinish}>Finish</Button>
          </div>
        </div>
      )}
      {error && <div className="text-xs text-destructive">{error}</div>}
    </div>
  );
}
