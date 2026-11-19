---
type: reference
native: UIView.showsLargeContentViewer
---

# `UIView`：`showsLargeContentViewer` 属性

**`showsLargeContentViewer`** 属性决定用户用了很大的文字设置、长按这个视图时，是否在屏幕中间显示一个放大的版本。用于工具栏、标签栏这类没法跟着放大的小控件。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 长按时显示放大的版本，内容来自 [`largeContentTitle`](largecontenttitle.md) 和 [`largeContentImage`](largecontentimage.md) |
| `false` | 不显示 |

- 可读，可写。
- 默认值是 **未在模拟器验证**。
- 写入时按 `Boolean()` 转换：`1`、非空字符串、对象都是 `true`；`0`、`''`、`null`、`undefined`、`NaN` 都是 `false`。所以写 `'false'` 得到 `true`。
- 读出来的类型、写回原值读到的不变，在验收用例里核对过。效果**未在模拟器验证**。按 Apple 的文档，还要给视图加一个系统的「大内容查看」交互，那个交互还没有接入，见[还不能做的](../ui-view.md#还不能做的)。

## 示例

```js
const item = new UIView();
item.showsLargeContentViewer = true;
item.largeContentTitle = '收藏';
```

**效果**：读写成功。长按时是否显示放大的版本**未在模拟器验证**。

## 对应的 iOS API

`UIView.showsLargeContentViewer`。

## 参见

- [`largeContentTitle`](largecontenttitle.md)、[`largeContentImage`](largecontentimage.md)
