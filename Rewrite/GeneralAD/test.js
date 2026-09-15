// Toy-People Diagnostic v2 // READ ONLY - 不修改任何 Response
var url = ($request && $request.url) ? $request.url : "NO_REQUEST";
var status = ($response && $response.status) ? $response.status : "NO_STATUS";
var headers = ($response && $response.headers) ? $response.headers : {};
var contentType = headers["Content-Type"]  headers["content-type"]  "NO_CONTENT_TYPE";
var encoding = headers["Content-Encoding"]  headers["content-encoding"]  "NO_ENCODING";
var body = ($response && $response.body) ? $response.body : "";
var len = body.length;
console.log("========== TOY PEOPLE DIAGNOSTIC =========="); console.log("URL: " + url); console.log("STATUS: " + status); console.log("CONTENT-TYPE: " + contentType); console.log("CONTENT-ENCODING: " + encoding); console.log("BODY-LENGTH: " + len);
if (body) {
console.log(
    "HAS listAD: " +
    (/\blistAD\b/i.test(body))
);

console.log(
    "HAS footerAD: " +
    (/\bfooterAD\b/i.test(body))
);

console.log(
    "HAS bottomFixedBanner: " +
    (/\bbottomFixedBanner\b/i.test(body))
);

console.log(
    "GPT COUNT: " +
    ((body.match(/div-gpt-ad-/gi) || []).length)
);

console.log(
    "SWIPER COUNT: " +
    ((body.match(/toy-Swiper|swiper-slide/gi) || []).length)
);

console.log(
    "TOY-AD COUNT: " +
    ((body.match(/toy-ad\.php/gi) || []).length)
);

// 顯示 HTML 開頭，確認拿到的是不是首頁
console.log(
    "BODY-START: " +
    body.substring(0, 300).replace(/\s+/g, " ")
);
}
console.log("========== END DIAGNOSTIC ==========");
// 不修改 Response $done({});
