'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Category {
  _id: string;
  name: string;
  parent?: string | null;
  path?: string;
  children?: Category[];
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
        const res = await axios.get('/api/categories');
        setCategories(buildCategoryTree(res.data));
      } catch (err) {
        console.error('Lỗi khi tải danh mục:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Chuyển đổi danh sách phẳng thành cấu trúc cây
  const buildCategoryTree = (flatCategories: Category[]): Category[] => {
    const categoryMap = new Map<string, Category>();
    const rootCategories: Category[] = [];

    // Tạo map của tất cả các danh mục
    flatCategories.forEach(cat => {
      categoryMap.set(cat._id, { ...cat, children: [] });
    });

    // Xây dựng cấu trúc cây
    flatCategories.forEach(cat => {
      const category = categoryMap.get(cat._id)!;
      if (!cat.parent) {
        rootCategories.push(category);
      } else {
        const parent = categoryMap.get(cat.parent);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(category);
        }
      }
    });

    return rootCategories;
  };

  const toggleExpand = (categoryId: string) => {
    setExpanded(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(categoryId)) {
        newExpanded.delete(categoryId);
      } else {
        newExpanded.add(categoryId);
      }
      return newExpanded;
    });
  };

  const renderCategory = (category: Category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expanded.has(category._id);

    return (
      <div key={category._id} style={{ marginLeft: `${level * 20}px` }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px',
            cursor: 'pointer',
            background: value === category._id ? '#333' : 'transparent',
            borderRadius: '4px',
            marginBottom: '2px'
          }}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(category._id);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#999',
                padding: '0 8px',
                cursor: 'pointer'
              }}
            >
              {isExpanded ? '▼' : '►'}
            </button>
          )}

          <div
            onClick={() => onChange(category._id, category.path || category.name)}
            style={{
              flex: 1,
              padding: '4px 8px',
              color: value === category._id ? '#fff' : '#ccc'
            }}
          >
            {category.name}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {category.children!.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: '8px', color: '#999' }}>
        Đang tải danh mục...
      </div>
    );
  }

  return (
    <div
      style={{
        maxHeight: '300px',
        overflowY: 'auto',
        background: '#2a2a2a',
        borderRadius: '4px',
        border: '1px solid #333'
      }}
    >
      {categories.map(category => renderCategory(category))}
    </div>
  );
}
