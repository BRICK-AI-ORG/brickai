import Link from "next/link";
import { UserCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const { isLoggedIn } = useAuth();
  return (
    <header className="bg-transparent text-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href={"/home"} className="text-xl font-bold">
          BrickAI Property Hub
        </Link>

        {isLoggedIn ? (
          <Link href="/profile" aria-label="Profile">
            <UserCircle className="w-6 h-6" />
          </Link>
        ) : null}
      </div>
    </header>
  );
};

export default Header;
