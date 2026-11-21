// 图层的 shadowPath：阴影照这条路径的形状画，不再按图层的内容去算。
//
// 和 CAShapeLayer.path 是同一套规矩：写进去的那个对象原样读回来；存的是副本，
// 写进去之后再改那条路径，阴影不跟着变。

/** @param {() => void} fn */
function thrown(fn) {
  try {
    fn();
    return '没抛';
  } catch (err) {
    return err instanceof Error ? err.name : String(err);
  }
}

/** @param {import("../main.js").StepContext} ctx */
export function stepShadowPath(ctx) {
  const { assert } = ctx;
  console.log('--- 图层的 shadowPath ---');
  const layer = new CALayer();
  assert('shadowPath：默认 null', layer.shadowPath, null);

  const path = UIBezierPath.bezierPathWithRoundedRect(new CGRect(0, 0, 100, 60), { cornerRadius: 12 });
  layer.shadowPath = path;
  assert('shadowPath：写进去的对象原样读回来', layer.shadowPath === path, true);
  const read = layer.shadowPath;
  assert('shadowPath：读回来的路径范围对得上',
         read !== null && read.bounds.width === 100 && read.bounds.height === 60, true);
  layer.shadowPath = null;
  assert('shadowPath：写 null 清掉', layer.shadowPath, null);
  assert('shadowPath：写的不是路径抛',
         thrown(() => { layer.shadowPath = /** @type {any} */ ('M0 0'); }), 'TypeError');
  assert('shadowPath：写别的原生对象也抛',
         thrown(() => { layer.shadowPath = /** @type {any} */ (new UIView()); }), 'TypeError');
  assert('shadowPath：写错之后原值没动', layer.shadowPath, null);

  // 视图的图层上也能用（最常见的写法）
  const card = new UIView();
  card.frame = new CGRect(0, 0, 200, 80);
  card.layer.shadowOpacity = 0.3;
  card.layer.shadowPath = UIBezierPath.bezierPathWithRect(card.bounds);
  const cardPath = card.layer.shadowPath;
  assert('shadowPath：视图的图层上写进去读回来', cardPath !== null && cardPath.bounds.width === 200, true);
}
