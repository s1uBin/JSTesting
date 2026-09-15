var body = $response.body;
if (!body) {
  $done({});
} else {
  body = body.replace(/<div[^>]class=["'][^"']\blistAD\b[^"']["'][\s\S]?</div > \s * < /div>/gi, '');
  $done({
    body: body
  });
}
