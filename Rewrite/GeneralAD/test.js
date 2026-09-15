var body = $response.body;
if (!body) { $done({}); } else {
var css = `
`;
body = body.replace(/<\/head>/i, css + "</head>");

$done({
    body: body
});
}
#Testing
