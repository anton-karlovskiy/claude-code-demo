import Link from "next/link";
import type { Session } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

type Props = {
  user: Session["user"] | null;
};

export default function Header({ user }: Props) {
  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href="/dashboard"
          className="text-lg font-semibold tracking-tight text-foreground hover:opacity-80"
        >
          NextNotes
        </Link>
        {user && <LogoutButton />}
      </nav>
    </header>
  );
}
