var body = $response.body;
if (!body) {
    $done({});
} else {
    // Toy-People 原生廣告 
    body = body.replace(/<div[^>]class=["'][^"']listAD[^"']["'][\s\S]?</div > \s * < /div>/gi, "");
    body = body.replace(/<div[^>]class=["'][^"']footerAD[^"']["'][\s\S]?</div > \s * < /div>/gi, "");
    // 底部浮動廣告 
    body = body.replace(/<div[^>]class=["'][^"']bottomFixedBanner[^"']["'][\s\S]?</div > \s * < /div>\s*</div > /gi, "" );
            // Google GPT 廣告容器 
            body = body.replace(/<div[^>]+id=["']div-gpt-ad-[^"']+["'][\s\S]*?</div > /gi, "" );
                // Google Ads iframe 
                body = body.replace(/<iframe[^>]+id=["']google_ads_iframe_[^"']+["'][\s\S]*?</iframe > /gi, "" );
                    // 再加一層 CSS，防止殘留容器佔位 
                    body = body.replace(/</head > /i, '<style>.listAD,.footerAD,.bottomFixedBanner,[id^="div-gpt-ad-"]{display:none!important;width:0!important;height:0!important;max-height:0!important;overflow:hidden!important}</style > < /head>' );
                        $done({
                            body: body
                        });
                    }
