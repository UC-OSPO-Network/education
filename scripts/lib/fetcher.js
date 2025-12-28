// Fetch and parse HTML content from URLs

export async function fetchPage(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Fetching: ${url} (attempt ${i + 1}/${retries})`);

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; UC-OSPO-Metadata-Bot/1.0)'
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      return html;
    } catch (error) {
      console.error(`Fetch failed (attempt ${i + 1}): ${error.message}`);

      if (i === retries - 1) {
        throw new Error(`Failed to fetch ${url} after ${retries} attempts: ${error.message}`);
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}

export function extractText(html) {
  // Remove script and style tags
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ')
             .replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"')
             .replace(/&#39;/g, "'");

  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

export function extractMetaTag(html, name) {
  // Try various meta tag formats
  const patterns = [
    new RegExp(`<meta\\s+name=["']${name}["']\\s+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta\\s+content=["']([^"']+)["']\\s+name=["']${name}["']`, 'i'),
    new RegExp(`<meta\\s+property=["']${name}["']\\s+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta\\s+content=["']([^"']+)["']\\s+property=["']${name}["']`, 'i')
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }

  return null;
}

export function extractJSONLD(html) {
  const match = html.match(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/is);
  if (!match) return null;

  try {
    return JSON.parse(match[1]);
  } catch (error) {
    console.error('Failed to parse JSON-LD:', error.message);
    return null;
  }
}

export async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
