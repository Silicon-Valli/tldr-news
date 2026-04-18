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

  const appContent = (
    <main className="h-full flex flex-col bg-[#0a0a0a] overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 pt-12 pb-1">
        <div className="px-6 pb-4 flex items-center justify-between">
          <h1 className="text-base font-bold text-white tracking-tight">TL;DR</h1>
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

  return (
    <>
      {/* Mobile: full screen as before */}
      <div className="md:hidden h-[100dvh]">
        {appContent}
      </div>

      {/* Desktop: phone frame centered on dark background */}
      <div className="hidden md:flex h-screen w-screen items-center justify-center bg-[#111111]"
        style={{ background: 'radial-gradient(ellipse at center, #1a1a1a 0%, #0a0a0a 100%)' }}>

        {/* Left label */}
        <div className="mr-10 text-right">
          <p className="text-white text-3xl font-bold tracking-tight mb-1">TL;DR</p>
          <p className="text-gray-500 text-sm">too long; did read.</p>
        </div>

        {/* Phone frame */}
        <div className="relative flex-shrink-0" style={{ width: '390px', height: '780px' }}>
          {/* Outer shell */}
          <div className="absolute inset-0 rounded-[50px] bg-[#1c1c1e] shadow-2xl"
            style={{ boxShadow: '0 0 0 1.5px #3a3a3c, 0 40px 80px rgba(0,0,0,0.8), 0 0 60px rgba(0,0,0,0.4)' }} />

          {/* Side buttons (decorative) */}
          <div className="absolute -left-[3px] top-[140px] w-[3px] h-8 bg-[#3a3a3c] rounded-l" />
          <div className="absolute -left-[3px] top-[190px] w-[3px] h-14 bg-[#3a3a3c] rounded-l" />
          <div className="absolute -left-[3px] top-[255px] w-[3px] h-14 bg-[#3a3a3c] rounded-l" />
          <div className="absolute -right-[3px] top-[175px] w-[3px] h-20 bg-[#3a3a3c] rounded-r" />

          {/* Screen area */}
          <div className="absolute rounded-[42px] overflow-hidden bg-[#0a0a0a]"
            style={{ inset: '6px' }}>

            {/* Dynamic island */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[120px] h-[34px] bg-black rounded-full z-10" />

            {/* App content — offset for dynamic island */}
            <div className="absolute inset-0 overflow-hidden" style={{ paddingTop: '0px' }}>
              {appContent}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
