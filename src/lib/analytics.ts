export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', eventName, params);
  } else {
    // Fallback or dev mode logging
    console.log(`[Analytics Event] ${eventName}`, params);
  }
};
