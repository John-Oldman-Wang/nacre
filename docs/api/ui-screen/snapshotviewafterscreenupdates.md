---
type: reference
native: "-[UIScreen snapshotViewAfterScreenUpdates:]"
---

# `UIScreen`：`snapshotViewAfterScreenUpdates()` 方法

**`snapshotViewAfterScreenUpdates()`** 方法把屏幕此刻的内容拍成一个视图。

## 语法

```
snapshotViewAfterScreenUpdates(afterUpdates)
```

## 参数

**`afterUpdates`**

布尔值，照 `Boolean()` 转换。

- `false`：拍屏幕上已经显示出来的样子。
- `true`：先等还没画出来的改动画完，再拍。

## 返回值

[`UIView`](../ui-view.md)：一个新视图，显示拍下来的内容。它是一张静态的画面，屏幕之后的变化不会反映到它上面。

## 异常

无。

## 说明

返回的视图还没有放进任何视图树，要显示它，加到某个视图里。它适合在转场前盖在原来的内容上，转场完移除。拍出来的视图大小和内容**未在模拟器验证**，验过的只有返回的是一个 `UIView`。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const snapshot = e.scene.screen.snapshotViewAfterScreenUpdates(false);
  console.log(snapshot instanceof UIView);
});
```

**结果**：输出 `true`。

## 对应的 iOS API

`-[UIScreen snapshotViewAfterScreenUpdates:]`。

## 参见

- [`UIView`](../ui-view.md)
