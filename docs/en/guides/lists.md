# Building a list

This guide covers how to use [`UICollectionView`](../api/ui-collection-view.md) to build a list: supplying data, adding, deleting, and changing rows, sections, selection, scrolling to an item, loading more, and placing your own views in cells. The classes involved are [`UICollectionViewDiffableDataSource`](../api/ui-collection-view-diffable-data-source.md), [`NSDiffableDataSourceSnapshot`](../api/ns-diffable-data-source-snapshot.md), [`UICollectionViewListCell`](../api/ui-collection-view-list-cell.md), [`UIListContentConfiguration`](../api/ui-list-content-configuration.md), and [`UICollectionLayoutListConfiguration`](../api/ui-collection-layout-list-configuration.md). For how data is handed to the list and the difference between identifiers and positions, see the [`UICollectionView`](../api/ui-collection-view.md) reference page.

## Recommended approach

- **Use the `'insetGrouped'` appearance and `UICollectionViewListCell`.** This is the rounded-card list from the system Settings, with row heights, separators, and press highlighting built in.
- **Set content with `contentConfiguration`.** When primary text, secondary text, and an image are enough, there is no need to add subviews yourself.
- **Keep data in a `Map` looked up by identifier.** Both `cellProvider` and the selection callback get data by identifier.
- **In the selection callback, first convert to an identifier with `itemIdentifierForIndexPath()`.** The event gives a position, and positions change as data changes; identifiers do not.

## A first list

The code below starts from a blank app, shows a list of orders, prints the order number to the console when a row is tapped, and deletes the first row after two seconds.

