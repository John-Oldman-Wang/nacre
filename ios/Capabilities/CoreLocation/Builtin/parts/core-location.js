// 定位的 JS 那一半：CLLocationManager、CLLocation、CLLocationCoordinate2D。
//
// 这是**能力包自己的 part**：它不在核心里，跟着 NacreCoreLocation.framework 走
// （Builtin/parts/）。写法和核心的 part 一样——整个文件是一个函数表达式，
// 运行时在核心的 part 全部跑完之后，用同一个 ctx 调它一次。
(function (ctx) {
  'use strict';

  const {
    constructNative,
    define,
    defineNativeClass,
    disown,
    eventFieldConverters,
    kSubscribe,
    nativeCall,
    nativeCallAsync,
    nativeGet,
    nativeSet,
    ownOne,
    requireNative,
    subscribeNative,
    toNumber,
    toNumberOrName,
  } = ctx;

  // ---------- 两个只读的值 ----------
  //
  // 照已有结构体的规矩：JS 类，字段只读，写入即抛，不能加字段。
  function readOnlyField(target, name, read) {
    Object.defineProperty(target, name, {
      enumerable: true,
      get: read,
      set() {
        throw new TypeError(
          name + ' is read-only: locations are values, they cannot be changed');
      },
    });
  }

  // 经纬度，单位是度。ObjC 里是结构体 { latitude, longitude }。
  // 不检查范围：系统的结构体也不检查，而且「无效的坐标」本身是一个合法的值
  const CLLocationCoordinate2D = define(globalThis, 'CLLocationCoordinate2D',
    class CLLocationCoordinate2D {
      constructor(latitude, longitude) {
        const lat = toNumber(latitude, 'CLLocationCoordinate2D latitude');
        const lon = toNumber(longitude, 'CLLocationCoordinate2D longitude');
        readOnlyField(this, 'latitude', () => lat);
        readOnlyField(this, 'longitude', () => lon);
        Object.preventExtensions(this);
      }
      toString() {
        return 'CLLocationCoordinate2D(' + this.latitude + ', ' + this.longitude + ')';
      }
    });

  // 一个位置。只能由系统给：从 manager.location、requestLocation() 和
  // locationupdate 事件里来，不能 new。
  //
  // 它不是原生对象的包装：CLLocation 不可变，过桥的是一份字段（见
  // NacreCoreLocation.mm 的 LocationToJSON），这里建成只读的值。
  // 精度、速度、方向在系统那边用负数表示「无效」，过桥时已经换成了 null；
  // 垂直精度无效时，两个海拔也跟着是 null
  const kFromSystem = Symbol('CLLocation');
  const LOCATION_NUMBERS = [
    'altitude', 'ellipsoidalAltitude', 'horizontalAccuracy', 'verticalAccuracy',
    'speed', 'speedAccuracy', 'course', 'courseAccuracy',
  ];
  const CLLocation = define(globalThis, 'CLLocation', class CLLocation {
    constructor(token, fields) {
      if (token !== kFromSystem) {
        throw new TypeError(
          'Illegal constructor: a CLLocation comes from CLLocationManager ' +
          '(location, requestLocation(), or the locationupdate event)');
      }
      const coordinate = new CLLocationCoordinate2D(fields.latitude, fields.longitude);
      readOnlyField(this, 'coordinate', () => coordinate);
      for (const name of LOCATION_NUMBERS) {
        const value = fields[name];
        readOnlyField(this, name, () => value);
      }
      // 每次读给一个新的 Date：Date 是可变的，共用一个的话改它就改了位置
      const time = fields.timestamp;
      readOnlyField(this, 'timestamp', () => new Date(time));
      const source = fields.sourceInformation == null ? null : Object.freeze({
        isSimulatedBySoftware: fields.sourceInformation.isSimulatedBySoftware === true,
        isProducedByAccessory: fields.sourceInformation.isProducedByAccessory === true,
      });
      readOnlyField(this, 'sourceInformation', () => source);
      Object.preventExtensions(this);
    }
    toString() {
      return 'CLLocation(' + this.coordinate.latitude + ', ' + this.coordinate.longitude + ')';
    }
  });
  const toLocation = (fields) => (fields == null ? null : new CLLocation(kFromSystem, fields));

  // 定位的错误。上层给好用的分类（name），底层不丢事实（code / domain 是
  // NSError 的原值）——和 Promise 拒绝时的 Error 一个形状
  function toError(fields) {
    const error = new Error(fields.message);
    error.name = fields.name;
    error.code = fields.code;
    error.domain = fields.domain;
    return error;
  }

  // 事件带的字段过桥时是普通对象，在这里换成上面的类型
  eventFieldConverters.set('locationupdate', (fields) => ({
    locations: fields.locations.map(toLocation),
  }));
  eventFieldConverters.set('locationerror', (fields) => ({ error: toError(fields) }));

  // ---------- CLLocationManager ----------
  //
  // 只做「使用 App 期间」的定位。始终定位、后台定位、地理围栏、指南针都没做，
  // 类上没有那些名字。
  //
  // 谁拿着 manager：
  //   - 原生那边没有人替你拿着它——系统不持有 CLLocationManager，它一释放，
  //     更新就停了，等着的请求也不会再有回音。
  //   - 所以**正在连续更新**（start 之后、stop 之前）和**有 Promise 还没结算**
  //     的 manager，由这个类拿着，直到停下或者结算。不这样的话，一个只在函数
  //     里用了一下的 manager 会在某一次垃圾回收之后不声不响地停掉。
  //   - 只挂了监听器、既没在更新也没有请求在等的 manager，没人拿着，和别的
  //     对象一样：加监听器不改变对象的寿命。
  const waiting = new WeakMap();   // manager -> 还没结算的 Promise 个数

  const Manager = defineNativeClass('CLLocationManager', class CLLocationManager extends NSObject {
    constructor() {
      super();
      constructNative(this, new.target, 'CLLocationManager', []);
    }

    // 三个事件名都交给原生去认：认不出来的抛，不当成只在 JS 这边的事件
    [kSubscribe](type, on) { subscribeNative(this, type, on); }

    // ---- 授权 ----
    // 'notDetermined' | 'restricted' | 'denied' | 'authorizedAlways' | 'authorizedWhenInUse'
    get authorizationStatus() {
      requireNative(this, 'authorizationStatus');
      return nativeGet(this, 'authorizationStatus');
    }
    // 'fullAccuracy' | 'reducedAccuracy'：用户给的是精确位置还是大概位置
    get accuracyAuthorization() {
      requireNative(this, 'accuracyAuthorization');
      return nativeGet(this, 'accuracyAuthorization');
    }
    // 申请「使用 App 期间」的定位。还没问过用户时系统弹提示框，用户选完才
    // 兑现；已经问过就当场兑现成现在的状态，不再弹
    requestWhenInUseAuthorization() {
      requireNative(this, 'requestWhenInUseAuthorization');
      return whileWaiting(this, nativeCallAsync(this, 'requestWhenInUseAuthorization', []));
    }

    // ---- 要多准、多远报一次 ----
    // 米，或者 'best' | 'bestForNavigation' | 'reduced'
    get desiredAccuracy() {
      requireNative(this, 'desiredAccuracy');
      return nativeGet(this, 'desiredAccuracy');
    }
    set desiredAccuracy(value) {
      requireNative(this, 'desiredAccuracy');
      nativeSet(this, 'desiredAccuracy', toNumberOrName(value, 'desiredAccuracy'));
    }
    // 米，或者 'none'（每次移动都报）
    get distanceFilter() {
      requireNative(this, 'distanceFilter');
      return nativeGet(this, 'distanceFilter');
    }
    set distanceFilter(value) {
      requireNative(this, 'distanceFilter');
      nativeSet(this, 'distanceFilter', toNumberOrName(value, 'distanceFilter'));
    }

    // ---- 位置 ----
    // 最近一次的位置；还没有过就是 null。每次读得到一个新的 CLLocation
    get location() {
      requireNative(this, 'location');
      return toLocation(nativeGet(this, 'location'));
    }
    // 连续更新：位置从 locationupdate 事件来，直到 stopUpdatingLocation()
    startUpdatingLocation() {
      nativeCall(this, 'startUpdatingLocation', []);
      ownOne(Manager, 'updating', this);
    }
    stopUpdatingLocation() {
      nativeCall(this, 'stopUpdatingLocation', []);
      disown(Manager, 'updating', this);
    }
    // 取一次位置
    requestLocation() {
      requireNative(this, 'requestLocation');
      return whileWaiting(this, nativeCallAsync(this, 'requestLocation', []).then(toLocation));
    }
  });

  // Promise 还没结算的这段时间，由类拿着 manager。同一个 manager 上可以有
  // 几个在等，所以记个数。结算之后把结果原样传下去：拒绝还是拒绝，没人接的
  // 话照常报未处理的拒绝
  function whileWaiting(manager, promise) {
    waiting.set(manager, (waiting.get(manager) || 0) + 1);
    ownOne(Manager, 'waiting', manager);
    const release = () => {
      const left = waiting.get(manager) - 1;
      waiting.set(manager, left);
      if (left === 0) disown(Manager, 'waiting', manager);
    };
    return promise.then(
      (value) => { release(); return value; },
      (error) => { release(); throw error; });
  }
})
