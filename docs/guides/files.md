# 读写文件

这一篇讲怎么用 [`application.fileSystem`](../api/filesystem.md) 保存和读取文件：选目录、存 JSON、缓存下载的内容、处理出错。每个函数的细节在 [`application.fileSystem`](../api/filesystem.md) 的参考页。

## 三种存储怎么选

| 要保存的数据 | 用哪个 | 原因 |
| --- | --- | --- |
| 用户设置、开关、上次看到哪 | [`application.storage`](../api/storage.md) | 同步读写，值可以直接是数字、布尔、数组、对象 |
| 登录令牌、密码、密钥 | [`application.keychain`](../api/keychain.md)（要先装 `@nacrejs/keychain`） | 由系统加密保存 |
| 下载的文件、图片缓存、大量的业务数据、二进制内容 | [`application.fileSystem`](../api/filesystem.md) | 按文件保存，可以选择放进哪个目录 |

## 推荐的做法

- **按「丢了能不能重新得到」选目录。** 能重新下载或重新算出来的放 `caches`，系统在存储空间不足时可以清掉它们，App 占用的空间不会只增不减。不能重新得到的放 `documents`（用户创建的）或 `applicationSupport`（App 自己的）。
- **读 `caches` 里的文件之前先判断它还在不在。** 系统可能已经把它删了。读缓存的代码要有「不在就重新下载」这条路径。
- **大量的结构化数据存成一个 JSON 文件，不放进 [`application.storage`](../api/storage.md)。** `application.storage` 用来放设置。成百上千条记录用 `writeText(path, JSON.stringify(data))` 存成文件，放在 `applicationSupport`。
- **写文件之前先 `makeDirectory()`。** 写文件不会自动建所在的目录。`makeDirectory()` 会连同中间各层一起建，目录已经存在时不报错。
- **对同一个文件的操作逐个 `await`。** 多个操作同时进行时，它们完成的先后不固定。对同一个文件连续发起两次写入而不等待第一次完成，最后留下的是哪一次的内容不确定（读代码得出，**未在模拟器验证**）。
- **令牌和密码不要写进文件。** 用 [`application.keychain`](../api/keychain.md)。

## 第一个例子

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

以下各节的代码都写在一个 `async` 函数里，并沿用上面的 `fs`。

## 选哪个目录

iOS 给每个 App 一块独立的存储空间，里面有几个用途固定的目录。`application.fileSystem` 用四个只读属性给出它们的路径：

| 属性 | 放什么 | 系统会不会删 | 是否进入备份 |
| --- | --- | --- | --- |
| [`documents`](../api/filesystem/documents.md) | 用户创建的内容：笔记、导出的文件 | 不会 | 是 |
| [`applicationSupport`](../api/filesystem/applicationsupport.md) | App 自己的数据：数据库、状态文件 | 不会 | 是 |
| [`caches`](../api/filesystem/caches.md) | 能重新得到的内容：下载的图片、接口返回的缓存 | 设备存储空间不足时会删 | 否 |
| [`temporary`](../api/filesystem/temporary.md) | 用完就不要的临时文件 | 随时可能删 | 否 |

「系统会不会删」和「是否进入备份」两列来自 iOS 的定义，**未在模拟器验证**。

`applicationSupport` 目录在 App 第一次运行时是否已经存在，**未在模拟器验证**。往里面写文件之前先调一次 `makeDirectory(fs.applicationSupport)`。

## 保存和读取一份 JSON 数据

```js
async function saveOrders() {
  const dataPath = fs.applicationSupport + '/orders.json';
  await fs.makeDirectory(fs.applicationSupport);

  await fs.writeText(dataPath, JSON.stringify([{ id: 1, total: 99.5 }]));

  /** @type {{ id: number, total: number }[]} */
  const orders = JSON.parse(await fs.readText(dataPath));
  console.log(orders.length, orders[0]?.total);
}
```

**结果**：输出 `1 99.5`。

## 文件不存在时用默认内容

```js
async function loadSettings() {
  const settingsPath = fs.documents + '/settings.json';

  let settingsText = '{}';
  if (await fs.exists(settingsPath)) {
    settingsText = await fs.readText(settingsPath);
  }
  console.log(settingsText);
}
```

**结果**：文件存在时输出它的内容，不存在时输出 `{}`。

