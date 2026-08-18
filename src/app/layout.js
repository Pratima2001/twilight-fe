import localFont from "next/font/local";
import ClientThemeProvider from "../layouts/ThemeProvider";
import QueryProvider from "../layouts/QueryProvider";
import AuthProvider from "../providers/AuthProvider";
import GlobalAlert from "../components/common/GlobalAlert";
import "./globals.css";
import "./root.css";

const barlow = localFont({
  src: [
    {
      path: "../../public/fonts/Barlow/Barlow-Thin.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../../public/fonts/Barlow/Barlow-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/Barlow/Barlow-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Barlow/Barlow-SemiBold.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Barlow/Barlow-Bold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/Barlow/Barlow-ExtraBold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-barlow",
});

export const metadata = {
  title: "StewartBrown",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={barlow.variable}>
        <ClientThemeProvider>
          <QueryProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
            <GlobalAlert />
          </QueryProvider>
        </ClientThemeProvider>
      </body>
    </html>
  );
}
