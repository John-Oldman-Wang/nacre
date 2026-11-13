---
type: reference
status: partial
---

# 文件读写

**`application.fileSystem`** 读写 App 自己目录里的文件。它提供四个目录的路径，以及读文件、写文件、建目录、列目录、删除、移动、复制、查询文件信息的方法。

`application.fileSystem` 在整个 App 里只有一个，任何时候都能用，包括脚本顶层。它的类是 `FileSystem`，这个类不能用 `new` 创建。

所有读写方法都返回 Promise。读写在后台进行，期间界面照常响应，定时器照常执行。出错时 Promise 被拒绝（reject），不会返回 `false` 或 `null`。

## 三种存储怎么选

| 要保存的数据 | 用哪个 | 原因 |
| --- | --- | --- |
| 用户设置、开关、上次看到哪 | [`application.storage`](storage.md) | 同步读写，值可以直接是数字、布尔、数组、对象 |
| 登录令牌、密码、密钥 | [`application.keychain`](keychain.md) | 由系统加密保存 |
| 下载的文件、图片缓存、大量的业务数据、二进制内容 | `application.fileSystem`（本页） | 按文件保存，可以选择放进哪个目录 |

## 四个目录

iOS 给每个 App 一块独立的存储空间，里面有几个用途固定的目录。`application.fileSystem` 用四个只读属性给出它们的路径：

| 属性 | 放什么 | 系统会不会删 | 是否进入备份 |
| --- | --- | --- | --- |
| `documents` | 用户创建的内容：笔记、导出的文件 | 不会 | 是 |
| `applicationSupport` | App 自己的数据：数据库、状态文件 | 不会 | 是 |
| `caches` | 能重新得到的内容：下载的图片、接口返回的缓存 | 设备存储空间不足时会删 | 否 |
| `temporary` | 用完就不要的临时文件 | 随时可能删 | 否 |

「系统会不会删」和「是否进入备份」两列来自 iOS 的定义，**未在模拟器验证**。

四个属性的值都是绝对路径字符串，以 `/` 开头，末尾不带 `/`，互不相同。

用户卸载 App 时，四个目录里的文件全部随 App 删除（来自 iOS 的定义，**未在模拟器验证**）。App 进程结束后重新启动，`documents` 里的文件还在：验收里第一次运行写一个文件，第二次启动读到了它。

`applicationSupport` 目录在 App 第一次运行时是否已经存在，**未在模拟器验证**。往里面写文件之前先调一次 `makeDirectory(fs.applicationSupport)`，目录已经存在时这个调用不报错。

## 路径怎么写

路径是绝对路径字符串。用目录属性加上 `/` 和文件名拼出来：

```js
const fs = application.fileSystem;
const path = fs.documents + '/notes/今天.txt';
console.log(path.startsWith('/'));
```

**结果**：输出 `true`。`path` 是 `documents` 目录下 `notes` 子目录里 `今天.txt` 的绝对路径。文件名和目录名可以用中文。

运行时没有拼接路径的方法。目录属性末尾不带 `/`，拼的时候要自己写。

路径参数必须是非空字符串。传别的类型或空字符串时，方法**当场抛** `TypeError`，不返回 Promise。

以下情况**未在模拟器验证**：

- 传相对路径（不以 `/` 开头）时读写的是哪里。
- 读写四个目录之外的路径会怎样。
- 四个目录的绝对路径在 App 更新或重装之后是否变化。保存文件位置时，只保存目录属性后面的那一段（如 `'/notes/今天.txt'`），每次使用时再和目录属性拼起来，这样路径变化也不受影响。

## 文件或目录不存在时

