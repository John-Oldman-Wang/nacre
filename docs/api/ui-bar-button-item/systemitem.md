---
type: reference
native: "-[UIBarButtonItem initWithBarButtonSystemItem:target:action:]"
---

# `UIBarButtonItem.systemItem()` 静态方法

**`UIBarButtonItem.systemItem()`** 静态方法创建一个系统预置的导航条按钮。文字类的按钮显示什么字跟随系统语言，图标是系统统一的。预置的种类只能在创建时指定，之后不能改。

## 语法

```
UIBarButtonItem.systemItem(name)
```

### 参数

**`name`**

下表里的一个名字。下表的效果来自 Apple 的文档，**全部未在模拟器验证**。

| 取值 | 效果 |
| --- | --- |
| `'done'` | 文字「完成」 |
| `'cancel'` | 文字「取消」 |
| `'edit'` | 文字「编辑」 |
| `'save'` | 文字「保存」 |
| `'undo'` | 文字「撤销」 |
| `'redo'` | 文字「重做」 |
| `'add'` | 加号图标 |
| `'compose'` | 新建内容的图标：一个方框加一支笔 |
| `'reply'` | 回复的图标：一个向左的弯箭头 |
| `'action'` | 分享的图标：一个方框加向上的箭头 |
| `'organize'` | 文件夹图标 |
| `'bookmarks'` | 书签图标：一本打开的书 |
| `'search'` | 放大镜图标 |
| `'refresh'` | 刷新的图标：一个环形箭头 |
| `'stop'` | 停止的图标：一个叉 |
| `'close'` | 关闭的图标：一个叉 |
| `'camera'` | 相机图标 |
| `'trash'` | 垃圾桶图标 |
| `'play'` | 播放图标 |
| `'pause'` | 暂停图标 |
| `'rewind'` | 快退图标 |
| `'fastForward'` | 快进图标 |
| `'pageCurl'` | 翻页图标。Apple 已不建议使用 |
| `'writingTools'` | 系统「写作工具」的图标 |
| `'flexibleSpace'` | 不显示任何东西的空白，宽度自动伸缩。等同于 [`UIBarButtonItem.flexibleSpace()`](flexiblespace.md) |
| `'fixedSpace'` | 不显示任何东西的空白，宽度由 [`width`](width.md) 决定 |

### 返回值

新建的 `UIBarButtonItem`。

### 异常

**`TypeError`**

名字不在表里：`systemItem has no value "explode"; expected one of: …`，后面列出全部可用的名字。

## 示例

```js
const trash = UIBarButtonItem.systemItem('trash');
console.log(trash instanceof UIBarButtonItem);
```

**结果**：控制台输出 `true`。

## 对应的 iOS API

`-[UIBarButtonItem initWithBarButtonSystemItem:target:action:]`。`UIBarButtonSystemItemAdd` 写成 `'add'`，其余同理。ObjC 里没有对应的可写属性，所以这里是静态方法。

## 参见

- [`UIBarButtonItem()`](constructor.md)：用自己的文字或图标创建
