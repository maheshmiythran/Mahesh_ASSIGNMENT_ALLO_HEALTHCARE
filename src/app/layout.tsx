import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inventory Reservation System — ",
  description: "MAHESH MIYTHRAN B K - 2026 - Allo Healthcare",
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
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <a href="/" className="text-lg font-semibold text-gray-900">
              Inventory Reservation
            </a>
            <div className="text-sm text-gray-600">
              Built by Mahesh Miythran B K
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