| 操作 | 结果 |
| --- | --- |
| 读不存在的文件（`readText`、`readBytes`） | Promise 被拒绝，`name` 是 `'NotFoundError'` |
| 查询不存在的路径（`stat`） | Promise 被拒绝，`name` 是 `'NotFoundError'` |
| 列不存在的目录（`readDirectory`） | Promise 被拒绝，`name` 是 `'NotFoundError'` |
| 判断是否存在（`exists`） | 得到 `false`，不拒绝 |
| 删除不存在的路径（`remove`） | Promise 被拒绝。`name` 的取值**未在模拟器验证** |
| 往不存在的目录里写文件（`writeText`、`writeBytes`） | 不会自动创建目录。Promise 被拒绝的 `name` 取值**未在模拟器验证** |

写文件之前先用 `makeDirectory` 建好它所在的目录。`makeDirectory` 会连同中间各层一起建，目录已经存在时不报错，所以每次写之前调用一次是安全的。

## 写入是整体替换

`writeText` 和 `writeBytes` 用新内容替换整个文件。文件不存在时创建，已经存在时覆盖。没有追加写入：要在文件末尾加内容，先读出来，拼好，再整个写回去。

写入先在旁边写好一个完整的新文件，再用它替换原文件。写到一半时 App 被结束，原文件保持原来的内容（来自 iOS 的定义，**未在模拟器验证**）。

Promise 完成时文件已经写好，紧接着读能读到新内容。

多个操作同时进行时，它们完成的先后不固定。对同一个文件连续发起两次写入而不等待第一次完成，最后留下的是哪一次的内容不确定（读代码得出，**未在模拟器验证**）。对同一个文件的操作要用 `await` 一个一个做。

## 文件大小

读和写都是整个文件一次完成：`readText` 和 `readBytes` 把整个文件读进内存，`writeText` 和 `writeBytes` 写入的内容也要先整个在内存里。没有分段读写，能处理的文件大小受可用内存限制。

实测在模拟器上写一个 4 MB 的文件：

| 步骤 | 耗时 | 是否占用界面所在的线程 |
| --- | --- | --- |
| `new Blob([数据])`，把数据包成 `Blob` | 1.2 ms | 是 |
| 调用 `writeBytes` 到它返回 Promise | 低于 1 ms | 是 |
| 从调用到 Promise 完成 | 8.0 ms | 否 |

写入本身不占用界面所在的线程。占用的是 `new Blob([数据])` 这一步，它把数据复制一份，耗时和数据大小成正比。真机上的耗时**未验证**。

## 出错时得到什么

操作失败时 Promise 被拒绝，拒绝的值是一个 `Error` 对象，多带两个属性：

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

## 推荐的做法

**按「丢了能不能重新得到」选目录。** 能重新下载或重新算出来的放 `caches`，系统在存储空间不足时可以清掉它们，App 占用的空间不会只增不减。不能重新得到的放 `documents`（用户创建的）或 `applicationSupport`（App 自己的）。

**读 `caches` 里的文件之前先判断它还在不在。** 系统可能已经把它删了。读缓存的代码要有「不在就重新下载」这条路径。

**大量的结构化数据存成一个 JSON 文件，不放进 [`application.storage`](storage.md)。** `application.storage` 用来放设置。成百上千条记录用 `writeText(path, JSON.stringify(data))` 存成文件，放在 `applicationSupport`。

