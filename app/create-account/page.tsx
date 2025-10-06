"use client";

import LoginForm from "@/components/LoginForm";
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function CreateAccountPage() {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && isLoggedIn) router.replace("/app/hub");
  }, [isLoading, isLoggedIn, router]);

  return <LoginForm mode="signup" />;
}
