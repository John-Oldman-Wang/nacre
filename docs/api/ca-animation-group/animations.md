---
type: reference
native: CAAnimationGroup.animations
---

# `CAAnimationGroup`：`animations` 属性

**`animations`** 属性是组里的动画。

## 值

动画对象（[`CAAnimation`](../ca-animation.md) 的子类）的数组。

- 可读，可写。
- 默认值是 `[]`。
- 读出来是写进去的那些对象。在成员上加的监听器随对象保留。
- 写 `null` 或 `undefined` 等于写 `[]`。

### 写错时

数组里有不是动画的项：抛 `TypeError: animations needs an array of CAAnimation`。

## 示例

```js
const radius = CABasicAnimation.animationWithKeyPath('cornerRadius');
const appear = CABasicAnimation.animationWithKeyPath('opacity');

const group = new CAAnimationGroup();
group.animations = [radius, appear];
console.log(group.animations[1] === appear);
```

**结果**：控制台输出 `true`。

## 对应的 iOS API

`CAAnimationGroup.animations`。

## 参见

- [`CAAnimationGroup`](../ca-animation-group.md)：组和成员的时间怎么配合
