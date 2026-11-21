# 无障碍

读屏（VoiceOver，中文系统里叫「旁白」）要的那一组属性：`isAccessibilityElement`、`accessibilityLabel` / `Hint` / `Value` / `Identifier`、`accessibilityTraits`、`accessibilityElementsHidden`、`accessibilityViewIsModal`、`shouldGroupAccessibilityChildren`。2026-11-21 做的，属于「照已有规矩接类」，API 由 AI 定。

文件：`ios/Runtime/Bridge/NacreAccessibility.mm`、`ios/Runtime/Builtin/parts/55-accessibility.js`、`packages/types/ios/accessibility.d.ts`、`acceptance/src/steps/accessibility.js`。

## 为什么只挂在 UIView 上

UIKit 里这些是 NSObject 的非正式协议 `UIAccessibility`，任何对象都有（`accessibilityIdentifier` 在 `UIAccessibilityIdentification`，`UIView` 遵循）。照「底层照实映射」本该挂在 `NSObject` 上。

没这么做：能被读屏读到的只有界面上的东西，也就是视图。不在视图上的元素（`UIAccessibilityElement`，给自己画的内容造一个个虚拟元素）这一批没有接；它接进来时，这组属性再往上挪到它和 `UIView` 都有的地方。挂在 `NSObject` 上的话，`NSAttributedString`、`UIColor` 也都有了 `accessibilityLabel`，写了没有任何效果。

## 特征是位掩码，系统控件身上有私有位

`accessibilityTraits` 是 `UIAccessibilityTraits`（64 位整数）。照位掩码的规矩，JS 看到的是名字的数组，名字是常量去掉 `UIAccessibilityTrait` 前缀、首字母小写。头文件里的这些是 `extern` 常量而不是枚举字面量，`NACRE_MASK_MAP` 的表是第一次用时才建的，所以直接写常量名就行。

系统控件读到的值里可能有头文件以外的位。写的时候只换掉认识的那些位，不认识的原样留着：

```objc
view.accessibilityTraits = (view.accessibilityTraits & ~KnownAccessibilityTraits()) | traits;
```

直接赋值会把私有位清掉，后果不知道（可能什么都不发生，也可能读屏对这个控件的处理变了），所以不冒这个险。读的时候只报认识的名字。

## 实测：系统控件的默认值是读屏开着时现算的

用例原来断言 `UILabel`、`UIButton` 的 `isAccessibilityElement` 默认是 `true`、`UILabel` 没设标签时 `accessibilityLabel` 是它的文字。真机上（iPhone 14，iOS 27.2）对不上：

| | 读屏关着 | 读屏开着 |
| --- | --- | --- |
| 不在窗口里的 `UILabel` / `UIButton` 的 `isAccessibilityElement` | `false` | `false` |
| `UILabel` 没设标签时的 `accessibilityLabel` | `null` | 它的文字 |
| `UIButton` 的特征里有 `button`、`UILabel` 的有 `staticText` | 有 | 有 |

UIKit 给系统控件算默认的那部分，读屏这类辅助功能开着时才装进 App（关着时 App 里没有这部分代码）。运行时只是照实转交 getter 的结果，不替系统补默认值。所以这三条改成只打印实测值，不断言：自动跑的验收读屏是关着的，断言就等于把「读屏关着」写死成规矩。在窗口里的系统控件读到什么没量过。

读屏开着跑验收要人在手机上开：设置 → 辅助功能 → 辅助功能快捷键 → 旁白，之后连按三下侧边按钮开关。

## 没有变化通知

这些都是只有自己会改的值，按[原则 10](../project.md#2-api-设计原则)不需要通知。`UILabel` 的标签跟着文字变，那是 getter 现算的，读的时候就是新的。

## 没做的

自定义操作（`accessibilityCustomActions`）、可调节元素的上下滑动（要覆写 `accessibilityIncrement` / `Decrement`）、「读屏开没开」的状态和变化通知、让读屏念一句话（`UIAccessibilityPostNotification`），记在 [api-gaps](api-gaps.md) 和 `project.md` 第 7 节。
