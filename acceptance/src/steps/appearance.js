import { customEventWorks } from '../support.js';
// 页面的出现和消失：beforeappear / appear / beforedisappear /
// disappear 四个事件。
//
// 原生类不支持继承（见 docs/api/native-classes.md），所以 UIKit 里靠覆写
// viewWillAppear: 得到的那几个时机，这里是页面上的事件。
//
// 这一步要真的呈现页面、还要用一次焦点，都是同一时刻只能有一个的东西，所以把
// 「全部做完」作为 Promise 返回，排在后面的步骤等它（见 main.js）。

const sleep = (/** @type {number} */ ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** 抛的是什么 @param {() => unknown} fn */
const thrown = (fn) => {
  try { fn(); return '没抛'; } catch (err) { return /** @type {Error} */ (err).constructor.name; }
};
/** 等条件成立，最多等 limit 毫秒 @param {() => boolean} ready @param {number} [limit] */
async function until(ready, limit = 4000) {
  const deadline = Date.now() + limit;
  while (!ready()) {
    if (Date.now() >= deadline) return false;
    await sleep(50);
  }
  return true;
}

const NAMES = /** @type {const} */ ([
  'beforeappear', 'appear', 'beforedisappear', 'disappear',
]);
const SHORT = {
  beforeappear: '将出现', appear: '已出现',
  beforedisappear: '将消失', disappear: '已消失',
};

/**
 * 给一个页面订上四个事件，记到同一份日志里
 * @param {UIViewController} page @param {string} name @param {string[]} log
 */
function watch(page, name, log) {
  for (const type of NAMES) {
    page.addEventListener(type, () => { log.push(name + SHORT[type]); });
  }
}
/** @param {string} title @param {string} color */
function makePage(title, color) {
  const page = new UIViewController();
  page.title = title;
  page.view.backgroundColor = color;
  return page;
}

/** @param {import("../main.js").StepContext} ctx */
export function stepAppearance(ctx) {
  const { assert } = ctx;
  const vc = ctx.vc;
  ctx.section('页面的出现和消失：四个事件（自动呈现几页再关掉）', 28);
  console.log('  --- 页面的出现和消失 ---');

  // ===== 1. 订阅 =====
  const probe = new UIViewController();
  const noop = () => {};
  assert('四个事件都订得上、退得掉', thrown(() => {
    for (const type of NAMES) probe.addEventListener(type, noop);
    for (const type of NAMES) probe.removeEventListener(type, noop);
  }), '没抛');
  assert('导航控制器上也订得上', thrown(() => {
    const nav = new UINavigationController();
    nav.addEventListener('appear', noop);
    nav.removeEventListener('appear', noop);
  }), '没抛');
  assert('标签栏控制器上也订得上', thrown(() => {
    const tabs = new UITabBarController();
    tabs.addEventListener('beforedisappear', noop);
    tabs.removeEventListener('beforedisappear', noop);
  }), '没抛');
  assert('不认识的事件名当自定义事件', customEventWorks(probe, 'not-a-real-event'), '收到一次');
  assert('viewdidload 不是运行时的事件（页面是 JS 自己建的），当自定义事件', customEventWorks(probe, 'viewdidload'), '收到一次');
  assert('视图上没有页面的出现事件，当自定义事件', customEventWorks(new UIButton(), 'beforeappear'), '收到一次');
  assert('没上过屏的页面不派发任何事件（订了也一样）', (() => {
    let n = 0;
    const idle = new UIViewController();
    for (const type of NAMES) idle.addEventListener(type, () => { n++; });
    return n;
  })(), 0);

  /** @type {() => void} */
  let finished = () => {};
  /** @type {Promise<void>} */
  const done = new Promise((resolve) => { finished = resolve; });

  (async () => {
    for (let waited = 0; vc.presentedViewController !== null && waited < 5000; waited += 200) {
      await sleep(200);
    }
    if (vc.presentedViewController !== null) {
      console.log('  ! 根页面上一直有别的模态在呈现，页面出现和消失这一组未验证');
      return;
    }

    // ===== 2. 模态呈现一页：出现两个、消失两个，各一次，顺序固定 =====
    console.log('  --- 页面的出现和消失：模态 ---');
    /** @type {string[]} */
    const log = [];
    /** @type {UIViewControllerAppearanceEvent[]} */
    const events = [];
    const sheet = makePage('模态页', 'systemTeal');
    watch(sheet, '模态', log);
    for (const type of NAMES) {
      sheet.addEventListener(type, (e) => {
        events.push(/** @type {UIViewControllerAppearanceEvent} */ (e));
      });
    }

    await vc.presentViewController(sheet, { animated: false });
    await until(() => log.includes('模态已出现'));
    assert('呈现一页：先 beforeappear 再 appear，各一次', log.join(' → '), '模态将出现 → 模态已出现');
    assert('事件的 type', events.length > 0 && events[0].type, 'beforeappear');
    assert('事件的 target 是这个页面', events.length > 0 && events[0].target === sheet, true);
    assert('事件不能取消', events.length > 0 && events[0].cancelable, false);
    assert('不带动画呈现：animated 是 false', events.length > 0 && events[0].animated, false);

    // ===== 3. 自动聚焦：appear 里拿焦点，不用定时器 =====
    const field = new UITextField();
    field.frame = new CGRect(20, 80, 200, 36);
    field.borderStyle = 'roundedRect';
    sheet.view.addSubview(field);
    const focused = field.becomeFirstResponder();
    assert('页面已经出现之后，becomeFirstResponder 一次就成', focused, true);
    field.resignFirstResponder();
    field.removeFromSuperview();

    log.length = 0;
    await sheet.dismissViewController({ animated: false });
    await until(() => log.includes('模态已消失'));
    assert('关掉：先 beforedisappear 再 disappear，各一次', log.join(' → '), '模态将消失 → 模态已消失');
    assert('一共派发了四个事件，没有多的', events.length, 4);

    // 同一页再呈现一次：照样派发；这次带动画
    log.length = 0;
    events.length = 0;
    await vc.presentViewController(sheet, { animated: true });
    await until(() => log.includes('模态已出现'));
    assert('同一页再呈现一次，照样派发', log.join(' → '), '模态将出现 → 模态已出现');
    assert('带动画呈现：animated 是 true', events.length > 0 && events[0].animated, true);
    await sheet.dismissViewController({ animated: false });
    await until(() => log.includes('模态已消失'));

    // ===== 4. appear 的回调里聚焦（真正的用法）=====
    const form = makePage('表单页', 'systemBackground');
    const input = new UITextField();
    input.frame = new CGRect(20, 80, 200, 36);
    input.borderStyle = 'roundedRect';
    form.view.addSubview(input);
    /** @type {boolean | null} */
    let focusedInListener = null;
    form.addEventListener('appear', () => { focusedInListener = input.becomeFirstResponder(); });
    await vc.presentViewController(form, { animated: true });
    await until(() => focusedInListener !== null);
    assert('在 appear 的回调里聚焦：成了，不用定时器', focusedInListener, true);
    assert('输入框是 first responder', input.isFirstResponder, true);
    input.resignFirstResponder();
    await form.dismissViewController({ animated: false });
    await sleep(100);

    // ===== 5. 摘掉监听器之后不再派发 =====
    const quiet = makePage('安静的页', 'systemGray');
    let heard = 0;
    const count = () => { heard++; };
    for (const type of NAMES) quiet.addEventListener(type, count);
    await vc.presentViewController(quiet, { animated: false });
    await until(() => heard >= 2);
    assert('订着的时候收到出现的两个', heard, 2);
    for (const type of NAMES) quiet.removeEventListener(type, count);
    await quiet.dismissViewController({ animated: false });
    await sleep(300);
    assert('摘掉监听器之后，消失的两个不再派发', heard, 2);

    // ===== 6. 导航：推入、返回 =====
    console.log('  --- 页面的出现和消失：导航 ---');
    const first = makePage('第一页', 'systemBackground');
    const second = makePage('第二页', 'systemBackground');
    const nav = new UINavigationController();
    nav.viewControllers = [first];
    /** @type {string[]} */
    const navLog = [];
    watch(nav, '导航', navLog);
    watch(first, '一', navLog);
    watch(second, '二', navLog);

    await vc.presentViewController(nav, { animated: false });
    await until(() => navLog.includes('一已出现') && navLog.includes('导航已出现'));
    assert('导航控制器自己也派发出现', navLog.includes('导航将出现') && navLog.includes('导航已出现'), true);
    assert('栈顶的那一页跟着出现', navLog.includes('一将出现') && navLog.includes('一已出现'), true);
    assert('没上屏的第二页不派发', navLog.some((line) => line.startsWith('二')), false);
    console.log('  实测：呈现一个导航控制器时的顺序 = ' + navLog.join(' → '));

    navLog.length = 0;
    nav.pushViewController(second, { animated: false });
    await until(() => navLog.includes('二已出现') && navLog.includes('一已消失'));
    assert('推入：旧的一页消失两个、新的一页出现两个',
           ['一将消失', '一已消失', '二将出现', '二已出现'].every((line) => navLog.includes(line)), true);
    assert('推入时「将」都排在「已」前面',
           navLog.indexOf('一将消失') < navLog.indexOf('一已消失') &&
           navLog.indexOf('二将出现') < navLog.indexOf('二已出现'), true);
    assert('推入不让导航控制器自己再出现一次', navLog.some((line) => line.startsWith('导航')), false);
    console.log('  实测：推入一页时的顺序 = ' + navLog.join(' → '));

    navLog.length = 0;
    nav.popViewController({ animated: false });
    await until(() => navLog.includes('一已出现') && navLog.includes('二已消失'));
    assert('返回：第二页消失两个、第一页再出现两个',
           ['二将消失', '二已消失', '一将出现', '一已出现'].every((line) => navLog.includes(line)), true);
    console.log('  实测：返回时的顺序 = ' + navLog.join(' → '));

    navLog.length = 0;
    await nav.dismissViewController({ animated: false });
    await until(() => navLog.includes('导航已消失') && navLog.includes('一已消失'));
    assert('关掉导航控制器：它和栈顶的页都消失',
           ['导航将消失', '导航已消失', '一将消失', '一已消失'].every((line) => navLog.includes(line)), true);

    // ===== 7. 标签栏：切换 =====
    console.log('  --- 页面的出现和消失：标签栏 ---');
    const home = makePage('首页', 'systemBackground');
    const mine = makePage('我的', 'systemBackground');
    const tabs = new UITabBarController();
    tabs.viewControllers = [home, mine];
    /** @type {string[]} */
    const tabLog = [];
    watch(home, '首页', tabLog);
    watch(mine, '我的', tabLog);
    await vc.presentViewController(tabs, { animated: false });
    await until(() => tabLog.includes('首页已出现'));
    assert('标签栏：选中的那一页出现', tabLog.includes('首页将出现') && tabLog.includes('首页已出现'), true);
    assert('没选中的那一页不派发', tabLog.some((line) => line.startsWith('我的')), false);
    tabLog.length = 0;
    tabs.selectedIndex = 1;
    await until(() => tabLog.includes('我的已出现') && tabLog.includes('首页已消失'));
    assert('切换标签：原来的消失、新的出现',
           ['首页将消失', '首页已消失', '我的将出现', '我的已出现'].every((line) => tabLog.includes(line)), true);
    console.log('  实测：切换标签时的顺序 = ' + tabLog.join(' → '));
    await tabs.dismissViewController({ animated: false });
    await sleep(100);

    // ===== 8. 盖住和露出：呈现的那一页有没有「消失」，取决于呈现方式 =====
    console.log('  --- 页面的出现和消失：被盖住 ---');
    const base = makePage('底下的页', 'systemBackground');
    const cover = makePage('全屏盖上来的', 'systemIndigo');
    cover.modalPresentationStyle = 'fullScreen';
    const card = makePage('卡片', 'systemOrange');
    /** @type {string[]} */
    const coverLog = [];
    watch(base, '底', coverLog);
    base.modalPresentationStyle = 'fullScreen';
    await vc.presentViewController(base, { animated: false });
    await until(() => coverLog.includes('底已出现'));

    coverLog.length = 0;
    await base.presentViewController(card, { animated: false });
    await sleep(400);
    assert('被卡片样式的页盖住：底下的页不派发消失（它还露着一截）', coverLog.join(' → '), '');
    await card.dismissViewController({ animated: false });
    await sleep(400);
    assert('卡片关掉：底下的页也不派发出现', coverLog.join(' → '), '');

    await base.presentViewController(cover, { animated: false });
    await until(() => coverLog.includes('底已消失'));
    assert('被全屏的页盖住：底下的页派发消失', coverLog.join(' → '), '底将消失 → 底已消失');
    coverLog.length = 0;
    await cover.dismissViewController({ animated: false });
    await until(() => coverLog.includes('底已出现'));
    assert('全屏的页关掉：底下的页再派发出现', coverLog.join(' → '), '底将出现 → 底已出现');
    await base.dismissViewController({ animated: false });
    await sleep(100);

    // ===== 9. 父子页面：子页面的视图加进一个在屏幕上的父页面 =====
    console.log('  --- 页面的出现和消失：父子页面 ---');
    const parent = makePage('父页面', 'systemBackground');
    const child = makePage('子页面', 'systemYellow');
    /** @type {string[]} */
    const childLog = [];
    watch(child, '子', childLog);
    await vc.presentViewController(parent, { animated: false });
    await sleep(200);
    parent.addChildViewController(child);
    child.view.frame = new CGRect(20, 100, 200, 100);
    parent.view.addSubview(child.view);
    child.didMoveToParentViewController(parent);
    await until(() => childLog.includes('子已出现'), 2000);
    console.log('  实测：子页面的视图加进屏幕上的父页面 = ' + (childLog.join(' → ') || '什么都没派发'));
    assert('子页面加进来：派发出现', childLog.includes('子将出现') && childLog.includes('子已出现'), true);
    childLog.length = 0;
    await parent.dismissViewController({ animated: false });
    await until(() => childLog.includes('子已消失'), 2000);
    assert('父页面关掉：子页面跟着派发消失', childLog.includes('子将消失') && childLog.includes('子已消失'), true);

    console.log('  ! 左滑返回中途取消、用户把卡片拖走，只有真实触摸能触发，自动跑的验收里未验证');
    console.log('  --- 页面的出现和消失：以上异步断言跑完 ---');
  })().catch((err) => {
    console.log('  ✗ 页面出现和消失这一步的异步部分中途抛了: ' +
                (err instanceof Error ? err.message : String(err)));
  }).then(async () => {
    // 不管中途怎样，别把模态页留在屏幕上挡住后面的步骤
    for (let i = 0; i < 4 && vc.presentedViewController !== null; i++) {
      const top = vc.presentedViewController;
      if (top !== null) await top.dismissViewController({ animated: false });
      await sleep(100);
    }
    finished();
  });
  return done;
}
