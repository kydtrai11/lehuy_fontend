'use client';

import Link from 'next/link';
import styles from '@/styles/QuickActionMenu.module.css';
import { FaBoxOpen, FaInfoCircle, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa';

const actions = [
  { icon: <FaBoxOpen />, label: 'Sản phẩm', href: '/' },           // về trang chủ
  { icon: <FaInfoCircle />, label: 'Giới thiệu', href: '/about' }, // trang giới thiệu
  { icon: <FaMapMarkerAlt />, label: 'Địa chỉ', href: '/addresses' },
  { icon: <FaPhoneAlt />, label: 'Liên hệ', href: '/contact' },
];

export default function QuickActionMenu() {
  return (
    <div className={styles.menuWrapper}>
      {actions.map((item, index) => (
        <Link
          key={index}
          href={item.href || '#'}
          className={styles.menuItem}
          aria-label={item.label}
        >
          <div className={styles.icon}>{item.icon}</div>
          <div className={styles.label}>{item.label}</div>
        </Link>
      ))}
    </div>
  );
}
