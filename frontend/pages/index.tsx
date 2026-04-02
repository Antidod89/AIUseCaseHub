import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Space,
  Typography,
  message
} from 'antd';
import { Case, Role, Technology } from '../types';
import { fetchCases, deleteCase, CasesPage } from '../services/cases';
import { createRole, fetchRoles, updateRole, deleteRole } from '../services/roles';
import {
  createTechnology,
  fetchTechnologies,
  updateTechnology
} from '../services/technologies';
import { Pagination } from '../components/Pagination';
import { CaseFormModal } from '../components/CaseFormModal';
import { CaseSummaryCard } from '../components/CaseSummaryCard';
import { Editor } from '../components/Editor';
import { useAuth } from '../context/AuthContext';

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
  const [caseSearchInput, setCaseSearchInput] = useState('');
  const [caseSearch, setCaseSearch] = useState('');
  const isFirstCaseSearchLayout = useRef(true);
  /** Поиск выполняется по всем ролям; фильтр роли действует только без запроса */
  const casesQueryRoleId = caseSearch ? undefined : roleId;

  const { user } = useAuth();
  const isEditorOrAdmin =
    user && (user.role === 'ADMIN' || user.role === 'EDITOR');

  const [roleForm] = Form.useForm();
  const [techForm] = Form.useForm();

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);

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
    const t = window.setTimeout(() => {
      setCaseSearch(caseSearchInput.trim());
    }, 350);
    return () => window.clearTimeout(t);
  }, [caseSearchInput]);

  useEffect(() => {
    if (isFirstCaseSearchLayout.current) {
      isFirstCaseSearchLayout.current = false;
      return;
    }
    setPage(1);
  }, [caseSearch]);

  useEffect(() => {
    void (async () => {
      const data: CasesPage = await fetchCases({
        page,
        pageSize: PAGE_SIZE,
        roleId: casesQueryRoleId,
        q: caseSearch || undefined
      });
      setCases(data.items);
      setTotal(data.total);
    })();
  }, [page, caseSearch, casesQueryRoleId]);

  const handleDeleteCase = async (c: Case) => {
    try {
      await deleteCase(c.id);
      message.success('Кейс удалён');
      const data: CasesPage = await fetchCases({
        page,
        pageSize: PAGE_SIZE,
        roleId: casesQueryRoleId,
        q: caseSearch || undefined
      });
      if (data.items.length === 0 && page > 1) {
        const newPage = page - 1;
        setPage(newPage);
        const dataPrev: CasesPage = await fetchCases({
          page: newPage,
          pageSize: PAGE_SIZE,
          roleId: casesQueryRoleId,
          q: caseSearch || undefined
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
        await createRole({
          name: values.name,
          description: values.description ?? ''
        });
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
    setIsCaseModalOpen(true);
  };

  const openEditCase = (c: Case) => {
    setEditingCase(c);
    setIsCaseModalOpen(true);
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
                  className={
                    isActive
                      ? 'hub-role-card hub-role-card--active'
                      : 'hub-role-card'
                  }
                  onClick={() => {
                    setRoleId(role.id);
                    setPage(1);
                  }}
                >
                  <div className="hub-role-card__title">{role.name}</div>
                  <div className="hub-role-card__description">
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
        <Row gutter={[16, 16]} align="middle" justify="center">
          <Col xs={24} md={14} lg={10}>
            <Input.Search
              allowClear
              size="middle"
              placeholder="Поиск по кейсам"
              value={caseSearchInput}
              onChange={(e) => setCaseSearchInput(e.target.value)}
            />
          </Col>
          <Col xs={24} md={6} lg={4} style={{ textAlign: 'center' }}>
            {isEditorOrAdmin && (
              <Button type="primary" onClick={openCreateCase}>
                Новый кейс
              </Button>
            )}
          </Col>
        </Row>
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
            {caseSearch
              ? 'По запросу ничего не найдено. Попробуйте другие слова.'
              : roleId
                ? 'В выбранной категории пока нет кейсов.'
                : 'Еще нет ни одного кейса. Coming soon...'}
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

      <CaseFormModal
        open={isCaseModalOpen}
        roles={roles}
        editingCase={editingCase}
        onClose={() => {
          setIsCaseModalOpen(false);
          setEditingCase(null);
        }}
        onSaved={async () => {
          const data: CasesPage = await fetchCases({
            page,
            pageSize: PAGE_SIZE,
            roleId: casesQueryRoleId,
            q: caseSearch || undefined
          });
          setCases(data.items);
          setTotal(data.total);
        }}
      />

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

