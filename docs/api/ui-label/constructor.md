---
type: reference
native: "-[UILabel init]"
---

# `UILabel()` 构造函数

**`UILabel()`** 构造函数创建一个标签。

## 语法

```
new UILabel()
```

### 参数

无。

### 返回值

新建的 `UILabel`：

- [`text`](text.md) 是 `null`。
- `frame` 是 `(0, 0, 0, 0)`。
- 没有父视图。

用约束定位时不用给宽高，标签按文字算出自己的大小；用 `frame` 定位时要给宽高，否则看不到文字，见[固有尺寸](../ui-label.md#固有尺寸)。

### 异常

**`TypeError`**

`UILabel` 不能被继承。`class Title extends UILabel {}` 之后 `new Title()` 抛：

```
TypeError: Illegal constructor: Title extends UILabel, but subclassing native classes is not supported yet
```

要给标签附加自己的逻辑，用组合，见[原生类](../native-classes.md)。

## 示例

```js
const label = new UILabel();
console.log(label.text);
label.text = '你好';
console.log(label.text);
```

**结果**：依次输出 `null`、`你好`。

## 对应的 iOS API

`[[UILabel alloc] init]`。

## 参见

- [`text`](text.md)
- [显示文字](../../guides/labels.md)
