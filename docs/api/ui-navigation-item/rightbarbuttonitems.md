---
type: reference
native: UINavigationItem.rightBarButtonItems
---

# `UINavigationItem`：`rightBarButtonItems` 属性

**`rightBarButtonItems`** 属性是导航条右侧的按钮。

## 值

[`UIBarButtonItem`](../ui-bar-button-item.md) 的数组。

- 可读，可写。
- 默认值是空数组。写空数组去掉全部按钮。
- 读出来的是当时的一份快照。往数组里 `push` 不会改变导航条，要整个赋值。读到的每个元素和当初放进去的是同一个对象。
- 数组的第一个最靠右，后面的依次往左排。**排列顺序未在模拟器验证。**
- 变化时不派发事件：它只会被代码改变。

### 写错时

数组里有不是 `UIBarButtonItem` 的东西：抛 `TypeError: bar button items only accept UIBarButtonItem`。原来的按钮不变。

## 示例

```js
const page = new UIViewController();
const edit = new UIBarButtonItem({ title: '编辑' });
const more = UIBarButtonItem.systemItem('action');
page.navigationItem.rightBarButtonItems = [edit, more];

console.log(page.navigationItem.rightBarButtonItems.length);
console.log(page.navigationItem.rightBarButtonItems[0] === edit);

page.navigationItem.rightBarButtonItems = [];
console.log(page.navigationItem.rightBarButtonItems.length);
```

**结果**：控制台依次输出 `2`、`true`、`0`。

## 对应的 iOS API

`UINavigationItem.rightBarButtonItems`。单个的 `rightBarButtonItem` 写成只有一个元素的数组：`rightBarButtonItems = [a]`。

## 参见

- [`leftBarButtonItems`](leftbarbuttonitems.md)
- [`UIBarButtonItem`](../ui-bar-button-item.md)
