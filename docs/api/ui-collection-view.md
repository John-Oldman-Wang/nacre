---
type: reference
native: UICollectionView
status: partial
---

# 列表：`UICollectionView`

**`UICollectionView`** 表示一个能滚动的列表。它只为屏幕上看得见的那几行创建视图，行滚出屏幕之后，它的视图被拿去显示新滚进来的行。所以几千行的列表和几十行的列表占用的内存差不多。

列表是[滚动视图](ui-scroll-view.md)，也是[视图](ui-view.md)。滚动视图的属性和事件它都有。

这一页同时说明和列表一起用的几个类：

| 类 | 是什么 |
| --- | --- |
| `UICollectionViewDiffableDataSource` | 数据源。列表显示什么，由它决定 |
| `NSDiffableDataSourceSnapshot` | 快照。一份「有哪些分区、每个分区里有哪些项」的清单 |
| `UICollectionViewCell`、`UICollectionViewListCell` | 单元格。一项在屏幕上的视图 |
| `UIListContentConfiguration` | 一行的内容：主文字、副文字、图片 |
| `UICollectionLayoutListConfiguration`、`UICollectionViewCompositionalLayout` | 列表的外观和布局 |
| `NSIndexPath` | 一项的位置：第几个分区的第几项 |

这一页里的行为都在模拟器（iPhone Air，iOS 27.2）的验收用例里验证过，标了「未在模拟器验证」的除外。屏幕上的样子没有逐项核对。

## 数据怎么给列表

列表不直接存数据。数据分成两部分，分别交给它：

- **有哪些项、什么顺序**：放在快照里。快照里只有标识，一项一个，比如订单号。
- **每一项长什么样**：写在数据源的 `cellProvider` 函数里。系统要显示某一项时调它，把这一项的标识给它，它返回设好内容的单元格。

改数据时不用告诉列表「第 3 行删了、第 0 行前面插了一行」。建一份新的快照交给数据源，系统比较前后两份，自己算出哪些行要插入、删除、移动。

## 标识是什么

标识是你给每一项起的名字，用来区分它和别的项。它是字符串或者整数。

- 同一个快照里，项的标识不能重复，不同分区里的项也不能重复。分区的标识同样不能重复。
- `'1'` 和 `1` 是两个不同的标识。
- 标识要稳定：同一项在前后两份快照里用同一个标识，系统才知道它是同一项。用订单号、用户 id 这类不会变的值，不要用它在数组里的下标。
- 系统交回来的标识，类型上是 `string | number`。按标识取数据时先转成你用的那一种，比如 `orders.get(String(id))`。

## 单元格是复用的

一项滚出屏幕后，它的单元格不销毁，留着显示别的项。所以 `cellProvider` 拿到的单元格可能是新的，也可能上面还留着另一项的内容。

- **每次都把单元格上的内容整个设一遍。** 不要只设变了的部分。
- **不要用单元格记数据。** 一项的数据放在你自己的 `Map` 或数组里，按标识取。

## `cellProvider` 是当场执行的

系统要显示一项时调 `cellProvider`，等它返回单元格。它执行期间界面不动。

- 只在里面做两件事：取单元格，设内容。不要在里面发请求或做大量计算。
- 它抛出异常或者没有返回单元格时，App 不会崩。异常从 [`application` 的 `error` 事件](application.md)报出来，这一项显示成空白。

## 推荐的做法

- **用 `'insetGrouped'` 外观和 `UICollectionViewListCell`。** 这是系统设置里那种圆角卡片的列表，行高、分隔线、按下的高亮都是现成的。
- **内容用 `contentConfiguration` 设。** 主文字、副文字、图片三样够用时不用自己加子视图。
- **数据放在按标识查的 `Map` 里。** `cellProvider` 和点选的回调都按标识取数据。
- **点选的回调里先用 `itemIdentifierForIndexPath()` 换成标识。** 事件给的是位置，位置会随数据变，标识不会。

## 完整例子

下面的代码从空白 App 开始，显示一个订单列表，点一行在控制台输出订单号，两秒后删掉第一行。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 数据：标识 → 内容
  const orders = new Map([
    ['A1001', { title: '咖啡豆 500 g', status: '已发货' }],
    ['A1002', { title: '手冲壶', status: '待付款' }],
    ['A1003', { title: '滤纸 100 张', status: '已签收' }],
  ]);

  // 1. 建列表：圆角卡片的外观
  const list = new UICollectionView(
    UICollectionViewCompositionalLayout.layoutWithListConfiguration(
      new UICollectionLayoutListConfiguration('insetGrouped')));
  list.registerClass(UICollectionViewListCell, { forCellWithReuseIdentifier: 'row' });

  // 2. 数据源：系统要显示一项时调 cellProvider
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

  // 3. 放数据：一个分区，三项
  const snapshot = new NSDiffableDataSourceSnapshot();
  snapshot.appendSectionsWithIdentifiers(['main']);
  snapshot.appendItemsWithIdentifiers(Array.from(orders.keys()));
  source.applySnapshot(snapshot, { animatingDifferences: false });

  // 4. 点一行
  list.addEventListener('itemselect', (event) => {
    console.log('点了 ' + source.itemIdentifierForIndexPath(event.indexPath));
  });

  // 5. 两秒后删掉第一行
  setTimeout(() => {
    const next = source.snapshot();
    next.deleteItemsWithIdentifiers(['A1001']);
    source.applySnapshot(next);
  }, 2000);

  // 6. 铺满页面
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

