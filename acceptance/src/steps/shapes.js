// 路径和形状图层：UIBezierPath + CAShapeLayer。
//
// 这一步要验的核心事实有两条：
//   - 路径只管形状，线宽/线头这些**在图层上**，不在路径上
//   - CAShapeLayer.path 写进去的那个对象会原样还回来（JS 侧记了一份镜像），
//     但原生存的是副本，之后改那条路径图层不会跟着变

/** @param {import("../main.js").StepContext} ctx */
export function stepShapes(ctx) {
  const { assert, vc } = ctx;
  console.log('--- UIBezierPath：路径 ---');

  // ---- 空路径 ----
  const empty = new UIBezierPath();
  assert('new UIBezierPath() 建得出来', empty instanceof UIBezierPath, true);
  assert('空路径 isEmpty', empty.isEmpty, true);
  assert('空路径的 currentPoint 是原点', '' + empty.currentPoint, 'CGPoint(0, 0)');
  assert('默认不用 evenOdd', empty.usesEvenOddFillRule, false);
  empty.usesEvenOddFillRule = true;
  assert('usesEvenOddFillRule 写得进去', empty.usesEvenOddFillRule, true);

  // ---- 自己画 ----
  const line = new UIBezierPath();
  line.moveToPoint(new CGPoint(0, 60));
  assert('moveToPoint 之后不再是空的', line.isEmpty, false);
  assert('currentPoint 跟着走', '' + line.currentPoint, 'CGPoint(0, 60)');
  line.addLineToPoint(new CGPoint(40, 20));
  line.addLineToPoint(new CGPoint(80, 50));
  assert('画完三点的 currentPoint', '' + line.currentPoint, 'CGPoint(80, 50)');
  // bounds 算的是路径本身，不含线宽
  assert('bounds 包住整条折线',
         line.bounds.x + '/' + line.bounds.y + '/' +
         line.bounds.width + '/' + line.bounds.height, '0/20/80/40');

  const curved = new UIBezierPath();
  curved.moveToPoint(new CGPoint(0, 0));
  curved.addCurveToPoint(new CGPoint(100, 0), {
    controlPoint1: new CGPoint(30, -40),
    controlPoint2: new CGPoint(70, 40),
  });
  assert('三次贝塞尔之后 currentPoint', '' + curved.currentPoint, 'CGPoint(100, 0)');
  curved.addQuadCurveToPoint(new CGPoint(150, 0), { controlPoint: new CGPoint(125, 30) });
  assert('二次贝塞尔之后 currentPoint', '' + curved.currentPoint, 'CGPoint(150, 0)');

  // ---- 现成的形状 ----
  const rect = UIBezierPath.bezierPathWithRect(new CGRect(10, 20, 30, 40));
  assert('矩形路径的 bounds', '' + rect.bounds, 'CGRect(10, 20, 30, 40)');
  const oval = UIBezierPath.bezierPathWithOvalInRect(new CGRect(0, 0, 50, 50));
  assert('椭圆路径的 bounds', '' + oval.bounds, 'CGRect(0, 0, 50, 50)');
  const rounded = UIBezierPath.bezierPathWithRoundedRect(
    new CGRect(0, 0, 60, 60), { cornerRadius: 8 });
  assert('圆角矩形的 bounds', '' + rounded.bounds, 'CGRect(0, 0, 60, 60)');
  const picked = UIBezierPath.bezierPathWithRoundedRect(new CGRect(0, 0, 60, 60), {
    byRoundingCorners: ['topLeft', 'bottomRight'],
    cornerRadii: new CGSize(12, 12),
  });
  assert('挑角的圆角矩形也建得出来', picked.isEmpty, false);
  // 半圆：0 弧度在正右方，顺时针转到 π
  const arc = UIBezierPath.bezierPathWithArcCenter(new CGPoint(50, 50), {
    radius: 50, startAngle: 0, endAngle: Math.PI, clockwise: true,
  });
  assert('半圆弧的 bounds 宽是直径', arc.bounds.width, 100);

  try {
    // @ts-expect-error 两种写法都不给
    UIBezierPath.bezierPathWithRoundedRect(new CGRect(0, 0, 10, 10), {});
    console.log('  ✗ 圆角矩形不给选项居然通过了');
  } catch (e) {
    assert('圆角矩形不给选项就抛', e instanceof TypeError, true);
  }
  try {
    UIBezierPath.bezierPathWithRoundedRect(new CGRect(0, 0, 10, 10), {
      // @ts-expect-error 角名只认那四个
      byRoundingCorners: ['topLeading'], cornerRadii: new CGSize(2, 2),
    });
    console.log('  ✗ 不认识的角名居然通过了');
  } catch (e) {
    const message = e instanceof Error ? e.message : '';
    assert('不认识的角名当场抛', e instanceof TypeError, true);
    assert('错误里把四个角列出来了', message.includes('topLeft'), true);
  }
  try {
    // @ts-expect-error 四个选项都得给，没有默认值
    UIBezierPath.bezierPathWithArcCenter(new CGPoint(0, 0), { radius: 5 });
    console.log('  ✗ 圆弧缺选项居然通过了');
  } catch (e) {
    const message = e instanceof Error ? e.message : '';
    assert('圆弧缺选项就抛', e instanceof TypeError, true);
    assert('错误点名缺的是哪个', message.includes('startAngle'), true);
  }

  // ---- 问它 / 改它 ----
  const box = UIBezierPath.bezierPathWithRect(new CGRect(0, 0, 100, 100));
  assert('containsPoint：里面', box.containsPoint(new CGPoint(50, 50)), true);
  assert('containsPoint：外面', box.containsPoint(new CGPoint(150, 50)), false);
  // 就地变换，不返回新路径
  box.applyTransform(CGAffineTransform.translation(10, 0));
  assert('applyTransform 就地平移', box.bounds.x, 10);

  const joined = UIBezierPath.bezierPathWithRect(new CGRect(0, 0, 10, 10));
  joined.appendPath(UIBezierPath.bezierPathWithRect(new CGRect(90, 0, 10, 10)));
  assert('appendPath 之后 bounds 扩大', joined.bounds.width, 100);

  const back = joined.bezierPathByReversingPath();
  assert('反转给的是另一条路径', back === joined, false);
  assert('反转不改形状', '' + back.bounds, '' + joined.bounds);

  joined.removeAllPoints();
  assert('removeAllPoints 之后空了', joined.isEmpty, true);

  console.log('--- CAShapeLayer：画出来 ---');

  // ---- 默认值。全部对着头文件的注释核过 ----
  const shape = new CAShapeLayer();
  assert('new CAShapeLayer() 建得出来', shape instanceof CAShapeLayer, true);
  assert('CAShapeLayer 也是 CALayer', shape instanceof CALayer, true);
  assert('默认没有路径', shape.path, null);
  // 没人写过的颜色没有声明串，按它的事实合成一个
  assert('默认 fillColor 是黑的（不是透明）', shape.fillColor, '#000000');
  assert('默认没有描边色', shape.strokeColor, null);
  assert('默认 fillRule', shape.fillRule, 'nonZero');
  assert('默认 lineWidth', shape.lineWidth, 1);
  assert('默认 lineCap', shape.lineCap, 'butt');
  assert('默认 lineJoin', shape.lineJoin, 'miter');
  assert('默认 miterLimit', shape.miterLimit, 10);
  assert('默认 strokeStart', shape.strokeStart, 0);
  assert('默认 strokeEnd', shape.strokeEnd, 1);
  assert('默认是实线', shape.lineDashPattern, null);
  assert('默认 lineDashPhase', shape.lineDashPhase, 0);

  // ---- path 的身份 ----
  shape.path = line;
  assert('写进去的路径原样还回来', shape.path === line, true);
  assert('读两次还是同一个', shape.path === shape.path, true);
  // 原生存的是**副本**：改那条路径图层不会跟着变
  const beforeLen = line.bounds.width;
  line.addLineToPoint(new CGPoint(300, 50));
  assert('改路径之后 JS 这边的 bounds 变了', line.bounds.width > beforeLen, true);
  shape.path = null;
  assert('path 设成 null 读回来是 null', shape.path, null);

  // ---- 写属性 ----
  shape.fillRule = 'evenOdd';
  assert('fillRule 写得进去', shape.fillRule, 'evenOdd');
  shape.lineCap = 'round';
  assert('lineCap 写得进去', shape.lineCap, 'round');
  shape.lineJoin = 'bevel';
  assert('lineJoin 写得进去', shape.lineJoin, 'bevel');
  shape.lineDashPattern = [4, 2];
  assert('虚线往返', shape.lineDashPattern?.join(','), '4,2');
  shape.lineDashPattern = null;
  assert('虚线能设回实线', shape.lineDashPattern, null);
  shape.strokeColor = '#FF2D55';
  // 合法写入的串原样还回来，不会被规范化成别的写法
  assert('描边色原样还回来', shape.strokeColor, '#FF2D55');
  shape.fillColor = null;
  assert('填充色能设成 null', shape.fillColor, null);

  for (const [key, bad, expected] of /** @type {[string, string, string][]} */ ([
    ['fillRule', 'evenodd', 'evenOdd'],
    ['lineCap', 'flat', 'butt'],
    ['lineJoin', 'sharp', 'miter'],
  ])) {
    try {
      /** @type {any} */ (shape)[key] = bad;
      console.log('  ✗ ' + key + ' 写错了居然通过了');
    } catch (e) {
      const message = e instanceof Error ? e.message : '';
      assert(key + ' 写错当场抛', e instanceof TypeError, true);
      assert(key + ' 的错误里列出了可选值', message.includes(expected), true);
    }
  }
  // 元素按 Number() 转（project.md 原则 13）：'4' 是 4，转不出数的才抛
  // @ts-expect-error 类型定义仍然只收数字，运行时会转
  shape.lineDashPattern = ['4', 2];
  assert("lineDashPattern 的元素给数字字符串：按数用",
         String(shape.lineDashPattern), '4,2');
  try {
    // @ts-expect-error 转不出数
    shape.lineDashPattern = ['dash'];
    console.log('  ✗ 转不出数的虚线段居然通过了');
  } catch (e) {
    assert('lineDashPattern 的元素转不出数就抛', e instanceof TypeError, true);
  }

  // ---- 上屏：一条折线 + 一个扇形 ----
  //
  // 和别的子图层一样，形状图层的 frame 要自己设；path 的坐标是**图层自己
  // 坐标系里的点**，和 frame 的大小没关系
  const card = new UIView();
  card.frame = new CGRect(16, 0, 150, 90);
  card.backgroundColor = 'secondarySystemBackground';
  card.layer.cornerRadius = 10;
  ctx.section('CAShapeLayer + UIBezierPath：折线和扇形', 90).addSubview(card);

  const poly = new UIBezierPath();
  poly.moveToPoint(new CGPoint(12, 70));
  poly.addLineToPoint(new CGPoint(34, 34));
  poly.addLineToPoint(new CGPoint(52, 52));
  poly.addLineToPoint(new CGPoint(74, 16));
  const stroke = new CAShapeLayer();
  stroke.path = poly;
  stroke.fillColor = null;          // 不设的话整块被黑色填满
  stroke.strokeColor = 'systemBlue';
  stroke.lineWidth = 3;
  stroke.lineCap = 'round';
  stroke.lineJoin = 'round';
  stroke.frame = card.bounds;
  card.layer.addSublayer(stroke);

  // 扇形：圆心 → 弧 → 回圆心 → 闭合
  const center = new CGPoint(112, 45);
  const pie = new UIBezierPath();
  pie.moveToPoint(center);
  pie.addArcWithCenter(center, {
    radius: 28, startAngle: -Math.PI / 2, endAngle: Math.PI / 3, clockwise: true,
  });
  pie.closePath();
  const wedge = new CAShapeLayer();
  wedge.path = pie;
  wedge.fillColor = 'systemOrange';
  wedge.frame = card.bounds;
  card.layer.addSublayer(wedge);

  assert('卡片上挂了两个形状图层', card.layer.sublayers.length, 2);
  assert('形状图层从 sublayers 读回来还是 CAShapeLayer',
         card.layer.sublayers[0] instanceof CAShapeLayer, true);
}
