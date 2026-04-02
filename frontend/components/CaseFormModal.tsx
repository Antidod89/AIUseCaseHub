import React, { useEffect, useState } from 'react';
import { Button, Form, Input, message, Modal, Select } from 'antd';
import { Case, Role } from '../types';
import { createCase, updateCase } from '../services/cases';
import { CaseCard } from './CaseCard';
import { Editor } from './Editor';
import { htmlToPlainText } from '../utils/caseExcerpt';
import { normalizeHtmlFragment } from '../utils/normalizeHtmlFragment';

export interface CaseFormModalProps {
  open: boolean;
  roles: Role[];
  editingCase: Case | null;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}

export const CaseFormModal: React.FC<CaseFormModalProps> = ({
  open,
  roles,
  editingCase,
  onClose,
  onSaved
}) => {
  const [caseForm] = Form.useForm();
  const [caseSummary, setCaseSummary] = useState('');
  const [caseDescription, setCaseDescription] = useState('');
  const [caseEffect, setCaseEffect] = useState('');
  const [caseTechnologiesHtml, setCaseTechnologiesHtml] = useState('');
  const [showCasePreview, setShowCasePreview] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    setShowCasePreview(false);
    if (editingCase) {
      caseForm.setFieldsValue({
        title: editingCase.title,
        roleId: editingCase.role.id,
        author: editingCase.author || ''
      });
      setCaseSummary(editingCase.summary || '');
      setCaseDescription(editingCase.description);
      setCaseEffect(editingCase.effect);
      setCaseTechnologiesHtml(editingCase.technologiesHtml || '');
    } else {
      caseForm.resetFields();
      setCaseSummary('');
      setCaseDescription('');
      setCaseEffect('');
      setCaseTechnologiesHtml('');
    }
  }, [open, editingCase, caseForm]);

  const previewCase: Case | null = (() => {
    const title =
      (caseForm.getFieldValue('title') as string) || editingCase?.title;
    const author =
      (caseForm.getFieldValue('author') as string) ||
      editingCase?.author ||
      undefined;
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
      technologiesHtml:
        caseTechnologiesHtml || editingCase?.technologiesHtml || null,
      role,
      technologies: editingCase?.technologies || [],
      createdAt: editingCase?.createdAt || new Date().toISOString(),
      updatedAt: editingCase?.updatedAt || new Date().toISOString()
    };
  })();

  const handleSubmit = async (values: {
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

      await onSaved();
      onClose();
    } catch (err: unknown) {
      const apiMessage =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Ошибка сохранения кейса';
      message.error(apiMessage);
    }
  };

  return (
    <Modal
      open={open}
      title={editingCase ? 'Редактировать кейс' : 'Создать кейс'}
      onCancel={onClose}
      onOk={() => caseForm.submit()}
      width={800}
      okText="Сохранить"
      cancelText="Отмена"
      destroyOnHidden
      afterClose={() => setShowCasePreview(false)}
    >
      <Form
        layout="vertical"
        form={caseForm}
        onFinish={handleSubmit}
      >
        <div
          style={{
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
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
  );
};
