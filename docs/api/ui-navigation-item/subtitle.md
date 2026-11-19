---
type: reference
native: UINavigationItem.subtitle
---

# `UINavigationItem`：`subtitle` 属性

**`subtitle`** 属性是导航条标题下面的一行小字。

## 值

字符串，或者 `null`。

- 可读，可写。
- 默认值是 `null`，没有副标题。
- 写入的不是字符串时按 `String()` 转；写 `null` 或 `undefined` 得到 `null`。
- 在屏幕上的样子**未在模拟器验证**。
- 变化时不派发事件：它只会被代码改变。

## 示例

```js
const page = new UIViewController();
page.title = '收件箱';
page.navigationItem.subtitle = '共 12 条';
console.log(page.navigationItem.subtitle);
```

**结果**：控制台输出 `共 12 条`。页面在导航栈顶时，标题下面多出一行小字「共 12 条」，**样子未在模拟器验证**。写 `null` 去掉。

## 对应的 iOS API

`UINavigationItem.subtitle`（iOS 26 起）。

## 参见

- [`title`](title.md)
