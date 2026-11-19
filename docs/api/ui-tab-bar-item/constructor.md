---
type: reference
native: "-[UITabBarItem initWithTitle:image:selectedImage:]"
---

# `UITabBarItem()` 构造函数

**`UITabBarItem()`** 构造函数创建一个标签。

## 语法

```
new UITabBarItem()
new UITabBarItem({ title, image, selectedImage, tag, badgeValue, badgeColor })
```

### 参数

参数是一个对象，六项都可以不给。每一项和建好之后再写对应的属性效果一样：

**`options.title`**

图标下面的文字，见 [`title`](../ui-bar-item/title.md)。

**`options.image`**

图标，[`UIImage`](../ui-image.md)，见 [`image`](../ui-bar-item/image.md)。

**`options.selectedImage`**

选中时换成的图标，见 [`selectedImage`](selectedimage.md)。

**`options.tag`**

给自己用的编号，见 [`tag`](../ui-bar-item/tag.md)。

**`options.badgeValue`**

角标里的文字，见 [`badgeValue`](badgevalue.md)。

**`options.badgeColor`**

角标的底色，见 [`badgeColor`](badgecolor.md)。

### 返回值

新建的 `UITabBarItem`。

### 异常

参数里各项写错时的报错和写对应属性时相同。

## 示例

```js
const empty = new UITabBarItem();
const item = new UITabBarItem({
  title: '首页',
  image: UIImage.systemImageNamed('house'),
  selectedImage: UIImage.systemImageNamed('house.fill'),
  tag: 7,
  badgeValue: '3',
  badgeColor: 'systemIndigo',
});
console.log(empty.title, item.title, item.tag, item.badgeValue, item.badgeColor);
```

**结果**：控制台输出 `null 首页 7 3 systemIndigo`。

## 对应的 iOS API

`-[UITabBarItem initWithTitle:image:selectedImage:]`。`tag`、`badgeValue`、`badgeColor` 在原生里是建好之后再设的属性，这里也可以放进参数。

## 参见

- [`UIViewController.tabBarItem`](../ui-view-controller/tabbaritem.md)：把它挂到页面上
