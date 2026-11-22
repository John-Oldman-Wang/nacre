import { customEventWorks, enumIgnored, ENUM_IGNORED } from '../support.js';
// 定位：CLLocationManager、CLLocation、CLLocationCoordinate2D。
// 能力包 @nacrejs/core-location，装了才有这三个全局。
//
// 分三段：
//   1. 自动跑的：只验不会弹出系统权限提示框的——建对象、读授权状态、属性的
//      默认值和读写、订阅和退订、写错时抛什么、明确不做的成员怎样拒绝。
//   2. 已经授权时自动跑的：取一次位置、连续更新收一次事件。验收之前用命令
//      给模拟器预先授权、设一个位置，这一段才跑得到；没授权时打一行未验证。
//   3. 面板上的四个按钮：申请授权、取一次、开始、停止。申请授权会弹系统的
//      提示框，所以只在人点的时候做。
//
// 期望值的来源：
//   - 精度的几个名字对应的数（best 是 -1、bestForNavigation 是 -2、reduced 是
//     6380000）、「写进去的数原样读回来」「委托在建对象时就装上才收得到第一次
//     授权回调」，是在 Mac 上用命令行探针量的（macOS 27，同一个框架），不是
//     在 iOS 上量的
//   - 默认值（desiredAccuracy 是 best、distanceFilter 是 none）、「建好之后系统
//     总会先通知一次授权状态」、「没授权时 location 是 null」来自头文件和
//     Apple 的文档
//   - 负数表示无效（精度、速度、方向）来自头文件，JS 这边读到的是 null

import { panelRow, systemPanel } from './pasteboard.js';

const STATUSES = ['notDetermined', 'restricted', 'denied', 'authorizedAlways',
                  'authorizedWhenInUse'];
const ACCURACIES = ['fullAccuracy', 'reducedAccuracy'];

/**
 * @param {string} label
 * @param {() => void} fn
 * @param {string} needle 报错信息里应该有的一段
 */
function throws(label, fn, needle) {
  try {
    fn();
    console.log('  ✗ ' + label + ' = 没抛（期望抛 TypeError，信息里有 ' + needle + '）');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const passed = err instanceof TypeError && message.includes(needle);
    console.log((passed ? '  ✓ ' : '  ✗ ') + label + ' = ' + message +
                (passed ? '' : '（期望 TypeError，信息里有 ' + needle + '）'));
  }
}

// 一组断言中途抛了（比如能力包还没接进来）只废这一组，不连累后面的
/**
 * @param {string} name
 * @param {() => void} fn
 */
function group(name, fn) {
  try {
    fn();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log('  ✗ ' + name + ' 这一组中断了 = ' + message + '（期望跑完）');
  }
}

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

/** @param {CLLocation} location */
function describe(location) {
  const c = location.coordinate;
  return c.latitude.toFixed(5) + ', ' + c.longitude.toFixed(5) +
         ' ±' + location.horizontalAccuracy + ' m';
}

