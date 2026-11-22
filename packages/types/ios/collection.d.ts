// iOS 原生符号。规则见 types/ios.d.ts 的说明。
//
// 列表：UICollectionView、它的单元格、列表布局，以及用「带标识的快照」给数据
// 的那一套（NSDiffableDataSourceSnapshot、UICollectionViewDiffableDataSource）。
//
// UICollectionView **是 UIScrollView**：滚动视图的属性和事件都在。

/**
 * 一项在列表里的位置：第 `section` 个分区里的第 `item` 项，都从 0 数。
 *
 * 和别的结构体一样，字段**只读**，写入直接抛 `TypeError`。两个字段都是非负
 * 整数：给小数向零取整，给负数抛 `TypeError`。
 *
 * 位置会随数据变：插入、删除之后同一项的 `NSIndexPath` 就不一样了。要长期
 * 记住一项，记它的标识，用到时再用数据源的 `indexPathForItemIdentifier()` 换。
 */
declare class NSIndexPath {
  /** @param section 第几个分区 @param item 分区里的第几项 */
  constructor(section: number, item: number);
  readonly section: number;
  readonly item: number;
  /** 和 `item` 是同一个数。Apple 的表格文档里叫 row。 */
  readonly row: number;
  /** 和 ObjC 的 `+indexPathForItem:inSection:` 对应。 */
  static indexPathForItem(item: number, options: { inSection: number }): NSIndexPath;
  /** 和 ObjC 的 `+indexPathForRow:inSection:` 对应，结果和上一个相同。 */
  static indexPathForRow(row: number, options: { inSection: number }): NSIndexPath;
}

/** 写入时也收带同样字段的普通对象；读出来永远是 `NSIndexPath`。 */
type NSIndexPathLike = NSIndexPath | { section: number; item: number };

/**
 * 分区和项的标识：字符串或者整数。同一个快照里，分区的标识互不相同，项的
 * 标识也互不相同（不同分区里的项也不能重复）。`'1'` 和 `1` 是两个不同的标识。
 */
type DiffableIdentifier = string | number;

/**
 * 列表的外观。
 *
 * - `'plain'` —— 每行通栏，分区之间没有间隔
 * - `'grouped'` —— 分区之间有间隔，行通栏
 * - `'insetGrouped'` —— 分区是左右缩进的圆角卡片
 * - `'sidebar'` —— 侧边栏的样式
 * - `'sidebarPlain'` —— 侧边栏的样式，不带分区的背景
 */
type UICollectionLayoutListAppearance =
  | 'plain' | 'grouped' | 'insetGrouped' | 'sidebar' | 'sidebarPlain';

/**
 * 分区的头从哪来。
 *
 * - `'none'` —— 没有头（默认）
 * - `'firstItemInSection'` —— 每个分区的第一项当头用
 *
 * ObjC 里还有一个 `supplementary`（头是单独的视图），还不支持：写它抛 `TypeError`。
 */
type UICollectionLayoutListHeaderMode = 'none' | 'firstItemInSection';

/**
 * 滚到某一项、或者选中某一项时，把它停在可见区域的哪里。纵向三个里最多选
 * 一个，横向三个里最多选一个；空数组表示不滚动。
 */
type UICollectionViewScrollPosition =
  | 'top' | 'centeredVertically' | 'bottom'
  | 'left' | 'centeredHorizontally' | 'right';

/**
 * 列表自己的四个事件，事件对象都带 `indexPath`。滚动视图的那八个它也有。
 *
 * - `'itemselect'` —— 用户点选了一项。用代码调 `selectItemAtIndexPath()` 不派发
 * - `'itemdeselect'` —— 用户让一项不再选中。用代码取消选中不派发
 * - `'beforedisplay'` —— 一项的单元格即将出现在屏幕上
 * - `'displayend'` —— 一项的单元格离开了屏幕
 */
type UICollectionViewEventType =
  | 'itemselect' | 'itemdeselect' | 'beforedisplay' | 'displayend';

/** 列表那四个事件的事件对象。 */
declare class UICollectionViewItemEvent extends Event {
  constructor(type: string, init?: EventInit & Partial<Pick<UICollectionViewItemEvent, 'indexPath'>>);
  /**
   * 事件发生时这一项的位置。监听器是稍后执行的：这期间数据变了的话，这个
   * 位置上可能已经是另一项。
   */
  readonly indexPath: NSIndexPath;
}

