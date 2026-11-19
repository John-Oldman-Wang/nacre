---
type: reference
native: ASIdentifierManager.advertisingIdentifier
---

# `ASIdentifierManager`：`advertisingIdentifier` 属性

**`advertisingIdentifier`** 属性是这台设备的广告标识：UUID 的文字形式。

## 值

字符串，36 个字符，字母大写，形如 `'6D92078A-8246-4BA4-AE5B-76104861E7DC'`。

- 只读。给它赋值抛 `TypeError`。
- 没有可用的标识时是 `'00000000-0000-0000-0000-000000000000'`，不是 `null`。
- 每次读都是当时的值。

读到全零的情况：

- 在模拟器上运行（模拟器上总是全零，和授权状态无关）
- App 还没有申请过授权
- 用户拒绝了
- 设备上的配置限制了广告标识

前两种在模拟器上验过，后两种来自 Apple 的文档，**未在模拟器验证**。

### 怎么得知它变了

这个值变化时没有事件。它跟着[授权状态](../app-tracking-transparency/trackingauthorizationstatus.md)走，在授权状态可能变了的时候重新读，比如 App 回到活动状态时。用户收回授权之后再读，得到的是全零，所以不要把读到的值长期保存下来当成一直有效。

## 示例

```js
const ZERO = '00000000-0000-0000-0000-000000000000';

/** @returns {string | null} */
function advertisingId() {
  const id = ASIdentifierManager.sharedManager().advertisingIdentifier;
  return id === ZERO ? null : id;
}

console.log(advertisingId());
```

**效果**：用户同意了跟踪并且在真机上运行时，输出一个 UUID。其余情况输出 `null`。真机上的输出**未验证**。

## 对应的 iOS API

`ASIdentifierManager.advertisingIdentifier.UUIDString`。原生的值是 `NSUUID`，这里直接给它的字符串形式。

## 参见

- [`ATTrackingManager.trackingAuthorizationStatus`](../app-tracking-transparency/trackingauthorizationstatus.md)：授权状态
- [取广告标识，没有就不用](../../guides/tracking-authorization.md#取广告标识没有就不用)
- [安装 `@nacrejs/app-tracking-transparency`](../app-tracking-transparency.md#先装上)
