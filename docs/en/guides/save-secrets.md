# Saving login tokens

This guide shows how to use [`application.keychain`](../api/keychain.md) to save login tokens, passwords, and keys: which kind of storage to choose, which accessibility level to choose, reading them at launch, and removing them at sign-out. The details of each function are on the [`application.keychain`](../api/keychain.md) reference page.

`application.keychain` is available only after installing `@nacrejs/keychain`; see [Installation](../api/keychain.md#installation).

## Recommended approach

**Choose among the three kinds of storage by data:**

| Data to save | Use | Why |
| --- | --- | --- |
| User settings, toggles, where the user left off | [`application.storage`](../api/storage.md) | Synchronous reads and writes; values can be numbers, booleans, arrays, or objects directly |
| Login tokens, passwords, keys | `application.keychain` | Stored encrypted by the system; you can decide whether it is readable while the device is locked and whether it survives a move to a new phone |
| Downloaded files, image caches, large amounts of app data | [`application.fileSystem`](../api/filesystem.md) | Stored as files, in a directory you choose |

Put only small data that must stay secret in the keychain. Settings and app data belong in the other two: they can be read synchronously or managed as files, and the keychain cannot.

**Use the default accessibility level for login tokens.** The default, `'whenUnlockedThisDeviceOnly'`, is readable only while the device is unlocked and is not carried to other devices through backups. The cost is that users must sign in again after switching phones.

**Use `'afterFirstUnlockThisDeviceOnly'` for tokens the app must read in the background.** For example, when refreshing data in the background after a push notification arrives, the device may be locked. The default level cannot be read while the screen is locked.

**Use `'whenUnlocked'` or `'afterFirstUnlock'` when users should stay signed in after switching phones.** The cost is that the token goes into the device's backups and appears on any device restored from such a backup.

**Decide the accessibility level before the first write.** Changing it later requires removing the item and writing it again. For the effect of each value, see [Accessibility levels](../api/keychain.md#access-levels).

**Convert structured data to JSON text before storing it.** Values can only be strings or bytes.

**Remove tokens at sign-out.** Use [`remove()`](../api/keychain/remove.md) to remove one, or [`clear()`](../api/keychain/clear.md) to remove all of the app's items.

## First example

The code below saves a login token, reads it back, and removes it. The keychain involves no UI, so this code runs as-is at the top level of `main.js`.

```js
/// <reference types="@nacrejs/keychain" />
const kc = application.keychain;

async function main() {
  // 1. Read the token. null if there is none
  const saved = await kc.get('token');
  console.log('Existing token:', saved);

  // 2. Save the token. Without accessible, the default accessibility level is used
  await kc.set('token', 'abc-123');

  // 3. Read it back
  console.log('Read:', await kc.get('token'));

  // 4. Remove it at sign-out
  await kc.remove('token');
  console.log('After removal:', await kc.has('token'));
}

main().catch((err) => {
  console.log('Error:', String(err));
});
```

**Result**

- The console logs `Existing token: null`.
- Then it logs `Read: abc-123`.
- Finally it logs `After removal: false`.

This code has not been run as a whole in the simulator. Each API it uses has been run in the acceptance tests.

The following sections reuse `kc` from here, and the code goes inside `async` functions.

## Reading the token at launch

```js
async function restoreLogin() {
  const token = await kc.get('token');
  if (token === null) {
    console.log('Not signed in');
  } else {
    console.log('Signed in, token:', token);
  }
}
```

**Result**: if `token` was saved earlier, logs `Signed in, token: …`. It is still readable after the app process ends and the app relaunches.

## Tokens that must be readable in the background

```js
async function saveRefreshToken() {
  await kc.set('refreshToken', 'r-456', { accessible: 'afterFirstUnlockThisDeviceOnly' });
}
```

**Result**: the item is saved. Once the user has unlocked the device after it starts up, it remains readable even while the screen is locked (**not verified in the simulator**).

## Changing an item's accessibility level

```js
async function changeAccessible() {
  const current = await kc.get('refreshToken');
  if (current !== null) {
    await kc.remove('refreshToken');
    await kc.set('refreshToken', current, { accessible: 'afterFirstUnlock' });
  }
}
```

**Result**: the item is removed and rewritten with the new accessibility level; the value is unchanged.

## Saving a group of data

```js
async function saveAccount() {
  const account = { userId: 42, token: 'abc-123', expires: 1800000000000 };
  await kc.set('account', JSON.stringify(account));

  const text = await kc.get('account');
  if (text !== null) {
    /** @type {{ userId: number, token: string, expires: number }} */
    const restored = JSON.parse(text);
    console.log(restored.userId, restored.token);
  }
}
```

**Result**: logs `42 abc-123`.

## Saving a binary key

The second argument of [`setBytes()`](../api/keychain/setbytes.md) is a `Blob`. [`getBytes()`](../api/keychain/getbytes.md) returns an `ArrayBuffer`, or `null` when the key does not exist.

```js
async function saveSecret() {
  const secret = crypto.getRandomValues(new Uint8Array(32));
  await kc.setBytes('secret', new Blob([secret]));

  const buffer = await kc.getBytes('secret');
  if (buffer !== null) {
    console.log(new Uint8Array(buffer).length);
  }
}
```

**Result**: logs `32`. The bytes read back are the same as those written.

Read items stored with `setBytes` using `getBytes`. If you read one with `get` and its bytes are not valid UTF-8 text, you get `null`, which is indistinguishable from "no such key" (determined by reading the code; **not verified in the simulator**).

## Clearing everything at sign-out

```js
async function logoutAll() {
  console.log((await kc.keys()).join(','));
  await kc.clear();
  console.log((await kc.keys()).length);
}
```

**Result**: first logs every key the app has stored, separated by commas. After clearing, logs `0`.

`keys()` and `clear()` affect only this app's own items.

## Handling write failures

```js
async function savePin() {
  try {
    await kc.set('pin', '1234', { accessible: 'whenPasscodeSetThisDeviceOnly' });
  } catch (err) {
    const e = /** @type {KeychainError} */ (err);
    console.log('Write failed:', e.name, e.cause?.code);
  }
}
```

**Result**: if the device has a passcode set, the write succeeds and nothing is logged. If not, the promise is rejected and the error's category and the system's error code are logged (**not verified in the simulator**: on the simulator used for acceptance, writes at this level succeed). For what each `name` means, see [What you get on error](../api/keychain.md#what-you-get-on-error).

## See also

- [`application.keychain`](../api/keychain.md)
- [`application.storage`](../api/storage.md), [`application.fileSystem`](../api/filesystem.md)
- [`crypto`](../api/crypto.md)
