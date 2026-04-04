import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { unstable_cache } from 'next/cache';

const GUARDIAN_SECTION_MAP: Record<string, string> = {
  world: 'world',
  tech: 'technology',
  business: 'business',
  politics: 'politics',
};

interface GuardianArticle {
  id: string;
  webTitle: string;
  webUrl: string;
  webPublicationDate: string;
  fields?: {
    trailText?: string;
    thumbnail?: string;
  };
}

async function fetchAndSummarize(category: string) {
  const section = GUARDIAN_SECTION_MAP[category] || 'world';
  const apiKey = process.env.GUARDIAN_API_KEY || 'test';

  const url = new URL('https://content.guardianapis.com/search');
  url.searchParams.set('section', section);
  url.searchParams.set('api-key', apiKey);
  url.searchParams.set('page-size', '10');
  url.searchParams.set('order-by', 'newest');
  url.searchParams.set('show-fields', 'trailText,thumbnail');

  const newsResponse = await fetch(url.toString());
  const newsData = await newsResponse.json();

  if (!newsData.response?.results || newsData.response.results.length === 0) {
    console.error('Guardian API issue:', JSON.stringify(newsData).slice(0, 300));
    return [];
  }

  const articles: GuardianArticle[] = newsData.response.results.filter(
    (a: GuardianArticle) => a.webTitle && a.webUrl
  );

  if (articles.length === 0) return [];

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const articleList = articles
    .map(
      (a, i) =>
        `${i + 1}. Title: "${a.webTitle}"\n   Description: "${a.fields?.trailText || 'No description available'}"`
    )
    .join('\n\n');

  let summaryData: { tldr: string; bullets: string[] }[] = [];

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `For each news article below, write:
1. A TLDR in 1-2 punchy sentences. Direct and factual, no fluff.
2. Exactly 2-3 bullet points. Each should be one tight sentence with a specific fact, number, or "why it matters" angle — the kind of thing you'd drop in a conversation to sound informed.

Return ONLY a JSON array like:
[{"tldr": "...", "bullets": ["...", "...", "..."]}, ...]

Articles:
${articleList}`,
        },
      ],
    });

    const content =
      message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      summaryData = JSON.parse(jsonMatch[0]);
    }
  } catch {
    summaryData = articles.map((a) => ({
      tldr: a.fields?.trailText || a.webTitle,
      bullets: [],
    }));
  }

  return articles.map((a, i) => ({
    id: `${category}-${i}-${a.id.slice(-8)}`,
    title: a.webTitle,
    tldr: summaryData[i]?.tldr || a.fields?.trailText || a.webTitle,
    bullets: summaryData[i]?.bullets || [],
    source: 'The Guardian',
    url: a.webUrl,
    publishedAt: a.webPublicationDate,
    category,
    imageUrl: a.fields?.thumbnail || undefined,
  }));
}

const getCachedNews = (category: string) =>
  unstable_cache(
    () => fetchAndSummarize(category),
    [`news-guardian-v2-${category}`],
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
