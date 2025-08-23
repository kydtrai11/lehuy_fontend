'use client';

import { Suspense } from 'react';
import IntroHero from '@/components/IntroHero';
import ProductList from '@/components/ProductList';

function HomeContent() {
  return (
    <>
      {/* Phần giới thiệu nằm trên cùng */}
      <IntroHero />

      {/* Danh sách sản phẩm */}
      <ProductList />
    </>
  );
}
1
export default function Home() {
  return (
    <Suspense fallback={<div>Đang tải trang...</div>}>
      <HomeContent />
    </Suspense>
  );
}
