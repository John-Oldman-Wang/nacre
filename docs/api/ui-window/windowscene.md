---
type: reference
native: UIWindow.windowScene
---

# `UIWindow`：`windowScene` 属性

**`windowScene`** 属性是窗口所在的场景。

## 值

[`UIWindowScene`](../ui-window-scene.md)，或者 `null`。

- 可读，可写。
- 默认值是构造时传入的场景；没传是 `null`。
- 用 `new UIWindow()` 建的窗口，第一次给它赋值时才创建系统里的窗口并放进这个场景。之后它和用 `new UIWindow(scene)` 建出来的窗口用法相同。
- 读出来的是写进去的同一个对象，可以用 `===` 比较。
- 变化时不派发事件：它只会被 App 自己的赋值改变。
- 下面两种情况**未在模拟器验证**：把已经在场景里的窗口移到另一个场景；把它写成 `null`。

### 写错时

写入的不是场景：抛 `TypeError`，信息和 [`rootViewController`](rootviewcontroller.md) 的同类报错相同，要求的类是 `UIWindowScene`。属性保持原值。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const later = new UIWindow();
  console.log(later.windowScene);

  later.windowScene = e.scene;
  console.log(later.windowScene === e.scene);
});
```

**结果**：场景接入时依次输出 `null`、`true`。

## 对应的 iOS API

`UIWindow.windowScene`。

## 参见

- [`UIWindow()`](constructor.md)：两种创建写法
