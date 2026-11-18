// 跟踪授权和广告标识：ATTrackingManager、ASIdentifierManager。
//
// 这两个类不在核心里，来自能力包 @nacrejs/app-tracking-transparency（装了才有）。
//
// 自动跑的部分**不能弹出系统的授权提示框**：提示框一出来，后面的步骤就都
// 盖在它下面了。所以这里自动验的只有不弹框的那些——读授权状态、读广告标识
// 的形状、不能 new、写错时抛什么。申请授权放在面板的按钮上，要人点。

import { panelRow, systemPanel } from './pasteboard.js';

const STATUSES = ['notDetermined', 'restricted', 'denied', 'authorized'];
const ZERO_IDENTIFIER = '00000000-0000-0000-0000-000000000000';
const UUID = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/;

/** @param {import("../main.js").StepContext} ctx */
export function stepAppTrackingTransparency(ctx) {
  const { assert } = ctx;
  console.log('--- 跟踪授权和广告标识（@nacrejs/app-tracking-transparency）---');

  // ===== 工程配置 =====
  //
  // 这个包在清单里要求项目写 NSUserTrackingUsageDescription。没有这一句，
  // 申请授权的那一刻系统会直接终止 App。验收的 nacre.config.json 里写了，
  // 这里确认它真的进了 Info.plist
  const usage = application.info.NSUserTrackingUsageDescription;
  assert('Info.plist 里有 NSUserTrackingUsageDescription',
         typeof usage === 'string' && usage.length > 0, true);

  // ===== ATTrackingManager =====
  assert('ATTrackingManager 是全局的类', typeof ATTrackingManager, 'function');
  assert('它继承 NSObject',
         Object.getPrototypeOf(ATTrackingManager) === NSObject, true);
  try {
    // @ts-expect-error 构造函数是私有的
    new ATTrackingManager();
    console.log('  ✗ ATTrackingManager 居然能 new');
  } catch (err) {
    assert('ATTrackingManager 不能 new', err instanceof TypeError, true);
    assert('报错说它不能用 new 创建', String(err.message).includes('Illegal constructor'), true);
  }
  try {
    // @ts-expect-error 构造函数是私有的，不能继承
    class MyTracking extends ATTrackingManager {}
    // @ts-expect-error 同上
    new MyTracking();
    console.log('  ✗ ATTrackingManager 居然能继承');
  } catch (err) {
    assert('ATTrackingManager 不能继承', err instanceof TypeError, true);
  }

  // ---- trackingAuthorizationStatus：类上的只读属性 ----
  const status = ATTrackingManager.trackingAuthorizationStatus;
  assert('trackingAuthorizationStatus 是字符串', typeof status, 'string');
  assert('它是四个状态之一', STATUSES.includes(status), true);
  assert('连读两次一样', ATTrackingManager.trackingAuthorizationStatus, status);
  const statusDescriptor =
    Object.getOwnPropertyDescriptor(ATTrackingManager, 'trackingAuthorizationStatus');
  assert('它是类上的取值器，没有 setter',
         statusDescriptor !== undefined && typeof statusDescriptor.get === 'function' &&
         statusDescriptor.set === undefined, true);
  try {
    // @ts-expect-error 只读
    ATTrackingManager.trackingAuthorizationStatus = 'authorized';
    console.log('  ✗ trackingAuthorizationStatus 居然能写');
  } catch (err) {
    assert('trackingAuthorizationStatus 只读，写了抛 TypeError', err instanceof TypeError, true);
  }
  assert('写过之后状态没变', ATTrackingManager.trackingAuthorizationStatus, status);
  assert('实例上没有这个属性（它是类的）',
         'trackingAuthorizationStatus' in ATTrackingManager.prototype, false);

  // ---- requestTrackingAuthorization：存在，但这里不调（会弹框）----
  assert('requestTrackingAuthorization 是类上的方法',
         typeof ATTrackingManager.requestTrackingAuthorization, 'function');
  assert('它不收参数', ATTrackingManager.requestTrackingAuthorization.length, 0);
  // iOS 27.2 新加的那个带扩展界面的申请方法没有接
  assert('明确不支持：requestTrackingAuthorizationPreferringExpandedInterface 不存在',
         'requestTrackingAuthorizationPreferringExpandedInterface' in ATTrackingManager, false);

  // ===== ASIdentifierManager =====
  assert('ASIdentifierManager 是全局的类', typeof ASIdentifierManager, 'function');
  try {
    // @ts-expect-error 构造函数是私有的
    new ASIdentifierManager();
    console.log('  ✗ ASIdentifierManager 居然能 new');
  } catch (err) {
    assert('ASIdentifierManager 不能 new', err instanceof TypeError, true);
    assert('报错说它不能用 new 创建', String(err.message).includes('Illegal constructor'), true);
  }

  // ---- sharedManager()：头文件里是类方法，所以带括号 ----
  const manager = ASIdentifierManager.sharedManager();
  assert('sharedManager() 给的是 ASIdentifierManager',
         manager instanceof ASIdentifierManager, true);
  assert('它也是 NSObject', manager instanceof NSObject, true);
  // 系统的 +sharedManager 每调一次给一个新对象（探针量的），「同一个」是
  // 运行时在 JS 一侧保住的。第一版实现没保，这一条在合并后的验收里挂过
  assert('每次调得到同一个对象', ASIdentifierManager.sharedManager() === manager, true);
  const take = ASIdentifierManager.sharedManager;
  assert('把方法摘下来单独调，也是同一个对象', take() === manager, true);

  // ---- advertisingIdentifier ----
  const identifier = manager.advertisingIdentifier;
  assert('advertisingIdentifier 是字符串', typeof identifier, 'string');
  assert('形如大写的 UUID', UUID.test(identifier), true);
  assert('连读两次一样', manager.advertisingIdentifier, identifier);
  // 没授权时系统给的是全零的那个值，照实给，不换成 null
  if (status !== 'authorized') {
    assert('没授权（' + status + '）时是全零的标识', identifier, ZERO_IDENTIFIER);
  } else {
    console.log('  ! 已经授权过了，「没授权时是全零」这一条这次没验');
  }
  try {
    // @ts-expect-error 只读
    manager.advertisingIdentifier = ZERO_IDENTIFIER;
    console.log('  ✗ advertisingIdentifier 居然能写');
  } catch (err) {
    assert('advertisingIdentifier 只读，写了抛 TypeError', err instanceof TypeError, true);
  }
  try {
    // 绕过构造造出来的对象：原型对，但没有原生对象
    const fake = Object.create(ASIdentifierManager.prototype);
    void fake.advertisingIdentifier;
    console.log('  ✗ 没有原生对象的空壳居然读得出 advertisingIdentifier');
  } catch (err) {
    assert('空壳上读 advertisingIdentifier 抛 TypeError', err instanceof TypeError, true);
  }
  // iOS 14 起废弃的那个开关没有接，它的替代品就是 trackingAuthorizationStatus
  assert('明确不支持：isAdvertisingTrackingEnabled 不存在',
         'isAdvertisingTrackingEnabled' in manager, false);
  assert('明确不支持：advertisingTrackingEnabled 不存在',
         'advertisingTrackingEnabled' in manager, false);

  console.log('  实测：trackingAuthorizationStatus = ' + status +
              '，advertisingIdentifier = ' + identifier);

  // ===== 申请授权 =====
  //
  // 状态已经定下来（不是 notDetermined）时，系统不再弹框，直接把现在的状态
  // 交回来——这种情况可以自动验。还没定的时候一调就弹框，留给按钮
  /** @param {string} how */
  const request = (how) => {
    const promise = ATTrackingManager.requestTrackingAuthorization();
    assert(how + '：requestTrackingAuthorization() 返回 Promise',
           promise instanceof Promise, true);
    return promise.then((answer) => {
      assert(how + '：兑现成四个状态之一', STATUSES.includes(answer), true);
      assert(how + '：和这时读到的 trackingAuthorizationStatus 一致',
             ATTrackingManager.trackingAuthorizationStatus, answer);
      const now = ASIdentifierManager.sharedManager().advertisingIdentifier;
      if (answer !== 'authorized') {
        assert(how + '：没授权，广告标识是全零', now, ZERO_IDENTIFIER);
      }
      console.log('  实测（' + how + '）：授权状态 = ' + answer + '，advertisingIdentifier = ' + now);
      return answer;
    }, (err) => {
      console.log('  ✗ ' + how + '：requestTrackingAuthorization() 被拒了: ' +
                  (err instanceof Error ? err.message : String(err)));
      return undefined;
    });
  };

  panelRow(systemPanel(ctx), [
    ['申请跟踪授权', () => {
      const before = ATTrackingManager.trackingAuthorizationStatus;
      console.log('  ✓ 真实触摸：申请跟踪授权，申请前的状态 = ' + before +
                  (before === 'notDetermined' ? '（系统会弹出提示框）' : '（已经定了，不会再弹框）'));
      request('真实触摸');
    }],
    ['读广告标识', () => {
      console.log('  ✓ 真实触摸：trackingAuthorizationStatus = ' +
                  ATTrackingManager.trackingAuthorizationStatus + '，advertisingIdentifier = ' +
                  ASIdentifierManager.sharedManager().advertisingIdentifier);
    }],
  ]);
  console.log('  ✓ 面板里多了一排按钮：申请跟踪授权 / 读广告标识');

  if (status === 'notDetermined') {
    console.log('  ! 授权状态还没定，自动申请会弹出系统提示框，所以不跑；' +
                '「Promise 兑现成什么」这一组未验证，请点面板里的「申请跟踪授权」');
    return undefined;
  }
  return request('状态已定，不弹框');
}
