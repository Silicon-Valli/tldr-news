'use client';

import { Article } from '@/types';
import { NewsCard } from './NewsCard';

interface SwipeStackProps {
  articles: Article[];
  loading: boolean;
}

export function SwipeStack({ articles, loading }: SwipeStackProps) {
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="w-5 h-5 border-2 border-white/15 border-t-white/60 rounded-full animate-spin" />
        <p className="text-gray-600 text-sm">Summarizing the news...</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-600 text-sm">No stories right now. Try another category.</p>
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-y-scroll snap-y snap-mandatory"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {articles.map((article, i) => (
        <NewsCard
          key={article.id}
          article={article}
          index={i}
          total={articles.length}
        />
      ))}
    </div>
  );
}
