---
type: reference
native: "-[UIBarButtonItem initWithTitle:style:target:action:]"
---

# `UIBarButtonItem()` 构造函数

**`UIBarButtonItem()`** 构造函数创建一个导航条按钮。

## 语法

```
new UIBarButtonItem()
new UIBarButtonItem({ title, image, style, isEnabled, customView })
```

### 参数

参数是一个对象，每一项都可以不给。不给参数时得到一个没有文字、没有图标的按钮。

**`options.title`**

按钮上的文字，字符串。见 [`title`](../ui-bar-item/title.md)。

**`options.image`**

按钮上的图标，[`UIImage`](../ui-image.md)。见 [`image`](../ui-bar-item/image.md)。

**`options.style`**

样式，`'plain'`、`'prominent'` 或 `'done'`。见 [`style`](style.md)。不给是 `'plain'`。

**`options.isEnabled`**

布尔值，能不能点。见 [`isEnabled`](../ui-bar-item/isenabled.md)。不给是 `true`。

**`options.customView`**

一个 [`UIView`](../ui-view.md)，用它代替系统画的按钮。见 [`customView`](customview.md)。

`title`、`image`、`style`、`isEnabled` 在参数里给，和建好之后再写同名属性效果相同。

### 返回值

新建的 `UIBarButtonItem`。

### 异常

参数里各项写错时的报错和写对应属性时相同，见各属性的页面。

## 示例

```js
const plain = new UIBarButtonItem();
const save = new UIBarButtonItem({ title: '保存', style: 'prominent' });
console.log(plain.title, save.title, save.style);
```

**结果**：控制台输出 `null 保存 prominent`。

## 对应的 iOS API

`-[UIBarButtonItem initWithTitle:style:target:action:]`、`initWithImage:style:target:action:`、`initWithCustomView:`。三个初始化方法合成一个 options 对象；`target` 和 `action` 换成 [`click`](click-event.md) 事件。

## 参见

- [`UIBarButtonItem.systemItem()`](systemitem.md)：创建系统预置的按钮
- [`click`](click-event.md)
