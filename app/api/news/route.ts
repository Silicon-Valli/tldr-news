import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { unstable_cache } from 'next/cache';
import Parser from 'rss-parser';

type CustomItem = {
  mediaThumbnail?: { $: { url: string } };
  mediaContent?: { $: { url: string } };
  enclosure?: { url: string };
};

const parser = new Parser<Record<string, never>, CustomItem>({
  customFields: {
    item: [
      ['media:thumbnail', 'mediaThumbnail'],
      ['media:content', 'mediaContent'],
      ['enclosure', 'enclosure'],
    ],
  },
});

const RSS_FEEDS: Record<string, { url: string; source: string }[]> = {
  world: [
    { url: 'http://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC News' },
    { url: 'https://www.theguardian.com/world/rss', source: 'The Guardian' },
  ],
  tech: [
    { url: 'http://feeds.bbci.co.uk/news/technology/rss.xml', source: 'BBC News' },
    { url: 'https://www.theverge.com/rss/index.xml', source: 'The Verge' },
  ],
  business: [
    { url: 'http://feeds.bbci.co.uk/news/business/rss.xml', source: 'BBC News' },
    { url: 'https://www.theguardian.com/business/rss', source: 'The Guardian' },
  ],
  politics: [
    { url: 'http://feeds.bbci.co.uk/news/politics/rss.xml', source: 'BBC News' },
    { url: 'https://feeds.npr.org/1014/rss.xml', source: 'NPR' },
  ],
};

function getImageUrl(item: CustomItem): string | undefined {
  if (item.mediaThumbnail?.$.url) return item.mediaThumbnail.$.url;
  if (item.mediaContent?.$.url) return item.mediaContent.$.url;
  if (item.enclosure?.url && item.enclosure.url.match(/\.(jpg|jpeg|png|webp)/i)) {
    return item.enclosure.url;
  }
  return undefined;
}

async function fetchAndSummarize(category: string) {
  const feeds = RSS_FEEDS[category] || RSS_FEEDS.world;

  const feedResults = await Promise.allSettled(
    feeds.map(f => parser.parseURL(f.url))
  );

  const articles: Array<{
    title: string;
    url: string;
    description: string;
    publishedAt: string;
    imageUrl?: string;
    source: string;
  }> = [];

  feedResults.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      result.value.items.slice(0, 6).forEach(item => {
        if (item.title && item.link) {
          articles.push({
            title: item.title.trim(),
            url: item.link,
            description: item.contentSnippet || item.summary || '',
            publishedAt: item.pubDate || new Date().toISOString(),
            imageUrl: getImageUrl(item as CustomItem),
            source: feeds[i].source,
          });
        }
      });
    } else {
      console.error(`RSS feed failed (${feeds[i].source}):`, result.reason);
    }
  });

  const topArticles = articles.slice(0, 10);
  if (topArticles.length === 0) return [];

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const articleList = topArticles
    .map(
      (a, i) =>
        `${i + 1}. Title: "${a.title}"\n   Description: "${a.description}"`
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
    summaryData = topArticles.map(a => ({
      tldr: a.description || a.title,
      bullets: [],
    }));
  }

  return topArticles.map((a, i) => ({
    id: `${category}-${i}-${Date.now()}`,
    title: a.title,
    tldr: summaryData[i]?.tldr || a.description || a.title,
    bullets: summaryData[i]?.bullets || [],
    source: a.source,
    url: a.url,
    publishedAt: a.publishedAt,
    category,
    imageUrl: a.imageUrl,
  }));
}

const getCachedNews = (category: string) =>
  unstable_cache(
    () => fetchAndSummarize(category),
    [`news-rss-v1-${category}`],
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
