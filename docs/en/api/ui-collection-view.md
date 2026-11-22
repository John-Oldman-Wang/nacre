---
type: reference
native: UICollectionView
status: partial
---

# `UICollectionView`

**`UICollectionView`** represents a scrollable list. It creates views only for the few rows visible on screen; after a row scrolls off screen, its view is reused to display the row that scrolls in. So a list with thousands of rows uses about as much memory as one with dozens.

The list doesn't store data directly. Data is handed to it in two parts: **which items exist and in what order** goes in a snapshot, which holds only identifiers, one per item; **what each item looks like** is written in the data source's `cellProvider` function, which the system calls when it needs to display an item and which returns a cell with its content set. When the data changes, you don't tell the list "row 3 was deleted": you build a new snapshot and hand it to the data source, and the system compares the two snapshots and works out which rows to insert, delete, and move.

These classes are used together with the list:

| Class | What it is |
| --- | --- |
| `UICollectionView` (this page) | The list |
| [`UICollectionViewDiffableDataSource`](ui-collection-view-diffable-data-source.md) | The data source. It decides what the list displays |
| [`NSDiffableDataSourceSnapshot`](ns-diffable-data-source-snapshot.md) | The snapshot. A manifest of "which sections exist and which items each section contains" |
| [`NSIndexPath`](ns-index-path.md) | An item's position: which item in which section |
| [`UICollectionReusableView`](ui-collection-reusable-view.md) | The base class for reusable views in a list |
| [`UICollectionViewCell`](ui-collection-view-cell.md) | The cell. An item's view on screen |
| [`UICollectionViewListCell`](ui-collection-view-list-cell.md) | The cell used by list layouts |
| [`UIListContentConfiguration`](ui-list-content-configuration.md) | A row's content: primary text, secondary text, image |
| [`UICollectionViewLayout`](ui-collection-view-layout.md) | The base class for layout objects |
| [`UICollectionViewCompositionalLayout`](ui-collection-view-compositional-layout.md) | The layout used by lists |
| [`UICollectionLayoutListConfiguration`](ui-collection-layout-list-configuration.md) | The list's appearance: rounded cards, edge to edge, separators |

The list is a [scroll view](ui-scroll-view.md): it has all of the scroll view's properties and events.

The behavior on this group of pages has been verified in acceptance tests in the simulator (iPhone Air, iOS 27.2), except where marked "not verified in the simulator". The on-screen appearance hasn't been checked item by item.

