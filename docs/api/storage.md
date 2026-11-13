---
type: reference
native: NSUserDefaults
status: partial
---

# 本地存储

**`application.storage`** 表示 App 的键值存储。每个键是一个字符串，对应一个值；值保存在设备上，App 退出后再启动还能读到。它用来保存用户设置和少量状态，比如主题、上次打开的页面、启动次数。

`application.storage` 在整个 App 里只有一个，任何时候都能用，包括脚本顶层。它的类是 `NSUserDefaults`，这个类不能用 `new` 创建。

读和写都是同步的：`get` 直接返回值，`set` 返回时新值已经生效，紧接着读就能读到。

## 三种存储怎么选

运行时提供三种保存数据的方式，区别在于放什么数据：

| 要保存的数据 | 用哪个 | 原因 |
| --- | --- | --- |
| 用户设置、开关、上次看到哪、启动次数 | `application.storage`（本页） | 同步读写，值可以直接是数字、布尔、数组、对象 |
| 登录令牌、密码、密钥 | [`application.keychain`](keychain.md) | 由系统加密保存，可以规定设备锁定时能否读取 |
| 下载的文件、图片缓存、大量的业务数据、二进制内容 | [`application.fileSystem`](filesystem.md) | 按文件保存，可以选择放进会被系统清理的缓存目录或不会被清理的目录 |

令牌和密码不要放在 `application.storage` 里。这里的值不加密（来自 iOS 的定义，**未在模拟器验证**）。

## 能存哪些值

| 能存 | 不能存 |
| --- | --- |
| 字符串 | `undefined`、函数、Symbol |
| 有限的数字 | `NaN`、`Infinity` |
| 布尔值 | `Date`、`Blob`、原生对象（如颜色、视图） |
| 数组，元素也是能存的值 | 数组或对象里面的 `null` |
| 普通对象，属性值也是能存的值 | 自己引用自己的结构 |

存一个不能存的值时，`set` 当场抛 `TypeError`，这个键原来的值不变。报错信息里写明是哪一层的哪个值：

```js
try {
  application.storage.set('x', /** @type {any} */ ({ a: [1, { b: () => {} }] }));
} catch (err) {
  console.log(String(err));
}
```

**结果**：控制台输出 `TypeError: set("x").a[1].b: function cannot be stored; only strings, finite numbers, booleans, arrays and plain objects of those`。键 `x` 没有被写入。

`set(key, null)` 的含义是删除这个键，和 `remove(key)` 相同。`set(key, undefined)` 抛 `TypeError`，不会删除。

读出来的值类型和存进去时一样：存数字读到数字，存布尔读到布尔，存对象读到对象。读到的数组和对象是一份副本，修改它不会改变存储里的值，要再调一次 `set` 才会保存。对象的属性超过两个时，读回来的属性顺序是否和写入时一致，**未在模拟器验证**。

运行时不限制单个值的大小和键的数量。系统对这种存储的容量上限**未在模拟器验证**。

## 读一个没有的键

`get` 读一个没写过的键得到 `null`，不抛异常。`has` 得到 `false`。

