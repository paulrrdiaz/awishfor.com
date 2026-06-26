export const HTML_WITH_JSON_LD = `<!DOCTYPE html>
<html>
<head>
  <title>Fancy Mug - Shop Store</title>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Fancy Mug",
    "image": "https://cdn.example.com/mug.jpg",
    "offers": {
      "@type": "Offer",
      "price": "24.99",
      "priceCurrency": "USD"
    }
  }
  </script>
  <meta property="og:title" content="OG Mug Title" />
  <meta property="og:image" content="https://cdn.example.com/og-mug.jpg" />
  <meta property="og:site_name" content="OG Store" />
</head>
<body><h1>Fancy Mug</h1></body>
</html>`;

export const HTML_WITH_OG_ONLY = `<!DOCTYPE html>
<html>
<head>
  <title>Blue Sneakers</title>
  <meta property="og:title" content="Blue Sneakers" />
  <meta property="og:image" content="https://cdn.example.com/sneakers.jpg" />
  <meta property="og:site_name" content="Sneaker Store" />
</head>
<body></body>
</html>`;

export const HTML_WITH_TWITTER_ONLY = `<!DOCTYPE html>
<html>
<head>
  <title>Red Hat</title>
  <meta name="twitter:title" content="Red Hat" />
  <meta name="twitter:image" content="https://cdn.example.com/hat.jpg" />
</head>
<body></body>
</html>`;

export const HTML_WITH_TITLE_ONLY = `<!DOCTYPE html>
<html>
<head>
  <title>Cool Gadget</title>
</head>
<body></body>
</html>`;

export const HTML_EMPTY = `<!DOCTYPE html>
<html><head></head><body></body>
</html>`;

export const HTML_WITH_JSON_LD_GRAPH = `<!DOCTYPE html>
<html>
<head>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "name": "Shop Page" },
      {
        "@type": "Product",
        "name": "Graph Widget",
        "image": { "@type": "ImageObject", "url": "https://cdn.example.com/widget.jpg" },
        "offers": { "@type": "Offer", "price": "9.99", "priceCurrency": "EUR" }
      }
    ]
  }
  </script>
</head>
<body></body>
</html>`;

export const HTML_WITH_MIXED_META_ORDER = `<!DOCTYPE html>
<html>
<head>
  <meta content="Reversed Attrs Product" property="og:title" />
  <meta content="https://cdn.example.com/rev.jpg" property="og:image" />
</head>
<body></body>
</html>`;