**Inheritance**: `EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → [`UIScrollView`](ui-scroll-view.md) → `UICollectionView`

For how to build a list, add, delete, and update rows, handle selection, and load more, see the guide [Building a list](../guides/lists.md).

## Constructor

[`UICollectionView()`](ui-collection-view/constructor.md)

Creates a list with a layout object.

## Instance properties

Also inherits properties from [`UIScrollView`](ui-scroll-view.md) and [`UIView`](ui-view.md). Inherited properties commonly used with lists are [`contentOffset`](ui-scroll-view/contentoffset.md) and [`keyboardDismissMode`](ui-scroll-view/keyboarddismissmode.md).

| Property | Description |
| --- | --- |
| [`collectionViewLayout`](ui-collection-view/collectionviewlayout.md) <small>read-only</small> | The layout object given at creation |
| [`dataSource`](ui-collection-view/datasource.md) <small>read-only</small> | The data source attached to it |
| [`allowsSelection`](ui-collection-view/allowsselection.md) | Whether the user can select items |
| [`allowsMultipleSelection`](ui-collection-view/allowsmultipleselection.md) | Whether multiple items can be selected at once |
| [`numberOfSections`](ui-collection-view/numberofsections.md) <small>read-only</small> | The current number of sections |
| [`visibleCells`](ui-collection-view/visiblecells.md) <small>read-only</small> | The cells currently on screen |
| [`indexPathsForVisibleItems`](ui-collection-view/indexpathsforvisibleitems.md) <small>read-only</small> | The positions of the items currently on screen |
| [`indexPathsForSelectedItems`](ui-collection-view/indexpathsforselecteditems.md) <small>read-only</small> | The positions of the selected items |

## Instance methods

Also inherits methods from [`UIScrollView`](ui-scroll-view.md) and [`UIView`](ui-view.md).

Cells:

| Method | Description |
| --- | --- |
| [`registerClass()`](ui-collection-view/registerclass.md) | Registers a kind of cell |
| [`dequeueReusableCellWithReuseIdentifier()`](ui-collection-view/dequeuereusablecellwithreuseidentifier.md) | Gets a cell inside `cellProvider` |
| [`cellForItemAtIndexPath()`](ui-collection-view/cellforitematindexpath.md) | The current cell of an item |
| [`indexPathForCell()`](ui-collection-view/indexpathforcell.md) | Which item a cell is currently displaying |

Queries:

| Method | Description |
| --- | --- |
| [`numberOfItemsInSection()`](ui-collection-view/numberofitemsinsection.md) | How many items a section contains |
| [`indexPathForItemAtPoint()`](ui-collection-view/indexpathforitematpoint.md) | Which item a point falls on |

Selection and scrolling:

| Method | Description |
| --- | --- |
| [`selectItemAtIndexPath()`](ui-collection-view/selectitematindexpath.md) | Selects an item |
| [`deselectItemAtIndexPath()`](ui-collection-view/deselectitematindexpath.md) | Deselects an item |
| [`scrollToItemAtIndexPath()`](ui-collection-view/scrolltoitematindexpath.md) | Scrolls to an item |

## Events

Listen with `addEventListener()`.

| Event | When it fires |
| --- | --- |
| [`itemselect`](ui-collection-view/itemselect-event.md) | The user selected an item |
| [`itemdeselect`](ui-collection-view/itemdeselect-event.md) | The user made an item no longer selected |
| [`beforedisplay`](ui-collection-view/beforedisplay-event.md) | An item's cell is about to appear on screen |
| [`displayend`](ui-collection-view/displayend-event.md) | An item's cell left the screen |
| [`scroll`](ui-scroll-view/scroll-event.md) and others | The scroll view's eight events, inherited from [`UIScrollView`](ui-scroll-view.md#events); independent of these four |

Rules shared by the four events:

- The event object is [`UICollectionViewItemEvent`](ui-collection-view-item-event.md), with one extra read-only field `indexPath` of type [`NSIndexPath`](ns-index-path.md).
- Not cancelable; `preventDefault()` has no effect.
- The callback runs after the current round of code. `indexPath` is the position at the moment the event occurred; if the data changes before the callback runs, that position may now hold a different item or no item. To use an item over time, first convert it to an identifier with the data source's [`itemIdentifierForIndexPath()`](ui-collection-view-diffable-data-source/itemidentifierforindexpath.md).

## Identifiers

An identifier is the name the app gives each item to distinguish it from the others. It's a string or an integer.

- Within one snapshot, item identifiers must be unique, including across different sections. Section identifiers must likewise be unique.
- `'1'` and `1` are two different identifiers.
- Identifiers must be stable: only when the same item uses the same identifier in two successive snapshots does the system know it's the same item. Use values that don't change, such as order numbers or user IDs, not the item's index in an array.
- Identifiers handed back by the system are typed `string | number`. When looking up data by identifier, first convert it to the type the app uses, for example `orders.get(String(id))`.

## Sections and items

The content of a list has two levels: sections, and the items in each section. Even with only one group of content, there must be one section.

An item's position is represented by [`NSIndexPath`](ns-index-path.md): `section` is the section number and `item` is the item number within the section, both counting from 0. Parameters that take a position accept either an `NSIndexPath` or a plain object such as `{ section: 0, item: 3 }`; values read back are always `NSIndexPath`.

A position isn't an item's identity. Insert a row before an item and its position changes. To remember an item over time, remember its identifier.

| You have | You want | Use |
| --- | --- | --- |
| Position | Identifier | [`source.itemIdentifierForIndexPath(indexPath)`](ui-collection-view-diffable-data-source/itemidentifierforindexpath.md) |
| Identifier | Position | [`source.indexPathForItemIdentifier(id)`](ui-collection-view-diffable-data-source/indexpathforitemidentifier.md) |

## Registering and dequeuing cells

Cells can't be created with `new`. It takes two steps:

1. After creating the list, register a kind of cell with [`registerClass()`](ui-collection-view/registerclass.md) and give it a reuse identifier.
2. In `cellProvider`, get a cell by that reuse identifier with [`dequeueReusableCellWithReuseIdentifier()`](ui-collection-view/dequeuereusablecellwithreuseidentifier.md). If a reusable one is available you get it; otherwise a new one is created.

A reuse identifier and an item identifier are different things. A reuse identifier means "which kind of cell", and a list usually has only one or two.

Cells are reused: after an item scrolls off screen, its cell isn't destroyed but kept to display other items. So the cell `cellProvider` receives may be new, or may still carry another item's content. Set all of the cell's content every time; keep each item's data in the app's own `Map` or array and look it up by identifier, rather than storing data on the cell.

## Examples

### Order list

Starting from a blank app, show a list of orders, print the order number to the console when a row is tapped, and delete the first row after two seconds.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

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
    console.log('Tapped ' + source.itemIdentifierForIndexPath(event.indexPath));
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

**Effect**

- A rounded card appears on screen with three rows; each row shows the product name on top and the status in gray below.
- Tapping a row highlights it, and the console prints `Tapped A1002`. **Not verified in the simulator**: selection can only be triggered by a real touch.
- After two seconds the first row disappears with an animation, and the two rows below move up.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[UICollectionView alloc] initWithFrame:CGRectZero collectionViewLayout:layout]` | `new UICollectionView(layout)` |
| `[list registerClass:UICollectionViewListCell.class forCellWithReuseIdentifier:@"row"]` | `list.registerClass(UICollectionViewListCell, { forCellWithReuseIdentifier: 'row' })` |
| `[list dequeueReusableCellWithReuseIdentifier:@"row" forIndexPath:indexPath]` | `list.dequeueReusableCellWithReuseIdentifier('row', { forIndexPath: indexPath })` |
| `[list scrollToItemAtIndexPath:path atScrollPosition:UICollectionViewScrollPositionTop animated:YES]` | `list.scrollToItemAtIndexPath(path, { atScrollPosition: ['top'], animated: true })` |
| `collectionView:didSelectItemAtIndexPath:` (delegate method) | `itemselect` event, with the position in `event.indexPath` |
| `collectionView:didDeselectItemAtIndexPath:` (delegate method) | `itemdeselect` event |
| `collectionView:willDisplayCell:forItemAtIndexPath:` (delegate method) | `beforedisplay` event |
| `collectionView:didEndDisplayingCell:forItemAtIndexPath:` (delegate method) | `displayend` event |

Differences from ObjC:

- For misuse (duplicate identifiers, nonexistent positions, dequeuing a cell outside `cellProvider`), the system throws exceptions that crash the app; in JS they're `TypeError`s you can `catch`.
- `NSNotFound` is replaced with -1.
- In ObjC an identifier can be any hashable object; in JS it's a string or an integer.

## See also

- [Building a list](../guides/lists.md): adding, deleting, and updating rows, sections, selection, scrolling, loading more, your own views
- [`UIScrollView`](ui-scroll-view.md): the scroll properties and events the list inherits
- [`UICollectionViewDiffableDataSource`](ui-collection-view-diffable-data-source.md), [`NSDiffableDataSourceSnapshot`](ns-diffable-data-source-snapshot.md): giving the list its data
- [`UICollectionViewListCell`](ui-collection-view-list-cell.md), [`UIListContentConfiguration`](ui-list-content-configuration.md): what a row displays
- [`application`](application.md): the `error` event when `cellProvider` throws
