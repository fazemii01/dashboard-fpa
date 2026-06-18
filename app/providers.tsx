"use client";
import * as React from "react";
import { NextUIProvider } from "@nextui-org/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";
import { ToastProvider } from "@/components/toast/toast-provider";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  return (
    <NextUIProvider>
      <NextThemesProvider
        defaultTheme='system'
        attribute='class'
        {...themeProps}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </NextThemesProvider>
    </NextUIProvider>
  );
}
