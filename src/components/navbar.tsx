import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";
import { Logo } from "@/components/logo";

const navLinkClass =
  "rounded-full px-3 py-2 text-sm font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white";

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <div className="sticky top-3 z-40 px-3 sm:top-4 sm:px-4">
      <header className="mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full border border-white/10 bg-navy/95 pl-3 pr-2 shadow-pill backdrop-blur-xl sm:h-16 sm:pl-4 sm:pr-3">
        <Link href="/" aria-label="eFootball Hub home">
          <Logo variant="dark" />
        </Link>
        <nav className="flex items-center gap-0.5 sm:gap-1">
          <Link href="/tournaments" className={`${navLinkClass} hidden sm:block`}>
            Find Tournament
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className={navLinkClass}>
                Dashboard
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/tournaments" className={`${navLinkClass} sm:hidden`}>
                Find
              </Link>
              <Link href="/login" className={`${navLinkClass} hidden min-[420px]:block`}>
                Log In
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-white text-navy hover:bg-white/90">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </nav>
      </header>
    </div>
  );
}
