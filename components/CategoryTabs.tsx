'use client';

import { Category, CATEGORIES } from '@/types';

interface CategoryTabsProps {
  active: Category;
  onChange: (category: Category) => void;
}

export function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <div className="flex gap-7 px-6 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
      {CATEGORIES.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`whitespace-nowrap text-sm font-medium pb-3 border-b-2 transition-all duration-200 ${
            active === id
              ? 'text-white border-white'
              : 'text-gray-500 border-transparent hover:text-gray-300'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
