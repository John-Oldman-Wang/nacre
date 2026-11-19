---
type: reference
native: UISwipeGestureRecognizer.direction
---

# `UISwipeGestureRecognizer`：`direction` 属性

**`direction`** 属性决定识别哪几个方向的轻扫。

## 值

字符串数组，数组里可以出现的值：

| 取值 | 含义 |
| --- | --- |
| `'right'` | 向右 |
| `'left'` | 向左 |
| `'up'` | 向上 |
| `'down'` | 向下 |

- 可读，可写。
- 默认值是 `['right']`。
- 读出来的顺序固定是 `right`、`left`、`up`、`down`，和写入的顺序无关。
- 可以写空数组；空数组时识别器的表现**未在模拟器验证**。
- 写了多个方向时，几个方向都触发同一个 [`ended`](../ui-gesture-recognizer/ended-event.md)，事件不说明认出的是哪一个。要区分方向，每个方向创建一个识别器。

### 怎么得知它变了

它变了不派发事件。只有 App 的代码会改它，不需要通知。

### 写错时

- 不是数组：抛 `TypeError: direction needs an array of names; expected any of: right / left / up / down`。
- 数组里有不认识的名字：不抛异常，整次赋值不生效，属性保持原来的值，控制台输出一条警告：`[Nacre] direction has no value "diagonal"; expected one of: right / left / up / down, ignored`。数组里写对的名字也不会单独应用。

## 示例

```js
const swipe = new UISwipeGestureRecognizer();
swipe.direction = ['up', 'left'];
console.log(swipe.direction.join(', '));
```

**结果**：输出 `left, up`。

## 对应的 iOS API

`UISwipeGestureRecognizer.direction`。位掩码 `UISwipeGestureRecognizerDirectionLeft | UISwipeGestureRecognizerDirectionRight` 写成 `['left', 'right']`。

## 参见

- [响应手势](../../guides/gestures.md#响应轻扫)
