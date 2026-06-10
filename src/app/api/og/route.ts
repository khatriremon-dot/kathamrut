import { NextRequest, NextResponse } from 'next/server';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + '…';
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const title = searchParams.get('title') || 'Kathamrut';
  const author = searchParams.get('author') || '';
  const description = searchParams.get('description') || '';
  const type = searchParams.get('type') || 'novel';
  const language = searchParams.get('language') || 'en';

  const langLabels: Record<string, string> = { en: 'English', hi: 'हिंदी', ne: 'नेपाली' };
  const langLabel = langLabels[language] || language;

  const isNovel = type === 'novel';
  const primaryColor = isNovel ? '#d97706' : '#7c3aed';
  const secondaryColor = isNovel ? '#ea580c' : '#4f46e5';
  const gradientStart = isNovel ? '#fef3c7' : '#f3e8ff';
  const gradientEnd = isNovel ? '#ffedd5' : '#e0e7ff';
  const iconColor = isNovel ? '#b45309' : '#6d28d9';
  const typeLabel = isNovel ? 'Novel' : 'Interactive Adventure';

  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${gradientStart};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${gradientEnd};stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)" rx="0"/>

  <!-- Subtle pattern -->
  <pattern id="dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
    <circle cx="2" cy="2" r="1" fill="${primaryColor}" opacity="0.08"/>
  </pattern>
  <rect width="1200" height="630" fill="url(#dots)"/>

  <!-- Top accent bar -->
  <rect width="1200" height="8" fill="url(#accent)"/>

  <!-- Left accent -->
  <rect x="0" y="0" width="8" height="630" fill="url(#accent)"/>

  <!-- Book/Story icon -->
  <rect x="80" y="200" width="80" height="100" rx="8" fill="${iconColor}" opacity="0.15"/>
  <rect x="90" y="210" width="60" height="80" rx="4" fill="${iconColor}" opacity="0.3"/>
  ${isNovel
    ? `<line x1="105" y1="235" x2="135" y2="235" stroke="white" stroke-width="2.5" stroke-linecap="round" opacity="0.8"/>
       <line x1="105" y1="248" x2="130" y2="248" stroke="white" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>
       <line x1="105" y1="261" x2="128" y2="261" stroke="white" stroke-width="2.5" stroke-linecap="round" opacity="0.4"/>`
    : `<polygon points="120,230 135,245 120,260" fill="white" opacity="0.7"/>`
  }

  <!-- Type badge -->
  <rect x="80" y="320" width="120" height="30" rx="15" fill="${primaryColor}" opacity="0.9"/>
  <text x="140" y="341" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" fill="white" text-anchor="middle">${escapeXml(typeLabel)}</text>

  <!-- Title -->
  <text x="220" y="240" font-family="system-ui, -apple-system, sans-serif" font-size="42" font-weight="800" fill="#1a1a1a" text-anchor="start">
    ${escapeXml(truncate(title, 35))}
  </text>

  ${title.length > 35 ? `<text x="220" y="295" font-family="system-ui, -apple-system, sans-serif" font-size="42" font-weight="800" fill="#1a1a1a" text-anchor="start">${escapeXml(truncate(title.slice(35), 35))}</text>` : ''}

  <!-- Description -->
  <text x="220" y="${title.length > 35 ? 350 : 300}" font-family="system-ui, -apple-system, sans-serif" font-size="20" fill="#555555" text-anchor="start">
    ${escapeXml(truncate(description, 120))}
  </text>

  <!-- Author / Language info -->
  ${author ? `<text x="220" y="${title.length > 35 ? 390 : 340}" font-family="system-ui, -apple-system, sans-serif" font-size="17" fill="#777777" text-anchor="start">by ${escapeXml(truncate(author, 40))}  ·  ${escapeXml(langLabel)}</text>` : ''}

  <!-- Branding -->
  <rect x="0" y="580" width="1200" height="50" fill="${primaryColor}" opacity="0.08"/>
  <text x="80" y="612" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="700" fill="${primaryColor}" text-anchor="start">Kathamrut</text>
  <text x="200" y="612" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#999999" text-anchor="start">Stories Across Languages</text>

  <!-- Decorative corner -->
  <circle cx="1150" cy="60" r="40" fill="${primaryColor}" opacity="0.06"/>
  <circle cx="1130" cy="80" r="25" fill="${secondaryColor}" opacity="0.06"/>
</svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}