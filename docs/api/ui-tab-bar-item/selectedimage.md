---
type: reference
native: UITabBarItem.selectedImage
---

# `UITabBarItem`：`selectedImage` 属性

**`selectedImage`** 属性是标签被选中时换成的图标。

## 值

[`UIImage`](../ui-image.md)，或者 `null`。

- 可读，可写。
- 默认值是 `null`：选中时仍用 [`image`](../ui-bar-item/image.md)。
- 变化时不派发事件：它只会被代码改变。

> **注意**：读回来的不是写进去的那个对象（实测）。系统在写入时另存了一份，尺寸相同，多次读得到的是同一个，但和写进去的那个用 `===` 比较是 `false`。`image` 没有这个现象。

## 示例

```js
const fill = UIImage.systemImageNamed('house.fill');
const item = new UITabBarItem({ title: '首页', image: UIImage.systemImageNamed('house') });
item.selectedImage = fill;
console.log(item.selectedImage !== null, item.selectedImage === fill);
```

**结果**：控制台输出 `true false`。选中这个标签时显示实心的房子图标。

## 对应的 iOS API

`UITabBarItem.selectedImage`。

## 参见

- [`image`](../ui-bar-item/image.md)
