# 本地存储怎么搭的

`application.storage` 就是 `NSUserDefaults` 的 standard 实例。这一页记为什么是这个形状，以及从头文件里读出来的几条硬事实。

## 四条事实，都来自 iOS 26 的 `NSUserDefaults.h`

**1. 写是同步进内存、异步落盘。** 原话：

> This method immediately stores a value … then **asynchronously** stores the value persistently

所以这一层的 API **是同步的**，不违反[「异步一律 Promise」](../project.md)——它本来就不是异步 API。文件读写那一步不一样，那边重活要派到后台队列，和 `fetch` 一个路子。

**2. `synchronize` 不该用。** 头文件自己标着：

> This method is unnecessary and shouldn't be used.

所以**没有暴露**。「底层完整暴露」这条承诺在 bindgen 之后兑现，手写阶段不往里塞 Apple 自己劝退的方法。

**3. 值必须是 plist 类型。** 原话：

> Setting a default value to a non-property-list object that can't be archived will **throw an exception**

ObjC 抛的 NSException 在我们这里就是**崩溃**，所以非法值必须在过桥前拦下。

**4. 变化通知是弱的，Apple 自己推荐 KVO。** 原话：

> This notification isn't posted when ubiquitous defaults change, or when an outside process changes defaults. **Using key-value observing** to register observers for the specific keys of interest will inform you of all updates, regardless of where they're from.

第一版仍然用通知：单进程、没有 App Group 和 iCloud，它覆盖得住；而按键订阅要先解决[「订阅按事件名分流」那条 TODO](../project.md)——现在 `setSubscription:` 是按对象的**类**挑分支的，`'change:lang'` 这种形式过不去。

## 为什么叫 `get` / `set` 而不是 `objectForKey`

ObjC 侧有 **10 个取值器 + 5 个设值器**（`stringForKey:`、`integerForKey:`、`setInteger:forKey:`…）。JS 是动态类型，设值器那 5 个在 JS 里**行为完全一样**——JS 的数字就是 double，`setInteger:forKey:` 和 `setObject:@(n) forKey:` 存进去的东西没区别。

所以这 15 个在 JS 里塌缩成：

| ObjC | JS |
| --- | --- |
| `setObject:forKey:` + 5 个带类型的设值器 | `set` 一个 |
| `objectForKey:` | `get` |
| 其余 9 个带类型的取值器 | 原名保留 |

**取值器保留、设值器不留**，判据是「行为有没有差别」：`integerForKey:` 对存进去的字符串 `'42'` 返回 `42`，`objectForKey:` 返回 `'42'`——那是两件事。而两种写法存进去一样的东西，就是[原则 1](../project.md) 要消灭的「同一件事两种写法」。

`objectForKey:` → `get` 是这一层**唯一改名的地方**。理由是既然 15 个必须重排，`object` 这个词在 JS 里也没有意义——JS 里一切都是值。`NSUserDefaults` 类本身照样裸暴露在全局。

> 候选里还有 `localStorage`。**没选它，因为那个名字带着一份合同**：Web 的 `localStorage` 只存字符串，`setItem('n', 42)` 读回来是 `"42"`。叫这个名字却返回数字，照 Web 经验写的代码会静默出错——[原则 9](../project.md) 说的「既不像 Web 也不像 iOS」。

## 验值为什么必须在 JS 侧做

不验的话这件事会发生：

```js
storage.set('token', someUndefinedVariable);   // 本想存东西
```

`JSON.stringify([undefined])` 给 `[null]`，而 `null` 在这一层的含义是**删除**。于是「写错一个类型」变成「静默删掉一个键」——这个项目一路在拒绝的那种错，而且是最坏的形态。

所以 `plistValue()` 逐层走一遍，路径写进错误信息（`set("x").a[1].b: function cannot be stored`）。循环结构也在这里拦，否则会无限递归。

**原生侧还有第二道**：`NSPropertyListSerialization propertyList:isValidForFormat:`。它防的是 JS 侧漏掉的情况——漏了就是崩溃，代价太高，值得多一道。

## 分发链为什么单独成文件

`NacreStorage.mm` 不塞进 `NacreMethods.mm`，两个理由都成立：那个文件已经 **817 行**，过了[约定的 800 行线](../project.md)；而「本地存储」和视图的方法毫不相干。

这条链是新写的，所以按[已定的规矩](bridge.md)**返回「认不认领」**：

```cpp
bool StorageCallMethod(id object, const std::string& name, const std::string& argsJSON,
                       std::string* out, std::string* error);
```

`CallMethod` 开头先问它一句，认领了就直接返回。不靠「在同一个函数里往下掉」——那样将来拆文件要新增返回约定，而新增约定就是改设计。

`standardUserDefaults` 走类级属性通道（`read_class_object_property`），和 `UIColor` 的常量同一条路。

## 实测：这条通知**不是**以 `NSUserDefaults` 实例作为 `object` 发的

第一版按发送者过滤：

```objc
[center addObserver:observer selector:@selector(defaultsChanged:)
               name:NSUserDefaultsDidChangeNotification
             object:defaults];     // ← 这样一条都收不到
```

实测结果是**事件一次都没到**。改成 `object:nil` 之后，事件在**第一轮定时器回调时就已经到达**——所以时序从来不是问题，是过滤把它全挡了。

头文件没有承诺这条通知的 `object` 是哪个实例，而进程里只有 standard 一个，**按发送者过滤没有收益只有风险**。

**连带的后果要正视**：不过滤意味着进程里**任何一次** UserDefaults 写入都会发一条，包括 UIKit 自己写的；而且**每次写一条，不合并**。验收用例第一版就是被这条咬的——它写死了「摘牌之后总共 1 条」，而别的 step 一多、写入一多就变成 3 条。正确的断言是「摘牌之后不再增长」。

> 查这个 bug 时同时改了两处（取消过滤、把用例从「假设下一轮一定到」改成轮询并报出实际轮次）。能分清是哪一处起作用，靠的是用例打出来的那行「第 1 轮已到达」——如果只改不报，就只知道「好了」，不知道为什么好。

## 实测：`boolForKey` 不是通用真值转换

| 存进去的 | `boolForKey` 给 |
| --- | --- |
| `true` | `true` |
| `'1'` | `true` |
| `'YES'` | `true` |
| **`'42'`** | **`false`** |
| 键不存在 | `false` |

`'42'` 这种「看着像真」的字符串给 `false`，所以别拿它当 JS 的真值判断用。

## `change` 的 trampoline

和控件、滚动那两个同构：**只持有 handle 不持有 JS 函数**，派发时拿原生指针查包装，再走包装自己的 `dispatchEvent`。观察者对象靠 `objc_setAssociatedObject` 挂在 `NSUserDefaults` 上，惰性订阅——一个监听器都没有时不注册通知。

## 验收里最要紧的那一条

同一次运行里写了再读，**内存缓存就能满足**，证明不了落盘。所以用启动计数器：

```js
const launches = storage.integerForKey('launchCount') + 1;
storage.set('launchCount', launches);
```

实测 `run-sim.sh` 只做 `simctl install`，**不抹 App 容器**，所以跑第二次应该看到 `2`。这是跨进程的证据，别的断言都替代不了。

---

← 返回[实现原理](README.md) ・ [API 文档](../api/storage.md)
