---
type: reference
native: UIView.clearsContextBeforeDrawing
---

# `UIView`：`clearsContextBeforeDrawing` 属性

**`clearsContextBeforeDrawing`** 属性是给系统的绘制提示：重新绘制视图内容之前，是否先把原来的内容清掉。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 先清掉再画 |
| `false` | 不清，在原来的内容上画 |

- 可读，可写。
- 默认值是 `true`（按 Apple 的文档，**未在模拟器验证**）。
- 写入时按 `Boolean()` 转换：`1`、非空字符串、对象都是 `true`；`0`、`''`、`null`、`undefined`、`NaN` 都是 `false`。所以写 `'false'` 得到 `true`。
- 读出来的类型、写回原值读到的不变，在验收用例里核对过。自己绘制视图内容（`drawRect:`）还不能做，所以这个属性目前没有可见的效果。

## 示例

```js
const view = new UIView();
view.clearsContextBeforeDrawing = false;
```

**效果**：外观不变。

## 对应的 iOS API

`UIView.clearsContextBeforeDrawing`。

## 参见

- [`setNeedsDisplay()`](setneedsdisplay.md)
