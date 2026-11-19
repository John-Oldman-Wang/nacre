---
type: reference
native: UITabBarItem.badgeColor
---

# `UITabBarItem`：`badgeColor` 属性

**`badgeColor`** 属性是角标的底色。

## 值

颜色字符串，或者 `null`。

- 可读，可写。写入时可以是颜色字符串或 `UIColor`，读出来是字符串。
- 默认值是 `null`：系统默认的红色。
- 颜色的写法和写错时的行为见[颜色](../ui-color.md)。
- 变化时不派发事件：它只会被代码改变。

## 示例

```js
const item = new UITabBarItem({ title: '消息', badgeValue: '5' });
item.badgeColor = 'systemIndigo';
console.log(item.badgeColor);
```

**结果**：控制台输出 `systemIndigo`。角标的底色变成靛蓝色，**样子未在模拟器验证**。

## 对应的 iOS API

`UITabBarItem.badgeColor`。`UIColor.systemIndigoColor` 写成 `'systemIndigo'`。

## 参见

- [`badgeValue`](badgevalue.md)
- [颜色](../ui-color.md)
