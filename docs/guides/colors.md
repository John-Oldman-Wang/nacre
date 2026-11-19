# 设置颜色

这一篇讲怎么给视图、文字、图层设颜色：固定色、半透明、跟随浅色和深色模式的颜色、Asset Catalog 里的颜色，以及读出、比较、去掉颜色。颜色写成字符串，全部写法和规则在 [`UIColor`](../api/ui-color.md) 的参考页。

## 推荐的做法

**把颜色集中定义成常量。** 把 App 用到的颜色写在一个地方，其他地方只引用常量名：

```js
// 全 App 的颜色只在这里写一次
const Colors = {
  brand: '#5856D6',
  danger: 'systemRed',
  text: 'label',
  cardBackground: 'light-dark(#ffffff, #1c1c1e)',
  overlay: 'rgba(0, 0, 0, 0.4)',
};

const view = new UIView();
view.backgroundColor = Colors.brand;
```

**结果**：视图的底色变成靛蓝色。

这样写有三个好处：

- **颜色字符串只出现一次。** 写错的机会只有这一处。App 启动后看一遍控制台，没有 `is not a valid color` 的警告，这些字符串就都是合法的。
- **常量名写错能被类型检查发现。** 开着类型检查时，`Colors.brnad` 会报「属性不存在」。颜色字符串写错不会报，常量名写错会报。不开类型检查时，`Colors.brnad` 是 `undefined`，颜色被去掉且没有警告，所以建议开着类型检查。
- **同一个色值只有一种写法。** 同一个色值用两种写法写入时，读出来的字符串会变成后写入的那一种，见[读出来的字符串](../api/ui-color.md#读出来的字符串)。集中定义之后不会遇到。

**需要跟随浅色和深色模式的颜色，优先用语义色**（`'label'`、`'systemBackground'`）。语义色由系统维护，在浅色、深色和「增强对比度」设置下都有合适的值。系统没有提供的品牌色用 `light-dark()` 写两个值。

`asset(名字)` 把色值放在 Xcode 的 Asset Catalog 里，可以为浅色、深色、高对比度分别配置。它适合手工维护 Xcode 工程的 App。用 [`@nacrejs/ios` 的命令行工具](your-own-app.md)生成工程的 App 目前没有添加颜色的途径：生成的 `ios/` 目录每次都会重建，里面的 Asset Catalog 只有 App 图标。这种工程用上面的常量写法。

## 第一个例子

从空白 App 开始，在页面上从上到下放四个色块，分别用四种写法设置底色。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 固定颜色：十六进制
  const box1 = new UIView();
  box1.frame = new CGRect(40, 100, 120, 80);
  box1.backgroundColor = '#5856D6';
  page.view.addSubview(box1);

  // 2. 带透明度：红 255、绿 59、蓝 48，不透明度 50%
  const box2 = new UIView();
  box2.frame = new CGRect(40, 200, 120, 80);
  box2.backgroundColor = 'rgb(255 59 48 / 50%)';
  page.view.addSubview(box2);

  // 3. 语义色：正文文字的颜色，跟随浅色和深色模式
  const box3 = new UIView();
  box3.frame = new CGRect(40, 300, 120, 80);
  box3.backgroundColor = 'label';
  page.view.addSubview(box3);

  // 4. 自己指定两个颜色：浅色模式用绿色，深色模式用蓝色
  const box4 = new UIView();
  box4.frame = new CGRect(40, 400, 120, 80);
  box4.backgroundColor = 'light-dark(#34c759, #0a84ff)';
  page.view.addSubview(box4);

  // 5. 读出来是写进去的那个字符串
  console.log(box1.backgroundColor);
  console.log(box4.backgroundColor);
});
```

**效果**

- 页面上从上到下有四个 120 × 80 pt 的色块。pt 是 iOS 的长度单位，见[单位](../api/units.md)。
- 第一个色块是靛蓝色。浅色模式和深色模式下相同。
- 第二个色块是半透明的红色，能透出页面的底色。浅色模式下页面底色是白色，色块看起来是浅红色。深色模式下页面底色是黑色，色块看起来是暗红色。
- 第三个色块在浅色模式下是黑色，在深色模式下是白色。
- 第四个色块在浅色模式下是绿色，在深色模式下是蓝色。
- 在系统设置里切换浅色和深色模式时，页面底色、第三个和第四个色块自动换色。不需要写任何代码。
- 控制台输出 `#5856D6` 和 `light-dark(#34c759, #0a84ff)`。

