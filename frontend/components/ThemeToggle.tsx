import React from 'react';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import { useHubTheme } from '../context/ThemeContext';

type ThemeToggleProps = {
  /** Стиль как у кнопок в тёмной шапке сайта */
  variant?: 'header' | 'inline';
  className?: string;
};

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'inline',
  className
}) => {
  const { theme, toggleTheme } = useHubTheme();
  const isDark = theme === 'dark';

  const btnClass =
    [variant === 'header' ? 'ai-header__theme-btn' : '', className ?? '']
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <Tooltip title={isDark ? 'Светлая тема' : 'Тёмная тема'}>
      <Button
        type="default"
        shape="round"
        className={btnClass}
        icon={isDark ? <SunOutlined /> : <MoonOutlined />}
        aria-label={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
        onClick={toggleTheme}
        style={
          variant === 'header'
            ? { borderRadius: 999 }
            : {
                borderRadius: 999,
                display: 'inline-flex',
                alignItems: 'center'
              }
        }
      />
    </Tooltip>
  );
};
