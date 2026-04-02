import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  List,
  Popconfirm,
  Space,
  message,
  Typography
} from 'antd';
import { ProtectedAdminLayout } from '../../components/ProtectedAdminLayout';
import { Role } from '../../types';
import {
  createRole,
  deleteRole,
  fetchRoles,
  updateRole
} from '../../services/roles';

// Управление доменными ролями
const { Title } = Typography;

const RolesAdminPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [form] = Form.useForm();

  const loadRoles = async () => {
    setLoading(true);
    try {
      const data = await fetchRoles();
      setRoles(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRoles();
  }, []);

  const onFinish = async (values: { name: string; description: string }) => {
    try {
      if (editing) {
        await updateRole(editing.id, { description: values.description });
        message.success('Роль обновлена');
      } else {
        await createRole(values);
        message.success('Роль создана');
      }
      form.resetFields();
      setEditing(null);
      await loadRoles();
    } catch {
      message.error('Ошибка сохранения роли');
    }
  };

  const onEdit = (role: Role) => {
    setEditing(role);
    form.setFieldsValue({
      name: role.name,
      description: role.description
    });
  };

  const onDelete = async (id: number) => {
    try {
      await deleteRole(id);
      message.success('Роль удалена');
      await loadRoles();
    } catch {
      message.error('Ошибка удаления роли');
    }
  };

  return (
    <ProtectedAdminLayout>
      <Title level={2}>Роли</Title>
      <Space
        align="start"
        size={32}
        style={{ width: '100%', justifyContent: 'space-between' }}
      >
        <div style={{ maxWidth: 400, width: '100%' }}>
          <Title level={4}>
            {editing ? 'Редактировать роль' : 'Создать роль'}
          </Title>
          <Form layout="vertical" form={form} onFinish={onFinish}>
            <Form.Item
              label="Имя роли"
              name="name"
              rules={[{ required: true, message: 'Введите имя роли' }]}
            >
              <Input disabled={!!editing} />
            </Form.Item>
            <Form.Item
              label="Описание"
              name="description"
              rules={[{ required: true, message: 'Введите описание' }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editing ? 'Сохранить' : 'Создать'}
                </Button>
                {editing && (
                  <Button
                    onClick={() => {
                      setEditing(null);
                      form.resetFields();
                    }}
                  >
                    Отмена
                  </Button>
                )}
              </Space>
            </Form.Item>
          </Form>
        </div>

        <div style={{ flex: 1 }}>
          <List
            bordered
            loading={loading}
            dataSource={roles}
            renderItem={(role) => (
              <List.Item
                actions={[
                  <Button key="edit" onClick={() => onEdit(role)} type="link">
                    Редактировать
                  </Button>,
                  <Popconfirm
                    key="delete"
                    title="Удалить роль?"
                    onConfirm={() => void onDelete(role.id)}
                  >
                    <Button danger type="link">
                      Удалить
                    </Button>
                  </Popconfirm>
                ]}
              >
                <List.Item.Meta
                  title={role.name}
                  description={role.description}
                />
              </List.Item>
            )}
          />
        </div>
      </Space>
    </ProtectedAdminLayout>
  );
};

export default RolesAdminPage;

