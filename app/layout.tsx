import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import "@hackernoon/pixel-icon-library/fonts/iconfont.css";
import type { Metadata } from "next";
import localFont from "next/font/local";

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
    <html
      lang="en"
      className={`${departureMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
