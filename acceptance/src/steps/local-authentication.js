// LAContext：面容 ID / 触控 ID 认证。能力包 @nacrejs/local-authentication。
//
// 自动跑的部分**不弹任何系统界面**：建对象、读写属性、canEvaluatePolicy、
// 参数写错时抛什么，以及两条系统保证不出界面的拒绝（作废过的上下文、
// interactionNotAllowed）。真的要认证的放在面板的按钮上，点了才调。

import { panelRow, systemPanel } from './pasteboard.js';

const LA_DOMAIN = 'com.apple.LocalAuthentication';

// 认证失败时 err.name 的全部取值
const ERROR_NAMES = [
  'AuthenticationFailedError', 'UserCancelError', 'UserFallbackError', 'SystemCancelError',
  'PasscodeNotSetError', 'BiometryNotAvailableError', 'BiometryNotEnrolledError',
  'BiometryLockoutError', 'AppCancelError', 'InvalidContextError', 'NotInteractiveError',
  'NSError',
];

/**
 * 期望 fn 同步抛 TypeError，并且错误信息里有 fragments 里的每一段。
 *
 * @param {(label: string, actual: unknown, expected: unknown) => void} assert
 * @param {string} label
 * @param {() => unknown} fn
 * @param {string[]} [fragments]
 */
function throwsTypeError(assert, label, fn, fragments = []) {
  try {
    fn();
    assert(label, '没有抛', '抛 TypeError');
  } catch (err) {
    const message = String(err && err.message);
    const missing = fragments.filter((f) => !message.includes(f));
    assert(label, err instanceof TypeError && missing.length === 0 ? 'TypeError'
           : (err && err.name) + ': ' + message, 'TypeError');
  }
}

/** @param {any} err */
function describeFailure(err) {
  return err.name + '（code ' + err.code + '，' + err.domain + '）：' + err.message;
}

/**
 * @param {import("../main.js").StepContext} ctx
 * @returns {Promise<void>}
 */
