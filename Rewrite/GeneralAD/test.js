var body = $response.body;
if (!body) { $done({}); } else {
// 只移除確定是廣告的區塊
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

// 不再刪除 div-gpt-ad
// 不再刪除 iframe
// 不處理 img

$done({
    body: body
});
}
