import type { Metadata } from "next";
import localFont from "next/font/local";
import "@hackernoon/pixel-icon-library/fonts/iconfont.css";
import "./globals.css";

const departureMono = localFont({
  src: "./fonts/DepartureMono-Regular.woff2",
  variable: "--font-departure-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Honcho Dashboard",
    template: "%s · Honcho Dashboard",
  },
  description: "Unofficial Honcho dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${departureMono.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
