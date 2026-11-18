// 跟踪授权和广告标识的 JS 那一半：ATTrackingManager、ASIdentifierManager。
//
// 这是能力包自己的 part：它不在核心里，跟着
// NacreAppTrackingTransparency.framework 走（Builtin/parts/）。运行时在核心的
// part 全部跑完之后，用同一个 ctx 调它一次，所以下面解构出来的名字就是核心
// 给能力包的接口。
(function (ctx) {
  'use strict';

  const {
    defineNativeClass,
    finalCheck,
    nativeClassCall,
    nativeClassCallValue,
    nativeGet,
    nativeOnly,
    registerBlock,
    releaseBlock,
    requireNative,
  } = ctx;

  // ---------- ATTrackingManager ----------
  //
  // 「跟踪」指把这个 App 收集的用户数据和别的公司的数据关联起来，用于广告
  // 或者交给数据中间商。做这件事之前要用户点头：系统弹一个提示框，App 只能
  // 问一次。
  //
  // 全是类级的成员，没有实例：头文件里 init 和 new 都标了不可用。
  defineNativeClass('ATTrackingManager', class ATTrackingManager extends NSObject {
    // 不用 nativeOnly：它的报错说「由运行时创建」，而这个类根本没有实例
    constructor() {
      finalCheck(new.target);   // 是子类化就先报子类化
      throw new TypeError(
        'Illegal constructor: ATTrackingManager has no instances; use ' +
        'ATTrackingManager.trackingAuthorizationStatus and ' +
        'ATTrackingManager.requestTrackingAuthorization()');
    }

    // 现在的授权状态：'notDetermined' | 'restricted' | 'denied' | 'authorized'。
    // 读它不会弹提示框
    static get trackingAuthorizationStatus() {
      return nativeClassCallValue('ATTrackingManager', 'trackingAuthorizationStatus', []);
    }

    // 向用户申请。Promise 兑现成用户答复之后的授权状态。
    //
    // 状态还是 'notDetermined' 时系统弹出提示框；已经定了就不再弹，直接兑现
    // 成现在的状态。ObjC 的名字是 requestTrackingAuthorizationWithCompletionHandler:，
    // 回调换成了 Promise。
    //
    // 不同步抛：它没有参数可以写错，剩下的失败（工程里缺权限文案）是环境的
    // 问题，和别的异步接口一样从 Promise 出去
    static requestTrackingAuthorization() {
      let settle;
      let fail;
      const answered = new Promise((resolve, reject) => { settle = resolve; fail = reject; });
      // 系统的答复：原生只调一次，调完自动注销
      const completion = registerBlock((status, raw) => {
        if (typeof status === 'string') {
          settle(status);
        } else {
          fail(new TypeError('requestTrackingAuthorization: the system answered with a ' +
                             'status this runtime does not know (' + raw + ')'));
        }
      }, true);
      try {
        nativeClassCallValue('ATTrackingManager',
                             'requestTrackingAuthorizationWithCompletionHandler:', [completion]);
      } catch (err) {
        // 没问出去，这个号不会再有人调
        releaseBlock(completion);
        fail(err);
      }
      return answered;
    }
  });

  // ---------- ASIdentifierManager ----------
  //
  // 广告标识：一台设备上所有 App 读到的是同一个值，广告平台靠它认出同一个
  // 用户。用户没有授权跟踪时，系统给的是全零的那个值。
  //
  // sharedManager() 第一次调用时取到的那个包装，之后一直还它。
  //
  // 名字叫 shared，系统给的却不是同一个对象：实测 +sharedManager 每调一次
  // 新建一个（两次的指针不同，isEqual: 也是 NO）。包装是按原生指针认的，
  // 所以不在这里记住的话，JS 里 sharedManager() === sharedManager() 是 false。
  // 记住第一个没有代价：这个类没有实例变量，哪个实例读到的都一样。
  //
  // 放在闭包里而不是 own(this, …)：方法被摘下来单独调用时 this 不是类
  let sharedManager = null;

  defineNativeClass('ASIdentifierManager', class ASIdentifierManager extends NSObject {
    constructor() { nativeOnly(new.target); }

    // 头文件里是类方法（+sharedManager），不是类属性，所以带括号
    static sharedManager() {
      if (sharedManager === null) {
        sharedManager = nativeClassCall('ASIdentifierManager', 'sharedManager', []);
      }
      return sharedManager;
    }

    // 大写的 UUID 字符串。没授权时是 '00000000-0000-0000-0000-000000000000'
    get advertisingIdentifier() {
      requireNative(this, 'advertisingIdentifier');
      return nativeGet(this, 'advertisingIdentifier');
    }
  });
})
