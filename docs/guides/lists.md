# 做一个列表

这一篇讲怎么用 [`UICollectionView`](../api/ui-collection-view.md) 做一个列表：给数据、增删改行、分区、点选、滚到某一项、加载更多、在单元格里放自己的视图。涉及的类有 [`UICollectionViewDiffableDataSource`](../api/ui-collection-view-diffable-data-source.md)、[`NSDiffableDataSourceSnapshot`](../api/ns-diffable-data-source-snapshot.md)、[`UICollectionViewListCell`](../api/ui-collection-view-list-cell.md)、[`UIListContentConfiguration`](../api/ui-list-content-configuration.md) 和 [`UICollectionLayoutListConfiguration`](../api/ui-collection-layout-list-configuration.md)。数据怎么交给列表、标识和位置的区别，见 [`UICollectionView`](../api/ui-collection-view.md) 的参考页。

## 推荐的做法

- **用 `'insetGrouped'` 外观和 `UICollectionViewListCell`。** 这是系统设置里那种圆角卡片的列表，行高、分隔线、按下的高亮都是现成的。
- **内容用 `contentConfiguration` 设。** 主文字、副文字、图片三样够用时不用自己加子视图。
- **数据放在按标识查的 `Map` 里。** `cellProvider` 和点选的回调都按标识取数据。
- **点选的回调里先用 `itemIdentifierForIndexPath()` 换成标识。** 事件给的是位置，位置会随数据变，标识不会。

## 第一个列表

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


上面几步分别是：建列表、建数据源、放数据、监听点选、改数据、放到页面上。下面各节沿用 `list`、`source`、`orders` 这几个变量。单独试某一节时，先写这几行：

```js
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
    const cell = collectionView.dequeueReusableCellWithReuseIdentifier('row', { forIndexPath: indexPath });
    const order = orders.get(String(id));
    const content = cell.defaultContentConfiguration();
    content.text = order ? order.title : '';
    content.secondaryText = order ? order.status : '';
    cell.contentConfiguration = content;
    return cell;
  },
});
const initial = new NSDiffableDataSourceSnapshot();
initial.appendSectionsWithIdentifiers(['main']);
initial.appendItemsWithIdentifiers(Array.from(orders.keys()));
source.applySnapshot(initial, { animatingDifferences: false });
```

## 加几行

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
const next2 = source.snapshot();
next2.insertItemsWithIdentifiers(['A1004'], { beforeItemWithIdentifier: 'A1001' });
source.applySnapshot(next2);
```

**效果**：「电子秤」出现在「咖啡豆」那一行的上面。

## 删几行

```js
const next3 = source.snapshot();
next3.deleteItemsWithIdentifiers(['A1002', 'A1003']);
source.applySnapshot(next3);
```

**效果**：这两行带动画地消失。

## 改一行的内容

先改你自己存的数据，再告诉快照这一项的内容变了。

```js
orders.set('A1002', { title: '手冲壶', status: '已付款' });

const next4 = source.snapshot();
next4.reconfigureItemsWithIdentifiers(['A1002']);
source.applySnapshot(next4);
```

**效果**：系统为这一项再调一次 `cellProvider`，这一行的副文字变成「已付款」。实测这时 `cellProvider` 取到的还是这一行原来的那个单元格。

> **注意**：只改 `orders` 里的数据，列表不会变。快照里只有标识，标识没变，系统就认为没有东西要更新。

## 整个换一批数据

数据整体换掉、不需要逐行动画时，用 `applySnapshotUsingReloadData()`。

```js
const fresh = new NSDiffableDataSourceSnapshot();
fresh.appendSectionsWithIdentifiers(['main']);
const newIds = ['B2001', 'B2002'];
fresh.appendItemsWithIdentifiers(newIds);
source.applySnapshotUsingReloadData(fresh);
```

**效果**：列表直接显示新的一批，没有插入和删除的动画。`newIds` 是新拿到的一组标识。

## 分成几个分区

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['unpaid', 'done']);
snapshot.appendItemsWithIdentifiers(['A1002'], { intoSectionWithIdentifier: 'unpaid' });
snapshot.appendItemsWithIdentifiers(['A1001', 'A1003'], { intoSectionWithIdentifier: 'done' });
source.applySnapshot(snapshot);
```

