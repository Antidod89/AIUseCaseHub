import React, { useEffect, useState } from 'react';
import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Typography,
  message
} from 'antd';
import { Case, Role, Technology } from '../types';
import {
  createCase,
  fetchCases,
  updateCase,
  deleteCase,
  CasesPage
} from '../services/cases';
import { createRole, fetchRoles, updateRole, deleteRole } from '../services/roles';
import {
  createTechnology,
  fetchTechnologies,
  updateTechnology
} from '../services/technologies';
import { Pagination } from '../components/Pagination';
import { CaseCard } from '../components/CaseCard';
import { CaseSummaryCard } from '../components/CaseSummaryCard';
import { Editor } from '../components/Editor';
import { useAuth } from '../context/AuthContext';
import { htmlToPlainText } from '../utils/caseExcerpt';
import { normalizeHtmlFragment } from '../utils/normalizeHtmlFragment';

// Публичная страница: роли, список кейсов (кратко), пагинация по 10 записей
const { Title } = Typography;

const PAGE_SIZE = 10;

const HomePage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [roleId, setRoleId] = useState<number | undefined>(undefined);

  const { user } = useAuth();
  const isEditorOrAdmin =
    user && (user.role === 'ADMIN' || user.role === 'EDITOR');

  const [roleForm] = Form.useForm();
  const [caseForm] = Form.useForm();
  const [techForm] = Form.useForm();

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [caseSummary, setCaseSummary] = useState('');
  const [caseDescription, setCaseDescription] = useState('');
  const [caseEffect, setCaseEffect] = useState('');
  const [caseTechnologiesHtml, setCaseTechnologiesHtml] = useState('');
  const [showCasePreview, setShowCasePreview] = useState(false);

  const [isTechModalOpen, setIsTechModalOpen] = useState(false);
  const [editingTech, setEditingTech] = useState<Technology | null>(null);

  useEffect(() => {
    void (async () => {
      const [rolesData, techData] = await Promise.all([
        fetchRoles(),
        fetchTechnologies()
      ]);
      setRoles(rolesData);
      setTechnologies(techData);
    })();
  }, []);

  useEffect(() => {
    void (async () => {
      const data: CasesPage = await fetchCases({
        page,
        pageSize: PAGE_SIZE,
        roleId
      });
      setCases(data.items);
      setTotal(data.total);
    })();
  }, [page, roleId]);

  const handleDeleteCase = async (c: Case) => {
    try {
      await deleteCase(c.id);
      message.success('Кейс удалён');
      const data: CasesPage = await fetchCases({
        page,
        pageSize: PAGE_SIZE,
        roleId
      });
      if (data.items.length === 0 && page > 1) {
        const newPage = page - 1;
        setPage(newPage);
        const dataPrev: CasesPage = await fetchCases({
          page: newPage,
          pageSize: PAGE_SIZE,
          roleId
        });
        setCases(dataPrev.items);
        setTotal(dataPrev.total);
      } else {
        setCases(data.items);
        setTotal(data.total);
      }
    } catch (err: any) {
      const apiMessage =
        err?.response?.data?.message || 'Ошибка удаления кейса';
      message.error(apiMessage);
    }
  };

  const previewCase: Case | null = (() => {
    const title = (caseForm.getFieldValue('title') as string) || editingCase?.title;
    const author = (caseForm.getFieldValue('author') as string) || editingCase?.author || undefined;
    const roleIdValue =
      (caseForm.getFieldValue('roleId') as number | undefined) ||
      editingCase?.role.id;
    const role = roles.find((r) => r.id === roleIdValue) || editingCase?.role;

    if (!title || !role) {
      return null;
    }

    return {
      id: editingCase?.id ?? 0,
      title,
      summary: caseSummary || editingCase?.summary || null,
      description: caseDescription,
      effect: caseEffect,
      author,
      technologiesHtml: caseTechnologiesHtml || editingCase?.technologiesHtml || null,
      role,
      technologies: editingCase?.technologies || [],
      createdAt: editingCase?.createdAt || new Date().toISOString(),
      updatedAt: editingCase?.updatedAt || new Date().toISOString()
    };
  })();

  const openCreateRole = () => {
    setEditingRole(null);
    roleForm.resetFields();
    setIsRoleModalOpen(true);
  };

  const openEditRole = (role: Role) => {
    setEditingRole(role);
    roleForm.setFieldsValue({
      name: role.name,
      description: role.description
    });
    setIsRoleModalOpen(true);
  };

  const handleRoleSubmit = async (values: {
    name: string;
    description?: string;
  }) => {
    try {
      if (editingRole) {
        await updateRole(editingRole.id, {
          name: values.name,
          description: values.description
        });
        message.success('Роль обновлена');
      } else {
        await createRole(values);
        message.success('Роль создана');
      }
      const updated = await fetchRoles();
      setRoles(updated);
      setIsRoleModalOpen(false);
    } catch (err: any) {
      const apiMessage =
        err?.response?.data?.message || 'Ошибка сохранения роли';
      message.error(apiMessage);
    }
  };

  const openCreateCase = () => {
    setEditingCase(null);
    caseForm.resetFields();
    setCaseSummary('');
    setCaseDescription('');
    setCaseEffect('');
    setCaseTechnologiesHtml('');
    setIsCaseModalOpen(true);
  };

  const openEditCase = (c: Case) => {
    setEditingCase(c);
    caseForm.setFieldsValue({
      title: c.title,
      roleId: c.role.id,
      author: c.author || ''
    });
    setCaseSummary(c.summary || '');
    setCaseDescription(c.description);
    setCaseEffect(c.effect);
    setCaseTechnologiesHtml(c.technologiesHtml || '');
    setIsCaseModalOpen(true);
  };

  const handleCaseSubmit = async (values: {
    title: string;
    roleId: number;
    author?: string;
  }) => {
    try {
      const summaryHtml = normalizeHtmlFragment(caseSummary);
      const summaryPayload = htmlToPlainText(summaryHtml).trim()
        ? summaryHtml
        : null;
      const descriptionHtml = normalizeHtmlFragment(caseDescription);
      const effectHtml = normalizeHtmlFragment(caseEffect);
      const technologiesHtml = normalizeHtmlFragment(caseTechnologiesHtml);

      if (editingCase) {
        await updateCase(editingCase.id, {
          title: values.title,
          roleId: values.roleId,
          author: values.author,
          summary: summaryPayload,
          description: descriptionHtml,
          effect: effectHtml,
          technologiesHtml
        });
        message.success('Кейс обновлён');
      } else {
        await createCase({
          title: values.title,
          roleId: values.roleId,
          author: values.author,
          summary: summaryPayload,
          description: descriptionHtml,
          effect: effectHtml,
          technologiesHtml
        });
        message.success('Кейс создан');
      }

      const data: CasesPage = await fetchCases({
        page,
        pageSize: PAGE_SIZE,
        roleId
      });
      setCases(data.items);
      setTotal(data.total);
      setIsCaseModalOpen(false);
    } catch (err: any) {
      const apiMessage =
        err?.response?.data?.message || 'Ошибка сохранения кейса';
      message.error(apiMessage);
    }
  };

  const openCreateTech = () => {
    setEditingTech(null);
    techForm.resetFields();
    setIsTechModalOpen(true);
  };

  const openEditTech = (tech: Technology) => {
    setEditingTech(tech);
    techForm.setFieldsValue({
      name: tech.name,
      description: tech.description,
      link: tech.link
    });
    setIsTechModalOpen(true);
  };

  const handleTechSubmit = async (values: {
    name: string;
    description: string;
    link?: string;
  }) => {
    try {
      if (editingTech) {
        await updateTechnology(editingTech.id, values);
        message.success('Технология обновлена');
      } else {
        await createTechnology(values);
        message.success('Технология создана');
      }
      const updated = await fetchTechnologies();
      setTechnologies(updated);
      setIsTechModalOpen(false);
    } catch {
      message.error('Ошибка сохранения технологии');
    }
  };

  return (
    <Row gutter={[24, 24]}>
      <Col span={24}>
        {isEditorOrAdmin && (
          <div style={{ marginBottom: 16 }}>
            <Button type="primary" onClick={openCreateRole}>
              Добавить роль
            </Button>
          </div>
        )}
        <Row gutter={[16, 16]}>
          {roles.map((role) => {
            const isActive = roleId === role.id;
            return (
              <Col key={role.id} xs={24} sm={12} md={8} style={{ display: 'flex' }}>
                <div
                  style={{
                    border: isActive ? '1px solid #bfdbfe' : '1px solid #dbeafe',
                    borderRadius: 8,
                    padding: 16,
                    height: 140,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    background: isActive ? '#dbeafe' : '#eff6ff',
                    cursor: 'pointer',
                    boxShadow: isActive
                      ? '0 6px 18px rgba(15, 23, 42, 0.18)'
                      : '0 3px 10px rgba(15, 23, 42, 0.08)',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    transform: isActive ? 'translateY(-2px)' : 'none'
                  }}
                  onClick={() => {
                    setRoleId(role.id);
                    setPage(1);
                  }}
                >
                  <strong>{role.name}</strong>
                  <div
                    style={{
                      marginTop: 8,
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {role.description}
                  </div>
                  {isEditorOrAdmin && (
                    <Space style={{ marginTop: 12 }}>
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditRole(role);
                        }}
                      >
                        Редактировать
                      </Button>
                      {!['ADMIN', 'EDITOR', 'USER'].includes(role.name) && (
                        <Popconfirm
                          title="Удалить роль?"
                          description="Эту операцию нельзя будет отменить."
                          okText="Да"
                          cancelText="Нет"
                          onConfirm={async (e) => {
                            if (e?.stopPropagation) {
                              e.stopPropagation();
                            }
                            try {
                              await deleteRole(role.id);
                              message.success('Роль удалена');
                              const updated = await fetchRoles();
                              setRoles(updated);
                              if (roleId === role.id) {
                                setRoleId(undefined);
                                setPage(1);
                              }
                            } catch (err: any) {
                              const apiMessage =
                                err?.response?.data?.message ||
                                'Ошибка удаления роли';
                              message.error(apiMessage);
                            }
                          }}
                          onCancel={(e) => {
                            if (e?.stopPropagation) {
                              e.stopPropagation();
                            }
                          }}
                        >
                          <Button
                            size="small"
                            danger
                            onClick={(e) => e.stopPropagation()}
                          >
                            Удалить
                          </Button>
                        </Popconfirm>
                      )}
                    </Space>
                  )}
                </div>
              </Col>
            );
          })}
        </Row>
      </Col>

      <Col span={24}>
        <Space
          style={{
            width: '100%',
            justifyContent: 'flex-end',
            alignItems: 'center'
          }}
        >
          {isEditorOrAdmin && (
            <Button onClick={openCreateCase}>Новый кейс</Button>
          )}
        </Space>
      </Col>

      <Col span={24}>
        {cases.length > 0 ? (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            {cases.map((c) => (
              <CaseSummaryCard
                key={c.id}
                caseData={c}
                showAdminActions={!!isEditorOrAdmin}
                onEdit={isEditorOrAdmin ? openEditCase : undefined}
                onDelete={isEditorOrAdmin ? handleDeleteCase : undefined}
              />
            ))}
          </Space>
        ) : (
          <Typography.Paragraph
            type="secondary"
            style={{
              textAlign: 'center',
              marginTop: 24,
              fontWeight: 600,
              fontSize: 16
            }}
          >
            Еще нет ни одного кейса. Coming soon...
          </Typography.Paragraph>
        )}
      </Col>

      <Col span={24}>
        <Pagination
          current={page}
          pageSize={PAGE_SIZE}
          total={total}
          onChange={setPage}
        />
      </Col>

      {/* Модалка роли */}
      <Modal
        open={isRoleModalOpen}
        title={editingRole ? 'Редактировать роль' : 'Создать роль'}
        onCancel={() => setIsRoleModalOpen(false)}
        onOk={() => roleForm.submit()}
        okText="Сохранить"
        cancelText="Отмена"
        destroyOnHidden
      >
        <Form
          layout="vertical"
          form={roleForm}
          onFinish={handleRoleSubmit}
          initialValues={{ name: '', description: '' }}
        >
          <Form.Item
            label="Название роли"
            name="name"
            rules={[{ required: true, message: 'Введите название роли' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Описание"
            name="description"
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Модалка кейса */}
      <Modal
        open={isCaseModalOpen}
        title={editingCase ? 'Редактировать кейс' : 'Создать кейс'}
        onCancel={() => setIsCaseModalOpen(false)}
        onOk={() => caseForm.submit()}
        width={800}
        okText="Сохранить"
        cancelText="Отмена"
        destroyOnHidden
      >
        <Form layout="vertical" form={caseForm} onFinish={handleCaseSubmit}>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              onClick={() => setShowCasePreview((prev) => !prev)}
              type="primary"
              style={{ backgroundColor: '#16a34a', borderColor: '#16a34a' }}
            >
              {showCasePreview ? 'Скрыть предпросмотр' : 'Предпросмотр'}
            </Button>
          </div>
          {showCasePreview && previewCase && (
            <div style={{ marginBottom: 24 }}>
              <CaseCard caseData={previewCase} />
            </div>
          )}
          <Form.Item
            label="Название"
            name="title"
            rules={[{ required: true, message: 'Введите название' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Автор кейса" name="author">
            <Input placeholder="Например, Иван Иванов" />
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
          <Form.Item label="Краткое описание для списка на главной">
            <Editor
              value={caseSummary}
              onChange={setCaseSummary}
              placeholder="Краткий текст для карточки на главной"
              defaultHtmlMode={caseSummary.includes('<')}
            />
          </Form.Item>
          <Form.Item label="Описание (полное)">
            <Editor
              value={caseDescription}
              onChange={setCaseDescription}
              placeholder="Описание кейса"
              defaultHtmlMode={caseDescription.includes('<')}
            />
          </Form.Item>
          <Form.Item label="Эффект">
            <Editor
              value={caseEffect}
              onChange={setCaseEffect}
              placeholder="Эффект от кейса"
              defaultHtmlMode={caseEffect.includes('<')}
            />
          </Form.Item>
          <Form.Item label="Используемые технологии">
            <Editor
              value={caseTechnologiesHtml}
              onChange={setCaseTechnologiesHtml}
              placeholder="Опишите используемые технологии"
              defaultHtmlMode={caseTechnologiesHtml.includes('<')}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Модалка технологии */}
      <Modal
        open={isTechModalOpen}
        title={editingTech ? 'Редактировать технологию' : 'Создать технологию'}
        onCancel={() => setIsTechModalOpen(false)}
        onOk={() => techForm.submit()}
        okText="Сохранить"
        cancelText="Отмена"
        destroyOnHidden
      >
        <Form layout="vertical" form={techForm} onFinish={handleTechSubmit}>
          <Form.Item
            label="Название"
            name="name"
            rules={[{ required: true, message: 'Введите название' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Описание"
            name="description"
            rules={[{ required: true, message: 'Введите описание' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="Ссылка" name="link">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

    </Row>
  );
};

export default HomePage;

