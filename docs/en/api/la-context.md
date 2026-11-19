---
type: reference
native: LAContext
status: partial
---

# `LAContext`

**`LAContext`** represents one authentication that confirms "the person holding the phone right now is its owner". The system performs the authentication: it shows its own UI, confirms identity with Face ID, Touch ID, or the device passcode, and hands the result to the app.

Face ID recognizes the owner's face with the front camera; Touch ID recognizes a fingerprint. Together they are called biometric authentication, and a device has only one of the two.

The app gets only two kinds of result: success, or failure along with the reason. The app cannot read the face, the fingerprint, or the passcode itself, and gets no credential it could send to a server for checking. So it is used for local confirmation inside the app: unlocking when the app opens, confirming before a payment, confirming before showing sensitive information.

> **Note:** `LAContext` is not in the core; it is available only after you install the `@nacrejs/local-authentication` package. Without it, there is no global `LAContext` class (`typeof LAContext` is `'undefined'`), and type checking also reports that it cannot be found. For how to install it, see "[Installation](#installation)" below.

Creation, the default values of properties and reading and writing them, the errors for invalid arguments, and the behavior after `invalidate()` are verified in the simulator acceptance tests. The parts involving the system UI and authentication results come from the iOS headers and are each marked "**not verified in the simulator**".

**Inheritance**: `EventTarget` → `NSObject` → `LAContext`. It cannot be subclassed; see [Native classes](native-classes.md).

For how to use it for a complete confirmation, see the guide [Confirming identity with Face ID](../guides/face-id.md).

## Installation

Step one: install the package in your project:

```bash
npm install @nacrejs/local-authentication
```

**Effect**: The next time `ios/` is generated, the project embeds one more framework, `NacreLocalAuthentication.framework`. Projects that do not install it do not have it in their build.

Step two: add a sentence to `nacre.config.json` telling the user why this app uses Face ID:

```json
{
  "name": "Shop",
  "bundleId": "com.example.shop",
  "ios": {
    "infoPlist": {
      "NSFaceIDUsageDescription": "Confirm payments with Face ID"
    }
  }
}
```

**Effect**: The first time the app authenticates with Face ID, the system shows an alert asking the user whether to allow it, and the alert shows this sentence (**not verified in the simulator**). If the package is installed but this entry is missing, generating `ios/` reports an error and stops:

```
nacre: @nacrejs/local-authentication needs NSFaceIDUsageDescription in Info.plist: a sentence shown to the user explaining why the app needs this permission. Put it in ios.infoPlist in nacre.config.json
```

