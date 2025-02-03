// src/app/layout.js or RootLayout.js
"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider, createTheme } from '@mui/material/styles';

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Create Material UI theme (no functions passed directly)
const materialTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#4F46E5' },
    background: { default: '#0a0a0a', paper: '#121212' },
    text: { primary: '#ffffff' },
  },
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider theme={materialTheme}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
