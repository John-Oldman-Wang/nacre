---
type: reference
native: UICollectionView
status: partial
---

# `UICollectionView`

**`UICollectionView`** 表示一个能滚动的列表。它只为屏幕上看得见的那几行创建视图，行滚出屏幕之后，它的视图被拿去显示新滚进来的行。所以几千行的列表和几十行的列表占用的内存差不多。

列表不直接存数据。数据分成两部分交给它：**有哪些项、什么顺序**放在快照里，快照里只有标识，一项一个；**每一项长什么样**写在数据源的 `cellProvider` 函数里，系统要显示某一项时调它，它返回设好内容的单元格。改数据时不用告诉列表「第 3 行删了」：建一份新的快照交给数据源，系统比较前后两份，自己算出哪些行要插入、删除、移动。

和列表一起用的是这一组类：

| 类 | 是什么 |
| --- | --- |
| `UICollectionView`（本页） | 列表 |
| [`UICollectionViewDiffableDataSource`](ui-collection-view-diffable-data-source.md) | 数据源。列表显示什么，由它决定 |
| [`NSDiffableDataSourceSnapshot`](ns-diffable-data-source-snapshot.md) | 快照。一份「有哪些分区、每个分区里有哪些项」的清单 |
| [`NSIndexPath`](ns-index-path.md) | 一项的位置：第几个分区的第几项 |
| [`UICollectionReusableView`](ui-collection-reusable-view.md) | 列表里能复用的视图的基类 |
| [`UICollectionViewCell`](ui-collection-view-cell.md) | 单元格。一项在屏幕上的视图 |
| [`UICollectionViewListCell`](ui-collection-view-list-cell.md) | 列表布局用的单元格 |
| [`UIListContentConfiguration`](ui-list-content-configuration.md) | 一行的内容：主文字、副文字、图片 |
| [`UICollectionViewLayout`](ui-collection-view-layout.md) | 布局对象的基类 |
| [`UICollectionViewCompositionalLayout`](ui-collection-view-compositional-layout.md) | 列表用的布局 |
| [`UICollectionLayoutListConfiguration`](ui-collection-layout-list-configuration.md) | 列表的外观：圆角卡片、通栏、分隔线 |

列表是[滚动视图](ui-scroll-view.md)：滚动视图的属性和事件它都有。

这一组页面里的行为都在模拟器（iPhone Air，iOS 27.2）的验收用例里验证过，标了「未在模拟器验证」的除外。屏幕上的样子没有逐项核对。

