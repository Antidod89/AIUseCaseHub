import React from 'react';
import Link from 'next/link';
import { Button, Card, Popconfirm, Space, Tag, Typography } from 'antd';
import { Case } from '../types';
import { excerptFromHtml, htmlToPlainText } from '../utils/caseExcerpt';

const { Title, Text } = Typography;

interface CaseSummaryCardProps {
  caseData: Case;
  showAdminActions?: boolean;
  onEdit?: (c: Case) => void;
  onDelete?: (c: Case) => void | Promise<void>;
}

export const CaseSummaryCard: React.FC<CaseSummaryCardProps> = ({
  caseData,
  showAdminActions,
  onEdit,
  onDelete
}) => {
  const hasSummary =
    !!caseData.summary &&
    htmlToPlainText(caseData.summary).trim().length > 0;
  const preview = hasSummary
    ? excerptFromHtml(caseData.summary ?? '')
    : '';

  return (
    <Card
      bordered
      className="hub-case-summary-card"
      styles={{ body: { padding: 0 } }}
    >
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        <Link
          href={`/cases/${caseData.id}`}
          style={{
            flex: 1,
            padding: 20,
            textDecoration: 'none',
            color: 'inherit',
            minWidth: 0
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 12,
              marginBottom: 8
            }}
          >
            <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
              {caseData.title}
            </Title>
            {caseData.role?.name && (
              <Tag className="hub-case-role-tag" style={{ flexShrink: 0 }}>
                {caseData.role.name}
              </Tag>
            )}
          </div>
          {caseData.author && (
            <Text
              style={{
                display: 'block',
                marginBottom: 8,
                fontSize: 13,
                fontWeight: 600,
                color: '#16a34a'
              }}
            >
              Автор: <span style={{ fontWeight: 700 }}>{caseData.author}</span>
            </Text>
          )}
          {preview ? (
            <span className="hub-case-summary-preview">{preview}</span>
          ) : null}
          <Text
            type="secondary"
            style={{ display: 'block', marginTop: preview ? 12 : 8, fontSize: 13 }}
          >
            Подробнее →
          </Text>
        </Link>

        {showAdminActions && onEdit && onDelete && (
          <div
            className="hub-case-summary-card__admin"
            onClick={(e) => e.preventDefault()}
          >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Button size="small" block onClick={() => onEdit(caseData)}>
                Редактировать
              </Button>
              <Popconfirm
                title="Удалить кейс?"
                description="Эту операцию нельзя будет отменить."
                okText="Да"
                cancelText="Нет"
                onConfirm={() => void onDelete(caseData)}
              >
                <Button size="small" danger block>
                  Удалить
                </Button>
              </Popconfirm>
            </Space>
          </div>
        )}
      </div>
    </Card>
  );
};
