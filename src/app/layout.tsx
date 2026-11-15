import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthSessionProvider } from "@/components/session-provider";
import { ToastProvider } from "@/components/ui/toast";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "eFootball Hub — Tournament Management",
    template: "%s — eFootball Hub",
  },
  description:
    "Create, manage, and follow eFootball tournaments. FIFA-style groups, automatic fixtures, live standings, goal stats, and knockout brackets.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthSessionProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
