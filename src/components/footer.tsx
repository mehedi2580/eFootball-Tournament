import Link from "next/link";
import { Logo } from "@/components/logo";
import { LogoutButton } from "@/components/logout-button";
import { getCurrentUser } from "@/lib/session";

const linkClass = "text-foreground/80 transition-colors hover:text-primary";
const headingClass = "mb-3 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground";

export async function Footer() {
  const user = await getCurrentUser();
  return (
    <footer className="mt-12 rounded-t-[28px] border-t border-border bg-white/70 backdrop-blur-lg">
      <div className="container-app py-10 sm:py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-xs space-y-3">
            <Logo />
            <p className="text-sm leading-relaxed text-muted-foreground">
              Create FIFA-style group stages, run knockout brackets, and crown a champion — no
              spreadsheets needed.
            </p>
          </div>
          <div className="flex gap-12 sm:gap-16">
            <div>
              <p className={headingClass}>Tournaments</p>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/tournaments" className={linkClass}>
                    Find a Tournament
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className={linkClass}>
                    Create a Tournament
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className={linkClass}>
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className={headingClass}>Account</p>
              <ul className="space-y-2 text-sm">
                {user ? (
                  <>
                    <li>
                      <Link href="/dashboard" className={linkClass}>
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <LogoutButton
                        className="h-auto justify-start gap-1.5 p-0 text-sm font-normal text-foreground/80 hover:bg-transparent hover:text-primary"
                        labelClassName=""
                      />
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link href="/login" className={linkClass}>
                        Log In
                      </Link>
                    </li>
                    <li>
                      <Link href="/signup" className={linkClass}>
                        Sign Up
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} eFootball Hub. All rights reserved.</p>
          <p>Run your tournament like a pro.</p>
        </div>
      </div>
    </footer>
  );
}
