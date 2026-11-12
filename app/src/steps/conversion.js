// 参数怎么转换：照 Web IDL。这个文件按步骤往下长——
//   第 1 步：options 里值是 undefined 的成员视为没带

/** @param {import("../main.js").StepContext} ctx */
export function stepConversion(ctx) {
  const { assert } = ctx;
  // ===== 参数转换 =====
  //
  // 起因是一份试用反馈：{ atIndex: undefined } 这种写法让 App 直接闪退，
  // JS 的 try/catch 接不到。条件表达式里顺手写出 undefined 是很常见的事。
  console.log('--- 参数转换：options 里的 undefined ---');

  /**
   * 跑一段代码，返回它抛出的错误的 message；没抛返回 null。
   * @param {() => void} run
   */
  const thrown = (run) => {
    try {
      run();
      return null;
    } catch (err) {
      return /** @type {Error} */ (err).name + ': ' + /** @type {Error} */ (err).message;
    }
  };

  // ---- 反馈里的三处：以前是闪退 ----
  const parent = new UIView();
  const child = new UIView();
  assert('insertSubview 的 atIndex 是 undefined：等于没带，走到「三选一」的报错',
         thrown(() => parent.insertSubview(child, /** @type {any} */ ({ atIndex: undefined }))),
         'TypeError: insertSubview needs one of { atIndex } / { belowSubview } / { aboveSubview }');
  assert('没插进去', parent.subviews.length, 0);

  const stack = new UIStackView();
  assert('insertArrangedSubview 的 atIndex 是 undefined：必填的没带',
         thrown(() => stack.insertArrangedSubview(child, /** @type {any} */ ({ atIndex: undefined }))),
         'TypeError: insertArrangedSubview needs { atIndex }');

  // 一张 2×2 的 PNG
  const png = new Uint8Array([
    137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 2, 0, 0, 0, 2,
    8, 6, 0, 0, 0, 114, 182, 13, 36, 0, 0, 0, 17, 73, 68, 65, 84, 120, 156, 99, 248, 207,
    192, 240, 31, 132, 25, 96, 12, 0, 71, 202, 7, 249, 103, 89, 110, 183, 0, 0, 0, 0, 73,
    69, 78, 68, 174, 66, 96, 130]);
  const blob = new Blob([png]);
  const plain = UIImage.imageWithData(blob);
  const withUndefined = UIImage.imageWithData(blob, { scale: undefined });
  const scaled = UIImage.imageWithData(blob, { scale: 2 });
  assert('基线：这张图解得出来', plain !== null && '' + plain.size, 'CGSize(2, 2)');
  assert('imageWithData 的 scale 是 undefined：等于没带',
         withUndefined !== null && '' + withUndefined.size, 'CGSize(2, 2)');
  assert('对照：真的带了 scale 是另一个结果', scaled !== null && '' + scaled.size, 'CGSize(1, 1)');

  // ---- 同一类的其他入口 ----
  assert('整个 options 传 null：当成空对象',
         thrown(() => parent.insertSubview(child, /** @type {any} */ (null))),
         'TypeError: insertSubview needs one of { atIndex } / { belowSubview } / { aboveSubview }');
  const font = UIFont.systemFontOfSize(17, { weight: undefined });
  assert('systemFontOfSize 的 weight 是 undefined：用默认字重',
         font.pointSize, UIFont.systemFontOfSize(17).pointSize);
  const anchorHost = new UIView();
  const fixed = anchorHost.widthAnchor.constraintEqualToConstant(40);
  const equal = anchorHost.heightAnchor.constraintEqualToAnchor(
    anchorHost.widthAnchor, { multiplier: undefined, constant: undefined });
  assert('约束的 multiplier 是 undefined：默认 1', equal.multiplier, 1);
  assert('约束的 constant 是 undefined：默认 0', equal.constant, 0);
  assert('（对照）常数约束照常', fixed.constant, 40);

  // ---- 运行时自己用 JS 实现的类，也是同一个毛病 ----
  // 以前 { method: undefined } 得到的方法名是 "UNDEFINED"
  const request = new Request('https://example.com/', { method: undefined, headers: undefined });
  assert('Request 的 method 是 undefined：默认 GET', request.method, 'GET');
  assert('（对照）带了就用带的', new Request('https://example.com/', { method: 'post' }).method,
         'POST');
  const response = new Response(null, { status: undefined, statusText: undefined });
  assert('Response 的 status 是 undefined：默认 200', response.status, 200);
  assert('Response 的 statusText 是 undefined：默认空串', response.statusText, '');
  assert('Blob 的 type 是 undefined：默认空串', new Blob(['a'], { type: undefined }).type, '');
}