/** 列表上每个事件名对应的事件对象：滚动视图的那些，加上自己的四个。 */
interface UICollectionViewEventMap extends UIScrollViewEventMap {
  'itemselect': UICollectionViewItemEvent;
  'itemdeselect': UICollectionViewItemEvent;
  'beforedisplay': UICollectionViewItemEvent;
  'displayend': UICollectionViewItemEvent;
}

/** 决定单元格怎么排的对象的基类。不能构造。 */
declare class UICollectionViewLayout extends NSObject {
  protected constructor();
}

/**
 * 组合布局。现在只能用列表的配置来建：
 *
 * ```js
 * const layout = UICollectionViewCompositionalLayout.layoutWithListConfiguration(
 *   new UICollectionLayoutListConfiguration('insetGrouped'));
 * ```
 */
declare class UICollectionViewCompositionalLayout extends UICollectionViewLayout {
  private constructor();
  /**
   * 建一个列表布局。配置在这一刻被**复制**进去，之后再改 `configuration`
   * 不影响已经建好的布局。
   */
  static layoutWithListConfiguration(
    configuration: UICollectionLayoutListConfiguration,
  ): UICollectionViewCompositionalLayout;
}

/** 列表布局的配置：外观、分隔线、底色、分区的头。 */
declare class UICollectionLayoutListConfiguration extends NSObject {
  constructor(appearance: UICollectionLayoutListAppearance);
  /** 建的时候给的外观。 */
  readonly appearance: UICollectionLayoutListAppearance;
  /** 行之间画不画分隔线。默认 `true`。 */
  showsSeparators: boolean;
  /** 列表的底色。默认 `null`，表示用这种外观自带的底色。 */
  backgroundColor: ColorValue | null;
  /** 分区的头从哪来。默认 `'none'`。 */
  headerMode: UICollectionLayoutListHeaderMode;
}

/** 列表里能复用的视图的基类。不能构造。 */
declare class UICollectionReusableView extends UIView {
  protected constructor();
  /** 取出它时用的复用标识。 */
  readonly reuseIdentifier: string | null;
}

/**
 * 单元格：列表里一项的视图。**不能用 `new` 建**，只能在数据源的
 * `cellProvider` 里用 `dequeueReusableCellWithReuseIdentifier()` 取。
 *
 * 单元格是复用的：一项滚出屏幕之后，它的单元格会被拿去显示别的项。所以
 * `cellProvider` 每次都要把单元格上的内容整个设一遍，不能假设它是新的。
 */
declare class UICollectionViewCell extends UICollectionReusableView {
  protected constructor();
  /** 放自己的子视图的地方。子视图加在它上面，不要直接加在单元格上。 */
  readonly contentView: UIView;
  /**
   * 单元格的内容：文字、副文字、图片。写进去的是一份**副本**，之后再改那个
   * 对象不影响单元格；读出来的也是副本。写 `null` 清掉，这时 `contentView`
   * 里只有自己加的子视图。
   */
  contentConfiguration: UIListContentConfiguration | null;
  /** 是不是选中的。一般由列表管，不用自己写。 */
  isSelected: boolean;
  /** 是不是按下的。一般由列表管，不用自己写。 */
  isHighlighted: boolean;
}

/** 列表布局里用的单元格：知道列表的外观，能给出配套的默认内容样式。 */
declare class UICollectionViewListCell extends UICollectionViewCell {
  protected constructor();
  /** 给一份和这个列表的外观配套的内容配置，上面还没有内容。 */
  defaultContentConfiguration(): UIListContentConfiguration;
}

/**
 * 一行的内容：主文字、副文字、左边的图片。它只是一份数据，写给单元格的
 * `contentConfiguration` 之后才显示出来。
 *
 * ```js
 * const content = cell.defaultContentConfiguration();
 * content.text = '订单 1024';
 * content.secondaryText = '已发货';
 * cell.contentConfiguration = content;
 * ```
 */
declare class UIListContentConfiguration extends NSObject {
  private constructor();
  /** 一行主文字的样式。 */
  static cellConfiguration(): UIListContentConfiguration;
  /** 主文字下面一行副文字的样式。 */
  static subtitleCellConfiguration(): UIListContentConfiguration;
  /** 主文字在左、副文字在右的样式。 */
  static valueCellConfiguration(): UIListContentConfiguration;
  /** 主文字。默认 `null`。 */
  text: string | null;
  /** 副文字。默认 `null`。 */
  secondaryText: string | null;
  /** 左边的图片。默认 `null`。 */
  image: UIImage | null;
}

