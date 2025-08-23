'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from '@/components/ProductCard';
import { MdOutlineLocalOffer } from 'react-icons/md';
import styles from '@/styles/ProductList.module.css';
import { useSearchParams } from 'next/navigation';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  material: string;
  colors: string;
  sizes: string;
  category: string;
  status: string;
  sold?: number;
  createdAt?: string;
  isHot?: boolean;
  isNew?: boolean;
}

interface Category {
  _id: string;
  name: string;
  parent?: string | null;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<Record<string, string>>({});
  const [activeQuick, setActiveQuick] = useState<'hot' | 'new'>('hot');

  const API = process.env.NEXT_PUBLIC_API_URL

  // ✅ lấy từ khoá: /?search=abc (an toàn với TS)
  const searchParams = useSearchParams();
  const search = (searchParams?.get('search') ?? '').trim();

  useEffect(() => {
    fetchProducts(search);            // ✅ re-fetch khi search đổi
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    fetchCategories();                // categories load 1 lần
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProducts = async (q: string) => {
    try {
      const url = `${API}/api/products${q ? `?search=${encodeURIComponent(q)}` : ''}`;
      const res = await axios.get<Product[]>(url);
      console.log(url);

      setProducts(res.data || []);
    } catch (e) {
      console.error('Lỗi tải sản phẩm:', e);
      setProducts([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get<Category[]>(`${API}/api/categories`);
      setCategories(res.data || []);
    } catch (e) {
      console.error('Lỗi tải danh mục:', e);
      setCategories([]);
    }
  };

  // ====== HOT & NEW (ưu tiên flags, fallback smart) ======
  let hotProducts = products.filter(p => p.isHot).slice(0, 12);
  let newProducts = products.filter(p => p.isNew).slice(0, 12);

  if (hotProducts.length === 0) {
    hotProducts = [...products].sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0)).slice(0, 12);
  }
  if (newProducts.length === 0) {
    newProducts = [...products]
      .sort((a, b) => {
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        return tb - ta;
      })
      .slice(0, 12);
  }

  const parentCategories = categories.filter((cat) => !cat.parent);
  const getChildCategories = (parentId: string) =>
    categories.filter((cat) => cat.parent === parentId);

  const getProductsByCategory = (categoryId: string, parentId: string) => {
    if (categoryId === 'all') {
      const childIds = getChildCategories(parentId).map((cat) => cat._id);
      return products.filter((p) => [parentId, ...childIds].includes(p.category));
    }
    return products.filter((p) => p.category === categoryId);
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className={styles.container}>
      {/* QUICK TAGS */}
      <div className={styles.quickMenu}>
        <div className={styles.tags}>
          <button
            className={`${styles.tag} ${activeQuick === 'hot' ? styles.tagActive : ''}`}
            onClick={() => { setActiveQuick('hot'); scrollTo('hot'); }}
            aria-pressed={activeQuick === 'hot'}
          >
            <MdOutlineLocalOffer /> Sản phẩm hot
          </button>

          <button
            className={`${styles.tag} ${activeQuick === 'new' ? styles.tagActive : ''}`}
            onClick={() => { setActiveQuick('new'); scrollTo('new'); }}
            aria-pressed={activeQuick === 'new'}
          >
            <MdOutlineLocalOffer /> Hàng mới về
          </button>
        </div>
      </div>

      {/* SẢN PHẨM HOT */}
      <section id="hot" className={styles.categorySection}>
        <h3 className={styles.categoryTitle}>Sản phẩm hot</h3>
        <div className={styles.productGrid}>
          {hotProducts.map((p) => (
            <ProductCard key={p._id} product={p} categories={categories} />
          ))}
        </div>
      </section>

      {/* HÀNG MỚI VỀ */}
      <section id="new" className={styles.categorySection}>
        <h3 className={styles.categoryTitle}>Hàng mới về</h3>
        <div className={styles.productGrid}>
          {newProducts.map((p) => (
            <ProductCard key={p._id} product={p} categories={categories} />
          ))}
        </div>
      </section>

      {/* DANH MỤC CHA/CON */}
      {parentCategories.map((parent) => {
        const children = getChildCategories(parent._id);
        const activeChildId = activeTab[parent._id] || 'all';

        return (
          <div key={parent._id} className={styles.categorySection}>
            <h3 className={styles.categoryTitle}>{parent.name}</h3>

            <div className={styles.tabList}>
              <button
                key="all"
                onClick={() => setActiveTab((prev) => ({ ...prev, [parent._id]: 'all' }))}
                className={`${styles.tabButton} ${activeChildId === 'all' ? styles.tabButtonActive : ''}`}
              >
                Tất cả
              </button>

              {children.map((child) => (
                <button
                  key={child._id}
                  onClick={() => setActiveTab((prev) => ({ ...prev, [parent._id]: child._id }))}
                  className={`${styles.tabButton} ${activeChildId === child._id ? styles.tabButtonActive : ''}`}
                >
                  {child.name}
                </button>
              ))}
            </div>

            <div className={styles.productGrid}>
              {getProductsByCategory(activeChildId, parent._id).map((product) => (
                <ProductCard key={product._id} product={product} categories={categories} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
