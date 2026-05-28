import type { Metadata } from "next";
import "./globals.css";
import { BridgeProvider } from "@/components/providers/BridgeProvider";

export const metadata: Metadata = {
  title: "Lazer Slides",
  description: "Presentation builder by Lazer Technologies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-fill-1 text-text-1">
        <BridgeProvider>{children}</BridgeProvider>
      </body>
    </html>
  );
}
