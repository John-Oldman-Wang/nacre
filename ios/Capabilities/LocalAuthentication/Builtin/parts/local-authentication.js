// LAContext 的 JS 那一半：面容 ID / 触控 ID 认证。
//
// 这是能力包自己的 part：它不在核心里，跟着 NacreLocalAuthentication.framework
// 走（Builtin/parts/）。运行时在核心的 part 全部跑完之后，用同一个 ctx 调它一次。
// 项目没装 @nacrejs/local-authentication 时这个文件不存在，全局也就没有 LAContext。
(function (ctx) {
  'use strict';

  const {
    constructNative,
    defineNativeClass,
    has,
    nativeCall,
    nativeCallAsync,
    nativeGet,
    nativeSet,
    requireNative,
    toBoolean,
    toNumber,
    toText,
    toTextOrNull,
  } = ctx;

  // 一次认证用一个 LAContext：按钮标题这些设置挂在它上面，作废（invalidate）
  // 之后它也不能再用。所以它是可以 new 的普通对象，不是单例
  defineNativeClass('LAContext', class LAContext extends NSObject {
    constructor() {
      super();
      constructNative(this, new.target, 'LAContext', []);
    }

    // 设备支持哪一种生物认证：'none' / 'touchID' / 'faceID' / 'opticID'
    get biometryType() { requireNative(this, 'biometryType'); return nativeGet(this, 'biometryType'); }

    // 认证失败一次之后出现的那个备用按钮的标题。null 用系统默认的，空串隐藏按钮
    get localizedFallbackTitle() {
      requireNative(this, 'localizedFallbackTitle');
      return nativeGet(this, 'localizedFallbackTitle');
    }
    set localizedFallbackTitle(value) {
      requireNative(this, 'localizedFallbackTitle');
      nativeSet(this, 'localizedFallbackTitle', toTextOrNull(value));
    }
    // 取消按钮的标题。null 用系统默认的
    get localizedCancelTitle() {
      requireNative(this, 'localizedCancelTitle');
      return nativeGet(this, 'localizedCancelTitle');
    }
    set localizedCancelTitle(value) {
      requireNative(this, 'localizedCancelTitle');
      nativeSet(this, 'localizedCancelTitle', toTextOrNull(value));
    }
    // 多少秒之内用生物认证解锁过屏幕，就算认证通过、不再问。单位秒，默认 0
    get touchIDAuthenticationAllowableReuseDuration() {
      requireNative(this, 'touchIDAuthenticationAllowableReuseDuration');
      return nativeGet(this, 'touchIDAuthenticationAllowableReuseDuration');
    }
    set touchIDAuthenticationAllowableReuseDuration(value) {
      requireNative(this, 'touchIDAuthenticationAllowableReuseDuration');
      nativeSet(this, 'touchIDAuthenticationAllowableReuseDuration',
                toNumber(value, 'touchIDAuthenticationAllowableReuseDuration'));
    }
    // true：需要出界面时不出，认证改成以 NotInteractiveError 失败
    get interactionNotAllowed() {
      requireNative(this, 'interactionNotAllowed');
      return nativeGet(this, 'interactionNotAllowed');
    }
    set interactionNotAllowed(value) {
      requireNative(this, 'interactionNotAllowed');
      nativeSet(this, 'interactionNotAllowed', toBoolean(value));
    }

    // canEvaluatePolicy:error: 的返回值那一半。同步，不出界面。策略写错由原生抛
    // （可选值在它那张表里）
    canEvaluatePolicy(policy) {
      return nativeCall(this, 'canEvaluatePolicy:', [policy]);
    }

    // canEvaluatePolicy:error: 的出参那一半：为什么不能认证。能认证时是 null；
    // 不能时**返回**（不抛）一个 Error，name / code / domain / message 和
    // evaluatePolicy() 拒绝的那个是同一套。「不能」是正常的答案，不是出错
    canEvaluatePolicyError(policy) {
      const fields = nativeCall(this, 'canEvaluatePolicyError:', [policy]);
      if (fields == null) return null;
      const error = new Error(fields.message);
      error.name = fields.name;
      error.code = fields.code;
      error.domain = fields.domain;
      return error;
    }

    // evaluatePolicy:localizedReason:reply:。reply 是 block，所以是 Promise：
    // 通过了兑现 true，没通过拒绝（err.name 说是哪一种）。
    //
    // 参数写错一律**同步抛** TypeError，和别的方法一致。策略的名字只有原生
    // 认得，所以先过一次桥把它验掉，再走异步那条通道
    evaluatePolicy(policy, options) {
      nativeCall(this, 'nacre:checkPolicy:', [policy]);
      const o = options == null ? {} : options;
      if (!has(o, 'localizedReason')) {
        throw new TypeError('evaluatePolicy needs options.localizedReason');
      }
      const reason = toText(o.localizedReason);
      // 系统对空串的做法是抛 NSInvalidArgumentException，在这里拦掉
      if (reason === '') {
        throw new TypeError('evaluatePolicy: localizedReason must not be empty');
      }
      return nativeCallAsync(this, 'evaluatePolicy:localizedReason:', [policy, reason]);
    }

    // 作废：正在进行的认证以 AppCancelError 结束，之后这个对象不能再用来认证
    invalidate() {
      nativeCall(this, 'invalidate', []);
    }
  });
})