export function stepLocalAuthentication(ctx) {
  const { assert } = ctx;
  console.log('--- LAContext（@nacrejs/local-authentication）---');

  // ---- 装了才有；可以 new ----
  assert('LAContext 是全局的类', typeof LAContext, 'function');
  const context = new LAContext();
  assert('new 出来的是 LAContext', context instanceof LAContext, true);
  assert('它也是 NSObject', context instanceof NSObject, true);
  assert('每次 new 是新的对象', new LAContext() !== context, true);
  throwsTypeError(assert, '不能继承', () => {
    class Mine extends LAContext {}
    new Mine();
  }, ['Illegal constructor']);

  // ---- biometryType：只读的字符串枚举 ----
  const kinds = ['none', 'touchID', 'faceID', 'opticID'];
  assert('biometryType 是四个名字之一', kinds.includes(context.biometryType), true);
  console.log('  实测：biometryType = ' + context.biometryType);
  throwsTypeError(assert, 'biometryType 只读', () => {
    // @ts-expect-error 只读
    context.biometryType = 'faceID';
  });

  // ---- canEvaluatePolicy：同步，布尔，不弹界面 ----
  const before = performance.now();
  const canBiometrics = context.canEvaluatePolicy('deviceOwnerAuthenticationWithBiometrics');
  const cost = performance.now() - before;
  const canOwner = context.canEvaluatePolicy('deviceOwnerAuthentication');
  assert('canEvaluatePolicy(生物认证) 是布尔', typeof canBiometrics, 'boolean');
  assert('canEvaluatePolicy(生物认证或密码) 是布尔', typeof canOwner, 'boolean');
  console.log('  实测：能用生物认证 = ' + canBiometrics + '，能用生物认证或密码 = ' + canOwner +
              '，问一次用了 ' + cost.toFixed(1) + ' ms');
  assert('问过之后 biometryType 仍是四个名字之一', kinds.includes(context.biometryType), true);
  // 能用生物认证，设备就一定有某一种生物认证
  assert('能用生物认证时 biometryType 不是 none',
         !canBiometrics || context.biometryType !== 'none', true);

  const choices = ['expected one of', 'deviceOwnerAuthenticationWithBiometrics',
                   'deviceOwnerAuthentication'];
  throwsTypeError(assert, 'canEvaluatePolicy：不认识的策略抛，并列出可选值', () => {
    // @ts-expect-error 没有这个策略
    context.canEvaluatePolicy('biometrics');
  }, choices);
  throwsTypeError(assert, 'canEvaluatePolicy：不带策略抛', () => {
    // @ts-expect-error 少了参数
    context.canEvaluatePolicy();
  }, choices);
  throwsTypeError(assert, 'canEvaluatePolicy：策略给数字抛', () => {
    // @ts-expect-error 策略是字符串
    context.canEvaluatePolicy(1);
  }, choices);
  // 明确不支持：配套设备（手表）的两种策略
  throwsTypeError(assert, 'canEvaluatePolicy：配套设备的策略不支持', () => {
    // @ts-expect-error 不支持
    context.canEvaluatePolicy('deviceOwnerAuthenticationWithCompanion');
  }, choices);

  // ---- canEvaluatePolicyError：不能认证的原因。同步，不弹界面，不抛 ----
  // 原生是 canEvaluatePolicy:error: 的那个出参。能认证时是 null；不能时是一个
  // 错误对象（返回，不是抛），形状和 evaluatePolicy() 拒绝的那个一样
  // 认证「开始不了」的四种原因（头文件里写着 could not start 的那几个）
  const CANNOT_START = ['PasscodeNotSetError', 'BiometryNotAvailableError',
                        'BiometryNotEnrolledError', 'BiometryLockoutError'];
  /** @type {Array<['deviceOwnerAuthenticationWithBiometrics' | 'deviceOwnerAuthentication', boolean]>} */
  const asked = [['deviceOwnerAuthenticationWithBiometrics', canBiometrics],
                 ['deviceOwnerAuthentication', canOwner]];
  for (const [policy, can] of asked) {
    let why;
    let thrown = '没抛';
    try { why = context.canEvaluatePolicyError(policy); } catch (err) { thrown = String(err); }
    assert('canEvaluatePolicyError(' + policy + ') 不抛', thrown, '没抛');
    if (thrown !== '没抛' || why === undefined) continue;
    console.log('  实测：canEvaluatePolicyError(' + policy + ') = ' +
                (why === null ? 'null' : describeFailure(why)));
    assert('canEvaluatePolicyError(' + policy + ')：能认证时是 null，不能时不是',
           why === null, can);
    if (why === null) continue;
    assert(policy + ' 的原因：是 NSError', why instanceof NSError, true);
    assert(policy + ' 的原因：name 是约定的十二个之一', ERROR_NAMES.includes(why.name), true);
    assert(policy + ' 的原因：name 是「开始不了」的四种之一', CANNOT_START.includes(why.name), true);
    assert(policy + ' 的原因：code 是数', typeof why.code, 'number');
    assert(policy + ' 的原因：domain', why.domain, LA_DOMAIN);
    assert(policy + ' 的原因：message 是非空字符串',
           typeof why.message === 'string' && why.message.length > 0, true);
    const again = context.canEvaluatePolicyError(policy);
    assert(policy + ' 的原因：每次问得到一个新的对象', again !== null && again !== why, true);
    assert(policy + ' 的原因：两次问到的是同一种', again !== null && again.name, why.name);
  }
  throwsTypeError(assert, 'canEvaluatePolicyError：不认识的策略抛，并列出可选值', () => {
    // @ts-expect-error 没有这个策略
    context.canEvaluatePolicyError('biometrics');
  }, ['canEvaluatePolicyError', ...choices]);
  throwsTypeError(assert, 'canEvaluatePolicyError：不带策略抛', () => {
    // @ts-expect-error 少了参数
    context.canEvaluatePolicyError();
  }, choices);
  throwsTypeError(assert, 'canEvaluatePolicyError：策略给数字抛', () => {
    // @ts-expect-error 策略是字符串
    context.canEvaluatePolicyError(1);
  }, choices);
  throwsTypeError(assert, 'canEvaluatePolicyError：配套设备的策略不支持', () => {
    // @ts-expect-error 不支持
    context.canEvaluatePolicyError('deviceOwnerAuthenticationWithCompanion');
  }, choices);

  // ---- 属性：默认值 ----
  assert('localizedFallbackTitle 默认 null', context.localizedFallbackTitle, null);
  assert('localizedCancelTitle 默认 null', context.localizedCancelTitle, null);
  assert('touchIDAuthenticationAllowableReuseDuration 默认 0',
         context.touchIDAuthenticationAllowableReuseDuration, 0);
  assert('interactionNotAllowed 默认 false', context.interactionNotAllowed, false);

  // ---- 属性：读写和转换 ----
  context.localizedFallbackTitle = 'Use PIN';
  assert('localizedFallbackTitle 写进去读出来', context.localizedFallbackTitle, 'Use PIN');
  context.localizedFallbackTitle = '';
  assert('localizedFallbackTitle 写空串读回空串（隐藏那个按钮）',
         context.localizedFallbackTitle === '', true);
  // @ts-expect-error 类型定义要字符串或 null，运行时按 String() 转
  context.localizedFallbackTitle = 5;
  assert('localizedFallbackTitle 写数字：转成字符串', context.localizedFallbackTitle, '5');
  context.localizedFallbackTitle = null;
  assert('localizedFallbackTitle 写 null 读回 null', context.localizedFallbackTitle, null);
  context.localizedFallbackTitle = 'x';
  // @ts-expect-error 类型定义要字符串或 null，运行时把 undefined 当 null
  context.localizedFallbackTitle = undefined;
  assert('localizedFallbackTitle 写 undefined 读回 null', context.localizedFallbackTitle, null);

  context.localizedCancelTitle = 'Not now';
  assert('localizedCancelTitle 写进去读出来', context.localizedCancelTitle, 'Not now');
  context.localizedCancelTitle = null;
  assert('localizedCancelTitle 写 null 读回 null', context.localizedCancelTitle, null);

  context.touchIDAuthenticationAllowableReuseDuration = 60;
  assert('touchIDAuthenticationAllowableReuseDuration 写 60 读回 60',
         context.touchIDAuthenticationAllowableReuseDuration, 60);
  // @ts-expect-error 类型定义要数，运行时按 Number() 转
  context.touchIDAuthenticationAllowableReuseDuration = '30';
  assert('写字符串 "30"：转成数', context.touchIDAuthenticationAllowableReuseDuration, 30);
  throwsTypeError(assert, '写转不出数的值抛', () => {
    // @ts-expect-error 要数
    context.touchIDAuthenticationAllowableReuseDuration = 'soon';
  }, ['finite number']);
  throwsTypeError(assert, '写 undefined 抛', () => {
    // @ts-expect-error 要数
    context.touchIDAuthenticationAllowableReuseDuration = undefined;
  }, ['finite number']);
  throwsTypeError(assert, '写 NaN 抛', () => {
    context.touchIDAuthenticationAllowableReuseDuration = NaN;
  }, ['finite number']);
  throwsTypeError(assert, '写负数抛（取值范围由这个属性自己拒）', () => {
    context.touchIDAuthenticationAllowableReuseDuration = -1;
  }, ['must not be negative']);
  assert('被拒之后原值不动', context.touchIDAuthenticationAllowableReuseDuration, 30);
  context.touchIDAuthenticationAllowableReuseDuration = 0;

  context.interactionNotAllowed = true;
  assert('interactionNotAllowed 写 true 读回 true', context.interactionNotAllowed, true);
  // @ts-expect-error 类型定义要布尔，运行时按真假值转
  context.interactionNotAllowed = 0;
  assert('interactionNotAllowed 写 0：转成 false', context.interactionNotAllowed, false);
  // @ts-expect-error 同上。'false' 是非空字符串，是真
  context.interactionNotAllowed = 'false';
  assert("interactionNotAllowed 写 'false'：是 true（和 Web 一致）",
         context.interactionNotAllowed, true);
  context.interactionNotAllowed = false;

  // ---- 明确不支持的成员：不存在，不是读了才抛的占位 ----
  for (const name of ['localizedReason', 'evaluateAccessControl', 'setCredential',
                      'isCredentialSet', 'domainState', 'evaluatedPolicyDomainState',
                      'maxBiometryFailures']) {
    assert('没有 ' + name + ' 这个成员', name in context, false);
  }

  // ---- evaluatePolicy：参数写错一律同步抛，不是拒绝；这几条都到不了系统 ----
  const reason = { localizedReason: 'Acceptance run' };
  throwsTypeError(assert, 'evaluatePolicy：不认识的策略同步抛，并列出可选值', () => {
    // @ts-expect-error 没有这个策略
    context.evaluatePolicy('faceID', reason);
  }, choices);
  throwsTypeError(assert, 'evaluatePolicy：不带策略同步抛', () => {
    // @ts-expect-error 少了参数
    context.evaluatePolicy();
  });
  throwsTypeError(assert, 'evaluatePolicy：不带 options 同步抛', () => {
    // @ts-expect-error 少了 options
    context.evaluatePolicy('deviceOwnerAuthentication');
  }, ['localizedReason']);
  throwsTypeError(assert, 'evaluatePolicy：options 给 null 同步抛', () => {
    // @ts-expect-error options 必填
    context.evaluatePolicy('deviceOwnerAuthentication', null);
  }, ['localizedReason']);
  throwsTypeError(assert, 'evaluatePolicy：options 里没有 localizedReason 同步抛', () => {
    // @ts-expect-error localizedReason 必填
    context.evaluatePolicy('deviceOwnerAuthentication', {});
  }, ['localizedReason']);
  throwsTypeError(assert, 'evaluatePolicy：localizedReason 是 undefined 视为没带', () => {
    // @ts-expect-error localizedReason 必填
    context.evaluatePolicy('deviceOwnerAuthentication', { localizedReason: undefined });
  }, ['localizedReason']);
  throwsTypeError(assert, 'evaluatePolicy：localizedReason 是空串同步抛', () => {
    context.evaluatePolicy('deviceOwnerAuthentication', { localizedReason: '' });
  }, ['localizedReason', 'empty']);
  throwsTypeError(assert, 'evaluatePolicy：localizedReason 是 null 同步抛（转成空串）', () => {
    // @ts-expect-error 要字符串
    context.evaluatePolicy('deviceOwnerAuthentication', { localizedReason: null });
  }, ['localizedReason', 'empty']);

  // ---- invalidate ----
  const dead = new LAContext();
  assert('invalidate() 没有返回值', dead.invalidate(), undefined);
  let twice = 'ok';
  try { dead.invalidate(); } catch (err) { twice = String(err); }
  assert('作废两次不抛', twice, 'ok');
  // 期望来自头文件（LAErrorInvalidContext）和 macOS 上的探针，iOS 上这是第一次跑
  assert('作废之后 canEvaluatePolicy 是 false',
         dead.canEvaluatePolicy('deviceOwnerAuthentication'), false);
  let deadWhy = '没问到';
  try {
    const why = dead.canEvaluatePolicyError('deviceOwnerAuthentication');
    deadWhy = why === null ? 'null' : why.name;
  } catch (err) { deadWhy = '抛了 ' + String(err); }
  assert('作废之后 canEvaluatePolicyError 的原因是 InvalidContextError', deadWhy, 'InvalidContextError');
  assert('作废之后 biometryType 还读得到', kinds.includes(dead.biometryType), true);

  // ---- 两条不出界面的拒绝 ----
  /**
   * @param {string} label
   * @param {Promise<unknown>} pending
   * @param {string[]} names 允许的 err.name
   */
  const expectRejection = (label, pending, names) => {
    assert(label + '：返回的是 Promise', pending instanceof Promise, true);
    let settled = false;
    const outcome = pending.then((value) => {
      settled = true;
      assert(label + '：被拒绝', '兑现成了 ' + value, '被拒绝');
    }, (err) => {
      settled = true;
      console.log('  实测：' + label + ' → ' + describeFailure(err));
      assert(label + '：被拒绝，err.name 在约定的名字里', names.includes(err.name), true);
      assert(label + '：拒绝的是 NSError', err instanceof NSError, true);
      assert(label + '：err.name 是约定的十二个之一', ERROR_NAMES.includes(err.name), true);
      assert(label + '：err.code 是数', typeof err.code, 'number');
      assert(label + '：err.domain', err.domain, LA_DOMAIN);
      assert(label + '：err.message 是非空字符串',
             typeof err.message === 'string' && err.message.length > 0, true);
    });
    const deadline = new Promise((resolve) => {
      setTimeout(() => {
        if (!settled) console.log('  ! ' + label + '：5 秒内没有结算，这一组未验证');
        resolve(undefined);
      }, 5000);
    });
    return Promise.race([outcome, deadline]);
  };

  // 作废过的上下文：系统直接给 LAErrorInvalidContext，不出界面
  const first = expectRejection('作废之后 evaluatePolicy',
                                dead.evaluatePolicy('deviceOwnerAuthentication', reason),
                                ['InvalidContextError']).then(() => {
    return undefined;
  });

  // interactionNotAllowed：系统承诺「需要出界面时改成以 LAErrorNotInteractive 失败」。
  // 只在模拟器上跑：真机上第一次用面容 ID 会不会先出权限提示框，没有验证过
  let second = Promise.resolve(undefined);
  if (application.info.DTPlatformName === 'iphonesimulator') {
    const quiet = new LAContext();
    quiet.interactionNotAllowed = true;
    second = first.then(() => expectRejection(
      'interactionNotAllowed 时 evaluatePolicy',
      quiet.evaluatePolicy('deviceOwnerAuthentication', reason),
      // 没设密码的模拟器在「需要出界面」之前就失败了，两种都算对
      ['NotInteractiveError', 'PasscodeNotSetError']));
  } else {
    console.log('  ! 不在模拟器上，interactionNotAllowed 那一条不自动跑（没验证过真机上会不会先出权限提示框）');
  }

  // ---- 屏幕上：一排按钮，点了才真的认证 ----
  /**
   * @param {string} label
   * @param {LAPolicy} policy
   * @param {(c: LAContext) => void} [prepare]
   */
  const authenticate = (label, policy, prepare) => () => {
    const c = new LAContext();
    if (prepare) prepare(c);
    console.log('  真实触摸：' + label + '，biometryType = ' + c.biometryType +
                '，canEvaluatePolicy = ' + c.canEvaluatePolicy(policy));
    c.evaluatePolicy(policy, { localizedReason: 'Confirm it is you (acceptance)' }).then(
      (value) => { console.log('  ✓ 真实触摸：' + label + ' 通过，兑现的值 = ' + value); },
      (err) => { console.log('  ✓ 真实触摸：' + label + ' 没通过 → ' + describeFailure(err)); });
    return c;
  };
  panelRow(systemPanel(ctx), [
    ['面容/指纹', authenticate('生物认证', 'deviceOwnerAuthenticationWithBiometrics', (c) => {
      c.localizedFallbackTitle = 'Use PIN';
      c.localizedCancelTitle = 'Not now';
    })],
    ['或密码', authenticate('生物认证或密码', 'deviceOwnerAuthentication')],
    ['认证中作废', () => {
      const c = authenticate('认证中作废', 'deviceOwnerAuthentication')();
      // 界面出来之后把它作废：应该以 AppCancelError 结束
      setTimeout(() => { c.invalidate(); }, 1500);
    }],
  ]);
  console.log('  ✓ 面板里多了一排按钮：面容/指纹、或密码、认证中作废');

  return second.then(() => {
    console.log('--- LAContext：以上异步断言跑完 ---');
  });
}
