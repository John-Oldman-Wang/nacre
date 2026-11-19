---
type: reference
native: LAContext.biometryType
---

# `LAContext`：`biometryType` 属性

**`biometryType`** 属性表示设备支持哪一种生物认证。它只说明设备有哪一种，不说明现在能不能用；现在能不能用，问 [`canEvaluatePolicy()`](canevaluatepolicy.md)。

## 值

字符串，下面四个之一：

| 取值 | 含义 |
| --- | --- |
| `'none'` | 设备不支持生物认证 |
| `'faceID'` | 设备支持面容 ID |
| `'touchID'` | 设备支持触控 ID |
| `'opticID'` | 设备支持 Optic ID（识别虹膜）。只出现在 Apple Vision Pro 上，iPhone 上不会读到 |

- 只读。给它赋值抛 `TypeError`。
- 没有默认值，取决于设备。
- **先调一次 [`canEvaluatePolicy()`](canevaluatepolicy.md) 才读得到。** 调之前读，得到的是 `'none'`。调过一次之后，不管它返回 `true` 还是 `false`，读到的都是设备支持的那一种。**未在模拟器验证。**
- App 运行期间不变，所以没有变化通知。
- 调过 [`invalidate()`](invalidate.md) 的对象照样读得到。

## 示例

```js
const context = new LAContext();
context.canEvaluatePolicy('deviceOwnerAuthentication');
const name = context.biometryType === 'faceID' ? '面容 ID'
  : context.biometryType === 'touchID' ? '触控 ID'
  : '锁屏密码';
console.log('用' + name + '确认');
```

**效果**：先调 `canEvaluatePolicy()`，再读 `biometryType`。有面容 ID 的设备输出 `用面容 ID确认`，有触控 ID 的设备输出 `用触控 ID确认`，都没有的输出 `用锁屏密码确认`。各设备上的取值**未在模拟器验证**。

## 对应的 iOS API

`LAContext.biometryType`。`LABiometryTypeFaceID` 写成 `'faceID'`，其余同理。

## 参见

- [`canEvaluatePolicy()`](canevaluatepolicy.md)：现在能不能用生物认证
- [安装 `@nacrejs/local-authentication`](../la-context.md#先装上)
