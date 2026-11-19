---
type: reference
native: "-[NSItemProvider canLoadObjectOfClass:]"
---

# `NSItemProvider`：`canLoadObjectOfClass()` 方法

**`canLoadObjectOfClass()`** 方法判断这一项取不取得出某个类的对象。

## 语法

```
canLoadObjectOfClass(aClass)
```

### 参数

**`aClass`**

一个类本身，不是字符串。现在只能是 `UIImage`。

### 返回值

布尔。`true`：可以用 [`loadObjectOfClass()`](loadobjectofclass.md) 取出 `UIImage`。选中的是视频时是 `false`。

### 异常

**`TypeError`**

`aClass` 不是 `UIImage`：

```
canLoadObjectOfClass supports only UIImage for now, got UIColor
```

## 示例

```js
const photo = UIImage.imageNamed('JS/assets/photo');
if (photo !== null) {
  const provider = new NSItemProvider(photo);
  console.log(provider.canLoadObjectOfClass(UIImage));
}
```

**结果**：输出 `true`。

## 对应的 iOS API

`-[NSItemProvider canLoadObjectOfClass:]`。ObjC 传 `UIImage.class`，JS 传 `UIImage`。

## 参见

- [`loadObjectOfClass()`](loadobjectofclass.md)
- 这个类属于 `@nacrejs/photos` 包，装法见[要先安装](../photos.md#要先安装)
