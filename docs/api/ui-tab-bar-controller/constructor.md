---
type: reference
native: "-[UITabBarController init]"
---

# `UITabBarController()` 构造函数

**`UITabBarController()`** 构造函数创建一个没有页面的标签控制器。

## 语法

```
new UITabBarController()
```

### 参数

无。

### 返回值

新建的 `UITabBarController`。[`viewControllers`](viewcontrollers.md) 是空数组，[`selectedIndex`](selectedindex.md) 是 `-1`。

建好之后不用自己保存：把它交给窗口之后，它和它的各个页面都不会被回收。

### 异常

**`TypeError`**

继承它再构造时抛，见[原生类](../native-classes.md)。

## 示例

```js
const tabs = new UITabBarController();
console.log(tabs.viewControllers.length, tabs.selectedIndex);
```

**结果**：控制台输出 `0 -1`。

## 对应的 iOS API

`[[UITabBarController alloc] init]`。

## 参见

- [`viewControllers`](viewcontrollers.md)