这段代码没有作为一个整体在模拟器运行过。「读出来是写进去的那个字符串」在验收用例里验证过。屏幕上各色块的实际颜色和切换模式时的变化**未在模拟器验证**。

在模拟器里切换浅色和深色模式：菜单 Features → Toggle Appearance。

下面的例子都沿用这里的 `page`、`box1` 和 `box2`。例子用的都是 `backgroundColor`，其他接受颜色的属性写法相同，列表见[接受颜色的属性](../api/ui-color.md#接受颜色的属性)。

单独试某一节时，先写这几行：

```js
const page = new UIViewController();
const box1 = new UIView();
box1.frame = new CGRect(40, 100, 120, 80);
page.view.addSubview(box1);
const box2 = new UIView();
box2.frame = new CGRect(40, 200, 120, 80);
page.view.addSubview(box2);
```

## 写一个固定颜色

用十六进制或 `rgb()`。两种写法得到的颜色相同。

```js
box1.backgroundColor = '#ff9500';
box2.backgroundColor = 'rgb(255, 149, 0)';
```

**效果**：两个色块都变成橙色。浅色模式和深色模式下相同。屏幕上的颜色**未在模拟器验证**。

`rgb()` 里的三个数依次是红、绿、蓝，范围 0–255。十六进制的字母大写小写都可以，`'#FF9500'` 和 `'#ff9500'` 是同一个颜色。

也可以用表里的固定色名。颜色名区分大小写，要照表里的写法：

```js
box1.backgroundColor = 'white';
```

**效果**：色块变成白色。**未在模拟器验证。**

## 带透明度

十六进制在末尾加一组不透明度，`00` 是全透明，`ff` 是不透明。`rgb()` 加第四个数，范围 0–1，或者写成百分比。

```js
box1.backgroundColor = '#ff000080';          // 末尾的 80 约等于 50%
box2.backgroundColor = 'rgba(255, 0, 0, 0.5)';
```

**效果**：两个色块都变成半透明的红色，能看到后面的内容。**未在模拟器验证。**

`rgb()` 的空格写法把不透明度放在 `/` 后面：

```js
box2.backgroundColor = 'rgb(255 0 0 / 50%)';
```

**效果**：和上面相同。**未在模拟器验证。**

全透明用颜色名 `clear`，或者赋 `null`，见[去掉颜色](#去掉颜色)。

颜色的不透明度只影响这一个颜色。要让整个视图连同它的子视图一起变透明，用视图的 `alpha`，见 [`UIView`](../api/ui-view.md)。

> **注意**：只有十六进制和 `rgb()` 能带透明度。给颜色名加透明度（比如半透明的 `systemBlue`）目前做不到。

## 跟随深浅色模式：用语义色

iOS 有浅色和深色两种外观，由用户在系统设置里选择。语义色是系统预先配好的一组颜色，按用途命名，在两种外观下各有一个值。

```js
page.view.backgroundColor = 'systemBackground';   // 页面底色
box1.backgroundColor = 'secondarySystemBackground';   // 放在页面底色上面的一层
box2.backgroundColor = 'separator';   // 分隔线
```

**效果**：页面底色在浅色模式下是白色，在深色模式下是黑色。两个色块在两种模式下各显示系统为该用途配好的颜色。用户切换模式时自动换色。**未在模拟器验证。**

按用途选名字，不要按色值选。全部语义色和各自的用途见[能用的颜色名](../api/ui-color.md#能用的颜色名)。

## 跟随深浅色模式：自己指定两个颜色

用 `light-dark(浅色模式的颜色, 深色模式的颜色)`。

```js
box1.backgroundColor = 'light-dark(#ffffff, #1c1c1e)';
box2.backgroundColor = 'light-dark(systemBackground, #000)';
```

**效果**：`box1` 在浅色模式下是白色，在深色模式下是深灰色。`box2` 在浅色模式下是系统的页面底色，在深色模式下是黑色。用户切换模式时自动换色。**屏幕上的颜色未在模拟器验证。**

两个参数可以是这一页里的任何一种字符串写法。写了就生效，不需要另外声明 App 支持深色模式。

## 用 Asset Catalog 里的颜色

Asset Catalog 是 Xcode 工程里放图片和颜色的资源目录。在里面添加一个 Color Set（一个有名字的颜色），就可以按名字引用它。一个 Color Set 可以为浅色、深色、高对比度分别配置色值。

下面的例子假设已经在 Asset Catalog 里添加了名为 `BrandBlue` 的 Color Set。

```js
box1.backgroundColor = 'asset(BrandBlue)';
```

**效果**：色块显示 `BrandBlue` 在当前外观下配置的颜色。**未在模拟器验证。**

想让颜色在「增强对比度」设置下也换一个值，只能用这种写法。`light-dark()` 只区分浅色和深色。

> **注意**：名字不存在时，当前版本会抛 `TypeError`，没有按「写错只警告」处理，见[一处已知问题](../api/ui-color.md#一处已知问题asset-的名字不存在时会抛)。用命令行工具生成的工程目前没有添加 Color Set 的途径，见[推荐的做法](#推荐的做法)。

## 读出一个颜色

读出来的也是字符串。合法写入的字符串原样返回，不会被改写成另一种写法。

```js
box1.backgroundColor = '#f00';
console.log(box1.backgroundColor);

box1.backgroundColor = 'rgba(255,0,0,.5)';
console.log(box1.backgroundColor);
```

**效果**：控制台依次输出 `#f00` 和 `rgba(255,0,0,.5)`。大小写和空格都和写入时相同。

读出来的任何字符串都可以再赋回去。

有两种情况读出来的不是写入的字符串，见[读出来的字符串](../api/ui-color.md#读出来的字符串)。

## 比较两个颜色是否相同

直接比较读出来的字符串。

```js
box1.backgroundColor = '#5856D6';
box2.backgroundColor = '#5856D6';
console.log(box1.backgroundColor === box2.backgroundColor);
```

**效果**：控制台输出 `true`。

这种比较比的是**写法**，不是色值。同一个颜色用颜色名和十六进制各写一次，读出来是两个不同的字符串。目前没有按色值比较两个颜色的方法。

## 去掉颜色

```js
box1.backgroundColor = null;
console.log(box1.backgroundColor);
```

**效果**：色块变成透明，能看到后面的内容。控制台输出 `null`。屏幕上的变化**未在模拟器验证**。

写 `undefined` 和写 `null` 相同。有些属性写 `null` 的含义是恢复默认值，比如 [`UILabel`](../api/ui-label.md) 的 [`textColor`](../api/ui-label/textcolor.md)，各属性的说明见各自的页面。

## 让图层的颜色跟随深浅色模式

图层（`view.layer`）上的颜色在写入时确定，之后不随外观变化。要跟随，在视图的 `traitchange` 事件里重新写一次：

```js
box1.layer.borderWidth = 1;
box1.layer.borderColor = 'separator';

box1.addEventListener('traitchange', () => {
  box1.layer.borderColor = 'separator';
});
```

**效果**：色块有一条 1 pt 的边框。用户切换浅色和深色模式后，边框换成新外观下的分隔线颜色。**这段代码未在模拟器验证**；验收用例验证的是「在 `traitchange` 之后写入图层颜色，读出的是新外观下的色值」。

原因见[浅色模式和深色模式](../api/ui-color.md#浅色模式和深色模式)。更多写法见[适配深色模式](dark-mode.md)。

## 参见

- [`UIColor`](../api/ui-color.md)：支持的写法、能用的颜色名、写错时的警告、读出来的字符串
- [适配深色模式](dark-mode.md)：读当前外观、强制深浅色、图层颜色跟随外观
- [`UIView`](../api/ui-view.md)：`backgroundColor` 在这里
- [`CALayer`](../api/ca-layer.md)：边框、阴影的颜色
