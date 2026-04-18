'use client';

import { Article } from '@/types';
import { formatDistanceToNow } from 'date-fns';

const CATEGORY_STYLES: Record<string, { dot: string; badge: string }> = {
  world: { dot: 'bg-blue-400', badge: 'text-blue-300' },
  tech: { dot: 'bg-violet-400', badge: 'text-violet-300' },
  business: { dot: 'bg-emerald-400', badge: 'text-emerald-300' },
  politics: { dot: 'bg-rose-400', badge: 'text-rose-300' },
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

  const hasImage = !!article.imageUrl;

  return (
    <div className="h-[100dvh] flex flex-col snap-start snap-always overflow-hidden">

      {/* Image with gradient fade */}
      {hasImage && (
        <div className="relative flex-shrink-0" style={{ height: '26%' }}>
          <img
            src={article.imageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, rgba(10,10,10,0.1) 0%, rgba(10,10,10,0.5) 60%, rgba(10,10,10,1) 100%)',
            }}
          />
        </div>
      )}

      {/* Content area */}
      <div
        className={`flex flex-col px-6 ${hasImage ? '-mt-6 flex-1 min-h-0' : 'flex-1 min-h-0 pt-5'}`}
      >
        {/* Meta row */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${styles.dot}`} />
            <span className={`text-xs font-semibold tracking-wide uppercase ${styles.badge}`}>
              {CATEGORY_LABELS[article.category] || article.category}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{article.source}</span>
            {timeAgo && (
              <>
                <span className="text-gray-700">·</span>
                <span className="text-xs text-gray-600">{timeAgo}</span>
              </>
            )}
            <span className="text-xs text-gray-700 font-mono ml-1">{index + 1}/{total}</span>
          </div>
        </div>

        {/* Scrollable content — button lives inside here so it's always reachable */}
        <div
          className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto"
          style={{ scrollbarWidth: 'none', paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
        >
          {/* Headline */}
          <h2 className="text-[1.45rem] font-bold leading-[1.25] text-white tracking-tight flex-shrink-0">
            {article.title}
          </h2>

          {/* Divider */}
          <div className="w-8 h-px bg-gray-700 flex-shrink-0" />

          {/* TLDR */}
          <p className="text-base text-gray-300 leading-relaxed flex-shrink-0">
            {article.tldr}
          </p>

          {/* Bullets */}
          {article.bullets && article.bullets.length > 0 && (
            <ul className="flex flex-col gap-3 flex-shrink-0">
              {article.bullets.slice(0, 3).map((bullet, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className={`mt-[7px] w-1.5 h-1.5 rounded-full flex-shrink-0 ${styles.dot} opacity-70`} />
                  <span className="text-sm text-gray-400 leading-relaxed">{bullet}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Read full story — inside scroll area, always reachable */}
          <div className="flex items-center justify-between pt-2 flex-shrink-0">
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

            <div className="flex flex-col items-center gap-1 text-gray-700">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M4 9l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[10px]">swipe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