各操作遇到不存在的文件或目录时的结果：

| 操作 | 结果 |
| --- | --- |
| 读不存在的文件（`readText()`、`readBytes()`） | Promise 被拒绝，`name` 是 `'NotFoundError'` |
| 查询不存在的路径（`stat()`） | Promise 被拒绝，`name` 是 `'NotFoundError'` |
| 列不存在的目录（`readDirectory()`） | Promise 被拒绝，`name` 是 `'NotFoundError'` |
| 判断是否存在（`exists()`） | 得到 `false`，不拒绝 |
| 删除不存在的路径（`remove()`） | Promise 被拒绝。`name` 的取值**未在模拟器验证** |
| 往不存在的目录里写文件（`writeText()`、`writeBytes()`） | 不会自动创建目录。Promise 被拒绝的 `name` 取值**未在模拟器验证** |

## 把下载的图片存进缓存目录

[`fetch`](../api/fetch.md) 取回的内容用 `blob()` 读成 `Blob`，直接交给 [`writeBytes()`](../api/filesystem/writebytes.md)。

```js
async function cacheAvatar() {
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
}
```

**结果**：第一次运行时下载图片并保存，之后运行时文件已经在，不再下载。两种情况都输出图片的字节数。系统清掉缓存目录之后，下一次运行会重新下载。

这段代码**未在模拟器验证**。

## 写入和读取二进制数据

`writeBytes()` 的第二个参数是 [`Blob`](../api/fetch.md)。手里是 `Uint8Array` 或 `ArrayBuffer` 时，先用 `new Blob([...])` 包一层。`readBytes()` 得到 `ArrayBuffer`。

```js
async function roundTripBytes() {
  const binPath = fs.temporary + '/bytes.bin';
  await fs.writeBytes(binPath, new Blob([new Uint8Array([0, 1, 2, 253, 254, 255])]));

  const bytes = new Uint8Array(await fs.readBytes(binPath));
  console.log(bytes.length, bytes.join(','));
}
```

**结果**：输出 `6 0,1,2,253,254,255`。

## 在文件末尾加内容

写入是整体替换，没有追加写入。先读出来，拼好，再整个写回去。

```js
async function appendLine() {
  const logPath = fs.documents + '/log.txt';
  const old = (await fs.exists(logPath)) ? await fs.readText(logPath) : '';
  await fs.writeText(logPath, old + '新的一行\n');
}
```

**结果**：每调用一次，`log.txt` 末尾多一行 `新的一行`。**未在模拟器验证。**

## 列出目录里的内容

```js
async function listDemo() {
  const listDir = fs.documents + '/list-demo';
  await fs.makeDirectory(listDir + '/sub');
  await fs.writeText(listDir + '/a.txt', 'a');

  const names = await fs.readDirectory(listDir);
  console.log(names.slice().sort().join(','));
}
```

**结果**：输出 `a.txt,sub`。

得到的是名字，不是完整路径。只列这一层。名字按什么顺序排列**未在模拟器验证**，需要固定的顺序时自己排序。

## 复制、移动、删除

```js
async function copyMoveRemove() {
  const src = fs.documents + '/src.txt';
  await fs.writeText(src, '内容');

  await fs.copy(src, fs.documents + '/copy.txt');
  await fs.move(fs.documents + '/copy.txt', fs.documents + '/moved.txt');
  console.log(await fs.exists(fs.documents + '/copy.txt'));

  await fs.remove(src);
  await fs.remove(fs.documents + '/moved.txt');
}
```

**结果**：输出 `false`。`copy.txt` 被移走之后原位置不再有文件。最后两个文件都被删除。

`remove()` 的参数是目录时，目录连同里面的所有内容一起删除。

## 按错误类别分别处理

```js
async function readMaybe() {
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
}
```

**结果**：文件不存在时输出 `文件不存在`。

`name` 的全部取值见[出错时得到什么](../api/filesystem.md#出错时得到什么)。不要用 `message` 做判断，它随系统语言变化。

## 参见

- [`application.fileSystem`](../api/filesystem.md)：全部属性和函数
- [保存用户设置](save-settings.md)：设置和少量状态放 `application.storage`
- [`fetch`](../api/fetch.md)：`Blob` 的说明在那一页
