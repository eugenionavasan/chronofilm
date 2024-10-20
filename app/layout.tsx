import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const corleone = localFont({
  src: [
    {
      path: "./fonts/corleone.regular.ttf",
      weight: "700",
    }
  ],
  variable: "--font-corleone",
});

export const metadata: Metadata = {
  title: "Chronofilm 🎬",
  description: "Proof your movie knowledge",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased ${corleone.variable}`
      }
      >
        {children}
      </body>
    </html>
  );
}
