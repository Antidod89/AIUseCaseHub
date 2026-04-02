import React, { useState } from 'react';
import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { register as apiRegister } from '../services/auth';
import { useAuth } from '../context/AuthContext';

// Страница регистрации
const { Title } = Typography;

const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    setError(null);
    setLoading(true);
    try {
      await apiRegister(values.email, values.password);
      await login(values.email, values.password);
      void router.replace('/admin');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hub-auth-page">
      <Card className="hub-auth-card">
        <Title level={3}>Регистрация</Title>
        {error && (
          <Alert
            type="error"
            message={error}
            style={{ marginBottom: 16 }}
          />
        )}
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Введите email' }]}
          >
            <Input type="email" />
          </Form.Item>
          <Form.Item
            label="Пароль"
            name="password"
            rules={[
              { required: true, message: 'Введите пароль' },
              { min: 8, message: 'Минимум 8 символов' }
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
            >
              Зарегистрироваться
            </Button>
          </Form.Item>
          <Form.Item>
            Уже есть аккаунт? <Link href="/login">Войти</Link>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterPage;

