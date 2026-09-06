'use client';

import { useEffect } from 'react';
import { getStoredSeoConfig } from '@/lib/contentStore';

export default function SeoScriptInjector() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const config = getStoredSeoConfig();
    if (!config) return;

    // 1. Google Analytics 4 (GA4)
    if (config.ga4MeasurementId && !document.getElementById('ga4-script')) {
      const script1 = document.createElement('script');
      script1.id = 'ga4-script';
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${config.ga4MeasurementId}`;
      document.head.appendChild(script1);

      const script2 = document.createElement('script');
      script2.id = 'ga4-init';
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${config.ga4MeasurementId}', { page_path: window.location.pathname });
      `;
      document.head.appendChild(script2);
    }

    // 2. Google Tag Manager (GTM)
    if (config.gtmContainerId && !document.getElementById('gtm-script')) {
      const gtmScript = document.createElement('script');
      gtmScript.id = 'gtm-script';
      gtmScript.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${config.gtmContainerId}');
      `;
      document.head.appendChild(gtmScript);
    }

    // 3. Microsoft Clarity
    if (config.microsoftClarityId && !document.getElementById('clarity-script')) {
      const clarityScript = document.createElement('script');
      clarityScript.id = 'clarity-script';
      clarityScript.innerHTML = `
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${config.microsoftClarityId}");
      `;
      document.head.appendChild(clarityScript);
    }

    // 4. Meta Verifications
    const metaTags = [
      { name: 'google-site-verification', content: config.googleSearchConsole },
      { name: 'msvalidate.01', content: config.bingVerification },
      { name: 'ahrefs-site-verification', content: config.ahrefsVerification },
    ];

    metaTags.forEach(({ name, content }) => {
      if (content) {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('name', name);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      }
    });
  }, []);

  return null;
}
