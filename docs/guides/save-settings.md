# 保存用户设置

这一篇讲怎么用 [`application.storage`](../api/storage.md) 保存用户设置和少量状态：登记默认值、存对象和时间、监听变化。每个函数的细节在 [`application.storage`](../api/storage.md) 的参考页。

## 三种存储怎么选

运行时提供三种保存数据的方式，区别在于放什么数据：

| 要保存的数据 | 用哪个 | 原因 |
| --- | --- | --- |
| 用户设置、开关、上次看到哪、启动次数 | [`application.storage`](../api/storage.md) | 同步读写，值可以直接是数字、布尔、数组、对象 |
| 登录令牌、密码、密钥 | [`application.keychain`](../api/keychain.md)（要先装 `@nacrejs/keychain`） | 由系统加密保存，可以规定设备锁定时能否读取 |
| 下载的文件、图片缓存、大量的业务数据、二进制内容 | [`application.fileSystem`](../api/filesystem.md) | 按文件保存，可以选择放进会被系统清理的缓存目录或不会被清理的目录 |

令牌和密码不要放在 `application.storage` 里。这里的值不加密（来自 iOS 的定义，**未在模拟器验证**）。

## 推荐的做法

- **启动时先登记默认值，之后只用 `get()`。** 这样读设置的代码不用到处写「没有就用某个值」，默认值只出现在一个地方。
- **一组总是一起读写的设置存成一个对象。** `set('profile', { name, age })` 一次写入、一次 `change` 事件。互相独立的设置各用一个键，改一个不用读出再写回整个对象。
- **时间存成毫秒时间戳。** `Date` 对象不能存，存 `Date.now()` 得到的数字，读出来后用 `new Date(n)` 还原。
- **判断真假用 `get()`，不用 `boolForKey()`。** [`boolForKey()`](../api/storage/boolforkey.md) 只把少数几种写法当成真，字符串 `'42'` 得到 `false`。
- **在 `change` 回调里比较新旧值。** 事件不带键名，系统的写入也会触发它。回调里读出关心的键，和上次的值比较，变了再更新界面。

## 第一个例子

下面的代码登记默认值，读写一个设置，统计启动次数，并监听存储的变化。存储不涉及界面，这段代码直接写在 `main.js` 顶层就能运行。

```js
const storage = application.storage;

// 1. 登记默认值。只在键没被写过时生效，每次启动都要登记
storage.registerDefaults({ theme: 'auto', pageSize: 20 });

// 2. 读设置。没写过时读到登记的默认值
console.log('主题:', storage.get('theme'));

// 3. 统计启动次数。没有这个键时 integerForKey 得到 0
const launches = storage.integerForKey('launchCount') + 1;
storage.set('launchCount', launches);
console.log('第', launches, '次启动');

// 4. 监听变化。事件不带键名，回调里自己读
let lastTheme = storage.get('theme');
storage.addEventListener('change', () => {
  const theme = storage.get('theme');
  if (theme !== lastTheme) {
    lastTheme = theme;
    console.log('主题变成了:', theme);
  }
});

// 5. 改设置
storage.set('theme', 'dark');
```

**结果**

- 第一次启动，控制台依次输出 `主题: auto`、`第 1 次启动`、`主题变成了: dark`。
- 第二次启动，输出 `主题: dark`、`第 2 次启动`。主题没有再变，第三行不输出。

这段代码没有作为一个整体在模拟器运行过。其中用到的每个 API 都在验收用例里运行过。

以下各节都沿用上面的 `storage`。

## 给设置登记默认值

```js
storage.registerDefaults({ theme: 'auto', pageSize: 20 });
console.log(storage.get('theme'));

storage.set('theme', 'dark');
console.log(storage.get('theme'));

storage.remove('theme');
console.log(storage.get('theme'));
```

**结果**：依次输出 `auto`、`dark`、`auto`。删除写入的值之后，又读到登记的默认值。

登记的值不写入磁盘，每次启动都要登记一次。登记过默认值的键，`has()` 得到 `true`，即使从没写过。

## 读一个没有的键

`get()` 读一个没写过的键得到 `null`，不抛异常。`has()` 得到 `false`。

`integerForKey()` 和 `boolForKey()` 在没有键时返回 `0` 和 `false`，不是 `null`。要区分「没有这个键」和「值是 0」，用 `has()` 或 `get()`。

## 保存对象和数组

```js
storage.set('recent', ['AAPL', 'TSLA']);
storage.set('profile', { name: '小王', level: 3, tags: ['vip'] });

const profile = storage.dictionaryForKey('profile');
if (profile) {
  console.log(profile.name, profile.level);
}
```

**结果**：输出 `小王 3`。

修改读出来的 `profile` 不会保存。要保存修改，把改好的对象再 `set()` 一次。

## 删除一个键

```js
storage.set('draft', '写到一半的内容');
storage.remove('draft');
console.log(storage.get('draft'), storage.has('draft'));
```

**结果**：输出 `null false`。

`storage.set('draft', null)` 的效果相同。删除一个本来就没有的键不报错。

## 保存时间

```js
storage.set('lastSync', Date.now());

const stamp = storage.get('lastSync');
if (typeof stamp === 'number') {
  console.log('上次同步:', new Date(stamp).toISOString());
}
```

**结果**：输出上次同步的时间，如 `上次同步: 2026-11-14T08:00:00.000Z`。

## 存储变化时更新界面

```js
const onChange = () => {
  console.log('存储变了，当前主题:', storage.get('theme'));
};
storage.addEventListener('change', onChange);

storage.set('theme', 'light');
console.log('set 已返回');
```

**结果**：先输出 `set 已返回`，然后输出 `存储变了，当前主题: light`。回调在当前这段代码执行完之后才执行。

不再需要时用 `storage.removeEventListener('change', onChange)` 移除，之后的写入不再调用这个回调。

`change` 事件不带键名，App 自己的写入和系统的写入都会触发它，每次写入派发一次。细节见 [`change`](../api/storage/change-event.md)。

## 参见

- [`application.storage`](../api/storage.md)：全部函数和事件
- [Keychain](../api/keychain.md)：令牌和密码放那里
- [文件读写](../api/filesystem.md)：文件和大量数据放那里
