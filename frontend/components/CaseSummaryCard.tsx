import React from 'react';
import Link from 'next/link';
import { Button, Card, Popconfirm, Space, Typography } from 'antd';
import { Label } from 'semantic-ui-react';
import { Case } from '../types';
import { excerptFromHtml, htmlToPlainText } from '../utils/caseExcerpt';

const { Title, Paragraph, Text } = Typography;

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
      style={{
        borderRadius: 12,
        borderColor: 'var(--border-subtle)',
        background: 'var(--bg-card-soft)',
        boxShadow:
          '0 6px 12px -4px rgba(15,23,42,0.12), 0 2px 4px -2px rgba(15,23,42,0.08)',
        overflow: 'hidden'
      }}
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
              <Label basic color="green" style={{ flexShrink: 0 }}>
                {caseData.role.name}
              </Label>
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
            <Paragraph
              type="secondary"
              style={{
                marginBottom: 0,
                fontSize: 15,
                lineHeight: 1.55
              }}
            >
              {preview}
            </Paragraph>
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
            style={{
              borderLeft: '1px solid var(--border-subtle)',
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 8,
              flexShrink: 0,
              background: 'rgba(15,23,42,0.02)'
            }}
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
