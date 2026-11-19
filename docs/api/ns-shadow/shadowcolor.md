---
type: reference
native: NSShadow.shadowColor
---

# `NSShadow`：`shadowColor` 属性

**`shadowColor`** 属性是阴影的颜色。

## 值

[颜色](../ui-color.md)字符串，或者 `null`。

- 可读，可写。
- 默认值是三分之一不透明的黑色。读出来的字符串形式**未在模拟器验证**。
- 写 `null` 之后不画阴影。
- 写入时接受颜色字符串，也接受 `UIColor` 对象。

### 写错时

写入不合法的颜色时不抛异常。控制台输出一条警告，颜色保持原值：

```
[Nacre] shadowColor: "#GGG" is not a valid color, ignored
```

## 示例

```js
const shadow = new NSShadow();
shadow.shadowColor = 'rgba(0, 0, 0, 0.4)';
console.log(shadow.shadowColor);
```

**结果**：控制台输出 `rgba(0, 0, 0, 0.4)`。

## 对应的 iOS API

`NSShadow.shadowColor`。ObjC 里是 `UIColor` 对象，这里写成字符串。

## 参见

- [`UIColor`](../ui-color.md)