如果希望没写过的键读到一个默认值，用 `registerDefaults` 登记。登记的值只在这个键没被写过时生效，它不写入磁盘，所以每次启动都要登记一次，见[给设置登记默认值](#给设置登记默认值)。

## 数据什么时候保存、保留到什么时候

`set` 返回时新值立刻可读。写入磁盘由系统随后自动完成，App 不需要也不能主动触发。

| 情况 | 数据还在吗 |
| --- | --- |
| App 退到后台再回来 | 在 |
| App 进程结束后重新启动 | 在。验收里用启动计数器验证过：第二次启动读到 2 |
| `set` 之后 App 立刻被强制结束 | **未在模拟器验证** |
| 系统升级 | **未在模拟器验证** |
| 用户卸载 App | 不在。数据随 App 一起删除（来自 iOS 的定义，**未在模拟器验证**） |
| 换新手机并从备份恢复 | **未在模拟器验证** |

## 值变化时的通知

存储里任何一个键被写入或删除后，`application.storage` 派发 `change` 事件。这个事件有四个特点：

- **事件不说明是哪个键变了。** 回调里要自己重新读关心的键。
- **App 自己的写入也会触发。** 代码调用 `set` 之后，自己注册的回调会收到事件。
- **系统的写入也会触发。** iOS 自己也会往这份存储里写东西，这些写入同样派发 `change`。所以回调被调用不代表 App 关心的键变了。
- **每次写入派发一次，不合并。** 连续写三个键，收到三次事件。

事件不是在 `set` 返回前派发的，而是在当前这段代码执行完之后。`set` 的下一行还收不到。

## 推荐的做法

**启动时先登记默认值，之后只用 `get`。** 这样读设置的代码不用到处写「没有就用某个值」，默认值只出现在一个地方。

**一组总是一起读写的设置存成一个对象。** `set('profile', { name, age })` 一次写入、一次 `change` 事件。互相独立的设置各用一个键，改一个不用读出再写回整个对象。

**时间存成毫秒时间戳。** `Date` 对象不能存，存 `Date.now()` 得到的数字，读出来后用 `new Date(n)` 还原。

**判断真假用 `get`，不用 `boolForKey`。** `boolForKey` 只把少数几种写法当成真，字符串 `'42'` 得到 `false`，见[带类型的读取方法](#带类型的读取方法)。

**在 `change` 回调里比较新旧值。** 事件不带键名，系统的写入也会触发它。回调里读出关心的键，和上次的值比较，变了再更新界面。

## 完整例子

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

## 常见用法

以下例子都沿用上面的 `storage`。

### 给设置登记默认值

```js
storage.registerDefaults({ theme: 'auto', pageSize: 20 });
console.log(storage.get('theme'));

storage.set('theme', 'dark');
console.log(storage.get('theme'));

storage.remove('theme');
console.log(storage.get('theme'));
```

**结果**：依次输出 `auto`、`dark`、`auto`。删除写入的值之后，又读到登记的默认值。

登记过默认值的键，`has` 得到 `true`，即使从没写过。

### 保存对象和数组

```js
storage.set('recent', ['AAPL', 'TSLA']);
storage.set('profile', { name: '小王', level: 3, tags: ['vip'] });

const profile = storage.dictionaryForKey('profile');
if (profile) {
  console.log(profile.name, profile.level);
}
```

**结果**：输出 `小王 3`。

修改读出来的 `profile` 不会保存。要保存修改，把改好的对象再 `set` 一次。

### 删除一个键

```js
storage.set('draft', '写到一半的内容');
storage.remove('draft');
console.log(storage.get('draft'), storage.has('draft'));
```

**结果**：输出 `null false`。

`storage.set('draft', null)` 的效果相同。删除一个本来就没有的键不报错。

### 保存时间

```js
storage.set('lastSync', Date.now());

const stamp = storage.get('lastSync');
if (typeof stamp === 'number') {
  console.log('上次同步:', new Date(stamp).toISOString());
}
```

**结果**：输出上次同步的时间，如 `上次同步: 2026-11-14T08:00:00.000Z`。

### 存储变化时更新界面

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

`application.storage` 只有 `change` 这一个事件。注册别的事件名会抛异常，信息是 `addEventListener: 'removed' is not a storage event; expected: change`。

## 带类型的读取方法

`get` 原样返回存进去的值。另有七个方法在读取时把值转换成指定的类型，转换不了时返回一个固定的值，不抛异常。

```js
storage.set('n', '42');
console.log(storage.get('n'), storage.integerForKey('n'));
```

**结果**：输出 `42 42`。前一个是字符串 `'42'`，后一个是数字 `42`。

| 方法 | 返回类型 | 没有这个键时 | 值的类型对不上时 |
| --- | --- | --- | --- |
| `stringForKey(key)` | `string \| null` | `null` | **未在模拟器验证** |
| `integerForKey(key)` | `number`，整数 | `0` | 字符串 `'42'` 得到 `42`。转不成数字的情况**未在模拟器验证** |
| `doubleForKey(key)` | `number` | `0`（**未在模拟器验证**） | 字符串 `'42'` 得到 `42` |
| `boolForKey(key)` | `boolean` | `false` | 见下表 |
| `arrayForKey(key)` | 数组或 `null` | `null`（**未在模拟器验证**） | `null` |
| `dictionaryForKey(key)` | 对象或 `null` | `null`（**未在模拟器验证**） | `null`（**未在模拟器验证**） |
| `stringArrayForKey(key)` | 字符串数组或 `null` | `null`（**未在模拟器验证**） | 数组里有不是字符串的元素时得到 `null` |

`integerForKey` 和 `boolForKey` 在没有键时返回 `0` 和 `false`，不是 `null`。要区分「没有这个键」和「值是 0」，用 `has` 或 `get`。

`boolForKey` 对各种值的结果（实测）：

| 存进去的值 | `boolForKey` 的结果 |
| --- | --- |
| `true` | `true` |
| 字符串 `'1'` | `true` |
| 字符串 `'YES'` | `true` |
| 字符串 `'42'` | `false` |
| 没有这个键 | `false` |

## 成员说明

### 方法

所有方法的第一个参数 `key` 必须是字符串。传别的类型时抛 `TypeError`，信息是 `<方法名>: key must be a string`，如 `get: key must be a string`。

| 方法 | 返回值 | 说明 |
| --- | --- | --- |
| `get(key)` | 存进去的值，或 `null` | 没有这个键时返回 `null`。登记过默认值的键返回默认值 |
| `set(key, value)` | 无 | 写入。`value` 是 `null` 时删除这个键 |
| `remove(key)` | 无 | 删除。键不存在时不报错 |
| `has(key)` | `boolean` | 这个键读得到值时为 `true`，包括只登记了默认值的键 |
| `registerDefaults(table)` | 无 | 登记默认值。`table` 是一个普通对象，属性名是键，属性值是默认值 |
| `stringForKey(key)` 等七个 | 见[带类型的读取方法](#带类型的读取方法) | 读取并转换类型 |

`set` 的出错情况，都是 `TypeError`，出错时不写入：

| 传入的值 | 报错信息 |
| --- | --- |
| `undefined` | `set: value is undefined; pass null to remove the key` |
| `NaN`、`Infinity` | `set("x"): NaN and Infinity cannot be stored` |
| 函数（Symbol 等类似，开头的类型名不同） | `set("x"): function cannot be stored; only strings, finite numbers, booleans, arrays and plain objects of those` |
| `Date`、原生对象等不是普通对象的对象 | `set("x"): only plain objects can be stored, got Date` |
| 数组或对象里面的 `null` | `set("x")[1]: null cannot be stored; only strings, finite numbers, booleans, arrays and plain objects of those` |
| 自己引用自己的结构 | `set("x").self: circular structures cannot be stored` |

报错信息开头的 `set("x")` 是键名，后面的 `[1]`、`.self` 是出错的值在结构里的位置。

`registerDefaults` 的出错情况：`table` 不是普通对象时抛 `TypeError`，信息是 `registerDefaults: needs a plain object`。`table` 里的值不能存时，报错和 `set` 相同，开头是 `registerDefaults`。

用 `new NSUserDefaults()` 创建时抛 `TypeError`，信息是 `Illegal constructor: NSUserDefaults is created by the runtime, not by new`。

### 事件

| 事件 | 什么时候派发 | 事件对象 |
| --- | --- | --- |
| `change` | 存储里任何一个键被写入或删除之后。App 自己的写入和系统的写入都会触发 | 只有 `type` 和 `target`，不带键名和值 |

App 进程之外对这份存储的改动不派发 `change`（来自 iOS 的定义，**未在模拟器验证**）。

## 与 iOS 原生写法的对照

| ObjC | JS |
| --- | --- |
| `[NSUserDefaults standardUserDefaults]` | `application.storage` |
| `[d objectForKey:@"k"]` | `storage.get('k')` |
| `[d setObject:v forKey:@"k"]` | `storage.set('k', v)` |
| `[d removeObjectForKey:@"k"]` | `storage.remove('k')` 或 `storage.set('k', null)` |
| `[d registerDefaults:@{…}]` | `storage.registerDefaults({…})` |
| `[d stringForKey:@"k"]` | `storage.stringForKey('k')` |
| `[d integerForKey:@"k"]` | `storage.integerForKey('k')` |
| `[d doubleForKey:@"k"]` | `storage.doubleForKey('k')` |
| `[d boolForKey:@"k"]` | `storage.boolForKey('k')` |
| `[d arrayForKey:@"k"]` | `storage.arrayForKey('k')` |
| `[d dictionaryForKey:@"k"]` | `storage.dictionaryForKey('k')` |
| `[d stringArrayForKey:@"k"]` | `storage.stringArrayForKey('k')` |
| `[d setInteger:n forKey:@"k"]` 等带类型的写入 | `storage.set('k', n)` |
| `NSUserDefaultsDidChangeNotification` | `storage.addEventListener('change', …)` |
| `[d synchronize]` | 没有。系统自动写入磁盘 |

## 还不能做的

| 想做的事 | 对应的原生能力 | 现在怎么办 |
| --- | --- | --- |
| 直接存 `Date` | `NSDate` | 存毫秒时间戳 |
| 存二进制数据 | `NSData` | 用[文件读写](filesystem.md) |
| 只监听某一个键的变化 | 键值观察（KVO） | 监听 `change`，在回调里比较新旧值 |
| 和同一开发者的其他 App、小组件共用一份存储 | `initWithSuiteName:`、App Group | 没有替代办法 |
| 在用户的多台设备之间同步 | `NSUbiquitousKeyValueStore` | 没有替代办法 |

## 参见

- [`application`](application.md)：`storage` 是它的属性
- [Keychain](keychain.md)：令牌和密码放那里
- [文件读写](filesystem.md)：文件和大量数据放那里
- [实现原理](../internals/storage.md)：这一页各条结论的实测记录
