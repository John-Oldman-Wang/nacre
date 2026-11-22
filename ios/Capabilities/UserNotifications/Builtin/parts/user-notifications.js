// 通知的 JS 那一半：UNUserNotificationCenter，和它周围的一组值。
//
// 这是**能力包自己的 part**：它不在核心里，跟着 NacreUserNotifications.framework
// 走（Builtin/parts/）。写法和核心的 part 一样——整个文件是一个函数表达式，
// 运行时在核心的 part 全部跑完之后，用同一个 ctx 调它一次。
//
// 只有通知中心是原生对象的包装。内容、触发器、请求、通知、用户的回应、设置
// 都是 JS 这一侧的值：它们在系统那边要么不可变，要么一交给系统就被复制一份，
// 过桥的是一份 JSON（见 NacreUserNotifications.mm）。理由记在
// docs/internals/user-notifications.md。
(function (ctx) {
  'use strict';

  const {
    define,
    defineNativeClass,
    describeValue,
    eventFieldConverters,
    has,
    kSubscribe,
    nativeCall,
    nativeCallAsync,
    nativeClassCall,
    nativeGet,
    nativeOnly,
    nativeSet,
    requireNative,
    subscribeNative,
    toBoolean,
    toInteger,
    toNumber,
    toText,
  } = ctx;

  // 只有这个文件拿得到的记号：值的构造函数认它，外面 new 不出来
  const kInternal = Symbol('UserNotifications');
  // 真的由这个文件建出来的值。instanceof 骗得过（Object.create(X.prototype)），
  // 这个骗不过
  const genuine = new WeakSet();

  function illegal(name, how) {
    return new TypeError('Illegal constructor: ' + name + ' ' + how);
  }
  // 照已有结构体的规矩：字段只读，写入即抛
  function readOnlyField(target, name, read) {
    Object.defineProperty(target, name, {
      enumerable: true,
      get: read,
      set() { throw new TypeError(name + ' is read-only'); },
    });
  }
  // 建好之后不能加字段，并且记成「真的」
  function seal(value) {
    genuine.add(value);
    return Object.preventExtensions(value);
  }
  function deepFreeze(value) {
    if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
      Object.freeze(value);
      for (const key of Object.keys(value)) deepFreeze(value[key]);
    }
    return value;
  }

  // ---------- 声音 ----------
  //
  // 现在只有默认的那一个。系统给的通知里带着别的声音（远程推送指定了声音
  // 文件）时，读出来是另一个 UNNotificationSound：看得出「有声音、不是默认的」，
  // 读不出是哪个文件（系统没有公开那个名字）
  let defaultSound = null;
  const UNNotificationSound = define(globalThis, 'UNNotificationSound',
    class UNNotificationSound {
      constructor(token) {
        if (token !== kInternal) {
          throw illegal('UNNotificationSound', 'cannot be constructed; use ' +
                        'UNNotificationSound.defaultSound');
        }
        Object.freeze(this);
      }
      // 头文件里是类属性（@property(class, readonly)），所以是取值器
      static get defaultSound() { return defaultSound; }
      static set defaultSound(value) {
        throw new TypeError('defaultSound is read-only');
      }
      toString() {
        return this === defaultSound ? 'UNNotificationSound(default)' : 'UNNotificationSound';
      }
    });
  defaultSound = new UNNotificationSound(kInternal);

  // ---------- 内容 ----------
  const CONTENT_FIELDS = ['title', 'subtitle', 'body', 'badge', 'sound', 'threadIdentifier',
                          'userInfo'];
  const EMPTY_INFO = Object.freeze({});

  // userInfo：存一份副本。值只收系统存得下的那几种（字符串、有限的数、布尔、
  // 数组、普通对象），别的当场抛并说出是哪一个。null 也不收：系统要求这里是
  // 属性列表里的类型，而属性列表没有「空」
  function copyInfo(value, path, seen) {
    if (typeof value === 'string' || typeof value === 'boolean') return value;
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) {
        throw new TypeError(path + ' must be a finite number, got ' + describeValue(value));
      }
      return value;
    }
    if (value !== null && typeof value === 'object') {
      if (seen.includes(value)) {
        throw new TypeError(path + ' refers back to an object that contains it; userInfo ' +
                            'cannot contain cycles');
      }
      seen.push(value);
      let out;
      if (Array.isArray(value)) {
        out = value.map((item, i) => copyInfo(item, path + '[' + i + ']', seen));
      } else {
        const proto = Object.getPrototypeOf(value);
        if (proto !== Object.prototype && proto !== null) {
          throw new TypeError(path + ' must be a string, number, boolean, array or plain ' +
                              'object, got ' + describeValue(value));
        }
        out = {};
        for (const key of Object.keys(value)) {
          // 照 options 的规矩：值是 undefined 的成员视为没带
          if (value[key] === undefined) continue;
          out[key] = copyInfo(value[key], path + '.' + key, seen);
        }
      }
      seen.pop();
      return Object.freeze(out);
    }
    throw new TypeError(path + ' must be a string, number, boolean, array or plain object, ' +
                        'got ' + describeValue(value));
  }

  const convertContent = {
    title: toText,
    subtitle: toText,
    body: toText,
    threadIdentifier: toText,
    // 整数，或者 null（不动角标）。负数没有意义，不收
    badge(value) {
      if (value == null) return null;
      const n = toInteger(value, 'badge');
      if (n < 0) throw new TypeError('badge must not be negative, got ' + describeValue(value));
      return n;
    },
    sound(value) {
      if (value == null) return null;
      if (value !== defaultSound) {
        throw new TypeError('sound must be UNNotificationSound.defaultSound or null, got ' +
                            (genuine.has(value) || value instanceof UNNotificationSound
                              ? 'a sound that came from a delivered notification'
                              : describeValue(value)));
      }
      return value;
    },
    userInfo(value) {
      if (value == null) return EMPTY_INFO;
      if (typeof value !== 'object' || Array.isArray(value)) {
        throw new TypeError('userInfo must be a plain object, got ' + describeValue(value));
      }
      return copyInfo(value, 'userInfo', []);
    },
  };

  // 只读的那个类：从请求和已经送达的通知里读出来的内容。
  // 可变的子类共用这个构造函数，差别只在字段写不写得进去
  const UNNotificationContent = define(globalThis, 'UNNotificationContent',
    class UNNotificationContent {
      constructor(token, state) {
        if (token !== kInternal) {
          throw illegal('UNNotificationContent', 'is read from a request or a notification; ' +
                        'write content with new UNMutableNotificationContent()');
        }
        const mutable = new.target !== UNNotificationContent;
        const fields = state || {
          title: '', subtitle: '', body: '', badge: null, sound: null, threadIdentifier: '',
          userInfo: EMPTY_INFO,
        };
        for (const name of CONTENT_FIELDS) {
          if (mutable) {
            Object.defineProperty(this, name, {
              enumerable: true,
              get: () => fields[name],
              set: (value) => { fields[name] = convertContent[name](value); },
            });
          } else {
            readOnlyField(this, name, () => fields[name]);
          }
        }
        seal(this);
      }
    });

  const UNMutableNotificationContent = define(globalThis, 'UNMutableNotificationContent',
    class UNMutableNotificationContent extends UNNotificationContent {
      constructor() {
        // 和原生类一样不能继承：子类加的东西过不了桥，请求里拿到的也只是
        // 普通的 UNNotificationContent
        if (new.target !== UNMutableNotificationContent) {
          throw illegal((new.target && new.target.name) || 'this class',
                        'extends UNMutableNotificationContent, but subclassing native ' +
                        'classes is not supported yet');
        }
        super(kInternal, null);
      }
    });

  // 内容在这一刻的只读副本。请求建好之后再改原来的内容，请求里的不变
  // （ObjC 那边 request.content 标的是 copy）
  function snapshot(content) {
    if (!(content instanceof UNMutableNotificationContent)) return content;
    const state = {};
    for (const name of CONTENT_FIELDS) state[name] = content[name];
    return new UNNotificationContent(kInternal, state);
  }

  // ---------- 触发器 ----------
  const HOW_TO_TRIGGER = 'cannot be constructed with new; use ' +
    'UNTimeIntervalNotificationTrigger.triggerWithTimeInterval() or ' +
    'UNCalendarNotificationTrigger.triggerWithDateMatchingComponents()';

  // 三种触发方式的父类。认不出种类的触发器（按位置触发的，这个包没做）
  // 读出来就是它本身
  const UNNotificationTrigger = define(globalThis, 'UNNotificationTrigger',
    class UNNotificationTrigger {
      constructor(token, repeats) {
        if (token !== kInternal) {
          throw illegal((new.target && new.target.name) || 'UNNotificationTrigger',
                        HOW_TO_TRIGGER);
        }
        readOnlyField(this, 'repeats', () => repeats);
      }
    });

  // 过多少秒
  const UNTimeIntervalNotificationTrigger = define(globalThis,
    'UNTimeIntervalNotificationTrigger',
    class UNTimeIntervalNotificationTrigger extends UNNotificationTrigger {
      constructor(token, timeInterval, repeats) {
        super(token, repeats);
        readOnlyField(this, 'timeInterval', () => timeInterval);
        seal(this);
      }
      // triggerWithTimeInterval:repeats:。repeats 可以不带，不带就是不重复
      static triggerWithTimeInterval(timeInterval, options) {
        const seconds = toNumber(timeInterval, 'timeInterval');
        const repeats = toBoolean((options == null ? {} : options).repeats);
        // 这两条是系统的要求。系统的做法是抛 ObjC 异常（Mac 上量的），
        // 在这里拦成 TypeError，报在建触发器的这一行
        if (seconds <= 0) {
          throw new TypeError('triggerWithTimeInterval: timeInterval must be greater than 0, ' +
                              'got ' + describeValue(timeInterval));
        }
        if (repeats && seconds < 60) {
          throw new TypeError('triggerWithTimeInterval: timeInterval must be at least 60 ' +
                              'seconds when repeats is true, got ' + describeValue(timeInterval));
        }
        return new UNTimeIntervalNotificationTrigger(kInternal, seconds, repeats);
      }
    });

  // 日期的分量。名字是 NSDateComponents 的属性名
  const DATE_COMPONENTS = ['era', 'year', 'month', 'day', 'hour', 'minute', 'second',
                           'nanosecond', 'weekday', 'weekdayOrdinal', 'quarter', 'weekOfMonth',
                           'weekOfYear', 'yearForWeekOfYear', 'dayOfYear'];
  // 一个普通对象，只带写了的分量。null 和 undefined 都是「没写」：系统那边
  // 「这个分量没指定」是一个特殊的数，给 JS 的是「没有这个键」
  function dateComponentsArg(value) {
    const plain = value !== null && typeof value === 'object' && !Array.isArray(value) &&
                  (Object.getPrototypeOf(value) === Object.prototype ||
                   Object.getPrototypeOf(value) === null);
    if (!plain) {
      throw new TypeError('dateComponents must be a plain object such as { hour: 8, ' +
                          'minute: 30 }, got ' + describeValue(value));
    }
    for (const key of Object.keys(value)) {
      if (!DATE_COMPONENTS.includes(key)) {
        throw new TypeError('dateComponents has no component "' + key + '"; expected one of: ' +
                            DATE_COMPONENTS.join(' / '));
      }
    }
    const out = {};
    // 按固定的顺序放，读出来的键的先后不随写法变
    for (const key of DATE_COMPONENTS) {
      if (value[key] == null) continue;
      out[key] = toInteger(value[key], 'dateComponents.' + key);
    }
    return Object.freeze(out);
  }

  // 匹配日期的分量
  const UNCalendarNotificationTrigger = define(globalThis, 'UNCalendarNotificationTrigger',
    class UNCalendarNotificationTrigger extends UNNotificationTrigger {
      constructor(token, dateComponents, repeats) {
        super(token, repeats);
        readOnlyField(this, 'dateComponents', () => dateComponents);
        seal(this);
      }
      // triggerWithDateMatchingComponents:repeats:
      static triggerWithDateMatchingComponents(dateComponents, options) {
        const components = dateComponentsArg(dateComponents);
        const repeats = toBoolean((options == null ? {} : options).repeats);
        return new UNCalendarNotificationTrigger(kInternal, components, repeats);
      }
    });

  // 远程推送来的通知，它的请求带的是这个。只从系统给的通知里读得到
  const UNPushNotificationTrigger = define(globalThis, 'UNPushNotificationTrigger',
    class UNPushNotificationTrigger extends UNNotificationTrigger {
      constructor(token, repeats) {
        super(token, repeats);
        seal(this);
      }
    });

  // ---------- 请求 ----------
  const UNNotificationRequest = define(globalThis, 'UNNotificationRequest',
    class UNNotificationRequest {
      constructor(token, identifier, content, trigger) {
        if (token !== kInternal) {
          throw illegal('UNNotificationRequest', 'cannot be constructed with new; use ' +
                        'UNNotificationRequest.requestWithIdentifier()');
        }
        readOnlyField(this, 'identifier', () => identifier);
        readOnlyField(this, 'content', () => content);
        readOnlyField(this, 'trigger', () => trigger);
        seal(this);
      }
      // requestWithIdentifier:content:trigger:
      static requestWithIdentifier(identifier, options) {
        const id = toText(identifier);
        const o = options == null ? {} : options;
        if (!has(o, 'content')) {
          throw new TypeError('requestWithIdentifier needs { content }');
        }
        const content = o.content;
        if (content === null || typeof content !== 'object' || !genuine.has(content) ||
            !(content instanceof UNNotificationContent)) {
          throw new TypeError('requestWithIdentifier: content must be a UNNotificationContent, ' +
                              'got ' + describeValue(content));
        }
        // 从已经送达的通知里读出来的内容可以再用，除非它带着一个不是默认的
        // 声音：那个声音这边造不出来
        if (content.sound !== null && content.sound !== defaultSound) {
          throw new TypeError('requestWithIdentifier: this content carries a sound that came ' +
                              'from a delivered notification and cannot be scheduled again');
        }
        let trigger = null;
        if (o.trigger != null) {
          trigger = o.trigger;
          const ok = typeof trigger === 'object' && genuine.has(trigger) &&
                     (trigger instanceof UNTimeIntervalNotificationTrigger ||
                      trigger instanceof UNCalendarNotificationTrigger);
          if (!ok) {
            throw new TypeError(
              'requestWithIdentifier: trigger must be a UNTimeIntervalNotificationTrigger, a ' +
              'UNCalendarNotificationTrigger or null, got ' +
              (trigger instanceof UNNotificationTrigger ? 'a trigger that cannot be scheduled'
                                                        : describeValue(trigger)));
          }
        }
        return new UNNotificationRequest(kInternal, id, snapshot(content), trigger);
      }
    });

  // ---------- 只能由系统给的三个值 ----------
  const UNNotification = define(globalThis, 'UNNotification', class UNNotification {
    constructor(token, date, request) {
      if (token !== kInternal) {
        throw illegal('UNNotification', 'comes from the system (delivered notifications and ' +
                      'the notification events)');
      }
      // 每次读给一个新的 Date：Date 是可变的，共用一个的话改它就改了通知
      readOnlyField(this, 'date', () => new Date(date));
      readOnlyField(this, 'request', () => request);
      seal(this);
    }
  });

  const UNNotificationResponse = define(globalThis, 'UNNotificationResponse',
    class UNNotificationResponse {
      constructor(token, actionIdentifier, notification) {
        if (token !== kInternal) {
          throw illegal('UNNotificationResponse', 'comes from the ' +
                        'notificationclick event');
        }
        readOnlyField(this, 'actionIdentifier', () => actionIdentifier);
        readOnlyField(this, 'notification', () => notification);
        seal(this);
      }
    });

  const SETTINGS_FIELDS = [
    'authorizationStatus', 'soundSetting', 'badgeSetting', 'alertSetting',
    'notificationCenterSetting', 'lockScreenSetting', 'carPlaySetting', 'criticalAlertSetting',
    'announcementSetting', 'timeSensitiveSetting', 'scheduledDeliverySetting',
    'directMessagesSetting', 'alertStyle', 'showPreviewsSetting',
    'providesAppNotificationSettings',
  ];
  const UNNotificationSettings = define(globalThis, 'UNNotificationSettings',
    class UNNotificationSettings {
      constructor(token, fields) {
        if (token !== kInternal) {
          throw illegal('UNNotificationSettings', 'comes from ' +
                        'UNUserNotificationCenter.getNotificationSettings()');
        }
        for (const name of SETTINGS_FIELDS) {
          const value = fields[name];
          readOnlyField(this, name, () => value);
        }
        seal(this);
      }
    });

  // ---------- 过桥：值 ↔ JSON ----------
  function requestToWire(request) {
    const content = request.content;
    const trigger = request.trigger;
    let wireTrigger = null;
    if (trigger instanceof UNTimeIntervalNotificationTrigger) {
      wireTrigger = { type: 'timeInterval', timeInterval: trigger.timeInterval,
                      repeats: trigger.repeats };
    } else if (trigger instanceof UNCalendarNotificationTrigger) {
      wireTrigger = { type: 'calendar', dateComponents: trigger.dateComponents,
                      repeats: trigger.repeats };
    }
    return {
      identifier: request.identifier,
      content: {
        title: content.title,
        subtitle: content.subtitle,
        body: content.body,
        badge: content.badge,
        sound: content.sound === null ? null : 'default',
        threadIdentifier: content.threadIdentifier,
        userInfo: content.userInfo,
      },
      trigger: wireTrigger,
    };
  }

  function contentFromWire(wire) {
    let sound = null;
    if (wire.sound === 'default') sound = defaultSound;
    else if (wire.sound != null) sound = new UNNotificationSound(kInternal);
    return new UNNotificationContent(kInternal, {
      title: wire.title,
      subtitle: wire.subtitle,
      body: wire.body,
      badge: wire.badge,
      sound,
      threadIdentifier: wire.threadIdentifier,
      // 系统给的原样留着（远程推送的负载里可以有 null），只是冻住
      userInfo: deepFreeze(wire.userInfo == null ? {} : wire.userInfo),
    });
  }
  function triggerFromWire(wire) {
    if (wire == null) return null;
    const repeats = wire.repeats === true;
    if (wire.type === 'timeInterval') {
      return new UNTimeIntervalNotificationTrigger(kInternal, wire.timeInterval, repeats);
    }
    if (wire.type === 'calendar') {
      const components = {};
      for (const key of DATE_COMPONENTS) {
        if (wire.dateComponents[key] != null) components[key] = wire.dateComponents[key];
      }
      return new UNCalendarNotificationTrigger(kInternal, Object.freeze(components), repeats);
    }
    if (wire.type === 'push') return new UNPushNotificationTrigger(kInternal, repeats);
    return seal(new UNNotificationTrigger(kInternal, repeats));
  }
  function requestFromWire(wire) {
    return new UNNotificationRequest(kInternal, wire.identifier, contentFromWire(wire.content),
                                     triggerFromWire(wire.trigger));
  }
  function notificationFromWire(wire) {
    return new UNNotification(kInternal, wire.date, requestFromWire(wire.request));
  }
  function responseFromWire(wire) {
    return new UNNotificationResponse(kInternal, wire.actionIdentifier,
                                      notificationFromWire(wire.notification));
  }

  // 事件类。字段过桥时是普通对象，在这里换成上面的类型
  ctx.defineEventClass('UNNotificationPresentEvent', ctx.Event, { notification: ['UNNotification?', null] });
  ctx.defineEventClass('UNNotificationResponseEvent', ctx.Event,
                       { response: ['UNNotificationResponse?', null] });
  eventFieldConverters.set('UNNotificationPresentEvent', (fields) => ({
    notification: notificationFromWire(fields.notification),
  }));
  eventFieldConverters.set('UNNotificationResponseEvent', (fields) => ({
    response: responseFromWire(fields.response),
  }));

  // ---------- 参数 ----------
  // 一组名字（位掩码在 JS 这边是字符串数组）。名字认不认识由原生说，
  // 那张表在它那边
  function nameList(value, what) {
    if (value == null || typeof value !== 'object' ||
        typeof value[Symbol.iterator] !== 'function') {
      throw new TypeError(what + ' must be an array of names, got ' + describeValue(value));
    }
    return Array.from(value);
  }
  // 一组标识。里面的值按字符串转
  function identifierList(value, what) {
    if (value == null || typeof value !== 'object' ||
        typeof value[Symbol.iterator] !== 'function') {
      throw new TypeError(what + ': identifiers must be an array of strings, got ' +
                          describeValue(value));
    }
    return Array.from(value, toText);
  }

  // ---------- UNUserNotificationCenter ----------
  //
  // 整个 App 只有一个。第一次取到的那个包装记在这里，之后一直还它：
  //   - 监听器挂在包装上。包装被回收重建的话，监听器就没了，而通知的事件
  //     随时会来（用户点一条昨天的通知）。记在这里它就一直活着。
  //   - 不依赖系统每次给同一个指针（ASIdentifierManager 的 sharedManager 就
  //     不是）。原生那边也只认它第一次取到的那一个。
  //   - 放在闭包里而不是记在类上：方法被摘下来单独调用时 this 不是类
  let current = null;

  defineNativeClass('UNUserNotificationCenter', class UNUserNotificationCenter extends NSObject {
    constructor() { nativeOnly(new.target); }

    // 头文件里是类方法（+currentNotificationCenter），不是类属性，所以带括号
    static currentNotificationCenter() {
      if (current === null) {
        current = nativeClassCall('UNUserNotificationCenter', 'currentNotificationCenter', []);
      }
      return current;
    }

    // 两个事件名都交给原生去认：认不出来的抛，不当成只在 JS 这边的事件
    [kSubscribe](type, on) { subscribeNative(this, type, on); }

    // ---- 授权和设置 ----
    // requestAuthorizationWithOptions:completionHandler:，回调换成了 Promise。
    // 参数写错同步抛：名字只有原生认得，所以先过一次桥把它验掉，再走异步
    // 那条通道。这一步不到系统，不会弹提示框
    requestAuthorizationWithOptions(options) {
      requireNative(this, 'requestAuthorizationWithOptions');
      const names = nameList(options, 'requestAuthorizationWithOptions: options');
      nativeCall(this, 'nacre:checkAuthorizationOptions:', [names]);
      return nativeCallAsync(this, 'requestAuthorizationWithOptions:', [names]);
    }
    // getNotificationSettingsWithCompletionHandler:
    getNotificationSettings() {
      requireNative(this, 'getNotificationSettings');
      return nativeCallAsync(this, 'getNotificationSettings', [])
        .then((fields) => new UNNotificationSettings(kInternal, fields));
    }

    // ---- 发 ----
    // addNotificationRequest:withCompletionHandler:
    addNotificationRequest(request) {
      requireNative(this, 'addNotificationRequest');
      if (request === null || typeof request !== 'object' || !genuine.has(request) ||
          !(request instanceof UNNotificationRequest)) {
        throw new TypeError('addNotificationRequest: request must be a UNNotificationRequest, ' +
                            'got ' + describeValue(request));
      }
      return nativeCallAsync(this, 'addNotificationRequest:', [requestToWire(request)])
        .then(() => undefined);
    }

    // ---- 还没到的 ----
    // getPendingNotificationRequestsWithCompletionHandler:
    getPendingNotificationRequests() {
      requireNative(this, 'getPendingNotificationRequests');
      return nativeCallAsync(this, 'getPendingNotificationRequests', [])
        .then((list) => list.map(requestFromWire));
    }
    removePendingNotificationRequestsWithIdentifiers(identifiers) {
      nativeCall(this, 'removePendingNotificationRequestsWithIdentifiers:',
                 [identifierList(identifiers, 'removePendingNotificationRequestsWithIdentifiers')]);
    }
    removeAllPendingNotificationRequests() {
      nativeCall(this, 'removeAllPendingNotificationRequests', []);
    }

    // ---- 已经送达的 ----
    // getDeliveredNotificationsWithCompletionHandler:
    getDeliveredNotifications() {
      requireNative(this, 'getDeliveredNotifications');
      return nativeCallAsync(this, 'getDeliveredNotifications', [])
        .then((list) => list.map(notificationFromWire));
    }
    removeDeliveredNotificationsWithIdentifiers(identifiers) {
      nativeCall(this, 'removeDeliveredNotificationsWithIdentifiers:',
                 [identifierList(identifiers, 'removeDeliveredNotificationsWithIdentifiers')]);
    }
    removeAllDeliveredNotifications() {
      nativeCall(this, 'removeAllDeliveredNotifications', []);
    }

    // ---- 角标 ----
    // setBadgeCount:withCompletionHandler:
    setBadgeCount(count) {
      requireNative(this, 'setBadgeCount');
      const n = toInteger(count, 'setBadgeCount: count');
      if (n < 0) {
        throw new TypeError('setBadgeCount: count must not be negative, got ' +
                            describeValue(count));
      }
      return nativeCallAsync(this, 'setBadgeCount:', [n]).then(() => undefined);
    }

    // ---- App 在前台时收到通知怎么显示 ----
    //
    // ObjC 里没有这个属性：系统在通知到的那一刻调委托的
    // willPresentNotification:withCompletionHandler: 来问。JS 的事件是延后一轮
    // 派发的，当场答不了，所以换成预先设好的值，系统来问时原生直接拿它回答。
    // 默认是空的：不显示
    get foregroundPresentationOptions() {
      requireNative(this, 'foregroundPresentationOptions');
      return nativeGet(this, 'foregroundPresentationOptions');
    }
    set foregroundPresentationOptions(value) {
      requireNative(this, 'foregroundPresentationOptions');
      nativeSet(this, 'foregroundPresentationOptions',
                nameList(value, 'foregroundPresentationOptions'));
    }
  });
})
