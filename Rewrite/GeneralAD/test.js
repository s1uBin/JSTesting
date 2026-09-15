var body = $response.body;

if (!body) {
    $done({});
} else {
    $done({
        body: '{"round":1,"status":"null","data":null}'
    });
}
