---
type: reference
native: UICollectionViewItemEvent()
---

# `UICollectionViewItemEvent()` 构造函数

**`UICollectionViewItemEvent()`** 构造函数创建一个 `UICollectionViewItemEvent`。

## 语法

```
new UICollectionViewItemEvent(type)
new UICollectionViewItemEvent(type, { indexPath, cancelable })
```

### 参数

**`type`**

事件名，字符串。

**`options.indexPath`**

可选，对应 [`indexPath`](indexpath.md) 属性。要是一个 `NSIndexPath`，也可以是 `null`，不转；别的抛 `TypeError`。不传是 `null`。

**`options.cancelable`**

布尔值，可选，默认 `false`。

### 返回值

新建的 `UICollectionViewItemEvent`。

### 异常

**`TypeError`**

- 某个字段的值转换不了，见上面各个参数。
- 没传事件名：`Failed to construct 'UICollectionViewItemEvent': 1 argument required, but only 0 present.`
- 不带 `new`，当成函数调用。

## 示例

```js
const event = new UICollectionViewItemEvent('itemselect', { indexPath: new NSIndexPath(0, 3) });
console.log(event.indexPath.section, event.indexPath.item);
```

**结果**：控制台输出 `0 3`。

## 对应的 iOS API

没有对应的系统 API。系统的通知到来时，运行时把通知带的值放进事件对象。

## 参见

- [`UICollectionViewItemEvent`](../ui-collection-view-item-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md)：把自己建的事件派发出去