```js
application.addEventListener('sceneconnect', (e) => {
  // Create the window and view controller. Every app needs these lines
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // Data: identifier → content
  const orders = new Map([
    ['A1001', { title: 'Coffee beans 500 g', status: 'Shipped' }],
    ['A1002', { title: 'Pour-over kettle', status: 'Awaiting payment' }],
    ['A1003', { title: 'Paper filters, 100 pack', status: 'Delivered' }],
  ]);

  // 1. Create the list: a rounded-card appearance
  const list = new UICollectionView(
    UICollectionViewCompositionalLayout.layoutWithListConfiguration(
      new UICollectionLayoutListConfiguration('insetGrouped')));
  list.registerClass(UICollectionViewListCell, { forCellWithReuseIdentifier: 'row' });

  // 2. Data source: the system calls cellProvider when it needs to display an item
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

  // 3. Supply data: one section, three items
  const snapshot = new NSDiffableDataSourceSnapshot();
  snapshot.appendSectionsWithIdentifiers(['main']);
  snapshot.appendItemsWithIdentifiers(Array.from(orders.keys()));
  source.applySnapshot(snapshot, { animatingDifferences: false });

  // 4. Tapping a row
  list.addEventListener('itemselect', (event) => {
    console.log('Tapped ' + source.itemIdentifierForIndexPath(event.indexPath));
  });

  // 5. Delete the first row after two seconds
  setTimeout(() => {
    const next = source.snapshot();
    next.deleteItemsWithIdentifiers(['A1001']);
    source.applySnapshot(next);
  }, 2000);

  // 6. Fill the view controller
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

**Effect**

- A rounded card appears on screen with three rows; each row has the product name on top and the status in gray below.
- Tap a row: it highlights, and the console prints `Tapped A1002`. **Not verified in the simulator**: selection can only be triggered by a real touch.
- After two seconds the first row disappears with an animation, and the two rows below move up.


The steps above are: create the list, create the data source, supply data, listen for selection, change the data, and place it in the view controller. The following sections reuse the variables `list`, `source`, and `orders`. To try a section on its own, write these lines first:

```js
const orders = new Map([
  ['A1001', { title: 'Coffee beans 500 g', status: 'Shipped' }],
  ['A1002', { title: 'Pour-over kettle', status: 'Awaiting payment' }],
  ['A1003', { title: 'Paper filters, 100 pack', status: 'Delivered' }],
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

## Adding rows

Get a snapshot of the current state from the data source, change it, and hand it back.

```js
orders.set('A1004', { title: 'Digital scale', status: 'Awaiting shipment' });

const next = source.snapshot();
next.appendItemsWithIdentifiers(['A1004']);
source.applySnapshot(next);
```

**Effect**: A "Digital scale" row appears at the end of the list with an animation.

To add it at the very beginning, use `insertItemsWithIdentifiers()`:

```js
const next2 = source.snapshot();
next2.insertItemsWithIdentifiers(['A1004'], { beforeItemWithIdentifier: 'A1001' });
source.applySnapshot(next2);
```

**Effect**: "Digital scale" appears above the "Coffee beans" row.

## Deleting rows

```js
const next3 = source.snapshot();
next3.deleteItemsWithIdentifiers(['A1002', 'A1003']);
source.applySnapshot(next3);
```

**Effect**: These two rows disappear with an animation.

## Changing a row's content

First change the data you stored yourself, then tell the snapshot that this item's content changed.

```js
orders.set('A1002', { title: 'Pour-over kettle', status: 'Paid' });

const next4 = source.snapshot();
next4.reconfigureItemsWithIdentifiers(['A1002']);
source.applySnapshot(next4);
```

**Effect**: The system calls `cellProvider` again for this item, and the row's secondary text becomes "Paid". Measured: in this case `cellProvider` still gets the row's original cell.

> **Note:** Changing only the data in `orders` does not change the list. The snapshot holds only identifiers; if the identifiers have not changed, the system thinks there is nothing to update.

## Replacing the whole set of data

When the data is replaced wholesale and row-by-row animations are not needed, use `applySnapshotUsingReloadData()`.

```js
const fresh = new NSDiffableDataSourceSnapshot();
fresh.appendSectionsWithIdentifiers(['main']);
const newIds = ['B2001', 'B2002'];
fresh.appendItemsWithIdentifiers(newIds);
source.applySnapshotUsingReloadData(fresh);
```

**Effect**: The list shows the new set directly, without insertion or deletion animations. `newIds` is a newly obtained set of identifiers.

## Splitting into sections

```js
const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['unpaid', 'done']);
snapshot.appendItemsWithIdentifiers(['A1002'], { intoSectionWithIdentifier: 'unpaid' });
snapshot.appendItemsWithIdentifiers(['A1001', 'A1003'], { intoSectionWithIdentifier: 'done' });
source.applySnapshot(snapshot);
```

**Effect**: The list is split into two cards, the first with one row and the second with two. How it looks on screen is **not verified in the simulator**.

## Waiting for the list to finish updating

`applySnapshot()` returns a Promise that fulfills when the list has finished updating. With animation, that is when the animation ends.

```js
async function removeAndScrollToTop() {
  const next5 = source.snapshot();
  next5.deleteItemsWithIdentifiers(['A1003']);
  await source.applySnapshot(next5);
  list.scrollToItemAtIndexPath({ section: 0, item: 0 }, { atScrollPosition: ['top'] });
}
removeAndScrollToTop();
```

**Effect**: After the animation of the "Paper filters" row disappearing ends, the list scrolls back to the top. Measured: an animated update fulfills after about half a second.

## Doing something when a row is tapped

```js
/** @param {string | number} id */
function openOrder(id) {
  console.log('Opening order ' + id);
}

list.addEventListener('itemselect', (event) => {
  const id = source.itemIdentifierForIndexPath(event.indexPath);
  if (id === null) return;
  openOrder(id);
  list.deselectItemAtIndexPath(event.indexPath, { animated: true });
});
```

**Effect**: Tap a row: `openOrder()` runs and the row's highlight fades out. **Not verified in the simulator**. Replace `openOrder` with the app's own code for opening a detail view controller.

`id` may be `null`: the callback runs a little later, and if the data changed in the meantime, there may no longer be an item at that position.

## Scrolling to an item

```js
const where = source.indexPathForItemIdentifier('A1003');
if (where !== null) {
  list.scrollToItemAtIndexPath(where, { atScrollPosition: ['centeredVertically'], animated: true });
}
```

**Effect**: The list scrolls so that the "Paper filters" row stops in the middle of the visible area.

## Loading more near the bottom

`beforedisplay` fires each time an item is about to appear on screen.

```js
let loading = false;
function loadMore() {
  if (loading) return;
  loading = true;
  console.log('Loading the next page');
}

list.addEventListener('beforedisplay', (event) => {
  const last = list.numberOfItemsInSection(event.indexPath.section) - 1;
  if (event.indexPath.item >= last - 5) loadMore();
});
```

**Effect**: `loadMore()` is called when scrolling reaches 5 rows from the end. `loadMore()` uses `loading` to prevent duplicate loads; set it back to `false` when loading completes.

## Placing your own views in a cell

When primary text, secondary text, and an image are not enough, add your own views to the cell's `contentView`. Cells are reused, so create the subviews only the first time a cell is used, and afterward change only the content.

```js
/** @type {WeakMap<UICollectionViewCell, UILabel>} */
const priceLabels = new WeakMap();   // cell → the price label on it

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

In `cellProvider`, after getting the cell, call `priceLabelOf(cell).text = '$128'`.

**Effect**: Each row has a price on its right. How it looks on screen is **not verified in the simulator**; measured: subviews can be added to `contentView`, and when the same cell is gotten again it is the same JS object.

## Switching to a different appearance

```js
const config = new UICollectionLayoutListConfiguration('plain');
config.showsSeparators = false;
const plainList = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(config));
```

**Effect**: A list whose rows span the full width, with no separators. How it looks on screen is **not verified in the simulator**.

> **Note:** The configuration is copied into the layout at the moment of `layoutWithListConfiguration()`. Changing `config` afterward does not change lists already created.


## See also

- [`UICollectionView`](../api/ui-collection-view.md): lists, identifiers, sections and items, registering and getting cells
- [`NSDiffableDataSourceSnapshot`](../api/ns-diffable-data-source-snapshot.md): all snapshot methods and errors
- [`UICollectionViewDiffableDataSource`](../api/ui-collection-view-diffable-data-source.md): the rules for `cellProvider`
- [`UICollectionViewCell`](../api/ui-collection-view-cell.md): `contentView` and `contentConfiguration`
- [Building a scrolling view](scrolling.md): use a scroll view when there is not much content and no reuse is needed
