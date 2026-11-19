---
type: reference
web: Blob.text()
---

# `Blob`：`text()` 方法

**`text()`** 方法把 `Blob` 的内容按 UTF-8 解码成字符串。

## 语法

```
text()
```

### 参数

无。

### 返回值

`Promise`，完成时得到字符串。可以调用任意多次。解码在后台进行，解码大文本时不会卡住界面。

内容不是合法的 UTF-8 时得到什么，**未在模拟器验证**。

### 异常

无。

## 示例

```js
async function main() {
  const blob = new Blob(['前缀-', '后缀'], { type: 'text/plain' });
  console.log(await blob.text());
}
main();
```

**结果**：输出 `前缀-后缀`。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`arrayBuffer()`](arraybuffer.md)
