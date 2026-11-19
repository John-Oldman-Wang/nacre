---
type: reference
native: UIScrollView.bouncesZoom
---

# `UIScrollView`：`bouncesZoom` 属性

**`bouncesZoom`** 属性表示缩放超出最小或最大比例之后，松手时是否弹回到范围内。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 可以超出一点，松手弹回 |
| `false` | 缩放到范围的边上就停 |

- 可读，可写。
- 这个属性是按 iOS 的头文件补上的。验收用例验证过它读得出来、类型对、写回原值读到的不变；效果**未在模拟器验证**，用法照 Apple 的文档。
- 写别的类型的值时按 JS 的真假转换。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const scroller = new UIScrollView();
scroller.bouncesZoom = false;
console.log(scroller.bouncesZoom);
```

**效果**：控制台输出 `false`。缩放到范围的边上就停，**未在模拟器验证**。

## 对应的 iOS API

`UIScrollView.bouncesZoom`。

## 参见

- [`minimumZoomScale`](minimumzoomscale.md)
