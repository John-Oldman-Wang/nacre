---
type: reference
native: UIAlertController.severity
---

# `UIAlertController`：`severity` 属性

**`severity`** 属性是弹窗的严重程度。

## 值

字符串：

| 取值 | 含义 |
| --- | --- |
| `'default'` | 普通 |
| `'critical'` | 需要用户立刻处理。系统可以用更醒目的方式显示 |

- 可读，可写。
- 默认值是 `'default'`。
- 两种取值在 iPhone 上显示出来有没有区别**未在模拟器验证**。
- 变化时不派发事件：它只有 App 自己能改。

### 写错时

写入不认识的值：不抛异常，属性保持原来的值，控制台输出一条警告 `[Nacre] severity has no value "high"; expected one of: default / critical, ignored`。

## 示例

```js
const alert = UIAlertController.alertControllerWithTitle('存储空间已满', {
  preferredStyle: 'alert',
});
alert.severity = 'critical';
console.log(alert.severity);
```

**结果**：控制台输出 `critical`。

## 对应的 iOS API

`UIAlertController.severity`。`UIAlertControllerSeverityCritical` 写成 `'critical'`。

## 参见

- [枚举](../enums.md)：属性写错时为什么是警告而不是抛异常
