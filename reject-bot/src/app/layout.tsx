import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from './components/Toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RagebaitResume - Get Brutally Honest Resume Feedback',
  description: 'Upload your resume and get hilarious yet helpful feedback',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
