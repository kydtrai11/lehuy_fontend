// app/about/page.tsx
import styles from './About.module.css';
import Link from 'next/link';

export const metadata = {
  title: 'Giới thiệu | TikTok Shop Clone',
  description: 'Về chúng tôi – sứ mệnh, giá trị và cam kết dịch vụ.',
};

export default function AboutPage() {
  return (
    <div className={styles.wrap}>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.breadcrumbs}>
          <Link href="/">Trang chủ</Link>
          <span className={styles.sep}>/</span>
          <span>Giới thiệu</span>
        </div>

        <h1 className={styles.title}>
          Mua sắm thú vị mỗi ngày<span className={styles.accent}>.</span>
        </h1>
        <p className={styles.subtitle}>
          Chúng tôi xây dựng trải nghiệm mua sắm hiện đại, tốc độ, minh bạch
          với giá tốt và dịch vụ tận tâm.
        </p>

        <div className={styles.heroBadges}>
          <span className={styles.badge}>Hàng chính hãng</span>
          <span className={styles.badge}>Đổi trả dễ</span>
          <span className={styles.badge}>Giao nhanh</span>
          <span className={styles.badge}>Hỗ trợ 24/7</span>
        </div>
      </section>

      {/* STATS */}
      <section className={styles.stats}>
        <div className={styles.statItem}>
          <div className={styles.statValue}>500K+</div>
          <div className={styles.statLabel}>Lượt xem sản phẩm</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>30K+</div>
          <div className={styles.statLabel}>Đơn hàng đã giao</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>4.9/5</div>
          <div className={styles.statLabel}>Điểm hài lòng</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>200+</div>
          <div className={styles.statLabel}>Thương hiệu hợp tác</div>
        </div>
      </section>

      {/* MISSION / VALUES */}
      <section className={styles.grid}>
        <div className={styles.card}>
          <h3>Sứ mệnh</h3>
          <p>
            Mang đến trải nghiệm mua sắm trực quan như TikTok, nơi người dùng
            có thể khám phá, giải trí và mua hàng trong một chạm.
          </p>
        </div>
        <div className={styles.card}>
          <h3>Tầm nhìn</h3>
          <p>
            Trở thành nền tảng thương mại giải trí được yêu thích tại Việt Nam,
            nơi mọi người bán và mua đều cảm thấy vui vẻ.
          </p>
        </div>
        <div className={styles.card}>
          <h3>Giá trị cốt lõi</h3>
          <ul className={styles.list}>
            <li>Minh bạch & chính trực</li>
            <li>Lấy khách hàng làm trung tâm</li>
            <li>Tốc độ & đổi mới liên tục</li>
            <li>Hợp tác cùng phát triển</li>
          </ul>
        </div>
      </section>

      {/* TIMELINE */}
      <section className={styles.timeline}>
        <h2>Hành trình phát triển</h2>
        <div className={styles.line}>
          <div className={styles.point}>
            <span className={styles.pointDot} />
            <div>
              <h4>2023</h4>
              <p>Ra mắt phiên bản beta, thử nghiệm giao diện mua sắm ngắn.</p>
            </div>
          </div>
          <div className={styles.point}>
            <span className={styles.pointDot} />
            <div>
              <h4>2024</h4>
              <p>Kết nối hệ thống thanh toán và vận chuyển toàn quốc.</p>
            </div>
          </div>
          <div className={styles.point}>
            <span className={styles.pointDot} />
            <div>
              <h4>2025</h4>
              <p>Mở rộng danh mục, tối ưu trải nghiệm giống TikTok Shop.</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className={styles.usp}>
        <h2>Vì sao chọn chúng tôi?</h2>
        <div className={styles.uspGrid}>
          <div className={styles.uspItem}>
            <div className={styles.uspIcon}>⚡</div>
            <h4>Nhanh & mượt</h4>
            <p>Tối ưu hiệu năng Next.js, tải sản phẩm tức thì.</p>
          </div>
          <div className={styles.uspItem}>
            <div className={styles.uspIcon}>🛡️</div>
            <h4>Tin cậy</h4>
            <p>Hệ thống đánh giá, kiểm duyệt thương hiệu minh bạch.</p>
          </div>
          <div className={styles.uspItem}>
            <div className={styles.uspIcon}>💬</div>
            <h4>Hỗ trợ tận tâm</h4>
            <p>CSKH đa kênh: chat, email, hotline 24/7.</p>
          </div>
          <div className={styles.uspItem}>
            <div className={styles.uspIcon}>🔁</div>
            <h4>Đổi trả linh hoạt</h4>
            <p>Chính sách hoàn tiền/đổi size trong 7–15 ngày.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaBox}>
          <h3>Sẵn sàng bắt đầu mua sắm?</h3>
          <p>Khám phá sản phẩm hot và ưu đãi hôm nay.</p>
          <Link href="/" className={styles.ctaBtn}>Khám phá ngay</Link>
        </div>
      </section>
    </div>
  );
}