/** @param {import("../main.js").StepContext} ctx */
export function stepCoreLocation(ctx) {
  const { assert } = ctx;
  console.log('--- 定位：CLLocationManager ---');

  // 按钮和已授权那一段共用这一个。模块里一直拿着它
  /** @type {CLLocationManager | undefined} */
  let shared;

  // =====================================================================
  group('构造', () => {
    assert('全局上有 CLLocationManager', typeof CLLocationManager, 'function');
    const manager = new CLLocationManager();
    shared = manager;
    assert('new 出来的是 CLLocationManager', manager instanceof CLLocationManager, true);
    assert('它是 NSObject', manager instanceof NSObject, true);
    assert('它能挂监听器（EventTarget）', manager instanceof EventTarget, true);
    assert('每次 new 是新的对象', new CLLocationManager() !== manager, true);
    // 原生类一律是 final
    class Mine extends CLLocationManager {}
    throws('不能继承', () => { new Mine(); }, 'Illegal constructor');
  });

  // =====================================================================
  group('授权状态：只读，不弹框', () => {
    const manager = new CLLocationManager();
    assert('authorizationStatus 是五个值之一',
           STATUSES.includes(manager.authorizationStatus), true);
    assert('accuracyAuthorization 是两个值之一',
           ACCURACIES.includes(manager.accuracyAuthorization), true);
    console.log('    现在的授权：' + manager.authorizationStatus + ' / ' +
                manager.accuracyAuthorization);
    throws('authorizationStatus 只读', () => {
      // @ts-expect-error 只读
      manager.authorizationStatus = 'authorizedWhenInUse';
    }, 'authorizationStatus');
    throws('accuracyAuthorization 只读', () => {
      // @ts-expect-error 只读
      manager.accuracyAuthorization = 'fullAccuracy';
    }, 'accuracyAuthorization');
  });

  // =====================================================================
  group('desiredAccuracy：米，或者三个名字', () => {
    const manager = new CLLocationManager();
    assert('默认是 best', manager.desiredAccuracy, 'best');
    manager.desiredAccuracy = 100;
    assert('写 100 读回 100', manager.desiredAccuracy, 100);
    manager.desiredAccuracy = 1234.5;
    assert('写 1234.5 读回 1234.5', manager.desiredAccuracy, 1234.5);
    manager.desiredAccuracy = 0;
    assert('写 0 读回 0', manager.desiredAccuracy, 0);
    manager.desiredAccuracy = 'bestForNavigation';
    assert('写 bestForNavigation 读回这个名字', manager.desiredAccuracy, 'bestForNavigation');
    manager.desiredAccuracy = 'reduced';
    assert('写 reduced 读回这个名字', manager.desiredAccuracy, 'reduced');
    manager.desiredAccuracy = 'best';
    assert('写 best 读回这个名字', manager.desiredAccuracy, 'best');
    // 照参数转换的规矩：看着像数的字符串按数转
    // @ts-expect-error 类型上不收数字字符串，运行时照 Web 的规矩转
    manager.desiredAccuracy = '50';
    assert("写 '50' 读回数 50", manager.desiredAccuracy === 50, true);

    assert('不认识的名字：不抛、值不变', enumIgnored(() => {
      // @ts-expect-error 没有这个名字
      manager.desiredAccuracy = 'fast';
    }, () => manager.desiredAccuracy), ENUM_IGNORED);
    throws('负数被拒（名字背后的那几个数不让直接写）',
           () => { manager.desiredAccuracy = -1; }, 'desiredAccuracy');
    throws('NaN 被拒', () => { manager.desiredAccuracy = NaN; }, 'desiredAccuracy');
    throws('undefined 被拒', () => {
      // @ts-expect-error 少了值
      manager.desiredAccuracy = undefined;
    }, 'desiredAccuracy');
    assert('写错之后原值不动', manager.desiredAccuracy === 50, true);
  });

  group('distanceFilter：米，或者 none', () => {
    const manager = new CLLocationManager();
    assert('默认是 none', manager.distanceFilter, 'none');
    manager.distanceFilter = 25;
    assert('写 25 读回 25', manager.distanceFilter, 25);
    manager.distanceFilter = 0.5;
    assert('写 0.5 读回 0.5', manager.distanceFilter, 0.5);
    manager.distanceFilter = 'none';
    assert('写 none 读回这个名字', manager.distanceFilter, 'none');
    assert('不认识的名字：不抛、值不变', enumIgnored(() => {
      // @ts-expect-error 没有这个名字
      manager.distanceFilter = 'all';
    }, () => manager.distanceFilter), ENUM_IGNORED);
    throws('负数被拒', () => { manager.distanceFilter = -1; }, 'distanceFilter');
    throws('Infinity 被拒', () => { manager.distanceFilter = Infinity; }, 'distanceFilter');
    assert('写错之后原值不动', manager.distanceFilter, 'none');
  });

  // =====================================================================
  group('location：最近一次的位置', () => {
    const manager = new CLLocationManager();
    const location = manager.location;
    assert('是 null 或者 CLLocation', location === null || location instanceof CLLocation, true);
    const status = manager.authorizationStatus;
    if (status !== 'authorizedWhenInUse' && status !== 'authorizedAlways') {
      assert('没授权时是 null', location, null);
    }
    throws('location 只读', () => {
      // @ts-expect-error 只读
      manager.location = null;
    }, 'location');
  });

  // =====================================================================
  group('CLLocationCoordinate2D：只读的值', () => {
    const c = new CLLocationCoordinate2D(39.9042, 116.4074);
    assert('latitude', c.latitude, 39.9042);
    assert('longitude', c.longitude, 116.4074);
    throws('latitude 写入即抛', () => {
      // @ts-expect-error 只读
      c.latitude = 0;
    }, 'read-only');
    throws('longitude 写入即抛', () => {
      // @ts-expect-error 只读
      c.longitude = 0;
    }, 'read-only');
    throws('不能加字段', () => { /** @type {any} */ (c).altitude = 1; }, 'extensible');
    assert('JSON 里是两个数', JSON.stringify(c), '{"latitude":39.9042,"longitude":116.4074}');
    // @ts-expect-error 类型上要数，运行时照 Web 的规矩转
    assert("看着像数的字符串按数转", new CLLocationCoordinate2D('1.5', '2').latitude === 1.5, true);
    throws('转不出数的被拒', () => {
      // @ts-expect-error 要数
      new CLLocationCoordinate2D('north', 0);
    }, 'latitude');
    throws('少了参数被拒', () => {
      // @ts-expect-error 少了经度
      new CLLocationCoordinate2D(1);
    }, 'longitude');
  });

  group('CLLocation：只能由系统给', () => {
    assert('全局上有 CLLocation', typeof CLLocation, 'function');
    throws('不能 new', () => {
      // @ts-expect-error 构造函数不公开
      new CLLocation();
    }, 'Illegal constructor');
  });

  // =====================================================================
  group('事件：三个名字，别的当自定义事件', () => {
    const manager = new CLLocationManager();
    const noop = () => {};
    let ok = 0;
    for (const type of /** @type {const} */ (['locationupdate', 'locationerror',
                                              'authorizationchange'])) {
      manager.addEventListener(type, noop);
      manager.removeEventListener(type, noop);
      ok += 1;
    }
    assert('三个事件都订得上、退得掉', ok, 3);
    assert('不认识的事件名当自定义事件', customEventWorks(manager, 'not-a-real-event'), '收到一次');
    // 出错的事件叫 locationerror，不叫 error
    assert('error 这个名字当自定义事件（出错的事件叫 locationerror）', customEventWorks(manager, 'error'), '收到一次');
    // 被拒的名字没有留在监听器表里：再订一次还是抛
    assert('同一个不认识的名字再来一遍，还是当自定义事件', customEventWorks(manager, 'not-a-real-event'), '收到一次');
  });

  // 建好对象之后系统总会先通知一次授权状态（不管是什么状态）。委托是建对象
  // 时装上的，所以在同一段同步代码里订阅就收得到
  {
    let fired = 0;
    /** @type {Event | undefined} */
    let first;
    /** @type {CLLocationManager | undefined} */
    let watcher;
    group('事件：建好之后先来一次 authorizationchange', () => {
      watcher = new CLLocationManager();
      watcher.addEventListener('authorizationchange', (e) => {
        fired += 1;
        if (first === undefined) first = e;
      });
    });
    const deadline = Date.now() + 6000;
    const tick = () => {
      if (watcher === undefined) return;   // 上面那一组中断了，已经报过
      if (fired > 0 && first !== undefined) {
        const event = first;
        const manager = watcher;
        group('事件：authorizationchange 的形状', () => {
          assert('建好之后收到了 authorizationchange', fired >= 1, true);
          assert('type', event.type, 'authorizationchange');
          assert('target 是那个 manager', event.target === manager, true);
          assert('不可取消', event.cancelable, false);
          assert('事件上不带状态（从 manager 上读）',
                 'authorizationStatus' in event, false);
        });
        return;
      }
      if (Date.now() >= deadline) {
        console.log('  ✗ 建好之后 6 秒内没收到 authorizationchange = 0 次（期望至少 1 次）');
        return;
      }
      setTimeout(tick, 100);
    };
    setTimeout(tick, 0);
  }

  // =====================================================================
  group('明确不做的：类上根本没有这些名字', () => {
    const manager = new CLLocationManager();
    const absent = [
      // 始终定位
      'requestAlwaysAuthorization',
      // 后台定位
      'allowsBackgroundLocationUpdates', 'pausesLocationUpdatesAutomatically',
      'showsBackgroundLocationIndicator', 'activityType',
      'startMonitoringSignificantLocationChanges', 'stopMonitoringSignificantLocationChanges',
      // 地理围栏
      'startMonitoringForRegion', 'stopMonitoringForRegion', 'monitoredRegions',
      'maximumRegionMonitoringDistance', 'requestStateForRegion',
      // 指南针
      'startUpdatingHeading', 'stopUpdatingHeading', 'heading', 'headingFilter',
      'dismissHeadingCalibrationDisplay',
      // 临时的精确位置
      'requestTemporaryFullAccuracyAuthorization',
    ];
    let present = 0;
    for (const name of absent) {
      if (name in manager) {
        present += 1;
        console.log('  ✗ 不该有的成员 ' + name + ' = 存在（期望不存在）');
      }
    }
    assert('十八个没做的成员都不存在', present, 0);
    throws('调 requestAlwaysAuthorization 抛 TypeError', () => {
      // @ts-expect-error 没有这个方法
      manager.requestAlwaysAuthorization();
    }, 'requestAlwaysAuthorization');
    assert('类上也没有 locationServicesEnabled', 'locationServicesEnabled' in CLLocationManager,
           false);
    const g = /** @type {any} */ (globalThis);
    assert('没有 CLHeading', typeof g.CLHeading, 'undefined');
    assert('没有 CLCircularRegion', typeof g.CLCircularRegion, 'undefined');
    assert('没有 CLGeocoder', typeof g.CLGeocoder, 'undefined');
  });

  // =====================================================================
  group('没在更新时调 stopUpdatingLocation 不抛', () => {
    const manager = new CLLocationManager();
    manager.stopUpdatingLocation();
    assert('返回 undefined', manager.stopUpdatingLocation(), undefined);
  });

  // 下面是异步的部分。不占模态页和焦点，所以不用让后面的步骤等它
  const manager = shared;
  if (manager === undefined) return;   // 构造那一组中断了，已经报过
  const authorized = () => manager.authorizationStatus === 'authorizedWhenInUse' ||
                           manager.authorizationStatus === 'authorizedAlways';

  (async () => {
    // ---- 状态已经定了的时候，申请授权当场给出现在的状态，不弹框 ----
    const status = manager.authorizationStatus;
    if (status === 'notDetermined') {
      console.log('  ! 还没问过用户，requestWhenInUseAuthorization() 会弹系统的提示框，' +
                  '自动跑的部分不调它。这一条未验证，点面板上的「申请定位」');
    } else {
      const asked = await settle(manager.requestWhenInUseAuthorization(), 5000);
      if (asked === 'timeout') {
        console.log('  ✗ 状态已定时 requestWhenInUseAuthorization() = 5 秒没结算（期望当场兑现）');
      } else if (!asked.ok) {
        console.log('  ✗ 状态已定时 requestWhenInUseAuthorization() = 拒绝 ' +
                    asked.error.name + '（期望兑现成现在的状态）');
      } else {
        assert('状态已定时 requestWhenInUseAuthorization() 兑现成现在的状态',
               asked.value, manager.authorizationStatus);
      }
    }

    // ---- 没授权：取位置当场拒绝，不弹框 ----
    if (!authorized()) {
      const denied = await settle(manager.requestLocation(), 5000);
      if (denied === 'timeout') {
        console.log('  ✗ 没授权时 requestLocation() = 5 秒没结算（期望拒绝 NotAllowedError）');
      } else if (denied.ok) {
        console.log('  ✗ 没授权时 requestLocation() = 兑现了（期望拒绝 NotAllowedError）');
      } else {
        assert('没授权时 requestLocation() 拒绝', denied.error.name, 'NotAllowedError');
        assert('拒绝的是 DOMException', denied.error instanceof DOMException, true);
        assert('系统的原值在 cause 上，是 NSError', denied.error.cause instanceof NSError, true);
        assert('带着系统的错误域', denied.error.cause && denied.error.cause.domain, 'kCLErrorDomain');
        assert('带着系统的错误码（denied 是 1）', denied.error.cause && denied.error.cause.code, 1);
      }
      console.log('  ! 定位还没授权（' + manager.authorizationStatus + '），取位置和连续更新' +
                  '这一段未验证。给模拟器授权并设一个位置之后重跑，或者点面板上的按钮');
      return;
    }

    // ---- 已经授权：取一次 ----
    console.log('  --- 定位已授权，自动取一次位置 ---');
    const once = await settle(manager.requestLocation(), 20000);
    if (once === 'timeout') {
      console.log('  ! 20 秒内 requestLocation() 没结算，取位置这一段未验证');
      return;
    }
    if (!once.ok) {
      // 模拟器没设位置时系统报 locationUnknown：不是运行时的错，这一段没法验
      console.log('  ! requestLocation() 被拒绝：' + once.error.name + '（code ' +
                  once.error.code + '）' + once.error.message +
                  '。模拟器要先设一个位置，这一段未验证');
      return;
    }
    const location = once.value;
    group('CLLocation 的形状', () => {
      assert('兑现的是 CLLocation', location instanceof CLLocation, true);
      console.log('    位置：' + describe(location));
      const c = location.coordinate;
      assert('coordinate 是 CLLocationCoordinate2D', c instanceof CLLocationCoordinate2D, true);
      assert('每次读 coordinate 是同一个对象', location.coordinate === c, true);
      assert('纬度在 -90 到 90 之间', c.latitude >= -90 && c.latitude <= 90, true);
      assert('经度在 -180 到 180 之间', c.longitude >= -180 && c.longitude <= 180, true);
      // 海拔跟着垂直精度走：垂直精度无效（null）时两个海拔都是 null，
      // 有效时都是数。和 Web 的 coords.altitude 一致：取不到就是 null
      console.log('    垂直精度：' + location.verticalAccuracy + '，海拔：' + location.altitude +
                  '，椭球面海拔：' + location.ellipsoidalAltitude);
      /** @param {number | null} v */
      const finiteOrNull = (v) => v === null || (typeof v === 'number' && Number.isFinite(v));
      assert('altitude 是有限的数或 null', finiteOrNull(location.altitude), true);
      assert('ellipsoidalAltitude 是有限的数或 null', finiteOrNull(location.ellipsoidalAltitude), true);
      assert('垂直精度无效时 altitude 是 null，有效时是数',
             (location.altitude === null) === (location.verticalAccuracy === null), true);
      assert('垂直精度无效时 ellipsoidalAltitude 是 null，有效时是数',
             (location.ellipsoidalAltitude === null) === (location.verticalAccuracy === null), true);
      assert('horizontalAccuracy 是不小于 0 的数（这个位置有效）',
             typeof location.horizontalAccuracy === 'number' && location.horizontalAccuracy >= 0,
             true);
      /** @param {number | null} v */
      const validOrNull = (v) => v === null || (typeof v === 'number' && v >= 0);
      assert('verticalAccuracy 是不小于 0 的数或 null', validOrNull(location.verticalAccuracy), true);
      assert('speed 是不小于 0 的数或 null', validOrNull(location.speed), true);
      assert('speedAccuracy 是不小于 0 的数或 null', validOrNull(location.speedAccuracy), true);
      assert('course 是 0 到 360 的数或 null',
             location.course === null || (location.course >= 0 && location.course < 360), true);
      assert('courseAccuracy 是不小于 0 的数或 null', validOrNull(location.courseAccuracy), true);
      assert('timestamp 是 Date', location.timestamp instanceof Date, true);
      assert('timestamp 是有效的时间', Number.isFinite(location.timestamp.getTime()), true);
      assert('每次读 timestamp 是新的 Date（改它不影响位置）',
             location.timestamp !== location.timestamp, true);
      const source = location.sourceInformation;
      assert('sourceInformation 是 null 或者两个布尔',
             source === null || (typeof source.isSimulatedBySoftware === 'boolean' &&
                                 typeof source.isProducedByAccessory === 'boolean'), true);
      throws('字段写入即抛', () => {
        // @ts-expect-error 只读
        location.altitude = 0;
      }, 'read-only');
      throws('不能加字段', () => { /** @type {any} */ (location).note = 1; }, 'extensible');
      assert('没做的成员不存在：floor', 'floor' in location, false);
      assert('没做的成员不存在：distanceFromLocation', 'distanceFromLocation' in location, false);
    });
    group('取完之后 manager.location 就是它', () => {
      const last = manager.location;
      assert('location 不是 null', last !== null, true);
      if (last === null) return;
      assert('每次读是新的对象（位置是值，不是同一个包装）', manager.location !== last, true);
      assert('纬度一样', last.coordinate.latitude, location.coordinate.latitude);
      assert('经度一样', last.coordinate.longitude, location.coordinate.longitude);
    });

    // ---- 连续更新：收一次事件 ----
    /** @type {Event & { locations?: CLLocation[] } | undefined} */
    let update;
    /** @param {Event} e */
    const onUpdate = (e) => { if (update === undefined) update = e; };
    manager.addEventListener('locationupdate', onUpdate);
    manager.startUpdatingLocation();
    // 正在连续更新时不能再取一次：系统不让两样同时进行
    const busy = await settle(manager.requestLocation(), 5000);
    if (busy === 'timeout') {
      console.log('  ✗ 连续更新时 requestLocation() = 5 秒没结算（期望拒绝 InvalidStateError）');
    } else {
      assert('连续更新时 requestLocation() 拒绝',
             busy.ok ? '兑现了' : busy.error.name, 'InvalidStateError');
      assert('连续更新时 requestLocation()：拒绝的是 DOMException',
             !busy.ok && busy.error instanceof DOMException, true);
    }
    const t0 = Date.now();
    while (update === undefined && Date.now() - t0 < 15000) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    manager.stopUpdatingLocation();
    manager.removeEventListener('locationupdate', onUpdate);
    if (update === undefined) {
      console.log('  ! 开始更新之后 15 秒没收到 locationupdate，这一组未验证');
    } else {
      const event = update;
      group('locationupdate 事件', () => {
        assert('type', event.type, 'locationupdate');
        assert('target 是那个 manager', event.target === manager, true);
        const locations = /** @type {CLLocationUpdateEvent} */ (event).locations;
        assert('locations 是数组，至少一个', Array.isArray(locations) && locations.length >= 1,
               true);
        assert('里面都是 CLLocation', locations.every((l) => l instanceof CLLocation), true);
        throws('locations 这个字段只读', () => {
          /** @type {any} */ (event).locations = [];
        }, 'locations');
        console.log('    收到 ' + locations.length + ' 个位置，最新的：' +
                    describe(locations[locations.length - 1]));
      });
    }

    // ---- 取一次、马上停：那一次被取消 ----
    const pending = manager.requestLocation();
    manager.stopUpdatingLocation();
    const aborted = await settle(pending, 5000);
    if (aborted === 'timeout') {
      console.log('  ✗ 取一次之后马上 stopUpdatingLocation() = 5 秒没结算（期望拒绝 AbortError）');
    } else {
      assert('取一次之后马上 stopUpdatingLocation()：那一次拒绝',
             aborted.ok ? '兑现了' : aborted.error.name, 'AbortError');
      assert('取一次之后马上 stopUpdatingLocation()：拒绝的是 DOMException',
             !aborted.ok && aborted.error instanceof DOMException, true);
    }
  })().catch((err) => {
    console.log('  ✗ 定位的异步部分中断了 = ' + (err instanceof Error ? err.message : String(err)) +
                '（期望跑完）');
  });

  // =====================================================================
  // 面板上的一排按钮：点了才申请、才取位置。事件打到日志里。
  // 这三行日志不带 ✓：它们不是断言，而且 authorizationchange 在建好对象之后
  // 会自己来一次，带上 ✓ 的话通过的条数就跟着它变
  manager.addEventListener('authorizationchange', () => {
    console.log('    定位事件 authorizationchange：' + manager.authorizationStatus + ' / ' +
                manager.accuracyAuthorization);
  });
  let logUpdates = false;
  manager.addEventListener('locationupdate', (e) => {
    if (!logUpdates) return;   // 自动跑的那一段也会更新，不重复打
    const latest = e.locations[e.locations.length - 1];
    console.log('    定位事件 locationupdate：' + e.locations.length + ' 个，最新 ' +
                describe(latest) + '，时间 ' + latest.timestamp.toISOString());
  });
  manager.addEventListener('locationerror', (e) => {
    console.log('    定位事件 locationerror：' + e.error.name + '（code ' + e.error.code +
                '）' + e.error.message);
  });
  panelRow(systemPanel(ctx), [
    ['申请定位', () => {
      console.log('  真实触摸：requestWhenInUseAuthorization()，之前是 ' +
                  manager.authorizationStatus);
      manager.requestWhenInUseAuthorization().then(
        (status) => { console.log('  ✓ 真实触摸：授权结果 ' + status); },
        (err) => { console.log('  ✗ 真实触摸：申请授权被拒绝 ' + err.name + ' ' + err.message); });
    }],
    ['取一次', () => {
      console.log('  真实触摸：requestLocation()');
      manager.requestLocation().then(
        (location) => {
          console.log('  ✓ 真实触摸：位置 ' + describe(location) + '，海拔 ' + location.altitude +
                      ' m，速度 ' + location.speed + '，方向 ' + location.course);
        },
        (err) => { console.log('  ✓ 真实触摸：取位置被拒绝 ' + err.name + ' ' + err.message); });
    }],
    ['开始', () => {
      logUpdates = true;
      manager.startUpdatingLocation();
      console.log('  ✓ 真实触摸：startUpdatingLocation()');
    }],
    ['停止', () => {
      manager.stopUpdatingLocation();
      logUpdates = false;
      console.log('  ✓ 真实触摸：stopUpdatingLocation()');
    }],
  ]);
}
