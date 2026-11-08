# 结构体

为什么做成只读、为什么不用 `Object.freeze`。

## 为什么只读

```objc
view.frame.x = 10;   // ObjC：编译错误
```

ObjC 里 `view.frame` 返回的是一个副本，改它毫无意义，所以编译器直接拦住。如果 JS 侧用普通对象表示：

```js
view.frame.x = 10;   // 如果是普通对象 → 静默无效，view 纹丝不动
```

这是最难查的那种错。所以结构体的每个字段都定义成带 setter 的访问器，赋值直接抛：

```js
view.frame.x = 10;   // TypeError: x 是只读的：结构体按值传递，要改请整体赋一个新的
```

> 没用 `Object.freeze`：冻结后的赋值**只在严格模式下**抛异常，而用户的 JS 是普通脚本，在那里它同样是静默失败。

要改就整体赋一个新的：

```js
const f = view.frame;
view.frame = new CGRect(10, f.y, f.width, f.height);
```

---

← 返回[实现原理](README.md) ・ [API 文档](../api/structs.md)