## 常见用法

下面的例子沿用完整例子里的 `list`、`source`、`orders`。

### 加几行

从数据源拿一份现在的快照，改完交回去。

```js
orders.set('A1004', { title: '电子秤', status: '待发货' });

const next = source.snapshot();
next.appendItemsWithIdentifiers(['A1004']);
source.applySnapshot(next);
```

**效果**：列表末尾带动画地多出一行「电子秤」。

要加在最前面，用 `insertItemsWithIdentifiers()`：

```js
const next = source.snapshot();
next.insertItemsWithIdentifiers(['A1004'], { beforeItemWithIdentifier: 'A1001' });
source.applySnapshot(next);
```

**效果**：「电子秤」出现在「咖啡豆」那一行的上面。

### 删几行

```js
const next = source.snapshot();
next.deleteItemsWithIdentifiers(['A1002', 'A1003']);
source.applySnapshot(next);
```

**效果**：这两行带动画地消失。

### 改一行的内容

先改你自己存的数据，再告诉快照这一项的内容变了。

```js
orders.set('A1002', { title: '手冲壶', status: '已付款' });

const next = source.snapshot();
next.reconfigureItemsWithIdentifiers(['A1002']);
source.applySnapshot(next);
```

**效果**：系统为这一项再调一次 `cellProvider`，这一行的副文字变成「已付款」。实测这时 `cellProvider` 取到的还是这一行原来的那个单元格。

> **注意**：只改 `orders` 里的数据，列表不会变。快照里只有标识，标识没变，系统就认为没有东西要更新。

### 整个换一批数据

数据整体换掉、不需要逐行动画时，用 `applySnapshotUsingReloadData()`。

```js
const fresh = new NSDiffableDataSourceSnapshot();
fresh.appendSectionsWithIdentifiers(['main']);
fresh.appendItemsWithIdentifiers(newIds);
source.applySnapshotUsingReloadData(fresh);
```

**效果**：列表直接显示新的一批，没有插入和删除的动画。这里的 `newIds` 是你新拿到的一组标识。

### 分成几个分区

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['unpaid', 'done']);
snapshot.appendItemsWithIdentifiers(['A1002'], { intoSectionWithIdentifier: 'unpaid' });
snapshot.appendItemsWithIdentifiers(['A1001', 'A1003'], { intoSectionWithIdentifier: 'done' });
source.applySnapshot(snapshot);
```

**效果**：列表分成两张卡片，第一张一行，第二张两行。屏幕上的样子**未在模拟器验证**。

### 等列表更新完

`applySnapshot()` 返回一个 Promise，列表更新完时兑现。带动画时是动画结束的时候。

```js
async function removeAndScrollToTop() {
  const next = source.snapshot();
  next.deleteItemsWithIdentifiers(['A1003']);
  await source.applySnapshot(next);
  list.scrollToItemAtIndexPath({ section: 0, item: 0 }, { atScrollPosition: ['top'] });
}
removeAndScrollToTop();
```

**效果**：「滤纸」那一行消失的动画结束后，列表滚回最上面。实测带动画的一次更新大约半秒后兑现。

### 点一行时做事

```js
list.addEventListener('itemselect', (event) => {
  const id = source.itemIdentifierForIndexPath(event.indexPath);
  if (id === null) return;
  openOrder(id);
  list.deselectItemAtIndexPath(event.indexPath, { animated: true });
});
```

**效果**：点一行，执行 `openOrder()`，这一行的高亮淡出。**未在模拟器验证**。这里的 `openOrder` 是你自己的函数。

`id` 可能是 `null`：回调是稍后执行的，这期间数据变了的话，那个位置上可能已经没有项。

### 滚到某一项

```js
const where = source.indexPathForItemIdentifier('A1003');
if (where !== null) {
  list.scrollToItemAtIndexPath(where, { atScrollPosition: ['centeredVertically'], animated: true });
}
```

**效果**：列表滚动，让「滤纸」那一行停在可见区域的中间。

### 快到底时加载更多

每一项即将出现在屏幕上时派发 `beforedisplay`。

```js
list.addEventListener('beforedisplay', (event) => {
  const last = list.numberOfItemsInSection(event.indexPath.section) - 1;
  if (event.indexPath.item >= last - 5) loadMore();
});
```

**效果**：滚到离末尾还有 5 行时调用 `loadMore()`。这里的 `loadMore` 是你自己的函数，它要自己防止重复加载。

### 在单元格里放自己的视图

主文字、副文字、图片不够用时，把自己的视图加到单元格的 `contentView` 上。单元格是复用的，所以只在它第一次用的时候建子视图，之后每次只改内容。

```js
const priceLabels = new WeakMap();   // 单元格 → 它上面的价格标签

