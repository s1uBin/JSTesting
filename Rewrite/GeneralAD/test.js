var body = $response.body;
if (!body) { $done({}); } else {
// Remove Toy-People ad containers only
body = body.replace(
    /<div[^>]*class=["'][^"']*\blistAD\b[^"']*["'][\s\S]*?<\/div>\s*<\/div>/gi,
    ""
);

body = body.replace(
    /<div[^>]*class=["'][^"']*\bfooterAD\b[^"']*["'][\s\S]*?<\/div>\s*<\/div>/gi,
    ""
);

body = body.replace(
    /<div[^>]*class=["'][^"']*\bbottomFixedBanner\b[^"']*["'][\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi,
    ""
);

// Remove Google GPT ad slots only
body = body.replace(
    /<div[^>]*id=["']div-gpt-ad-1548832076097-0["'][^>]*>[\s\S]*?<\/div>/gi,
    ""
);

body = body.replace(
    /<div[^>]*id=["']div-gpt-ad-1548832129106-0["'][^>]*>[\s\S]*?<\/div>/gi,
    ""
);

body = body.replace(
    /<div[^>]*id=["']div-gpt-ad-1548832180624-0["'][^>]*>[\s\S]*?<\/div>/gi,
    ""
);

body = body.replace(
    /<div[^>]*id=["']div-gpt-ad-1609243813618-0["'][^>]*>[\s\S]*?<\/div>/gi,
    ""
);

$done({
    body: body
});
}
