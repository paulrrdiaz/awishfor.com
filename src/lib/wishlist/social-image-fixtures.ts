/** Deterministic local raster inputs for social-card JPEG budget tests. */
export const socialImageFixtures = {
	coverPhoto: new TextEncoder().encode(`
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="sky" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#234a68"/><stop offset=".48" stop-color="#d98972"/><stop offset="1" stop-color="#f4d9a8"/></linearGradient>
    <filter id="noise"><feTurbulence baseFrequency=".8" numOctaves="3" seed="17" type="fractalNoise"/><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 .12 0"/></filter>
  </defs>
  <rect width="1200" height="630" fill="url(#sky)"/>
  <rect width="1200" height="630" filter="url(#noise)" opacity=".28"/>
  <circle cx="280" cy="220" r="170" fill="#fff4d2" opacity=".55"/><circle cx="880" cy="380" r="260" fill="#723850" opacity=".35"/>
</svg>`),
	textOnly: new TextEncoder().encode(`
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#fbf7ef"/><rect x="40" y="40" width="250" height="58" rx="29" fill="#6d4e2f"/>
  <text x="68" y="78" fill="#ffffff" font-family="Arial" font-size="30" font-weight="700">A Wish For</text>
  <text x="54" y="470" fill="#6d4e2f" font-family="Arial" font-size="30">WEDDING</text>
  <text x="54" y="548" fill="#271d16" font-family="Arial" font-size="72" font-weight="700">Nuestra celebración</text>
</svg>`),
} as const;
