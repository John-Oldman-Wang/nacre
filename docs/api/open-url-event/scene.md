---
type: reference
native: UIOpenURLContext scene
---

# `OpenURLEvent`：`scene` 属性

**`scene`** 属性是系统把这个地址交给了哪个场景。

## 值

[`UIWindowScene`](../ui-window-scene.md)。

- 只读。给它赋值抛 `TypeError`。
- 和 `sceneconnect` 给的是同一个对象，可以用 `===` 比较。用它找到那个场景里的界面。

## 示例

```js
/** @type {Map<UIWindowScene, UINavigationController>} */
const navigators = new Map();

application.addEventListener('openurl', (e) => {
  const nav = navigators.get(e.scene);
  console.log(nav === undefined ? '这个场景还没有界面' : '找到了界面');
});
```

**效果**（**未在模拟器验证**）：按场景找到之前记下的导航控制器。完整写法见指南[处理打开 App 的链接](../../guides/open-links.md)。

## 对应的 iOS API

`scene:openURLContexts:` 的 `scene` 参数。

## 参见

- [`sceneconnect`](../application/sceneconnect-event.md)
