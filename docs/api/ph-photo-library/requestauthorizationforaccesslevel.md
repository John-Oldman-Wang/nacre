---
type: reference
native: "+[PHPhotoLibrary requestAuthorizationForAccessLevel:handler:]"
---

# `PHPhotoLibrary.requestAuthorizationForAccessLevel()` 静态方法

**`PHPhotoLibrary.requestAuthorizationForAccessLevel()`** 静态方法申请相册的权限。

## 语法

```
PHPhotoLibrary.requestAuthorizationForAccessLevel(accessLevel)
```

### 参数

**`accessLevel`**

只有一个取值 `'addOnly'`：往相册里添加的权限。

### 返回值

`Promise`，兑现成授权状态，取值见[授权状态](../ph-photo-library.md#授权状态)。

- 没问过用户时，系统弹提示框，用户点了之后兑现。提示框上的话是 `nacre.config.json` 里写的 `NSPhotoLibraryAddUsageDescription`。
- 问过了不再弹，直接兑现成现在的状态。

工程里没写 `NSPhotoLibraryAddUsageDescription` 时 Promise 被拒绝，`name` 是 `InvalidStateError`。用 CLI 生成的工程不会出现这种情况，生成时就拦住了。

提示框和兑现的结果**未在模拟器验证**。

### 异常

**`TypeError`**

`accessLevel` 写错，同步抛出，不是拒绝 Promise。报错和 [`authorizationStatusForAccessLevel()`](authorizationstatusforaccesslevel.md) 相同。

## 说明

存图之前不用先调它：[`performChanges()`](performchanges.md) 在没问过用户时自己会先申请。

## 示例

```js
const status = await PHPhotoLibrary.requestAuthorizationForAccessLevel('addOnly');
console.log(status);
```

**效果**（**未在模拟器验证**）：第一次调用时弹提示框。点「允许」输出 `authorized`，点「不允许」输出 `denied`。之后再调不弹，直接输出现在的状态。

## 对应的 iOS API

`+[PHPhotoLibrary requestAuthorizationForAccessLevel:handler:]`。回调换成了 Promise。

## 参见

- [`authorizationStatusForAccessLevel()`](authorizationstatusforaccesslevel.md)：只读状态，不弹提示框
- [错误](../ph-photo-library.md#错误)
- 这个类属于 `@nacrejs/photos` 包，装法见[要先安装](../photos.md#要先安装)