/** @param {UICollectionViewCell} cell */
function priceLabelOf(cell) {
  let label = priceLabels.get(cell);
  if (label === undefined) {
    label = new UILabel();
    label.translatesAutoresizingMaskIntoConstraints = false;
    cell.contentView.addSubview(label);
    NSLayoutConstraint.activateConstraints([
      label.trailingAnchor.constraintEqualToAnchor(cell.contentView.trailingAnchor, { constant: -16 }),
      label.centerYAnchor.constraintEqualToAnchor(cell.contentView.centerYAnchor),
    ]);
    priceLabels.set(cell, label);
  }
  return label;
}
```

在 `cellProvider` 里取到单元格之后调 `priceLabelOf(cell).text = '¥ 128'`。

**效果**：每行右侧多一个价格。屏幕上的样子**未在模拟器验证**；实测 `contentView` 里能加子视图，同一个单元格再次取到时是同一个 JS 对象。

### 换一种外观

```js
const config = new UICollectionLayoutListConfiguration('plain');
config.showsSeparators = false;
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(config));
```

**效果**：每行通栏、没有分隔线的列表。屏幕上的样子**未在模拟器验证**。

> **注意**：配置在 `layoutWithListConfiguration()` 的那一刻被复制进布局。之后再改 `config`，已经建好的列表不变。

## 概念

### 分区和项

列表里的内容分两层：分区，和分区里的项。只有一组内容时也要有一个分区。

`NSIndexPath` 表示一项的位置，有两个数：`section` 是第几个分区，`item` 是分区里的第几项，都从 0 数。需要位置的参数可以给 `NSIndexPath`，也可以给 `{ section: 0, item: 3 }` 这样的普通对象；读出来的都是 `NSIndexPath`。

位置不是一项的身份。在它前面插一行，它的位置就变了。要长期记住一项，记它的标识。

| 手里有 | 想要 | 用 |
| --- | --- | --- |
| 位置 | 标识 | `source.itemIdentifierForIndexPath(indexPath)` |
| 标识 | 位置 | `source.indexPathForItemIdentifier(id)` |

### 快照

快照是一份清单，记着有哪些分区、每个分区里有哪些项、什么顺序。它只是数据，改它不影响屏幕。交给 `applySnapshot()` 之后列表才变。

得到快照有两种方式：

| 方式 | 得到什么 | 什么时候用 |
| --- | --- | --- |
| `new NSDiffableDataSourceSnapshot()` | 空的快照 | 第一次放数据；数据整体换掉 |
| `source.snapshot()` | 列表现在的数据的一份副本 | 在现有数据上增、删、改 |

`reloadItemsWithIdentifiers()` 和 `reconfigureItemsWithIdentifiers()` 都表示「这一项的内容变了」，区别在单元格：

| 方法 | 应用快照时 |
| --- | --- |
| `reconfigureItemsWithIdentifiers()` | 在原来的单元格上再调一次 `cellProvider`。一般用这个 |
| `reloadItemsWithIdentifiers()` | 换一个单元格，再调 `cellProvider` |

### 单元格的登记和取用

单元格不能用 `new` 建。分两步：

1. 建列表之后，用 `registerClass()` 登记一种单元格，给它一个复用标识。
2. 在 `cellProvider` 里用 `dequeueReusableCellWithReuseIdentifier()` 按这个复用标识取。有能复用的就给复用的，没有就新建。

复用标识和项的标识是两回事。复用标识表示「哪一种单元格」，一个列表通常只有一两种。

取单元格有三条限制，违反时抛 `TypeError`：

- 只能在 `cellProvider` 里取。
- 一次 `cellProvider` 只能取一个。
- `forIndexPath` 必须是 `cellProvider` 收到的那个 `indexPath`。

### 内容配置是一份副本

`UIListContentConfiguration` 是一份数据。把它写给 `cell.contentConfiguration` 时，单元格存下的是副本。

```js
const content = cell.defaultContentConfiguration();
content.text = '第一次';
cell.contentConfiguration = content;
content.text = '第二次';
```

**效果**：单元格显示「第一次」。第四行改的是你手里的那一份，单元格里的副本不变。要让它显示「第二次」，再赋值一次。

读 `cell.contentConfiguration` 得到的也是副本，改它同样不影响单元格。

### 事件是稍后派发的

列表的四个事件和控件事件一样，回调排在当前这一轮代码之后执行。事件对象上的 `indexPath` 是事件发生那一刻的位置。回调执行前数据变了的话，这个位置上可能已经是另一项，或者没有项。

## 成员说明

### 继承关系

```
NSObject → UIResponder → UIView → UIScrollView → UICollectionView
NSObject → UIResponder → UIView → UICollectionReusableView → UICollectionViewCell → UICollectionViewListCell
```

这些类都不能用 `class X extends …` 继承，见[原生类](native-classes.md)。

### `UICollectionView`

#### 创建

```js
const list = new UICollectionView(layout);
```

`layout` 是布局对象，现在只能用 `UICollectionViewCompositionalLayout.layoutWithListConfiguration()` 建。不是布局对象时抛 `TypeError`。

新建的列表 `frame` 是 0 × 0，用约束或 `frame` 给它位置和大小。

#### 属性

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `collectionViewLayout` | `UICollectionViewLayout` | 是 | 否 | 建的时候给的 | 布局对象 |
| `dataSource` | `UICollectionViewDiffableDataSource` 或 `null` | 是 | 否 | `null` | 接在它上面的数据源。建数据源时自动接上 |
| `allowsSelection` | `boolean` | 是 | 是 | `true` | `true`：用户可以点选。`false`：点了没有反应，不派发 `itemselect` |
| `allowsMultipleSelection` | `boolean` | 是 | 是 | `false` | `true`：可以同时选中多项，再点一次取消。`false`：选中一项时前一项取消选中 |
| `numberOfSections` | `number` | 是 | 否 | 1 | 现在有几个分区，是个数。没接数据源时系统报 1（实测） |
| `visibleCells` | `UICollectionViewCell[]` | 是 | 否 | 空数组 | 现在在屏幕上的单元格，顺序不保证 |
| `indexPathsForVisibleItems` | `NSIndexPath[]` | 是 | 否 | 空数组 | 现在在屏幕上的各项的位置，顺序不保证 |
| `indexPathsForSelectedItems` | `NSIndexPath[]` | 是 | 否 | 空数组 | 选中的各项的位置 |

这些值变了没有单独的事件。选中的变化用 `itemselect` 和 `itemdeselect` 得知，屏幕上有哪些项用 `beforedisplay` 和 `displayend` 得知。

#### 方法

| 方法 | 返回 | 说明 |
| --- | --- | --- |
| `registerClass(cellClass, { forCellWithReuseIdentifier })` | 无 | 登记一种单元格。`cellClass` 是 `UICollectionViewCell` 或 `UICollectionViewListCell` 这个类本身 |
| `dequeueReusableCellWithReuseIdentifier(identifier, { forIndexPath })` | 单元格 | 取一个单元格，见[单元格的登记和取用](#单元格的登记和取用)。取到的是登记时给的那个类；类型定义里默认当成 `UICollectionViewListCell` |
| `numberOfItemsInSection(section)` | `number` | 第 `section` 个分区里有几项 |
| `cellForItemAtIndexPath(indexPath)` | 单元格或 `null` | 这一项现在的单元格。它不在屏幕上，或者没有这一项，返回 `null` |
| `indexPathForCell(cell)` | `NSIndexPath` 或 `null` | 这个单元格现在显示的是哪一项。它不在屏幕上返回 `null` |
| `indexPathForItemAtPoint(point)` | `NSIndexPath` 或 `null` | 列表坐标系里的一个点落在哪一项上，坐标的单位是 [pt](units.md)。没落在任何一项上返回 `null` |
| `selectItemAtIndexPath(indexPath, { animated, scrollPosition })` | 无 | 选中一项。`indexPath` 给 `null` 是取消全部选中。不派发 `itemselect` |
| `deselectItemAtIndexPath(indexPath, { animated })` | 无 | 取消选中一项。不派发 `itemdeselect` |
| `scrollToItemAtIndexPath(indexPath, { atScrollPosition, animated })` | 无 | 滚到某一项 |

`animated` 都是可选的，默认 `false`。`scrollPosition` 可选，默认空数组，表示选中时不滚动。`atScrollPosition` 必填。

`scrollPosition` 和 `atScrollPosition` 是字符串数组，表示把这一项停在可见区域的哪里：

| 取值 | 效果 |
| --- | --- |
| `'top'` | 这一项的顶边对齐可见区域的顶边 |
| `'centeredVertically'` | 这一项在可见区域的垂直中间 |
| `'bottom'` | 这一项的底边对齐可见区域的底边 |
| `'left'`、`'centeredHorizontally'`、`'right'` | 横向滚动的列表用，含义同上 |

纵向三个里最多写一个，横向三个里最多写一个。

出错情况：

| 情况 | 抛出 |
| --- | --- |
| `registerClass` 给的不是单元格的类 | `TypeError: registerClass needs UICollectionViewCell or a subclass of it` |
| `registerClass` 没给复用标识，或者是空串 | `TypeError: registerClass needs { forCellWithReuseIdentifier }`、`TypeError: registerClass needs a non-empty forCellWithReuseIdentifier` |
| 不在 `cellProvider` 里取单元格 | `TypeError: dequeueReusableCellWithReuseIdentifier can only be called inside the cellProvider of this collection view's data source` |
| 取的复用标识没登记过 | `TypeError: dequeueReusableCellWithReuseIdentifier: no cell class is registered for the reuse identifier "x"; call registerClass first` |
| 位置上没有项（选中、取消选中、滚动） | `TypeError: scrollToItemAtIndexPath: there is no item at section 1, item 99`，开头是方法名 |
| `numberOfItemsInSection` 没有这个分区 | `TypeError: numberOfItemsInSection: there is no section 3` |
| 滚动位置写了不认识的名字 | `TypeError: atScrollPosition has no value "middle"; expected one of: …` |
| `scrollToItemAtIndexPath` 没给 `atScrollPosition` | `TypeError: scrollToItemAtIndexPath needs { atScrollPosition }` |

