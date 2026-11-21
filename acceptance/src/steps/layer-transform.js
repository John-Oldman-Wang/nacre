// 图层的 3D 变换：CATransform3D，图层的 transform / sublayerTransform /
// isDoubleSided / mask，动画的 transform 一组 keyPath。
//
// CATransform3D 的算术在 JS 里做（和 CGAffineTransform 一样），所以除了按定义
// 核对，还拿原生交叉核对一次：设视图的 2D transform，UIKit 会把它换成图层的
// 3D transform，读出来要和 JS 算的一致。

/**
 * 一组断言中途抛了只废这一组，不连累后面的
 * @param {(label: string, actual: unknown, expected: unknown) => void} assert
 * @param {string} name
 * @param {() => void} fn
 */
function group(assert, name, fn) {
  try {
    fn();
  } catch (err) {
    assert(name + ' 这一组中断了', err instanceof Error ? err.name + ': ' + err.message : String(err), '跑完');
  }
}

/** @param {() => void} fn */
function thrown(fn) {
  try {
    fn();
    return '没抛';
  } catch (err) {
    return err instanceof Error ? err.name : String(err);
  }
}

const FIELDS = /** @type {const} */ ([
  'm11', 'm12', 'm13', 'm14', 'm21', 'm22', 'm23', 'm24',
  'm31', 'm32', 'm33', 'm34', 'm41', 'm42', 'm43', 'm44',
]);

/**
 * 两个矩阵按字段比，误差 1e-9 以内算相等
 * @param {unknown} a
 * @param {unknown} b
 */
function same(a, b) {
  if (a == null || b == null) return false;
  const x = /** @type {Record<string, number>} */ (a);
  const y = /** @type {Record<string, number>} */ (b);
  return FIELDS.every((f) => Math.abs(x[f] - y[f]) < 1e-9);
}

