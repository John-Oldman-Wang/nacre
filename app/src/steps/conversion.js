// 参数怎么转换：照 Web IDL。这个文件按步骤往下长——
//   第 1 步：options 里值是 undefined 的成员视为没带
//   第 2 步：API 层按类型转换（数、整数、布尔、字符串）
//   第 3 步：原生层只校验不转换（从这里够不着，验证方式见 internals/conversion.md）

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

  // ===== 第 2 步：API 层按类型转换 =====
  //
  // 规则和 Number() / Boolean() / String() 一致，所以和 Web 的手感一致：
  // audio.volume = '0.5'、button.disabled = 'false'、el.textContent = 5。
  // 类型定义仍然是严格的（和 lib.dom 一样），所以下面都要转成 any 才写得出来。
  console.log('--- 参数转换：按类型转 ---');
  const view = /** @type {any} */ (new UIView());
  const label = /** @type {any} */ (new UILabel());

  // ---- 数 ----
  view.alpha = '0.5';
  assert("数：'0.5' 是 0.5", view.alpha, 0.5);
  view.alpha = true;
  assert('数：true 是 1', view.alpha, 1);
  view.alpha = null;
  assert('数：null 是 0（和 audio.volume = null 一样）', view.alpha, 0);
  view.alpha = 1;
  assert('数：undefined 转不出来，抛',
         thrown(() => { view.alpha = undefined; }),
         'TypeError: alpha must be a finite number, got undefined');
  assert("数：'abc' 抛", thrown(() => { view.alpha = 'abc'; }),
         'TypeError: alpha must be a finite number, got "abc"');
  assert('数：NaN 抛', thrown(() => { view.alpha = NaN; }),
         'TypeError: alpha must be a finite number, got NaN');
  assert('数：Infinity 抛', thrown(() => { view.alpha = Infinity; }),
         'TypeError: alpha must be a finite number, got Infinity');
  assert('数：对象抛', thrown(() => { view.alpha = {}; }),
         'TypeError: alpha must be a finite number, got an object');
  assert('抛了之后原值没动（以前 undefined 会把它静默写成 0）', view.alpha, 1);

  // ---- 整数 ----
  view.tag = '7';
  assert("整数：'7' 是 7", view.tag, 7);
  view.tag = 3.9;
  assert('整数：3.9 向零取整是 3', view.tag, 3);
  view.tag = -3.9;
  assert('整数：-3.9 向零取整是 -3', view.tag, -3);
  assert('整数：NaN 抛，不学 Web 老接口的「当成 0」', thrown(() => { view.tag = NaN; }),
         'TypeError: tag must be a finite number, got NaN');
  label.numberOfLines = '2';
  assert("整数：numberOfLines = '2'", label.numberOfLines, 2);

  // ---- 布尔：JS 的真假值 ----
  /** @type {Array<[unknown, boolean]>} */
  const truthiness = [[1, true], [0, false], ['false', true], ['', false], [null, false],
                      [undefined, false], [{}, true], [NaN, false]];
  const wrong = truthiness.filter(([given, expected]) => {
    view.isHidden = given;
    return view.isHidden !== expected;
  });
  assert("布尔：1 / 0 / 'false' / '' / null / undefined / {} / NaN 都按真假值", wrong.length, 0);
  view.isHidden = false;

  // ---- 字符串 ----
  label.text = 5;
  assert("可空字符串：5 是 '5'（和 textContent 一样）", label.text, '5');
  label.text = true;
  assert("可空字符串：true 是 'true'", label.text, 'true');
  label.text = undefined;
  assert('可空字符串：undefined 是 null', label.text, null);
  label.text = 'x';
  label.text = null;
  assert('可空字符串：null 是 null', label.text, null);
  const field = /** @type {any} */ (new UITextField());
  field.text = 42;
  assert("不可空字符串：42 是 '42'", field.text, '42');
  field.text = null;
  assert("不可空字符串：null 是空串，不是 'null'", field.text, '');

  // ---- 数组 ----
  const gradient = /** @type {any} */ (new CAGradientLayer());
  gradient.locations = ['0', 0.5, true];
  assert('数的数组：元素逐个转', gradient.locations.join(','), '0,0.5,1');
  gradient.locations = null;
  assert('数的数组：null 就是 null', gradient.locations, null);
  assert('数的数组：元素转不出来，点名是第几个',
         thrown(() => { gradient.locations = [0, 'x']; }),
         'TypeError: locations[1] must be a finite number, got "x"');
  assert('数的数组：给的不是数组',
         thrown(() => { gradient.locations = 5; }),
         'TypeError: locations must be an array of numbers or null, got 5');

  // ---- 「数，或者一个名字」----
  const column = /** @type {any} */ (new UIStackView());
  column.spacing = '12';
  assert("spacing = '12'：看着像数的字符串按数用", column.spacing, 12);
  column.spacing = 'system';
  assert("spacing = 'system'：名字原样交给原生", column.spacing, 'system');

  // ---- 无穷大那个特例还在 ----
  const anim = /** @type {any} */ (CABasicAnimation.animationWithKeyPath('opacity'));
  anim.repeatCount = Infinity;
  assert('repeatCount = Infinity 仍然合法', anim.repeatCount, Infinity);
  anim.repeatCount = '3';
  assert("repeatCount = '3'", anim.repeatCount, 3);

  // ---- 方法的参数 ----
  const sized = /** @type {any} */ (UIFont).systemFontOfSize('17');
  assert("systemFontOfSize('17')", sized.pointSize, 17);
  assert('systemFontOfSize(NaN)：以前是闪退',
         thrown(() => /** @type {any} */ (UIFont).systemFontOfSize(NaN)),
         'TypeError: size must be a finite number, got NaN');
  const box = /** @type {any} */ (new UIView());
  const first = new UIView();
  const second = new UIView();
  box.addSubview(first);
  box.insertSubview(second, { atIndex: '0' });
  assert("insertSubview 的 atIndex = '0'", box.subviews[0] === second, true);
  assert('insertSubview 的 atIndex = NaN：以前是闪退',
         thrown(() => box.insertSubview(new UIView(), { atIndex: NaN })),
         'TypeError: atIndex must be a finite number, got NaN');
  assert('没插进去', box.subviews.length, 2);
  first.tag = 9;
  assert("viewWithTag('9')", box.viewWithTag('9') === first, true);
  const titled = /** @type {any} */ (UIButton.buttonWithType('system'));
  titled.setTitle(5, { forState: ['normal'] });
  assert("setTitle(5)：标题是 '5'", titled.titleForState('normal'), '5');

  // ---- 结构体的构造函数 ----
  assert('new CGPoint()：不给的参数是 0', '' + new (/** @type {any} */ (CGPoint))(), 'CGPoint(0, 0)');
  assert("new CGPoint('3', null)", '' + new (/** @type {any} */ (CGPoint))('3', null), 'CGPoint(3, 0)');
  assert('new CGPoint(NaN, 0)：以前静默变成 0，现在抛',
         thrown(() => new CGPoint(NaN, 0)),
         'TypeError: a struct field must be a finite number, got NaN');

  // ===== 第 3 步：原生层只校验 =====
  //
  // 原生的类型报错从这里够不着——值到它手里之前已经被上面那一层转好了。
  // 那一层是用一次性的探针验的（见 internals/conversion.md）。这里留的是
  // 探针抓出来的那几处，以及「取值范围」仍然由原生把关。
  console.log('--- 参数转换：原生层把关 ---');
  const host = /** @type {any} */ (new CALayer());
  host.insertSublayer(new CALayer(), { atIndex: '0' });
  assert("insertSublayer 的 atIndex = '0'：按整数用", host.sublayers.length, 1);
  assert('insertSublayer 的 atIndex = -1：范围不对，原生拒',
         thrown(() => host.insertSublayer(new CALayer(), { atIndex: -1 })),
         'TypeError: insertSublayer:atIndex: index must not be negative');
  assert('没插进去', host.sublayers.length, 1);
  assert("imageWithData 的 scale = 'big'：转不出数",
         thrown(() => /** @type {any} */ (UIImage).imageWithData(new Blob([png]), { scale: 'big' })),
         'TypeError: scale must be a finite number, got "big"');
  assert('imageWithData 给的不是 Blob',
         thrown(() => /** @type {any} */ (UIImage).imageWithData(new UIView())),
         'TypeError: imageWithData needs a Blob');
  assert('imageNamed(5)：名字按字符串用，找不到是 null，不抛',
         /** @type {any} */ (UIImage).imageNamed(5), null);
}
