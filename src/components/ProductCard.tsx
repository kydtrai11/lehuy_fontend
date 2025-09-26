'use client';

import styles from '@/styles/ProductCard.module.css';
import Image from 'next/image';
import Link from 'next/link';

type Variant = { color: string; size: string; price: number; stock: number };

interface Product {
  _id: string;
  image: string;
  images?: string[];
  name: string;
  price?: number;
  sold?: number;
  category?: string;
  variants?: Variant[];
}

interface Category {
  _id: string;
  name: string;
  parent?: string | null;
  children?: Category[];
}

interface Props {
  product?: Product;
  admin?: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
  categories?: Category[];
}

const flattenCategories = (cats: Category[] = []): Category[] => {
  const out: Category[] = [];
  for (const c of cats) {
    out.push(c);
    if (c.children?.length) out.push(...flattenCategories(c.children));
  }
  return out;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

/* ✅ Chuẩn hoá ảnh */
const normalizeImage = (img?: string): string => {
  const s = (img || '').trim();
  if (!s) return '/default-image.jpg';

  if (s.startsWith('http://') || s.startsWith('https://')) return s;

  if (s.startsWith('/uploads') || s.startsWith('uploads/')) {
    return `${API_BASE}${s.startsWith('/') ? s : '/' + s}`;
  }

  return `${API_BASE}/uploads/${s}`;
};

export default function ProductCard({
  product,
  admin,
  onDelete,
  onEdit,
  categories = [],
}: Props) {
  if (!product) return null;

  // ✅ Ưu tiên gallery
  const firstImage =
    product.images && product.images.length > 0 ? product.images[0] : product.image;
  const imageUrl = normalizeImage(firstImage);

  // ✅ Lấy tên danh mục
  const categoryName =
    flattenCategories(categories).find((c) => c._id === product.category)?.name ||
    'Không rõ';

  // ✅ Hiển thị giá (nếu có nhiều variant thì lấy min-max)
  let displayPrice: string;
  if (typeof product.price === 'number') {
    displayPrice = product.price.toLocaleString('vi-VN') + '₫';
  } else if (product.variants?.length) {
    const prices = product.variants.map((v) => v.price).filter((p) => typeof p === 'number');
    if (prices.length > 0) {
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      displayPrice =
        min === max
          ? min.toLocaleString('vi-VN') + '₫'
          : `${min.toLocaleString('vi-VN')}₫ - ${max.toLocaleString('vi-VN')}₫`;
    } else {
      displayPrice = 'Giá chưa cập nhật';
    }
  } else {
    displayPrice = 'Giá chưa cập nhật';
  }

  return (
    <div className={styles.card}>
      <Link href={`/product/${product._id}`} className={styles.link}>
        <div className={styles.imageWrapper}>
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className={styles.image}
            sizes="(max-width: 768px) 100vw, 300px"
          />
        </div>
        <div className={styles.content}>
          <h3 className={styles.name}>{product.name}</h3>
          <p className={styles.category}>Danh mục: {categoryName}</p>
          <div className={styles.priceRow}>
            <span className={styles.price}>{displayPrice}</span>
            {product.sold ? (
              <span className={styles.sold}>Đã bán {product.sold}</span>
            ) : null}
          </div>
        </div>
      </Link>

      {admin && (
        <div className={styles.adminActions}>
          <button
            className={styles.edit}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit?.();
            }}
          >
            ✏️ Sửa
          </button>
          <button
            className={styles.delete}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete?.();
            }}
          >
            🗑️ Xoá
          </button>
        </div>
      )}
    </div>
  );
}
