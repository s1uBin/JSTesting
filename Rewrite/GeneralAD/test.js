var body = $response.body;
if (!body) { $done({}); } else {
/*
 * ============================================================
 * Toy-People Ad Cleaner
 * Only remove known ad containers.
 * Do NOT touch toy-Swiper / swiper-slide / img.toy-people.com
 * ============================================================
 */

// 1. Known Toy-People ad blocks
body = body.replace(
    /<div\b[^>]*class\s*=\s*["'][^"']*\blistAD\b[^"']*["'][^>]*>[\s\S]*?<\/div>\s*<\/div>/gi,
    ""
);

body = body.replace(
    /<div\b[^>]*class\s*=\s*["'][^"']*\bfooterAD\b[^"']*["'][^>]*>[\s\S]*?<\/div>\s*<\/div>/gi,
    ""
);

body = body.replace(
    /<div\b[^>]*class\s*=\s*["'][^"']*\bbottomFixedBanner\b[^"']*["'][^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi,
    ""
);

// 2. Known Google GPT containers
body = body.replace(
    /<div\b[^>]*id\s*=\s*["']div-gpt-ad-1548832076097-0["'][^>]*>[\s\S]*?<\/div>/gi,
    ""
);

body = body.replace(
    /<div\b[^>]*id\s*=\s*["']div-gpt-ad-1548832129106-0["'][^>]*>[\s\S]*?<\/div>/gi,
    ""
);

body = body.replace(
    /<div\b[^>]*id\s*=\s*["']div-gpt-ad-1548832180624-0["'][^>]*>[\s\S]*?<\/div>/gi,
    ""
);

body = body.replace(
    /<div\b[^>]*id\s*=\s*["']div-gpt-ad-1609243813618-0["'][^>]*>[\s\S]*?<\/div>/gi,
    ""
);

// 3. Remove GPT display calls for those four slots
body = body.replace(
    /googletag\.display\s* \s*;?/gi,
    ""
);

body = body.replace(
    /googletag\.display\s* \s*;?/gi,
    ""
);

body = body.replace(
    /googletag\.display\s* \s*;?/gi,
    ""
);

body = body.replace(
    /googletag\.display\s* \s*;?/gi,
    ""
);

$done({
    body: body
});
}
