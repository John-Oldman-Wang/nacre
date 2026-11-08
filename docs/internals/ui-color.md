# 颜色

上层写法的推导、相等性实测、动态色挂在哪。

## 上层怎么写颜色（方向已定，未实现）

本文件记的是**底层**：`UIColor` 照 ObjC 原样暴露，常量带 `Color` 后缀，构造走类方法。这一层服务「不丢能力」，不服务「好写」。

**上层定下来的方向是：写入接受字符串，读出永远是 `UIColor` 对象。**

```js
view.backgroundColor = '#5856D6';                      // 字面量
view.backgroundColor = 'rgba(88, 86, 214, 0.5)';
view.backgroundColor = 'light-dark(#ffffff, #000000)'; // 动态色
view.backgroundColor = 'systemBackground';             // 系统语义色
view.backgroundColor = UIColor.systemBackgroundColor;  // 底层对象也能直接给

view.backgroundColor;        // → UIColor 对象，永远
`${view.backgroundColor}`;   // → 字符串，走 toString()
```

字符串是**构造的简写**，不是颜色的表示法。

### 为什么写入可以是字符串

曾经以为「动态色放不进字符串」，这是错的。CSS Color Module Level 5 的 [`light-dark()`](https://www.w3schools.com/cssref/func_light-dark.php) 正是为这件事设计的（Chrome / Edge 123、Firefox 120、Safari 17.5 起支持）。顺着看，CSS 的颜色语法几乎覆盖了我们需要的全部：

| 要表达的 | 语法 |
| --- | --- |
| 字面量 | `#5856D6`、`rgba(88,86,214,.5)` |
| 动态色 | `light-dark(#fff, #000)` |
| 广色域 | `color(display-p3 1 0 0)` |
| 系统语义色 | CSS 有系统色关键字（`Canvas`、`CanvasText`），我们对应到 `systemBackground` 这类名字 |

覆盖不了的只剩 `colorWithPatternImage:`（图案填充）和 `colorNamed:`（Asset Catalog 里由设计师配好的颜色）。前者走底层，后者将来可以有自己的写法。

### 为什么读出不跟着做成字符串

不是做不到，是**要么失败、要么静默丢东西**。按损失程度排开，依据都在 `UIColor.h`：

| 颜色 | 转成字符串的结果 |
| --- | --- |
| RGB / HSB / 灰度 | 无损 |
| 动态色 | **静默降精度**，见下 |
| P3 | CSS 有 `color(display-p3 …)`，无损 |
| HDR（`exposure`、`linearExposure`、`colorByApplyingContentHeadroom:`）、`colorWithProminence:`（iOS 18） | 没有对应语法，丢失 |
| 图案色（`colorWithPatternImage:`） | **失败**。`- (BOOL)getRed:green:blue:alpha:` 返回 `NO`，一个分量都拿不到（实测，见下） |

**动态色这档最容易被低估。** 表面上转得出来——拿 `resolvedColorWithTraitCollection:` 取浅色、深色各一个样本，拼成 `light-dark(a, b)` 就行。但外观不止明暗这一维：`UITraitCollection` 里和颜色有关的至少还有 `accessibilityContrast`（普通／高对比度）、`userInterfaceLevel`（base／elevated，弹层比底层浅一档）、`displayGamut`。两个样本盖不住，**而且丢了不报错**。

返回对象就没有这些问题：它就是系统实际持有的那个东西，一点不差。

实测证实了动态色这一档的危险：`systemBackgroundColor` 被问分量时**不会失败**，而是乖乖返回当前外观下的值——浅色模式 `1,1,1,1`，深色模式 `0,0,0,1`。所以按 RGBA 取样来判等或做 key，在浅色模式下它和纯白完全无法区分。

> 这是取舍，不是硬约束。愿意接受少数情况静默丢精度的话，字符串出也走得通——我们选择不接受，因为静默的错最难查。

### 为什么 Web 没有这个问题

CSSOM 自己留着**声明串**：`el.style.backgroundColor` 读回的是你写进去的那个（归一化过），要当前值得另外调 `getComputedStyle()`。我们没有这一层——`UIView` 只存一个 `UIColor`，没地方放原始字符串。

Web 的颜色本来就是字符串（CSS 是文本格式），我们的不是。按[原则 9](../project.md#原则)：不去 Web 规范里找近似物，按 iOS 的事实定。

### `UIColor` 不可变，所以直接把对象给出去是安全的

`UIColor.h` 里属性全部 `readonly`，没有 setter（`setFill` / `setStroke` 名字像但**没有参数**，设的是当前 Core Graphics 绘图上下文，不是改这个颜色），派生方法全部返回新对象，并且声明 `<NSCopying>`。

所以读出来的对象不用防御性复制，也不会出现「存起来的颜色被别人改了」。

注意它**不可变，但不等于是个定值**：动态色持有的是一个 `UITraitCollection → UIColor` 的函数，绘制时才用 `UITraitCollection.currentTraitCollection` 求值。同一个 `UIColor` 画在不同视图上可以是不同颜色——变的是上下文，不是对象。

### 明暗主题挂在哪

不是 `UIColor` 去问系统现在是深色还是浅色。链接在**视图层级**里：

```
系统设置 / UIWindowScene
   └─ UIWindow            ← overrideUserInterfaceStyle 可覆盖
      └─ UIViewController ← 也可覆盖
         └─ UIView        ← 也可覆盖
```

每一层都有自己的 `traitCollection`，默认从父级继承，这三层都能用 `overrideUserInterfaceStyle` 截断。绘制时 UIKit 把当前视图的 trait 放进线程局部的 `UITraitCollection.currentTraitCollection`，provider 在那一刻被调用。

这也是为什么颜色缺的那格「变化通知」不该补在颜色上：要通知的是**外观变了**，而外观住在 trait 体系里。

### 实测：相等性和 `description`

2026-11-07 在 iPhone 18 Pro / iOS 27.2 模拟器上实测。不走 Xcode 工程，写一个命令行程序直接丢进模拟器跑（**程序本身没有留在仓库里**，要复现就按下面的方式临时写一个）：

```bash
xcrun -sdk iphonesimulator clang -arch arm64 -mios-simulator-version-min=26.0 \
  -framework UIKit -framework Foundation -framework CoreGraphics main.m -o colortest
xcrun simctl spawn <设备 UDID> ./colortest
```

**`isEqual:` 的语义**（明暗两种模式下结果一致）：

| 比较 | `isEqual:` | 同指针 |
| --- | --- | --- |
| `colorWithRed(1,1,1,1)` 构造两次 | **YES** | NO |
| `UIColor.redColor` vs `colorWithRed(1,0,0,1)` | **YES** | NO |
| `UIColor.whiteColor` vs `colorWithRed(1,1,1,1)` | **NO** | NO |
| `systemBackgroundColor` vs `colorWithRed(1,1,1,1)` | **NO** | NO |
| 同一张图构造两次的图案色 | **YES** | NO |
| 同一个常量取两次 | YES | **YES** |

三条结论：

1. **`isEqual:` 比的是表示，不是观感。** `whiteColor` 是 `UIExtendedGrayColorSpace`（灰度），`colorWithRed(1,1,1,1)` 是 sRGB，所以不相等；`redColor` 碰巧也是 sRGB，所以相等
2. **`isEqual:` 不会把动态色和同值静态色混为一谈**，浅色模式下也不会。因为动态色是另一个类，比类型就否了
3. **常量是原生单例**（同指针），所以经过包装机制之后 JS 侧的 `===` 天然成立

**`description` 的样子**：

```
colorWithRed(1,0,0,1)  →  UIExtendedSRGBColorSpace 1 0 0 1
UIColor.redColor       →  UIExtendedSRGBColorSpace 1 0 0 1
UIColor.whiteColor     →  UIExtendedGrayColorSpace 1 1
systemBackgroundColor  →  <UIDynamicSystemColor: 0x...; name = systemBackgroundColor>
labelColor             →  <UIDynamicCatalogSystemColor: 0x...; name = labelColor>
图案色                  →  <UIDynamicPatternColor: 0x...; image = <UIImage: ...>>
```

动态色的 `description` 带 `name`，对 `console.log` 很有用。注意它也带指针地址，所以不能拿来当缓存 key。

### 连带的结论

既然日常写颜色是字符串，底层的 `colorWithRed:green:blue:alpha:` 就不急了——JS 开发者基本不会碰它，它作为「完整暴露」的承诺留着即可。

> 实现时机：上层抽象要等视图层跑通、看清视图该怎么抽象之后再做，这是[接口设计 review 的 TODO](../project.md#待讨论的设计问题) 的一部分。

## 类级属性这条通道

类级属性是**新加的桥**：原来的桥全是基于 handle 的，只能访问实例成员。现在多一条 `(类名, 属性名) → 原生对象` 的通道。

iOS 层是一张**写死的名字表**，不是用名字拼 selector 再 `performSelector:`——后者等于把任意 ObjC 调用的入口开给 JS，在通用的能力暴露方案做好之前不开这个口子。表里没有的名字在 JS 侧根本没有 getter，取到 `undefined`。

---

← 返回[实现原理](../api/README.md) ・ [API 文档](../api/ui-color.md)
