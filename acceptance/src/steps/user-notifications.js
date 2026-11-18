import { customEventWorks, enumIgnored, ENUM_IGNORED } from '../support.js';
// 通知：UNUserNotificationCenter 和它周围的一组值。
// 能力包 @nacrejs/user-notifications，装了才有这些全局。
//
// 分三段：
//   1. 自动跑的、同步的：类和单例、每个成员在不在、内容 / 触发器 / 请求这些值
//      怎么建、写错时抛什么、不做的成员不存在、前台显示选项的读写。
//      **一个系统界面都不弹**：申请授权只验参数写错的那几种，它们在到系统之前
//      就抛了。
//   2. 自动跑的、异步的：读设置、查两张列表、排一条很久以后才到的通知再撤掉。
//      没授权时系统怎么答（兑现还是拒绝、拒绝的是哪个错误码）没有量过，所以
//      这几处只断言「结算了」，结果打成一行记录，不写死期望。
//   3. 一个区块里的八个按钮：申请授权、5 秒后发、立刻发、撤掉、查列表、设角标、
//      清角标、切换前台显示。会弹系统界面或者要等通知到的都在这里，要人点。
//
// 期望值的来源：
//   - 「时间间隔必须大于 0」「重复的间隔至少 60 秒」「请求拿到的是内容的副本」
//     「新建的内容各个字符串是空的」是在 Mac 上用命令行探针量的（macOS 27，
//     同一个框架），不是在 iOS 上量的
//   - 枚举的取值来自头文件
//   - 默认的前台显示选项是空的：这是运行时自己存的值，不是系统的

import { panelRow } from './pasteboard.js';

const STATUSES = ['notDetermined', 'denied', 'authorized', 'provisional', 'ephemeral'];
const SETTINGS = ['notSupported', 'disabled', 'enabled'];
const ALERT_STYLES = ['none', 'banner', 'alert'];
const PREVIEWS = ['always', 'whenAuthenticated', 'never'];
// 十一个取值是 notSupported / disabled / enabled 的设置项
const SETTING_FIELDS = /** @type {const} */ ([
  'soundSetting', 'badgeSetting', 'alertSetting', 'notificationCenterSetting',
  'lockScreenSetting', 'carPlaySetting', 'criticalAlertSetting', 'announcementSetting',
  'timeSensitiveSetting', 'scheduledDeliverySetting', 'directMessagesSetting',
]);

/**
 * 等一个 Promise，到点没结算给 'timeout'。
 *
 * @template T
 * @param {Promise<T>} promise
 * @param {number} limitMs
 * @returns {Promise<{ ok: true, value: T } | { ok: false, error: any } | 'timeout'>}
 */
function settle(promise, limitMs) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve('timeout'), limitMs);
    promise.then(
      (value) => { clearTimeout(timer); resolve({ ok: true, value }); },
      (error) => { clearTimeout(timer); resolve({ ok: false, error }); });
  });
}

// 写成 JSON，对象的键按字典序排。从系统读回来的 userInfo 过了一趟系统的字典，
// 键的先后不保证和写进去时一样
/** @param {unknown} value @returns {string} */
function canonical(value) {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value !== null && typeof value === 'object') {
    const o = /** @type {Record<string, unknown>} */ (value);
    return '{' + Object.keys(o).sort().map((k) => JSON.stringify(k) + ':' + canonical(o[k]))
      .join(',') + '}';
  }
  return JSON.stringify(value);
}

/** @param {number} ms */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** @param {unknown} err */
const describeError = (err) => {
  const e = /** @type {any} */ (err);
  return (e && e.name) + '（code ' + (e && e.code) + '，domain ' + (e && e.domain) + '）' +
         (e && e.message);
};

/** @param {UNNotificationRequest} request */
function describeRequest(request) {
  const trigger = request.trigger;
  let when = '立刻';
  if (trigger instanceof UNTimeIntervalNotificationTrigger) {
    when = trigger.timeInterval + ' 秒后' + (trigger.repeats ? '，重复' : '');
  } else if (trigger instanceof UNCalendarNotificationTrigger) {
    when = '日期 ' + JSON.stringify(trigger.dateComponents) + (trigger.repeats ? '，重复' : '');
  } else if (trigger instanceof UNPushNotificationTrigger) {
    when = '远程推送';
  } else if (trigger !== null) {
    when = '别的触发方式';
  }
  const content = request.content;
  return request.identifier + '：「' + content.title + '」「' + content.body + '」 角标 ' +
         content.badge + ' 声音 ' + (content.sound === null ? '无' : '有') + ' ' + when +
         ' userInfo ' + JSON.stringify(content.userInfo);
}

