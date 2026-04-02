import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button, Spin, Typography } from 'antd';
import { CaseCard } from '../../components/CaseCard';
import { fetchCase } from '../../services/cases';
import { Case } from '../../types';

const CaseDetailPage: React.FC = () => {
  const router = useRouter();
  const idParam = router.query.id;
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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
          <Button type="link">Вернуться к каталогу</Button>
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
        <Link href="/" style={{ fontWeight: 600 }}>
          ← Назад к каталогу
        </Link>
      </div>
      <CaseCard caseData={caseData} />
    </>
  );
};

export default CaseDetailPage;
