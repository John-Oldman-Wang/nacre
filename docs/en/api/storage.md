---
type: reference
native: NSUserDefaults
status: partial
---

# `application.storage`

**`application.storage`** represents the app's key-value storage. Each key is a string mapped to a value; values are saved on the device and can still be read after the app quits and launches again. It is used for user settings and small amounts of state, such as the theme, the last screen opened, or the launch count.

There is only one `application.storage` in the whole app, and it can be used at any time, including at the top level of a script. Its class is `NSUserDefaults`.

Reads and writes are synchronous: [`get()`](storage/get.md) returns the value directly, and when [`set()`](storage/set.md) returns, the new value is already in effect and can be read immediately.

Tokens and passwords do not go here; they go in [`application.keychain`](keychain.md). Files and large amounts of data go in [`application.fileSystem`](filesystem.md). For how to choose and how to use them, see the guide [Saving user settings](../guides/save-settings.md).

**Inheritance**: `EventTarget` → `NSObject` → `NSUserDefaults`

## Constructor

It cannot be created with `new`: `new NSUserDefaults()` throws `TypeError` with the message `Illegal constructor: NSUserDefaults is created by the runtime, not by new`. The only instance is obtained from the `storage` property of [`application`](application.md).

## Functions

The first parameter `key` of every function must be a string. Passing any other type throws `TypeError` with the message `<function name>: key must be a string`, such as `get: key must be a string`.

Reading, writing, and deleting:

| Function | Description |
| --- | --- |
| [`get()`](storage/get.md) | Reads a key and returns the stored value as is; returns `null` when there is none |
| [`set()`](storage/set.md) | Writes a key; a value of `null` deletes it |
| [`remove()`](storage/remove.md) | Deletes a key |
| [`has()`](storage/has.md) | Whether a value can be read for this key |
| [`registerDefaults()`](storage/registerdefaults.md) | Registers what keys that were never written read as |

Typed reads. These seven functions convert the value to the given type when reading; when it cannot be converted, they return a fixed value instead of throwing:

| Function | Description |
| --- | --- |
| [`stringForKey()`](storage/stringforkey.md) | Reads as a string |
| [`integerForKey()`](storage/integerforkey.md) | Reads as an integer; `0` when absent |
| [`doubleForKey()`](storage/doubleforkey.md) | Reads as a number; `0` when absent |
| [`boolForKey()`](storage/boolforkey.md) | Reads as a boolean; `false` when absent |
| [`arrayForKey()`](storage/arrayforkey.md) | Reads as an array |
| [`dictionaryForKey()`](storage/dictionaryforkey.md) | Reads as an object |
| [`stringArrayForKey()`](storage/stringarrayforkey.md) | Reads as an array of strings |

Listen for events with the inherited `addEventListener()` and `removeEventListener()`.

## Events

| Event | When it fires |
| --- | --- |
| [`change`](storage/change-event.md) | After any key in the storage is written or deleted. Both the app's own writes and the system's writes trigger it |

`change` is the only event `application.storage` fires. Listening for any other name does not throw: it is treated as a custom event and fires only when you dispatch it yourself with `dispatchEvent()`.

## Which values can be stored

| Can be stored | Cannot be stored |
| --- | --- |
| Strings | `undefined`, functions, Symbols |
| Finite numbers | `NaN`, `Infinity` |
| Booleans | `Date`, `Blob`, native objects (such as colors or views) |
| Arrays whose elements are also storable values | `null` inside an array or object |
| Plain objects whose property values are also storable values | Self-referencing structures |

Storing a value that cannot be stored makes [`set()`](storage/set.md) throw `TypeError` on the spot, and the key keeps its previous value.

A value reads back with the same type it was stored with: store a number and read a number, store a boolean and read a boolean, store an object and read an object. Arrays and objects read back as a copy; modifying the copy does not change the value in storage, and you must call `set()` again to save it. When an object has more than two properties, whether they read back in the order they were written is **not verified in the simulator**.

The runtime does not limit the size of a single value or the number of keys. The system's capacity limit for this storage is **not verified in the simulator**. The values here are not encrypted (from the iOS definition; **not verified in the simulator**).

## When data is saved and how long it is kept

When `set()` returns, the new value can be read right away. The system writes it to disk automatically afterward; the app does not need to, and cannot, trigger that itself.

| Situation | Is the data still there? |
| --- | --- |
| The app goes to the background and comes back | Yes |
| The app relaunches after its process ends | Yes. Verified in the acceptance tests with a launch counter: the second launch reads 2 |
| The app is force-quit right after `set()` | **Not verified in the simulator** |
| A system update | **Not verified in the simulator** |
| The user deletes the app | No. The data is deleted along with the app (from the iOS definition; **not verified in the simulator**) |
| Moving to a new phone and restoring from a backup | **Not verified in the simulator** |

## Examples

Storage involves no UI, so this code runs when written directly at the top level of `main.js`.

```js
const storage = application.storage;

// Register default values. They apply only to keys never written; register them on every launch
storage.registerDefaults({ theme: 'auto' });
console.log('Theme:', storage.get('theme'));

// Count launches. Without this key, integerForKey gives 0
const launches = storage.integerForKey('launchCount') + 1;
storage.set('launchCount', launches);
console.log('Launch number', launches);
```

**Result**

- On the first launch, the console prints `Theme: auto` and then `Launch number 1`.
- On the second launch, it prints `Theme: auto` and `Launch number 2`.

This code has not been run as a whole in the simulator. Every API it uses has been run in the acceptance tests.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[NSUserDefaults standardUserDefaults]` | `application.storage` |
| `[d objectForKey:@"k"]` | `storage.get('k')` |
| `[d setObject:v forKey:@"k"]` | `storage.set('k', v)` |
| `[d removeObjectForKey:@"k"]` | `storage.remove('k')` or `storage.set('k', null)` |
| `[d registerDefaults:@{…}]` | `storage.registerDefaults({…})` |
| `[d stringForKey:@"k"]` | `storage.stringForKey('k')` |
| `[d integerForKey:@"k"]` | `storage.integerForKey('k')` |
| `[d doubleForKey:@"k"]` | `storage.doubleForKey('k')` |
| `[d boolForKey:@"k"]` | `storage.boolForKey('k')` |
| `[d arrayForKey:@"k"]` | `storage.arrayForKey('k')` |
| `[d dictionaryForKey:@"k"]` | `storage.dictionaryForKey('k')` |
| `[d stringArrayForKey:@"k"]` | `storage.stringArrayForKey('k')` |
| `[d setInteger:n forKey:@"k"]` and the other typed writes | `storage.set('k', n)` |
| `NSUserDefaultsDidChangeNotification` | `storage.addEventListener('change', …)` |
| `[d synchronize]` | None. The system writes to disk automatically |

## See also

- [Saving user settings](../guides/save-settings.md): choosing among the three kinds of storage, registering defaults, storing objects and times, listening for changes
- [`application`](application.md): `storage` is one of its properties
- [Keychain](keychain.md): where tokens and passwords go
- [File system](filesystem.md): where files and large amounts of data go
