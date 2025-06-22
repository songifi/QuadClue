import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from "react";
import GlobalMusicController from "@/components/GlobalMusicController";
import { ClientProvider } from "@/components/providers/ClientProvider";
import { WalletConnectionGuard } from "@/components/WalletConnectionGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CLU3",
  description: "An onchain puzzle game on the staknet network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientProvider>
          <audio
            id="global-background-music"
            src="/sounds/background-music.wav"
            loop
            preload="auto"
            style={{ display: "none" }}
          />
          {/* Client-side music controller */}
          <GlobalMusicController />
          
          {/* Require wallet connection for the entire app */}
          <WalletConnectionGuard>
            {children}
          </WalletConnectionGuard>
        </ClientProvider>
      </body>
    </html>
  );
}
