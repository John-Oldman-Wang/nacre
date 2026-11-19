---
type: reference
native: UITabBarItem.badgeValue
---

# `UITabBarItem`：`badgeValue` 属性

**`badgeValue`** 属性是标签右上角角标里的文字。

## 值

字符串，或者 `null`。

- 可读，可写。
- 默认值是 `null`：没有角标。写 `null` 去掉角标。
- 写入的不是字符串时按 `String()` 转，比如写 `12` 得到 `'12'`。
- 变化时不派发事件：它只会被代码改变。

## 示例

```js
const market = new UIViewController();
market.tabBarItem.badgeValue = '3';
console.log(market.tabBarItem.badgeValue);
market.tabBarItem.badgeValue = null;
```

**效果**：页面放进标签控制器后，它那一格的右上角出现一个红色的圆，里面写着 3；写 `null` 之后角标消失。控制台输出 `3`。**样子未在模拟器验证。**

## 对应的 iOS API

`UITabBarItem.badgeValue`。

## 参见

- [`badgeColor`](badgecolor.md)
