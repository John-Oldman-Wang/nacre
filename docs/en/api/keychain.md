---
type: reference
native: Keychain
status: partial
---

# `application.keychain`

**`application.keychain`** represents the app's items in the keychain. The keychain is encrypted storage provided by iOS, designed for small secrets such as passwords, sign-in tokens, and keys. The system encrypts the data before storing it, and each app can only read and write its own items.

Each item has a key and a value. The key is a non-empty string. The value is a string or a sequence of bytes; it can't directly be a number, array, or object.

There is only one `application.keychain` in the whole app, and it can be used at any time, including at the top level of a script. Its class is `Keychain`. All functions return a Promise. Reads and writes happen in the background; meanwhile the interface stays responsive and timers keep running.

Settings and app data don't belong here: settings go in [`application.storage`](storage.md), and files and large amounts of data go in [`application.fileSystem`](filesystem.md). For how to save and retrieve sign-in tokens, see the guide [Saving login tokens](../guides/save-secrets.md).

> **Note:** The keychain isn't in the core; it is available only after installing the `@nacrejs/keychain` package. Without it, the `application.keychain` property doesn't exist (`'keychain' in application` is `false`), and type checking reports that it doesn't exist. For how to install it, see [Installation](#installation) below.

**Inheritance**: `Keychain` does not inherit from any class.

## Installation

The keychain is a separate capability package. Install it in your project:

```bash
npm install @nacrejs/keychain
```

**Effect**: The next time `ios/` is generated, the project embeds an extra `NacreKeychain.framework`; projects that don't install it have no such framework in their output.

This package doesn't require any usage description in `nacre.config.json`.

Then add a line at the top of your entry file to bring in the types:

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/keychain" />
```

**Effect**: `application.keychain` gets completion and checking in the editor. Without this line, `tsc` reports `Property 'keychain' does not exist on type 'Application'`.

For how to install other capability packages, see [Core and capability packages](capabilities.md).

## Constructor

It can't be created with `new`: `new Keychain()` throws `TypeError` with the message `Illegal constructor: Keychain is created by the runtime, not by new`. The only instance is obtained from the `keychain` property of [`application`](application.md).

## Functions

All functions return a Promise. When an argument has the wrong type, `TypeError` is thrown immediately rather than returning a Promise. When the key isn't a string or is an empty string, the message is `<function name>: key must be a non-empty string`, such as `get: key must be a non-empty string`.

| Function | Description |
| --- | --- |
| [`get()`](keychain/get.md) | Reads a string value. Gives `null` when the key doesn't exist |
| [`getBytes()`](keychain/getbytes.md) | Reads a byte value as an `ArrayBuffer`. Gives `null` when the key doesn't exist |
| [`set()`](keychain/set.md) | Writes a string. Overwrites the value when the key already exists |
| [`setBytes()`](keychain/setbytes.md) | Writes the bytes in a `Blob`. Overwrites the value when the key already exists |
| [`remove()`](keychain/remove.md) | Deletes a key. Completes as usual when the key doesn't exist |
| [`has()`](keychain/has.md) | Whether the key exists |
| [`keys()`](keychain/keys.md) | All keys the app has stored |
| [`clear()`](keychain/clear.md) | Deletes all of the app's items |

## Events

There are no events. Only the app's own code can change these items, and when a write's Promise fulfills, the change is done.

## Access levels

When writing, you can give an item an access level with the `accessible` option. The access level decides two things: in what device state the item can be read, and whether the item survives when the user moves to a new phone and restores from a backup.

| `accessible` value | When it can be read | After moving to a new phone |
| --- | --- | --- |
| `'whenUnlockedThisDeviceOnly'` (default) | While the device is unlocked | Gone |
| `'whenUnlocked'` | While the device is unlocked | Kept |
| `'afterFirstUnlockThisDeviceOnly'` | After the user unlocks once following a restart, readable from then on, including while locked | Gone |
| `'afterFirstUnlock'` | Same as above | Kept |
| `'whenPasscodeSetThisDeviceOnly'` | While the device is unlocked. Requires a device passcode; writing fails when none is set | Gone |

All five values can be written and read back in the simulator. The "When it can be read" and "After moving to a new phone" columns come from the iOS definitions and are **not verified in the simulator**: verifying them requires locking a real device and switching devices.

- **Without `accessible`, it is `'whenUnlockedThisDeviceOnly'`.** After the user moves to a new phone, the item can't be read, and the app has to have the user sign in again.
- **The access level is fixed when an item is first written and can't be changed afterward.** Calling `set` again on an existing key with a different `accessible` updates the value but keeps the access level, without an error (derived from reading the code; **not verified in the simulator**). To change the access level, `remove` first, then `set`.
- **Reading an item that requires unlocking while the device is locked** rejects the Promise with `name` `'NotAllowedError'` (from the mapping in the code; **not verified in the simulator**).

## How long data is kept

| Situation | Is the data still there? |
| --- | --- |
| The app process ends and the app restarts | Yes. In acceptance testing, a counter stored on the first run was read on the second launch |
| Device restart, system update | **Not verified in the simulator** |
| The user deletes and reinstalls the app | **Not verified in the simulator**. Don't rely on it still being there, and don't assume it has been deleted |
| Moving to a new phone and restoring from a backup | Depends on the [access level](#access-levels) |

The size limit for a single keychain value is **not verified in the simulator**.

## Order of multiple operations

Keychain operations run one after another in call order. Calling `set` twice on the same key in a row without waiting leaves the value from the later call (derived from reading the code; **not verified in the simulator**).

## What you get on error

When an operation fails, the Promise rejects with a [`DOMException`](dom-exception.md) (called `KeychainError` in the type definitions). An argument of the wrong type throws `TypeError` on the spot; see each method's page.

| Property | Type | Meaning |
| --- | --- | --- |
| `name` | `string` | The error category; values in the table below. Use it to tell what went wrong |
| `message` | `string` | A description |
| `code` | `number` | The legacy web numeric code for `name`; see [`DOMException`](dom-exception.md#names-the-runtime-gives) |
| `cause` | [`NSError`](ns-error.md) or `undefined` | The system's original error: `cause.domain` is `'NSOSStatusErrorDomain'`, and `cause.code` is the system's error code (`OSStatus`). There is no `cause` when the `accessible` value isn't recognized (from the code; **not verified on a device**) |

| `name` | When |
| --- | --- |
| `'NotAllowedError'` | Reading or writing an item that requires unlocking while the device is locked; authentication failed |
| `'SecurityError'` | The app lacks the entitlement needed to access the keychain |
| `'TypeMismatchError'` | Invalid arguments, including an unrecognized `accessible` value |
| `'InvalidModificationError'` | An item conflict |
| `'OperationError'` | None of the above. Use `cause.code` to tell them apart |

Only the row "an unrecognized `accessible` value gives `'TypeMismatchError'`" has been verified in the simulator; the other rows come from the mapping in the code and are **not verified in the simulator**.

## Examples

The code below saves a sign-in token, reads it back, then deletes it. The keychain involves no interface, so this code runs directly at the top level of `main.js`.

```js
const kc = application.keychain;

