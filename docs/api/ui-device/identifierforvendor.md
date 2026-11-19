---
type: reference
native: UIDevice.identifierForVendor
---

# `UIDevice`：`identifierForVendor` 属性

**`identifierForVendor`** 属性是同一个开发者的所有 App 在这台设备上共用的标识。它不是永久的设备编号。

## 值

字符串或 `null`。

- 只读。给它赋值抛 `TypeError`，原值不变。
- 字符串是 UUID，形如 `6F9619FF-8B86-D011-B42D-00C04FC964FF`，字母大写。
- 设备重启后、用户第一次解锁之前，系统还给不出这个值，读到 `null`。这种情况**未在模拟器验证**，来自 iOS 的定义。
- 没有变化通知：同一次运行里它不变。

这个值什么时候相同、什么时候变：

| 情况 | 值 |
| --- | --- |
| 同一次运行里读多次 | 相同 |
| App 重新启动、系统重启 | 相同。**未在模拟器验证**，来自 iOS 的定义 |
| 同一个开发者的另一个 App，在同一台设备上 | 相同。**未在模拟器验证** |
| 这个开发者的 App 全部卸载后再安装 | 变了。**未在模拟器验证** |
| 换一台设备 | 不同 |

它适合统计「有多少台设备」、给未登录的设备一个临时编号这类允许偶尔变化的用途。登录状态、用户身份应该来自服务器发的令牌。

## 示例

```js
const id = UIDevice.currentDevice.identifierForVendor;
if (id !== null) {
  console.log(id);
}
```

**结果**：输出一个 UUID，形如 `6F9619FF-8B86-D011-B42D-00C04FC964FF`。同一次运行里读多次，值相同。

## 对应的 iOS API

`UIDevice.identifierForVendor`。ObjC 里是 `NSUUID`，这里直接给它的 `UUIDString`。

## 参见

- [给这台设备一个标识](../../guides/device-info.md#给这台设备一个标识)：自己生成并保存标识
- [`crypto`](../crypto.md)：`randomUUID()`
