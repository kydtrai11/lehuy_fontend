'use client';

import styles from '@/styles/Header.module.css';
import Image from 'next/image';
import { FiShoppingCart } from 'react-icons/fi'; // ❌ bỏ FiUser
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { cart } = useCart();
  const { user, setUser, loading } = useAuth();
  const router = useRouter();

  const [keyword, setKeyword] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const goSearch = () => {
    const q = keyword.trim();
    router.push(q ? `/?search=${encodeURIComponent(q)}` : '/');
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
    router.push('/login');
  };

  return (
    <header className={styles.header}>
      {/* Logo */}
      <div className={styles.logo}>
        <Link href="/">
          <Image src="/images/logo.png" alt="Logo" width={72} height={72} />
        </Link>
      </div>

      {/* Tìm kiếm */}
      <div className={styles.center}>
        <input
          type="text"
          placeholder="Tìm sản phẩm..."
          className={styles.searchInput}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && goSearch()}
        />
        <span
          className={styles.searchLabel}
          role="button"
          tabIndex={0}
          onClick={goSearch}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && goSearch()}
        >
          Tìm kiếm
        </span>
      </div>

      {/* Giỏ hàng + Quản trị */}
      <div className={styles.actions}>
        <Link href="/cart" className={styles.cart}>
          <FiShoppingCart size={28} color="#fff" />
          {mounted && cart.length > 0 && (
            <span className={styles.cartBadge}>{cart.length}</span>
          )}
        </Link>

        {/* ✅ Nút "Quản trị" nếu là admin */}
        {mounted && !loading && user?.role === 'admin' && (
          <Link href="/admin" className={styles.adminButton}>
            Quản trị
          </Link>
        )}
      </div>
    </header>
  );
}
