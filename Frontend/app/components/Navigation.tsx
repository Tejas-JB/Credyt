"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

// Use dynamic import with no SSR to prevent hydration mismatch with webcam
const EmotionIndicator = dynamic(
  () => import('../components/EmotionDetection/EmotionIndicator'),
  { ssr: false }
);

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

export default function Navigation() {
  const pathname = usePathname();
  
  // Navigation items with their respective icons
  const navigation = [
    { name: 'Dashboard', href: '/' },
    { name: 'Cryptocurrency', href: '/cryptocurrency' },
    { name: 'Transactions', href: '/transactions' },
    { name: 'Wallet', href: '/wallet' },
    { name: 'NFTs', href: '/nfts' },
  ];

  return (
    <nav className="bg-background border-b border-gray-800 px-4 py-2.5">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">CryptoVault</span>
          </Link>
          <div className="hidden md:flex ml-10 space-x-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={isActive ? 'nav-link-active' : 'nav-link'}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <EmotionIndicator />
          <button className="btn-primary">Connect Wallet</button>
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white">
            <span>JD</span>
          </div>
        </div>
      </div>
      
      {/* Mobile navigation */}
      <div className="md:hidden mt-4 flex justify-around">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`${isActive ? 'text-primary' : 'text-darkText'} flex flex-col items-center text-xs`}
            >
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
} 