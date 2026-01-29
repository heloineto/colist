import type { ReactNode } from 'react';
import { ColorSchemeScript } from '@mantine/core';
import type { Metadata, Viewport } from 'next';
import type { SupportedLanguage } from '@/deprecated/packages/translations';
import { cookies } from 'next/headers';
import { Providers } from './providers';
import { getLanguageCookie } from './get-language-cookie';
import { geistMono, geistSans } from './fonts';

import './globals.css';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/tiptap/styles.css';
import {
  APP_DEFAULT_TITLE,
  APP_DESCRIPTION,
  APP_NAME,
  APP_TITLE_TEMPLATE,
  BASE_URL,
} from '@/lib/constants';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  applicationName: APP_NAME,
  manifest: '/manifest.json',
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: 'summary',
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  icons: {
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#2b8a3e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

interface Props {
  children: ReactNode;
}

// FUTURE: Fix the alphabetical order of accentuated characters. (PostgreSQL problem)
// FUTURE: Add a way to edit categories
// FUTURE: Add history
export default async function RootLayout({ children }: Props) {
  const language = await getLanguageCookie();
  const primaryColor = (await cookies()).get('primary-color')?.value ?? 'green';

  return (
    <html lang={language}>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers
          language={language as SupportedLanguage}
          primaryColor={primaryColor}
        >
          {children}
        </Providers>
      </body>
    </html>
  );
}
