import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { AuthProvider } from '../context/AuthContext';

export const metadata: Metadata = {
  title: 'RoomieOps AI — Autonomous Roommate Rent & Expense Ops Agent',
  description: 'Autonomous roommate expense splitting, multimodal receipt ingestion, UPI deep links, and Min-Cash-Flow debt simplification on Google Cloud.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-[#fcfaf5]">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Inter:wght@300;400;500;600;700&family=Roboto+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#fcfaf5] text-[#1a3300] font-sans antialiased selection:bg-[#ffe95c] selection:text-[#1a3300]">
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-right"
            theme="light"
            richColors
            closeButton
            toastOptions={{
              style: {
                background: '#fcfaf5',
                border: '1.5px solid #1a3300',
                color: '#1a3300',
                boxShadow: '0 8px 24px -6px rgba(26, 51, 0, 0.15)',
                borderRadius: '12px',
                fontSize: '13px',
                fontFamily: 'Inter, sans-serif',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
