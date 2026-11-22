// @nacrejs/local-authentication 的类型定义：面容 ID / 触控 ID 认证。
//
// 装了这个包才有 LAContext：没装的时候全局没有这个类，这里的类型也不存在，
// 写了 tsc 会报，和运行时的事实对得上。
//
// 用的时候在入口文件顶上加一行：
//
//     /// <reference types="@nacrejs/local-authentication" />
//
// 这里用到的 NSObject 是 @nacrejs/types 声明的全局类型。这个文件不自己去引它，
// 原因见 @nacrejs/keychain 的 README（包是链接进来的时候 TypeScript 找不到）。
// 两个包的关系写在 peerDependencies 里。

/**
 * 认证策略：允许用什么方式证明「是机主本人」。
 *
 * 配套设备（手表）的两种策略没有暴露。
 */
type LAPolicy =
  /** 只认生物认证（面容 ID 或触控 ID）。没录入、被锁定、设备不支持时认证不了。 */
  | 'deviceOwnerAuthenticationWithBiometrics'
  /** 生物认证，不行就输设备密码。设备连密码都没设时认证不了。 */
  | 'deviceOwnerAuthentication';

/** 设备支持哪一种生物认证。`'opticID'` 只出现在 Apple Vision Pro 上。 */
type LABiometryType = 'none' | 'touchID' | 'faceID' | 'opticID';

interface LAEvaluatePolicyOptions {
  /**
   * 为什么要认证，一句给用户看的话。必填，不能是空串。
   *
   * 触控 ID 和输密码的界面会显示它；面容 ID 的界面一般不显示。
   */
  localizedReason: string;
}

/**
 * 认证没通过时 `evaluatePolicy()` 拒绝的 `Error`；`canEvaluatePolicyError()`
 * 返回的也是它。
 *
 * 是 `NSError`：`name` 说是哪一种；`code` 是系统的 `LAError` 原值，`domain` 是
 * `'com.apple.LocalAuthentication'`。
 */
interface LAError extends NSError {
  readonly name:
    /** 用户没能通过认证（比如几次都没认出来）。 */
    | 'AuthenticationFailedError'
    /** 用户点了取消。 */
    | 'UserCancelError'
    /** 用户点了备用按钮（`localizedFallbackTitle` 那个）。 */
    | 'UserFallbackError'
    /** 系统中断了认证（比如 App 退到了后台）。 */
    | 'SystemCancelError'
    /** 设备没有设密码。 */
    | 'PasscodeNotSetError'
    /** 生物认证不可用：设备不支持，或者用户没有允许这个 App 用面容 ID。 */
    | 'BiometryNotAvailableError'
    /** 设备支持生物认证，但用户没有录入面容或指纹。 */
    | 'BiometryNotEnrolledError'
    /** 失败次数太多，生物认证被锁定，要先输一次设备密码。 */
    | 'BiometryLockoutError'
    /** App 自己取消的：认证进行中调了 `invalidate()`。 */
    | 'AppCancelError'
    /** 这个 `LAContext` 已经 `invalidate()` 过了。 */
    | 'InvalidContextError'
    /** 需要出界面，而 `interactionNotAllowed` 是 `true`。 */
    | 'NotInteractiveError'
    /** 上面没列到的。看 `code`。 */
    | 'NSError';
}

/**
 * 一次认证的上下文。每次认证 `new` 一个，认证界面上的按钮标题这些设置
 * 都只属于这一个对象。
 */
declare class LAContext extends NSObject {
  constructor();

  /** 设备支持哪一种生物认证。现在能不能用，问 `canEvaluatePolicy()`。 */
  readonly biometryType: LABiometryType;

  /**
   * 现在能不能用这种策略认证。同步返回，不出任何界面。
   *
   * 返回 `false` 时，原因问 `canEvaluatePolicyError()`。
   */
  canEvaluatePolicy(policy: LAPolicy): boolean;

  /**
   * 为什么不能用这种策略认证。同步返回，不出任何界面。
   *
   * 能认证时是 `null`。不能时**返回**一个 {@link LAError}（不是抛出来），
   * 常见的四种 `name`：`'BiometryNotAvailableError'`（设备不支持，或者用户没
   * 允许这个 App 用面容 ID）、`'BiometryNotEnrolledError'`（没录入）、
   * `'BiometryLockoutError'`（被锁定）、`'PasscodeNotSetError'`（没设密码）。
   *
   * 策略写错是抛 `TypeError`。
   */
  canEvaluatePolicyError(policy: LAPolicy): LAError | null;

  /**
   * 认证。系统出认证界面，用户通过后兑现 `true`；没通过时拒绝，拒绝的是
   * {@link LAError}，不会兑现成 `false`。
   *
   * 参数写错（策略不认识、没给 `localizedReason`）是同步抛 `TypeError`，
   * 不是拒绝。
   */
  evaluatePolicy(policy: LAPolicy, options: LAEvaluatePolicyOptions): Promise<true>;

  /**
   * 作废这个对象。正在进行的认证以 `AppCancelError` 结束；之后再用它认证，
   * 以 `InvalidContextError` 拒绝。
   */
  invalidate(): void;

  /**
   * 认证失败一次之后出现的备用按钮的标题。`null` 用系统默认的标题，
   * 空串隐藏这个按钮。默认 `null`。
   */
  localizedFallbackTitle: string | null;

  /** 取消按钮的标题。`null` 或空串用系统默认的。默认 `null`。 */
  localizedCancelTitle: string | null;

  /**
   * 单位是秒。用户在这么多秒之内用生物认证解锁过屏幕，认证直接通过、不再问。
   * 默认 0（不复用）。系统最多认 300 秒，写更大的值不会更久。不能是负数。
   */
  touchIDAuthenticationAllowableReuseDuration: number;

  /**
   * `true` 时，认证需要出界面就不出，改成以 `NotInteractiveError` 拒绝。
   * 默认 `false`。
   */
  interactionNotAllowed: boolean;
}