async function main() {
  const saved = await kc.get('token');
  console.log('Existing token:', saved);

  await kc.set('token', 'abc-123');
  console.log('Read:', await kc.get('token'));

  await kc.remove('token');
  console.log('After removal:', await kc.has('token'));
}

main().catch((err) => {
  console.log('Error:', String(err));
});
```

**Result**

- The console prints `Existing token: null`.
- Then it prints `Read: abc-123`.
- Finally it prints `After removal: false`.

This code hasn't been run as a whole in the simulator. Every API it uses has been run in the acceptance tests.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `SecItemCopyMatching` with `kSecReturnData` | `await kc.get(key)`, `await kc.getBytes(key)` |
| `SecItemUpdate`, or `SecItemAdd` when the item doesn't exist | `await kc.set(key, value)`, `await kc.setBytes(key, blob)` |
| `SecItemDelete` | `await kc.remove(key)` |
| `SecItemCopyMatching` with `kSecMatchLimitAll` and `kSecReturnAttributes` | `await kc.keys()` |
| `kSecAttrAccessibleWhenUnlocked` | `{ accessible: 'whenUnlocked' }` |
| `kSecAttrAccessibleWhenUnlockedThisDeviceOnly` | `{ accessible: 'whenUnlockedThisDeviceOnly' }` |
| `kSecAttrAccessibleAfterFirstUnlock` | `{ accessible: 'afterFirstUnlock' }` |
| `kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly` | `{ accessible: 'afterFirstUnlockThisDeviceOnly' }` |
| `kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly` | `{ accessible: 'whenPasscodeSetThisDeviceOnly' }` |
| `kSecAttrAccessibleAlways`, `kSecAttrAccessibleAlwaysThisDeviceOnly` | None. Deprecated since iOS 12 |
| `kSecAttrService` of `kSecClassGenericPassword` | Fixed to the app's bundle identifier |
| `kSecAttrAccount` | `key` |
| `OSStatus` | The Promise rejects with a `DOMException`; `err.cause.code` is the raw value |

## See also

- [Saving login tokens](../guides/save-secrets.md): which storage to choose, which access level to choose, signing out
- [`application`](application.md): `keychain` is its property
- [`application.storage`](storage.md): where settings and small amounts of state go
- [`application.fileSystem`](filesystem.md): where files and large amounts of data go
- [`crypto`](crypto.md): generating random keys
- [Core and capability packages](capabilities.md)
