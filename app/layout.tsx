import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

// Self-hosted variable fonts (latin subset) so the build never depends on Google Fonts.
const geistSans = localFont({
  src: "./fonts/Geist-Variable.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

const jetbrainsMono = localFont({
  src: "./fonts/JetBrainsMono-Variable.woff2",
  variable: "--font-jetbrains-mono",
  weight: "100 800",
  display: "swap",
  fallback: ["ui-monospace", "monospace"],
});

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "NovaWorks CRM";

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: `${APP_NAME} — AI Meeting-to-Project Manager`,
    template: `%s · ${APP_NAME}`,
  },
  description:
    "Paste a client meeting transcript and let Gemini extract the agreed projects, tasks, owners and deadlines — validated against the company directory and saved in one all-or-nothing transaction.",
  applicationName: APP_NAME,
  keywords: [
    "CRM",
    "project management",
    "AI",
    "Gemini",
    "transcript",
    "NovaWorks",
  ],
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    title: `${APP_NAME} — AI Meeting-to-Project Manager`,
    description:
      "Turn a client meeting transcript into validated projects and tasks with Gemini.",
    siteName: APP_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — AI Meeting-to-Project Manager`,
    description:
      "Turn a client meeting transcript into validated projects and tasks with Gemini.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f9fc" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1117" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('theme');
                  var d = t === 'dark' ||
                    ((t === 'system' || !t) && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  document.documentElement.classList.toggle('dark', d);
                  document.documentElement.style.colorScheme = d ? 'dark' : 'light';
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-dvh font-sans">
        <ThemeProvider>
          {children}
          <Toaster
            theme="system"
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              classNames: {
                toast: "glass bg-surface/90 text-foreground",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
