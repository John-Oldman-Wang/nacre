---
type: reference
native: UIScrollView.allowsKeyboardScrolling
---

# `UIScrollView`：`allowsKeyboardScrolling` 属性

**`allowsKeyboardScrolling`** 属性表示能不能用硬件键盘的方向键和翻页键滚动。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 可以用硬件键盘滚动 |
| `false` | 不能 |

- 可读，可写。
- 这个属性是按 iOS 的头文件补上的。验收用例验证过它读得出来、类型对、写回原值读到的不变；效果**未在模拟器验证**，用法照 Apple 的文档。
- 写别的类型的值时按 JS 的真假转换。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const scroller = new UIScrollView();
scroller.allowsKeyboardScrolling = false;
console.log(scroller.allowsKeyboardScrolling);
```

**效果**：控制台输出 `false`。不能，**未在模拟器验证**。

## 对应的 iOS API

`UIScrollView.allowsKeyboardScrolling`。
