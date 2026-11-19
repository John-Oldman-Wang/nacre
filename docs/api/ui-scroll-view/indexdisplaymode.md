---
type: reference
native: UIScrollView.indexDisplayMode
---

# `UIScrollView`：`indexDisplayMode` 属性

**`indexDisplayMode`** 属性决定索引条什么时候显示。按 Apple 的文档，它用于 tvOS 上的列表索引。

## 值

字符串，下面两个之一：

| 取值 | 效果 |
| --- | --- |
| `'automatic'` | 由系统决定 |
| `'alwaysHidden'` | 一直不显示 |

- 可读，可写。
- 这个属性是按 iOS 的头文件补上的。验收用例验证过它读得出来、类型对、写回原值读到的不变；效果**未在模拟器验证**，用法照 Apple 的文档。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const scroller = new UIScrollView();
console.log(scroller.indexDisplayMode);
```

**结果**：输出 `automatic` 或 `alwaysHidden`。默认值**未在模拟器验证**。

## 对应的 iOS API

`UIScrollView.indexDisplayMode`。`UIScrollViewIndexDisplayModeAlwaysHidden` 写成 `'alwaysHidden'`。