The sentence can be written once per language; for how, see [Configuring the app](../guides/project-config.md#writing-usage-descriptions).

Step three: add a line at the top of the entry file to bring in the types:

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/local-authentication" />
```

**Effect**: The editor offers completion and checking for `LAContext`. Without this line, `tsc` reports `Cannot find name 'LAContext'`.

## Constructor

[`LAContext()`](la-context/constructor.md)

Creates a new authentication object. Use a new one for each authentication.

## Instance properties

Also inherits properties from `NSObject`.

| Property | Description |
| --- | --- |
| [`biometryType`](la-context/biometrytype.md) <small>read-only</small> | Which kind of biometric authentication the device supports |
| [`localizedFallbackTitle`](la-context/localizedfallbacktitle.md) | The title of the fallback button that appears after biometric authentication fails once |
| [`localizedCancelTitle`](la-context/localizedcanceltitle.md) | The title of the cancel button in the authentication UI |
| [`touchIDAuthenticationAllowableReuseDuration`](la-context/touchidauthenticationallowablereuseduration.md) | Within how many seconds of unlocking the screen with biometrics authentication succeeds right away |
| [`interactionNotAllowed`](la-context/interactionnotallowed.md) | Whether, when authentication needs to show UI, it shows nothing and fails right away |

## Instance methods

Also inherits methods from `NSObject`.

| Method | Description |
| --- | --- |
| [`canEvaluatePolicy()`](la-context/canevaluatepolicy.md) | Whether authentication with a policy is possible right now. Returns synchronously, shows no UI |
| [`canEvaluatePolicyError()`](la-context/canevaluatepolicyerror.md) | Why authentication with a policy is not possible. Returns synchronously, shows no UI |
| [`evaluatePolicy()`](la-context/evaluatepolicy.md) | Authenticates. The system shows the authentication UI; returns a Promise |
| [`invalidate()`](la-context/invalidate.md) | Invalidates this object and ends any authentication in progress |

## Events

`LAContext` has no events. The result of authentication comes from the Promise returned by [`evaluatePolicy()`](la-context/evaluatepolicy.md).

## How one authentication proceeds

1. Create an object with `new LAContext()`.
2. Call `evaluatePolicy(policy, { localizedReason })`. The system shows the authentication UI, and this method immediately returns a Promise.
3. If the user passes authentication, the Promise fulfills with `true`. If the user cancels, authentication fails, or the device cannot authenticate right now, the Promise rejects, and `err.name` says which.

While the authentication UI is shown, the app's code keeps running and timers keep firing.

Settings such as button titles belong to one object, and an object that has had `invalidate()` called cannot be used to authenticate again. Whether the system asks the user again when the same object authenticates again after succeeding is **not verified in the simulator**; with a new object each time, the user is always asked.

## Policies

A policy decides which ways the system may use to confirm identity. The first argument of [`canEvaluatePolicy()`](la-context/canevaluatepolicy.md), [`canEvaluatePolicyError()`](la-context/canevaluatepolicyerror.md), and [`evaluatePolicy()`](la-context/evaluatepolicy.md) is a policy, one of these two strings:

| Policy | How the system confirms | When authentication is not possible |
| --- | --- | --- |
| `'deviceOwnerAuthentication'` | Biometrics first; if the device does not support it, nothing is enrolled, it is locked out, or the user chooses to enter the passcode, falls back to the device passcode | The device has no passcode set |
| `'deviceOwnerAuthenticationWithBiometrics'` | Biometrics only | The device does not support biometrics, the user has not enrolled a face or fingerprint, too many failures caused a lockout, or the device has no passcode set |

For how to choose between the two policies, see [Confirming identity with Face ID](../guides/face-id.md#recommended-approach).

## The prompt on first use of Face ID

The first time the app authenticates with Face ID, the system first shows an alert asking the user whether to allow this app to use Face ID, showing the `NSFaceIDUsageDescription` sentence. If the user chooses not to allow it, this and later authentications reject with `BiometryNotAvailableError` until the user allows it again in the system Settings. Touch ID has no such step. This section comes from the iOS headers and is **not verified in the simulator**.

## Invalid arguments versus failed authentication

These are two kinds of error and behave differently:

| Situation | Behavior |
| --- | --- |
| Invalid arguments: an unrecognized policy, no `localizedReason`, or `localizedReason` is an empty string | `evaluatePolicy()` throws `TypeError` on the spot, returns no Promise, and the system UI does not appear |
| Failed authentication: the user canceled, was not recognized, or the device cannot authenticate right now | The returned Promise rejects with an `Error` carrying `name`, `code`, and `domain` |

The Promise never fulfills with `false`. Fulfilling means success.

## Reasons authentication failed

When the Promise from `evaluatePolicy()` rejects, it rejects with an `Error` that has three extra fields. `canEvaluatePolicyError()` returns the same kind of object. In the type definitions it is called `LAError`.

| Field | Type | Meaning |
| --- | --- | --- |
| `name` | String | The name of the reason, one of the twelve in the table below |
| `message` | String | Explanatory text from the system. Its language follows the languages the app declares; see [Configuring the app](../guides/project-config.md#declaring-the-languages-the-app-supports) |
| `code` | Number | The system's raw error code (`LAError`) |
| `domain` | String | The system's error domain, `'com.apple.LocalAuthentication'` |

Values of `name`. The "Meaning" column comes from the iOS headers; only `InvalidContextError` and `BiometryNotEnrolledError` have actually occurred in the simulator:

| `name` | `code` | Meaning | Typical handling |
| --- | --- | --- | --- |
| `'UserCancelError'` | -2 | The user tapped Cancel | Do nothing |
| `'UserFallbackError'` | -3 | The user tapped the fallback button | Show the app's own confirmation method |
| `'SystemCancelError'` | -4 | The system interrupted authentication, for example because the app went to the background | Do nothing; it can be started again when the user returns |
| `'AppCancelError'` | -9 | The app called `invalidate()` during authentication | Do nothing |
| `'AuthenticationFailedError'` | -1 | The user failed to pass authentication | Tell the user it did not pass |
| `'PasscodeNotSetError'` | -5 | The device has no passcode set | Tell the user to set one in the system Settings |
| `'BiometryNotAvailableError'` | -6 | Biometrics are unavailable: the device does not support them, or the user has not allowed this app to use Face ID | Use another confirmation method |
| `'BiometryNotEnrolledError'` | -7 | The device supports biometrics, but the user has not enrolled a face or fingerprint | Use another confirmation method, or tell the user to enroll |
| `'BiometryLockoutError'` | -8 | Too many biometric failures caused a lockout; the passcode must be entered once to recover | Authenticate again with `'deviceOwnerAuthentication'` |
| `'InvalidContextError'` | -10 | `invalidate()` has been called on this object | Create a new `LAContext` |
| `'NotInteractiveError'` | -1004 | UI needs to be shown, but `interactionNotAllowed` is `true` | See [`interactionNotAllowed`](la-context/interactionnotallowed.md) |
| `'LAError'` | Other | A reason not listed above | Look at `code` and `message` |

## Examples

### Confirming identity before a payment

The code below starts from a blank app and places a button and a line of text on the screen. Tapping the button makes the system confirm identity, and the result appears in that line of text.

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/local-authentication" />

application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const button = UIButton.buttonWithType('system');
  button.setTitle('Confirm payment', { forState: ['normal'] });
  button.frame = new CGRect(40, 120, 200, 44);
  page.view.addSubview(button);

  const status = new UILabel();
  status.text = 'Not confirmed yet';
  status.frame = new CGRect(40, 180, 300, 30);
  page.view.addSubview(status);

  button.addEventListener('click', async () => {
    const context = new LAContext();
    try {
      await context.evaluatePolicy('deviceOwnerAuthentication', {
        localizedReason: 'Confirm payment of $128.00',
      });
      status.text = 'Confirmed';
    } catch (err) {
      const failure = /** @type {LAError} */ (err);
      status.text = failure.name === 'UserCancelError'
        ? 'Canceled'
        : 'Did not pass: ' + failure.name;
    }
  });
});
```

**Effect** (this code has not been run in the simulator; the following is **not verified in the simulator**):

- A text button "Confirm payment" appears near the top left of the screen, with the line "Not confirmed yet" below it.
- Tapping the button shows the system authentication UI. On a device with Face ID, face recognition starts right away; if the face is not recognized or the device has no biometrics, the passcode entry screen appears, showing the sentence "Confirm payment of $128.00".
- If authentication succeeds, the line changes to "Confirmed".
- If the user taps Cancel, the line changes to "Canceled".
- If the device has no passcode set, the line changes to "Did not pass: PasscodeNotSetError", and no system UI appears.

### Checking whether biometrics can be used right now

```js
const context = new LAContext();
if (context.canEvaluatePolicy('deviceOwnerAuthenticationWithBiometrics')) {
  console.log(context.biometryType === 'faceID' ? 'Sign in with Face ID' : 'Sign in with Touch ID');
} else {
  console.log('Biometrics cannot be used right now');
}
```

**Effect**: When the device supports biometrics, the user has enrolled, and there is no lockout, prints `Sign in with Face ID` or `Sign in with Touch ID` depending on the device; otherwise prints `Biometrics cannot be used right now`. No system UI is shown.

For more patterns, see the guide [Confirming identity with Face ID](../guides/face-id.md).

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[LAContext alloc] init]` | `new LAContext()` |
| The return value of `[context canEvaluatePolicy:policy error:&error]` | `context.canEvaluatePolicy(policy)` |
| The `error` of `[context canEvaluatePolicy:policy error:&error]` | `context.canEvaluatePolicyError(policy)`: `null` when authentication is possible, otherwise that error |
| `[context evaluatePolicy:policy localizedReason:reason reply:^(BOOL success, NSError *error) { … }]` | `await context.evaluatePolicy(policy, { localizedReason: reason })` |
| `success == NO` and `error` in `reply` | The Promise rejects; `err.code` is `error.code`, `err.domain` is `error.domain`, and `err.message` is `error.localizedDescription` |
| `[context invalidate]` | `context.invalidate()` |
| `context.biometryType` | `context.biometryType` |
| `LABiometryTypeNone` / `TouchID` / `FaceID` / `OpticID` | `'none'` / `'touchID'` / `'faceID'` / `'opticID'` |
| `LAPolicyDeviceOwnerAuthenticationWithBiometrics` | `'deviceOwnerAuthenticationWithBiometrics'` |
| `LAPolicyDeviceOwnerAuthentication` | `'deviceOwnerAuthentication'` |
| `LAErrorUserCancel` and so on | `err.name === 'UserCancelError'` and so on: drop the `LAError` prefix and add an `Error` suffix |
| `context.localizedFallbackTitle`, `localizedCancelTitle`, `touchIDAuthenticationAllowableReuseDuration`, `interactionNotAllowed` | Properties of the same names |

## See also

- [Confirming identity with Face ID](../guides/face-id.md): the recommended approach, checking availability, handling each reason, falling back to the app's own password
- [Core and capability packages](capabilities.md): `@nacrejs/local-authentication` is a capability package; how capability packages are used
- [Configuring the app: name, languages, usage descriptions](../guides/project-config.md): where `NSFaceIDUsageDescription` goes and how to write it per language
- [Keychain](keychain.md): sign-in tokens are stored there. When identity must be confirmed before reading, call `evaluatePolicy()` first and then read
- [Native classes](native-classes.md): which classes can be created with `new`, and why they cannot be subclassed
- [Enums](enums.md): policies and `biometryType` are both strings; what is reported when they are invalid
