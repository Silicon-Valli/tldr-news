'use client';

import { Article } from '@/types';
import { formatDistanceToNow } from 'date-fns';

const CATEGORY_STYLES: Record<string, { dot: string; badge: string }> = {
  world: {
    dot: 'bg-blue-400',
    badge: 'text-blue-300',
  },
  tech: {
    dot: 'bg-violet-400',
    badge: 'text-violet-300',
  },
  business: {
    dot: 'bg-emerald-400',
    badge: 'text-emerald-300',
  },
  politics: {
    dot: 'bg-rose-400',
    badge: 'text-rose-300',
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  world: 'World',
  tech: 'Tech & AI',
  business: 'Business',
  politics: 'Politics',
};

interface NewsCardProps {
  article: Article;
  index: number;
  total: number;
}

export function NewsCard({ article, index, total }: NewsCardProps) {
  const styles = CATEGORY_STYLES[article.category] || CATEGORY_STYLES.world;

  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true });
    } catch {
      return '';
    }
  })();

  return (
    <div className="h-[100dvh] flex flex-col px-6 snap-start snap-always">
      {/* Top meta */}
      <div className="flex items-center justify-between pt-5 pb-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${styles.dot}`} />
          <span className={`text-xs font-semibold tracking-wide uppercase ${styles.badge}`}>
            {CATEGORY_LABELS[article.category] || article.category}
          </span>
        </div>
        <span className="text-xs text-gray-600 font-mono">{index + 1}/{total}</span>
      </div>

      {/* Main content — vertically centered */}
      <div className="flex-1 flex flex-col justify-center gap-6 py-6">
        {/* Source + time */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-400">{article.source}</span>
          {timeAgo && (
            <>
              <span className="text-gray-700">·</span>
              <span className="text-xs text-gray-600">{timeAgo}</span>
            </>
          )}
        </div>

        {/* Headline */}
        <h2 className="text-[1.6rem] font-bold leading-[1.25] text-white tracking-tight">
          {article.title}
        </h2>

        {/* Divider */}
        <div className="w-8 h-px bg-gray-700" />

        {/* TLDR */}
        <p className="text-base text-gray-400 leading-relaxed">
          {article.tldr}
        </p>
      </div>

      {/* Bottom CTA */}
      <div className="flex items-center justify-between pb-10 flex-shrink-0">
        <div className="flex flex-col items-center gap-1 text-gray-700">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M4 9l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[10px]">swipe</span>
        </div>

        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm font-medium text-white bg-white/10 hover:bg-white/15 active:bg-white/20 transition-colors px-4 py-2.5 rounded-full"
        >
          Read full story
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6h7M6 2.5l3.5 3.5L6 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
    </div>
  );
}
