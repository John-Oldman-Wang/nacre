---
type: reference
native: UIBarItem.image
---

# `UIBarItem`：`image` 属性

**`image`** 属性是导航条按钮或标签上的图标。

## 值

[`UIImage`](../ui-image.md)，或者 `null`。

- 可读，可写。
- 默认值是 `null`。
- 图标在导航条上的样子**未在模拟器验证**。
- 变化时不派发事件：它只会被代码改变。

### 写错时

- 写入别的原生对象：抛 `TypeError: image needs a UIImage or null`。
- 写入字符串、数字这类普通的值：抛 `TypeError`，信息以 `image needs a native object or null, got` 开头。

## 示例

```js
const share = new UIBarButtonItem();
share.image = UIImage.systemImageNamed('square.and.arrow.up');
console.log(share.image !== null);
```

**结果**：控制台输出 `true`。按钮放到导航条上后显示一个分享图标，**样子未在模拟器验证**。

`'square.and.arrow.up'` 是系统自带图标库 SF Symbols 里的名字，见 [`UIImage`](../ui-image.md)。名字不存在时 `systemImageNamed()` 返回 `null`，写入 `null` 就是没有图标。

## 对应的 iOS API

`UIBarItem.image`。

## 参见

- [`title`](title.md)
