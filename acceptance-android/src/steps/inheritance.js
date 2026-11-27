// JS 层的继承：JS 的类可以继承原生类，但继承只在 JS 这一层。原生那边建的永远是
// 原型链上最近的那个原生类，原生世界里没有 JS 子类这个类型；子类覆写的方法只对
// JS 自己的调用生效，系统不会来调。系统要告诉 JS 什么，只走事件。
// 构造不传参数：视图建出来是自由的，挂上树才建原生对象。

/**
 * 抛了什么：没抛是「没抛」，抛了是错误的 name
 * @param {() => unknown} fn
 */
function thrown(fn) {
  try {
    fn();
    return '没抛';
  } catch (err) {
    return err instanceof Error ? err.name : typeof err;
  }
}

/** @param {number} ms */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** @param {import("../main.js").StepContext} ctx */
export async function stepInheritance(ctx) {
  const { assert } = ctx;
  const activity = /** @type {Activity} */ (ctx.activity);
  console.log('  --- JS 层的继承 ---');

  class Card extends TextView {
    #flips = 0;
    constructor() {
      super();
      this.label = '卡片';
      this.text = '开';
    }
    toggle() {
      this.#flips++;
      this.text = this.text === '开' ? '关' : '开';
      return this.#flips;
    }
    // 系统不会来调它：覆写只对 JS 自己的调用生效
    onDraw() {
      this.drawCalls = (this.drawCalls || 0) + 1;
    }
  }

  const card = new Card();
  assert('new 子类不传参数能建', card instanceof Card, true);
  assert('子类实例也是 TextView', card instanceof TextView, true);
  assert('子类实例也是 View', card instanceof View, true);
  assert('子类实例建出来是自由的', card.activity, null);
  assert('构造函数里设的 text 读得回来', card.text, '开');
  assert('子类自己的字段', /** @type {any} */ (card).label, '卡片');
  assert('子类的方法和私有字段', card.toggle(), 1);
  assert('子类的方法改了文字', card.text, '关');

  class Row extends LinearLayout {}
  const row = new Row();
  assert('继承具体的布局类能建', row instanceof Row && row instanceof ViewGroup, true);
  row.addView(card);
  assert('children 里是同一个子类实例', row.children[0] === card, true);
  assert('children 里的还是子类', row.children[0] instanceof Card, true);
  assert('子视图的 parent 是子类的布局', card.parent === row, true);

  class Grandchild extends Card {}
  const grand = new Grandchild();
  assert('隔两层继承也能建', grand instanceof Card && grand.text === '开', true);

  // ===== 不能建的 =====
  class MyGroup extends ViewGroup {}
  assert('继承抽象类 ViewGroup，new 抛 TypeError', thrown(() => new MyGroup()), 'TypeError');
  class MyActivity extends Activity {}
  assert('继承 Activity，new 抛 TypeError', thrown(() => new MyActivity()), 'TypeError');

  // ===== 系统不调 JS 的覆写 =====
  // 挂到屏幕上，让系统真的画几帧（竖切那一步已经跑完，换掉页面的内容）；
  // 子类里的 onDraw 只是一个普通的 JS 方法，系统看不见它
  const screen = new LinearLayout();
  screen.paddingTop = 160;
  screen.addView(row);
  activity.contentView = screen;
  card.text = '画出来了';
  await sleep(500);
  assert('子类实例挂上了', card.activity === activity && row.activity === activity, true);
  assert('挂上之后 children 里还是同一个子类实例', screen.children[0] === row && row.children[0] === card, true);
  assert('挂上之后改的文字读得回来', card.text, '画出来了');
  assert('子类里的 onDraw 系统不会来调', /** @type {any} */ (card).drawCalls, undefined);
}
