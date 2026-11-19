---
type: reference
native: "-[UIImagePickerController init]"
---

# `UIImagePickerController()` 构造函数

**`UIImagePickerController()`** 构造函数创建一个系统的拍照界面。新建的还不是拍照界面：它的 [`sourceType`](sourcetype.md) 是系统的默认值 `'photoLibrary'`，要先写成 `'camera'`。

## 语法

```
new UIImagePickerController()
```

### 参数

无。

### 返回值

新建的 `UIImagePickerController`。每次 `new` 得到一个新的对象。

- 创建和硬件无关，任何设备上都建得出来，模拟器上也是。
- [`sourceType`](sourcetype.md) 是 `'photoLibrary'`，[`allowsEditing`](allowsediting.md) 是 `false`。

### 异常

**`TypeError`**

- 继承它：`class MyPicker extends UIImagePickerController {}` 在 `new MyPicker()` 时抛。原生类不能被继承。

## 说明

每次拍照新建一个。用完关掉之后不用保存它，没有变量指着它时它会被回收。

## 示例

```js
const picker = new UIImagePickerController();
console.log(picker.sourceType);
console.log(picker instanceof UIViewController, picker instanceof UINavigationController);
```

**结果**

- 第一行输出 `photoLibrary`。
- 第二行输出 `true false`：它是页面，但不是导航控制器。

## 对应的 iOS API

`[[UIImagePickerController alloc] init]`。ObjC 里它继承自 `UINavigationController`，这里继承的是 `UIViewController`。

## 参见

- [`sourceType`](sourcetype.md)：新建之后先写成 `'camera'`
- [安装 `@nacrejs/camera`](../ui-image-picker-controller.md#先装上)
