var body = $response.body;
if (!body) { $done({}); } else {
// 只給 Google 廣告容器加 display:none
body = body.replace(
    /(<div[^>]+id=['"]div-gpt-ad-1548832076097-0['"][^>]*)(>)/i,
    '$1 style="display:none!important"$2'
);

body = body.replace(
    /(<div[^>]+id=['"]div-gpt-ad-1548832129106-0['"][^>]*)(>)/i,
    '$1 style="display:none!important"$2'
);

body = body.replace(
    /(<div[^>]+id=['"]div-gpt-ad-1548832180624-0['"][^>]*)(>)/i,
    '$1 style="display:none!important"$2'
);

body = body.replace(
    /(<div[^>]+id=['"]div-gpt-ad-1609243813618-0['"][^>]*)(>)/i,
    '$1 style="display:none!important"$2'
);

$done({
    body: body
});
}
