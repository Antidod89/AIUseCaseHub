import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider, useHubTheme } from '../context/ThemeContext';
import { Layout } from '../components/Layout';
import 'antd/dist/reset.css';
import 'semantic-ui-css/semantic.min.css';
import 'react-quill/dist/quill.snow.css';
import '../styles/header.css';
import '../styles/globals.css';

function ThemedApp({ Component, pageProps }: AppProps) {
  const { theme: hubTheme } = useHubTheme();
  const isDark = hubTheme === 'dark';

  const isAdminRoute =
    typeof window !== 'undefined' &&
    window.location.pathname.startsWith('/admin');

  return (
    <>
      <Head>
        <title>AI UseCase Hub</title>
      </Head>
      <ConfigProvider
        theme={{
          algorithm: isDark ? antdTheme.darkAlgorithm : undefined,
          token: isDark
            ? {
                colorPrimary: '#60a5fa',
                colorPrimaryHover: '#93c5fd',
                borderRadius: 6
              }
            : {
                colorPrimary: '#2563eb',
                colorPrimaryHover: '#3b82f6',
                colorText: '#0f172a',
                colorTextSecondary: '#64748b',
                colorTextPlaceholder: '#94a3b8',
                colorBorder: 'rgba(15, 23, 42, 0.14)',
                colorBgContainer: '#ffffff',
                colorBgElevated: '#ffffff',
                borderRadius: 6
              }
        }}
      >
        <AuthProvider>
          {isAdminRoute ? (
            <Component {...pageProps} />
          ) : (
            <Layout>
              <Component {...pageProps} />
            </Layout>
          )}
        </AuthProvider>
      </ConfigProvider>
    </>
  );
}

// Корневой компонент приложения Next.js
export default function MyApp(props: AppProps) {
  return (
    <ThemeProvider>
      <ThemedApp {...props} />
    </ThemeProvider>
  );
}
