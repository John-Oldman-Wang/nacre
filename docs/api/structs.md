# 结构体

`CGPoint`、`CGSize`、`CGRect`、`UIEdgeInsets`。

ObjC 里它们是 C 结构体，**按值传递**。JS 没有值类型，所以用类实例代替，并且**只读**。

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

## 写入宽、读出窄

和[颜色](ui-color.md)同一套规则。读出来的永远是结构体类的实例；写进去的可以是实例，也可以是带同样字段的普通对象：

```js
box.frame = new CGRect(60, 270, 160, 80);                      // 实例
box.frame = { x: 60, y: 270, width: 160, height: 80 };         // 普通对象，一样
box.frame = { x: 60, y: 270, width: 160 };                     // TypeError：缺 height
```

**缺字段会抛，不会默认补 0**——那又是静默出错。

## `CGRect`

```js
const r = new CGRect(10, 20, 100, 50);

r.x;  r.y;  r.width;  r.height;   // 扁平访问
r.origin;                          // CGPoint(10, 20)
r.size;                            // CGSize(100, 50)
String(r);                         // "CGRect(10, 20, 100, 50)"
```

`origin` / `size` 和 ObjC 的 `struct CGRect { CGPoint origin; CGSize size; }` 对应，扁平的四个字段是写起来方便。两套都给，因为这一层的职责是**不丢能力**，同时别让人难受。

`origin` / `size` 是原型上的取值器，不是自有属性，所以不参与 `JSON.stringify`：

```js
JSON.stringify(new CGRect(10, 20, 100, 50));
// {"x":10,"y":20,"width":100,"height":50}
```

## `CGPoint` / `CGSize` / `UIEdgeInsets`

```js
new CGPoint(x, y);
new CGSize(width, height);
new UIEdgeInsets(top, left, bottom, right);
```

字段名和 ObjC 一致。

## 还没做

`CGAffineTransform`、`CATransform3D`、`CGVector`、`NSRange`、`UIOffset`、`NSDirectionalEdgeInsets`。做法和上面一样，用到了再加。

C 里的 `CGRectMake` / `CGPointZero` 这类函数和常量还没有——它们属于「C 函数、枚举和常量怎么暴露」那个更大的问题，等 bindgen 一起定。眼下 `new CGRect(...)` 覆盖了 `CGRectMake`。

---

← 返回 [API 文档](README.md)
