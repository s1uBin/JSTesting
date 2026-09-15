// Toy-People Response Diagnostic // 只讀取，不修改任何 Response
var url = ($request && $request.url) ? $request.url : "NO_REQUEST"; var status = ($response && $response.status) ? $response.status : 0;
var headers = ($response && $response.headers) ? $response.headers : {}; var contentType = headers["Content-Type"]  headers["content-type"]  "";
var encoding = headers["Content-Encoding"]  headers["content-encoding"]  "";
var body = ($response && $response.body) ? $response.body : ""; var bodyLength = body.length;
// 只針對首頁 HTML 做內容偵測 var isHome = /^https://www.toy-people.com/(?:?.*)?$/i.test(url);
var result = [];
if (isHome && body) {
result.push("HOME=YES");

result.push(
    "listAD=" +
    ((body.match(/\blistAD\b/gi) || []).length)
);

result.push(
    "footerAD=" +
    ((body.match(/\bfooterAD\b/gi) || []).length)
);

result.push(
    "bottomFixedBanner=" +
    ((body.match(/\bbottomFixedBanner\b/gi) || []).length)
);

result.push(
    "GPT=" +
    ((body.match(/div-gpt-ad-/gi) || []).length)
);

result.push(
    "Swiper=" +
    ((body.match(/toy-Swiper|swiper-slide/gi) || []).length)
);

result.push(
    "toy-ad.php=" +
    ((body.match(/toy-ad\.php/gi) || []).length)
);
} else { result.push("HOME=NO"); }
$notification.post( "Toy-People TEST", "Status=" + status + "  Body=" + bodyLength, result.join(" | ") );
// ★關鍵：完全不修改 Response $done({});
