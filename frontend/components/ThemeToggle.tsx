import React from 'react';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import { useHubTheme } from '../context/ThemeContext';

type ThemeToggleProps = {
  /** Стиль как у кнопок в тёмной шапке сайта */
  variant?: 'header' | 'inline';
};

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'inline'
}) => {
  const { theme, toggleTheme } = useHubTheme();
  const isDark = theme === 'dark';

  const headerStyle: React.CSSProperties =
    variant === 'header'
      ? {
          borderRadius: 999,
          borderColor: 'rgba(248,250,252,0.3)',
          background: 'rgba(15,23,42,0.35)',
          color: '#e5e7eb'
        }
      : {};

  return (
    <Tooltip title={isDark ? 'Светлая тема' : 'Тёмная тема'}>
      <Button
        type="default"
        shape="round"
        icon={isDark ? <SunOutlined /> : <MoonOutlined />}
        aria-label={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
        onClick={toggleTheme}
        style={
          variant === 'header'
            ? headerStyle
            : { borderRadius: 999, display: 'inline-flex', alignItems: 'center' }
        }
      />
    </Tooltip>
  );
};
