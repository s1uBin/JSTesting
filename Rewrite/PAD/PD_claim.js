/*
 * PD_claim.js — Loon 手動運行腳本 (Puzzle & Dragons 免廣告領獎)
 *
 * 功能:
 *  1. 讀取 PD_capture.js 捕獲的樣本 (api.php 請求參數 + key)
 *  2. 在設備上窮舉破解 key 算法 (md5/sha1/sha256/crc32/fnv1a 等)
 *  3. 執行領獎測試:
 *     T0 原樣重放 (原 t + 原 key)
 *     T1 新 t 重放 (保留 key + rid)
 *     T2 新 t + 隨機 rid (保留 key)  ← 測試伺服器是否驗證 rid
 *     T3 全新生成 (新 rid + 新 t + 破解出的 key)  ← 只有 key 破解成功才有
 *  4. 用 $notification 報告所有結果 (res:0 = 成功)
 *
 * 使用: 先在遊戲裡正常看 1 次廣告(自動捕獲樣本), 再回到 Loon 手動運行本腳本。
 */
(function () {
  'use strict';

  var TAG = 'PD_CLAIM';
  var STORE_KEY = 'PD_SAMPLES_V1';
  var ALGO_KEY = 'PD_KEYALGO_V1';

  function log(m) { try { console.log('[' + TAG + '] ' + m); } catch (e) {} }
  function notify(t, s, b) {
    try { if (typeof $notification !== 'undefined' && $notification && $notification.post) $notification.post(t, s || '', b || ''); } catch (e) {}
  }

  // ---------- 哈希工具 ----------
  function digest(name, s) {
    try {
      if (name === 'md5' && typeof md5 === 'function') return md5(s).toLowerCase();
      if (name === 'sha1' && typeof sha1 === 'function') return sha1(s).toLowerCase();
      if (name === 'sha256' && typeof sha256 === 'function') return sha256(s).toLowerCase();
    } catch (e) { log('hash ' + name + ': ' + e); }
    if (name === 'crc32') return '00000000' + crc32(s);
    if (name === 'fnv1a32') return '00000000' + fnv1a32(s);
    return null;
  }
  function crc32(s) {
    var table = crc32.t;
    if (!table) {
      table = crc32.t = [];
      for (var n = 0; n < 256; n++) {
        var c = n;
        for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        table[n] = c >>> 0;
      }
    }
    var crc = 0 ^ (-1);
    for (var i = 0; i < s.length; i++) crc = (crc >>> 8) ^ table[(crc ^ s.charCodeAt(i)) & 0xFF];
    crc = (crc ^ (-1)) >>> 0;
    return ('00000000' + crc.toString(16)).slice(-8);
  }
  function fnv1a32(s) {
    var h = 0x811c9dc5;
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i) & 0xFF;
      h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
    }
    return ('00000000' + h.toString(16)).slice(-8);
  }

  // ---------- 樣本 ----------
  function getSamples() {
    try {
      var raw = $persistentStore.read(STORE_KEY);
      if (raw) { var arr = JSON.parse(raw); if (arr && arr.length) return arr; }
    } catch (e) { log('getSamples: ' + e); }
    return [];
  }

  function findReqSamples() {
    var out = [];
    var samples = getSamples();
    for (var i = 0; i < samples.length; i++) {
      var s = samples[i];
      if (s.kind === 'req' && s.params && s.params.key && s.params.pid) out.push(s);
    }
    return out;
  }

  // ---------- key 破解 ----------
  function paramOrderings(p) {
    var keys = Object.keys(p);
    var skip = { key: 1 };
    var ks = [], vs = [];
    for (var i = 0; i < keys.length; i++) {
      if (skip[keys[i]]) continue;
      ks.push(keys[i]); vs.push(p[keys[i]]);
    }
    var skeys = ks.slice().sort();
    function mapv(arr) { return arr.map(function (k, i) { return k + vs[i]; }).join(''); }
    var o = [];
    o.push(['order-raw', vs.join('')]);
    o.push(['order-name', mapv(ks)]);
    o.push(['sort-kv', mapv(skeys)]);
    o.push(['sort-kv-eq', skeys.map(function (k) { return k + '=' + p[k]; }).join('')]);
    o.push(['order-kv-eq', ks.map(function (k) { return k + '=' + p[k]; }).join('')]);
    o.push(['sort-v', vs.slice().sort().join('')]);
    o.push(['order-amp', vs.join('&')]);
    o.push(['order-amp-kl', ks.map(function (k) { return k + '=' + p[k]; }).join('&')]);
    o.push(['order-amp-vk', ks.map(function (k) { return p[k] + '=' + k; }).join('&')]);
    o.push(['order-vk', ks.map(function (k, i) { return vs[i] + k; }).join('')]);
    return o;
  }

  function matchKey(d, key) {
    if (!d || d.length < 10) return null;
    var k = String(key).toLowerCase();
    if (d.indexOf(k) !== -1) return 'contains';
    if (d.slice(0, 10) === k) return 'head';
    if (d.slice(d.length - 10) === k) return 'tail';
    return null;
  }

  function crackKey(reqs) {
    if (!reqs.length) return null;
    var first = reqs[0].params;
    var hashes = ['md5', 'sha1', 'sha256', 'crc32', 'fnv1a32'];
    var orders = paramOrderings(first);
    for (var oi = 0; oi < orders.length; oi++) {
      for (var hi = 0; hi < hashes.length; hi++) {
        if (!matchKey(digest(hashes[hi], orders[oi][1]), first.key)) continue;
        var allOk = true;
        for (var ri = 1; ri < reqs.length; ri++) {
          var p2 = reqs[ri].params;
          if (!p2.key) continue;
          var o2 = paramOrderings(p2), same = null;
          for (var oi2 = 0; oi2 < o2.length; oi2++) if (o2[oi2][0] === orders[oi][0]) { same = o2[oi2][1]; break; }
          if (same === null || !matchKey(digest(hashes[hi], same), p2.key)) { allOk = false; break; }
        }
        if (allOk) {
          var algo = { ordering: orders[oi][0], hash: hashes[hi], match: 'hit' };
          try { $persistentStore.write(JSON.stringify(algo), ALGO_KEY); } catch (e) {}
          log('KEY ALGO FOUND: ' + JSON.stringify(algo));
          return algo;
        }
      }
    }
    return null;
  }

  function computeKey(algo, params) {
    if (!algo) return null;
    var orders = paramOrderings(params);
    for (var i = 0; i < orders.length; i++) {
      if (orders[i][0] === algo.ordering) return digest(algo.hash, orders[i][1]);
    }
    return null;
  }

  // ---------- 工具 ----------
  function tJST() {
    var d = new Date(Date.now() + 9 * 3600 * 1000);
    function p(n) { return ('0' + n).slice(-2); }
    return String(d.getUTCFullYear()).slice(2) + p(d.getUTCMonth() + 1) + p(d.getUTCDate()) + p(d.getUTCHours()) + p(d.getUTCMinutes()) + p(d.getUTCSeconds());
  }
  function randStr(len, abc) {
    abc = abc || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var s = '';
    for (var i = 0; i < len; i++) s += abc.charAt(Math.floor(Math.random() * abc.length));
    return s;
  }
  function replaceParam(url, k, v) {
    var re = new RegExp('(' + k + '=)[^&]*');
    if (re.test(url)) return url.replace(re, '$1' + v);
    return url + (url.indexOf('?') === -1 ? '?' : '&') + k + '=' + v;
  }

  // ---------- HTTP ----------
  var GAME_HEADERS = {
    'accept': '*/*',
    'content-type': 'application/x-www-form-urlencoded',
    'accept-charset': 'utf-8',
    'user-agent': 'GunghoPuzzleAndDungeon',
    'accept-language': 'zh-HK,zh-Hant;q=0.9'
  };

  function finish(results) {
    var lines = [];
    for (var i = 0; i < results.items.length; i++) {
      var r = results.items[i];
      if (r.ok) lines.push(r.label + ' : ✅ res=0 成功!');
      else if (r.res !== null) lines.push(r.label + ' : ❌ res=' + r.res);
      else lines.push(r.label + ' : ❌ ' + (r.err || ('status=' + r.status + ' body=' + (r.body || '').slice(0, 80))));
    }
    notify('PD免廣告', results.algoLine, lines.join('\n'));
    log('FINISHED:\n' + lines.join('\n'));
    if (typeof $done === 'function') $done();
  }

  function callGame(url, label, results) {
    log(label + ' -> ' + url);
    if (typeof $fetch !== 'function') {
      results.items.push({ label: label, ok: false, err: 'no $fetch' });
      results.done++;
      if (results.done === results.total) finish(results);
      return;
    }
    $fetch(url, { method: 'GET', headers: GAME_HEADERS }, function (err, resp, data) {
      var r = { label: label, ok: false };
      if (err) {
        r.err = String(err);
      } else {
        r.status = resp && resp.status;
        var bodyStr = '';
        try { bodyStr = data === null ? '' : (typeof data === 'string' ? data : data.toString()); } catch (e) {}
        r.body = bodyStr.slice(0, 300);
        var decoded = null, parsed = null;
        if (bodyStr) {
          try {
            var d = (typeof base64 === 'function') ? base64(bodyStr, true) : null;
            if (!d && typeof atob === 'function') d = atob(bodyStr);
            if (d && d.charAt(0) === '{') decoded = d;
          } catch (e) { log('decode: ' + e); }
          if (decoded) { try { parsed = JSON.parse(decoded); } catch (e) {} }
        }
        r.decoded = decoded;
        r.res = parsed ? parsed.res : null;
        r.ok = r.res === 0;
      }
      results.items.push(r);
      results.done++;
      if (results.done === results.total) finish(results);
    });
  }

  // ---------- 主流程 ----------
  var reqs = findReqSamples();
  if (!reqs.length) {
    notify('PD免廣告', '沒有樣本', '請先在遊戲裡正常看 1 次廣告(腳本會自動捕獲), 再運行本腳本。');
    if (typeof $done === 'function') $done();
    return;
  }

  var advRewards = [];
  for (var ai = 0; ai < reqs.length; ai++) if (reqs[ai].params.action === 'adv_reward') advRewards.push(reqs[ai]);
  var lastReward = advRewards.length ? advRewards[0] : reqs[0];

  var algo = null;
  try {
    var saved = $persistentStore.read(ALGO_KEY);
    if (saved) algo = JSON.parse(saved);
  } catch (e) {}
  if (!algo) algo = crackKey(reqs);

  var results = {
    items: [], done: 0,
    total: 3 + (algo ? 1 : 0),
    algoLine: algo ? ('key算法: ' + algo.ordering + '/' + algo.hash) : 'key算法: 未破解(需更多樣本)'
  };

  var base = lastReward.url;
  var tNow = tJST();

  callGame(base, 'T0 原樣重放(原t原key)', results);
  callGame(replaceParam(base, 't', tNow), 'T1 新t重放(保留key+rid)', results);
  callGame(replaceParam(replaceParam(base, 't', tNow), 'rid', randStr(27)), 'T2 新t+隨機rid', results);

  if (algo) {
    var fresh = {};
    for (var k in lastReward.params) fresh[k] = lastReward.params[k];
    fresh.t = tNow;
    fresh.rid = randStr(27);
    var newKey = null;
    try { newKey = computeKey(algo, fresh); } catch (e) {}
    if (newKey && newKey.length >= 10) {
      fresh.key = newKey.slice(0, 10).toUpperCase();
      var parts = [];
      for (var k2 in fresh) parts.push(encodeURIComponent(k2) + '=' + encodeURIComponent(fresh[k2]));
      callGame('https://api-ios.padsv.gungho.jp/api.php?' + parts.join('&'), 'T3 完全自主(新rid+新key)', results);
    }
  }
})();