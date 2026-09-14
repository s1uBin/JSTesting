/*
 * PD_capture.js — Loon http-request / http-response hook (Puzzle & Dragons)
 * 攔截 api-ios.padsv.gungho.jp/api.php 的所有請求(adv_check / adv_reward / ...)
 * 把 參數 + key + 回應 存入 $persistentStore, 供 PD_claim.js 破解 key / 重放領獎。
 */
(function () {
  'use strict';

  var TAG = 'PD_CAPTURE';
  var HOST = 'padsv.gungho.jp';
  var STORE_KEY = 'PD_SAMPLES_V1';
  var MAX_SAMPLES = 200;

  function log(m) { try { console.log('[' + TAG + '] ' + m); } catch (e) {} }

  // ---- 純JS base64 解碼 (Loon JS 不一定有 atob) ----
  var B64ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  function b64decode(s) {
    s = String(s == null ? '' : s).replace(/[\r\n\s]/g, '');
    var tab = {};
    for (var t = 0; t < B64ABC.length; t++) tab[B64ABC.charAt(t)] = t;
    var out = [];
    var i = 0, n = s.length;
    while (i + 1 < n) {
      var v = tab[s.charAt(i)] << 18;
      v |= tab[s.charAt(i + 1)] << 12;
      if (i + 2 < n) v |= tab[s.charAt(i + 2)] << 6;
      if (i + 3 < n) v |= tab[s.charAt(i + 3)];
      out.push(String.fromCharCode(v >> 16 & 255));
      if (i + 2 < n && s.charAt(i + 2) !== '=') out.push(String.fromCharCode(v >> 8 & 255));
      if (i + 3 < n && s.charAt(i + 3) !== '=') out.push(String.fromCharCode(v & 255));
      i += 4;
    }
    return out.join('');
  }

  // ---- URL 解析 ----
  function parseUrl(url) {
    var out = { url: url, action: null, params: {} };
    try {
      var q = url.indexOf('?');
      if (q >= 0) {
        var pairs = url.slice(q + 1).split('&');
        for (var i = 0; i < pairs.length; i++) {
          if (!pairs[i]) continue;
          var eq = pairs[i].indexOf('=');
          var k = eq === -1 ? pairs[i] : pairs[i].slice(0, eq);
          var v = eq === -1 ? '' : pairs[i].slice(eq + 1);
          try { k = decodeURIComponent(k); } catch (e) {}
          try { v = decodeURIComponent(v); } catch (e) {}
          out.params[k] = v;
        }
      }
      if (out.params['action']) out.action = out.params['action'];
    } catch (e) { log('parseUrl: ' + e); }
    return out;
  }

  function isPdApi(url) {
    return !!(url && url.indexOf(HOST) !== -1 && url.indexOf('api.php') !== -1);
  }

  function getSamples() {
    try {
      var raw = $persistentStore.read(STORE_KEY);
      if (raw) {
        var arr = JSON.parse(raw);
        if (arr && arr.length) return arr;
      }
    } catch (e) { log('getSamples: ' + e); }
    return [];
  }

  function pushSample(obj) {
    try {
      var arr = getSamples();
      arr.unshift(obj);
      if (arr.length > MAX_SAMPLES) arr = arr.slice(0, MAX_SAMPLES);
      $persistentStore.write(JSON.stringify(arr), STORE_KEY);
      log('stored sample, total=' + arr.length);
    } catch (e) { log('pushSample fail: ' + e); }
  }

  function bodyToString(body) {
    try {
      if (body === null || body === undefined) return '';
      if (typeof body === 'string') return body;
      if (typeof body.toString === 'function') return body.toString();
    } catch (e) {}
    return '';
  }

  // ---- 分支: http-request ----
  if (typeof $request !== 'undefined' && $request && $request.url) {
    var u = $request.url;
    if (isPdApi(u)) {
      var p = parseUrl(u);
      pushSample({
        ts: new Date().toISOString(),
        kind: 'req',
        action: p.action,
        url: u,
        params: p.params,
        headers: ($request.headers || {})
      });
      log('captured req action=' + p.action);
    }
    if (typeof $done === 'function') $done();
    return;
  }

  // ---- 分支: http-response ----
  if (typeof $response !== 'undefined' && $response) {
    var u2 = $response.url || (typeof $request !== 'undefined' && $request ? $request.url : null);
    if (isPdApi(u2)) {
      var bodyStr = bodyToString($response.body);
      var decoded = null;
      try {
        var d = b64decode(bodyStr);
        if (d && d.charAt(0) === '{') decoded = d;
      } catch (e) { log('b64decode: ' + e); }
      pushSample({
        ts: new Date().toISOString(),
        kind: 'resp',
        url: u2,
        status: $response.status,
        body: bodyStr.slice(0, 4000),
        decoded: decoded
      });
      log('captured resp status=' + $response.status + ' decoded=' + (decoded ? 'yes' : 'no'));
    }
    if (typeof $done === 'function') $done();
    return;
  }

  // ---- 分支: 手動運行 (清除樣本) ----
  pushSample({ ts: new Date().toISOString(), kind: 'note', action: 'manual-run' });
  if (typeof $done === 'function') $done();
})();
