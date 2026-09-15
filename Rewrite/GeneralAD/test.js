var url = $request.url;
var status = $response.status;
var body = $response.body;

console.log("=== TOY HOME CHECK ===");
console.log("URL: " + url);
console.log("STATUS: " + status);
console.log("BODY LENGTH: " + (body ? body.length : 0));

if (body && body.length > 1000) {
    console.log("HAS HTML: " + (body.indexOf("<html") >= 0));
    console.log("HAS listAD: " + (body.indexOf("listAD") >= 0));
    console.log("HAS footerAD: " + (body.indexOf("footerAD") >= 0));
    console.log("HAS GPT: " + (body.indexOf("div-gpt-ad-") >= 0));
    console.log("HAS SWIPER: " + (body.indexOf("toy-Swiper") >= 0));
}

console.log("=== END ===");

$done({});
