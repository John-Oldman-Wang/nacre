---
type: reference
native: UIApplication.backgroundTimeRemaining
---

# `Application`：`backgroundTimeRemaining` 属性

**`backgroundTimeRemaining`** 属性是 App 在后台还能运行多少秒，之后系统会暂停它。

## 值

数，单位是秒。

- 只读。给它赋值抛 `TypeError`。
- App 在前台时是 `Infinity`（实测）。用 [`runBackgroundTask()`](runbackgroundtask.md) 运行任务期间，只要 App 还在前台，也是 `Infinity`（实测）。
- App 在后台时是剩下的秒数，随时间减少。系统多给的时间一般在 30 秒左右，由系统决定，不保证。**未在真机验证。**
- 没有变化事件：它随时间一直在变，要用时读一次。

## 示例

```js
console.log(application.backgroundTimeRemaining);

application.addEventListener('background', () => {
  application.runBackgroundTask(async () => {
    console.log('后台还剩 ' + Math.floor(application.backgroundTimeRemaining) + ' 秒');
  });
});
```

**效果**：第一行在前台执行，控制台输出 `Infinity`。App 进入后台后，控制台输出一行 `后台还剩 29 秒` 这样的字，秒数由系统决定。**后台的那一行未在真机验证。**

## 对应的 iOS API

`UIApplication.backgroundTimeRemaining`。iOS 在前台时给的是一个极大的数（`DBL_MAX`），这里换成了 `Infinity`。

## 参见

- [`runBackgroundTask()`](runbackgroundtask.md)：向系统多要一段后台时间
- [`state`](state.md)：App 在前台还是后台
