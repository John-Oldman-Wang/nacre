---
type: reference
status: partial
---

# `application.fileSystem`

**`application.fileSystem`** 表示 App 自己的文件存储。它给出五个目录的路径（四个读写的，一个是项目的 `assets/` 在 App 包里的位置，只读），并提供读文件、写文件、建目录、列目录、删除、移动、复制、查询文件信息的函数。

`application.fileSystem` 在整个 App 里只有一个，任何时候都能用，包括脚本顶层。它的类是 `FileSystem`。

所有读写函数都返回 Promise。读写在后台进行，期间界面照常响应，定时器照常执行。出错时 Promise 被拒绝（reject），不会返回 `false` 或 `null`，拒绝的值见[出错时得到什么](#出错时得到什么)。

用户设置放在 [`application.storage`](storage.md)，令牌和密码放在 [`application.keychain`](keychain.md)。怎么选目录、怎么读写，见指南[读写文件](../guides/files.md)。

**继承关系**：`NSObject` → `FileSystem`

## 构造函数

不能用 `new` 创建：`new FileSystem()` 抛 `TypeError`，信息是 `Illegal constructor: FileSystem is created by the runtime, not by new`。唯一的实例从 [`application`](application.md) 的 `fileSystem` 属性拿到。

## 属性

五个目录的绝对路径。五个值在 App 运行期间不变。

| 属性 | 说明 |
| --- | --- |
| [`documents`](filesystem/documents.md) <small>只读</small> | 用户创建的内容。系统不会删，进入备份 |
| [`applicationSupport`](filesystem/applicationsupport.md) <small>只读</small> | App 自己的数据。系统不会删，进入备份 |
| [`caches`](filesystem/caches.md) <small>只读</small> | 能重新得到的内容。存储空间不足时系统会删 |
| [`temporary`](filesystem/temporary.md) <small>只读</small> | 用完就不要的临时文件。系统随时可能删 |
| [`assets`](filesystem/assets.md) <small>只读</small> | 项目的 `assets/` 在 App 包里的位置。只能读，不能写 |

## 函数

所有函数的路径参数必须是非空字符串。传别的类型或空字符串时，函数**当场抛** `TypeError`，不返回 Promise，信息是 `<函数名>: path must be a non-empty string`，如 `readText: path must be a non-empty string`。

读和写：

| 函数 | 说明 |
| --- | --- |
| [`readText()`](filesystem/readtext.md) | 按 UTF-8 读出整个文件的文本 |
| [`readBytes()`](filesystem/readbytes.md) | 读出整个文件的字节 |
| [`writeText()`](filesystem/writetext.md) | 按 UTF-8 写入文本，替换整个文件 |
| [`writeBytes()`](filesystem/writebytes.md) | 写入 `Blob` 里的字节，替换整个文件 |

目录和文件管理：

| 函数 | 说明 |
| --- | --- |
| [`exists()`](filesystem/exists.md) | 路径上有没有文件或目录 |
| [`stat()`](filesystem/stat.md) | 文件的大小、是不是目录、最后修改时间 |
| [`makeDirectory()`](filesystem/makedirectory.md) | 建目录，中间各层一起建 |
| [`readDirectory()`](filesystem/readdirectory.md) | 目录里各项的名字 |
| [`remove()`](filesystem/remove.md) | 删除文件，或删除目录连同里面的所有内容 |
| [`move()`](filesystem/move.md) | 移动或改名 |
| [`copy()`](filesystem/copy.md) | 复制 |

## 路径

路径是绝对路径字符串。用目录属性加上 `/` 和文件名拼出来：

```js
const fs = application.fileSystem;
const path = fs.documents + '/notes/今天.txt';
console.log(path.startsWith('/'));
```

**结果**：输出 `true`。`path` 是 `documents` 目录下 `notes` 子目录里 `今天.txt` 的绝对路径。文件名和目录名可以用中文。

目录属性末尾不带 `/`，拼路径时自己加上。

以下情况**未在模拟器验证**：

- 传相对路径（不以 `/` 开头）时读写的是哪里。
- 读写这几个目录之外的路径会怎样。
- 这几个目录的绝对路径在 App 更新或重装之后是否变化。保存文件位置时，只保存目录属性后面的那一段（如 `'/notes/今天.txt'`），每次使用时再和目录属性拼起来，这样路径变化也不受影响。

用户卸载 App 时，前四个目录里的文件全部随 App 删除（来自 iOS 的定义，**未在模拟器验证**）。App 进程结束后重新启动，`documents` 里的文件还在：验收里第一次运行写一个文件，第二次启动读到了它。

## 出错时得到什么

操作失败时 Promise 被拒绝，拒绝的值是一个 `Error` 对象（类型定义里叫 `FileSystemError`），多带两个属性：

| 属性 | 类型 | 含义 |
| --- | --- | --- |
| `name` | `string` | 错误的类别，取值见下表。用它判断出了什么错 |
| `message` | `string` | 系统给出的说明文字。文字随系统语言变化，不要用它做判断 |
| `code` | `number` | 系统的错误码原值 |
| `domain` | `string` | 系统的错误域，一般是 `'NSCocoaErrorDomain'` |

`name` 的取值：

| `name` | 什么时候 |
| --- | --- |
| `'NotFoundError'` | 文件或目录不存在 |
| `'NotAllowedError'` | 没有读或写的权限 |
| `'InvalidModificationError'` | 目标位置已经有文件 |
| `'QuotaExceededError'` | 设备存储空间已满 |
| `'NoModificationAllowedError'` | 所在的存储只读 |
| `'TypeMismatchError'` | 文件名不合法 |
| `'FileError'` | 以上都不是。这时用 `code` 和 `domain` 区分 |

这张表里只有 `'NotFoundError'` 在模拟器验证过，其余各行来自代码里的对应关系，**未在模拟器验证**。

```js
async function readMissing() {
  const fs = application.fileSystem;
  try {
    await fs.readText(fs.documents + '/没有这个.txt');
  } catch (err) {
    const e = /** @type {FileSystemError} */ (err);
    console.log(e.name, e.code, e.domain);
  }
}
readMissing();
```

**结果**：输出 `NotFoundError 260 NSCocoaErrorDomain`。

## 文件大小

读和写都是整个文件一次完成：读的函数把整个文件读进内存，写入的内容也要先整个在内存里，所以能处理的文件大小受可用内存限制。

写入本身不占用界面所在的线程。占用的是 `new Blob([数据])` 这一步：它把数据复制一份，耗时和数据大小成正比。真机上**未验证**。

## 示例

下面的代码把一条笔记保存到 `documents` 目录，再读回来。文件读写不涉及界面，这段代码直接写在 `main.js` 顶层就能运行。

```js
const fs = application.fileSystem;

async function main() {
  // 1. 拼出目录和文件的路径
  const dir = fs.documents + '/notes';
  const path = dir + '/first.txt';

  // 2. 先建目录。已经存在时不报错
  await fs.makeDirectory(dir);

  // 3. 写入文本
  await fs.writeText(path, '你好 Nacre');

  // 4. 读回来
  const text = await fs.readText(path);
  console.log('内容:', text);

  // 5. 查询文件信息
  const info = await fs.stat(path);
  console.log('大小:', info.size, '字节');
}

main().catch((err) => {
  console.log('出错:', String(err));
});
```

**结果**

- 控制台输出 `内容: 你好 Nacre`。
- 接着输出 `大小: 12 字节`。两个汉字各占 3 字节，其余 6 个字符各占 1 字节。
- App 退出后再启动，`documents/notes/first.txt` 还在。

这段代码没有作为一个整体在模拟器运行过。其中用到的每个 API 都在验收用例里运行过。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, …)` | `fs.documents` |
| `NSSearchPathForDirectoriesInDomains(NSApplicationSupportDirectory, …)` | `fs.applicationSupport` |
| `NSSearchPathForDirectoriesInDomains(NSCachesDirectory, …)` | `fs.caches` |
| `NSTemporaryDirectory()` | `fs.temporary` |
| `[NSString stringWithContentsOfFile:encoding:error:]` | `await fs.readText(path)` |
| `[NSData dataWithContentsOfFile:options:error:]` | `await fs.readBytes(path)` |
| `[text writeToFile:atomically:encoding:error:]` | `await fs.writeText(path, text)` |
| `[data writeToFile:options:error:]` | `await fs.writeBytes(path, blob)` |
| `[fm fileExistsAtPath:]` | `await fs.exists(path)` |
| `[fm createDirectoryAtPath:withIntermediateDirectories:YES …]` | `await fs.makeDirectory(path)` |
| `[fm contentsOfDirectoryAtPath:error:]` | `await fs.readDirectory(path)` |
| `[fm attributesOfItemAtPath:error:]` | `await fs.stat(path)` |
| `[fm removeItemAtPath:error:]` | `await fs.remove(path)` |
| `[fm moveItemAtPath:toPath:error:]` | `await fs.move(from, to)` |
| `[fm copyItemAtPath:toPath:error:]` | `await fs.copy(from, to)` |
| `NSError **` | Promise 被拒绝，`err.code` 和 `err.domain` 是原值 |

## 参见

- [读写文件](../guides/files.md)：选哪个目录、存 JSON、缓存下载的图片、按错误类别处理
- [`application`](application.md)：`fileSystem` 是它的属性
- [`fetch`](fetch.md)：`Blob` 的说明在那一页；下载的内容可以直接写成文件
- [本地存储](storage.md)：设置和少量状态放那里
- [Keychain](keychain.md)：令牌和密码放那里
