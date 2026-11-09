import './globals.css';
import { LanguageProvider } from '../components/LanguageProvider';
import { AppProvider } from '../components/AppProvider';
import AppShell from '../components/AppShell';

export const metadata = {
  title: 'Fuboru - Meeting Room Management Dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="text-slate-800 antialiased bg-slate-50">
        <LanguageProvider>
          <AppProvider>
            <AppShell>{children}</AppShell>
          </AppProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
