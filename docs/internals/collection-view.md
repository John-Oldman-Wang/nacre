# 列表：`UICollectionView` 是怎么接的

列表是[同步回调](events.md#m1b同步回调系统问js-当场答)里「系统来要数据」那一类的第一个使用者。这一页记三件事：数据为什么用快照给、单元格是怎么从 JS 带回系统的、为此在核心里加的两样东西。用法见 [API 文档](../api/ui-collection-view.md)。

文件：`ios/Runtime/Bridge/NacreCollection.mm`、`ios/Runtime/Builtin/parts/50-collection.js`、`packages/types/ios/collection.d.ts`、`acceptance/src/steps/collection.js`。

## 只接 `UICollectionView`，不接 `UITableView`

列表样式（`UICollectionLayoutListConfiguration`）、单元格的内容配置（`UIListContentConfiguration`）这些接口都在 `UICollectionView` 上，它同时管列表和网格。接两个类是两套差不多的 API，而 `UITableView` 能做的列表布局都能做。

## 数据用快照给，不用「按下标问」

系统有两套给数据的办法：

| | 经典数据源 | 带标识的快照（`UICollectionViewDiffableDataSource`） |
| --- | --- | --- |
| JS 要实现的 | 有几个分区、每个分区几项、第 N 项的单元格 | 只有一个：某个标识的单元格 |
| 改数据 | 自己调 `insertItemsAtIndexPaths:` 一组，下标要和数据严格对上 | 交一份新的快照，差异由系统算 |
| 写错的后果 | 下标和数据对不上，UIKit 在**之后的布局里**抛 `NSInternalInconsistencyException` | 标识重复、指的项不存在，在**交快照的那一次调用里**就能查出来 |

选快照的理由是最后一行。运行时能把 ObjC 异常变成 JS 的 `TypeError`，前提是异常抛在我们的调用里面（见[参数转换](conversion.md#第-4-步入口的异常保护)）。经典数据源的不一致要到下一次布局才暴露，那时已经在 run loop 里，拦不住，App 直接崩。快照这一套把「数据是什么」和「怎么变过去」都交给系统，JS 没有机会写出不一致的状态。

经典那一套没有接。它也是系统的能力，以后照规矩补。

## 单元格是怎么带回去的

`cellProvider` 是系统调的一个 block，要**返回**单元格。[同步回调](events.md#m1b同步回调系统问js-当场答)的出口只带得回一个布尔（`NacreEmitEventSync`）。没有为此加一个「带得回对象」的出口，而是让 JS 反过来调一次原生把单元格交回来：

```
系统调 cellProvider（原生的 block）
  ├─ gRequest = 这一次请求（哪个列表、哪个位置）
  ├─ NacreEmitEventSync(数据源, "@cell", { section, item, id })        当场进 JS
  │    └─ JS：调用户的 cellProvider
  │         ├─ 用户调 dequeue…  → 原生：查 gRequest，取单元格，记到 gRequest.dequeued
  │         └─ 拿到返回值，调数据源的 nacre:provideCell → 原生：记到 gRequest.provided
  ├─ gRequest = 外面那一层
  └─ 返回 provided；没有的话返回一个空白的
```

`gRequest` 是 `NacreCollection.mm` 里的一个指针，指向 block 栈上的一个结构体，只在 `cellProvider` 执行期间不为空。它同时回答了三个问题：

- **交回来的单元格放哪**：`provided`。
- **现在是不是在 `cellProvider` 里**：`dequeue…` 靠它判断。UIKit 对在外面取单元格是抛异常，这里先查，报一个说得清原因的 `TypeError`。
- **这一次已经取过单元格没有**：`dequeued`。一次请求取两个，新系统上是抛异常。

进出时保存和恢复外面那一层，因为 `cellProvider` 可以嵌套：在里面做的事可能触发另一个列表的布局。

这样做的好处是引擎和同步出口一行都没改，单元格过桥走的是现成的对象参数通道。

### 域的内部事件

`@cell` 不是给用户听的事件。事件落点（`17-scene.js`）里原来有几个写死的 `if (type === '@stack')`，都是核心自己的。列表在域的文件里，没法往共享文件里再加一个分支，所以落点加了一张表：

```js
ctx.internalEventHandlers.set('@cell', (source, request) => { … });
```

名字 `@` 开头的事件先查这张表，查到就交给处理函数，不派发给监听器。用户订不了 `@` 开头的名字（`subscribeNative` 里拦了）。

### `cellProvider` 出错时

用户的函数抛了，或者返回的不是单元格，处理函数里的异常从事件落点抛出去，引擎按未捕获的异常处理：派发 `application` 的 `error` 事件，没人 `preventDefault()` 就打到控制台。

原生那边 `provided` 是空的。系统拿不到单元格会抛异常让 App 崩，所以给它一个空白的：

- 这次请求里已经取过单元格（用户的函数取了之后才抛的）：就用那一个，把 `contentConfiguration` 清掉。不能再取第二个。
- 没取过：从运行时自己登记的复用标识 `nacre.fallback` 取一个。这个标识在建数据源时登记。

用户往 `contentView` 里加的子视图不会被清掉，所以第一种情况下那一格可能留着上一项的自定义内容。

验收里三种情况都跑过：函数抛了、什么都没返回、取了没登记过的标识（这一种是 `dequeue…` 抛 `TypeError`，在 `cellProvider` 里接得住）。三种 App 都没崩。

### 实测：`cellProvider` 什么时候被调

列表在窗口里、已经有大小时，`applySnapshot()` 返回之前 `cellProvider` 就被调了 4 次（300 pt 高的区块，屏幕上正好 4 行）。这是嵌套进入：JS 调原生，原生在调用里回头进 JS。滚动时的请求来自 run loop，是另一种时机。两种都走通了。

系统有时会多要一个单元格备着。同一份数据跑两遍，一遍请求 5 次、屏幕上 4 个，另一遍请求 4 次。所以「请求的次数」只能当下限用，验收里原来写的「`visibleCells` 的个数等于请求的次数」是错的，改成了不超过。

## 委托的槽位：和滚动事件共用

`UICollectionView.delegate` 和 `UIScrollView.delegate` 是同一个属性。滚动事件的 trampoline 在核心里（`NacreScrollDelegate`），订阅时直接写 `sv.delegate = d`。列表的四个事件也要一个委托对象。两边各写各的，后来的会把先来的挤掉，而且先后取决于用户先监听哪一种。

[多行输入](text-view.md)遇到过同一个问题，它的三个事件正好有通知可以用，绕开了委托。列表的事件没有通知。

所以加了一个转发对象（`NacreRegistry.mm` 里的 `NacreDelegateMux`），接口在 `NacreExtension.h`：

```objc
void NacreAddDelegatePart(id object, id part);
void NacreRemoveDelegatePart(id object, id part);
```

槽位里实际放的是转发对象，它自己不实现任何委托方法。系统问到哪个方法，转给第一个实现了它的那一方。三条实现上的事：

- **转发用 `forwardingTargetForSelector:`**，只是换一个接收者重发，不建 `NSInvocation`。`scrollViewDidScroll:` 每帧都来。
- **每次增减之后重新设一遍 `delegate`**（先清成 `nil` 再放回去）。UIKit 在设委托的那一刻用 `respondsToSelector:` 问一遍实现了哪些方法，把答案记下来；不重设，后加的那一方收不到。
- **各方实现的方法不能重叠。** 重叠时先加的赢。滚动的委托只实现 `UIScrollViewDelegate` 的方法，列表的只实现 `UICollectionViewDelegate` 自己的四个。

核心里滚动那一支改了两行：`sv.delegate = d` 换成 `NacreAddDelegatePart(sv, d)`，摘的时候同理。所有滚动视图现在都经过转发对象，包括不是列表的。验收里滚动那一步的断言和改之前一样。

验收里专门有一段：同时监听 `scroll` 和 `beforedisplay`，两种都收到；摘掉 `scroll` 的监听器，`beforedisplay` 照常，`scroll` 不再来。

## 所有权

| 边 | 原生的事实 | JS 镜像里怎么记 |
| --- | --- | --- |
| 列表 → 数据源 | `dataSource` 是 **weak** | 列表持有数据源。原生那边另用关联对象强持有，不然用户不留引用时数据源会被释放，列表变空 |
| 列表 → 布局 | 强 | 列表持有布局 |
| 列表 → 取出过的单元格 | 屏幕上的是子视图；复用池里的不在视图树上 | 列表持有它取出过的**每一个**单元格 |
| 单元格 → `contentView` | 子视图 | 单元格持有 |
| 单元格 → 内容配置 | 存的是副本 | 不记边。每次读是一个新对象 |
| 数据源 → `cellProvider` | — | 一张 `WeakMap`，键是数据源的包装 |

第三行是为复用定的。单元格进了复用池就不在 `subviews` 里，没有别的边连着它的包装。包装被回收的话，用户挂在上面的监听器（单元格里的按钮）和自定义数据跟着丢，下次取出来时是一个新建的包装。所以取的那一刻就记边。

代价：系统在内存紧张时会清复用池，而这些单元格被 JS 包装拿着，不会真的释放，要等列表本身释放。这个代价有多大，后来单独量过，见[下面](#量过列表拿着的单元格有多少)。

`UICollectionViewDiffableDataSource` 对列表是 weak，没有环。

## 量过：列表拿着的单元格有多少

（2026-11-16，起因是一份外部审查：「单元格保活只有加入，没有退出」。）

探针：5000 行的列表，屏幕上放得下 10 行，每 12 行跳一次一直滚到底、再跳回顶，算一遍。模拟器，iPhone Air，iOS 27.2，Release。

| | 请求的次数 | 取出过的不同单元格 |
| --- | --- | --- |
| 刚放进数据 | 10 | 10 |
| 滚了 1 遍 | 4595 | 32 |
| 滚了 2 遍 | 9180 | 38 |
| 滚了 4 遍 | 18350 | 50 |
| 滚了 8 遍 | 36690 | 74 |
| 换一个复用标识再滚 1 遍 | 41275 | 105 |

**个数不随行数涨，但也不是到顶就停**：每滚一遍多 6 个。这一步之前文档里写的是「大致是屏幕上放得下的行数加几个」，那句话不对，依据只是一次 40 行的小测试。

为了分清这是系统自己的行为还是被我们拿着放不掉，写了一个不经过 Nacre 的原生对照（同样的布局、数据和滚法，用弱引用的表数「现在还活着的单元格」）：

| 滚了几遍 | 建过的 | 现在还活着的 |
| --- | --- | --- |
| 1 | 31 | 31 |
| 2 | 40 | 39 |
| 4 | 47 | 45 |
| 8 | 58 | 57 |

**没有 Nacre，系统的复用池也是越滚越大，建过的 58 个里 57 个一直活着。** 所以探针里看到的增长主要是系统自己留着这些单元格，不是 JS 这一侧的持有边造成的。持有边多留下的，只是系统自己放掉的那很少的几个。

内存：进程占用从 20 MB 到滚完八遍、换过一次复用标识之后的 47 MB，这个数里包括 JS 堆的增长和四万次内容配置留下的垃圾，过一会儿回落到 31 MB 上下。没有单独量出每个单元格占多少。

结论：**先不做「退池」的协议。** 要做的话，判据可以是「这个单元格的原生对象只剩包装自己拿着」，那时把持有边放开。它值得做的前提是系统真的会在某个时候大量放掉单元格（内存警告时清复用池），而这一点没量到：

- 用命令发的模拟内存警告，App 没有收到（`memorywarning` 事件没来），所以「内存警告之后系统放掉多少」没有数据。
- 探针自己一直拿着所有单元格的引用来计数，所以「列表摘掉之后内存回落多少」这一遍量不出来。
- 两边的探针条件不完全一样（原生那个没有窗口，屏幕上算出来是 14 行不是 10 行），只能比趋势，不能比绝对数。

## 标识

系统要求标识是可哈希的对象。JS 这一侧定成字符串或整数：

- 过桥是 JSON，到原生是 `NSString` 或 `NSNumber`，原样交给系统，读回来类型不变。`'1'` 和 `1` 哈希不同，是两个标识。
- 别的类型不转。标识是拿来比较的，悄悄把 `1.5` 取整或者把对象变成 `'[object Object]'`，会让两个本来不同的标识变成同一个。这一条和[参数转换](conversion.md)里「宽松接收」的方向相反，理由就是这个。

快照的每个改动方法，原生都先查一遍再调系统：要加的标识是不是已经有了、指的分区或项存不存在。系统对这些全是抛异常；先查的话报错能说清是哪个标识，而且出错的那一次调用什么都不会改。删除是另一种处理：不存在的标识先滤掉，不报错。


## `NSIndexPath`

ObjC 里它是对象。JS 里做成只读的值，和结构体一个做法：字段只读、过桥是 `{ section, item }` 两个整数。写入时也收带这两个字段的普通对象。

`row` 和 `item` 是同一个数，不参与枚举，所以 `JSON.stringify` 出来只有 `section` 和 `item`。

构造函数的参数顺序是 `(section, item)`，按「第几个分区的第几项」的说法来，和 ObjC 的 `indexPathForItem:inSection:` 相反。两个类方法保留了 ObjC 的写法。

位置不存在时系统多半是抛异常（滚到一个不存在的项）。选中、取消选中、滚动三个方法在原生先查，报 `there is no item at section N, item M`。

## 量到的和没验证的

量到的（模拟器，iPhone Air，iOS 27.2）：

- 没接数据源的列表，`numberOfSections` 是 1，那个分区里 0 项。用例最初写的是 0。
- 带动画地应用一份快照，Promise 在 488 ms 和 670 ms 后兑现（两次运行）。
- `reconfigureItemsWithIdentifiers` 之后 `cellProvider` 取到的是这一项原来的那个单元格。
- 用代码选中和取消选中不派发 `itemselect` / `itemdeselect`。

没验证的：

- **`itemselect` / `itemdeselect`**：只有真实触摸能触发。验收界面上留了一个 40 行的列表，点一行会在日志里打出位置和标识。
- 屏幕上的样子：五种外观、三种内容样式、`headerMode = 'firstItemInSection'` 的头。
- 快速滚动时的流畅程度。每出现一个单元格是一次进 JS 加几次属性写入，没有量过帧率。
- 真机。

## 没做的

API 文档的「还不能做的」列了全部。和机制有关的几条：

- **分区的头和尾**（补充视图）要第二个「系统来要视图」的回调，做法和 `cellProvider` 相同。`headerMode` 的 `'supplementary'` 在枚举表里特意没有列，写它会抛：列了的话系统在布局时来要那个视图，要不到就崩。
- **网格和自定义布局**（`NSCollectionLayoutSection` 一组）是纯对象，不需要回调，照[接类的规矩](adding-classes.md)做就行。其中「每个分区一种排法」的那个接口收一个 block，是同步回调。
- **左滑的操作按钮**、**长按菜单**都是系统来要一个配置对象，同样是「给我数据」这一类。
- **`shouldSelectItemAtIndexPath:`** 一组是「要不要」，照输入框的 `should…` 事件做。
