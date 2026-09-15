var body = $response.body;
if (!body) { $done({}); } else {
var css =
    '<style id="loon-toy-ad-clean">' +
    '.listAD,' +
    '.footerAD,' +
    '.bottomFixedBanner' +
    '{display:none!important;}' +
    '</style>';

body = body.replace(
    '</head>',
    css + '</head>'
);

$done({
    body: body
});
}
