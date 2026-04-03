import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { unstable_cache } from 'next/cache';

const CATEGORY_MAP: Record<string, { category?: string; q?: string }> = {
  world: { category: 'general' },
  tech: { category: 'technology' },
  business: { category: 'business' },
  politics: { q: 'politics' },
};

async function fetchAndSummarize(category: string) {
  const params = CATEGORY_MAP[category] || { category: 'general' };
  const url = new URL('https://newsapi.org/v2/top-headlines');
  url.searchParams.set('language', 'en');
  url.searchParams.set('pageSize', '12');
  url.searchParams.set('apiKey', process.env.NEWSAPI_KEY!);

  if (params.category) url.searchParams.set('category', params.category);
  if (params.q) url.searchParams.set('q', params.q);

  const newsResponse = await fetch(url.toString());
  const newsData = await newsResponse.json();

  if (!newsData.articles || newsData.articles.length === 0) {
    return [];
  }

  const validArticles = newsData.articles.filter(
    (a: { title: string; url: string }) =>
      a.title && a.title !== '[Removed]' && a.url
  );

  if (validArticles.length === 0) return [];

  // Generate TLDRs with Claude in one batch call
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const articleList = validArticles
    .map(
      (a: { title: string; description?: string }, i: number) =>
        `${i + 1}. Title: "${a.title}"\n   Description: "${a.description || 'No description available'}"`
    )
    .join('\n\n');

  let tldrData: { tldr: string }[] = [];

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `For each news article below, write a TLDR in 1-2 punchy sentences. Be direct and factual — no fluff, no filler. Return ONLY a JSON array like: [{"tldr": "..."}, ...]

Articles:
${articleList}`,
        },
      ],
    });

    const content =
      message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      tldrData = JSON.parse(jsonMatch[0]);
    }
  } catch {
    tldrData = validArticles.map((a: { description?: string; title: string }) => ({
      tldr: a.description || a.title,
    }));
  }

  return validArticles.map(
    (
      a: {
        title: string;
        source?: { name?: string };
        url: string;
        publishedAt: string;
        description?: string;
      },
      i: number
    ) => ({
      id: `${category}-${i}-${a.url.slice(-8)}`,
      title: a.title,
      tldr: tldrData[i]?.tldr || a.description || a.title,
      source: a.source?.name || 'Unknown',
      url: a.url,
      publishedAt: a.publishedAt,
      category,
    })
  );
}

const getCachedNews = (category: string) =>
  unstable_cache(
    () => fetchAndSummarize(category),
    [`news-${category}`],
    { revalidate: 1800 }
  )();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'world';

  try {
    const articles = await getCachedNews(category);
    return NextResponse.json({ articles });
  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}