/**
 * 列表和网格。数据不直接给它：建一个 `UICollectionViewDiffableDataSource`
 * 接在它上面，往数据源里放快照。
 *
 * ```js
 * const list = new UICollectionView(
 *   UICollectionViewCompositionalLayout.layoutWithListConfiguration(
 *     new UICollectionLayoutListConfiguration('insetGrouped')));
 * list.registerClass(UICollectionViewListCell, { forCellWithReuseIdentifier: 'row' });
 * ```
 */
declare class UICollectionView extends UIScrollView {
  /** @throws {TypeError} `layout` 不是布局对象。 */
  constructor(layout: UICollectionViewLayout);

  /** 建的时候给的布局。 */
  readonly collectionViewLayout: UICollectionViewLayout;
  /** 接在它上面的数据源。还没接是 `null`。 */
  readonly dataSource: UICollectionViewDiffableDataSource | null;
  /** 用户能不能点选。默认 `true`。 */
  allowsSelection: boolean;
  /** 能不能同时选中多项。默认 `false`。 */
  allowsMultipleSelection: boolean;
  /** 现在有几个分区。 */
  readonly numberOfSections: number;
  /** 现在在屏幕上的单元格。顺序不保证。 */
  readonly visibleCells: UICollectionViewCell[];
  /** 现在在屏幕上的各项的位置。顺序不保证。 */
  readonly indexPathsForVisibleItems: NSIndexPath[];
  /** 选中的各项的位置。没有选中的是空数组。 */
  readonly indexPathsForSelectedItems: NSIndexPath[];

  /**
   * 登记一种单元格，取的时候用 `identifier` 指它。
   *
   * @throws {TypeError} `cellClass` 不是 `UICollectionViewCell` 或它的子类；
   * 标识是空串。
   */
  registerClass(
    cellClass: typeof UICollectionViewCell,
    options: { forCellWithReuseIdentifier: string },
  ): void;
  /**
   * 取一个单元格来显示 `forIndexPath` 这一项。有能复用的就复用，没有就新建。
   * **只能在数据源的 `cellProvider` 里调**，一次请求取一个。
   *
   * 取到的是登记时给的那个类。类型上默认当成 `UICollectionViewListCell`（列表
   * 布局配的就是它）；登记的是 `UICollectionViewCell` 时，它上面没有
   * `defaultContentConfiguration()`。
   *
   * @throws {TypeError} 标识没登记过；不在 `cellProvider` 里。
   */
  dequeueReusableCellWithReuseIdentifier<Cell extends UICollectionViewCell = UICollectionViewListCell>(
    identifier: string,
    options: { forIndexPath: NSIndexPathLike },
  ): Cell;
  /** 某个分区里有几项。@throws {TypeError} 没有这个分区。 */
  numberOfItemsInSection(section: number): number;
  /** 某一项现在的单元格。它不在屏幕上，或者没有这一项，返回 `null`。 */
  cellForItemAtIndexPath(indexPath: NSIndexPathLike): UICollectionViewCell | null;
  /** 一个单元格现在显示的是哪一项。它不在屏幕上返回 `null`。 */
  indexPathForCell(cell: UICollectionViewCell): NSIndexPath | null;
  /** 列表坐标系里的一个点落在哪一项上。没落在任何一项上返回 `null`。 */
  indexPathForItemAtPoint(point: CGPointLike): NSIndexPath | null;
  /**
   * 选中一项。`indexPath` 给 `null` 是取消全部选中。不派发 `itemselect`。
   *
   * @throws {TypeError} 没有这一项。
   */
  selectItemAtIndexPath(
    indexPath: NSIndexPathLike | null,
    options?: { animated?: boolean; scrollPosition?: readonly UICollectionViewScrollPosition[] },
  ): void;
  /** 取消选中一项。不派发 `itemdeselect`。@throws {TypeError} 没有这一项。 */
  deselectItemAtIndexPath(indexPath: NSIndexPathLike, options?: { animated?: boolean }): void;
  /**
   * 滚到某一项。
   *
   * @throws {TypeError} 没有这一项。
   */
  scrollToItemAtIndexPath(
    indexPath: NSIndexPathLike,
    options: { atScrollPosition: readonly UICollectionViewScrollPosition[]; animated?: boolean },
  ): void;