/** @param {import("../main.js").StepContext} ctx */
export function stepUserNotifications(ctx) {
  console.log('--- 通知：UNUserNotificationCenter ---');

  // 这一步的断言名字都带上「通知：」，免得和别的步骤撞名
  /** @param {string} label @param {unknown} actual @param {unknown} expected */
  const assert = (label, actual, expected) => ctx.assert('通知：' + label, actual, expected);

  // 期望抛 TypeError，报错信息里有 needle。走断言函数，算进断言总数
  /** @param {string} label @param {() => void} fn @param {string} needle */
  const throws = (label, fn, needle) => {
    let outcome = '没抛';
    try {
      fn();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      outcome = err instanceof TypeError && message.includes(needle)
        ? 'TypeError，信息里有 ' + needle
        : (err instanceof Error ? err.name : typeof err) + '：' + message;
    }
    assert(label, outcome, 'TypeError，信息里有 ' + needle);
  };

  // 一组断言中途抛了（比如能力包还没接进来）只废这一组，不连累后面的
  /** @param {string} name @param {() => void} fn */
  const group = (name, fn) => {
    try {
      fn();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log('  ✗ 通知：' + name + ' 这一组中断了 = ' + message + '（期望跑完）');
    }
  };

  /** @type {UNUserNotificationCenter | undefined} */
  let shared;

  // =====================================================================
  group('类和单例', () => {
    for (const name of ['UNUserNotificationCenter', 'UNNotificationSettings',
                        'UNNotificationSound', 'UNNotificationContent',
                        'UNMutableNotificationContent', 'UNNotificationTrigger',
                        'UNTimeIntervalNotificationTrigger', 'UNCalendarNotificationTrigger',
                        'UNPushNotificationTrigger', 'UNNotificationRequest', 'UNNotification',
                        'UNNotificationResponse']) {
      assert('全局上有 ' + name, typeof /** @type {any} */ (globalThis)[name], 'function');
    }
    const center = UNUserNotificationCenter.currentNotificationCenter();
    shared = center;
    assert('currentNotificationCenter() 是 UNUserNotificationCenter',
           center instanceof UNUserNotificationCenter, true);
    assert('它是 NSObject', center instanceof NSObject, true);
    assert('它能挂监听器（EventTarget）', center instanceof EventTarget, true);
    assert('每次拿到同一个对象', UNUserNotificationCenter.currentNotificationCenter() === center,
           true);
    // 方法被摘下来单独调用，拿到的还是那一个
    const detached = UNUserNotificationCenter.currentNotificationCenter;
    assert('摘下来单独调用也是同一个对象', detached() === center, true);
    throws('不能 new', () => {
      // @ts-expect-error 构造函数不公开
      new UNUserNotificationCenter();
    }, 'Illegal constructor');
    // 原生类一律是 final
    // @ts-expect-error 构造函数不公开，所以类型上也不让继承
    class Mine extends UNUserNotificationCenter {}
    throws('不能继承', () => {
      // @ts-expect-error 构造函数不公开
      new Mine();
    }, 'Illegal constructor');
  });

  group('成员都在', () => {
    const center = UNUserNotificationCenter.currentNotificationCenter();
    for (const name of ['requestAuthorizationWithOptions', 'getNotificationSettings',
                        'addNotificationRequest', 'getPendingNotificationRequests',
                        'removePendingNotificationRequestsWithIdentifiers',
                        'removeAllPendingNotificationRequests', 'getDeliveredNotifications',
                        'removeDeliveredNotificationsWithIdentifiers',
                        'removeAllDeliveredNotifications', 'setBadgeCount']) {
      assert('center.' + name + ' 是方法', typeof /** @type {any} */ (center)[name], 'function');
    }
    assert('center 上有 foregroundPresentationOptions', 'foregroundPresentationOptions' in center,
           true);
  });

  // =====================================================================
  group('明确不做的：没有这些名字', () => {
    const center = UNUserNotificationCenter.currentNotificationCenter();
    const g = /** @type {any} */ (globalThis);
    // 委托换成了事件和一个属性；分类和动作、内容扩展没做
    for (const name of ['delegate', 'supportsContentExtensions', 'setNotificationCategories',
                        'getNotificationCategories']) {
      assert('center 上没有 ' + name, name in center, false);
    }
    for (const name of ['UNNotificationCategory', 'UNNotificationAction',
                        'UNTextInputNotificationAction', 'UNTextInputNotificationResponse',
                        'UNNotificationAttachment', 'UNLocationNotificationTrigger',
                        'UNNotificationServiceExtension', 'UNNotificationActionIcon']) {
      assert('全局上没有 ' + name, typeof g[name], 'undefined');
    }
    // 声音只有默认的那一个
    for (const name of ['soundNamed', 'defaultCriticalSound', 'defaultRingtoneSound',
                        'criticalSoundNamed', 'ringtoneSoundNamed',
                        'defaultCriticalSoundWithAudioVolume']) {
      assert('UNNotificationSound 上没有 ' + name, name in UNNotificationSound, false);
    }
    const content = new UNMutableNotificationContent();
    for (const name of ['attachments', 'categoryIdentifier', 'launchImageName',
                        'summaryArgument', 'summaryArgumentCount', 'targetContentIdentifier',
                        'interruptionLevel', 'relevanceScore', 'filterCriteria']) {
      assert('内容上没有 ' + name, name in content, false);
    }
    const trigger = UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(5);
    assert('触发器上没有 nextTriggerDate', 'nextTriggerDate' in trigger, false);
    throws('调没做的方法抛 TypeError', () => {
      // @ts-expect-error 没有这个方法
      center.setNotificationCategories([]);
    }, 'setNotificationCategories');
  });

  // =====================================================================
  group('前台显示选项：默认是空的，四个名字', () => {
    const center = UNUserNotificationCenter.currentNotificationCenter();
    const before = center.foregroundPresentationOptions;
    assert('foregroundPresentationOptions 是数组', Array.isArray(before), true);
    assert('默认是空的（前台收到的通知不显示）', before.join(','), '');
    center.foregroundPresentationOptions = ['banner', 'sound'];
    // 读出来按系统里那几个位的先后排：badge、sound、list、banner
    assert('写 banner、sound 读回这两个', center.foregroundPresentationOptions.join(','),
           'sound,banner');
    center.foregroundPresentationOptions = ['banner', 'list', 'sound', 'badge', 'banner'];
    assert('四个都写（重复的不算两次）', center.foregroundPresentationOptions.join(','),
           'badge,sound,list,banner');
    const read = center.foregroundPresentationOptions;
    read.push('badge');
    assert('每次读是新的数组，改它不影响设置', center.foregroundPresentationOptions.length, 4);
    assert('不认识的名字：不抛、值不变', enumIgnored(() => {
      // @ts-expect-error 没有这个名字
      center.foregroundPresentationOptions = ['popup'];
    }, () => center.foregroundPresentationOptions), ENUM_IGNORED);
    assert('alert 这个旧名字不收（系统已经拆成 list 和 banner）：不抛、值不变', enumIgnored(() => {
      // @ts-expect-error 没有这个名字
      center.foregroundPresentationOptions = ['alert'];
    }, () => center.foregroundPresentationOptions), ENUM_IGNORED);
    throws('不是数组被拒：字符串', () => {
      // @ts-expect-error 要数组
      center.foregroundPresentationOptions = 'banner';
    }, 'foregroundPresentationOptions');
    throws('不是数组被拒：null', () => {
      // @ts-expect-error 要数组
      center.foregroundPresentationOptions = null;
    }, 'foregroundPresentationOptions');
    throws('不是数组被拒：undefined', () => {
      // @ts-expect-error 要数组
      center.foregroundPresentationOptions = undefined;
    }, 'foregroundPresentationOptions');
    assert('写错之后原值不动', center.foregroundPresentationOptions.join(','),
           'badge,sound,list,banner');
    center.foregroundPresentationOptions = [];
    assert('写空数组读回空的', center.foregroundPresentationOptions.length, 0);
  });

  // =====================================================================
  group('申请授权：参数写错在到系统之前就抛（不弹提示框）', () => {
    const center = UNUserNotificationCenter.currentNotificationCenter();
    throws('不带参数被拒', () => {
      // @ts-expect-error 少了选项
      center.requestAuthorizationWithOptions();
    }, 'requestAuthorizationWithOptions');
    throws('选项不是数组被拒', () => {
      // @ts-expect-error 要数组
      center.requestAuthorizationWithOptions('alert');
    }, 'requestAuthorizationWithOptions');
    throws('不认识的选项被拒，并列出可选的', () => {
      // @ts-expect-error 没有这个名字
      center.requestAuthorizationWithOptions(['alert', 'popup']);
    }, 'badge / sound / alert / carPlay / criticalAlert / providesAppNotificationSettings / ' +
       'provisional');
    throws('announcement 不收（系统已经废弃）', () => {
      // @ts-expect-error 没有这个名字
      center.requestAuthorizationWithOptions(['announcement']);
    }, 'provisional');
  });

  // =====================================================================
  group('声音：只有默认的那一个', () => {
    const sound = UNNotificationSound.defaultSound;
    assert('defaultSound 是 UNNotificationSound', sound instanceof UNNotificationSound, true);
    assert('每次读是同一个对象', UNNotificationSound.defaultSound === sound, true);
    throws('UNNotificationSound 不能 new', () => {
      // @ts-expect-error 构造函数不公开
      new UNNotificationSound();
    }, 'Illegal constructor');
    throws('defaultSound 只读', () => {
      // @ts-expect-error 只读
      UNNotificationSound.defaultSound = null;
    }, 'defaultSound');
  });

  // =====================================================================
  group('内容：UNMutableNotificationContent', () => {
    const content = new UNMutableNotificationContent();
    assert('是 UNMutableNotificationContent', content instanceof UNMutableNotificationContent,
           true);
    assert('也是 UNNotificationContent', content instanceof UNNotificationContent, true);
    assert('title 默认是空串', content.title, '');
    assert('subtitle 默认是空串', content.subtitle, '');
    assert('body 默认是空串', content.body, '');
    assert('threadIdentifier 默认是空串', content.threadIdentifier, '');
    assert('badge 默认是 null（不改角标）', content.badge, null);
    assert('sound 默认是 null（不响）', content.sound, null);
    assert('userInfo 默认是空对象', JSON.stringify(content.userInfo), '{}');

    content.title = '订单已发货';
    content.subtitle = '顺丰';
    content.body = '预计明天送达';
    content.threadIdentifier = 'orders';
    assert('写 title 读回', content.title, '订单已发货');
    assert('写 subtitle 读回', content.subtitle, '顺丰');
    assert('写 body 读回', content.body, '预计明天送达');
    assert('写 threadIdentifier 读回', content.threadIdentifier, 'orders');
    // 字符串照 Web 的规矩转
    // @ts-expect-error 类型上要字符串
    content.title = 5;
    assert("title 写 5 读回 '5'", content.title, '5');
    // @ts-expect-error 类型上要字符串
    content.title = null;
    assert('title 写 null 读回空串', content.title, '');

    content.badge = 3;
    assert('badge 写 3 读回 3', content.badge, 3);
    // @ts-expect-error 类型上要数
    content.badge = '7';
    assert("badge 写 '7' 读回数 7", content.badge, 7);
    content.badge = 2.9;
    assert('badge 写 2.9 向零取整成 2', content.badge, 2);
    content.badge = 0;
    assert('badge 写 0 读回 0（把角标去掉）', content.badge, 0);
    throws('badge 写负数被拒', () => { content.badge = -1; }, 'badge');
    throws('badge 写转不出数的被拒', () => {
      // @ts-expect-error 要数
      content.badge = 'many';
    }, 'badge');
    assert('badge 写错之后原值不动', content.badge, 0);
    content.badge = null;
    assert('badge 写 null 读回 null', content.badge, null);

    content.sound = UNNotificationSound.defaultSound;
    assert('sound 写默认的声音读回同一个对象', content.sound === UNNotificationSound.defaultSound,
           true);
    throws('sound 写字符串被拒', () => {
      // @ts-expect-error 要 UNNotificationSound 或 null
      content.sound = 'default';
    }, 'sound');
    content.sound = null;
    assert('sound 写 null 读回 null', content.sound, null);

    const info = { orderId: 'A1024', items: [1, 'two', true], nested: { deep: 0.5 } };
    content.userInfo = info;
    assert('userInfo 读回的内容一样', JSON.stringify(content.userInfo), JSON.stringify(info));
    assert('userInfo 读回的不是写进去的那个对象（存的是副本）', content.userInfo !== info, true);
    info.orderId = 'changed';
    assert('之后改原来的对象不影响内容', content.userInfo.orderId, 'A1024');
    throws('读出来的 userInfo 不能改', () => {
      /** @type {any} */ (content.userInfo).orderId = 'x';
    }, 'orderId');
    throws('userInfo 里面一层也不能改', () => {
      /** @type {any} */ (content.userInfo).nested.deep = 1;
    }, 'deep');
    throws('userInfo 写字符串被拒', () => {
      // @ts-expect-error 要对象
      content.userInfo = 'A1024';
    }, 'userInfo');
    throws('userInfo 写数组被拒', () => {
      // @ts-expect-error 要对象
      content.userInfo = [1, 2];
    }, 'userInfo');
    throws('userInfo 里有 null 被拒', () => {
      content.userInfo = { a: { b: null } };
    }, 'userInfo.a.b');
    throws('userInfo 里有转不成 JSON 的数被拒', () => {
      content.userInfo = { n: NaN };
    }, 'userInfo.n');
    const loop = /** @type {any} */ ({});
    loop.self = loop;
    throws('userInfo 里有环被拒', () => { content.userInfo = loop; }, 'userInfo');
    assert('userInfo 写错之后原值不动', content.userInfo.orderId, 'A1024');
    // @ts-expect-error 类型上要对象
    content.userInfo = null;
    assert('userInfo 写 null 读回空对象', JSON.stringify(content.userInfo), '{}');

    throws('内容上不能加字段', () => { /** @type {any} */ (content).extra = 1; }, 'extensible');
    throws('UNNotificationContent 不能 new', () => {
      // @ts-expect-error 构造函数不公开
      new UNNotificationContent();
    }, 'Illegal constructor');
    class Mine extends UNMutableNotificationContent {}
    throws('UNMutableNotificationContent 不能继承', () => { new Mine(); }, 'Illegal constructor');
  });

  // =====================================================================
  group('触发器：过多少秒', () => {
    const once = UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(5);
    assert('是 UNTimeIntervalNotificationTrigger',
           once instanceof UNTimeIntervalNotificationTrigger, true);
    assert('也是 UNNotificationTrigger', once instanceof UNNotificationTrigger, true);
    assert('timeInterval 是 5', once.timeInterval, 5);
    assert('repeats 不带就是 false', once.repeats, false);
    const half = UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(0.5, { repeats: false });
    assert('不到一秒也可以', half.timeInterval, 0.5);
    const every = UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(60, { repeats: true });
    assert('重复的：repeats 是 true', every.repeats, true);
    assert('重复的：timeInterval 是 60', every.timeInterval, 60);
    // @ts-expect-error 类型上要数，运行时照 Web 的规矩转
    const converted = UNTimeIntervalNotificationTrigger.triggerWithTimeInterval('90', { repeats: 1 });
    assert("'90' 按数转", converted.timeInterval, 90);
    assert('repeats 写 1 按布尔转', converted.repeats, true);
    throws('间隔是 0 被拒', () => {
      UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(0);
    }, 'greater than 0');
    throws('间隔是负数被拒', () => {
      UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(-3);
    }, 'greater than 0');
    throws('间隔转不出数被拒', () => {
      // @ts-expect-error 要数
      UNTimeIntervalNotificationTrigger.triggerWithTimeInterval('soon');
    }, 'timeInterval');
    throws('不带间隔被拒', () => {
      // @ts-expect-error 少了间隔
      UNTimeIntervalNotificationTrigger.triggerWithTimeInterval();
    }, 'timeInterval');
    throws('重复的间隔不到 60 秒被拒', () => {
      UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(59, { repeats: true });
    }, 'at least 60');
    throws('timeInterval 只读', () => {
      // @ts-expect-error 只读
      once.timeInterval = 10;
    }, 'read-only');
    throws('repeats 只读', () => {
      // @ts-expect-error 只读
      once.repeats = true;
    }, 'read-only');
    throws('触发器上不能加字段', () => { /** @type {any} */ (once).note = 1; }, 'extensible');
    throws('UNTimeIntervalNotificationTrigger 不能 new', () => {
      // @ts-expect-error 构造函数不公开
      new UNTimeIntervalNotificationTrigger();
    }, 'Illegal constructor');
    throws('UNNotificationTrigger 不能 new', () => {
      // @ts-expect-error 构造函数不公开
      new UNNotificationTrigger();
    }, 'Illegal constructor');
    throws('UNPushNotificationTrigger 不能 new', () => {
      // @ts-expect-error 构造函数不公开
      new UNPushNotificationTrigger();
    }, 'Illegal constructor');
  });

  group('触发器：匹配日期的分量', () => {
    const source = { hour: 8, minute: 30 };
    const daily = UNCalendarNotificationTrigger.triggerWithDateMatchingComponents(
      source, { repeats: true });
    assert('是 UNCalendarNotificationTrigger', daily instanceof UNCalendarNotificationTrigger,
           true);
    assert('日期的触发器也是 UNNotificationTrigger', daily instanceof UNNotificationTrigger, true);
    assert('日期的触发器 repeats 是 true', daily.repeats, true);
    assert('dateComponents 里只有写了的那几个分量', Object.keys(daily.dateComponents).join(','),
           'hour,minute');
    assert('hour 是 8', daily.dateComponents.hour, 8);
    assert('minute 是 30', daily.dateComponents.minute, 30);
    assert('没写的分量读出来是 undefined', daily.dateComponents.day, undefined);
    source.hour = 9;
    assert('之后改原来的对象不影响触发器', daily.dateComponents.hour, 8);
    throws('dateComponents 不能改', () => {
      /** @type {any} */ (daily.dateComponents).hour = 10;
    }, 'hour');
    assert('每次读 dateComponents 是同一个对象', daily.dateComponents === daily.dateComponents,
           true);
    throws('dateComponents 这个字段只读', () => {
      // @ts-expect-error 只读
      daily.dateComponents = {};
    }, 'read-only');

    const once = UNCalendarNotificationTrigger.triggerWithDateMatchingComponents(
      { year: 2099, month: 1, day: 1, hour: 9, minute: 0, second: 0, weekday: undefined });
    assert('日期的触发器 repeats 不带就是 false', once.repeats, false);
    assert('值是 undefined 的分量视为没带', Object.keys(once.dateComponents).join(','),
           'year,month,day,hour,minute,second');
    const all = UNCalendarNotificationTrigger.triggerWithDateMatchingComponents({
      era: 1, year: 2030, month: 6, day: 15, hour: 7, minute: 5, second: 3, nanosecond: 0,
      weekday: 7, weekdayOrdinal: 3, quarter: 2, weekOfMonth: 3, weekOfYear: 24,
      yearForWeekOfYear: 2030, dayOfYear: 166,
    });
    assert('十五个分量都认', Object.keys(all.dateComponents).length, 15);
    const converted = UNCalendarNotificationTrigger.triggerWithDateMatchingComponents(
      // @ts-expect-error 类型上要数，运行时照 Web 的规矩转
      { hour: '21', minute: 59.9, second: null });
    assert("分量写 '21' 按数转", converted.dateComponents.hour, 21);
    assert('分量写 59.9 向零取整成 59', converted.dateComponents.minute, 59);
    assert('分量写 null 视为没带', 'second' in converted.dateComponents, false);
    // 系统不检查分量凑不凑得出一个日期，建的时候不抛（Mac 上量的）
    const empty = UNCalendarNotificationTrigger.triggerWithDateMatchingComponents({});
    assert('一个分量都不写也建得出来', Object.keys(empty.dateComponents).length, 0);

    throws('不认识的分量被拒，并列出可选的', () => {
      UNCalendarNotificationTrigger.triggerWithDateMatchingComponents(
        // @ts-expect-error 没有这个分量
        { hours: 8 });
    }, 'weekday');
    throws('分量转不出数被拒', () => {
      UNCalendarNotificationTrigger.triggerWithDateMatchingComponents(
        // @ts-expect-error 要数
        { hour: 'eight' });
    }, 'hour');
    throws('分量不是对象被拒', () => {
      // @ts-expect-error 要对象
      UNCalendarNotificationTrigger.triggerWithDateMatchingComponents('08:30');
    }, 'dateComponents');
    throws('不带分量被拒', () => {
      // @ts-expect-error 少了分量
      UNCalendarNotificationTrigger.triggerWithDateMatchingComponents();
    }, 'dateComponents');
    throws('拿 Date 当分量被拒', () => {
      // @ts-expect-error 要分量，不是 Date
      UNCalendarNotificationTrigger.triggerWithDateMatchingComponents(new Date());
    }, 'dateComponents');
    throws('UNCalendarNotificationTrigger 不能 new', () => {
      // @ts-expect-error 构造函数不公开
      new UNCalendarNotificationTrigger();
    }, 'Illegal constructor');
  });

  // =====================================================================
  group('请求：UNNotificationRequest', () => {
    const content = new UNMutableNotificationContent();
    content.title = '第一版';
    content.userInfo = { v: 1 };
    const trigger = UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(5);
    const request = UNNotificationRequest.requestWithIdentifier('order-1', { content, trigger });
    assert('是 UNNotificationRequest', request instanceof UNNotificationRequest, true);
    assert('identifier', request.identifier, 'order-1');
    assert('trigger 是给的那一个', request.trigger === trigger, true);
    assert('content 是 UNNotificationContent', request.content instanceof UNNotificationContent,
           true);
    // 请求拿到的是内容在那一刻的副本，之后改内容不影响已经建好的请求
    assert('content 不是可变的那个类', request.content instanceof UNMutableNotificationContent,
           false);
    content.title = '第二版';
    assert('建好之后改内容，请求里的不变', request.content.title, '第一版');
    assert('请求里的 userInfo', request.content.userInfo.v, 1);
    assert('每次读 content 是同一个对象', request.content === request.content, true);
    throws('请求里的内容只读', () => {
      // @ts-expect-error 只读
      request.content.title = '改';
    }, 'read-only');
    throws('identifier 只读', () => {
      // @ts-expect-error 只读
      request.identifier = 'x';
    }, 'read-only');
    throws('请求上不能加字段', () => { /** @type {any} */ (request).note = 1; }, 'extensible');

    const now = UNNotificationRequest.requestWithIdentifier('now', { content });
    assert('不带 trigger 是 null（立刻送达）', now.trigger, null);
    const explicit = UNNotificationRequest.requestWithIdentifier('now', { content, trigger: null });
    assert('trigger 写 null 也是 null', explicit.trigger, null);
    // @ts-expect-error 类型上要字符串
    const numbered = UNNotificationRequest.requestWithIdentifier(42, { content });
    assert("identifier 写 42 读回 '42'", numbered.identifier, '42');
    // 只读的内容（从别的请求里拿的）也能再用来建请求
    const reused = UNNotificationRequest.requestWithIdentifier('again', { content: now.content });
    assert('拿只读的内容再建一个请求', reused.content.title, '第二版');

    throws('不带选项被拒', () => {
      // @ts-expect-error 少了 content
      UNNotificationRequest.requestWithIdentifier('x');
    }, 'content');
    throws('不带 content 被拒', () => {
      // @ts-expect-error 少了 content
      UNNotificationRequest.requestWithIdentifier('x', { trigger });
    }, 'content');
    throws('content 是普通对象被拒', () => {
      // @ts-expect-error 要 UNNotificationContent
      UNNotificationRequest.requestWithIdentifier('x', { content: { title: 'hi' } });
    }, 'UNNotificationContent');
    throws('trigger 是数被拒', () => {
      // @ts-expect-error 要触发器
      UNNotificationRequest.requestWithIdentifier('x', { content, trigger: 5 });
    }, 'trigger');
    throws('trigger 是普通对象被拒', () => {
      // @ts-expect-error 要触发器
      UNNotificationRequest.requestWithIdentifier('x', { content, trigger: { timeInterval: 5 } });
    }, 'trigger');
    throws('UNNotificationRequest 不能 new', () => {
      // @ts-expect-error 构造函数不公开
      new UNNotificationRequest();
    }, 'Illegal constructor');
  });

  group('只能由系统给的三个值', () => {
    throws('UNNotification 不能 new', () => {
      // @ts-expect-error 构造函数不公开
      new UNNotification();
    }, 'Illegal constructor');
    throws('UNNotificationResponse 不能 new', () => {
      // @ts-expect-error 构造函数不公开
      new UNNotificationResponse();
    }, 'Illegal constructor');
    throws('UNNotificationSettings 不能 new', () => {
      // @ts-expect-error 构造函数不公开
      new UNNotificationSettings();
    }, 'Illegal constructor');
  });

  // =====================================================================
  group('发、撤、设角标：参数写错同步抛', () => {
    const center = UNUserNotificationCenter.currentNotificationCenter();
    throws('addNotificationRequest 不带参数被拒', () => {
      // @ts-expect-error 少了请求
      center.addNotificationRequest();
    }, 'UNNotificationRequest');
    throws('addNotificationRequest 给普通对象被拒', () => {
      // @ts-expect-error 要 UNNotificationRequest
      center.addNotificationRequest({ identifier: 'x' });
    }, 'UNNotificationRequest');
    throws('addNotificationRequest 给内容（忘了包成请求）被拒', () => {
      // @ts-expect-error 要 UNNotificationRequest
      center.addNotificationRequest(new UNMutableNotificationContent());
    }, 'UNNotificationRequest');
    throws('removePendingNotificationRequestsWithIdentifiers 不带参数被拒', () => {
      // @ts-expect-error 少了标识
      center.removePendingNotificationRequestsWithIdentifiers();
    }, 'identifiers');
    throws('removePendingNotificationRequestsWithIdentifiers 给字符串被拒', () => {
      // @ts-expect-error 要数组
      center.removePendingNotificationRequestsWithIdentifiers('order-1');
    }, 'identifiers');
    throws('removeDeliveredNotificationsWithIdentifiers 给字符串被拒', () => {
      // @ts-expect-error 要数组
      center.removeDeliveredNotificationsWithIdentifiers('order-1');
    }, 'identifiers');
    throws('setBadgeCount 不带参数被拒', () => {
      // @ts-expect-error 少了数
      center.setBadgeCount();
    }, 'setBadgeCount');
    throws('setBadgeCount 给转不出数的被拒', () => {
      // @ts-expect-error 要数
      center.setBadgeCount('many');
    }, 'setBadgeCount');
    throws('setBadgeCount 给负数被拒', () => { center.setBadgeCount(-1); }, 'setBadgeCount');
    // 这四个不弹任何界面，没授权时调也不抛。标识是数组，里面的值按字符串转
    assert('按标识撤还没到的：返回 undefined',
           center.removePendingNotificationRequestsWithIdentifiers(['nacre.acceptance.none']),
           undefined);
    assert('按标识撤已经送达的：返回 undefined',
           center.removeDeliveredNotificationsWithIdentifiers(['nacre.acceptance.none']),
           undefined);
    assert('空数组也收', center.removePendingNotificationRequestsWithIdentifiers([]), undefined);
    assert('撤掉全部还没到的：返回 undefined', center.removeAllPendingNotificationRequests(),
           undefined);
    assert('撤掉全部已经送达的：返回 undefined', center.removeAllDeliveredNotifications(),
           undefined);
  });

  // =====================================================================
  group('事件：两个名字，别的当自定义事件', () => {
    const center = UNUserNotificationCenter.currentNotificationCenter();
    const noop = () => {};
    let ok = 0;
    for (const type of /** @type {const} */ (['notification',
                                              'notificationclick'])) {
      center.addEventListener(type, noop);
      center.removeEventListener(type, noop);
      ok += 1;
    }
    assert('两个事件都订得上、退得掉', ok, 2);
    assert('不认识的事件名当自定义事件', customEventWorks(center, 'not-a-real-event'), '收到一次');
    assert('同一个不认识的名字再来一遍，还是当自定义事件', customEventWorks(center, 'not-a-real-event'), '收到一次');
  });

  const center = shared;
  if (center === undefined) return;   // 第一组中断了，已经报过

  // =====================================================================
  // 两个事件的日志。不带 ✓：它们不是断言，来几次看人点了几次。
  //
  // 「用户点通知把 App 启动起来」的那一次点击，系统交过来时这里还没订阅
  // （这一步排在启动之后十几秒）。原生先留着，订阅的那一刻补发：订阅之后
  // 一秒内到的 notificationclick 就是补发的那一条
  const subscribedAt = Date.now();
  center.addEventListener('notification', (e) => {
    console.log('    通知事件 notification：' + describeRequest(e.notification.request) +
                '，时间 ' + e.notification.date.toISOString() + '，前台显示 [' +
                center.foregroundPresentationOptions.join(',') + ']');
  });
  center.addEventListener('notificationclick', (e) => {
    const late = Date.now() - subscribedAt;
    console.log('    通知事件 notificationclick：动作 ' + e.response.actionIdentifier +
                '，' + describeRequest(e.response.notification.request) +
                (late < 1000 ? '（订阅后 ' + late + ' ms 到的，是启动之前点的那一条，补发的）' : ''));
  });

  // =====================================================================
  // 异步的部分。不占模态页和焦点，所以不用让后面的步骤等它
  (async () => {
    // ---- 读设置：不弹框 ----
    const read = await settle(center.getNotificationSettings(), 5000);
    if (read === 'timeout' || !read.ok) {
      console.log('  ✗ 通知：getNotificationSettings() = ' +
                  (read === 'timeout' ? '5 秒没结算' : '拒绝 ' + describeError(read.error)) +
                  '（期望兑现成 UNNotificationSettings）');
      return;
    }
    const settings = read.value;
    group('设置的形状', () => {
      assert('getNotificationSettings() 兑现的是 UNNotificationSettings',
             settings instanceof UNNotificationSettings, true);
      assert('authorizationStatus 是五个值之一', STATUSES.includes(settings.authorizationStatus),
             true);
      for (const name of SETTING_FIELDS) {
        assert(name + ' 是三个值之一', SETTINGS.includes(settings[name]), true);
      }
      assert('alertStyle 是三个值之一', ALERT_STYLES.includes(settings.alertStyle), true);
      assert('showPreviewsSetting 是三个值之一', PREVIEWS.includes(settings.showPreviewsSetting),
             true);
      assert('providesAppNotificationSettings 是布尔',
             typeof settings.providesAppNotificationSettings, 'boolean');
      throws('设置的字段只读', () => {
        // @ts-expect-error 只读
        settings.authorizationStatus = 'authorized';
      }, 'read-only');
      throws('设置上不能加字段', () => { /** @type {any} */ (settings).note = 1; }, 'extensible');
      // 没申请过授权时各项是什么，没有量过：记下来，不断言
      console.log('    现在的通知设置：' + JSON.stringify(settings));
    });
    const status = settings.authorizationStatus;

    // ---- 状态已经定了的时候，申请授权不再弹框 ----
    if (status === 'notDetermined') {
      console.log('  ! 通知还没问过用户，requestAuthorizationWithOptions() 会弹系统的提示框，' +
                  '自动跑的部分不调它。这一条未验证，点「申请通知」');
    } else if (status === 'authorized' || status === 'denied') {
      const asked = await settle(
        center.requestAuthorizationWithOptions(['alert', 'sound', 'badge']), 5000);
      if (asked === 'timeout') {
        console.log('  ✗ 通知：状态已定时 requestAuthorizationWithOptions() = 5 秒没结算' +
                    '（期望当场兑现）');
      } else if (!asked.ok) {
        console.log('  ✗ 通知：状态已定时 requestAuthorizationWithOptions() = 拒绝 ' +
                    describeError(asked.error) + '（期望兑现成布尔）');
      } else {
        assert('状态已定时申请授权兑现成「现在允许不允许」', asked.value, status === 'authorized');
      }
    }

    // ---- 两张列表：没授权时也读得到（空的） ----
    const pending = await settle(center.getPendingNotificationRequests(), 5000);
    if (pending === 'timeout' || !pending.ok) {
      console.log('  ✗ 通知：getPendingNotificationRequests() = ' +
                  (pending === 'timeout' ? '5 秒没结算' : '拒绝 ' + describeError(pending.error)) +
                  '（期望兑现成数组）');
    } else {
      assert('getPendingNotificationRequests() 兑现的是数组', Array.isArray(pending.value), true);
      assert('里面都是 UNNotificationRequest',
             pending.value.every((r) => r instanceof UNNotificationRequest), true);
    }
    const delivered = await settle(center.getDeliveredNotifications(), 5000);
    if (delivered === 'timeout' || !delivered.ok) {
      console.log('  ✗ 通知：getDeliveredNotifications() = ' +
                  (delivered === 'timeout' ? '5 秒没结算'
                                           : '拒绝 ' + describeError(delivered.error)) +
                  '（期望兑现成数组）');
    } else {
      assert('getDeliveredNotifications() 兑现的是数组', Array.isArray(delivered.value), true);
      assert('里面都是 UNNotification',
             delivered.value.every((n) => n instanceof UNNotification), true);
      console.log('    通知中心里现在有 ' + delivered.value.length + ' 条已经送达的');
    }

    // ---- 排两条很久以后才到的，查得到，再撤掉 ----
    // 没授权时系统让不让排，没有量过：兑现了就接着验，拒绝了就记下拒绝的是
    // 什么。两种都不算失败，只有不结算算失败
    const content = new UNMutableNotificationContent();
    content.title = 'Nacre 验收';
    content.subtitle = '自动排的';
    content.body = '这一条不该真的弹出来';
    content.badge = 4;
    content.sound = UNNotificationSound.defaultSound;
    content.threadIdentifier = 'nacre.acceptance';
    content.userInfo = { kind: 'probe', list: [1, 'two', true], nested: { ratio: 0.25 } };
    const byInterval = UNNotificationRequest.requestWithIdentifier('nacre.acceptance.interval', {
      content,
      trigger: UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(365 * 24 * 3600),
    });
    const byDate = UNNotificationRequest.requestWithIdentifier('nacre.acceptance.calendar', {
      content,
      trigger: UNCalendarNotificationTrigger.triggerWithDateMatchingComponents(
        { year: 2099, month: 1, day: 1, hour: 9, minute: 30 }),
    });
    const ids = [byInterval.identifier, byDate.identifier];
    const added = await settle(Promise.all([center.addNotificationRequest(byInterval),
                                            center.addNotificationRequest(byDate)]), 8000);
    if (added === 'timeout') {
      console.log('  ✗ 通知：addNotificationRequest() = 8 秒没结算（期望兑现或者拒绝）');
    } else if (!added.ok) {
      assert('排通知被拒绝时给的是 Error', added.error instanceof Error, true);
      console.log('  ! 通知：授权状态是 ' + status + ' 时 addNotificationRequest() 被拒绝：' +
                  describeError(added.error) + '。排上、查到、撤掉这一段未验证');
    } else {
      assert('addNotificationRequest() 兑现成 undefined', added.value[0], undefined);
      console.log('    授权状态是 ' + status + ' 时 addNotificationRequest() 兑现了');
      const listed = await settle(center.getPendingNotificationRequests(), 5000);
      if (listed === 'timeout' || !listed.ok) {
        console.log('  ✗ 通知：排上之后 getPendingNotificationRequests() = 没兑现（期望数组）');
      } else {
        const a = listed.value.find((r) => r.identifier === byInterval.identifier);
        const b = listed.value.find((r) => r.identifier === byDate.identifier);
        assert('按秒排的那一条在列表里', a !== undefined, true);
        assert('按日期排的那一条在列表里', b !== undefined, true);
        if (a !== undefined) {
          group('从系统读回来的请求', () => {
            assert('读回来的是新的对象（请求是值）', a !== byInterval, true);
            assert('读回 title', a.content.title, 'Nacre 验收');
            assert('读回 subtitle', a.content.subtitle, '自动排的');
            assert('读回 body', a.content.body, '这一条不该真的弹出来');
            assert('读回 badge', a.content.badge, 4);
            assert('读回 sound：是默认的那一个', a.content.sound === UNNotificationSound.defaultSound,
                   true);
            assert('读回 threadIdentifier', a.content.threadIdentifier, 'nacre.acceptance');
            assert('读回 userInfo（数还是数，布尔还是布尔）', canonical(a.content.userInfo),
                   '{"kind":"probe","list":[1,"two",true],"nested":{"ratio":0.25}}');
            assert('读回的内容是只读的那个类', a.content instanceof UNMutableNotificationContent,
                   false);
            const t = a.trigger;
            assert('读回的触发器是 UNTimeIntervalNotificationTrigger',
                   t instanceof UNTimeIntervalNotificationTrigger, true);
            if (t instanceof UNTimeIntervalNotificationTrigger) {
              assert('读回 timeInterval', t.timeInterval, 365 * 24 * 3600);
              assert('读回 repeats', t.repeats, false);
            }
          });
        }
        if (b !== undefined) {
          group('从系统读回来的日期触发器', () => {
            const t = b.trigger;
            assert('读回的触发器是 UNCalendarNotificationTrigger',
                   t instanceof UNCalendarNotificationTrigger, true);
            if (t instanceof UNCalendarNotificationTrigger) {
              assert('读回的分量还是那五个', Object.keys(t.dateComponents).sort().join(','),
                     'day,hour,minute,month,year');
              assert('读回 year', t.dateComponents.year, 2099);
              assert('读回 minute', t.dateComponents.minute, 30);
              assert('读回日期触发器的 repeats', t.repeats, false);
            }
          });
        }
      }
      // 同一个标识再排一次是替换，不是多一条
      const replaced = await settle(center.addNotificationRequest(byInterval), 5000);
      const after = await settle(center.getPendingNotificationRequests(), 5000);
      if (replaced !== 'timeout' && replaced.ok && after !== 'timeout' && after.ok) {
        assert('同一个标识再排一次，列表里还是一条',
               after.value.filter((r) => r.identifier === byInterval.identifier).length, 1);
      }
      // 撤掉。系统是另起一个线程去撤的，所以撤完马上查不一定已经没了：等到没了为止
      center.removePendingNotificationRequestsWithIdentifiers(ids);
      let left = -1;
      const t0 = Date.now();
      while (Date.now() - t0 < 5000) {
        const now = await settle(center.getPendingNotificationRequests(), 5000);
        if (now === 'timeout' || !now.ok) break;
        left = now.value.filter((r) => ids.includes(r.identifier)).length;
        if (left === 0) break;
        await sleep(100);
      }
      assert('按标识撤掉之后列表里没有那两条', left, 0);
      console.log('    撤掉之后过了 ' + (Date.now() - t0) + ' ms 列表里才没有（0 左右说明撤是马上生效的）');
    }

    // ---- 角标：设成 0 ----
    // 同样没量过没授权时系统怎么答，只断言结算了
    const badge = await settle(center.setBadgeCount(0), 5000);
    if (badge === 'timeout') {
      console.log('  ✗ 通知：setBadgeCount(0) = 5 秒没结算（期望兑现或者拒绝）');
    } else if (badge.ok) {
      assert('setBadgeCount(0) 兑现成 undefined', badge.value, undefined);
      console.log('    授权状态是 ' + status + ' 时 setBadgeCount(0) 兑现了');
    } else {
      assert('设角标被拒绝时给的是 Error', badge.error instanceof Error, true);
      console.log('  ! 通知：授权状态是 ' + status + ' 时 setBadgeCount(0) 被拒绝：' +
                  describeError(badge.error));
    }
  })().catch((err) => {
    console.log('  ✗ 通知的异步部分中断了 = ' + (err instanceof Error ? err.message : String(err)) +
                '（期望跑完）');
  });

  // =====================================================================
  // 要人点的按钮。自己开一个区块，不往「能力包」那块面板里加：那块面板的高度
  // 是固定的，里面的排平分高度，再加两排每排就矮得点不中了
  const host = ctx.section('通知（点这些按钮）', 74);
  const panel = new UIStackView();
  panel.axis = 'vertical';
  panel.distribution = 'fillEqually';
  panel.spacing = 6;
  panel.translatesAutoresizingMaskIntoConstraints = false;
  host.addSubview(panel);
  NSLayoutConstraint.activateConstraints([
    panel.leadingAnchor.constraintEqualToAnchor(host.leadingAnchor, { constant: 16 }),
    panel.trailingAnchor.constraintEqualToAnchor(host.trailingAnchor, { constant: -16 }),
    panel.topAnchor.constraintEqualToAnchor(host.topAnchor, { constant: 4 }),
    panel.bottomAnchor.constraintEqualToAnchor(host.bottomAnchor, { constant: -4 }),
  ]);

  let serial = 0;
  /** @param {string} how @param {UNTimeIntervalNotificationTrigger | null} trigger */
  const post = (how, trigger) => {
    serial += 1;
    const content = new UNMutableNotificationContent();
    content.title = 'Nacre 通知 ' + serial;
    content.body = how;
    content.sound = UNNotificationSound.defaultSound;
    content.badge = serial;
    content.threadIdentifier = 'nacre.acceptance';
    content.userInfo = { serial, how };
    const request = UNNotificationRequest.requestWithIdentifier('nacre.acceptance.tap.' + serial,
                                                                { content, trigger });
    center.addNotificationRequest(request).then(
      () => { console.log('  ✓ 真实触摸：' + how + '，已经交给系统 ' + request.identifier); },
      (err) => { console.log('  ✓ 真实触摸：' + how + '，被拒绝 ' + describeError(err)); });
  };
  const list = () => {
    Promise.all([center.getPendingNotificationRequests(), center.getDeliveredNotifications()])
      .then(([pending, delivered]) => {
        console.log('  ✓ 真实触摸：还没到的 ' + pending.length + ' 条，已经送达的 ' +
                    delivered.length + ' 条');
        for (const r of pending) console.log('      还没到 ' + describeRequest(r));
        for (const n of delivered) {
          console.log('      已送达 ' + describeRequest(n.request) + '，时间 ' + n.date.toISOString());
        }
      }, (err) => { console.log('  ✗ 真实触摸：查列表被拒绝 ' + describeError(err)); });
  };
  panelRow(panel, [
    ['申请通知', () => {
      console.log('  真实触摸：requestAuthorizationWithOptions([alert, sound, badge])');
      center.requestAuthorizationWithOptions(['alert', 'sound', 'badge'])
        .then((granted) => {
          console.log('  ✓ 真实触摸：授权结果 ' + granted);
          return center.getNotificationSettings();
        })
        .then(
          (settings) => { console.log('      之后的设置：' + JSON.stringify(settings)); },
          (err) => { console.log('  ✗ 真实触摸：申请授权被拒绝 ' + describeError(err)); });
    }],
    ['5 秒后发', () => {
      post('5 秒后到的', UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(5));
    }],
    ['立刻发', () => { post('立刻到的', null); }],
    ['撤掉', () => {
      center.removeAllPendingNotificationRequests();
      center.removeAllDeliveredNotifications();
      console.log('  ✓ 真实触摸：撤掉了全部还没到的和已经送达的');
      // 系统是另起线程撤的，等一下再查
      setTimeout(list, 500);
    }],
  ]);
  panelRow(panel, [
    ['查列表', list],
    ['角标 3', () => {
      center.setBadgeCount(3).then(
        () => { console.log('  ✓ 真实触摸：setBadgeCount(3) 兑现了（回桌面看图标上的数）'); },
        (err) => { console.log('  ✓ 真实触摸：setBadgeCount(3) 被拒绝 ' + describeError(err)); });
    }],
    ['清角标', () => {
      center.setBadgeCount(0).then(
        () => { console.log('  ✓ 真实触摸：setBadgeCount(0) 兑现了'); },
        (err) => { console.log('  ✓ 真实触摸：setBadgeCount(0) 被拒绝 ' + describeError(err)); });
    }],
    ['前台显示', () => {
      const on = center.foregroundPresentationOptions.length === 0;
      center.foregroundPresentationOptions = on ? ['banner', 'list', 'sound', 'badge'] : [];
      console.log('  ✓ 真实触摸：前台显示改成 [' + center.foregroundPresentationOptions.join(',') +
                  ']（空的时候 App 开着收到通知不显示，只有事件）');
    }],
  ]);
}
