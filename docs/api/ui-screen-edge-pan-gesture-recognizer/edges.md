---
type: reference
native: UIScreenEdgePanGestureRecognizer.edges
---

# `UIScreenEdgePanGestureRecognizer`：`edges` 属性

**`edges`** 属性决定识别从哪几条屏幕边缘开始的拖动。

## 值

字符串数组，数组里可以出现的值：

| 取值 | 含义 |
| --- | --- |
| `'top'` | 屏幕的上边缘 |
| `'left'` | 屏幕的左边缘 |
| `'bottom'` | 屏幕的下边缘 |
| `'right'` | 屏幕的右边缘 |

- 可读，可写。
- 默认值是 `[]`：认不出任何手势。
- 边按当前的界面方向算。
- 读出来的顺序固定是 `top`、`left`、`bottom`、`right`，和写入的顺序无关。
- 没有表示「全部」的值，要四条边就写四个。
- 页面在[导航控制器](../ui-navigation-controller.md)里时，屏幕左边缘已经被「向右滑返回上一页」占用。

### 怎么得知它变了

它变了不派发事件。只有 App 的代码会改它，不需要通知。

### 写错时

- 不是数组：抛 `TypeError`，报错列出全部可用的值。
- 数组里有不认识的名字：不抛异常，整次赋值不生效，属性保持原来的值，控制台输出一条警告，列出全部可用的值。数组里写对的名字也不会单独应用。

## 示例

```js
const edgePan = new UIScreenEdgePanGestureRecognizer();
edgePan.edges = ['right', 'left'];
console.log(edgePan.edges.join(', '));
```

**结果**：输出 `left, right`。

## 对应的 iOS API

`UIScreenEdgePanGestureRecognizer.edges`。`UIRectEdgeRight` 写成 `['right']`，`UIRectEdgeAll` 写成 `['top', 'left', 'bottom', 'right']`。

## 参见

- [响应手势](../../guides/gestures.md#从屏幕边缘向内拖)
