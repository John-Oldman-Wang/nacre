---
type: reference
native: UIScrollView.bouncesHorizontally
---

# `UIScrollView`：`bouncesHorizontally` 属性

**`bouncesHorizontally`** 属性表示横向滚到头之后能不能再拉一段，松手弹回。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 横向可以回弹 |
| `false` | 横向滚到头就停 |

- 可读，可写。
- 这个属性是按 iOS 的头文件补上的。验收用例验证过它读得出来、类型对、写回原值读到的不变；效果**未在模拟器验证**，用法照 Apple 的文档。
- 写别的类型的值时按 JS 的真假转换。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const scroller = new UIScrollView();
scroller.bouncesHorizontally = false;
console.log(scroller.bouncesHorizontally);
```

**效果**：控制台输出 `false`。横向滚到头就停，**未在模拟器验证**。

## 对应的 iOS API

`UIScrollView.bouncesHorizontally`。

## 参见

- [`bounces`](bounces.md)
