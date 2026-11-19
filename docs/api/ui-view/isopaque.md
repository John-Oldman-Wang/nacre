---
type: reference
native: UIView.opaque
---

# `UIView`：`isOpaque` 属性

**`isOpaque`** 属性是给系统的绘制提示，不改变外观。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 声明视图的内容完全不透明，系统可以不画它后面的内容 |
| `false` | 系统按可能透明处理 |

- 可读，可写。
- 默认值是 `true`。
- 写入时按 `Boolean()` 转换：`1`、非空字符串、对象都是 `true`；`0`、`''`、`null`、`undefined`、`NaN` 都是 `false`。所以写 `'false'` 得到 `true`。

## 示例

```js
const view = new UIView();
view.isOpaque = false;
```

**效果**：外观不变。

## 对应的 iOS API

`UIView.opaque`，ObjC 的读取名是 `isOpaque`，JS 用这个名字读和写。

## 参见

- [`alpha`](alpha.md)
