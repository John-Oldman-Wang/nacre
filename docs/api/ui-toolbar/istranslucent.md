---
type: reference
native: UIToolbar.translucent
---

# `UIToolbar`：`isTranslucent` 属性

**`isTranslucent`** 属性表示工具条的背景是不是半透明的。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 条的背景半透明，能透出下面的内容 |
| `false` | 条的背景不透明 |

- 可读，可写。
- 默认值是 `true`。
- 两个取值在画面上的差别**未在模拟器验证**。
- 写别的类型的值时按真假转成布尔：`0` 是 `false`，`'false'` 是 `true`。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const toolbar = new UIToolbar();
toolbar.isTranslucent = false;
console.log(toolbar.isTranslucent);
```

**结果**：输出 `false`。

## 对应的 iOS API

`UIToolbar.translucent`（getter 是 `isTranslucent`）。

## 参见

- [`barTintColor`](bartintcolor.md)：条的底色
