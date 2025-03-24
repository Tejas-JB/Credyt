import './styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Blockchain Authentication Platform',
  description: 'A secure blockchain-based platform for authentication and transactions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-text`}>
        {/* Toast notifications */}
        <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
        
        {children}
      </body>
    </html>
  );
} 