// 图层：自己建的子图层和渐变。
//
// 这一步要验的核心事实是**子图层不走 Auto Layout**——frame 只能自己设。

/** @param {import("../main.js").StepContext} ctx */
export function stepGradient(ctx) {
  const { assert, vc } = ctx;
  console.log('--- CALayer：自己建的子图层 ---');

  // ---- CALayer 现在可以自己建 ----
  const plain = new CALayer();
  assert('new CALayer() 建得出来', plain instanceof CALayer, true);
  assert('默认 frame 是 0×0', plain.frame.width, 0);
  assert('默认 opacity 1', plain.opacity, 1);
  assert('默认不隐藏', plain.isHidden, false);
  assert('默认不裁剪', plain.masksToBounds, false);
  assert('默认没有父层', plain.superlayer, null);
  assert('默认没有子层', plain.sublayers.length, 0);
  // 最容易踩的那个坑：图层的 scale 默认是 1，不是屏幕的 3。
  // 本来以为只有自己建的图层才这样，**实测 view.layer 在这里也是 1**——
  // 场景刚接入、还没真正绘制过，UIKit 还没把屏幕 scale 写上去
  assert('自己建的图层 contentsScale 默认 1', plain.contentsScale, 1);
  assert('view.layer 在场景接入时也还是 1', vc.view.layer.contentsScale, 1);

  // ---- 几何 ----
  plain.frame = new CGRect(1, 2, 3, 4);
  assert('frame 写得进去', plain.frame.x + '/' + plain.frame.width, '1/3');
  assert('bounds 跟着 frame 走', plain.bounds.width, 3);
  // 锚点默认在正中，所以 position 是中心不是左上角
  assert('position 是中心点', '' + plain.position, 'CGPoint(2.5, 4)');
  plain.position = new CGPoint(10, 10);
  assert('写 position 把 frame 挪走了', plain.frame.x, 8.5);
  plain.zPosition = 5;
  assert('zPosition 写得进去', plain.zPosition, 5);

  // ---- 外观 ----
  plain.opacity = 0.5;
  assert('opacity 写得进去', plain.opacity, 0.5);
  plain.isHidden = true;
  assert('isHidden 写得进去', plain.isHidden, true);
  plain.isHidden = false;
  plain.masksToBounds = true;
  assert('masksToBounds 写得进去', plain.masksToBounds, true);
  plain.contentsScale = 3;
  assert('contentsScale 写得进去', plain.contentsScale, 3);
  plain.backgroundColor = '#FF2D55';
  assert('图层背景色读回来是原样', plain.backgroundColor, '#FF2D55');
  plain.backgroundColor = null;
  assert('背景色可以清掉', plain.backgroundColor, null);

  // ---- 层级 ----
  const host = new CALayer();
  const a = new CALayer();
  const b = new CALayer();
  const c = new CALayer();
  host.addSublayer(a);
  host.addSublayer(b);
  assert('加了两层', host.sublayers.length, 2);
  assert('顺序就是加的顺序', host.sublayers[0] === a, true);
  assert('superlayer 指回去', a.superlayer === host, true);
  assert('superlayer 读两次是同一个包装', a.superlayer === a.superlayer, true);

  host.insertSublayer(c, { atIndex: 0 });
  assert('atIndex 插到最前', host.sublayers[0] === c, true);
  host.insertSublayer(c, { above: b });
  assert('above 把它挪到 b 后面', host.sublayers[2] === c, true);
  host.insertSublayer(c, { below: a });
  assert('below 把它挪到 a 前面',
         host.sublayers.indexOf(c) < host.sublayers.indexOf(a), true);

  c.removeFromSuperlayer();
  assert('移走之后只剩两层', host.sublayers.length, 2);
  assert('移走之后没有父层', c.superlayer, null);

  try {
    // @ts-expect-error 三种插法总得选一种
    host.insertSublayer(a, {});
    console.log('  ✗ 空 options 居然通过了');
  } catch (e) {
    assert('insertSublayer 不给插法就抛', e instanceof TypeError, true);
  }
  try {
    // @ts-expect-error 参数不是图层
    host.addSublayer(UIColor.redColor);
    console.log('  ✗ 拿颜色当图层居然通过了');
  } catch (e) {
    assert('addSublayer 拿到非图层就抛', e instanceof TypeError, true);
  }

  // ---- 渐变 ----
  console.log('--- CAGradientLayer ---');
  const g = new CAGradientLayer();
  assert('渐变层也是 CALayer', g instanceof CALayer, true);
  assert('默认 type 是 axial', g.type, 'axial');
  assert('默认从上到下', g.startPoint.y + '→' + g.endPoint.y, '0→1');
  assert('默认没有颜色', g.colors.length, 0);
  assert('默认 locations 是 null', g.locations, null);

  g.colors = ['#5856D6', '#FF2D55'];
  assert('colors 读回来两个', g.colors.length, 2);
  assert('colors 读回来是字符串，而且是原样', g.colors[0], '#5856D6');
  g.locations = [0, 1];
  assert('locations 写得进去', '' + g.locations, '0,1');
  g.locations = null;
  assert('locations 可以清回 null', g.locations, null);
  g.startPoint = new CGPoint(0, 0);
  g.endPoint = new CGPoint(1, 1);
  assert('改成对角渐变', '' + g.endPoint, 'CGPoint(1, 1)');
  g.type = 'radial';
  assert('type 写得进去', g.type, 'radial');
  g.type = 'axial';

  try {
    // @ts-expect-error type 只认那三个名字
    g.type = 'linear';
    console.log('  ✗ 不认识的渐变类型居然通过了');
  } catch (e) {
    const message = e instanceof Error ? e.message : '';
    assert('不认识的 type 当场抛', e instanceof TypeError, true);
    assert('错误里把可选值列出来了', message.includes('axial'), true);
  }
  try {
    // @ts-expect-error locations 只收数字
    g.locations = ['half'];
    console.log('  ✗ 非数字的 locations 居然通过了');
  } catch (e) {
    assert('locations 收到非数字就抛', e instanceof TypeError, true);
  }

  // ---- 上屏：一张渐变卡片 ----
  //
  // 子图层**不走 Auto Layout**（CALayer 的 autoresizingMask 和 layoutManager
  // 在 iOS 上都不可用），所以这里用固定 frame，渐变层的 frame 也自己设。
  const card = new UIView();
  card.frame = new CGRect(16, 0, 150, 52);
  card.layer.cornerRadius = 10;
  card.layer.masksToBounds = true;   // 不裁的话渐变会盖过圆角
  ctx.section('CAGradientLayer：渐变', 52).addSubview(card);

  const bg = new CAGradientLayer();
  bg.colors = ['#5856D6', '#FF2D55'];
  bg.startPoint = new CGPoint(0, 0);
  bg.endPoint = new CGPoint(1, 1);
  bg.frame = card.bounds;            // ← 自己设，view 变大它不会跟
  card.layer.addSublayer(bg);
  assert('渐变挂到卡片的图层上了', card.layer.sublayers.length, 1);
  assert('挂上去之后 superlayer 是卡片的图层',
         bg.superlayer === card.layer, true);
  assert('渐变层的大小就是卡片的大小', bg.frame.width, 150);
}
