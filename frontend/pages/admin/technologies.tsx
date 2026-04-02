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
import { Technology } from '../../types';
import {
  createTechnology,
  deleteTechnology,
  fetchTechnologies,
  updateTechnology
} from '../../services/technologies';
import { Editor } from '../../components/Editor';

// Управление технологиями
const { Title } = Typography;

const TechnologiesAdminPage: React.FC = () => {
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Technology | null>(null);
  const [form] = Form.useForm();
  const [description, setDescription] = useState('');

  const loadTechnologies = async () => {
    setLoading(true);
    try {
      const data = await fetchTechnologies();
      setTechnologies(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTechnologies();
  }, []);

  const onFinish = async (values: { name: string; link?: string }) => {
    try {
      if (editing) {
        await updateTechnology(editing.id, {
          name: values.name,
          description,
          link: values.link
        });
        message.success('Технология обновлена');
      } else {
        await createTechnology({
          name: values.name,
          description,
          link: values.link
        });
        message.success('Технология создана');
      }
      form.resetFields();
      setEditing(null);
      setDescription('');
      await loadTechnologies();
    } catch {
      message.error('Ошибка сохранения технологии');
    }
  };

  const onEdit = (tech: Technology) => {
    setEditing(tech);
    form.setFieldsValue({
      name: tech.name,
      link: tech.link
    });
    setDescription(tech.description);
  };

  const onDelete = async (id: number) => {
    try {
      await deleteTechnology(id);
      message.success('Технология удалена');
      await loadTechnologies();
    } catch {
      message.error('Ошибка удаления технологии');
    }
  };

  return (
    <ProtectedAdminLayout>
      <Title level={2}>Технологии</Title>
      <Space
        align="start"
        size={32}
        style={{ width: '100%', justifyContent: 'space-between' }}
      >
        <div style={{ maxWidth: 400, width: '100%' }}>
          <Title level={4}>
            {editing ? 'Редактировать технологию' : 'Создать технологию'}
          </Title>
          <Form layout="vertical" form={form} onFinish={onFinish}>
            <Form.Item
              label="Название"
              name="name"
              rules={[{ required: true, message: 'Введите название' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Описание"
            >
              <Editor
                value={description}
                onChange={setDescription}
                placeholder="Описание технологии"
              />
            </Form.Item>
            <Form.Item label="Ссылка" name="link">
              <Input />
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
                      setDescription('');
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
            dataSource={technologies}
            renderItem={(tech) => (
              <List.Item
                actions={[
                  <Button
                    key="edit"
                    type="link"
                    onClick={() => onEdit(tech)}
                  >
                    Редактировать
                  </Button>,
                  <Popconfirm
                    key="delete"
                    title="Удалить технологию?"
                    onConfirm={() => void onDelete(tech.id)}
                  >
                    <Button type="link" danger>
                      Удалить
                    </Button>
                  </Popconfirm>
                ]}
              >
                <List.Item.Meta
                  title={tech.name}
                  description={
                    <>
                      <div>{tech.description}</div>
                      {tech.link && (
                        <a href={tech.link} target="_blank" rel="noreferrer">
                          {tech.link}
                        </a>
                      )}
                    </>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      </Space>
    </ProtectedAdminLayout>
  );
};

export default TechnologiesAdminPage;