**继承关系**：`EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → [`UIScrollView`](ui-scroll-view.md) → `UICollectionView`

怎么做一个列表、增删改行、点选、加载更多，见指南[做一个列表](../guides/lists.md)。

## 构造函数

[`UICollectionView()`](ui-collection-view/constructor.md)

用一个布局对象创建列表。

## 实例属性

还继承 [`UIScrollView`](ui-scroll-view.md) 和 [`UIView`](ui-view.md) 的属性。列表常用的继承属性是 [`contentOffset`](ui-scroll-view/contentoffset.md)、[`keyboardDismissMode`](ui-scroll-view/keyboarddismissmode.md)。

| 属性 | 说明 |
| --- | --- |
| [`collectionViewLayout`](ui-collection-view/collectionviewlayout.md) <small>只读</small> | 建的时候给的布局对象 |
| [`dataSource`](ui-collection-view/datasource.md) <small>只读</small> | 接在它上面的数据源 |
| [`allowsSelection`](ui-collection-view/allowsselection.md) | 用户能不能点选 |
| [`allowsMultipleSelection`](ui-collection-view/allowsmultipleselection.md) | 能不能同时选中多项 |
| [`numberOfSections`](ui-collection-view/numberofsections.md) <small>只读</small> | 现在有几个分区 |
| [`visibleCells`](ui-collection-view/visiblecells.md) <small>只读</small> | 现在在屏幕上的单元格 |
| [`indexPathsForVisibleItems`](ui-collection-view/indexpathsforvisibleitems.md) <small>只读</small> | 现在在屏幕上的各项的位置 |
| [`indexPathsForSelectedItems`](ui-collection-view/indexpathsforselecteditems.md) <small>只读</small> | 选中的各项的位置 |

## 实例方法

还继承 [`UIScrollView`](ui-scroll-view.md) 和 [`UIView`](ui-view.md) 的方法。

单元格：

| 方法 | 说明 |
| --- | --- |
| [`registerClass()`](ui-collection-view/registerclass.md) | 登记一种单元格 |
| [`dequeueReusableCellWithReuseIdentifier()`](ui-collection-view/dequeuereusablecellwithreuseidentifier.md) | 在 `cellProvider` 里取一个单元格 |
| [`cellForItemAtIndexPath()`](ui-collection-view/cellforitematindexpath.md) | 某一项现在的单元格 |
| [`indexPathForCell()`](ui-collection-view/indexpathforcell.md) | 一个单元格现在显示的是哪一项 |

查询：

| 方法 | 说明 |
| --- | --- |
| [`numberOfItemsInSection()`](ui-collection-view/numberofitemsinsection.md) | 某个分区里有几项 |
| [`indexPathForItemAtPoint()`](ui-collection-view/indexpathforitematpoint.md) | 一个点落在哪一项上 |

选中和滚动：

| 方法 | 说明 |
| --- | --- |
| [`selectItemAtIndexPath()`](ui-collection-view/selectitematindexpath.md) | 选中一项 |
| [`deselectItemAtIndexPath()`](ui-collection-view/deselectitematindexpath.md) | 取消选中一项 |
| [`scrollToItemAtIndexPath()`](ui-collection-view/scrolltoitematindexpath.md) | 滚到某一项 |

## 事件

用 `addEventListener()` 监听。

| 事件 | 什么时候派发 |
| --- | --- |
| [`itemselect`](ui-collection-view/itemselect-event.md) | 用户点选了一项 |
| [`itemdeselect`](ui-collection-view/itemdeselect-event.md) | 用户让一项不再选中 |
| [`beforedisplay`](ui-collection-view/beforedisplay-event.md) | 一项的单元格即将出现在屏幕上 |
| [`displayend`](ui-collection-view/displayend-event.md) | 一项的单元格离开了屏幕 |
| [`scroll`](ui-scroll-view/scroll-event.md) 等 | 滚动视图的八个事件，继承自 [`UIScrollView`](ui-scroll-view.md#事件)，和这四个互不影响 |

四个事件共同的规则：

- 事件对象是 `UICollectionViewItemEvent`，多一个只读字段 `indexPath`，类型是 [`NSIndexPath`](ns-index-path.md)。
- 不能取消，`preventDefault()` 不起作用。
- 回调排在当前这一轮代码之后执行。`indexPath` 是事件发生那一刻的位置；回调执行前数据变了的话，这个位置上可能已经是另一项，或者没有项。要长期用一项，先用数据源的 [`itemIdentifierForIndexPath()`](ui-collection-view-diffable-data-source/itemidentifierforindexpath.md) 换成标识。

## 标识

标识是 App 给每一项起的名字，用来区分它和别的项。它是字符串或者整数。

- 同一个快照里，项的标识不能重复，不同分区里的项也不能重复。分区的标识同样不能重复。
- `'1'` 和 `1` 是两个不同的标识。
- 标识要稳定：同一项在前后两份快照里用同一个标识，系统才知道它是同一项。用订单号、用户 id 这类不会变的值，不要用它在数组里的下标。
- 系统交回来的标识，类型上是 `string | number`。按标识取数据时先转成 App 用的那一种，比如 `orders.get(String(id))`。

## 分区和项

列表里的内容分两层：分区，和分区里的项。只有一组内容时也要有一个分区。

一项的位置用 [`NSIndexPath`](ns-index-path.md) 表示：`section` 是第几个分区，`item` 是分区里的第几项，都从 0 数。需要位置的参数可以给 `NSIndexPath`，也可以给 `{ section: 0, item: 3 }` 这样的普通对象；读出来的都是 `NSIndexPath`。

位置不是一项的身份。在它前面插一行，它的位置就变了。要长期记住一项，记它的标识。

| 手里有 | 想要 | 用 |
| --- | --- | --- |
| 位置 | 标识 | [`source.itemIdentifierForIndexPath(indexPath)`](ui-collection-view-diffable-data-source/itemidentifierforindexpath.md) |
| 标识 | 位置 | [`source.indexPathForItemIdentifier(id)`](ui-collection-view-diffable-data-source/indexpathforitemidentifier.md) |

## 单元格的登记和取用

单元格不能用 `new` 建。分两步：

1. 建列表之后，用 [`registerClass()`](ui-collection-view/registerclass.md) 登记一种单元格，给它一个复用标识。
2. 在 `cellProvider` 里用 [`dequeueReusableCellWithReuseIdentifier()`](ui-collection-view/dequeuereusablecellwithreuseidentifier.md) 按这个复用标识取。有能复用的就给复用的，没有就新建。

复用标识和项的标识是两回事。复用标识表示「哪一种单元格」，一个列表通常只有一两种。

单元格是复用的：一项滚出屏幕后，它的单元格不销毁，留着显示别的项。所以 `cellProvider` 拿到的单元格可能是新的，也可能上面还留着另一项的内容。每次都把单元格上的内容整个设一遍；一项的数据放在 App 自己的 `Map` 或数组里，按标识取，不要用单元格记数据。

## 示例

### 订单列表

从空白 App 开始，显示一个订单列表，点一行在控制台输出订单号，两秒后删掉第一行。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const orders = new Map([
    ['A1001', { title: '咖啡豆 500 g', status: '已发货' }],
    ['A1002', { title: '手冲壶', status: '待付款' }],
    ['A1003', { title: '滤纸 100 张', status: '已签收' }],
  ]);

  const list = new UICollectionView(
    UICollectionViewCompositionalLayout.layoutWithListConfiguration(
      new UICollectionLayoutListConfiguration('insetGrouped')));
  list.registerClass(UICollectionViewListCell, { forCellWithReuseIdentifier: 'row' });

  const source = new UICollectionViewDiffableDataSource(list, {
    cellProvider(collectionView, indexPath, id) {
      const cell = collectionView.dequeueReusableCellWithReuseIdentifier(
        'row', { forIndexPath: indexPath });
      const order = orders.get(String(id));
      const content = cell.defaultContentConfiguration();
      content.text = order ? order.title : '';
      content.secondaryText = order ? order.status : '';
      cell.contentConfiguration = content;
      return cell;
    },
  });

  const snapshot = new NSDiffableDataSourceSnapshot();
  snapshot.appendSectionsWithIdentifiers(['main']);
  snapshot.appendItemsWithIdentifiers(Array.from(orders.keys()));
  source.applySnapshot(snapshot, { animatingDifferences: false });

  list.addEventListener('itemselect', (event) => {
    console.log('点了 ' + source.itemIdentifierForIndexPath(event.indexPath));
  });

  setTimeout(() => {
    const next = source.snapshot();
    next.deleteItemsWithIdentifiers(['A1001']);
    source.applySnapshot(next);
  }, 2000);

  list.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(list);
  NSLayoutConstraint.activateConstraints([
    list.topAnchor.constraintEqualToAnchor(page.view.topAnchor),
    list.bottomAnchor.constraintEqualToAnchor(page.view.bottomAnchor),
    list.leadingAnchor.constraintEqualToAnchor(page.view.leadingAnchor),
    list.trailingAnchor.constraintEqualToAnchor(page.view.trailingAnchor),
  ]);
});
```

