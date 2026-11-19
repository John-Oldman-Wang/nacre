---
type: reference
native: "-[UINavigationController popToRootViewControllerAnimated:]"
---

# `UINavigationController`：`popToRootViewController()` 方法

**`popToRootViewController()`** 方法弹出栈底以外的所有页面，屏幕回到栈底的那一页。

## 语法

```
popToRootViewController()
popToRootViewController({ animated })
```

### 参数

**`options.animated`**

布尔值，可选。`true` 带转场动画，`false` 或不写时直接切换。

### 返回值

被弹出的页面组成的数组，靠近栈底的在前。已经在栈底时是空数组。

### 异常

无。

## 示例

```js
const nav = new UINavigationController(new UIViewController());
const a = new UIViewController();
const b = new UIViewController();
nav.pushViewController(a, { animated: false });
nav.pushViewController(b, { animated: false });

const gone = nav.popToRootViewController({ animated: false });
console.log(gone.length, gone[0] === a, gone[1] === b);
```

**结果**：控制台输出 `2 true true`。

## 对应的 iOS API

`-[UINavigationController popToRootViewControllerAnimated:]`。

## 参见

- [`popToViewController()`](poptoviewcontroller.md)
