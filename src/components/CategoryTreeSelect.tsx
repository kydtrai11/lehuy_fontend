'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Category {
  _id: string;
  name: string;
  parent?: string | null;
  children?: Category[];
  path?: string;
}

interface Props {
  value: string;
  onChange: (categoryId: string, categoryPath: string) => void;
}

export default function CategoryTreeSelect({ value, onChange }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await axios.get<Category[]>('/api/categories');
        setCategories(buildCategoryTree(res.data));
      } catch (err) {
        console.error('Lỗi khi tải danh mục:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Tạo cây + gắn path cho từng category
  const buildCategoryTree = (flat: Category[]): Category[] => {
    const map = new Map<string, Category>();
    const roots: Category[] = [];

    flat.forEach(cat => {
      map.set(cat._id, { ...cat, children: [] });
    });

    flat.forEach(cat => {
      const node = map.get(cat._id)!;
      if (!cat.parent) {
        node.path = node.name;
        roots.push(node);
      } else {
        const parent = map.get(cat.parent);
        if (parent) {
          node.path = parent.path ? `${parent.path} > ${node.name}` : node.name;
          parent.children!.push(node);
        }
      }
    });

    return roots;
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const renderCategory = (cat: Category, level = 0) => {
    const hasChildren = cat.children && cat.children.length > 0;
    const isExpanded = expanded.has(cat._id);

    return (
      <div key={cat._id} style={{ marginLeft: level * 20 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '6px 4px',
            cursor: 'pointer',
            background: value === cat._id ? '#333' : 'transparent',
            borderRadius: 4,
            marginBottom: 2,
          }}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(cat._id);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#999',
                padding: '0 6px',
                cursor: 'pointer',
              }}
            >
              {isExpanded ? '▼' : '►'}
            </button>
          )}

          <div
            onClick={() => onChange(cat._id, cat.path || cat.name)}
            style={{
              flex: 1,
              padding: '4px 8px',
              color: value === cat._id ? '#fff' : '#ccc',
            }}
          >
            {cat.name}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>{cat.children!.map(child => renderCategory(child, level + 1))}</div>
        )}
      </div>
    );
  };

  if (loading) {
    return <div style={{ padding: 8, color: '#999' }}>Đang tải danh mục...</div>;
  }

  return (
    <div
      style={{
        maxHeight: 300,
        overflowY: 'auto',
        background: '#2a2a2a',
        borderRadius: 4,
        border: '1px solid #333',
      }}
    >
      {categories.map(cat => renderCategory(cat))}
    </div>
  );
}