#### 事件

用 `addEventListener()` 监听。

| 事件 | 什么时候派发 |
| --- | --- |
| `itemselect` | 用户点选了一项。**未在模拟器验证** |
| `itemdeselect` | 用户让一项不再选中：多选时再点一次，单选时点了另一项。**未在模拟器验证** |
| `beforedisplay` | 一项的单元格即将出现在屏幕上 |
| `displayend` | 一项的单元格离开了屏幕 |

- 四个事件的对象都多一个只读字段 `indexPath`，类型是 `NSIndexPath`。
- 事件不能取消，`preventDefault()` 不起作用。
- 用代码选中、取消选中不派发 `itemselect` 和 `itemdeselect`（实测）。
- 回调稍后执行，见[事件是稍后派发的](#事件是稍后派发的)。
- [滚动视图的事件](ui-scroll-view.md)照常可以监听，和这四个互不影响。

### `UICollectionViewDiffableDataSource`

#### 创建

```js
const source = new UICollectionViewDiffableDataSource(list, { cellProvider });
```

建好就接到 `list` 上，`list.dataSource` 读出来是它。列表持有数据源，不用另外保存引用。

`cellProvider(collectionView, indexPath, itemIdentifier)` 收到三个参数：这个列表、这一项的位置、这一项的标识。它必须返回一个单元格。

| 情况 | 结果 |
| --- | --- |
| 第一个参数不是列表 | `TypeError: UICollectionViewDiffableDataSource needs a UICollectionView` |
| `cellProvider` 不是函数 | `TypeError: UICollectionViewDiffableDataSource: cellProvider must be a function` |
| `cellProvider` 执行时抛了异常 | 异常从 `application` 的 `error` 事件报出来，这一项显示成空白 |
| `cellProvider` 返回的不是单元格 | `error` 事件报 `TypeError: cellProvider must return a UICollectionViewCell, got undefined`，这一项显示成空白 |

#### 方法

| 方法 | 返回 | 说明 |
| --- | --- | --- |
| `snapshot()` | 快照 | 列表现在的数据的一份副本 |
| `applySnapshot(snapshot, { animatingDifferences })` | `Promise<void>` | 让列表显示这份快照。`animatingDifferences` 默认 `true`：差异带动画。更新完时兑现 |
| `applySnapshotUsingReloadData(snapshot)` | `Promise<void>` | 让列表显示这份快照，不算差异，整个重新加载。更新完时兑现 |
| `itemIdentifierForIndexPath(indexPath)` | 标识或 `null` | 这个位置上是哪一项。没有这个位置返回 `null` |
| `indexPathForItemIdentifier(id)` | `NSIndexPath` 或 `null` | 这一项现在在哪。没有这一项返回 `null` |
| `sectionIdentifierForIndex(index)` | 标识或 `null` | 第 `index` 个分区的标识。没有返回 `null` |
| `indexForSectionIdentifier(id)` | `number` | 这个分区排第几。没有返回 -1 |

`snapshot` 不是快照对象时，两个 `apply…` 方法抛 `TypeError`，不返回 Promise。报错是 `applySnapshot needs a NSDiffableDataSourceSnapshot`，开头是方法名。

### `NSDiffableDataSourceSnapshot`

```js
const snapshot = new NSDiffableDataSourceSnapshot();
```

#### 属性

都是只读的。

| 属性 | 类型 | 含义 |
| --- | --- | --- |
| `numberOfSections` | `number` | 一共有几个分区，是个数 |
| `numberOfItems` | `number` | 一共有几项，是个数 |
| `sectionIdentifiers` | 标识的数组 | 全部分区的标识，按顺序 |
| `itemIdentifiers` | 标识的数组 | 全部项的标识，按分区的顺序接在一起 |

#### 查询

| 方法 | 返回 | 说明 |
| --- | --- | --- |
| `numberOfItemsInSection(sectionId)` | `number` | 这个分区里有几项 |
| `itemIdentifiersInSectionWithIdentifier(sectionId)` | 标识的数组 | 这个分区里各项的标识 |
| `sectionIdentifierForSectionContainingItemIdentifier(itemId)` | 标识或 `null` | 这一项在哪个分区。没有这一项返回 `null` |
| `indexOfItemIdentifier(itemId)` | `number` | 这一项在全部项里排第几。没有返回 -1 |
| `indexOfSectionIdentifier(sectionId)` | `number` | 这个分区排第几。没有返回 -1 |

#### 改分区

| 方法 | 说明 |
| --- | --- |
| `appendSectionsWithIdentifiers(ids)` | 在最后加几个分区 |
| `insertSectionsWithIdentifiers(ids, { beforeSectionWithIdentifier })` | 插在某个分区的前面 |
| `insertSectionsWithIdentifiers(ids, { afterSectionWithIdentifier })` | 插在某个分区的后面 |
| `deleteSectionsWithIdentifiers(ids)` | 删掉几个分区和里面的项。不存在的标识忽略 |
| `moveSectionWithIdentifier(id, { beforeSectionWithIdentifier })` | 把一个分区移到另一个的前面。`afterSectionWithIdentifier` 同理 |
| `reloadSectionsWithIdentifiers(ids)` | 标记这几个分区里的项内容变了 |

#### 改项

| 方法 | 说明 |
| --- | --- |
| `appendItemsWithIdentifiers(ids)` | 加到最后一个分区的末尾 |
| `appendItemsWithIdentifiers(ids, { intoSectionWithIdentifier })` | 加到指定分区的末尾 |
| `insertItemsWithIdentifiers(ids, { beforeItemWithIdentifier })` | 插在某一项的前面 |
| `insertItemsWithIdentifiers(ids, { afterItemWithIdentifier })` | 插在某一项的后面 |
| `deleteItemsWithIdentifiers(ids)` | 删掉几项。不存在的标识忽略 |
| `deleteAllItems()` | 删掉全部分区和项 |
| `moveItemWithIdentifier(id, { beforeItemWithIdentifier })` | 把一项移到另一项的前面，可以跨分区。`afterItemWithIdentifier` 同理 |
| `reloadItemsWithIdentifiers(ids)` | 标记这几项内容变了，应用时换一个单元格 |
| `reconfigureItemsWithIdentifiers(ids)` | 标记这几项内容变了，应用时用原来的单元格 |

这些方法都没有返回值。`ids` 是数组。`before…` 和 `after…` 两个键必须给一个，而且只给一个。

出错情况，都抛 `TypeError`，报错开头是方法名：

| 情况 | 报错 |
| --- | --- |
| 标识不是字符串或整数 | `appendItemsWithIdentifiers: identifiers must be strings or integers, got 1.5` |
| `ids` 不是数组 | `appendItemsWithIdentifiers needs an array of identifiers` |
| 要加的标识已经在快照里 | `appendItemsWithIdentifiers: item identifier "pear" is already in the snapshot` |
| 同一次调用里标识重复 | `appendItemsWithIdentifiers: item identifier "x" appears more than once` |
| 还没有分区就加项 | `appendItemsWithIdentifiers: the snapshot has no sections; append a section first` |
| 指的分区不存在 | `appendItemsWithIdentifiers: there is no section with identifier "nope"` |
| 指的项不存在（插入的位置、移动、重新加载、重新设置） | `insertItemsWithIdentifiers: there is no item with identifier "nope"` |
| `before…` 和 `after…` 没给或者都给了 | `insertItemsWithIdentifiers needs exactly one of { beforeItemWithIdentifier } or { afterItemWithIdentifier }` |
| 把一项移到它自己旁边 | `moveItemWithIdentifier: an item cannot be moved next to itself` |

出错时快照保持原样，那一次调用里的标识一个都不会加进去。

### 单元格

三个类都不能用 `new` 建，`new UICollectionViewCell()` 抛 `TypeError`。

`UICollectionReusableView` 的成员：

| 属性 | 类型 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `reuseIdentifier` | `string` 或 `null` | 是 | 否 | 取它时用的复用标识 |

`UICollectionViewCell` 另有：

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `contentView` | `UIView` | 是 | 否 | — | 放自己的子视图的地方。子视图加在它上面，不要直接加在单元格上 |
| `contentConfiguration` | `UIListContentConfiguration` 或 `null` | 是 | 是 | `null` | 单元格的内容。读和写都是副本。写 `null` 清掉 |
| `isSelected` | `boolean` | 是 | 是 | `false` | 这一项是不是选中的。由列表维护，一般不用写 |
| `isHighlighted` | `boolean` | 是 | 是 | `false` | 手指是不是正按在这一项上。由列表维护，一般不用写 |

`UICollectionViewListCell` 另有一个方法 `defaultContentConfiguration()`，没有参数，返回一份和这个列表的外观配套的 `UIListContentConfiguration`，上面没有内容。

### `UIListContentConfiguration`

不能用 `new` 建。从单元格的 `defaultContentConfiguration()` 拿，或者用下面三个类方法：

| 类方法 | 样式 |
| --- | --- |
| `UIListContentConfiguration.cellConfiguration()` | 一行主文字 |
| `UIListContentConfiguration.subtitleCellConfiguration()` | 主文字下面一行副文字 |
| `UIListContentConfiguration.valueCellConfiguration()` | 主文字在左，副文字在右 |

三种样式在屏幕上的样子**未在模拟器验证**，含义来自 Apple 的文档。

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `text` | `string` 或 `null` | 是 | 是 | `null` | 主文字。写数字会转成字符串 |
| `secondaryText` | `string` 或 `null` | 是 | 是 | `null` | 副文字 |
| `image` | [`UIImage`](ui-image.md) 或 `null` | 是 | 是 | `null` | 文字左边的图片。写别的对象抛 `TypeError` |

### 布局

`UICollectionLayoutListConfiguration` 是列表布局的配置：

```js
const config = new UICollectionLayoutListConfiguration('insetGrouped');
```

参数是外观，必填，写错抛 `TypeError`：

| 取值 | 效果 |
| --- | --- |
| `'plain'` | 每行通栏，分区之间没有间隔 |
| `'grouped'` | 分区之间有间隔，行通栏 |
| `'insetGrouped'` | 每个分区是一张左右缩进的圆角卡片 |
| `'sidebar'` | 侧边栏的样式 |
| `'sidebarPlain'` | 侧边栏的样式，分区没有背景 |

五种外观都建得出来（实测），屏幕上的样子**未在模拟器验证**。

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `appearance` | 上表的取值 | 是 | 否 | 建的时候给的 | 外观 |
| `showsSeparators` | `boolean` | 是 | 是 | `true` | `true`：行之间画分隔线。`false`：不画 |
| `backgroundColor` | [颜色](ui-color.md)或 `null` | 是 | 是 | `null` | 列表的底色。`null` 表示用这种外观自带的底色 |
| `headerMode` | `'none'` 或 `'firstItemInSection'` | 是 | 是 | `'none'` | `'none'`：分区没有头。`'firstItemInSection'`：每个分区的第一项当头显示 |

`UICollectionViewCompositionalLayout.layoutWithListConfiguration(config)` 用配置建一个布局对象，交给 `new UICollectionView()`。`config` 不是配置对象时抛 `TypeError`。

`UICollectionViewLayout` 是布局对象的基类。它和 `UICollectionViewCompositionalLayout` 都不能用 `new` 建。

### `NSIndexPath`

```js
const path = new NSIndexPath(0, 3);    // 第 0 个分区的第 3 项
```

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `section` | `number` | 第几个分区，从 0 数 |
| `item` | `number` | 分区里的第几项，从 0 数 |
| `row` | `number` | 和 `item` 是同一个数 |

- 字段只读，写入抛 `TypeError`，和别的[结构体](structs.md)一样。
- 两个数都是非负整数。小数向零取整，负数和转不成数的值抛 `TypeError`。
- `NSIndexPath.indexPathForItem(3, { inSection: 0 })` 和 `NSIndexPath.indexPathForRow(3, { inSection: 0 })` 得到的结果和 `new NSIndexPath(0, 3)` 相同。
- `String(path)` 是 `'NSIndexPath(0, 3)'`。

## 与 iOS 原生写法的对照

如果你在看 Apple 的文档或 iOS 的示例代码，按这张表换成 JS 的写法。

| ObjC | JS |
| --- | --- |
| `[[UICollectionLayoutListConfiguration alloc] initWithAppearance:UICollectionLayoutListAppearanceInsetGrouped]` | `new UICollectionLayoutListConfiguration('insetGrouped')` |
| `[UICollectionViewCompositionalLayout layoutWithListConfiguration:config]` | `UICollectionViewCompositionalLayout.layoutWithListConfiguration(config)` |
| `[[UICollectionView alloc] initWithFrame:CGRectZero collectionViewLayout:layout]` | `new UICollectionView(layout)` |
| `[list registerClass:UICollectionViewListCell.class forCellWithReuseIdentifier:@"row"]` | `list.registerClass(UICollectionViewListCell, { forCellWithReuseIdentifier: 'row' })` |
| `[list dequeueReusableCellWithReuseIdentifier:@"row" forIndexPath:indexPath]` | `list.dequeueReusableCellWithReuseIdentifier('row', { forIndexPath: indexPath })` |
| `[[UICollectionViewDiffableDataSource alloc] initWithCollectionView:list cellProvider:^(…) { … }]` | `new UICollectionViewDiffableDataSource(list, { cellProvider(…) { … } })` |
| `[snapshot appendItemsWithIdentifiers:ids intoSectionWithIdentifier:@"main"]` | `snapshot.appendItemsWithIdentifiers(ids, { intoSectionWithIdentifier: 'main' })` |
| `[source applySnapshot:snapshot animatingDifferences:YES completion:^{ … }]` | `await source.applySnapshot(snapshot, { animatingDifferences: true })` |
| `[source applySnapshotUsingReloadData:snapshot completion:^{ … }]` | `await source.applySnapshotUsingReloadData(snapshot)` |
| `[NSIndexPath indexPathForItem:3 inSection:0]` | `new NSIndexPath(0, 3)` 或 `{ section: 0, item: 3 }` |
| `[list scrollToItemAtIndexPath:path atScrollPosition:UICollectionViewScrollPositionTop animated:YES]` | `list.scrollToItemAtIndexPath(path, { atScrollPosition: ['top'], animated: true })` |
| `collectionView:didSelectItemAtIndexPath:`（委托方法） | `itemselect` 事件，位置在 `event.indexPath` |
| `collectionView:willDisplayCell:forItemAtIndexPath:`（委托方法） | `beforedisplay` 事件 |
| `UICellConfigurationState`、`configurationUpdateHandler` | 未实现 |

和 ObjC 不一样的地方：

- `completion:` 参数换成了返回的 Promise。
- `NSNotFound` 换成了 -1。
- 标识在 ObjC 里可以是任何可哈希的对象，JS 里是字符串或整数。
- `new NSIndexPath(section, item)` 的参数顺序是先分区后项，和 ObjC 的 `indexPathForItem:inSection:` 相反。
- 系统对用错的情况（标识重复、位置不存在、在 `cellProvider` 之外取单元格）是抛出让 App 崩溃的异常，JS 里是可以 `catch` 的 `TypeError`。

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 网格、横向滚动的分区、自定义的排法 | `NSCollectionLayoutSection` 一组、`UICollectionViewFlowLayout` | 未实现。现在只有列表布局 |
| 分区的头和尾用单独的视图 | 补充视图（supplementary view）、`headerMode = 'supplementary'` | 未实现。写 `'supplementary'` 抛 `TypeError`。可以用 `headerMode = 'firstItemInSection'` 把第一项当头 |
| 行右侧的箭头、对勾、删除按钮 | `UICollectionViewListCell.accessories` | 未实现 |
| 左滑出现操作按钮 | `trailingSwipeActionsConfigurationProvider` | 未实现 |
| 改内容配置里文字的字体和颜色、图片的大小 | `UIListContentConfiguration.textProperties` 等 | 未实现。可以在 [`contentView` 里放自己的视图](#在单元格里放自己的视图) |
| 改单元格的背景、选中时的样子 | `backgroundConfiguration`、`configurationUpdateHandler` | 未实现 |
| 拖动排序 | `reorderingHandlers` | 未实现 |
| 长按出菜单 | `collectionView:contextMenuConfigurationForItemsAtIndexPaths:point:` | 未实现 |
| 下拉刷新 | `UIRefreshControl` | 未实现 |
| 能展开和收起的分组 | `NSDiffableDataSourceSectionSnapshot` | 未实现 |
| 按下标给数据（不用快照） | `UICollectionViewDataSource` 协议 | 未实现 |
| 阻止某一项被选中 | `collectionView:shouldSelectItemAtIndexPath:` | 未实现 |
| 标识用字符串和整数以外的值 | 任何可哈希的对象 | 不支持 |

## 参见

- [`UIScrollView`](ui-scroll-view.md)：列表继承的滚动属性和事件
- [`UIView`](ui-view.md)：给列表定位；往 `contentView` 里加子视图
- [Auto Layout](auto-layout.md)：让列表铺满页面、给单元格里的子视图定位
- [`UIImage`](ui-image.md)：内容配置里的图片
- [颜色](ui-color.md)：`backgroundColor` 能写哪些值
- [结构体](structs.md)：`NSIndexPath` 和别的只读值是同一种写法
- [`application`](application.md)：`cellProvider` 出错时的 `error` 事件
