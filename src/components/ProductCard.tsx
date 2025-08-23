'use client';

import styles from '@/styles/ProductCard.module.css';
import Image from 'next/image';
import Link from 'next/link';

type Variant = { color: string; size: string; price: number; stock: number };

interface Product {
  _id: string;
  image: string;
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

export default function ProductCard({
  product,
  admin,
  onDelete,
  onEdit,
  categories = [],
}: Props) {
  if (!product) return null;

  const base = process.env.NEXT_PUBLIC_API_URL;
  const imageUrl = product.image?.startsWith('http')
    ? product.image
    : product.image
      ? `${base}${product.image.startsWith('/') ? '' : '/'}${product.image}`
      : '/default-image.jpg';

  const categoryName =
    flattenCategories(categories).find((c) => c._id === product.category)?.name || 'Không rõ';

  const displayPrice =
    typeof product.price === 'number' ? product.price : product.variants?.[0]?.price;

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
            <span className={styles.price}>
              {typeof displayPrice === 'number'
                ? displayPrice.toLocaleString('vi-VN') + '₫'
                : 'Giá chưa cập nhật'}
            </span>
            {product.sold && <span className={styles.sold}>Đã bán {product.sold}</span>}
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
