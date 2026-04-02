import React from 'react';
import { Pagination as AntPagination } from 'antd';

// Обёртка над компонентом пагинации Ant Design
interface PaginationProps {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  current,
  pageSize,
  total,
  onChange
}) => {
  return (
    <AntPagination
      current={current}
      pageSize={pageSize}
      total={total}
      onChange={onChange}
      showSizeChanger={false}
      style={{ marginTop: 24, textAlign: 'center' }}
    />
  );
};

