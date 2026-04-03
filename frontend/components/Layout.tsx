import React from 'react';
import { Button, Layout as AntLayout, Space } from 'antd';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';

// Общий layout для публичных страниц
const { Header, Content, Footer } = AntLayout;

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const { user, logout } = useAuth();

  return (
    <AntLayout style={{ minHeight: '100vh', background: 'transparent' }}>
      <Header
        className="ai-header"
        style={{
          paddingInline: 0,
          paddingBlock: 6,
          minHeight: 80,
          background: 'transparent'
        }}
      >
        <div className="ai-header__bg" />
        <div className="ai-header__grid" />
        <div className="ai-header__orb" />
        <div
          className="ai-header__content"
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            paddingInline: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Link href="/" className="ai-header__brand">
            AI UseCase Hub
          </Link>
          <Space size="middle">
            <ThemeToggle variant="header" />
            <Link href="/technologies">
              <Button
                size="middle"
                shape="round"
                className="ai-header__ghost"
              >
                База технологий
              </Button>
            </Link>
            {user?.role === 'ADMIN' && (
              <Link href="/admin">
                <Button
                  size="middle"
                  shape="round"
                  className="ai-header__ghost ai-header__ghost--filled"
                >
                  Админ-панель
                </Button>
              </Link>
            )}
            {!user ? (
              <Link href="/login">
                <Button
                  type="primary"
                  size="middle"
                  shape="round"
                  style={{
                    borderRadius: 999,
                    paddingInline: 24
                  }}
                >
                  Вход
                </Button>
              </Link>
            ) : (
              <Button
                type="default"
                shape="round"
                className="ai-header__logout"
                onClick={() => void logout()}
              >
                Выход ({user.email})
              </Button>
            )}
          </Space>
        </div>
      </Header>
      <Content
        className="hub-content-surface"
        style={{
          padding: '32px 64px',
          background: 'transparent'
        }}
      >
        {children}
      </Content>
      <Footer
        className="hub-site-footer"
        style={{
          marginTop: 32,
          padding: '16px 32px',
          textAlign: 'center',
          fontSize: 13
        }}
      >
        makurinmv@lad24.ru · {new Date().getFullYear()}
      </Footer>
    </AntLayout>
  );
};

