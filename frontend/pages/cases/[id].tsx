import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button, Spin, Typography } from 'antd';
import { CaseCard } from '../../components/CaseCard';
import { CaseFormModal } from '../../components/CaseFormModal';
import { useAuth } from '../../context/AuthContext';
import { fetchCase } from '../../services/cases';
import { fetchRoles } from '../../services/roles';
import { Case, Role } from '../../types';

const CaseDetailPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const isEditorOrAdmin =
    user && (user.role === 'ADMIN' || user.role === 'EDITOR');
  const idParam = router.query.id;
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [caseModalOpen, setCaseModalOpen] = useState(false);

  useEffect(() => {
    if (!isEditorOrAdmin) {
      return;
    }
    void (async () => {
      const rolesData = await fetchRoles();
      setRoles(rolesData);
    })();
  }, [isEditorOrAdmin]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const id = typeof idParam === 'string' ? Number(idParam) : NaN;
    if (!idParam || Number.isNaN(id) || id < 1) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const data = await fetchCase(id);
        if (cancelled) {
          return;
        }
        setCaseData(data);
        if (!data) {
          setNotFound(true);
        }
      } catch {
        if (!cancelled) {
          setCaseData(null);
          setNotFound(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router.isReady, idParam]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 64 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (notFound || !caseData) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Typography.Title level={4}>Кейс не найден</Typography.Title>
        <Link href="/">
          <Button type="default">← Вернуться к каталогу</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{caseData.title} | AI Use Case Hub</title>
      </Head>
      <div style={{ marginBottom: 20 }}>
        <Link href="/">
          <Button type="default" style={{ fontWeight: 600 }}>
            ← Назад к каталогу
          </Button>
        </Link>
      </div>
      <CaseCard
        caseData={caseData}
        onEdit={isEditorOrAdmin ? () => setCaseModalOpen(true) : undefined}
      />
      {isEditorOrAdmin && (
        <CaseFormModal
          open={caseModalOpen}
          roles={roles}
          editingCase={caseModalOpen ? caseData : null}
          onClose={() => setCaseModalOpen(false)}
          onSaved={async () => {
            const id =
              typeof idParam === 'string' ? Number(idParam) : NaN;
            if (!Number.isNaN(id) && id >= 1) {
              const data = await fetchCase(id);
              setCaseData(data);
            }
          }}
        />
      )}
    </>
  );
};

export default CaseDetailPage;