  addEventListener<K extends keyof UICollectionViewEventMap>(
    type: K,
    callback: ((event: UICollectionViewEventMap[K]) => void) | null,
    options?: AddEventListenerOptions,
  ): void;
  /** 别的名字当自定义事件：`dispatchEvent` 是公开 API，JS 可以派发自己的事件。 */
  addEventListener(type: string, callback: EventListener | null, options?: AddEventListenerOptions): void;
  removeEventListener<K extends keyof UICollectionViewEventMap>(
    type: K,
    callback: ((event: UICollectionViewEventMap[K]) => void) | null,
  ): void;
  removeEventListener(type: string, callback: EventListener | null): void;
}

/**
 * 列表数据的一份快照：有哪些分区、每个分区里有哪些项、什么顺序。里面只有
 * 标识，没有内容——内容在 `cellProvider` 里按标识去取。
 *
 * 改数据的方式是建一份新的快照（或者从数据源拿一份现在的来改），再交给
 * `applySnapshot()`。系统比较前后两份，算出插入、删除、移动。
 *
 * 所有改动的方法在标识不合规矩时抛 `TypeError`：不是字符串或整数、和已有
 * 的重复、指的那个分区或项不存在。
 */
declare class NSDiffableDataSourceSnapshot extends NSObject {
  constructor();
  /** 一共有几项。 */
  readonly numberOfItems: number;
  /** 一共有几个分区。 */
  readonly numberOfSections: number;
  /** 全部分区的标识，按顺序。 */
  readonly sectionIdentifiers: DiffableIdentifier[];
  /** 全部项的标识，按分区的顺序接起来。 */
  readonly itemIdentifiers: DiffableIdentifier[];

  /** 某个分区里有几项。@throws {TypeError} 没有这个分区。 */
  numberOfItemsInSection(sectionIdentifier: DiffableIdentifier): number;
  /** 某个分区里各项的标识。@throws {TypeError} 没有这个分区。 */
  itemIdentifiersInSectionWithIdentifier(sectionIdentifier: DiffableIdentifier): DiffableIdentifier[];
  /** 一项在哪个分区里。没有这一项返回 `null`。 */
  sectionIdentifierForSectionContainingItemIdentifier(
    itemIdentifier: DiffableIdentifier,
  ): DiffableIdentifier | null;
  /** 一项在全部项里排第几。没有返回 -1。 */
  indexOfItemIdentifier(itemIdentifier: DiffableIdentifier): number;
  /** 一个分区排第几。没有返回 -1。 */
  indexOfSectionIdentifier(sectionIdentifier: DiffableIdentifier): number;

  /** 在最后加几个分区。 */
  appendSectionsWithIdentifiers(sectionIdentifiers: readonly DiffableIdentifier[]): void;
  /** 在某个分区的前面或后面插几个分区。两个键给且只给一个。 */
  insertSectionsWithIdentifiers(
    sectionIdentifiers: readonly DiffableIdentifier[],
    options:
      | { beforeSectionWithIdentifier: DiffableIdentifier }
      | { afterSectionWithIdentifier: DiffableIdentifier },
  ): void;
  /** 删掉几个分区，连同里面的项。不存在的标识忽略。 */
  deleteSectionsWithIdentifiers(sectionIdentifiers: readonly DiffableIdentifier[]): void;
  /** 把一个分区挪到另一个的前面或后面。 */
  moveSectionWithIdentifier(
    sectionIdentifier: DiffableIdentifier,
    options:
      | { beforeSectionWithIdentifier: DiffableIdentifier }
      | { afterSectionWithIdentifier: DiffableIdentifier },
  ): void;
  /** 标记几个分区的内容变了：应用快照时它们的单元格会重新取一遍。 */
  reloadSectionsWithIdentifiers(sectionIdentifiers: readonly DiffableIdentifier[]): void;

