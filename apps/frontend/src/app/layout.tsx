import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NeoGochi — Digital Pet',
  description: 'A real-time AI Tamagotchi',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