**效果**：列表分成两张卡片，第一张一行，第二张两行。屏幕上的样子**未在模拟器验证**。

## 等列表更新完

`applySnapshot()` 返回一个 Promise，列表更新完时兑现。带动画时是动画结束的时候。

```js
async function removeAndScrollToTop() {
  const next5 = source.snapshot();
  next5.deleteItemsWithIdentifiers(['A1003']);
  await source.applySnapshot(next5);
  list.scrollToItemAtIndexPath({ section: 0, item: 0 }, { atScrollPosition: ['top'] });
}
removeAndScrollToTop();
```

**效果**：「滤纸」那一行消失的动画结束后，列表滚回最上面。实测带动画的一次更新大约半秒后兑现。

## 点一行时做事

```js
/** @param {string | number} id */
function openOrder(id) {
  console.log('打开订单 ' + id);
}

list.addEventListener('itemselect', (event) => {
  const id = source.itemIdentifierForIndexPath(event.indexPath);
  if (id === null) return;
  openOrder(id);
  list.deselectItemAtIndexPath(event.indexPath, { animated: true });
});
```

**效果**：点一行，执行 `openOrder()`，这一行的高亮淡出。**未在模拟器验证**。`openOrder` 换成 App 自己打开详情页的代码。

`id` 可能是 `null`：回调是稍后执行的，这期间数据变了的话，那个位置上可能已经没有项。

## 滚到某一项

```js
const where = source.indexPathForItemIdentifier('A1003');
if (where !== null) {
  list.scrollToItemAtIndexPath(where, { atScrollPosition: ['centeredVertically'], animated: true });
}
```

**效果**：列表滚动，让「滤纸」那一行停在可见区域的中间。

## 快到底时加载更多

每一项即将出现在屏幕上时派发 `beforedisplay`。

```js
let loading = false;
function loadMore() {
  if (loading) return;
  loading = true;
  console.log('加载下一页');
}

list.addEventListener('beforedisplay', (event) => {
  const last = list.numberOfItemsInSection(event.indexPath.section) - 1;
  if (event.indexPath.item >= last - 5) loadMore();
});
```

**效果**：滚到离末尾还有 5 行时调用 `loadMore()`。`loadMore()` 用 `loading` 防止重复加载，加载完成后把它设回 `false`。

## 在单元格里放自己的视图

主文字、副文字、图片不够用时，把自己的视图加到单元格的 `contentView` 上。单元格是复用的，所以只在它第一次用的时候建子视图，之后每次只改内容。

```js
/** @type {WeakMap<UICollectionViewCell, UILabel>} */
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

## 换一种外观

```js
const config = new UICollectionLayoutListConfiguration('plain');
config.showsSeparators = false;
const plainList = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(config));
```

**效果**：每行通栏、没有分隔线的列表。屏幕上的样子**未在模拟器验证**。

> **注意**：配置在 `layoutWithListConfiguration()` 的那一刻被复制进布局。之后再改 `config`，已经建好的列表不变。


## 参见

- [`UICollectionView`](../api/ui-collection-view.md)：列表、标识、分区和项、单元格的登记和取用
- [`NSDiffableDataSourceSnapshot`](../api/ns-diffable-data-source-snapshot.md)：快照的全部方法和报错
- [`UICollectionViewDiffableDataSource`](../api/ui-collection-view-diffable-data-source.md)：`cellProvider` 的规则
- [`UICollectionViewCell`](../api/ui-collection-view-cell.md)：`contentView` 和 `contentConfiguration`
- [做一个能滚动的页面](scrolling.md)：内容不多、不需要复用时用滚动视图
