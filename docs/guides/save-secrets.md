# 保存登录令牌

这一篇讲怎么用 [`application.keychain`](../api/keychain.md) 保存登录令牌、密码和密钥：选哪种存储、选哪个访问级别、启动时取出、退出登录时删除。每个函数的细节在 [`application.keychain`](../api/keychain.md) 的参考页。

`application.keychain` 要先装 `@nacrejs/keychain` 才有，装法见[先装上](../api/keychain.md#先装上)。

## 推荐的做法

**三种存储按数据选：**

| 要保存的数据 | 用哪个 | 原因 |
| --- | --- | --- |
| 用户设置、开关、上次看到哪 | [`application.storage`](../api/storage.md) | 同步读写，值可以直接是数字、布尔、数组、对象 |
| 登录令牌、密码、密钥 | `application.keychain` | 由系统加密保存，可以规定设备锁定时能否读取、换新手机后是否还在 |
| 下载的文件、图片缓存、大量的业务数据 | [`application.fileSystem`](../api/filesystem.md) | 按文件保存，可以选择放进哪个目录 |

钥匙串只放需要保密的小数据。设置和业务数据放在另外两处：它们能同步读取或按文件管理，钥匙串不能。

**登录令牌用默认的访问级别。** 默认值 `'whenUnlockedThisDeviceOnly'` 只在设备解锁时可读，不会随备份到别的设备上。代价是用户换手机后要重新登录。

**App 在后台也要读的令牌用 `'afterFirstUnlockThisDeviceOnly'`。** 比如收到推送后在后台刷新数据，这时设备可能处于锁定状态。默认级别在锁屏时读不到。

**希望换手机后免登录时用 `'whenUnlocked'` 或 `'afterFirstUnlock'`。** 代价是令牌会进入设备的备份，并出现在恢复了这份备份的设备上。

**访问级别在第一次写入前想好。** 之后改它要先删除再重写。各取值的效果见[访问级别](../api/keychain.md#访问级别)。

**结构化的数据先转成 JSON 文本再存。** 值只能是字符串或字节。

**退出登录时删除令牌。** 用 [`remove()`](../api/keychain/remove.md) 删一个，或者用 [`clear()`](../api/keychain/clear.md) 删掉 App 的全部条目。

## 第一个例子

下面的代码保存一个登录令牌，读回来，再删除。钥匙串不涉及界面，这段代码直接写在 `main.js` 顶层就能运行。

```js
/// <reference types="@nacrejs/keychain" />
const kc = application.keychain;

async function main() {
  // 1. 读令牌。没有时得到 null
  const saved = await kc.get('token');
  console.log('已有的令牌:', saved);

  // 2. 保存令牌。不写 accessible 时用默认的访问级别
  await kc.set('token', 'abc-123');

  // 3. 读回来
  console.log('读到:', await kc.get('token'));

  // 4. 退出登录时删除
  await kc.remove('token');
  console.log('删除后:', await kc.has('token'));
}

main().catch((err) => {
  console.log('出错:', String(err));
});
```

**结果**

- 控制台输出 `已有的令牌: null`。
- 接着输出 `读到: abc-123`。
- 最后输出 `删除后: false`。

这段代码没有作为一个整体在模拟器运行过。其中用到的每个 API 都在验收用例里运行过。

下面各节沿用这里的 `kc`，代码写在 `async` 函数里。

## 启动时取出令牌

```js
async function restoreLogin() {
  const token = await kc.get('token');
  if (token === null) {
    console.log('没有登录');
  } else {
    console.log('已登录，令牌:', token);
  }
}
```

**结果**：之前保存过 `token` 时输出 `已登录，令牌: …`。App 进程结束后重新启动仍然读得到。

## 后台也要读的令牌

```js
async function saveRefreshToken() {
  await kc.set('refreshToken', 'r-456', { accessible: 'afterFirstUnlockThisDeviceOnly' });
}
```

**结果**：条目被保存。设备开机后用户解锁过一次，之后锁屏时也能读到它（**未在模拟器验证**）。

## 修改一个条目的访问级别

```js
async function changeAccessible() {
  const current = await kc.get('refreshToken');
  if (current !== null) {
    await kc.remove('refreshToken');
    await kc.set('refreshToken', current, { accessible: 'afterFirstUnlock' });
  }
}
```

**结果**：条目被删除后按新的访问级别重新写入，值不变。

## 保存一组数据

```js
async function saveAccount() {
  const account = { userId: 42, token: 'abc-123', expires: 1800000000000 };
  await kc.set('account', JSON.stringify(account));

  const text = await kc.get('account');
  if (text !== null) {
    /** @type {{ userId: number, token: string, expires: number }} */
    const restored = JSON.parse(text);
    console.log(restored.userId, restored.token);
  }
}
```

**结果**：输出 `42 abc-123`。

## 保存二进制密钥

[`setBytes()`](../api/keychain/setbytes.md) 的第二个参数是 `Blob`。[`getBytes()`](../api/keychain/getbytes.md) 得到 `ArrayBuffer`，没有这个键时得到 `null`。

```js
async function saveSecret() {
  const secret = crypto.getRandomValues(new Uint8Array(32));
  await kc.setBytes('secret', new Blob([secret]));

  const buffer = await kc.getBytes('secret');
  if (buffer !== null) {
    console.log(new Uint8Array(buffer).length);
  }
}
```

**结果**：输出 `32`。读回来的字节和写入的相同。

用 `setBytes` 存的条目要用 `getBytes` 读。用 `get` 读它时，字节不是合法的 UTF-8 文本就得到 `null`，和「没有这个键」分不开（读代码得出，**未在模拟器验证**）。

## 退出登录时清空

```js
async function logoutAll() {
  console.log((await kc.keys()).join(','));
  await kc.clear();
  console.log((await kc.keys()).length);
}
```

**结果**：先输出 App 存过的全部键，用逗号分隔。清空之后输出 `0`。

`keys()` 和 `clear()` 只涉及这个 App 自己的条目。

## 处理写入失败

```js
async function savePin() {
  try {
    await kc.set('pin', '1234', { accessible: 'whenPasscodeSetThisDeviceOnly' });
  } catch (err) {
    const e = /** @type {KeychainError} */ (err);
    console.log('写入失败:', e.name, e.code);
  }
}
```

**结果**：设备设置了锁屏密码时写入成功，不输出。没设置时 Promise 被拒绝，输出错误的类别和错误码（**未在模拟器验证**：验收用的模拟器上这个级别写入成功）。各种 `name` 的含义见[出错时得到什么](../api/keychain.md#出错时得到什么)。

## 参见

- [`application.keychain`](../api/keychain.md)
- [`application.storage`](../api/storage.md)、[`application.fileSystem`](../api/filesystem.md)
- [`crypto`](../api/crypto.md)
