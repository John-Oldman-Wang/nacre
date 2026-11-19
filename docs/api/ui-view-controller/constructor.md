---
type: reference
native: "-[UIViewController init]"
---

# `UIViewController()` 构造函数

**`UIViewController()`** 构造函数创建一个空页面。

## 语法

```
new UIViewController()
```

### 参数

无。

### 返回值

新建的 `UIViewController`。

- 新建的页面不会自己显示。要把它设成窗口的 [`rootViewController`](../ui-window/rootviewcontroller.md)、推入导航栈、放进标签栏、模态呈现，或者加成子控制器。
- 创建页面不需要场景或窗口。
- 新建的页面没有被任何对象保管。在把它显示出来之前，要有变量保存它。

### 异常

**`TypeError`**

继承它再构造：

```
Illegal constructor: MyPage extends UIViewController, but subclassing native classes is not supported yet
```

替代写法见[原生类](../native-classes.md)：写一个函数，在里面 `new UIViewController()`，往它的 `view` 里放内容，再返回它。

## 示例

```js
function makeSettingsPage() {
  const page = new UIViewController();
  page.title = '设置';
  page.view.backgroundColor = 'systemBackground';
  return page;
}

const settings = makeSettingsPage();
console.log(settings.title);
```

**结果**：控制台输出 `设置`。页面还没有显示在屏幕上。

## 对应的 iOS API

`[[UIViewController alloc] init]`。

## 参见

- [`view`](view.md)：往页面上放内容
- [页面由谁保管](../ui-view-controller.md#页面由谁保管)
