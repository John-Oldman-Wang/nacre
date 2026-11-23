// JS 层的继承：JS 的类可以继承原生类，但继承只在 JS 这一层。原生那边建的永远是
// 原型链上最近的那个原生类，原生世界里没有 JS 子类这个类型；子类覆写的方法只对
// JS 自己的调用生效，系统不会来调。系统要告诉 JS 什么，只走事件。

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
  console.log('  --- JS 层的继承 ---');
  const activity = application.activity;

  class Card extends TextView {
    #flips = 0;
    /** @param {Context} context */
    constructor(context) {
      super(context);
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

  const card = new Card(activity);
  assert('new 子类能建', card instanceof Card, true);
  assert('子类实例也是 TextView', card instanceof TextView, true);
  assert('子类实例也是 View', card instanceof View, true);
  assert('构造函数里设的 text 读得回来', card.text, '开');
  assert('子类自己的字段', /** @type {any} */ (card).label, '卡片');
  assert('子类的方法和私有字段', card.toggle(), 1);
  assert('子类的方法改了原生的文字', card.text, '关');

  class Row extends LinearLayout {}
  const row = new Row(activity);
  assert('继承具体的布局类能建', row instanceof Row && row instanceof ViewGroup, true);
  row.addView(card);
  assert('从原生读回来是同一个子类实例', row.getChildAt(0) === card, true);
  assert('读回来的还是子类', row.getChildAt(0) instanceof Card, true);

  class Grandchild extends Card {}
  const grand = new Grandchild(activity);
  assert('隔两层继承也能建', grand instanceof Card && grand.text === '开', true);

  // ===== 不能建的 =====
  class MyGroup extends ViewGroup {}
  assert('继承抽象类 ViewGroup，new 抛 TypeError', thrown(() => new MyGroup(activity)), 'TypeError');
  class MyActivity extends Activity {}
  assert('继承 Activity，new 抛 TypeError', thrown(() => new MyActivity()), 'TypeError');
  class MyContext extends Context {}
  assert('继承 Context，new 抛 TypeError', thrown(() => new MyContext()), 'TypeError');
  assert('子类不给 context 抛 TypeError', thrown(() => new Card(/** @type {any} */ (undefined))), 'TypeError');

  // ===== 系统不调 JS 的覆写 =====
  // 挂到屏幕上，让系统真的画几帧（竖切那一步已经跑完，换掉页面的内容）；
  // 子类里的 onDraw 只是一个普通的 JS 方法，系统看不见它
  const screen = new LinearLayout(activity);
  screen.setPadding(0, 400, 0, 0);
  screen.addView(row);
  activity.setContentView(screen);
  card.text = '画出来了';
  await sleep(500);
  assert('子类实例在屏幕上（父视图就是挂上去的那个）', screen.getChildAt(0) === row, true);
  assert('子类里的 onDraw 系统不会来调', /** @type {any} */ (card).drawCalls, undefined);
}
