import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inventory Reservation System",
  description: "Reserve and manage product inventory",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <nav className="border-b border-gray-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <a href="/" className="text-lg font-semibold text-gray-900">
              Inventory Reservation
            </a>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
