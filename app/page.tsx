'use client';

import { useState, useEffect, useCallback } from 'react';
import { CategoryTabs } from '@/components/CategoryTabs';
import { SwipeStack } from '@/components/SwipeStack';
import { Article, Category } from '@/types';

export default function Home() {
  const [category, setCategory] = useState<Category>('world');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNews = useCallback((cat: Category) => {
    setLoading(true);
    setArticles([]);

    fetch(`/api/news?category=${cat}`)
      .then((res) => res.json())
      .then((data) => {
        setArticles(data.articles || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadNews(category);
  }, [category, loadNews]);

  return (
    <main className="h-[100dvh] flex flex-col bg-[#0a0a0a] overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 pt-12 pb-1">
        <div className="px-6 pb-4 flex items-center justify-between">
          <h1 className="text-base font-bold text-white tracking-tight">TLDR News</h1>
          <span className="text-[10px] text-gray-600 uppercase tracking-widest font-medium">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
        <CategoryTabs active={category} onChange={setCategory} />
        <div className="h-px bg-white/5 mt-0" />
      </div>

      {/* Swipe feed */}
      <SwipeStack articles={articles} loading={loading} />
    </main>
  );
}
