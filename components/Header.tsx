"use client";

import Link from "next/link";
import { UserCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

type AuthAction = "login" | "signup";
const authenticationButtons: Record<string, AuthAction[]> = {
  "/home": ["login", "signup"],
  "/login": ["signup"],
  "/create-account": ["login"],
};

const Header = () => {
  const { isLoggedIn } = useAuth();
  const pathname = usePathname();
  const logoSize = 72;
  const actions = authenticationButtons[pathname] ?? ["login", "signup"];
  return (
    <header className="bg-[#171717] text-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href={"/home"} className="flex items-center gap-3 text-xl font-bold">
          <img src="/favicon.png" alt="BrickAI logo" width={logoSize} height={logoSize} />
          <span>BrickAI</span>
        </Link>

        {isLoggedIn ? (
          <Link href="/profile" aria-label="Profile">
            <UserCircle className="w-6 h-6" />
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            {actions.includes("signup") && (
              <Link href="/create-account" aria-label="Sign Up">
                <Button variant="outline">Sign Up</Button>
              </Link>
            )}
            {actions.includes("login") && (
              <Link href="/login" aria-label="Login">
                <Button className="bg-[#aa2ee2] hover:bg-[#9322c8]">Login</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