**效果**

- 屏幕上出现一个圆角卡片，里面三行，每行上面是商品名，下面是灰色的状态。
- 点一行，这一行变成高亮，控制台输出 `点了 A1002`。**未在模拟器验证**：点选只有真实触摸能触发。
- 两秒后第一行带动画地消失，下面两行移上来。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[[UICollectionView alloc] initWithFrame:CGRectZero collectionViewLayout:layout]` | `new UICollectionView(layout)` |
| `[list registerClass:UICollectionViewListCell.class forCellWithReuseIdentifier:@"row"]` | `list.registerClass(UICollectionViewListCell, { forCellWithReuseIdentifier: 'row' })` |
| `[list dequeueReusableCellWithReuseIdentifier:@"row" forIndexPath:indexPath]` | `list.dequeueReusableCellWithReuseIdentifier('row', { forIndexPath: indexPath })` |
| `[list scrollToItemAtIndexPath:path atScrollPosition:UICollectionViewScrollPositionTop animated:YES]` | `list.scrollToItemAtIndexPath(path, { atScrollPosition: ['top'], animated: true })` |
| `collectionView:didSelectItemAtIndexPath:`（委托方法） | `itemselect` 事件，位置在 `event.indexPath` |
| `collectionView:didDeselectItemAtIndexPath:`（委托方法） | `itemdeselect` 事件 |
| `collectionView:willDisplayCell:forItemAtIndexPath:`（委托方法） | `beforedisplay` 事件 |
| `collectionView:didEndDisplayingCell:forItemAtIndexPath:`（委托方法） | `displayend` 事件 |

和 ObjC 不一样的地方：

- 系统对用错的情况（标识重复、位置不存在、在 `cellProvider` 之外取单元格）是抛出让 App 崩溃的异常，JS 里是可以 `catch` 的 `TypeError`。
- `NSNotFound` 换成了 -1。
- 标识在 ObjC 里可以是任何可哈希的对象，JS 里是字符串或整数。

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 网格、横向滚动的分区、自定义的排法 | `NSCollectionLayoutSection` 一组、`UICollectionViewFlowLayout`。现在只有列表布局 |
| 分区的头和尾用单独的视图 | 补充视图（supplementary view）、`headerMode = 'supplementary'`。可以用 `headerMode = 'firstItemInSection'` 把第一项当头 |
| 行右侧的箭头、对勾、删除按钮 | `UICollectionViewListCell.accessories` |
| 左滑出现操作按钮 | `trailingSwipeActionsConfigurationProvider` |
| 改内容配置里文字的字体和颜色、图片的大小 | `UIListContentConfiguration.textProperties` 等。可以在 `contentView` 里放自己的视图 |
| 改单元格的背景、选中时的样子 | `backgroundConfiguration`、`configurationUpdateHandler`、`UICellConfigurationState` |
| 拖动排序 | `reorderingHandlers` |
| 长按出菜单 | `collectionView:contextMenuConfigurationForItemsAtIndexPaths:point:` |
| 下拉刷新 | `UIRefreshControl` |
| 能展开和收起的分组 | `NSDiffableDataSourceSectionSnapshot` |
| 按下标给数据（不用快照） | `UICollectionViewDataSource` 协议 |
| 阻止某一项被选中 | `collectionView:shouldSelectItemAtIndexPath:` |
| 标识用字符串和整数以外的值 | 任何可哈希的对象。不支持 |

## 参见

- [做一个列表](../guides/lists.md)：增删改行、分区、点选、滚动、加载更多、自己的视图
- [`UIScrollView`](ui-scroll-view.md)：列表继承的滚动属性和事件
- [`UICollectionViewDiffableDataSource`](ui-collection-view-diffable-data-source.md)、[`NSDiffableDataSourceSnapshot`](ns-diffable-data-source-snapshot.md)：给列表数据
- [`UICollectionViewListCell`](ui-collection-view-list-cell.md)、[`UIListContentConfiguration`](ui-list-content-configuration.md)：一行显示什么
- [`application`](application.md)：`cellProvider` 出错时的 `error` 事件
