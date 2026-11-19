---
type: reference
native: "-[UINavigationController popViewControllerAnimated:]"
---

# `UINavigationController`：`popViewController()` 方法

**`popViewController()`** 方法弹出栈顶的页面，屏幕回到上一页。

## 语法

```
popViewController()
popViewController({ animated })
```

### 参数

**`options.animated`**

布尔值，可选。`true` 带转场动画，`false` 或不写时直接切换。

### 返回值

被弹出的页面。栈里只有一页时不弹出，返回 `null`。栈底的页面弹不出去，这不是错误。

### 异常

无。

## 说明

- 被弹出的页面没有别的变量保存时被回收；保存了返回值，它就留在内存里，可以再次推入。
- 这样弹出时是否派发 [`show`](show-event.md)，没有单独的记录，**未在模拟器验证**。

## 示例

```js
const home = new UIViewController();
home.title = '首页';
const nav = new UINavigationController(home);

const popped = nav.popViewController({ animated: true });
console.log(popped === null ? '已经在栈底' : popped.title);
```

**结果**：栈里只有首页，什么都不发生，控制台输出 `已经在栈底`。栈里不止一页时，屏幕回到上一页，控制台输出被弹出页面的标题。

## 对应的 iOS API

`-[UINavigationController popViewControllerAnimated:]`。

## 参见

- [`popToViewController()`](poptoviewcontroller.md)
- [`popToRootViewController()`](poptorootviewcontroller.md)
