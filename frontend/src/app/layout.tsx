import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/app/lib/auth/auth-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'TodoFlow - Streamline Your Productivity',
    template: '%s | TodoFlow'
  },
  description: 'A beautiful and intuitive task management application with secure authentication',
  keywords: ['todo', 'productivity', 'task management', 'organizer', 'tasks', 'workflow'],
  authors: [{ name: 'TodoFlow Team' }],
  creator: 'TodoFlow',
  publisher: 'TodoFlow',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://todoflow.app',
    title: 'TodoFlow - Streamline Your Productivity',
    description: 'A beautiful and intuitive task management application with secure authentication',
    siteName: 'TodoFlow',
    images: [
      {
        url: 'https://todoflow.app/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'TodoFlow - Streamline Your Productivity',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TodoFlow - Streamline Your Productivity',
    description: 'A beautiful and intuitive task management application with secure authentication',
    images: ['https://todoflow.app/twitter-image.jpg'],
    creator: '@todoflow',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-background`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}