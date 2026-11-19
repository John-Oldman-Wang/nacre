---
type: reference
native: UIView.exclusiveTouch
---

# `UIView`：`isExclusiveTouch` 属性

**`isExclusiveTouch`** 属性决定视图在被触摸时，是否独占触摸：手指按在它上面时，同一个窗口里的别的视图不再接收触摸。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 独占触摸 |
| `false` | 不独占 |

- 可读，可写。
- 默认值是 `false`（按 Apple 的文档，**未在模拟器验证**）。
- 写入时按 `Boolean()` 转换：`1`、非空字符串、对象都是 `true`；`0`、`''`、`null`、`undefined`、`NaN` 都是 `false`。所以写 `'false'` 得到 `true`。
- 读出来的类型、写回原值读到的不变，在验收用例里核对过。效果**未在模拟器验证**。

## 示例

```js
const button = UIButton.buttonWithType('system');
button.isExclusiveTouch = true;
```

**效果**：手指按在这个按钮上时，用另一根手指点别的按钮没有反应。**未在模拟器验证。**

## 对应的 iOS API

`UIView.exclusiveTouch`，ObjC 的读取名是 `isExclusiveTouch`。

## 参见

- [`isUserInteractionEnabled`](isuserinteractionenabled.md)
