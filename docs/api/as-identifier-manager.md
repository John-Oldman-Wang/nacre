---
type: reference
native: ASIdentifierManager
status: partial
---

# `ASIdentifierManager`

**`ASIdentifierManager`** 给出这台设备的广告标识。

「广告标识」是系统给设备的一个 UUID。同一台设备上所有 App 读到的值相同，广告平台用它判断两次广告展示是不是发生在同一台设备上。用户没有同意跟踪时，App 读到的是全零的值 `'00000000-0000-0000-0000-000000000000'`。用户是否同意跟踪，由 [`ATTrackingManager`](app-tracking-transparency.md) 申请和读取。

要先装 `@nacrejs/app-tracking-transparency`，装法见 [`ATTrackingManager`](app-tracking-transparency.md#先装上)。能力包是什么，见[核心和能力包](capabilities.md)。

**继承关系**：`EventTarget` → `NSObject` → `ASIdentifierManager`

## 构造函数

不能用 `new` 创建。实例只有系统提供的一个，从 [`ASIdentifierManager.sharedManager()`](as-identifier-manager/sharedmanager.md) 取。

`new ASIdentifierManager()` 抛 `TypeError: Illegal constructor: ASIdentifierManager is created by the runtime, not by new`。

## 静态方法

[`ASIdentifierManager.sharedManager()`](as-identifier-manager/sharedmanager.md)

取得系统的那一个实例。每次调用得到同一个对象。

## 实例属性

还继承 `NSObject` 的属性。

| 属性 | 说明 |
| --- | --- |
| [`advertisingIdentifier`](as-identifier-manager/advertisingidentifier.md) <small>只读</small> | 广告标识。没有可用的标识时是全零 |

## 示例

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/app-tracking-transparency" />

const ZERO = '00000000-0000-0000-0000-000000000000';
const id = ASIdentifierManager.sharedManager().advertisingIdentifier;
console.log(id === ZERO ? '没有可用的广告标识' : id);
```

**效果**：用户同意了跟踪并且在真机上运行时，输出一个 UUID，形如 `6D92078A-8246-4BA4-AE5B-76104861E7DC`。在模拟器上、或者还没申请过授权时，输出 `没有可用的广告标识`。真机上的输出**未验证**。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[ASIdentifierManager sharedManager]` | `ASIdentifierManager.sharedManager()` |
| `manager.advertisingIdentifier.UUIDString` | `manager.advertisingIdentifier` |

## 参见

- [`ATTrackingManager`](app-tracking-transparency.md)：申请跟踪授权，授权之后广告标识才是真实的值
- [申请跟踪授权](../guides/tracking-authorization.md)：取广告标识，没有就不用
- [`UIDevice`](ui-device.md)：`identifierForVendor`，不需要授权的设备标识