  /**
   * 在一个分区的最后加几项。不给 `intoSectionWithIdentifier` 是加到最后一个
   * 分区。
   *
   * @throws {TypeError} 一个分区都没有。
   */
  appendItemsWithIdentifiers(
    itemIdentifiers: readonly DiffableIdentifier[],
    options?: { intoSectionWithIdentifier?: DiffableIdentifier },
  ): void;
  /** 在某一项的前面或后面插几项。两个键给且只给一个。 */
  insertItemsWithIdentifiers(
    itemIdentifiers: readonly DiffableIdentifier[],
    options:
      | { beforeItemWithIdentifier: DiffableIdentifier }
      | { afterItemWithIdentifier: DiffableIdentifier },
  ): void;
  /** 删掉几项。不存在的标识忽略。 */
  deleteItemsWithIdentifiers(itemIdentifiers: readonly DiffableIdentifier[]): void;
  /** 删掉全部分区和项。 */
  deleteAllItems(): void;
  /** 把一项挪到另一项的前面或后面。 */
  moveItemWithIdentifier(
    itemIdentifier: DiffableIdentifier,
    options:
      | { beforeItemWithIdentifier: DiffableIdentifier }
      | { afterItemWithIdentifier: DiffableIdentifier },
  ): void;
  /**
   * 标记几项的内容变了：应用快照时换一个单元格重新取。只是内容变了、想保留
   * 原来那个单元格时用 `reconfigureItemsWithIdentifiers()`。
   */
  reloadItemsWithIdentifiers(itemIdentifiers: readonly DiffableIdentifier[]): void;
  /** 标记几项的内容变了：应用快照时在原来的单元格上重新设一遍内容。 */
  reconfigureItemsWithIdentifiers(itemIdentifiers: readonly DiffableIdentifier[]): void;
}

/**
 * 列表的数据源。建的时候接到一个列表上，之后往里放快照，列表就显示快照里的
 * 那些项。
 *
 * ```js
 * const source = new UICollectionViewDiffableDataSource(list, {
 *   cellProvider(collectionView, indexPath, id) {
 *     const cell = collectionView.dequeueReusableCellWithReuseIdentifier('row', { forIndexPath: indexPath });
 *     const content = cell.defaultContentConfiguration();
 *     content.text = titles.get(id);
 *     cell.contentConfiguration = content;
 *     return cell;
 *   },
 * });
 * ```
 */
declare class UICollectionViewDiffableDataSource extends NSObject {
  /**
   * @param options.cellProvider 系统要显示一项时**当场**调它，要它返回这一项的
   * 单元格。它执行期间系统在等，所以只做取单元格、设内容这两件事。它抛了
   * 异常或者没有返回单元格时，异常从 `application` 的 `error` 事件报出来，
   * 这一项显示成空白。
   * @throws {TypeError} `collectionView` 不是列表；`cellProvider` 不是函数。
   */
  constructor(
    collectionView: UICollectionView,
    options: {
      cellProvider: (
        collectionView: UICollectionView,
        indexPath: NSIndexPath,
        itemIdentifier: DiffableIdentifier,
      ) => UICollectionViewCell;
    },
  );

  /** 现在显示的数据的一份副本。改它不影响列表，改完要 `applySnapshot()`。 */
  snapshot(): NSDiffableDataSourceSnapshot;
  /**
   * 让列表显示这份快照。系统比较它和现在的数据，算出差异。
   *
   * @param options.animatingDifferences 差异带不带动画。默认 `true`。
   * @returns 列表更新完（带动画时是动画结束）兑现。
   * @throws {TypeError} `snapshot` 不是快照。
   */
  applySnapshot(
    snapshot: NSDiffableDataSourceSnapshot,
    options?: { animatingDifferences?: boolean },
  ): Promise<void>;
  /** 让列表显示这份快照，不算差异，整个重新加载。数据整体换掉时用。 */
  applySnapshotUsingReloadData(snapshot: NSDiffableDataSourceSnapshot): Promise<void>;
  /** 某个位置上是哪一项。没有这个位置返回 `null`。 */
  itemIdentifierForIndexPath(indexPath: NSIndexPathLike): DiffableIdentifier | null;
  /** 一项现在在哪个位置。没有这一项返回 `null`。 */
  indexPathForItemIdentifier(itemIdentifier: DiffableIdentifier): NSIndexPath | null;
  /** 第几个分区的标识。没有返回 `null`。 */
  sectionIdentifierForIndex(index: number): DiffableIdentifier | null;
  /** 一个分区排第几。没有返回 -1。 */
  indexForSectionIdentifier(sectionIdentifier: DiffableIdentifier): number;
}
