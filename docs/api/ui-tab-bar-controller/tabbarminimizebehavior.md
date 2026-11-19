---
type: reference
native: UITabBarController.tabBarMinimizeBehavior
---

# `UITabBarController`：`tabBarMinimizeBehavior` 属性

**`tabBarMinimizeBehavior`** 属性决定页面内容滚动时，标签栏要不要收成一小条，给内容让出地方。

## 值

字符串。四种效果都**未在模拟器验证**，描述来自 Apple 的文档：

| 取值 | 效果 |
| --- | --- |
| `'automatic'` | 由系统决定 |
| `'never'` | 标签栏一直完整显示 |
| `'onScrollDown'` | 内容往下滚时收起，往上滚时恢复 |
| `'onScrollUp'` | 内容往上滚时收起，往下滚时恢复 |

- 可读，可写。
- 默认值是 `'automatic'`。
- 变化时不派发事件：它只会被代码改变。

### 写错时

写入表里没有的值：不抛异常，属性保持原来的值，控制台输出一条警告 `[Nacre] tabBarMinimizeBehavior has no value "always"; expected one of: automatic / never / onScrollDown / onScrollUp, ignored`。

## 示例

```js
const tabs = new UITabBarController();
tabs.tabBarMinimizeBehavior = 'onScrollDown';
console.log(tabs.tabBarMinimizeBehavior);
```

**效果**：控制台输出 `onScrollDown`。页面里的内容往下滚时，标签栏收成一小条；往上滚时恢复。**未在模拟器验证。**

## 对应的 iOS API

`UITabBarController.tabBarMinimizeBehavior`。`UITabBarMinimizeBehaviorOnScrollDown` 写成 `'onScrollDown'`，其余同理。

## 参见

- [`isTabBarHidden`](istabbarhidden.md)
