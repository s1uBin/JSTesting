var url = $request.url;
var status = $response.status;
var body = $response.body;

console.log("=== TOY TEST ===");
console.log("URL: " + url);
console.log("STATUS: " + status);
console.log("BODY LENGTH: " + (body ? body.length : 0));

if (body) {
    console.log("listAD: " + (body.indexOf("listAD") >= 0));
    console.log("footerAD: " + (body.indexOf("footerAD") >= 0));
    console.log("bottomFixedBanner: " + (body.indexOf("bottomFixedBanner") >= 0));
    console.log("GPT: " + (body.indexOf("div-gpt-ad-") >= 0));
    console.log("SWIPER: " + (body.indexOf("toy-Swiper") >= 0));
}

console.log("=== END ===");

$done({});
