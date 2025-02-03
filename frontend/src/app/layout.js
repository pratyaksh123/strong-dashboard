// src/app/layout.js or RootLayout.js
"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Analytics } from "@vercel/analytics/react"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Create Material UI theme with light and dark mode adjustments
const materialTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: { main: mode === 'light' ? '#FF7F50' : '#4F46E5' }, // Coral for light, Indigo for dark
    secondary: { main: mode === 'light' ? '#1E90FF' : '#4ECDC4' }, // DodgerBlue for light, Teal for dark
    background: {
      default: mode === 'light' ? '#f4f4f9' : '#0a0a0a',
      paper: mode === 'light' ? '#ffffff' : '#121212'
    },
    text: {
      primary: mode === 'light' ? '#333333' : '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Poppins, sans-serif',
  },
});

export default function RootLayout({ children }) {
  const themeMode = typeof window !== "undefined" && window.localStorage.getItem("theme") || "dark";

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider theme={materialTheme(themeMode)}>
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
