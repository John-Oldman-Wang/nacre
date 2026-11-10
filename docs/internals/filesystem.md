# 文件读写怎么搭的

## 为什么这次有「上层对象」，而 7a 没有

`application.storage` **就是** `NSUserDefaults` 的实例，没另造一层——iOS 侧本来就有一个对象承担那件事。

文件不一样，这个能力散在三个类上：

| 要干的事 | ObjC 在哪 |
| --- | --- |
| 建目录、列目录、删、移、拷、查存在、查属性 | `NSFileManager` |
| **读写文件内容** | `NSData` / `NSString` 的方法 |
| 路径拼接 | `NSString` 的 path 方法 |

`NSFileManager` **没有**「读一个文件的内容」这个方法。所以没有一个原生对象可以直接当上层用——按[原则 2](../project.md)（能力导向不是实现导向），该有我们自己的一个。

**类名注册成 `FileSystem`，底下接的仍然是 `NSFileManager.defaultManager`。** 包装表里的「类名」只是一个键，不必是 ObjC 的类名。

### 名字为什么不叫 `files`

实测 Web：

```
input.files 的类型       = [object FileList]
FileList 里装的是 File，而 File extends Blob = true
DataTransfer 也叫 files = true
```

`files` 在 Web 里指的是**用户选中的那几个文件**，是个列表。而文件系统那一边 Web 一律叫 `FileSystem*`（`FileSystemHandle` / `FileSystemFileHandle` / `FileSystemDirectoryHandle`，`navigator.storage.getDirectory()` 返回的就是后者）。

所以 `fileSystem` 不是借名字，是**用对词**。`files` 这个名字留给将来的文件选择器（`UIDocumentPickerViewController`），那时元素该是 `Blob` 的子类——Web 那边 `File extends Blob` 实测为真，形状能对上。

也不叫 `fs`：那个名字带着 Node 的合同（同步变体、`Buffer`、回调），我们一样都不给。和[上一步不叫 `localStorage`](storage.md) 是同一条判据。

## 全 Promise 的理由不是那条原则

[原则 4](../project.md) 说异步一律 Promise，但真正的理由更硬：**JS 跑在主线程**，同步读一个文件会直接卡住 UI。

重活派到并发队列（`QOS_CLASS_UTILITY`，不和界面抢优先级），走 `fetch` 验过的那条路。验收里有一条直接测这件事：

```js
const big = new Uint8Array(4 * 1024 * 1024);
let timerRan = false;
const writing = fs.writeBytes(path, new Blob([big]));
setTimeout(() => { timerRan = true; }, 0);
await writing;
assert('大写入期间定时器照常跑（重活不在主线程）', timerRan, true);
```

写在主线程做的话，那个定时器只能等它做完。实测通过。

## 这个文件不认识运行时

`NacreFileSystem.mm` 做完之后调一个 `done` 块，**兑现成什么由调用方决定**：

```objc
typedef void (^NacreFileDone)(NacreFileResult* result);
bool FileSystemCallAsync(id object, …, NacreFileDone done);
```

`NacreFileResult` 用四个互斥的字段表示四种兑现：`isError` → reject，`bytes` → `SettleBytes`（零拷贝），`json` → `SettleJSON`，其余 → `SettleBool`。

好处是它不用为了拿 settle 的入口去引运行时的私有头，回主线程这件事统一在 `NacreRuntime.mm` 的一个地方做。分发链按[已定的规矩](bridge.md)返回「认不认领」。

> **`done` 在后台线程被调。** 回主线程是调用方的责任——`NacreRuntime.mm` 里每一条都包了 `postToJS`。

## `RejectCall` 加了一个可选的 detail

原来的签名带不出 `NSError` 的 `code` / `domain`：

```cpp
void RejectCall(int call_id, const std::string& name, const std::string& message,
                const std::string& detail_json = "");   // ← 新加的
```

`detail_json` 里的键原样挂到 `Error` 上。带默认值，所以 `fetch` 那些现有调用点一个字没动。

这样**上层给好用的分类（`err.name` 是 `DOMException` 的标准名字），底层不丢事实（`err.code` / `err.domain`）**——两层 API 的分工落到错误上。映射只覆盖了 Cocoa 文件错误里的 7 组，剩下几十个落进 `FileError`，没有逃生口的话 JS 侧就彻底分不出来了。

实测读一个不存在的文件：

```
name = NotFoundError，code = 260（NSFileReadNoSuchFileError），
domain = NSCocoaErrorDomain
```

## 两个踩到的坑

**1. ObjC 的声明只能在全局作用域。** 第一版把 `@interface NacreFileResult` 写进了 `namespace nacre_bridge { }`，编译报 `Objective-C declarations may only appear in global scope`，后面还跟着十条 nullability 警告——全是这一条引发的连锁。仓库里本来就有样板：`NacreBlob` 的 `@interface` 就在 namespace 外面。

**2. `check-api.sh` 认的是参数名。** 属性提取的签名正则是 `^id Read\w+Property\(id object, NSString\* key\)`，而我第一版写的是 `NSString* name`，于是四个目录常量被报成「nacre.js 有但原生层没有」。

> 这条**是脚本该做的事**——它没有静默放过，而是报出了一条看得懂的 diff。改成和其余 `NacreProps*.mm` 一致的 `key` 就好了。顺带说明那个签名正则实际上在强制一条命名约定。

## 落盘怎么验

和 [7a 的启动计数器](storage.md)同理，但换一种介质——往 `documents` 写一个累加的文件：

```js
const previous = (await fs.exists(marker)) ? await fs.readText(marker) : '';
const runs = previous.split(',').filter(Boolean).length + 1;
await fs.writeText(marker, previous ? previous + ',' + runs : '1');
```

实测 `run-sim.sh` 只做 `simctl install`，不抹 App 容器，所以第二次跑读到 `2`。这是跨进程的证据，同一次运行里写了再读证明不了。

---

← 返回[实现原理](README.md) ・ [本地存储](storage.md) ・ [API 文档](../api/filesystem.md)
