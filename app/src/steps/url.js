// URL / URLSearchParams / Headers。

/** @param {import("../main.js").StepContext} ctx */
export function stepUrl(ctx) {
  const { assert } = ctx;
  // ===== URL / URLSearchParams / Headers =====
  console.log('  --- URL ---');
  {
    const u = new URL('https://u:p@EXAMPLE.com:443/a/b/../c?x=1&y=2#f');
    assert('host 小写化且去掉默认端口', u.host, 'example.com');
    assert('点段规范化', u.pathname, '/a/c');
    assert('port 为默认时读出空串', u.port, '');
    assert('protocol 带冒号', u.protocol, 'https:');
    assert('search 带问号', u.search, '?x=1&y=2');
    assert('hash 带井号', u.hash, '#f');
    assert('origin 不含 userinfo', u.origin, 'https://example.com');
    assert('username', u.username, 'u');
    assert('href 能拼回去', u.href, 'https://u:p@example.com/a/c?x=1&y=2#f');

    assert('空路径补成斜杠', new URL('https://a.com').pathname, '/');
    assert('非特殊 scheme 的 origin 是 null', new URL('foo://bar/baz').origin, 'null');
    assert('已编码的不重复编码', new URL('https://a.com/%7Eu').pathname, '/%7Eu');
    assert('空格编码', new URL('https://a.com/a b').pathname, '/a%20b');

    // 没有 base 是这个运行时的硬事实，不是 bug。
    // 注意这里不标 @ts-expect-error：类型上 new URL(string) 完全合法，
    // 它是**运行时**才抛——这正是和浏览器的差异所在，类型系统看不出来。
    try { new URL('/x'); console.log('  ✗ 相对 URL 居然解析成功'); }
    catch (err) { assert('相对 URL 无 base 时抛', err.constructor.name, 'TypeError'); }
    assert('有 base 就能解析', new URL('/x', 'https://a.com').href, 'https://a.com/x');
    assert('base 下的点段', new URL('../y', 'https://a.com/a/b/c').pathname, '/a/y');
    assert('canParse 不抛', String(URL.canParse('/x')), 'false');
    assert('parse 失败返回 null', String(URL.parse('/x')), 'null');

    const w = new URL('https://a.com/p');
    w.pathname = 'q';           // 不带斜杠也要补上
    w.hash = 'top';             // 不带井号也要补上
    assert('setter 会规范化', w.href, 'https://a.com/q#top');
  }

  console.log('  --- URLSearchParams ---');
  {
    const q = new URLSearchParams('a=1&b=2&a=3');
    assert('get 取第一个', q.get('a'), '1');
    assert('getAll 取全部', q.getAll('a').join(','), '1,3');
    assert('size', q.size, 3);
    q.set('a', '9');
    assert('set 替换首个、删其余、位置不变', q.toString(), 'a=9&b=2');
    q.append('c', '中 文');
    assert('空格编码成加号', q.toString(), 'a=9&b=2&c=%E4%B8%AD+%E6%96%87');
    assert('读回来是解码的', q.get('c'), '中 文');
    q.delete('a');
    assert('delete', q.toString(), 'b=2&c=%E4%B8%AD+%E6%96%87');

    // 和宿主 URL 双向绑定
    const u2 = new URL('https://a.com/?k=1');
    u2.searchParams.append('k2', 'v2');
    assert('改 searchParams，search 跟着变', u2.search, '?k=1&k2=v2');
    u2.search = '?z=9';
    assert('改 search，searchParams 跟着变', u2.searchParams.get('z'), '9');
  }

  console.log('  --- Headers ---');
  {
    const h = new Headers({ 'Content-Type': 'application/json' });
    assert('名字大小写不敏感', h.get('CONTENT-TYPE'), 'application/json');
    h.append('Accept', 'a');
    h.append('accept', 'b');
    assert('同名多值合并', h.get('Accept'), 'a, b');
    h.append('Set-Cookie', 'x=1');
    h.append('Set-Cookie', 'y=2');
    assert('Set-Cookie 不合并', h.getSetCookie().join('|'), 'x=1|y=2');
    assert('迭代按名字排序', [...h.keys()].join(','),
         'accept,content-type,set-cookie,set-cookie');
    h.set('Accept', '只剩这个');
    assert('set 覆盖全部同名', h.get('accept'), '只剩这个');
    h.delete('ACCEPT');
    assert('delete 大小写不敏感', String(h.has('accept')), 'false');
    try { h.set('坏 名字', 'v'); console.log('  ✗ 非法首部名居然通过'); }
    catch (err) { assert('非法首部名被拒', err.constructor.name, 'TypeError'); }
    try { h.set('X', '值里有\r\n换行'); console.log('  ✗ CRLF 居然通过'); }
    catch (err) { assert('首部值里的 CRLF 被拒', err.constructor.name, 'TypeError'); }
    assert('首尾空白被去掉', new Headers({ a: '  v  ' }).get('a'), 'v');
  }
}