**对同一个文件的操作逐个 `await`。** 原因见[写入是整体替换](#写入是整体替换)。

**令牌和密码不要写进文件。** 用 [`application.keychain`](keychain.md)。

## 完整例子

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

## 常见用法

以下例子都写在一个 `async` 函数里，并沿用上面的 `fs`。

### 保存和读取一份 JSON 数据

```js
const dataPath = fs.applicationSupport + '/orders.json';
await fs.makeDirectory(fs.applicationSupport);

await fs.writeText(dataPath, JSON.stringify([{ id: 1, total: 99.5 }]));

/** @type {{ id: number, total: number }[]} */
const orders = JSON.parse(await fs.readText(dataPath));
console.log(orders.length, orders[0]?.total);
```

**结果**：输出 `1 99.5`。

### 文件不存在时用默认内容

```js
const settingsPath = fs.documents + '/settings.json';

let settingsText = '{}';
if (await fs.exists(settingsPath)) {
  settingsText = await fs.readText(settingsPath);
}
console.log(settingsText);
```

**结果**：文件存在时输出它的内容，不存在时输出 `{}`。

### 把下载的图片存进缓存目录

[`fetch`](fetch.md) 取回的内容用 `blob()` 读成 `Blob`，直接交给 `writeBytes`。

```js
const cacheDir = fs.caches + '/images';
const imagePath = cacheDir + '/avatar.png';

if (!(await fs.exists(imagePath))) {
  const response = await fetch('https://httpbin.org/image/png');
  const blob = await response.blob();
  await fs.makeDirectory(cacheDir);
  await fs.writeBytes(imagePath, blob);
}
const imageInfo = await fs.stat(imagePath);
console.log('缓存的图片:', imageInfo.size, '字节');
```

**结果**：第一次运行时下载图片并保存，之后运行时文件已经在，不再下载。两种情况都输出图片的字节数。系统清掉缓存目录之后，下一次运行会重新下载。

这段代码**未在模拟器验证**。

### 写入和读取二进制数据

`writeBytes` 的第二个参数是 [`Blob`](fetch.md)。手里是 `Uint8Array` 或 `ArrayBuffer` 时，先用 `new Blob([...])` 包一层。`readBytes` 得到 `ArrayBuffer`。

```js
const binPath = fs.temporary + '/bytes.bin';
await fs.writeBytes(binPath, new Blob([new Uint8Array([0, 1, 2, 253, 254, 255])]));

const bytes = new Uint8Array(await fs.readBytes(binPath));
console.log(bytes.length, bytes.join(','));
```

**结果**：输出 `6 0,1,2,253,254,255`。

### 列出目录里的内容

```js
const listDir = fs.documents + '/list-demo';
await fs.makeDirectory(listDir + '/sub');
await fs.writeText(listDir + '/a.txt', 'a');

const names = await fs.readDirectory(listDir);
console.log(names.slice().sort().join(','));
```

**结果**：输出 `a.txt,sub`。

得到的是名字，不是完整路径。只列这一层，不包含子目录里面的内容。名字按什么顺序排列**未在模拟器验证**，需要固定的顺序时自己排序。

### 复制、移动、删除

```js
const src = fs.documents + '/src.txt';
await fs.writeText(src, '内容');

await fs.copy(src, fs.documents + '/copy.txt');
await fs.move(fs.documents + '/copy.txt', fs.documents + '/moved.txt');
console.log(await fs.exists(fs.documents + '/copy.txt'));

await fs.remove(src);
await fs.remove(fs.documents + '/moved.txt');
```

**结果**：输出 `false`。`copy.txt` 被移走之后原位置不再有文件。最后两个文件都被删除。

`remove` 的参数是目录时，目录连同里面的所有内容一起删除。

### 按错误类别分别处理

```js
try {
  await fs.readText(fs.documents + '/可能没有.txt');
} catch (err) {
  const e = /** @type {FileSystemError} */ (err);
  if (e.name === 'NotFoundError') {
    console.log('文件不存在');
  } else {
    console.log('其他错误:', e.name, e.code);
  }
}
```

**结果**：文件不存在时输出 `文件不存在`。

## 成员说明

### 属性

| 属性 | 类型 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `documents` | `string` | 是 | 否 | 用户内容目录的绝对路径 |
| `applicationSupport` | `string` | 是 | 否 | App 数据目录的绝对路径 |
| `caches` | `string` | 是 | 否 | 缓存目录的绝对路径 |
| `temporary` | `string` | 是 | 否 | 临时目录的绝对路径 |

四个值在 App 运行期间不变，所以没有变化通知。各目录的区别见[四个目录](#四个目录)。

### 方法

所有方法的路径参数必须是非空字符串。

| 方法 | Promise 完成时的值 | 说明 |
| --- | --- | --- |
| `readText(path)` | `string` | 按 UTF-8 读出整个文件的文本。文件内容不是合法的 UTF-8 时的结果**未在模拟器验证** |
| `readBytes(path)` | `ArrayBuffer` | 读出整个文件的字节 |
| `writeText(path, text)` | 无 | 按 UTF-8 写入文本，替换整个文件 |
| `writeBytes(path, blob)` | 无 | 写入 `Blob` 里的字节，替换整个文件 |
| `exists(path)` | `boolean` | 路径上有文件或目录时为 `true` |
| `makeDirectory(path)` | 无 | 建目录，中间各层一起建。已经存在时不报错 |
| `readDirectory(path)` | `string[]` | 目录里各项的名字，只含这一层 |
| `stat(path)` | `{ size, isDirectory, modified }` | 文件信息，见下表 |
| `remove(path)` | 无 | 删除文件，或删除目录连同里面的所有内容 |
| `move(from, to)` | 无 | 移动或改名。`to` 是完整的目标路径，包含文件名。目标位置已经有文件时的结果**未在模拟器验证** |
| `copy(from, to)` | 无 | 复制。`to` 是完整的目标路径，包含文件名。目标位置已经有文件时的结果**未在模拟器验证** |

`stat` 得到的对象：

| 属性 | 类型 | 含义 |
| --- | --- | --- |
| `size` | `number` | 文件的字节数。路径是目录时这个值的含义**未在模拟器验证** |
| `isDirectory` | `boolean` | 是目录时为 `true`，是文件时为 `false` |
| `modified` | `number` | 最后修改时间，毫秒时间戳。用 `new Date(info.modified)` 得到日期 |

参数类型不对时，方法当场抛 `TypeError`，不返回 Promise：

| 情况 | 报错信息 |
| --- | --- |
| 路径不是字符串，或是空字符串 | `<方法名>: path must be a non-empty string`，如 `readText: path must be a non-empty string` |
| `writeText` 的第二个参数不是字符串 | `writeText: the second argument must be a string` |
| `writeBytes` 的第二个参数不是 `Blob` | `writeBytes: the second argument must be a Blob` |

操作本身失败时 Promise 被拒绝，见[出错时得到什么](#出错时得到什么)。

用 `new FileSystem()` 创建时抛 `TypeError`，信息是 `Illegal constructor: FileSystem is created by the runtime, not by new`。

### 事件

没有事件。文件被修改时没有通知，见[还不能做的](#还不能做的)。

## 与 iOS 原生写法的对照

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

## 还不能做的

| 想做的事 | 对应的原生能力 | 现在怎么办 |
| --- | --- | --- |
| 分段读写大文件 | `NSFileHandle`、`NSInputStream` | 整个读进内存 |
| 在文件末尾追加内容 | `NSFileHandle` | 读出来拼好再整个写回 |
| 文件被修改时得到通知 | `DispatchSource` | 没有替代办法 |
| 设置文件在设备锁定时的加密等级 | `NSFileProtectionKey` | 没有替代办法 |
| 把某个文件排除在备份之外 | `NSURLIsExcludedFromBackupKey` | 放进 `caches` |
| 读写 iCloud 里的文件 | `NSFileCoordinator` | 没有替代办法 |
| 符号链接、权限位 | `NSFileManager` 的对应方法 | 没有替代办法 |
| 让用户从「文件」App 里选文件 | `UIDocumentPickerViewController` | 没有替代办法 |

## 参见

- [`application`](application.md)：`fileSystem` 是它的属性
- [`fetch`](fetch.md)：`Blob` 的说明在那一页；下载的内容可以直接写成文件
- [本地存储](storage.md)：设置和少量状态放那里
- [Keychain](keychain.md)：令牌和密码放那里
- [实现原理](../internals/filesystem.md)：这一页各项耗时的实测记录
