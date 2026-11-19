---
type: reference
native: UIAlertAction handler
---

# `UIAlertAction`：`click` 事件

**`click`** 事件在用户点了这个弹窗按钮时派发。

## 语法

```
action.addEventListener('click', (event) => { })
```

## 事件对象

`Event`。`type` 是 `'click'`，`target` 是这个按钮，不带别的数据。

不能取消，`preventDefault()` 不起作用：派发时弹窗已经关了。

## 什么时候派发

- 用户点了这个按钮，系统先把弹窗关掉，然后派发。事件在弹窗关掉之后派发**未在模拟器验证**。
- 只有被点的那个按钮派发，其余按钮什么都不派发。
- 底部菜单里点菜单外面的空白处，等于点了取消样式的那个按钮，那个按钮派发。**未在模拟器验证。**
- 禁用的按钮点不动，不派发。**未在模拟器验证。**
- 用代码 [`dismissViewController()`](../ui-view-controller/dismissviewcontroller.md) 关掉弹窗，没有按钮派发。**未在模拟器验证。**
- 回调不是在手指松开的那一刻执行的，而是稍后执行，见[回调的执行时机](../ui-control.md#回调的执行时机)。
- 没有监听器的按钮也能点，点了只是把弹窗关掉。

## 示例

```js
const alert = UIAlertController.alertControllerWithTitle('删除这张照片？', {
  preferredStyle: 'alert',
});
const remove = UIAlertAction.actionWithTitle('删除', { style: 'destructive' });
remove.addEventListener('click', () => {
  console.log('照片删掉了');
});
alert.addAction(remove);
```

**效果**（**未在模拟器验证**）：弹出后点「删除」，提示框消失，控制台输出 `照片删掉了`。

## 对应的 iOS API

`+[UIAlertAction actionWithTitle:style:handler:]` 的 `handler`。这里不给回调参数，换成按钮上的事件。

## 参见

- [`UIAlertAction.actionWithTitle()`](actionwithtitle.md)
- [弹窗什么时候关](../ui-alert-controller.md#弹窗什么时候关)
