import React, { useEffect } from 'react';
import { Layout as AntLayout, Menu, Space, Spin, Alert } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useHubTheme } from '../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';

// Layout для защищённой админ-панели
const { Header, Content } = AntLayout;

export const ProtectedAdminLayout: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      void router.replace('/login');
    }
  }, [loading, user, router]);

  const isEditorOrAdmin =
    user && (user.role === 'ADMIN' || user.role === 'EDITOR');
  const { theme: hubTheme } = useHubTheme();
  const menuTheme = hubTheme === 'dark' ? 'dark' : 'light';

  if (loading || (!user && typeof window !== 'undefined')) {
    return (
      <div
        className="hub-admin-shell"
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!isEditorOrAdmin) {
    return (
      <AntLayout className="hub-admin-shell" style={{ minHeight: '100vh' }}>
        <Header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div className="hub-admin-shell__title">
            Управление пользователями
          </div>
          <Space size="middle">
            <ThemeToggle variant="inline" />
            <Menu
              theme={menuTheme}
              mode="horizontal"
              selectable={false}
              items={[
                { key: 'home', label: <Link href="/">Главная</Link> },
                {
                  key: 'logout',
                  label: (
                    <span onClick={() => void logout()}>
                      Выход ({user.email})
                    </span>
                  )
                }
              ]}
            />
          </Space>
        </Header>
        <Content style={{ padding: 24 }}>
          <Alert
            type="error"
            message="Недостаточно прав"
            description="Для доступа к админ-панели требуется роль ADMIN или EDITOR."
          />
        </Content>
      </AntLayout>
    );
  }

  return (
    <AntLayout className="hub-admin-shell" style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div className="hub-admin-shell__title">
          Управление пользователями
        </div>
        <Space size="middle">
          <ThemeToggle variant="inline" />
          <Menu
            theme={menuTheme}
            mode="horizontal"
            selectable={false}
            items={[
              { key: 'dashboard', label: <Link href="/admin">Дэшборд</Link> },
              { key: 'users', label: <Link href="/admin/users">Пользователи</Link> },
              { key: 'technologies', label: <Link href="/technologies">Технологии</Link> },
              { key: 'home', label: <Link href="/">Главная</Link> },
              {
                key: 'logout',
                label: (
                  <span onClick={() => void logout()}>
                    Выход ({user.email})
                  </span>
                )
              }
            ]}
          />
        </Space>
      </Header>
      <Content style={{ padding: 24 }}>{children}</Content>
    </AntLayout>
  );
};

