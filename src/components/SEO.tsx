import { useEffect } from "react";

type SEOProps = {
  title: string;
  description?: string;
  canonical?: string;
  jsonLd?: Record<string, any> | Record<string, any>[];
};

const ensureTag = (selector: string, create: () => HTMLElement) => {
  let el = document.head.querySelector(selector) as HTMLElement | null;
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  return el;
};

const SEO = ({ title, description, canonical, jsonLd }: SEOProps) => {
  useEffect(() => {
    document.title = title;

    if (description) {
      const meta = ensureTag('meta[name="description"]', () => {
        const m = document.createElement('meta');
        m.setAttribute('name', 'description');
        return m;
      });
      meta.setAttribute('content', description);
    }

    const url = canonical || `${window.location.origin}${window.location.pathname}`;
    const link = ensureTag('link[rel="canonical"]', () => {
      const l = document.createElement('link');
      l.setAttribute('rel', 'canonical');
      return l;
    }) as HTMLLinkElement;
    link.href = url;

    // Structured data
    // Remove previous injected JSON-LD blocks we created
    document.querySelectorAll('script[data-seo-jsonld="true"]').forEach((n) => n.remove());
    if (jsonLd) {
      const scripts = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      scripts.forEach((obj) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-seo-jsonld', 'true');
        script.text = JSON.stringify(obj);
        document.head.appendChild(script);
      });
    }
  }, [title, description, canonical, JSON.stringify(jsonLd)]);

  return null;
};

export default SEO;
