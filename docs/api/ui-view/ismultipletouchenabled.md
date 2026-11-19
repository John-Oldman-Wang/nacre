---
type: reference
native: UIView.multipleTouchEnabled
---

# `UIView`：`isMultipleTouchEnabled` 属性

**`isMultipleTouchEnabled`** 属性决定视图是否接收同时落下的多根手指。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 接收多根手指 |
| `false` | 只接收第一根手指 |

- 可读，可写。
- 默认值是 `false`（按 Apple 的文档，**未在模拟器验证**）。
- 写入时按 `Boolean()` 转换：`1`、非空字符串、对象都是 `true`；`0`、`''`、`null`、`undefined`、`NaN` 都是 `false`。所以写 `'false'` 得到 `true`。
- 读出来的类型、写回原值读到的不变，在验收用例里核对过。效果**未在模拟器验证**。

## 示例

```js
const canvas = new UIView();
canvas.isMultipleTouchEnabled = true;
```

**效果**：`canvas` 上的手势识别器能收到多根手指。**未在模拟器验证。**

## 对应的 iOS API

`UIView.multipleTouchEnabled`，ObjC 的读取名是 `isMultipleTouchEnabled`。

## 参见

- [手势识别器](../ui-gesture-recognizer.md)
