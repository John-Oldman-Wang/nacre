# 本地存储

App 要记住的东西放这里：设置、上次看到哪、小状态。关掉 App 再打开还在。

```js
application.storage.set('theme', 'dark');
application.storage.get('theme');        // 'dark'
```

它就是 iOS 的 `NSUserDefaults` 的 standard 实例——**不是另造的一层**，所以 `NSUserDefaults` 类本身也在全局。

## 存什么

| 能存 | 不能存 |
| --- | --- |
| 字符串、**有限**数字、布尔 | `undefined`、函数、Symbol、`NaN`、`Infinity` |
| 数组、纯对象（元素也要能存） | `Date`、`Blob`、原生对象、循环结构 |

**存不下的当场抛，不会静默丢。** 错误信息指到具体哪一层：

```js
storage.set('x', { a: [1, { b: () => {} }] });
// TypeError: set("x").a[1].b: function cannot be stored; only strings,
//            finite numbers, booleans, arrays and plain objects of those
```

这一条不是洁癖：不拦的话 `JSON.stringify` 会把函数和 `undefined` 悄悄变成 `null`，而 `null` 在这里的含义是**删除**——写错一个类型就会静默删掉一个键。

## 基本

| 成员 | 效果 |
| --- | --- |
| `get(key)` | 没有这个键时给 `null` |
| `set(key, value)` | **写 `null` 等于删除**；写 `undefined` 抛 |
| `remove(key)` | |
| `has(key)` | `registerDefaults` 注册过的键也算有 |
| `registerDefaults(table)` | 注册「没写过时读到什么」 |

```js
storage.registerDefaults({ theme: 'auto', pageSize: 20 });
storage.get('theme');          // 'auto'，从没写过
storage.set('theme', 'dark');
storage.get('theme');          // 'dark'
storage.remove('theme');
storage.get('theme');          // 'auto'，又回到注册值
```

`registerDefaults` **只影响读、不写盘**，所以每次启动都要重新注册——这是 iOS 的语义，不是我们的限制。

## 带类型的取值器

它们和 `get` **行为不同**：会做 plist 的类型强制。

```js
storage.set('n', '42');
storage.get('n');                 // '42'  ← 字符串
storage.integerForKey('n');       // 42    ← 数字
```

| 成员 | 取不到时给 |
| --- | --- |
| `stringForKey(key)` | `null` |
| `integerForKey(key)` / `doubleForKey(key)` | **`0`**，不是 `null` |
| `boolForKey(key)` | **`false`**。注意它**不是通用真值转换**，见下 |
| `arrayForKey(key)` / `dictionaryForKey(key)` | `null`（存的类型对不上也给 `null`） |
| `stringArrayForKey(key)` | `null`（数组里混了非字符串也给 `null`） |

**`boolForKey` 只认几种写法**，实测：

| 存进去的 | 给 |
| --- | --- |
| `true` / `'1'` / `'YES'` | `true` |
| **`'42'`** | **`false`** |
| 键不存在 | `false` |

`'42'` 看着像真却给 `false`，别拿它当 JS 的真值判断用。

> **没有对应的带类型 setter。** JS 的数字就是 double，`setInteger:forKey:` 和 `set` 存进去的东西一样，那才是同一件事两种写法。`floatForKey:` 同理——JS 没有单精度。

## 变化通知

```js
storage.addEventListener('change', () => reload());
```

两条边界要知道：

- **不带是哪个键。** iOS 的通知就不带。
- **只有本进程的改动会发。** 外部进程和 iCloud 的改动收不到。
- **进程里任何一次写入都会发**，包括 UIKit 自己写的——我们按不了发送者过滤（过滤了一条都收不到）。
- **每次写一条，不合并。** 一轮里写三个键会收到三条。

> 和 Web 的 `storage` 事件**正好相反**：那个只在**别的 tab** 改时触发，自己改不触发。

和别的原生事件一样，它**延后一轮派发**：

```js
storage.set('k', 1);
// 这一行读 changes 还是空的，要等下一轮
```

## 什么时候落盘

写入**立刻进内存**，系统**异步**写盘。所以：

- 写完马上读，一定读得到
- 不需要调 `synchronize`——iOS 26 的头文件自己标着「this method is unnecessary and shouldn't be used」，所以我们**没有暴露它**

## 和原生的对照

| ObjC | JS |
| --- | --- |
| `[NSUserDefaults standardUserDefaults]` | `application.storage` |
| `[d objectForKey:@"k"]` | `storage.get('k')` |
| `[d setObject:v forKey:@"k"]` | `storage.set('k', v)` |
| `[d removeObjectForKey:@"k"]` | `storage.remove('k')` 或 `storage.set('k', null)` |
| `[d registerDefaults:@{…}]` | `storage.registerDefaults({…})` |
| `[d integerForKey:@"k"]` | `storage.integerForKey('k')` |
| `NSUserDefaultsDidChangeNotification` | `storage.addEventListener('change', …)` |
| `[d synchronize]` | 不暴露，Apple 说别用 |

> `objectForKey:` / `setObject:forKey:` 在 JS 里叫 `get` / `set`，是这一层唯一改名的地方。ObjC 的 10 个取值器和 5 个设值器在动态类型下塌缩成这一对，既然必须重排，`object` 这个词在 JS 里也没有意义——JS 里一切都是值。[底层承诺的是能力对齐，不是形状一致](../project.md)。

## 还没做

| | |
| --- | --- |
| `Date` | 要先暴露 `NSDate`，该和 `NSDateFormatter` 一起做。现在自己存时间戳或 ISO 串 |
| `Blob` / 二进制 | 大二进制本来该走文件读写 |
| 文件读写 | 下一步 |
| Keychain | 令牌和密码要加密存，再下一步 |
| suite / App Group | 要 entitlement |
| 按键订阅（KVO） | Apple 推荐它，因为比通知全。要先解决「订阅按事件名分流」那条 TODO |
| `NSUbiquitousKeyValueStore` | iCloud 同步 |

---

← 返回 [API 文档](README.md) ・ [`application`](application.md) ・ [实现原理](../internals/storage.md)
