import React from 'react';
import { Card, Col, Row, Typography } from 'antd';
import Link from 'next/link';
import { ProtectedAdminLayout } from '../../components/ProtectedAdminLayout';

// Дэшборд админ-панели
const { Title, Paragraph } = Typography;

const AdminDashboard: React.FC = () => {
  return (
    <ProtectedAdminLayout>
      <Title level={2}>Админ-панель</Title>
      <Paragraph>Здесь только управление пользователями и их правами.</Paragraph>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} lg={6}>
          <Link href="/admin/users">
            <Card hoverable title="Пользователи">
              Управление пользователями и назначением ролей (ADMIN / EDITOR / USER).
            </Card>
          </Link>
        </Col>
      </Row>
    </ProtectedAdminLayout>
  );
};

export default AdminDashboard;

