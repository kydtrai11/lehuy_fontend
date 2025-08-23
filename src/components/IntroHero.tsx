'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from '@/styles/IntroHero.module.css';

export default function IntroHero() {
  return (
    <section className={styles.hero}>
      {/* Left: Intro text */}
      <div className={styles.left}>
        <p className={styles.kicker}>Dambody Official</p>
        <h1 className={styles.title}>
          Thời trang cơ bản, <span>chất liệu tốt</span>, giá hợp lý
        </h1>
        <p className={styles.desc}>
          Chúng tôi chọn lọc những mẫu váy, đầm body dễ phối – tập trung vào form dáng,
          chất vải và độ bền. Giao nhanh, đổi trả dễ.
        </p>

        <div className={styles.ctaRow}>

          <Link href="/about" className={styles.primaryBtn}>Về chúng tôi</Link>
        </div>

        <ul className={styles.stats}>
          <li><strong>1K+</strong><span>đơn mỗi tháng</span></li>
          <li><strong>4.8/5</strong><span>đánh giá</span></li>
          <li><strong>7 ngày</strong><span>đổi trả</span></li>
        </ul>
      </div>

      {/* Right: banner + video */}
      <div className={styles.right}>
        {/* Banner ngang nhỏ */}
        <div className={styles.bannerBox}>
          <Image
            src="/images/camket.png"
            alt="Chính sách bán hàng"
            width={800}
            height={200}
            className={styles.bannerImg}
            priority
          />
        </div>

        {/* Clip/video cân đối */}
{/* Clip/video cân đối */}
<div className={styles.videoBox}>
  <video
    className={styles.video}
    src="/images/abc.mp4"
 
    autoPlay
    muted
    loop
    playsInline
  />
</div>

      </div>
    </section>
  );
}
