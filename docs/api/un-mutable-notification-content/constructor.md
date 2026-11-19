---
type: reference
native: "-[UNMutableNotificationContent init]"
---

# `UNMutableNotificationContent()` 构造函数

**`UNMutableNotificationContent()`** 构造函数创建一份空的通知内容，用来写标题、正文等字段。

## 语法

```
new UNMutableNotificationContent()
```

### 参数

无。

### 返回值

新建的 `UNMutableNotificationContent`。各字段的默认值：

| 属性 | 默认值 |
| --- | --- |
| [`title`](title.md)、[`subtitle`](subtitle.md)、[`body`](body.md)、[`threadIdentifier`](threadidentifier.md) | `''` |
| [`badge`](badge.md) | `null` |
| [`sound`](sound.md) | `null` |
| [`userInfo`](userinfo.md) | `{}` |

建出来的对象不能加别的字段：在严格模式下给它加字段抛 `TypeError`。

### 异常

**`TypeError`**

继承它再构造（`class MyContent extends UNMutableNotificationContent {}` 之后 `new MyContent()`）：

```
Illegal constructor: MyContent extends UNMutableNotificationContent, but subclassing native classes is not supported yet
```

## 示例

```js
const content = new UNMutableNotificationContent();
content.title = '该喝水了';
console.log(content.title, content.badge);
```

**结果**：输出 `该喝水了 null`。

## 对应的 iOS API

`-[UNMutableNotificationContent init]`。

## 参见

- [`UNNotificationRequest.requestWithIdentifier()`](../un-notification-request/requestwithidentifier.md)：用内容建请求
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
