# 文件读写

比[键值存储](storage.md)大的东西放这里：下载的文件、缓存、生成的数据。

```js
const fs = application.fileSystem;
const path = fs.documents + '/notes.txt';

await fs.writeText(path, '你好');
await fs.readText(path);     // '你好'
```

**全是 Promise。** 不是出于「异步一律 Promise」那条原则，而是因为 **JS 跑在主线程**——同步读一个文件会直接卡住 UI。`application.storage` 能同步，是因为 `UserDefaults` 是内存缓存。

## 四个目录

路径是**绝对路径字符串**，用这四个常量当前缀自己拼。

| 常量 | 特点 |
| --- | --- |
| `documents` | 会被备份。用户数据放这里 |
| `applicationSupport` | 会被备份。App 自己的数据放这里 |
| `caches` | **系统空间紧张时会被清掉**。放能重新下载的东西 |
| `temporary` | 系统随时删 |

```js
const path = fs.documents + '/深/一层/notes.txt';
```

末尾**不带**斜杠，所以拼的时候自己加一个。**没有 `join` 助手**——那是纯字符串运算，归你自己的库。

## 读写

| | |
| --- | --- |
| `readText(path)` | → `Promise<string>`，UTF-8 |
| `readBytes(path)` | → `Promise<ArrayBuffer>`，零拷贝 |
| `writeText(path, text)` | 原子写：先写临时文件再换名，不会留半截 |
| `writeBytes(path, blob)` | 第二个参数收 [`Blob`](fetch.md#blob字节不进-v8-堆) |

要写 `ArrayBuffer` 就先包一层：

```js
await fs.writeBytes(path, new Blob([myUint8Array]));
```

## 目录和元信息

| | |
| --- | --- |
| `exists(path)` | → `Promise<boolean>` |
| `makeDirectory(path)` | 中间层自动建，**已经存在不报错** |
| `readDirectory(path)` | → `Promise<string[]>`，**只有名字，不含路径** |
| `remove(path)` | 目录连同里面的东西一起删 |
| `move(from, to)` / `copy(from, to)` | |
| `stat(path)` | → `{ size, isDirectory, modified }` |

`stat` 的 `modified` 是**毫秒时间戳**，`new Date(info.modified)` 就能用。不给 `Date` 对象是因为 `NSDate` 还没暴露，那该和 `NSDateFormatter` 一起做。

## 出错

出错是 **reject**，不是返回 `false`。

```js
try {
  await fs.readText(path);
} catch (err) {
  err.name;      // 'NotFoundError'
  err.message;   // 'The file "x.txt" couldn't be opened because…'
  err.code;      // 260
  err.domain;    // 'NSCocoaErrorDomain'
}
```

`name` 借的是 `DOMException` 的标准名字，JS 开发者认识，而且 Web 的 File System Access API 用的就是这一组：

| `name` | 什么时候 |
| --- | --- |
| `NotFoundError` | 文件或目录不存在 |
| `NotAllowedError` | 没权限 |
| `InvalidModificationError` | 已经存在 |
| `QuotaExceededError` | 磁盘满 |
| `NoModificationAllowedError` | 只读卷 |
| `TypeMismatchError` | 文件名非法 |
| `FileError` | 其余 |

**映射盖不住的落进 `FileError`**，那时用 `code` / `domain` 这两个原值分辨——它们是 `NSError` 的原始字段，上层给好用的分类，底层不丢事实。

**路径参数是同步抛，不是 reject**：

```js
fs.readText(42);   // 立刻 TypeError: readText: path must be a non-empty string
```

参数写错不该等到下一轮微任务才知道。

## 和原生的对照

| ObjC | JS |
| --- | --- |
| `NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, …)` | `fs.documents` |
| `NSTemporaryDirectory()` | `fs.temporary` |
| `[NSString stringWithContentsOfFile:encoding:error:]` | `await fs.readText(path)` |
| `[NSData dataWithContentsOfFile:options:error:]` | `await fs.readBytes(path)` |
| `[text writeToFile:atomically:encoding:error:]` | `await fs.writeText(path, text)` |
| `[fm createDirectoryAtPath:withIntermediateDirectories:YES …]` | `await fs.makeDirectory(path)` |
| `[fm contentsOfDirectoryAtPath:error:]` | `await fs.readDirectory(path)` |
| `[fm attributesOfItemAtPath:error:]` | `await fs.stat(path)` |
| `NSError**` | reject |

> `application.fileSystem` **不是** `NSFileManager`——「读写文件」这个能力在 iOS 里散在 `NSFileManager` / `NSData` / `NSString` 三个类上，没有一个原生对象能直接当它用，所以上层这个对象是我们自己的。底下接的仍然是 `defaultManager`。
>
> 名字不叫 `files`：那个词在 Web 里指的是**用户选中的文件列表**（`input.files` 是 `FileList`），文件系统那一边 Web 一律叫 `FileSystem*`。

## 还没做

| | |
| --- | --- |
| 流式读写 | 大文件现在要整个读进内存 |
| 文件变化监听 | 要 `DispatchSource`，原则 10 的第三格还缺 |
| 追加写 | 现在只能读出来拼好再整个写回 |
| file protection 加密等级 | |
| `NSFileCoordinator` / iCloud | |
| 符号链接、权限位 | |
| Keychain | 令牌和密码该加密存，单独一步 |
| `NSFileManager` 的裸暴露 | 等 bindgen |

---

← 返回 [API 文档](README.md) ・ [本地存储](storage.md) ・ [实现原理](../internals/filesystem.md)
