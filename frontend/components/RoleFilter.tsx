import React from 'react';
import { Select } from 'antd';
import { Role } from '../types';

// Компонент фильтрации кейсов по роли
interface RoleFilterProps {
  roles: Role[];
  value?: number;
  onChange: (roleId?: number) => void;
}

export const RoleFilter: React.FC<RoleFilterProps> = ({
  roles,
  value,
  onChange
}) => {
  return (
    <Select
      allowClear
      placeholder="Фильтр по роли"
      style={{ width: 240 }}
      value={value}
      onChange={(val) => onChange(val ?? undefined)}
      options={roles.map((role) => ({
        value: role.id,
        label: role.name
      }))}
    />
  );
};

