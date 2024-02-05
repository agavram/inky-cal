import { GoogleProvider } from '@/src/providers/gapi-provider';
import { QueryProvider } from '@/src/providers/query-provider';
import cn from 'classnames';
import { Provider } from 'jotai';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const satoshi = localFont({
  src: [
    {
      path: '../../public/fonts/Satoshi-Variable.ttf',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Satoshi-VariableItalic.ttf',
      style: 'italic',
    },
  ],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Inky Cal',
  description: 'Sync your Google Calendar to an e-paper display',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Provider>
      <QueryProvider>
        <html lang="en" className={cn(satoshi.className, 'min-w-screen-sm')}>
          <head>
            <GoogleProvider />
          </head>
          <body className="mx-auto mt-10 max-w-screen-lg px-4">{children}</body>
        </html>
      </QueryProvider>
    </Provider>
  );
}
