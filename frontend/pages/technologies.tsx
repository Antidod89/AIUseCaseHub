import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Space,
  Spin,
  Typography,
  message
} from 'antd';
import Link from 'next/link';
import { Technology } from '../types';
import {
  createTechnology,
  deleteTechnology,
  fetchTechnologies,
  updateTechnology
} from '../services/technologies';
import { useAuth } from '../context/AuthContext';
import { Editor } from '../components/Editor';
import { Pagination } from '../components/Pagination';

const { Title, Paragraph } = Typography;
const PAGE_SIZE = 5;

const TechnologiesPage: React.FC = () => {
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const [form] = Form.useForm();
  const [editing, setEditing] = useState<Technology | null>(null);
  const [description, setDescription] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const makeIframeDoc = (html: string) =>
    `<style>
html, body { margin: 0; padding: 0; }
.container, main, section, .content, .wrapper {
  max-width: none !important;
  width: 100% !important;
}
</style>${html}`;

  const handleIframeLoad = (event: React.SyntheticEvent<HTMLIFrameElement>) => {
    try {
      const iframe = event.currentTarget;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;
      const body = doc.body;
      const mainEl =
        (body.querySelector(
          '.container, main, section, .content, .wrapper'
        ) as HTMLElement | null) || body.firstElementChild;

      let height: number;
      if (mainEl) {
        const rect = (mainEl as HTMLElement).getBoundingClientRect();
        height = rect.bottom + 16;
      } else {
        height = doc.documentElement.scrollHeight || body.scrollHeight;
      }

      iframe.style.height = `${Math.max(0, Math.ceil(height))}px`;
    } catch {
      // игнорируем ошибки доступа
    }
  };

  const { user } = useAuth();
  const isEditorOrAdmin =
    user && (user.role === 'ADMIN' || user.role === 'EDITOR');

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

  const total = technologies.length;
  const start = (page - 1) * PAGE_SIZE;
  const currentItems = technologies.slice(start, start + PAGE_SIZE);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  const openEditModal = (tech: Technology) => {
    setEditing(tech);
    form.setFieldsValue({
      name: tech.name,
      link: tech.link
    });
    setDescription(tech.description);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditing(null);
    form.resetFields();
    setDescription('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: { name: string; link?: string }) => {
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
      setIsModalOpen(false);
      setEditing(null);
      setDescription('');
      form.resetFields();
      await loadTechnologies();
    } catch (err: any) {
      const apiMessage =
        err?.response?.data?.message || 'Ошибка сохранения технологии';
      message.error(apiMessage);
    }
  };

  const handleDelete = async (tech: Technology) => {
    try {
      await deleteTechnology(tech.id);
      message.success('Технология удалена');
      await loadTechnologies();
      const newTotal = technologies.length - 1;
      const maxPage = Math.max(1, Math.ceil(newTotal / PAGE_SIZE));
      if (page > maxPage) setPage(maxPage);
    } catch (err: any) {
      const apiMessage =
        err?.response?.data?.message || 'Ошибка удаления технологии';
      message.error(apiMessage);
    }
  };

  const previewTech: Technology | null = (() => {
    const name = (form.getFieldValue('name') as string) || editing?.name;
    const link = (form.getFieldValue('link') as string) || editing?.link || undefined;
    if (!name) return null;
    return {
      id: editing?.id ?? 0,
      name,
      description,
      link: link || null,
      createdAt: '',
      updatedAt: ''
    } as Technology;
  })();

  return (
    <>
      <Space
        style={{
          width: '100%',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          Технологии
        </Title>
        {isEditorOrAdmin && (
          <Button type="primary" onClick={openCreateModal}>
            Добавить технологию
          </Button>
        )}
      </Space>

      <Row gutter={[16, 16]}>
        {currentItems.map((tech) => (
          <Col key={tech.id} span={24}>
            <Card
              bordered
              style={{
                borderRadius: 10,
                borderColor: 'var(--border-subtle)',
                background: 'var(--bg-card-soft)'
              }}
            >
              <div>
                <Title level={4}>
                  {tech.link ? (
                    <a href={tech.link} target="_blank" rel="noreferrer">
                      {tech.name}
                    </a>
                  ) : (
                    tech.name
                  )}
                </Title>
                {tech.description.includes('<style') ||
                tech.description.includes('<html') ||
                tech.description.includes('<body') ? (
                  <iframe
                    title={`tech-${tech.id}`}
                    srcDoc={makeIframeDoc(tech.description)}
                    style={{
                      width: '100%',
                      border: 'none',
                      borderRadius: 8,
                      overflow: 'hidden',
                      background: 'transparent'
                    }}
                    scrolling="no"
                    onLoad={handleIframeLoad}
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  />
                ) : (
                  <Paragraph className="rich-html">
                    <span
                      dangerouslySetInnerHTML={{
                        __html: tech.description
                      }}
                    />
                  </Paragraph>
                )}
              </div>
              {isEditorOrAdmin && (
                <div
                  style={{
                    marginTop: 12,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 8
                  }}
                >
                  <Button size="small" onClick={() => openEditModal(tech)}>
                    Редактировать
                  </Button>
                  <Popconfirm
                    title="Удалить технологию?"
                    okText="Да"
                    cancelText="Нет"
                    onConfirm={() => void handleDelete(tech)}
                  >
                    <Button size="small" danger>
                      Удалить
                    </Button>
                  </Popconfirm>
                </div>
              )}
            </Card>
          </Col>
        ))}
        {technologies.length === 0 && (
          <Col span={24}>
            <Paragraph>Технологии ещё не добавлены.</Paragraph>
          </Col>
        )}
      </Row>

      {total > PAGE_SIZE && (
        <div style={{ marginTop: 24 }}>
          <Pagination
            current={page}
            pageSize={PAGE_SIZE}
            total={total}
            onChange={setPage}
          />
        </div>
      )}

      <Modal
        open={isModalOpen}
        title={editing ? 'Редактировать технологию' : 'Добавить технологию'}
        onCancel={() => {
          setIsModalOpen(false);
          setEditing(null);
          setDescription('');
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Сохранить"
        cancelText="Отмена"
        destroyOnClose
        width={800}
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              onClick={() => setShowPreview((prev) => !prev)}
              type="primary"
              style={{ backgroundColor: '#16a34a', borderColor: '#16a34a' }}
            >
              {showPreview ? 'Скрыть предпросмотр' : 'Предпросмотр'}
            </Button>
          </div>
          {showPreview && previewTech && (
            <div style={{ marginBottom: 24 }}>
              <Card
                bordered
                style={{
                  borderRadius: 10,
                  borderColor: 'var(--border-subtle)',
                  background: 'var(--bg-card-soft)'
                }}
              >
                <Title level={4}>
                  {previewTech.link ? (
                    <a href={previewTech.link} target="_blank" rel="noreferrer">
                      {previewTech.name}
                    </a>
                  ) : (
                    previewTech.name
                  )}
                </Title>
                {description.includes('<style') ||
                description.includes('<html') ||
                description.includes('<body') ? (
                  <iframe
                    title="tech-preview"
                    srcDoc={makeIframeDoc(description)}
                    style={{
                      width: '100%',
                      border: 'none',
                      borderRadius: 8,
                      overflow: 'hidden',
                      background: 'transparent'
                    }}
                    scrolling="no"
                    onLoad={handleIframeLoad}
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  />
                ) : (
                  <Paragraph className="rich-html">
                    <span
                      dangerouslySetInnerHTML={{
                        __html: description
                      }}
                    />
                  </Paragraph>
                )}
              </Card>
            </div>
          )}
          <Form.Item
            label="Название"
            name="name"
            rules={[{ required: true, message: 'Введите название' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Описание">
            <Editor
              value={description}
              onChange={setDescription}
              placeholder="Описание технологии"
              defaultHtmlMode={description.includes('<')}
            />
          </Form.Item>
          <Form.Item label="Ссылка" name="link">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default TechnologiesPage;

