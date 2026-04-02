import dynamic from 'next/dynamic';
import React, { useMemo, useRef, useState } from 'react';
import { Input, Space, Switch, Typography } from 'antd';
import type ReactQuillClass from 'react-quill';

// Динамический импорт редактора Quill (для SSR)
// next/dynamic обрезает ref в типах; у класса react-quill ref нужен для getEditor() в handlers
const ReactQuillRaw = dynamic(() => import('react-quill'), { ssr: false });
const ReactQuill = ReactQuillRaw as unknown as typeof ReactQuillClass;

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Режим только HTML с предпросмотром (без визуального редактора) */
  htmlOnly?: boolean;
  /** Открывать редактор сразу в режиме HTML */
  defaultHtmlMode?: boolean;
}

const { Text } = Typography;

const formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'bullet',
  'link',
  'image',
  'video',
  'code-block',
  'align',
  'color',
  'background'
];

// Обёртка над rich-text редактором
export const Editor: React.FC<EditorProps> = ({
  value,
  onChange,
  placeholder,
  htmlOnly,
  defaultHtmlMode
}) => {
  const quillRef = useRef<any>(null);
  const [htmlMode, setHtmlMode] = useState(!!defaultHtmlMode);

  // Кастомный обработчик вставки изображений (загрузка из файла -> base64)
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'image', 'video'],
          ['code-block'],
          [{ align: [] }],
          [{ color: [] }, { background: [] }],
          ['clean']
        ],
        handlers: {
          image: () => {
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
            input.onchange = () => {
              const file = (input.files && input.files[0]) || null;
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                const quill = quillRef.current?.getEditor?.();
                if (!quill) return;
                const range = quill.getSelection(true);
                quill.insertEmbed(range.index, 'image', reader.result);
                quill.setSelection(range.index + 1);
              };
              reader.readAsDataURL(file);
            };
            input.click();
          }
        }
      }
    }),
    []
  );

  // Режим только HTML: textarea + предпросмотр, без Quill,
  // чтобы разметка не переписывалась самим редактором.
  if (htmlOnly) {
    return (
      <div>
        <Space
          size="small"
          style={{
            marginBottom: 8,
            justifyContent: 'space-between',
            width: '100%'
          }}
        >
          <Text type="secondary">
            HTML-код сохраняется как есть. Ниже показан предпросмотр.
          </Text>
        </Space>

        <Input.TextArea
          autoSize={{ minRows: 8 }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />

        <div
          className="rich-html"
          style={{ marginTop: 8, fontSize: 14, lineHeight: 1.6 }}
          dangerouslySetInnerHTML={{ __html: value }}
        />
      </div>
    );
  }

  const isHtmlPrimary = !!defaultHtmlMode && value.includes('<');
  return (
    <div>
      <Space
        size="small"
        style={{ marginBottom: 8, justifyContent: 'space-between', width: '100%' }}
      >
        <Text type="secondary">
          Можно вставлять изображения, видео и HTML (через режим HTML).
        </Text>
        <Space size="small">
          <Text type="secondary">Режим HTML</Text>
          <Switch
            size="small"
            checked={htmlMode}
            onChange={(checked) => setHtmlMode(checked)}
          />
        </Space>
      </Space>

      {htmlMode ? (
        <Input.TextArea
          autoSize={{ minRows: 8 }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{ minHeight: 150 }}
          modules={modules}
          formats={formats}
        />
      )}
    </div>
  );
};

