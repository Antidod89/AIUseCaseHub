import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ConfigProvider } from 'antd';
import { AuthProvider } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import 'antd/dist/reset.css';
import 'semantic-ui-css/semantic.min.css';
import 'react-quill/dist/quill.snow.css';
import '../styles/header.css';

// Корневой компонент приложения Next.js
export default function MyApp({ Component, pageProps }: AppProps) {
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
          token: {
            colorPrimary: '#1677ff',
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

