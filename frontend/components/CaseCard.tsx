import React from 'react';
import { Button, Card, Space, Tag, Typography } from 'antd';
import { Transition } from 'semantic-ui-react';
import { useHubTheme } from '../context/ThemeContext';
import { Case } from '../types';

// Карточка для отображения одного кейса и технологий
const { Title, Paragraph, Text } = Typography;

interface CaseCardProps {
  caseData: Case;
  onEdit?: (c: Case) => void;
}

export const CaseCard: React.FC<CaseCardProps> = ({ caseData, onEdit }) => {
  const { theme } = useHubTheme();
  const makeIframeDoc = (html: string) => {
    const dark = theme === 'dark';
    const baseColor = dark ? '#e2e8f0' : '#0f172a';
    return `<style>
html, body {
  margin: 0;
  padding: 0;
  background: transparent;
  color: ${baseColor};
}
.container, main, section, .content, .wrapper {
  max-width: none !important;
  width: 100% !important;
}
body > * {
  max-width: none !important;
  width: 100% !important;
}
</style>${html}`;
  };

  const handleIframeLoad = (event: React.SyntheticEvent<HTMLIFrameElement>) => {
    try {
      const iframe = event.currentTarget;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;

      const body = doc.body;
      // Пытаемся найти "контейнер" контента, чтобы не тянуть пустой фон ниже
      const mainEl =
        (body.querySelector(
          '.container, main, section, .content, .wrapper'
        ) as HTMLElement | null) || body.firstElementChild;

      let height: number;
      if (mainEl) {
        const rect = (mainEl as HTMLElement).getBoundingClientRect();
        height = rect.bottom + 16; // небольшой отступ
      } else {
        height = doc.documentElement.scrollHeight || body.scrollHeight;
      }

      iframe.style.height = `${Math.max(0, Math.ceil(height))}px`;
    } catch {
      // игнорируем ошибки доступа
    }
  };
  const hasEffect = !!caseData.effect && caseData.effect.trim() !== '';
  const hasTechnologiesHtml =
    !!caseData.technologiesHtml && caseData.technologiesHtml.trim() !== '';
  const hasTechnologiesList =
    Array.isArray(caseData.technologies) && caseData.technologies.length > 0;
  const hasTechnologies = hasTechnologiesHtml || hasTechnologiesList;

  return (
    <Transition animation="fade up" duration={350} visible>
      <Card
        bordered
        className="hub-case-card"
        bodyStyle={{ padding: 24 }}
      >
        <div
          style={{
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: 8
          }}
        >
          <div>
            <Title
              level={3}
              style={{
                marginBottom: 4,
                fontWeight: 700
              }}
            >
              {caseData.title}
            </Title>
            {caseData.author && (
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#16a34a'
                }}
              >
                Автор кейса:{' '}
                <span style={{ fontWeight: 700 }}>{caseData.author}</span>
              </Text>
            )}
          </div>
          <Space align="center" size="middle" wrap style={{ flexShrink: 0 }}>
            {onEdit && (
              <Button type="default" onClick={() => onEdit(caseData)}>
                Редактировать
              </Button>
            )}
            {caseData.role?.name && (
              <Tag className="hub-case-role-tag">{caseData.role.name}</Tag>
            )}
          </Space>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Paragraph
            style={{
              marginBottom: 8,
              fontSize: 16,
              fontWeight: 600
            }}
          >
            Описание
          </Paragraph>
          {caseData.description.includes('<style') ||
          caseData.description.includes('<html') ||
          caseData.description.includes('<body') ? (
            <iframe
              title={`case-description-${caseData.id}`}
              srcDoc={makeIframeDoc(caseData.description)}
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
            <div
              className="rich-html"
              style={{ fontSize: 14, lineHeight: 1.6 }}
              dangerouslySetInnerHTML={{ __html: caseData.description }}
            />
          )}
        </div>

        {hasEffect && (
          <>
            <div style={{ marginBottom: 4 }}>
              <Text
                strong
                style={{
                  display: 'block',
                  marginBottom: 8,
                  fontSize: 16
                }}
              >
                Эффект применения кейса
              </Text>
            </div>
            <div className="hub-case-effect">
              {caseData.effect.includes('<style') ||
              caseData.effect.includes('<html') ||
              caseData.effect.includes('<body') ? (
                <iframe
                  title={`case-effect-${caseData.id}`}
                  srcDoc={makeIframeDoc(caseData.effect)}
                  style={{
                    width: '100%',
                    border: 'none',
                    borderRadius: 6,
                    overflow: 'hidden',
                    background: 'transparent'
                  }}
                  scrolling="no"
                  onLoad={handleIframeLoad}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              ) : (
                <div
                  className="rich-html"
                  style={{ fontSize: 14, lineHeight: 1.6 }}
                  dangerouslySetInnerHTML={{ __html: caseData.effect }}
                />
              )}
            </div>
          </>
        )}

        {hasTechnologies && (
          <div>
            <Text
              strong
              style={{
                display: 'block',
                marginBottom: 8,
                fontSize: 16
              }}
            >
              Используемые технологии
            </Text>
            {hasTechnologiesHtml ? (
              caseData.technologiesHtml?.includes('<style') ||
              caseData.technologiesHtml?.includes('<html') ||
              caseData.technologiesHtml?.includes('<body') ? (
                <iframe
                  title={`case-tech-${caseData.id}`}
                  srcDoc={makeIframeDoc(caseData.technologiesHtml || '')}
                  style={{
                    width: '100%',
                    border: 'none',
                    borderRadius: 6,
                    overflow: 'hidden',
                    background: 'transparent'
                  }}
                  scrolling="no"
                  onLoad={handleIframeLoad}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              ) : (
                <div
                  className="rich-html"
                  style={{ fontSize: 14, lineHeight: 1.6 }}
                  dangerouslySetInnerHTML={{ __html: caseData.technologiesHtml || '' }}
                />
              )
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {caseData.technologies?.map((t) => (
                  <Tag key={t.technology.id} color="blue">
                    {t.technology.name}
                  </Tag>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    </Transition>
  );
};

