---
type: reference
native: "-[UIWindow initWithWindowScene:]"
---

# `UIWindow()` 构造函数

**`UIWindow()`** 构造函数创建一个窗口。

## 语法

```
new UIWindow(scene)
new UIWindow()
```

### 参数

**`scene`**

[`UIWindowScene`](../ui-window-scene.md)，可选。

- 传了就立刻创建系统里的窗口，并放进这个场景。
- 不传、传 `null` 或 `undefined`，就先只建 JS 对象，系统里没有对应的窗口。之后给 [`windowScene`](windowscene.md) 赋值时才创建。

### 返回值

新建的 `UIWindow`。刚建好时是隐藏的，`isHidden` 是 `true`，要调 [`makeKeyAndVisible()`](makekeyandvisible.md) 才显示。

### 异常

**`TypeError`**

- `scene` 不是场景对象（数字、字符串、别的原生对象）：`cannot construct UIWindow with these arguments`。
- 继承 `UIWindow` 再构造：`Illegal constructor: MyWindow extends UIWindow, but subclassing native classes is not supported yet`（`MyWindow` 是子类的名字）。原因见[原生类](../native-classes.md)。

传入一个已经被系统销毁的场景时不报错，但建出的窗口不会显示。**未在模拟器验证。**

## 说明

两种写法的区别：

| 写法 | 系统里的窗口什么时候创建 | 什么时候用 |
| --- | --- | --- |
| `new UIWindow(scene)` | 立刻 | 手上已经有场景。绝大多数情况用这个 |
| `new UIWindow()`，之后 `win.windowScene = scene` | 给 `windowScene` 赋值时 | 创建窗口的代码拿不到场景，场景由别处稍后提供 |

第二种写法在赋值之前，读 `windowScene` 得到 `null`；其他属性和方法都不能用，访问就抛 `TypeError`，信息开头是被访问的成员名：

```
makeKeyAndVisible(): this object is not connected to a scene yet, so no native object exists
rootViewController: this object is not connected to a scene yet, so no native object exists
```

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  console.log(win.isHidden, win.windowScene === e.scene);
});
```

**结果**：场景接入时输出 `true true`。

```js
const lazy = new UIWindow();
console.log(lazy.windowScene);
try {
  lazy.makeKeyAndVisible();
} catch (err) {
  console.log(String(err));
}
```

**结果**：先输出 `null`，再输出 `TypeError: makeKeyAndVisible(): this object is not connected to a scene yet, so no native object exists`。

## 对应的 iOS API

`-[UIWindow initWithWindowScene:]`。`init` 和 `initWithFrame:` 在 iOS 26 已废弃，没有对应的写法。

## 参见

- [`windowScene`](windowscene.md)
- [`makeKeyAndVisible()`](makekeyandvisible.md)
