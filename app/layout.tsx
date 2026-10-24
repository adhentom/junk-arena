import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JUNK//ARENA",
  description: "Arcade survival game: scan junk, forge weapons, survive the swarm.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
