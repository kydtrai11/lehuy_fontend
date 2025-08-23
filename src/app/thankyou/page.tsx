'use client';

import Link from 'next/link';
import styles from './thankyou.module.css';
import { FaCheckCircle } from 'react-icons/fa';

export default function ThankYouPage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <FaCheckCircle className={styles.icon} />
        <h1 className={styles.title}>Cảm ơn bạn!</h1>
        <p className={styles.message}>
          Đơn hàng của bạn đã được ghi nhận.  
          Chúng tôi sẽ liên hệ xác nhận và giao hàng trong thời gian sớm nhất.
        </p>
        <Link href="/" className={styles.homeBtn}>Tiếp tục mua sắm</Link>
      </div>
    </div>
  );
}
