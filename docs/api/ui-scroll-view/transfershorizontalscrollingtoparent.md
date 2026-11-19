---
type: reference
native: UIScrollView.transfersHorizontalScrollingToParent
---

# `UIScrollView`：`transfersHorizontalScrollingToParent` 属性

**`transfersHorizontalScrollingToParent`** 属性表示横向滚到头之后，继续的拖动是否交给外层的滚动视图。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 交给外层的滚动视图 |
| `false` | 不交出去 |

- 可读，可写。
- 这个属性是按 iOS 的头文件补上的。验收用例验证过它读得出来、类型对、写回原值读到的不变；效果**未在模拟器验证**，用法照 Apple 的文档。
- 写别的类型的值时按 JS 的真假转换。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const scroller = new UIScrollView();
scroller.transfersHorizontalScrollingToParent = false;
console.log(scroller.transfersHorizontalScrollingToParent);
```

**效果**：控制台输出 `false`。不交出去，**未在模拟器验证**。

## 对应的 iOS API

`UIScrollView.transfersHorizontalScrollingToParent`。
