import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SongPebble - Custom AI Generated Songs",
  description: "Tell us your story and we will turn it into a custom AI generated song.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
