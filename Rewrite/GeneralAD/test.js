var body = $response.body;
if (!body) { $done({}); } else {
var css =
    '<style id="loon-toy-ad-clean">' +
    '.listAD { display:none !important; }' +
    '.footerAD { display:none !important; }' +
    '.bottomFixedBanner { display:none !important; }' +
    '</style>';

body = body.replace(
    /<\/head>/i,
    css + '</head>'
);

$done({
    body: body
});
}
