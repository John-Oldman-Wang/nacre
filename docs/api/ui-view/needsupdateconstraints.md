---
type: reference
native: "-[UIView needsUpdateConstraints]"
---

# `UIView`：`needsUpdateConstraints()` 方法

**`needsUpdateConstraints()`** 方法返回这个视图是否有待处理的约束更新。

## 语法

```
needsUpdateConstraints()
```

### 参数

无。

### 返回值

布尔。`true`：已经被标记，还没有更新。`false`：没有待处理的更新。

### 异常

无。

## 说明

这个方法是后补的，没有在模拟器上调过，效果**未在模拟器验证**。

## 示例

```js
const view = new UIView();
view.setNeedsUpdateConstraints();
console.log(view.needsUpdateConstraints());
```

**结果**：输出 `true`。**未在模拟器验证。**

## 对应的 iOS API

`-[UIView needsUpdateConstraints]`。

## 参见

- [`setNeedsUpdateConstraints()`](setneedsupdateconstraints.md)
