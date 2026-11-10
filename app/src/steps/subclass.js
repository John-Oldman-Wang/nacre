// 原生类是 final：继承它们在构造的那一刻就说不行，不再给一个静默的空壳。
//
// 这一段同时盯住三种「没有原生对象」的病，它们以前共用一句话：
//   1. 继承原生类        → Illegal constructor，点名两个类
//   2. Object.create     → Illegal invocation，和 Chrome 一致
//   3. new UIWindow()    → 还没绑场景，这是**合法**状态，话术保持不变

import { assert } from '../support.js';

/**
 * @param {string} label
 * @param {() => unknown} fn
 * @param {string} needle 错误信息里必须出现的片段
 */
function throws(label, fn, needle) {
  try {
    fn();
    assert(label, '没抛', '抛 ' + needle);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    assert(label, message.includes(needle) ? needle : message, needle);
  }
}

export function stepSubclass() {
  console.log('--- 原生类是 final ---');

  // ---- 1. 继承：构造时就抛，信息里点名子类和基类 ----
  // 可构造的类在类型层**拦不住** extends：TypeScript 没有 final，而
  // 「可以 new、不可以 extends」两件事它只能一起开或一起关。所以下面这
  // 四个 class 声明全部编译通过，只有运行时会拒。
  class MyView extends UIView {}
  class MyLabel extends UILabel { constructor() { super(); this.visits = 0; } }
  class MyPage extends UIViewController {}
  // 显式写一个 public 构造函数：NSObject 的是 protected，不写的话
  // 子类继承它的可见性，new MyObject() 在类型层就错了，测不到运行时
  class MyObject extends NSObject { constructor() { super(); } }
  // 工厂专造的类是 private constructor，连 extends 一起挡住了
  // @ts-expect-error
  class MyColor extends UIColor {}

  throws('继承 UIView 构造时就抛', () => new MyView(),
         'MyView extends UIView, but subclassing native classes is not supported yet');
  // 叶子类以前**能**继承，这是这一步唯一的行为变化：从能用改成明确说不行
  throws('叶子类 UILabel 也一样（以前能用）', () => new MyLabel(),
         'MyLabel extends UILabel');
  throws('继承 UIViewController', () => new MyPage(), 'MyPage extends UIViewController');
  // @ts-expect-error private constructor 让 new 也成了编译错误
  throws('继承工厂专造的类', () => new MyColor(), 'MyColor extends UIColor');
  throws('继承根类 NSObject', () => new MyObject(), 'MyObject extends NSObject');

  // ---- 2. 自己不可构造的类 ----
  // @ts-expect-error NSObject 是抽象壳
  throws('new NSObject()', () => new NSObject(), 'NSObject cannot be constructed');
  // @ts-expect-error 同上
  throws('new UIResponder()', () => new UIResponder(), 'UIResponder cannot be constructed');
  // @ts-expect-error 同上
  throws('new UIScene()', () => new UIScene(), 'UIScene cannot be constructed');
  // @ts-expect-error UIBarItem 是抽象基类
  throws('new UIBarItem()', () => new UIBarItem(),
         'UIBarItem is abstract; construct UIBarButtonItem instead');
  // @ts-expect-error 工厂专造
  throws('new UIColor()', () => new UIColor(),
         'UIColor is created by the runtime, not by new');
  // @ts-expect-error 同上
  throws('new CALayer()', () => new CALayer(), 'CALayer is created by the runtime');

  // ---- 3. Object.create：原型链对，但一个构造函数都没走过 ----
  const ghostView = /** @type {UIView} */ (Object.create(UIView.prototype));
  throws('Object.create 读属性', () => ghostView.frame, 'frame: Illegal invocation');
  // 以前这条抛的是 V8 内部错 Cannot read properties of undefined (reading 'get')
  throws('Object.create 挂监听器', () => ghostView.addEventListener('x', () => {}),
         'Illegal invocation');
  throws('Object.create 派发事件', () => ghostView.dispatchEvent(new Event('x')),
         'Illegal invocation');
  throws('Object.create 当参数传', () => new UIView().addSubview(ghostView),
         'has no native object yet');
  assert('Object.create 的原型链本来就该是对的', ghostView instanceof UIView, true);

  // ---- 4. 对照：还没绑场景是合法状态，话术必须和上面不同 ----
  const unbound = new UIWindow();
  throws('new UIWindow() 读属性仍报「还没连接到场景」',
         () => unbound.rootViewController,
         'this object is not connected to a scene yet');

  // ---- 5. 正常构造一个都不能少 ----
  assert('new UIView()', new UIView() instanceof UIView, true);
  assert('new UILabel()', new UILabel().text, null);   // 默认是 nil，不是空串
  assert('new UIImageView()', new UIImageView() instanceof UIImageView, true);
  assert('new UIScrollView()', new UIScrollView().isScrollEnabled, true);
  assert('new UIStackView([...])', new UIStackView([new UIView()]).arrangedSubviews.length, 1);
  assert('new UIViewController()', new UIViewController().title, null);
  assert('new UIButton()', new UIButton().isEnabled, true);
  assert('new UIBarButtonItem({...})', new UIBarButtonItem({ title: '完成' }).title, '完成');
  assert('new UILayoutGuide()', new UILayoutGuide() instanceof UILayoutGuide, true);
  assert('new UINavigationController(root)',
         new UINavigationController(new UIViewController()).viewControllers.length, 1);
  assert('new Blob([...])', new Blob(['hi']).size, 2);

  // ---- 6. 包装工厂还走得通（它现在不走构造函数了）----
  // UIColor 常量、CALayer、锚点都是工厂建的，能读到属性就说明这条路没断
  const probe = new UIView();
  probe.backgroundColor = UIColor.systemRedColor;
  // 包装身份这一条直接在 UIColor 上验——属性读出来已经是字符串了
  assert('工厂建的 UIColor 还是同一个包装',
         UIColor.systemRedColor === UIColor.systemRedColor, true);
  assert('写 UIColor 对象，读回语义色的名字', probe.backgroundColor, 'systemRed');
  assert('工厂建的 CALayer 可用', typeof probe.layer.cornerRadius, 'number');
  assert('工厂建的锚点可用', probe.widthAnchor instanceof NSLayoutDimension, true);
}
