import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { DemoProvider } from "@/lib/demo-state";
import { LiveLocationProvider } from "@/hooks/useLiveLocation";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AgriShare | Farm equipment, within reach",
    template: "%s | AgriShare",
  },
  description:
    "Find, rent and share farm equipment with trusted local owners across Pakistan.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-background font-sans text-primary-deep antialiased">
        <div aria-hidden="true" className="bg-agri-blur" />
        <DemoProvider>
          <LiveLocationProvider>{children}</LiveLocationProvider>
        </DemoProvider>
      </body>
    </html>
  );
}
