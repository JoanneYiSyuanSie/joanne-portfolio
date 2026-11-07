/**
 * Lightweight SEO head manager for React 19.
 * Directly manipulates document.title and meta tags.
 * Replaces react-helmet-async which doesn't support React 19.
 */

import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
}

const DEFAULT_TITLE = 'Joanne ｜ Personal Portfolio & Tech Archive';
const DEFAULT_DESC = 'Joanne 的個人作品集與技術筆記庫。聚焦現代前端工程、混合渲染架構與新粗獷主義介面設計。';

function setMeta(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  let el = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attribute, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function useSEO({ title, description, ogTitle, ogDescription, ogType }: SEOProps = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title}｜Joanne's Archive` : DEFAULT_TITLE;
    document.title = fullTitle;

    setMeta('description', description || DEFAULT_DESC);
    setMeta('og:title', ogTitle || title || DEFAULT_TITLE, 'property');
    setMeta('og:description', ogDescription || description || DEFAULT_DESC, 'property');
    if (ogType) setMeta('og:type', ogType, 'property');

    // Cleanup: restore defaults on unmount
    return () => {
      document.title = DEFAULT_TITLE;
      setMeta('description', DEFAULT_DESC);
      setMeta('og:title', DEFAULT_TITLE, 'property');
      setMeta('og:description', DEFAULT_DESC, 'property');
    };
  }, [title, description, ogTitle, ogDescription, ogType]);
}
