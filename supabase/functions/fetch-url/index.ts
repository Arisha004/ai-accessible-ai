import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function extractText(html: string): string {
  console.log('Original HTML length:', html.length);
  
  if (!html || typeof html !== 'string') {
    console.log('Invalid HTML input');
    return '';
  }

  // Remove script and style elements completely
  let cleanHtml = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  cleanHtml = cleanHtml.replace(/<style[\s\S]*?<\/style>/gi, "");
  cleanHtml = cleanHtml.replace(/<noscript[\s\S]*?<\/noscript>/gi, "");
  
  // Replace common block elements with spaces to preserve word boundaries
  cleanHtml = cleanHtml.replace(/<\/?(div|p|br|h[1-6]|section|article|header|footer|nav|aside|main|ul|ol|li|blockquote|pre)[^>]*>/gi, ' ');
  
  // Extract alt text from images
  cleanHtml = cleanHtml.replace(/<img[^>]*alt=["']([^"']*)["'][^>]*>/gi, ' $1 ');
  
  // Extract title attributes
  cleanHtml = cleanHtml.replace(/title=["']([^"']*)["']/gi, ' $1 ');
  
  // Remove all remaining HTML tags
  let text = cleanHtml.replace(/<[^>]+>/g, " ");
  
  // Clean up text
  text = text
    .replace(/&[a-zA-Z0-9#]+;/g, ' ') // Remove HTML entities
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();
  
  console.log('Extracted text length:', text.length);
  console.log('First 200 chars:', text.substring(0, 200));
  
  if (text.length < 50) {
    console.log('Warning: Very short text extracted');
  }
  
  return text;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing url' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      redirect: 'follow',
    });
    if (!res.ok) {
      const ct = res.headers.get('content-type') || '';
      const body = ct.includes('application/json') ? await res.json().catch(() => ({})) : await res.text().catch(() => '');
      const reason = typeof body === 'string' ? body.slice(0, 200) : body?.error || JSON.stringify(body).slice(0, 200);
      return new Response(JSON.stringify({ error: `Failed to fetch: ${res.status} ${res.statusText}${reason ? ` - ${reason}` : ''}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const html = await res.text();
    const text = extractText(html);

    return new Response(JSON.stringify({ html, text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in fetch-url function:', error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});