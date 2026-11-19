---
type: reference
native: CASpringAnimation.allowsOverdamping
---

# `CASpringAnimation`：`allowsOverdamping` 属性

**`allowsOverdamping`** 属性决定阻尼大到不再回弹之后，继续加大阻尼是否让到达终点变得更慢。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 继续加大阻尼，到达终点变得更慢 |
| `false` | 阻尼大到不再回弹之后，再加大也不变慢 |

- 可读，可写。
- 默认值是 `false`。
- 写入时按 `Boolean()` 转换，不会出错。
- 效果**未在模拟器验证**。

## 示例

```js
const spring = CASpringAnimation.animationWithKeyPath('position');
spring.damping = 100;
spring.allowsOverdamping = true;
console.log(spring.allowsOverdamping);
```

**结果**：控制台输出 `true`。

## 对应的 iOS API

`CASpringAnimation.allowsOverdamping`。

## 参见

- [`damping`](damping.md)
