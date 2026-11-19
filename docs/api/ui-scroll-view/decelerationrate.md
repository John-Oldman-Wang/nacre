---
type: reference
native: UIScrollView.decelerationRate
---

# `UIScrollView`：`decelerationRate` 属性

**`decelerationRate`** 属性决定松手后内容滑多远才停。

## 值

字符串 `'normal'` 或 `'fast'`，写入时也接受数。

| 取值 | 效果 |
| --- | --- |
| `'normal'` | 滑得远 |
| `'fast'` | 很快停下。做轮播、选择器时用 |

- 可读，可写。
- 默认值是 `'normal'`。
- 也接受数（`'normal'` 对应 0.998，`'fast'` 对应 0.99），但系统只有这两档。写其他数会被归到最近的一档，读出来仍是 `'normal'` 或 `'fast'`，都不报错。实测：`0.5`、`0.95` 读出来是 `'fast'`，`0.994`、`0.999`、`1.5` 读出来是 `'normal'`。
- 没有变化事件：改它的只有 App 自己的代码。

### 写错时

写了 `'normal'`、`'fast'` 以外的字符串（比如 `'slow'`）：不抛异常，属性保持原值，控制台输出一条警告：

```
[Nacre] decelerationRate has no value "slow"; expected one of: a number / "normal" / "fast", ignored
```

## 示例

```js
const scroller = new UIScrollView();
scroller.decelerationRate = 0.95;
console.log(scroller.decelerationRate);
```

**结果**：输出 `fast`。

## 对应的 iOS API

`UIScrollView.decelerationRate`。`UIScrollViewDecelerationRateFast` 写成 `'fast'`。

## 参见

- [`isPagingEnabled`](ispagingenabled.md)
