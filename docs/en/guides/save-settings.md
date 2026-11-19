# Saving user settings

This guide shows how to use [`application.storage`](../api/storage.md) to save user settings and small amounts of state: registering defaults, storing objects and times, and observing changes. The details of each function are on the [`application.storage`](../api/storage.md) reference page.

## Choosing among the three kinds of storage

The runtime provides three ways to save data. The difference is what data goes where:

| Data to save | Which one | Why |
| --- | --- | --- |
| User settings, toggles, where the user left off, launch count | [`application.storage`](../api/storage.md) | Synchronous reads and writes; values can be numbers, booleans, arrays, or objects directly |
| Login tokens, passwords, keys | [`application.keychain`](../api/keychain.md) (install `@nacrejs/keychain` first) | Stored encrypted by the system, and you can control whether it can be read while the device is locked |
| Downloaded files, image caches, large amounts of business data, binary content | [`application.fileSystem`](../api/filesystem.md) | Saved as files, and you can choose a cache directory the system may clean up or a directory it won't |

Don't put tokens and passwords in `application.storage`. Values there aren't encrypted (this comes from iOS's definition and is **not verified in the simulator**).

## Recommended approach

- **Register defaults at launch, then only use `get()`.** That way code that reads settings doesn't have to write "if missing, use this value" everywhere, and each default appears in only one place.
- **Store a group of settings that are always read and written together as one object.** `set('profile', { name, age })` writes once and fires one `change` event. Settings that are independent of each other each get their own key, so changing one doesn't require reading and rewriting the whole object.
- **Store times as millisecond timestamps.** A `Date` object can't be stored; store the number from `Date.now()`, and restore it with `new Date(n)` after reading.
- **Use `get()` to test truthiness, not `boolForKey()`.** [`boolForKey()`](../api/storage/boolforkey.md) treats only a few forms as true; the string `'42'` gives `false`.
- **Compare old and new values in the `change` callback.** The event doesn't carry the key name, and writes by the system also trigger it. In the callback, read the keys you care about, compare them with the previous values, and update the UI only if they changed.

## First example

The code below registers defaults, reads and writes a setting, counts launches, and observes storage changes. Storage doesn't involve UI, so this code runs when written directly at the top level of `main.js`.

```js
const storage = application.storage;

// 1. Register defaults. They apply only to keys never written; register them on every launch
storage.registerDefaults({ theme: 'auto', pageSize: 20 });

// 2. Read a setting. If never written, it reads the registered default
console.log('Theme:', storage.get('theme'));

// 3. Count launches. integerForKey gives 0 when the key doesn't exist
const launches = storage.integerForKey('launchCount') + 1;
storage.set('launchCount', launches);
console.log('Launch number', launches);

// 4. Observe changes. The event doesn't carry the key name; read it yourself in the callback
let lastTheme = storage.get('theme');
storage.addEventListener('change', () => {
  const theme = storage.get('theme');
  if (theme !== lastTheme) {
    lastTheme = theme;
    console.log('Theme changed to:', theme);
  }
});

// 5. Change a setting
storage.set('theme', 'dark');
```

**Result**

- On the first launch, the console logs `Theme: auto`, `Launch number 1`, and `Theme changed to: dark`, in that order.
- On the second launch, it logs `Theme: dark` and `Launch number 2`. The theme doesn't change again, so the third line isn't logged.

This code has not been run as a whole in the simulator. Every API it uses has been run in the acceptance tests.

The following sections all reuse `storage` from above.

## Registering defaults for settings

```js
storage.registerDefaults({ theme: 'auto', pageSize: 20 });
console.log(storage.get('theme'));

storage.set('theme', 'dark');
console.log(storage.get('theme'));

storage.remove('theme');
console.log(storage.get('theme'));
```

**Result**: logs `auto`, `dark`, `auto` in order. After the written value is removed, the registered default is read again.

Registered values aren't written to disk, so register them once on every launch. For a key with a registered default, `has()` gives `true` even if it was never written.

## Reading a key that doesn't exist

`get()` on a key that was never written gives `null` without throwing. `has()` gives `false`.

`integerForKey()` and `boolForKey()` return `0` and `false` when the key doesn't exist, not `null`. To tell "no such key" apart from "the value is 0", use `has()` or `get()`.

## Saving objects and arrays

```js
storage.set('recent', ['AAPL', 'TSLA']);
storage.set('profile', { name: 'Alex', level: 3, tags: ['vip'] });

const profile = storage.dictionaryForKey('profile');
if (profile) {
  console.log(profile.name, profile.level);
}
```

**Result**: logs `Alex 3`.

Modifying the `profile` that was read doesn't save anything. To save a change, `set()` the modified object again.

## Removing a key

```js
storage.set('draft', 'Half-written content');
storage.remove('draft');
console.log(storage.get('draft'), storage.has('draft'));
```

**Result**: logs `null false`.

`storage.set('draft', null)` has the same effect. Removing a key that doesn't exist doesn't throw.

## Saving a time

```js
storage.set('lastSync', Date.now());

const stamp = storage.get('lastSync');
if (typeof stamp === 'number') {
  console.log('Last sync:', new Date(stamp).toISOString());
}
```

**Result**: logs the time of the last sync, such as `Last sync: 2026-11-14T08:00:00.000Z`.

## Updating the UI when storage changes

```js
const onChange = () => {
  console.log('Storage changed, current theme:', storage.get('theme'));
};
storage.addEventListener('change', onChange);

storage.set('theme', 'light');
console.log('set returned');
```

**Result**: logs `set returned` first, then `Storage changed, current theme: light`. The callback runs only after the current piece of code finishes.

When you no longer need it, remove it with `storage.removeEventListener('change', onChange)`; later writes no longer call this callback.

The `change` event doesn't carry the key name. Both the App's own writes and the system's writes trigger it, once per write. For details, see [`change`](../api/storage/change-event.md).

## See also

- [`application.storage`](../api/storage.md): all functions and events
- [Keychain](../api/keychain.md): where tokens and passwords go
- [File system](../api/filesystem.md): where files and large amounts of data go
