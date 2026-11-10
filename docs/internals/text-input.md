# 输入框怎么搭的

## 最大的收获：这一步不卡 M1b

动手前以为会撞上「同步回调回 JS」那堵墙，核实之后发现不用：

**1. `UITextField : UIControl`**，所以 4a 做的 16 个控件事件直接可用。`editingDidBegin` / `editingChanged` / `editingDidEnd` / `editingDidEndOnExit` 覆盖了 `UITextFieldDelegate` 里所有 `void` 的方法。**「文字变了」零新机制。**

**2. 键盘避让是纯 Auto Layout。** `UIView.keyboardLayoutGuide`（iOS 15+）是个 `UILayoutGuide`，而 3c 已经把 guide 和锚点做完了。头文件原话：

> The automatic behavior is to follow the keyboard while it is docked. **When offscreen or undocked, the topAnchor is tied to the bottomAnchor of the view's `safeAreaLayoutGuide`.**

所以一条约束管两种状态，不需要键盘通知，也不需要新的事件通道。

**3. 卡住的只有「要同步返回 BOOL」那几个 delegate**，而最常见的两个需求能绕：

| 卡住的 | 绕法 |
| --- | --- |
| `shouldChangeCharactersInRanges:`（输入过滤） | 听 `editingChanged` 事后截断，会有一帧闪 |
| `textFieldShouldReturn:`（回车收键盘） | 听 `editingDidEndOnExit`，自己 `resignFirstResponder()` |

## 撤掉了 `usesBottomSafeArea`

头文件写着「Defaults to `YES`」，**实测默认是 `false`，而且写 `true` 读回来还是 `false`**。同一条通道上的另外两个开关都正常：

```
followsUndockedKeyboard  写 true → 读回 true   ✅
keyboardDismissPadding   写 20   → 读回 20     ✅
usesBottomSafeArea       写 true → 读回 false  ❌
```

所以不是桥的问题，是这个属性特殊。**写进去不生效又不报错是这个项目一路在消灭的那类错**，所以不暴露——缺口至少会报「no writable property」，静默失败什么都不说。

> 没查清原因。一个没验证的猜测：测的时候约束还没激活，而它可能要等 guide 真正参与布局之后才生效。要试的话把写入挪到 `activateConstraints` 之后。

### 连带的一条纪律：可写属性的验收不能只验默认值

这个问题是**加了写入断言才暴露的**。只看默认值的话，它和「头文件写错了」没有区别：

```js
guide.followsUndockedKeyboard = true;
assert('followsUndockedKeyboard 写得进去', guide.followsUndockedKeyboard, true);
```

## 三个踩到的坑

### 1. 枚举用宏铺开，`check-api.sh` 就看不见了

八个枚举属性形状一样，第一版用宏：

```objc
NACRE_FIELD_ENUM("keyboardType", KeyboardType, UIKeyboardType, keyboardType)
```

脚本当场报「原生层没有这八个属性」——它按 `isEqualToString:` 后面那个字符串字面量抽名字，宏把它藏成了 `@KEY`。

**展开写了 72 行。判据：能被检查看见比少写几行重要。**

> 小插曲：改完之后我在注释里写了 `isEqualToString:@"名字"` 举例，正则把「名字」当成真属性抽走了——Python 的 `\w` 匹配中文。

### 2. 标量属性的三边核对是按名字的并集，不分类

`textAlignment` 我只在 `UILabel` 分支接了原生，`UITextField` 漏了（**它不是 `UILabel` 的子类**）。`check-api.sh` **没报**——因为这个名字在 `UILabel` 上存在，名字集合里有，缺哪个类看不出来。

于是运行时抛 `UITextField has no writable property textAlignment`，异常从 `sceneconnect` 的监听器里出来，**后面所有步骤都没跑**，包括建窗口的那一步 → **黑屏**。

> **那套检查保证「名字不漂」，不保证「每个类都接了」。** 这是它的已知边界。
>
> 同一家的还有一条：对象属性走的是另一条通道（`ReadViewObjectProperty`），**标量接了不等于对象也接了**。`font` / `textColor` 就是这么漏的。

### 3. 一个脚本改多个文件，中途抛异常会留下半套改动

first responder 的方法分发写了两次——第一次那个脚本在第二个文件的断言上抛了，我重跑时只补了第二个文件。症状是：状态属性读得到（`isFirstResponder` 给 `false`），方法调不动（`becomeFirstResponder()` 返回 `null` 而不是布尔）。

**返回 `null` 就是「原生侧根本没接到」的签名**——分发表走到底，`EncodeJSON(nil)` 给 `"null"`。

## 验收里两条「未验证」

都是前提不由我们控制，所以**不写成硬断言**：

| | 怎么处理 |
| --- | --- |
| 键盘弹出后内容被顶上去 | 模拟器连着硬件键盘时软键盘不弹。**先量 guide 的高度确认键盘真的出现了**，没出现就报未验证。实测 guide 高 34——正好是 home indicator 的安全区，反过来证明它确实贴在安全区底边 |
| 动画期间 scroll 发了不止一次 | 运行时把同一轮里的 scroll 合并成一个，而那段动画只有 30pt。主线程一忙就整段落在两次 JS 轮次之间，合并成一次。放宽到「至少发了一次」，次数打出来看趋势 |

---

← 返回[实现原理](README.md) ・ [事件模型](events.md) ・ [API 文档](../api/ui-text-field.md)
