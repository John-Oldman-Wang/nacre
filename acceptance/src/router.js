// 一个最小的路由器，像 web 项目那样按路径跳页面。
//
// **它是用户侧的代码，不在运行时里。** 运行时只裸暴露 UINavigationController，
// 「路由」这层抽象由 JS 自己搭——这就是两层 API 的分工：底层保证能力完整，
// 上层怎么好用是写 App 的人（或者社区库）的自由。
//
// 一条关键设计：**原生栈是真相。**
// 返回按钮和左滑返回都不经过 router——用户的手指直接作用在 UIKit 上，router
// 根本不知道。所以它不能自己记一份权威的栈，只能在 didshow 里按
// nav.viewControllers.length **收缩**自己那份 path 栈。这和所有权镜像用
// ownAll「按原生真相整层重建」是同一个道理。

/**
 * @param {string} pattern 形如 '/detail/:id'
 * @param {string} path 形如 '/detail/42'
 * @returns {Record<string, string> | null} 命中时返回参数表
 */
function matchPath(pattern, path) {
  const pp = pattern.split('/').filter(Boolean);
  const parts = path.split('/').filter(Boolean);
  if (pp.length !== parts.length) return null;
  /** @type {Record<string, string>} */
  const params = {};
  for (let i = 0; i < pp.length; i++) {
    if (pp[i].startsWith(':')) params[pp[i].slice(1)] = parts[i];
    else if (pp[i] !== parts[i]) return null;
  }
  return params;
}

/**
 * @typedef {(params: Record<string, string>) => UIViewController} PageFactory
 */

/**
 * @param {UINavigationController} nav 已经带好根页面的导航控制器
 * @param {Record<string, PageFactory>} routes 路径模板 → 造页面的函数
 * @param {string} rootPath 根页面对应的路径
 */
export function createRouter(nav, routes, rootPath) {
  const table = Object.entries(routes);
  /** @type {string[]} */
  const paths = [rootPath];
  /** @type {((path: string, depth: number) => void)[]} */
  const watchers = [];

  // 返回按钮、左滑、popToRoot 都只会在这里露面，所以按原生栈的真相收缩
  nav.addEventListener('didshow', () => {
    while (paths.length > nav.viewControllers.length) paths.pop();
    const path = paths[paths.length - 1];
    for (const fn of watchers) fn(path, paths.length);
  });

  return {
    /** 当前路径 */
    get path() { return paths[paths.length - 1]; },
    /** 栈深，和 nav.viewControllers.length 一致 */
    get depth() { return paths.length; },

    /** 进一页。路径没登记就抛——和运行时拒绝不认识的枚举是一个态度 */
    push(/** @type {string} */ path) {
      for (const [pattern, make] of table) {
        const params = matchPath(pattern, path);
        if (params === null) continue;
        const page = make(params);
        paths.push(path);
        nav.pushViewController(page, { animated: true });
        return page;
      }
      throw new Error('no route matches ' + path);
    },

    /** 退一页。和点返回按钮、左滑走的是同一条路 */
    back() { nav.popViewController({ animated: true }); },

    /** 回到根 */
    home() { nav.popToRootViewController({ animated: true }); },

    /** 路径变了就叫一次（包括返回按钮和左滑引起的变化） */
    onChange(/** @type {(path: string, depth: number) => void} */ fn) {
      watchers.push(fn);
    },
  };
}
