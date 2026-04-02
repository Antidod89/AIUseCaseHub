import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  message,
  Popconfirm,
  Select,
  Space,
  Table,
  Typography
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ProtectedAdminLayout } from '../../components/ProtectedAdminLayout';
import { RoleEnum, User } from '../../types';
import { createUser, deleteUser, fetchUsers, updateUserRole } from '../../services/users';
import { useAuth } from '../../context/AuthContext';

// Управление пользователями
const { Title } = Typography;

const UsersAdminPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const handleRoleChange = async (userId: number, role: RoleEnum) => {
    try {
      await updateUserRole(userId, role);
      message.success('Роль обновлена');
      await loadUsers();
    } catch {
      message.error('Ошибка обновления роли');
    }
  };

  const handleDelete = async (userId: number) => {
    try {
      await deleteUser(userId);
      message.success('Пользователь удалён');
      await loadUsers();
    } catch {
      message.error('Ошибка удаления пользователя');
    }
  };

  const columns: ColumnsType<User> = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: 'Email', dataIndex: 'email' },
    {
      title: 'Роль',
      dataIndex: 'role',
      render: (value, record) => (
        <Select
          value={value}
          onChange={(val) => void handleRoleChange(record.id, val as RoleEnum)}
          options={[
            { value: 'ADMIN', label: 'ADMIN' },
            { value: 'EDITOR', label: 'EDITOR' },
            { value: 'USER', label: 'USER' }
          ]}
        />
      )
    },
    {
      title: 'Действия',
      render: (_, record) => (
        <Popconfirm
          title="Удалить пользователя?"
          onConfirm={() => void handleDelete(record.id)}
        >
          <Button danger>Удалить</Button>
        </Popconfirm>
      )
    }
  ];

  const handleCreate = async (values: {
    email: string;
    password: string;
    role: RoleEnum;
  }) => {
    try {
      await createUser(values);
      message.success('Пользователь создан');
      form.resetFields();
      await loadUsers();
    } catch (err: any) {
      const apiMessage =
        err?.response?.data?.message || 'Ошибка создания пользователя';
      message.error(apiMessage);
    }
  };

  return (
    <ProtectedAdminLayout>
      <Title level={2}>Пользователи</Title>
      <Space
        align="start"
        size={32}
        style={{ width: '100%', justifyContent: 'space-between' }}
      >
        {isAdmin && (
          <div style={{ maxWidth: 360, width: '100%' }}>
            <Title level={4}>Создать пользователя</Title>
            <Form
              layout="vertical"
              form={form}
              onFinish={handleCreate}
              initialValues={{ role: 'USER' }}
            >
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Введите email' },
                  { type: 'email', message: 'Некорректный email' }
                ]}
              >
                <Input />
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
              <Form.Item label="Роль" name="role">
                <Select
                  options={[
                    { value: 'ADMIN', label: 'ADMIN' },
                    { value: 'EDITOR', label: 'EDITOR' },
                    { value: 'USER', label: 'USER' }
                  ]}
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Создать
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}

        <div style={{ flex: 1 }}>
          <Table<User>
            rowKey="id"
            columns={columns}
            dataSource={users}
            loading={loading}
          />
        </div>
      </Space>
    </ProtectedAdminLayout>
  );
};

export default UsersAdminPage;

