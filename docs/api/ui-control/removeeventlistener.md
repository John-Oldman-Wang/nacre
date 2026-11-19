---
type: reference
native: "-[UIControl removeTarget:action:forControlEvents:]"
---

# `UIControl`：`removeEventListener()` 方法

**`removeEventListener()`** 方法移除用 [`addEventListener()`](addeventlistener.md) 注册的一个回调。

## 语法

```
removeEventListener(type, callback)
```

### 参数

**`type`**

注册时的事件名。

**`callback`**

注册时的那个函数。必须是同一个函数对象，重新写一个内容相同的箭头函数不能移除原来的监听。

### 返回值

无（`undefined`）。

### 异常

无。没有注册过的事件名和函数，什么都不做，不报错。

## 示例

```js
const card = new UIControl();
const onTap = () => {
  console.log('点了');
};
card.addEventListener('touchupinside', onTap);
card.removeEventListener('touchupinside', onTap);
```

**效果**：移除之后点击 `card`，不输出。

## 对应的 iOS API

`-[UIControl removeTarget:action:forControlEvents:]`。

## 参见

- [`addEventListener()`](addeventlistener.md)
