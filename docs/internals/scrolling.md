# 滚动

`UIScrollView` 带来的是**第三种**原生 → JS 的事件来源，以及第一次真正要为性能做设计的地方。

## 第三种事件源：delegate trampoline

| | 来源 | 原生侧怎么接 | 哪一步做的 |
| --- | --- | --- | --- |
| 通知中心 | `UISceneDidActivateNotification` 等 | `addObserverForName:` | 第 1、2 步 |
| target-action | `UIControl` 的 19 个控件事件 | `addTarget:action:forControlEvents:` | 4a |
| **delegate** | **`UIScrollViewDelegate` 的 14 个方法** | **`scrollView.delegate = trampoline`** | 这一步 |

机制和 4a 一样：运行时自己持有一个 trampoline，**持 handle 不持 JS 函数**，派发时拿原生指针查包装再走包装自己的 `dispatchEvent`。

两处和 target-action 不同：

**1. `delegate` 是一个对象，不是一组可分别注册的 action。** 挂上去就是全挂，没法只订阅 `didScroll`。所以订阅状态要**自己记**：

```objc
@interface NacreScrollDelegate : NSObject <UIScrollViewDelegate>
@property(nonatomic, strong) NSMutableSet<NSString*>* types;
@end
```

`types` 里没有的类型压根不过桥。这是惰性订阅第一次真的省开销，而不只是整洁——`scroll` 是 60/120 Hz 的，不听的 App 一次桥都不该过。最后一个监听器移走时 `delegate = nil`，回到零开销。

**2. `delegate` 是 `weak`。** 所以 trampoline 由**关联对象**持有（`objc_setAssociatedObject` + `OBJC_ASSOCIATION_RETAIN_NONATOMIC`），和控件那边用关联对象持有 `NacreControlTarget` 是同一个理由（`addTarget:` 也不持有 target）。

**`delegate` 属性不暴露给 JS**，和 `UIWindowScene.delegate` 一个道理：它是运行时的接线，JS 改它只会把事件源掐断。

## 三类 delegate 方法，三种下场

