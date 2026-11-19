---
type: reference
---

# `Intl.DateTimeFormat`：`resolvedOptions()` 方法

**`resolvedOptions()`** 方法返回这个格式化对象实际用的地区、日历、数字系统、时区和各个字段。

## 语法

```
resolvedOptions()
```

### 参数

无。

### 返回值

一个新的普通对象。改它不影响格式化。

- 成员依次是 `locale`、`calendar`、`numberingSystem`、`timeZone`；有小时时还有 `hourCycle` 和 `hour12`；然后是各个字段，或者 `dateStyle` 和 `timeStyle`。
- **字段报的是实际写出来的样子，不一定是你写的选项。** `en-US` 下给 `hour: 'numeric', hour12: false`，读回来的 `hour` 是 `'2-digit'`，因为这个地区的 24 小时写法是两位的。
- 不给 `timeZone` 时，`timeZone` 是设备当前的时区。

### 异常

**`TypeError`**

在不是 `Intl.DateTimeFormat` 的值上调用：`Intl.DateTimeFormat.prototype.resolvedOptions called on a value that is not an Intl.DateTimeFormat`。

## 示例

### 读回选项

```js
const clock = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'utc' });
const resolved = clock.resolvedOptions();
console.log(resolved.timeZone, resolved.hourCycle, resolved.hour12);
```

**结果**：控制台输出 `UTC h12 true`。

### 设备当前的时区

```js
console.log(new Intl.DateTimeFormat().resolvedOptions().timeZone);
```

**结果**：输出设备当前的时区名，比如 `Asia/Shanghai`。

## 和 Web 的差别

和 Web 相同。

## 参见

- [构造函数](constructor.md)
