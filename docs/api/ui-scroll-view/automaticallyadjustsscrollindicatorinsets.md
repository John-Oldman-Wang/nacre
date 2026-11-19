---
type: reference
native: UIScrollView.automaticallyAdjustsScrollIndicatorInsets
---

# `UIScrollView`：`automaticallyAdjustsScrollIndicatorInsets` 属性

**`automaticallyAdjustsScrollIndicatorInsets`** 属性表示系统是否按安全区自动调整指示条离边缘的距离。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 系统按安全区自动调整 `verticalScrollIndicatorInsets` 和 `horizontalScrollIndicatorInsets` 的效果 |
| `false` | 只用 App 写的距离 |

- 可读，可写。
- 默认值是 `true`。
- 写别的类型的值时按 JS 的真假转换。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const scroller = new UIScrollView();
scroller.automaticallyAdjustsScrollIndicatorInsets = false;
```

**效果**：指示条不再避开刘海和底部横条。**未在模拟器验证。**

## 对应的 iOS API

`UIScrollView.automaticallyAdjustsScrollIndicatorInsets`。

## 参见

- [`verticalScrollIndicatorInsets`](verticalscrollindicatorinsets.md)