/** @param {import("../main.js").StepContext} ctx */
export function stepLayerTransform(ctx) {
  const { assert } = ctx;
  console.log('--- 图层的 3D 变换 ---');
  const half = Math.PI / 2;

  group(assert, 'CATransform3D 的构造和字段', () => {
    const id = CATransform3D.identity;
    assert('identity 的对角线是 1', [id.m11, id.m22, id.m33, id.m44].join(','), '1,1,1,1');
    assert('identity 其余是 0', FIELDS.filter((f) => !['m11', 'm22', 'm33', 'm44'].includes(f))
      .every((f) => id[f] === 0), true);
    assert('identity.isIdentity', id.isIdentity, true);
    assert('identity.isAffine', id.isAffine, true);
    assert('不给参数是全 0', FIELDS.every((f) => new CATransform3D()[f] === 0), true);
    assert('字段只读，写了抛', thrown(() => { /** @type {any} */ (id).m34 = 1; }), 'TypeError');
    assert('参数不是数抛', thrown(() => new CATransform3D(/** @type {any} */ ('x'))), 'TypeError');
  });

  group(assert, 'CATransform3D 的工厂', () => {
    const t = CATransform3D.translation(10, 20, 30);
    assert('translation', [t.m41, t.m42, t.m43].join(','), '10,20,30');
    assert('translation 不给 z 是 0', CATransform3D.translation(10, 20).m43, 0);
    const s = CATransform3D.scale(2);
    assert('scale 只给一个：x、y 相同，z 是 1', [s.m11, s.m22, s.m33].join(','), '2,2,1');
    const s3 = CATransform3D.scale(2, 3, 4);
    assert('scale 三轴', [s3.m11, s3.m22, s3.m33].join(','), '2,3,4');
    assert('绕 z 轴转等于 2D 的旋转',
           same(CATransform3D.rotation(half, 0, 0, 1),
                CATransform3D.fromAffineTransform(CGAffineTransform.rotation(half))), true);
    const rx = CATransform3D.rotation(half, 1, 0, 0);
    assert('绕 x 轴转 90°：y 轴转到 z 轴（右手）',
           [rx.m21, rx.m22, rx.m23].map((v) => Math.round(v)).join(','), '0,0,1');
    assert('转轴是零向量抛 RangeError', thrown(() => CATransform3D.rotation(1, 0, 0, 0)), 'RangeError');
    const a = CATransform3D.fromAffineTransform(new CGAffineTransform(1, 2, 3, 4, 5, 6));
    assert('fromAffineTransform 的六个数',
           [a.m11, a.m12, a.m21, a.m22, a.m41, a.m42, a.m33, a.m44].join(','), '1,2,3,4,5,6,1,1');
  });

  group(assert, 'CATransform3D 的运算', () => {
    const t = CATransform3D.translation(10, 0, 0).concat(CATransform3D.scale(2));
    assert('concat：先平移再缩放', t.m41, 20);
    assert('translate：先平移再应用自己', CATransform3D.scale(2).translate(10, 0, 0).m41, 20);
    assert('scale 方法：先缩放再应用自己', CATransform3D.translation(10, 0, 0).scale(2).m41, 10);
    assert('rotate 方法等于 rotation',
           same(CATransform3D.identity.rotate(0.3, 0, 1, 0), CATransform3D.rotation(0.3, 0, 1, 0)), true);
    const r = CATransform3D.rotation(0.7, 1, 2, 3);
    const back = r.invert();
    assert('invert 之后乘回去是单位矩阵', back !== null && same(r.concat(back), CATransform3D.identity), true);
    assert('不可逆的给 null', CATransform3D.scale(0).invert(), null);
    const p = new CATransform3D(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, -1 / 500, 0, 0, 0, 1);
    assert('有透视就不是 affine', p.isAffine, false);
    const af = CATransform3D.translation(5, 6).affineTransform;
    assert('affineTransform', af instanceof CGAffineTransform && af.tx === 5 && af.ty === 6, true);
  });

  group(assert, '图层的 transform 一组', () => {
    const layer = new CALayer();
    assert('transform 默认是单位矩阵', layer.transform instanceof CATransform3D && layer.transform.isIdentity, true);
    const r = CATransform3D.rotation(0.5, 0, 1, 0);
    layer.transform = r;
    assert('transform 写进去读回来', same(layer.transform, r), true);
    layer.transform = { ...CATransform3D.identity, m34: -1 / 500 };
    assert('transform 可以写普通对象（透视）', layer.transform.m34, -1 / 500);
    assert('transform 缺字段抛', thrown(() => { layer.transform = /** @type {any} */ ({ m11: 1 }); }), 'TypeError');
    layer.sublayerTransform = CATransform3D.scale(2);
    assert('sublayerTransform 写进去读回来', layer.sublayerTransform.m11, 2);
    assert('isDoubleSided 默认 true', layer.isDoubleSided, true);
    layer.isDoubleSided = false;
    assert('isDoubleSided 写进去', layer.isDoubleSided, false);
  });

  group(assert, '和原生交叉核对', () => {
    const view = new UIView();
    view.transform = CGAffineTransform.scale(2, 3);
    assert('视图的 2D 缩放变成图层的 3D 变换', same(view.layer.transform, CATransform3D.scale(2, 3)), true);
    view.transform = CGAffineTransform.rotation(0.4);
    assert('视图的 2D 旋转等于 JS 算的绕 z 轴旋转',
           same(view.layer.transform, CATransform3D.rotation(0.4, 0, 0, 1)), true);
  });

  group(assert, '图层的 mask', () => {
    const layer = new CALayer();
    assert('mask 默认 null', layer.mask, null);
    const shape = new CAShapeLayer();
    layer.mask = shape;
    assert('mask 写进去读回同一个对象', layer.mask === shape, true);
    layer.mask = null;
    assert('mask 写 null 清掉', layer.mask, null);
    assert('mask 写不是图层的抛', thrown(() => { layer.mask = /** @type {any} */ (new UIView()); }), 'TypeError');
  });

  group(assert, '动画的 transform 一组 keyPath', () => {
    const spin = CABasicAnimation.animationWithKeyPath('transform.rotation.z');
    spin.fromValue = 0;
    spin.toValue = Math.PI;
    assert('transform.rotation.z 的值是数', spin.toValue, Math.PI);
    for (const keyPath of /** @type {const} */ ([
      'transform.rotation', 'transform.rotation.x', 'transform.rotation.y',
      'transform.scale', 'transform.scale.x', 'transform.scale.y', 'transform.scale.z',
      'transform.translation.x', 'transform.translation.y', 'transform.translation.z',
    ])) {
      const anim = CABasicAnimation.animationWithKeyPath(keyPath);
      anim.toValue = 1;
      assert('keyPath 认得：' + keyPath, anim.toValue, 1);
    }
    const move = CABasicAnimation.animationWithKeyPath('transform.translation');
    move.toValue = new CGSize(10, 20);
    assert('transform.translation 的值是 CGSize', move.toValue instanceof CGSize && move.toValue.width === 10, true);
    const whole = CABasicAnimation.animationWithKeyPath('transform');
    const target = CATransform3D.rotation(1, 0, 1, 0);
    whole.fromValue = CATransform3D.identity;
    whole.toValue = target;
    assert('transform 的值是 CATransform3D', whole.toValue instanceof CATransform3D && same(whole.toValue, target), true);
    const sub = CABasicAnimation.animationWithKeyPath('sublayerTransform');
    sub.toValue = CATransform3D.scale(2);
    assert('sublayerTransform 也能动画', same(sub.toValue, CATransform3D.scale(2)), true);
    const layer = new CALayer();
    layer.addAnimation(spin, { forKey: 'spin' });
    assert('挂到图层上', layer.animationKeys().includes('spin'), true);
    assert('不认识的 transform 子路径抛', thrown(() => CABasicAnimation.animationWithKeyPath(/** @type {any} */ ('transform.foo'))), 'TypeError');
  });
}
