import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RoomieOps AI — Autonomous Roommate Rent & Expense Ops Agent',
  description: 'Autonomous roommate expense splitting, multimodal receipt ingestion, UPI deep links, and Min-Cash-Flow debt simplification on Google Cloud.',
};

import { AuthProvider } from '../context/AuthContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#080C14] text-gray-100 antialiased selection:bg-cyan-500 selection:text-black">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

