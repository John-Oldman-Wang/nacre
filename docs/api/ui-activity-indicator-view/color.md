---
type: reference
native: UIActivityIndicatorView.color
---

# `UIActivityIndicatorView`：`color` 属性

**`color`** 属性表示转圈的颜色。

## 值

[颜色](../ui-color.md)字符串。

- 可读，可写。
- 默认值是 `'secondaryLabel'`，一种随深浅色模式变化的灰色。
- 读出来总是字符串，不会是 `null`。合法写入的颜色原样读回。
- 写 `null` 恢复默认颜色，之后读出来是 `'secondaryLabel'`。
- 换样式不改颜色。
- 没有变化事件。只有 App 自己的代码会改它。
- 颜色在屏幕上的样子**未在模拟器验证**。

### 写错时

写入不合法的颜色：不抛异常，控制台输出一条警告，颜色保持原来的值，见[颜色](../ui-color.md#写错不抛打警告)。

## 示例

```js
const spinner = new UIActivityIndicatorView();
spinner.color = '#FF3B30';
console.log(spinner.color);
spinner.color = null;
console.log(spinner.color);
```

**结果**：先输出 `#FF3B30`，转圈是红色。写 `null` 之后输出 `secondaryLabel`，转圈变回默认的灰色。

在深色的底上要白色的转圈，写 `spinner.color = 'white'`。

## 对应的 iOS API

`UIActivityIndicatorView.color`。ObjC 里是 `UIColor` 对象，这里是颜色字符串。

## 参见

- [颜色](../ui-color.md)：颜色字符串的写法
