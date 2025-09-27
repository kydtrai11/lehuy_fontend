'use client';

import { useEffect, useMemo, useState } from 'react';
import axios, { AxiosError } from 'axios';
import styles from '@/styles/ProductForm.module.css';
import CategoryTreeSelect from '@/components/CategoryTreeSelect';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';

// ✅ Markdown editor
const MdEditor = dynamic(() => import('react-markdown-editor-lite'), { ssr: false });
import 'react-markdown-editor-lite/lib/index.css';

interface Variant {
  color: string;
  size: string;
  price: number;
  stock: number;
  material?: string;
  description?: string;
  status?: string;
  image?: File | string | null;
}

interface Product {
  _id?: string;
  name: string;
  price: number;
  image: string;
  images?: string[];
  description: string;
  material: string;
  colors: string;
  sizes: string;
  category: string;
  status: string;
  variants?: Variant[];
  isHot?: boolean;
  isNew?: boolean;
}

interface Props {
  onCreated: () => void;
  editingProduct?: Product | null;
  onUpdated?: () => void;
}

interface Category {
  _id: string;
  name: string;
  parent?: Category | null | string;
}

export default function ProductForm({ onCreated, editingProduct, onUpdated }: Props) {
  const [form, setForm] = useState<Omit<Product, '_id' | 'image' | 'variants'>>({
    name: '',
    price: 0,
    description: '',
    material: '',
    colors: '',
    sizes: '',
    category: '',
    status: 'Còn hàng',
    isHot: false,
    isNew: false,
  });

  const [variants, setVariants] = useState<Variant[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catPath, setCatPath] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // ====== Load danh mục ======
  useEffect(() => {
    axios
      .get(`${API_URL}/api/categories`)
      .then((res) => setCategories(res.data))
      .catch((err) => {
        console.error('Lỗi khi tải danh mục:', err);
        alert('Không thể tải danh mục sản phẩm');
      });
  }, [API_URL]);

  // ====== Load khi sửa ======
  useEffect(() => {
    if (editingProduct) {
      setForm({
        name: editingProduct.name,
        price: editingProduct.price,
        description: editingProduct.description,
        material: editingProduct.material,
        colors: editingProduct.colors,
        sizes: editingProduct.sizes,
        category: editingProduct.category,
        status: editingProduct.status,
        isHot: !!editingProduct.isHot,
        isNew: !!editingProduct.isNew,
      });
      setVariants(editingProduct.variants || []);
      setImages([]);
    }
  }, [editingProduct]);

  const previewURLs = useMemo(
    () => images.map((f) => URL.createObjectURL(f)),
    [images]
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value,
    }));
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: checked }));
  };

  // Generate variants
  const generateVariants = () => {
    const colors = form.colors.split(',').map((c) => c.trim()).filter(Boolean);
    const sizes = form.sizes.split(',').map((s) => s.trim()).filter(Boolean);
    const base = [...variants];

    colors.forEach((color) => {
      sizes.forEach((size) => {
        const exists = base.find((v) => v.color === color && v.size === size);
        if (!exists) base.push({ color, size, price: 0, stock: 0 });
      });
    });

    setVariants(base);
  };

  const removeVariant = (idx: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProduct && images.length === 0) return alert('Vui lòng chọn ảnh');

    try {
      setSubmitting(true);
      const formData = new FormData();

      (['name', 'price', 'description', 'material', 'colors', 'sizes', 'category', 'status'] as const).forEach((k) => {
        formData.append(k, String(form[k]));
      });

      formData.append('isHot', String(!!form.isHot));
      formData.append('isNew', String(!!form.isNew));

      images.forEach((file) => formData.append('images', file));

      formData.append(
        'variants',
        JSON.stringify(
          variants.map((v) => {
            if (v.image instanceof File) {
              return { ...v, image: undefined };
            }
            return v;
          })
        )
      );

      variants.forEach((v, idx) => {
        if (v.image instanceof File) {
          formData.append(`variantImages_${idx}`, v.image);
        }
      });

      const apiUrl = `${API_URL}/api/products`;
      if (editingProduct) {
        await axios.put(`${apiUrl}/${editingProduct._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('✅ Cập nhật sản phẩm thành công');
        onUpdated?.();
      } else {
        await axios.post(apiUrl, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('✅ Thêm sản phẩm thành công');
        onCreated();
      }

      setForm({
        name: '',
        price: 0,
        description: '',
        material: '',
        colors: '',
        sizes: '',
        category: '',
        status: 'Còn hàng',
        isHot: false,
        isNew: false,
      });
      setImages([]);
      setVariants([]);
      setCatPath('');
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      alert(`❌ Lỗi khi lưu sản phẩm: ${err.response?.data?.message || 'Không xác định'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {/* Header */}
      <div className={styles.sectionHeader}>
        <h3>Thông tin sản phẩm</h3>
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {/* Tên */}
        <div className={styles.field}>
          <label>Tên sản phẩm</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Ví dụ: Áo thun oversize…"
            required
          />
        </div>

        {/* Giá */}
        <div className={styles.field}>
          <label>Giá (VNĐ)</label>
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            placeholder="0"
            min={0}
            required
          />
        </div>

        {/* Ảnh */}
        <div className={styles.field}>
          <label>Ảnh sản phẩm (chọn nhiều)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setImages(e.target.files ? Array.from(e.target.files) : [])}
          />
          {previewURLs.length > 0 && (
            <div className={styles.previewList}>
              {previewURLs.map((url, idx) =>
                url && url.trim() ? (
                  <img
                    key={idx}
                    className={styles.preview}
                    src={url}
                    alt={`preview-${idx}`}
                  />
                ) : (
                  <img
                    key={idx}
                    className={styles.preview}
                    src="/default-image.jpg"
                    alt="no-preview"
                  />
                )
              )}
            </div>
          )}
        </div>

        {/* Chất liệu */}
        <div className={styles.field}>
          <label>Chất liệu</label>
          <input
            name="material"
            value={form.material}
            onChange={handleChange}
            placeholder="Cotton, da PU…"
          />
        </div>

        {/* Màu sắc */}
        <div className={styles.field}>
          <label>Màu sắc <span className={styles.hint}>(cách nhau bằng dấu phẩy)</span></label>
          <input
            name="colors"
            value={form.colors}
            onChange={handleChange}
            placeholder="Đen, Trắng, Xanh…"
          />
        </div>

        {/* Size */}
        <div className={styles.field}>
          <label>Size <span className={styles.hint}>(cách nhau bằng dấu phẩy)</span></label>
          <input
            name="sizes"
            value={form.sizes}
            onChange={handleChange}
            placeholder="S, M, L, XL…"
          />
        </div>

        {/* Danh mục */}
        <div className={styles.field}>
          <label>Danh mục</label>
          <CategoryTreeSelect
            value={form.category}
            onChange={(id, path) => {
              if (id !== form.category) {
                setForm((p) => ({ ...p, category: id }));
                setCatPath(path);
              }
            }}
          />
          {!!catPath && <div className={styles.catPath}>Đã chọn: {catPath}</div>}
        </div>

        {/* Trạng thái */}
        <div className={styles.field}>
          <label>Trạng thái</label>
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="Còn hàng">Còn hàng</option>
            <option value="Hết hàng">Hết hàng</option>
          </select>
        </div>

        {/* Checkbox hot/new */}
        <div className={styles.checkbox}>
          <label>
            <input
              type="checkbox"
              name="isHot"
              checked={!!form.isHot}
              onChange={handleCheckbox}
            />
            Hiển thị trong “Sản phẩm hot”
          </label>
        </div>

        <div className={styles.checkbox}>
          <label>
            <input
              type="checkbox"
              name="isNew"
              checked={!!form.isNew}
              onChange={handleCheckbox}
            />
            Hiển thị trong “Hàng mới về”
          </label>
        </div>
      </div>

      {/* ✅ Markdown Editor */}
      <div className={styles.fieldFull}>
        <label>Mô tả sản phẩm</label>
        <MdEditor
          value={form.description}
          style={{ height: '300px' }}
          renderHTML={(text: string) => (
            <ReactMarkdown
              components={{
                img: ({ node, ...props }) =>
                  props.src && props.src.trim() ? (
                    <img {...props} alt={props.alt || 'ảnh'} />
                  ) : null,
              }}
            >
              {text}
            </ReactMarkdown>
          )}
          onChange={({ text }: { text: string }) =>
            setForm((prev) => ({ ...prev, description: text }))
          }
          onImageUpload={async (file: File) => {
            const formData = new FormData();
            formData.append('image', file);
            try {
              const res = await axios.post(`${API_URL}/api/upload/description`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
              });

              const relative =
                res.data?.url ||
                res.data?.path ||
                (res.data?.filename ? `/uploads/description/${res.data.filename}` : '');

              if (!relative) throw new Error('❌ Không tìm thấy đường dẫn ảnh trong response');

              // ✅ luôn build URL tuyệt đối
              const fullUrl = relative.startsWith('http')
                ? relative
                : `${API_URL}${relative}`;

              return `![ảnh mô tả](${fullUrl})`;
            } catch (err) {
              alert('❌ Upload ảnh thất bại');
              return Promise.reject(err);
            }
          }}
        />
        <p className={styles.hint}>
          Bạn có thể dùng Markdown: <code>**đậm**</code>, <code>![ảnh](url)</code> ...
        </p>
      </div>

      {/* Biến thể */}
      <div className={styles.sectionHeader}>
        <h3>Biến thể (Màu × Size)</h3>
        <button className={styles.ghostBtn} type="button" onClick={generateVariants}>
          🔄 Tạo nhanh từ Màu & Size
        </button>
        <button
          className={styles.ghostBtn}
          type="button"
          onClick={() => {
            if (variants.length === 0) return;
            const base = variants[0];
            setVariants((prev) =>
              prev.map((v, idx) =>
                idx === 0
                  ? v
                  : {
                    ...v,
                    price: base.price,
                    stock: base.stock,
                    description: base.description,
                    status: base.status,
                  }
              )
            );
          }}
        >
          📌 Đồng bộ theo biến thể đầu tiên
        </button>
      </div>

      <div className={styles.variants}>
        {variants.length === 0 && <div className={styles.note}>Chưa có biến thể.</div>}
        {variants.map((v, idx) => (
          <div className={styles.variantRow} key={`variant-${idx}`}>
            <div className={styles.cellSm}>
              <label>Màu</label>
              <input
                value={v.color}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setVariants((prev) => {
                    const newVariants = [...prev];
                    newVariants[idx] = { ...newVariants[idx], color: newValue };
                    return newVariants;
                  });
                }}
              />
            </div>

            <div className={styles.cellSm}>
              <label>Size</label>
              <input
                value={v.size}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setVariants((prev) => {
                    const newVariants = [...prev];
                    newVariants[idx] = { ...newVariants[idx], size: newValue };
                    return newVariants;
                  });
                }}
              />
            </div>

            <div className={styles.cellMd}>
              <label>Giá</label>
              <input
                type="number"
                value={v.price}
                onChange={(e) => {
                  const newValue = Number(e.target.value);
                  setVariants((prev) => {
                    const newVariants = [...prev];
                    newVariants[idx] = { ...newVariants[idx], price: newValue };
                    return newVariants;
                  });
                }}
              />
            </div>

            <div className={styles.cellMd}>
              <label>Kho</label>
              <input
                type="number"
                value={v.stock}
                onChange={(e) => {
                  const newValue = Number(e.target.value);
                  setVariants((prev) => {
                    const newVariants = [...prev];
                    newVariants[idx] = { ...newVariants[idx], stock: newValue };
                    return newVariants;
                  });
                }}
              />
            </div>

            <div className={styles.cellLg}>
              <label>Mô tả</label>
              <input
                value={v.description || ''}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setVariants((prev) => {
                    const newVariants = [...prev];
                    newVariants[idx] = { ...newVariants[idx], description: newValue };
                    return newVariants;
                  });
                }}
              />
            </div>

            <div className={styles.cellLg}>
              <label>Trạng thái</label>
              <input
                value={v.status || ''}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setVariants((prev) => {
                    const newVariants = [...prev];
                    newVariants[idx] = { ...newVariants[idx], status: newValue };
                    return newVariants;
                  });
                }}
              />
            </div>

            <div className={styles.cellLg}>
              <label>Ảnh biến thể</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const newFile = e.target.files?.[0] || null;
                  setVariants((prev) => {
                    const newVariants = [...prev];
                    newVariants[idx] = { ...newVariants[idx], image: newFile };
                    return newVariants;
                  });
                }}
              />
            </div>

            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => removeVariant(idx)}
            >
              ❌
            </button>
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className={styles.submitBar}>
        <button className={styles.submitBtn} type="submit" disabled={submitting}>
          {submitting ? 'Đang lưu…' : editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
        </button>
      </div>
    </form>
  );
}
