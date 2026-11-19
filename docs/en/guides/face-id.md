# Confirming identity with Face ID

This guide covers how to use [`LAContext`](../api/la-context.md) to have the system confirm that the person holding the phone is its owner: confirming before a payment, unlocking when the app opens, and confirming before showing sensitive information. The system confirms with Face ID, Touch ID, or the device passcode; the app only learns whether it passed. The details of each member are on the [`LAContext`](../api/la-context.md) reference page.

Before you start, install `@nacrejs/local-authentication` and write `NSFaceIDUsageDescription` in `nacre.config.json`; see [Installation](../api/la-context.md#installation).

The effects in this guide involving the system authentication interface and authentication results all come from iOS headers and are **not verified in the simulator**.

## Recommended approach

- **Use the `'deviceOwnerAuthentication'` policy.** When biometrics are unavailable, the user can still enter the device passcode and is not stuck at the authentication step.
- **Use `'deviceOwnerAuthenticationWithBiometrics'` only when the app has its own other way to confirm**, such as the app's sign-in password. In that case, set [`localizedFallbackTitle`](../api/la-context/localizedfallbacktitle.md) to the name of that way; when the user taps it, authentication ends with `UserFallbackError`, and the app shows its own password interface. See [Falling back to the app's own password when biometrics fail](#falling-back-to-the-apps-own-password-when-biometrics-fail).
- **Create a new `LAContext` for each authentication.** Settings such as button titles belong to one object, and an object on which `invalidate()` has been called cannot be used to authenticate again. With a new object each time, the user is always asked.
- **Ask whether biometrics are available right when you need them.** The user can add or remove a face in system settings at any time. Ask again after the app returns to the foreground.

## First example

Starting from a blank app, put a button and a line of text on screen. Tapping the button has the system confirm identity, and the result is shown in that line of text.

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/local-authentication" />

application.addEventListener('sceneconnect', (e) => {
  // Create the window and view controller. Every app needs these lines
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. A button, and a line of text showing the result
  const button = UIButton.buttonWithType('system');
  button.setTitle('Confirm Payment', { forState: ['normal'] });
  button.frame = new CGRect(40, 120, 200, 44);
  page.view.addSubview(button);

  const status = new UILabel();
  status.text = 'Not confirmed yet';
  status.frame = new CGRect(40, 180, 300, 30);
  page.view.addSubview(status);

  // 2. Authenticate on tap
  button.addEventListener('click', async () => {
    // Create a new object for each authentication
    const context = new LAContext();
    try {
      // 3. The system shows the authentication interface; only continues if it passes
      await context.evaluatePolicy('deviceOwnerAuthentication', {
        localizedReason: 'Confirm payment of $128.00',
      });
      status.text = 'Confirmed';
    } catch (err) {
      // 4. Did not pass: show the reason
      const failure = /** @type {LAError} */ (err);
      status.text = failure.name === 'UserCancelError'
        ? 'Canceled'
        : 'Did not pass: ' + failure.name;
    }
  });
});
```

**Effect** (this code has not been run in the simulator; the following is **not verified in the simulator**):

- A text button "Confirm Payment" appears near the top left of the screen, with a line of text "Not confirmed yet" below it.
- Tapping the button shows the system authentication interface. On a device with Face ID, face recognition starts right away; when it cannot recognize the face or the device has no biometrics, a passcode entry interface appears, showing the sentence "Confirm payment of $128.00".
- When authentication passes, the line of text becomes "Confirmed".
- When the user taps cancel, the line of text becomes "Canceled".
- When the device has no passcode set, the line of text becomes "Did not pass: PasscodeNotSetError", and the system interface does not appear.

Each of the examples below is written as its own function and creates its own `LAContext`.

## Checking whether biometrics can be used now

```js
function biometricLoginTitle() {
  const context = new LAContext();
  if (!context.canEvaluatePolicy('deviceOwnerAuthenticationWithBiometrics')) {
    return null;
  }
  return context.biometryType === 'faceID' ? 'Sign in with Face ID' : 'Sign in with Touch ID';
}

console.log(biometricLoginTitle() ?? 'Biometrics are not available now');
```

**Effect**: When the device supports biometrics, the user has enrolled, and it is not locked out, prints `Sign in with Face ID` or `Sign in with Touch ID` depending on the kind of device; otherwise prints `Biometrics are not available now`. No system interface is shown.

Use it to decide whether to show an option such as "Sign in with Face ID" in the interface.

## Knowing why it cannot be used

```js
function explainBiometry() {
  const context = new LAContext();
  const error = context.canEvaluatePolicyError('deviceOwnerAuthenticationWithBiometrics');
  if (error === null) {
    return 'Biometrics can be used';
  }
  switch (error.name) {
    case 'BiometryNotEnrolledError':
      return 'No face or fingerprint enrolled yet; enroll one in system settings';
    case 'BiometryLockoutError':
      return 'Biometrics are locked out; unlock the phone once with the passcode first';
    case 'BiometryNotAvailableError':
      return 'This device cannot use biometrics';
    default:
      return 'Biometrics are not available now: ' + error.name;
  }
}

console.log(explainBiometry());
```

**Effect**: Prints one line saying whether biometrics can be used now, and if not, for which reason. No system interface is shown. In a simulator with no face enrolled, prints `No face or fingerprint enrolled yet; enroll one in system settings`; the other lines are **not verified in the simulator**.

[`canEvaluatePolicyError()`](../api/la-context/canevaluatepolicyerror.md) does not throw and returns `null` when authentication is possible, so check for `null` before using it.

## Handling each reason for not passing

```js
async function showCardNumber() {
  const context = new LAContext();
  try {
    await context.evaluatePolicy('deviceOwnerAuthentication', {
      localizedReason: 'View your card number',
    });
    console.log('Passed');
  } catch (err) {
    const failure = /** @type {LAError} */ (err);
    switch (failure.name) {
      case 'UserCancelError':
      case 'SystemCancelError':
      case 'AppCancelError':
        console.log('Canceled; do nothing');
        break;
      case 'PasscodeNotSetError':
        console.log('Set a device passcode in system settings first');
        break;
      default:
        console.log('Did not pass: ' + failure.name + ', ' + failure.message);
    }
  }
}
```

**Effect**: When it passes, prints `Passed`. When the user taps cancel, or the app going into the background interrupts authentication, prints `Canceled; do nothing`. When the device has no passcode set, prints a hint. In other cases, prints the reason's name and the description the system gives. For all the reasons, see [Reasons authentication did not pass](../api/la-context.md#reasons-authentication-failed).

## Falling back to the app's own password when biometrics fail

```js
async function logIn() {
  const context = new LAContext();
  context.localizedFallbackTitle = 'Enter Password';
  try {
    await context.evaluatePolicy('deviceOwnerAuthenticationWithBiometrics', {
      localizedReason: 'Sign in to the shop',
    });
    console.log('Passed');
  } catch (err) {
    const failure = /** @type {LAError} */ (err);
    if (failure.name === 'UserFallbackError') {
      console.log("Show the app's own password interface");
    }
  }
}
```

**Effect** (**not verified in the simulator**): After biometrics fail once, a button titled "Enter Password" appears in the authentication interface. When the user taps it, the authentication interface closes, the Promise rejects with `UserFallbackError`, and the console prints `Show the app's own password interface`.

## Hiding the fallback button

```js
function contextWithoutFallback() {
  const context = new LAContext();
  context.localizedFallbackTitle = '';
  return context;
}
```

**Effect** (**not verified in the simulator**): When authenticating with this object, after biometrics fail, the authentication interface has only a cancel button and no fallback button.

## Changing the cancel button's title

```js
function contextWithCancelTitle() {
  const context = new LAContext();
  context.localizedCancelTitle = 'Not Now';
  return context;
}
```

**Effect** (**not verified in the simulator**): When authenticating with this object, the cancel button in the authentication interface is titled "Not Now".

## Not asking again right after the screen was unlocked with Face ID

```js
async function openShop() {
  const context = new LAContext();
  context.touchIDAuthenticationAllowableReuseDuration = 10;
  await context.evaluatePolicy('deviceOwnerAuthenticationWithBiometrics', {
    localizedReason: 'Open the shop',
  });
}
```

**Effect** (**not verified in the simulator**): When the user unlocked the screen with Face ID or Touch ID within the last 10 seconds, authentication passes directly without showing the authentication interface; after more than 10 seconds, it is shown as usual.

It only counts the biometric authentication that unlocked the screen, not earlier authentications in this app or other apps. The system counts at most 300 seconds.

## Canceling an authentication in progress

```js
async function confirmWithTimeout() {
  const context = new LAContext();
  const pending = context.evaluatePolicy('deviceOwnerAuthentication', {
    localizedReason: 'Confirm payment',
  });
  // The order timed out, so confirmation is no longer needed
  setTimeout(() => { context.invalidate(); }, 30000);
  try {
    await pending;
  } catch (err) {
    const failure = /** @type {LAError} */ (err);
    console.log(failure.name);
  }
}
```

**Effect** (**not verified in the simulator**): When the user has not completed authentication within 30 seconds, the authentication interface closes, and the console prints `AppCancelError`.

## See also

- [`LAContext`](../api/la-context.md): all properties and methods, and the reasons for not passing
- [Configuring an app](project-config.md#writing-usage-descriptions): how to write `NSFaceIDUsageDescription`
- [Keychain](../api/keychain.md): where sign-in tokens are stored. Call `evaluatePolicy()` before reading
