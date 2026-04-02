import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Popconfirm,
  Select,
  Space,
  Table,
  message,
  Typography
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ProtectedAdminLayout } from '../../components/ProtectedAdminLayout';
import { Case, Role, Technology } from '../../types';
import {
  fetchCases,
  createCase,
  updateCase,
  deleteCase
} from '../../services/cases';
import { fetchRoles } from '../../services/roles';
import { fetchTechnologies } from '../../services/technologies';
import { Editor } from '../../components/Editor';
import { htmlToPlainText } from '../../utils/caseExcerpt';
import { normalizeHtmlFragment } from '../../utils/normalizeHtmlFragment';

// Управление кейсами с rich-text редактором
const { Title } = Typography;

const CasesAdminPage: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Case | null>(null);
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [effect, setEffect] = useState('');
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesData, techData, casesPage] = await Promise.all([
        fetchRoles(),
        fetchTechnologies(),
        fetchCases({ page: 1, pageSize: 100 })
      ]);
      setRoles(rolesData);
      setTechnologies(techData);
      setCases(casesPage.items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const onFinish = async (values: {
    title: string;
    roleId: number;
    technologyIds?: number[];
  }) => {
    try {
      const summaryHtml = normalizeHtmlFragment(summary);
      const summaryPayload = htmlToPlainText(summaryHtml).trim()
        ? summaryHtml
        : null;
      if (editing) {
        await updateCase(editing.id, {
          title: values.title,
          roleId: values.roleId,
          technologyIds: values.technologyIds,
          summary: summaryPayload,
          description,
          effect
        });
        message.success('Кейс обновлён');
      } else {
        await createCase({
          title: values.title,
          roleId: values.roleId,
          technologyIds: values.technologyIds,
          summary: summaryPayload,
          description,
          effect
        });
        message.success('Кейс создан');
      }

      setEditing(null);
      form.resetFields();
      setSummary('');
      setDescription('');
      setEffect('');
      await loadData();
    } catch {
      message.error('Ошибка сохранения кейса');
    }
  };

  const onEdit = (c: Case) => {
    setEditing(c);
    form.setFieldsValue({
      title: c.title,
      roleId: c.role.id,
      technologyIds: c.technologies?.map((t) => t.technology.id)
    });
    setSummary(c.summary || '');
    setDescription(c.description);
    setEffect(c.effect);
  };

  const onDelete = async (id: number) => {
    try {
      await deleteCase(id);
      message.success('Кейс удалён');
      await loadData();
    } catch {
      message.error('Ошибка удаления кейса');
    }
  };

  const columns: ColumnsType<Case> = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: 'Название', dataIndex: 'title' },
    {
      title: 'Роль',
      render: (_, record) => record.role?.name
    },
    {
      title: 'Технологии',
      render: (_, record) =>
        record.technologies?.map((t) => t.technology.name).join(', ')
    },
    {
      title: 'Действия',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => onEdit(record)}>
            Редактировать
          </Button>
          <Popconfirm
            title="Удалить кейс?"
            onConfirm={() => void onDelete(record.id)}
          >
            <Button danger type="link">
              Удалить
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <ProtectedAdminLayout>
      <Title level={2}>Кейсы</Title>
      <Space
        align="start"
        size={32}
        style={{ width: '100%', justifyContent: 'space-between' }}
      >
        <div style={{ maxWidth: 500, width: '100%' }}>
          <Title level={4}>
            {editing ? 'Редактировать кейс' : 'Создать кейс'}
          </Title>
          <Form layout="vertical" form={form} onFinish={onFinish}>
            <Form.Item
              label="Название"
              name="title"
              rules={[{ required: true, message: 'Введите название' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Роль"
              name="roleId"
              rules={[{ required: true, message: 'Выберите роль' }]}
            >
              <Select
                options={roles.map((r) => ({
                  value: r.id,
                  label: r.name
                }))}
              />
            </Form.Item>
            <Form.Item label="Технологии" name="technologyIds">
              <Select
                mode="multiple"
                allowClear
                options={technologies.map((t) => ({
                  value: t.id,
                  label: t.name
                }))}
              />
            </Form.Item>
            <Form.Item label="Краткое описание для главной">
              <Editor
                value={summary}
                onChange={setSummary}
                placeholder="Краткий текст для карточки на главной"
                defaultHtmlMode={summary.includes('<')}
              />
            </Form.Item>
            <Form.Item label="Описание">
              <Editor
                value={description}
                onChange={setDescription}
                placeholder="Описание кейса"
              />
            </Form.Item>
            <Form.Item label="Эффект">
              <Editor
                value={effect}
                onChange={setEffect}
                placeholder="Ожидаемый эффект"
              />
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
                      setSummary('');
                      setDescription('');
                      setEffect('');
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
          <Table<Case>
            rowKey="id"
            columns={columns}
            dataSource={cases}
            loading={loading}
          />
        </div>
      </Space>
    </ProtectedAdminLayout>
  );
};

export default CasesAdminPage;

