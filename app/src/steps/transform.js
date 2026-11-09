// CGAffineTransform 和 UIView.transform。
//
// 静态工厂（scale / rotation / translation）全是 JS 自己算的——ObjC 侧那几个
// C 函数是纯算术，没必要跨桥。过桥的只有六个数。

/** @param {import("../main.js").StepContext} ctx */
export function stepTransform(ctx) {
  const { assert, vc } = ctx;

  console.log('--- CGAffineTransform ---');

  // 四舍五入到小数点后 4 位再比，浮点数直接比不现实
  const r4 = (/** @type {number} */ n) => Math.round(n * 10000) / 10000;

  // ---- 工厂 ----
  const identity = CGAffineTransform.identity;
  assert('identity 是单位矩阵', identity.isIdentity, true);
  assert('identity 的 a', identity.a, 1);

  const twice = CGAffineTransform.scale(2);
  assert('scale(2) 两轴都是 2', twice.a + ',' + twice.d, '2,2');
  assert('scale 不动平移', twice.tx + ',' + twice.ty, '0,0');
  const wide = CGAffineTransform.scale(2, 3);
  assert('scale(2, 3) 分开给', wide.a + ',' + wide.d, '2,3');

  const moved = CGAffineTransform.translation(10, 20);
  assert('translation 只动 tx/ty', moved.tx + ',' + moved.ty, '10,20');
  assert('translation 的对角线还是 1', moved.a + ',' + moved.d, '1,1');

  // 旋转用弧度，和 Core Graphics 一致
  const quarter = CGAffineTransform.rotation(Math.PI / 2);
  assert('rotation(π/2) 的 a', r4(quarter.a), 0);
  assert('rotation(π/2) 的 b', r4(quarter.b), 1);
  assert('rotation(π/2) 的 c', r4(quarter.c), -1);
  assert('rotation(π/2) 的 d', r4(quarter.d), 0);

  // ---- concat / invert ----
  const both = twice.concat(moved);
  assert('先缩放再平移：缩放部分', both.a + ',' + both.d, '2,2');
  assert('先缩放再平移：平移不被缩放', both.tx + ',' + both.ty, '10,20');
  const other = moved.concat(twice);
  assert('换个顺序，平移就被缩放了', other.tx + ',' + other.ty, '20,40');

  const back = twice.invert();
  assert('scale(2) 的逆是 0.5', back && back.a, 0.5);
  assert('乘回去是单位矩阵', twice.concat(/** @type {any} */ (back)).isIdentity, true);
  // 行列式为 0 的矩阵不可逆：返回 null，不抛也不悄悄给单位矩阵
  assert('不可逆时返回 null', CGAffineTransform.scale(0).invert(), null);

  // ---- 和别的结构体一样，字段只读 ----
  try {
    // @ts-expect-error 结构体字段是只读的
    twice.a = 5;
    console.log('  ✗ 居然写进去了');
  } catch (err) {
    console.log('  ✓ 写字段被拒:', err.message.slice(0, 50) + '…');
  }
  try {
    // @ts-expect-error 少了字段
    vc.view.transform = { a: 1, b: 0 };
    console.log('  ✗ 缺字段居然通过了');
  } catch (err) {
    console.log('  ✓ 缺字段被拒:', err.message.slice(0, 48) + '…');
  }

  // ---- 挂到 view 上：过桥往返 ----
  const block = new UIView();
  block.backgroundColor = UIColor.systemYellowColor;
  block.layer.cornerRadius = 8;
  block.frame = new CGRect(24, 304, 40, 40);
  vc.view.addSubview(block);

  assert('view 默认是单位矩阵', block.transform.isIdentity, true);
  assert('读出来是 CGAffineTransform', block.transform instanceof CGAffineTransform, true);

  block.transform = CGAffineTransform.scale(1.2).concat(
    CGAffineTransform.rotation(Math.PI / 6));
  const readBack = block.transform;
  assert('过桥往返：a', r4(readBack.a), r4(1.2 * Math.cos(Math.PI / 6)));
  assert('过桥往返：b', r4(readBack.b), r4(1.2 * Math.sin(Math.PI / 6)));
  assert('非单位矩阵了', readBack.isIdentity, false);

  // ---- 这是最要紧的一条坑：frame 不再有意义 ----
  // UIKit 的规定——transform 非单位矩阵时 frame 报的是**变换后的包围盒**，
  // 而 bounds 和 center 不受影响
  const framed = block.frame;
  const bounded = block.bounds;
  assert('bounds 不受 transform 影响', bounded.width, 40);
  assert('frame 变成了变换后的包围盒', framed.width > 40, true);
  assert('frame 的宽按 |a|+|c| 算',
         r4(framed.width), r4(40 * (Math.abs(readBack.a) + Math.abs(readBack.c))));
  assert('center 也不受影响', block.center.x, 44);

  // 换回单位矩阵，frame 就恢复
  block.transform = CGAffineTransform.identity;
  assert('换回单位矩阵，frame 恢复', block.frame.width, 40);

  // 屏幕上留一个转过的黄块
  block.transform = CGAffineTransform.scale(1.2).concat(
    CGAffineTransform.rotation(Math.PI / 6));
  console.log('  ✓ 屏幕上：左边一个转了 30° 放大 1.2 倍的黄块');
}
