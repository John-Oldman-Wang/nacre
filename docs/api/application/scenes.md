---
type: reference
native: UIApplication.connectedScenes
---

# `Application`：`scenes` 属性

**`scenes`** 属性是当前已接入的场景。

## 值

[`UIWindowScene`](../ui-window-scene.md) 的只读数组。

- 只读。给它赋值抛 `TypeError`。
- `main.js` 顶层执行时是空数组：系统在脚本执行完之后才创建场景。所以不要在顶层读 `application.scenes[0]`，读到的是 `undefined`。
- 系统内部用的场景不在里面，比如弹出键盘时系统创建的场景。
- 同一个场景每次读到的都是同一个 JS 对象，可以用 `===` 比较。在 `sceneconnect` 的回调里，`e.scene` 和这里的第一个元素是同一个对象。
- 变化时派发 [`sceneconnect`](sceneconnect-event.md)、[`scenedisconnect`](scenedisconnect-event.md)。

## 示例

```js
console.log(application.scenes.length);

application.addEventListener('sceneconnect', (e) => {
  console.log(application.scenes[0] === e.scene);
});
```

**结果**：第一行输出 `0`。场景接入后，回调里输出 `true`。

## 对应的 iOS API

`UIApplication.connectedScenes`。原生是一个集合，这里是数组。

## 参见

- [`sceneconnect`](sceneconnect-event.md)