分类标准不是这一步定的，是[屏幕方向](../project.md#屏幕方向方案已定未实现)那条定的：**系统要同步返回值，就转成 JS 预先声明的状态**。

| 类 | 有哪些 | 这一步的处理 |
| --- | --- | --- |
| 纯通知（8 个） | `didScroll`、`willBeginDragging`、`didEndDragging:willDecelerate:`、`willBeginDecelerating`、`didEndDecelerating`、`didEndScrollingAnimation`、`didScrollToTop`、`didChangeAdjustedContentInset` | → 事件，延后一轮，`cancelable: false` |
| 要同步返回值（2 个） | `viewForZoomingInScrollView:` 返回 view、`scrollViewShouldScrollToTop:` 返回 BOOL | 都没做。后者**不需要**做——原生已经有 `scrollsToTop` 属性，delegate 方法只是它的覆写点 |
| 要同步改出参（1 个） | `scrollViewWillEndDragging:withVelocity:targetContentOffset:` | 没做，要 M1b |

`viewForZooming` 如果要做，得**发明一个 ObjC 没有的属性**（`scrollView.viewForZooming = v`）。有先例（`scene.supportedOrientations`），但把它和捏合手势一起做更划算，所以缩放整个拆到后面。

## 合并：抄 Web 的第二层

Web 的滚动不卡靠两层，我们只抄得了第二层：

| | Web | Nacre |
| --- | --- | --- |
| 滚动在哪个线程算 | **合成器线程**，JS 卡住也不影响 | **主线程**，和 JS 同一个 |
| `scroll` 能不能阻止滚动 | 不能（`scroll` 不可取消）；`touchmove` 能，所以才有 `passive` | 不能，**所以不用付那笔等主线程回答的钱** |
| `scroll` 派发频率 | 每帧最多一次（待发目标攒成一个集合） | **同一轮最多一次** |

实现就是一个标志位：

```objc
- (void)scrollViewDidScroll:(UIScrollView*)scrollView {
  if (![self.types containsObject:@"scroll"]) return;
  if (self.scrollPending) return;        // 队列里已经有一个在等
  self.scrollPending = YES;
  [self.runtime emitEvent:@"scroll" … then:^{ weakSelf.scrollPending = NO; }];
}
```

标志位在**派发之后**清，所以「排队期间又发生的滚动」会被合并掉。

**合并之所以无损，是因为事件不带数据。** 这两个决定互相加强：

- 事件只有 `type` 和 `target`，位置去 `contentOffset` 上读 → 合并不丢信息
- 如果事件带 `offset` 字段，合并就会丢中间值，而且会出现「事件里的值是旧的、对象上的值是新的」这种不一致

`willDecelerate` 这个 BOOL 也是这么处理的：延后一轮之后 JS 读 `isDecelerating` 拿到的是**事实**，而参数只是**预测**。延后反而更准。

> 代价：**事件个数不能当计数用**。写进 API 文档了。

## `passive` 这条当初定「不借」是对的

`{ passive: true }` 存在的全部理由是：浏览器的合成器拿到触摸后不敢直接滚，必须先等主线程回答「你要不要 `preventDefault`」。我们这里没有东西可拦——`UIScrollView` 的拖动是 `UIPanGestureRecognizer` 决定的，JS 根本不在那条路上。

## 实测

一次真实滑动（模拟器，iPhone Air，Debug 构建）：

```
一次滑动派发了 100 次 scroll，历时 1819 ms，最终偏移 191
事件顺序 = dragbegin → dragend → deceleratebegin → decelerateend
```

约 55 次/秒。**单次派发的耗时没测**，要测得先有 `performance.now()` 级的计时（`Date.now()` 的毫秒精度不够）。

### 两条实测纠正 / 新发现

**1. `decelerationRate` 实际只有两档。** 给任意数字都会被 UIKit 吸附到 `Normal`(0.998) / `Fast`(0.99) 中最近的那个：

| 写进去 | 读回来 |
| --- | --- |
| `0.5` | `'fast'` |
| `0.95` | `'fast'` |
| `0.994` | `'normal'` ← 两值的中点，往上归 |
| `0.999` | `'normal'` |
| `1.5` | `'normal'`，**不抛** |

头文件没写这条。所以 `number` 这条路留着只是因为 ObjC 接受数字，没有中间档可用。我们**不加校验**——那是 UIKit 的行为，不是我们该发明的规则。

**2. 窗口可见之前写 `contentOffset`，delegate 不叫。** 这是写验收用例时撞上的：在 `becomevisible` 之前连写三次 `contentOffset`，`contentOffset` 读回来是对的，但 `scrollViewDidScroll:` 一次都没被调用。窗口起来之后同样的三次写就正常发一个（合并后的）`scroll`。

所以**验收用例里凡是依赖 delegate 的，都要等窗口真的起来**。这条和[「不能靠『谁先发生』推断『谁先到 JS』」](timers.md)是同一类陷阱的不同面。

### 一个不报错的坑

scroll view 里套 stack 时，**忘了给 stack 自己关 `translatesAutoresizingMaskIntoConstraints`**，症状是 `contentSize` 恒为 0，而且**不会有任何约束冲突日志**——autoresizing 把 stack 钉成 `(0,0,0,0)`，`contentLayoutGuide` 跟着塌成 0，一切自洽。

`addArrangedSubview` 会替排列项关掉它，但没人替 stack 关。这个坑写进 [API 文档](../api/ui-scroll-view.md#标准写法套一个-uistackview)了。

## 这一步开了几条通道

**零条。** 属性、方法、对象属性、`set_event_subscription` 全是现成的。新增的只有：

- 两张枚举表（`IndicatorStyle`、`ContentInsetAdjustmentBehavior`）
- 一组 `decelerationRate` 的名值对
- 一张事件名表
- 一个 trampoline 类和 `setSubscription:` 里的一个分支
- `emitControlEvent:from:` 泛化成 `emitEvent:from:className:then:`（多了个 `then:`，就是给合并清标志用的）

---

← 返回[实现原理](README.md) ・ [事件模型](events.md) ・ [API 文档](../api/ui-scroll-view.md)
