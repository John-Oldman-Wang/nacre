---
type: reference
native: "-[UINavigationController popToViewController:animated:]"
---

# `UINavigationController`：`popToViewController()` 方法

**`popToViewController()`** 方法弹出某一页上面的所有页面，让那一页成为栈顶。

## 语法

```
popToViewController(viewController)
popToViewController(viewController, { animated })
```

### 参数

**`viewController`**

要回到的页面，必须在栈里。不在栈里时的结果**未在模拟器验证**。

**`options.animated`**

布尔值，可选。`true` 带转场动画，`false` 或不写时直接切换。

### 返回值

被弹出的页面组成的数组，靠近栈底的在前。

### 异常

**`TypeError`**

参数不是页面：`popToViewController: expects a UIViewController`。

## 示例

```js
const home = new UIViewController();
const nav = new UINavigationController(home);
const a = new UIViewController();
const b = new UIViewController();
nav.pushViewController(a, { animated: false });
nav.pushViewController(b, { animated: false });

const gone = nav.popToViewController(home, { animated: false });
console.log(gone.length, gone[0] === a, gone[1] === b);
```

**结果**：控制台输出 `2 true true`。屏幕回到首页。

## 对应的 iOS API

`-[UINavigationController popToViewController:animated:]`。

## 参见

- [`popToRootViewController()`](poptorootviewcontroller.md)
