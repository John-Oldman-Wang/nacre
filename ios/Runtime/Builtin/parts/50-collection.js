// 列表：UICollectionView、单元格、列表布局、快照和数据源
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
//
// 数据用「带标识的快照」给：JS 交一份快照（有哪些分区、每个分区里有哪些项、
// 什么顺序，全是标识），系统要显示某一项时当场来要它的单元格（cellProvider）。
// 原生那一半和「单元格是怎么带回去的」见 NacreCollection.mm 开头
(function (ctx) {
  'use strict';

  const {
    POINT_FIELDS,
    colorArg,
    colorString,
    constructNative,
    define,
    defineNativeClass,
    describeValue,
    eventFieldConverters,
    finalCheck,
    has,
    internalEventHandlers,
    nativeCall,
    nativeCallObject,
    nativeClassCall,
    nativeClassNames,
    nativeGet,
    nativeGetObject,
    nativeGetObjectArray,
    nativeGetOwned,
    nativeSet,
    nativeSetObject,
    nativeSetOwned,
    own,
    ownOne,
    registerBlock,
    releaseBlock,
    requireNative,
    structArg,
    toBoolean,
    toInteger,
    toText,
    toTextOrNull,
  } = ctx;

  // 只能从别处拿到、不能自己 new 的类
  function noPublicInit(newTarget, hint) {
    finalCheck(newTarget);   // 是子类化就先报子类化
    throw new TypeError(
      'Illegal constructor: ' + (nativeClassNames.get(newTarget) || 'this class') + ' ' + hint);
  }

  // ---- NSIndexPath ----
  // 一项的位置：第 section 个分区里的第 item 项。照已有结构体的规矩：JS 类，
  // 字段只读，写入即抛。row 和 item 是同一个数（Apple 的表格文档里叫 row），
  // 不参与枚举，JSON 里只有 section 和 item
  function count(v, what) {
    const n = v === undefined ? 0 : toInteger(v, what);
    if (n < 0) throw new TypeError(what + ' must be a non-negative integer, got ' + n);
    return n;
  }
  function readOnlyField(target, name, value, enumerable) {
    Object.defineProperty(target, name, {
      enumerable,
      get: () => value,
      set() {
        throw new TypeError(
          name + ' is read-only: structs are values, assign a whole new one instead');
      },
    });
  }
  const NSIndexPath = define(globalThis, 'NSIndexPath', class NSIndexPath {
    constructor(section, item) {
      const s = count(section, 'NSIndexPath section');
      const i = count(item, 'NSIndexPath item');
      readOnlyField(this, 'section', s, true);
      readOnlyField(this, 'item', i, true);
      readOnlyField(this, 'row', i, false);
      Object.preventExtensions(this);
    }
    static indexPathForItem(item, options) {
      if (options == null || !has(options, 'inSection')) {
        throw new TypeError('indexPathForItem needs { inSection }');
      }
      return new NSIndexPath(options.inSection, item);
    }
    static indexPathForRow(row, options) {
      if (options == null || !has(options, 'inSection')) {
        throw new TypeError('indexPathForRow needs { inSection }');
      }
      return new NSIndexPath(options.inSection, row);
    }
    toString() { return 'NSIndexPath(' + this.section + ', ' + this.item + ')'; }
  });

  const PATH_FIELDS = ['section', 'item'];
  const toPath = (o) => (o == null ? null : new NSIndexPath(o.section, o.item));
  // 写进去的可以是 NSIndexPath，也可以是带同样字段的普通对象
  function pathArg(value, what) {
    const o = structArg(value, PATH_FIELDS, what);
    const section = Math.trunc(o.section) + 0;
    const item = Math.trunc(o.item) + 0;
    if (section < 0 || item < 0) {
      throw new TypeError(what + ': section and item must be non-negative integers');
    }
    return { section, item };
  }

  // ---- 标识 ----
  // 分区和项的标识：字符串或者整数。'1' 和 1 是两个不同的标识。别的类型不转
  // ——标识是拿来比较的，悄悄转一下（1.5 取整、对象变成 '[object Object]'）
  // 会让两个本来不同的标识撞在一起
  function idArg(value, what) {
    if (typeof value === 'string') return value;
    if (typeof value === 'number' && Number.isSafeInteger(value)) return value + 0;
    throw new TypeError(
      what + ': identifiers must be strings or integers, got ' + describeValue(value));
  }
  // 一组标识：数组，或者别的可迭代对象。字符串不算一组
  function idsArg(value, what) {
    if (value == null || typeof value !== 'object' ||
        typeof value[Symbol.iterator] !== 'function') {
      throw new TypeError(what + ' needs an array of identifiers');
    }
    return Array.from(value, (one) => idArg(one, what));
  }
  // 「插在谁的前面或者后面」：两个键给且只给一个
  function anchorArg(options, beforeKey, afterKey, what) {
    const o = options === undefined || options === null ? {} : options;
    const before = has(o, beforeKey);
    const after = has(o, afterKey);
    if (before === after) {
      throw new TypeError(what + ' needs exactly one of { ' + beforeKey + ' } or { ' + afterKey + ' }');
    }
    return { id: idArg(before ? o[beforeKey] : o[afterKey], what), before };
  }

  // ---- 布局 ----
  defineNativeClass('UICollectionViewLayout', class UICollectionViewLayout extends NSObject {
    constructor() {
      noPublicInit(new.target,
        'cannot be constructed; use UICollectionViewCompositionalLayout.layoutWithListConfiguration()');
    }
  });

  defineNativeClass('UICollectionViewCompositionalLayout',
                    class UICollectionViewCompositionalLayout extends UICollectionViewLayout {
    // 配置在这一刻被复制进布局：之后再改那个配置对象，不影响这个布局
    static layoutWithListConfiguration(configuration) {
      return nativeClassCall('UICollectionViewCompositionalLayout',
                             'layoutWithListConfiguration:', [configuration]);
    }
  });

  // 列表布局的配置。外观只能在建的时候给
  defineNativeClass('UICollectionLayoutListConfiguration',
                    class UICollectionLayoutListConfiguration extends NSObject {
    constructor(appearance) {
      super();
      constructNative(this, new.target, 'UICollectionLayoutListConfiguration', [appearance]);
    }
    get appearance() { requireNative(this, 'appearance'); return nativeGet(this, 'appearance'); }
    get showsSeparators() {
      requireNative(this, 'showsSeparators');
      return nativeGet(this, 'showsSeparators');
    }
    set showsSeparators(value) {
      requireNative(this, 'showsSeparators');
      nativeSet(this, 'showsSeparators', toBoolean(value));
    }
    // null 表示用这种外观自带的底色
    get backgroundColor() {
      requireNative(this, 'backgroundColor');
      return colorString(nativeGetOwned(this, 'backgroundColor'));
    }
    set backgroundColor(value) {
      requireNative(this, 'backgroundColor');
      // 认不出的颜色：colorArg 已经打过警告，保持原值
      const color = colorArg(value, 'backgroundColor');
      if (color === undefined) return;
      nativeSetOwned(this, 'backgroundColor', color);
    }
    get headerMode() { requireNative(this, 'headerMode'); return nativeGet(this, 'headerMode'); }
    set headerMode(value) { requireNative(this, 'headerMode'); nativeSet(this, 'headerMode', value); }
  });

  // ---- 单元格 ----
  // 三个类都不能 new：单元格是列表建的，只能在 cellProvider 里取
  const CELL_HINT =
    'is created by the collection view; get one with dequeueReusableCellWithReuseIdentifier() ' +
    'inside cellProvider';
  defineNativeClass('UICollectionReusableView', class UICollectionReusableView extends UIView {
    constructor() { noPublicInit(new.target, CELL_HINT); }
    get reuseIdentifier() {
      requireNative(this, 'reuseIdentifier');
      return nativeGet(this, 'reuseIdentifier');
    }
  });

  defineNativeClass('UICollectionViewCell',
                    class UICollectionViewCell extends UICollectionReusableView {
    // 放自己的子视图的地方。它是单元格的子视图，单元格持有它
    get contentView() { return nativeGetOwned(this, 'contentView'); }
    // 写进去的是一份副本，读出来的也是：不记持有边，每次读是一个新对象
    get contentConfiguration() {
      requireNative(this, 'contentConfiguration');
      return nativeGetObject(this, 'contentConfiguration');
    }
    set contentConfiguration(value) {
      requireNative(this, 'contentConfiguration');
      nativeSetObject(this, 'contentConfiguration', value === undefined ? null : value);
    }
    get isSelected() { requireNative(this, 'isSelected'); return nativeGet(this, 'isSelected'); }
    set isSelected(value) {
      requireNative(this, 'isSelected');
      nativeSet(this, 'isSelected', toBoolean(value));
    }
    get isHighlighted() {
      requireNative(this, 'isHighlighted');
      return nativeGet(this, 'isHighlighted');
    }
    set isHighlighted(value) {
      requireNative(this, 'isHighlighted');
      nativeSet(this, 'isHighlighted', toBoolean(value));
    }
  });

  defineNativeClass('UICollectionViewListCell',
                    class UICollectionViewListCell extends UICollectionViewCell {
    // 和这个列表的外观配套的一份内容配置，上面还没有内容
    defaultContentConfiguration() {
      return nativeCallObject(this, 'defaultContentConfiguration', []);
    }
  });

  // 一行的内容：主文字、副文字、左边的图片。只是一份数据，写给单元格的
  // contentConfiguration 才显示出来
  defineNativeClass('UIListContentConfiguration',
                    class UIListContentConfiguration extends NSObject {
    constructor() {
      noPublicInit(new.target,
        'has no public initializer; use UIListContentConfiguration.cellConfiguration() or ' +
        'cell.defaultContentConfiguration()');
    }
    static cellConfiguration() {
      return nativeClassCall('UIListContentConfiguration', 'cellConfiguration', []);
    }
    static subtitleCellConfiguration() {
      return nativeClassCall('UIListContentConfiguration', 'subtitleCellConfiguration', []);
    }
    static valueCellConfiguration() {
      return nativeClassCall('UIListContentConfiguration', 'valueCellConfiguration', []);
    }
    get text() { requireNative(this, 'text'); return nativeGet(this, 'text'); }
    set text(value) { requireNative(this, 'text'); nativeSet(this, 'text', toTextOrNull(value)); }
    get secondaryText() {
      requireNative(this, 'secondaryText');
      return nativeGet(this, 'secondaryText');
    }
    set secondaryText(value) {
      requireNative(this, 'secondaryText');
      nativeSet(this, 'secondaryText', toTextOrNull(value));
    }
    get image() { requireNative(this, 'image'); return nativeGetOwned(this, 'image'); }
    set image(value) {
      requireNative(this, 'image');
      nativeSetOwned(this, 'image', value === undefined ? null : value);
    }
  });

  // ---- 列表 ----
  const positionsArg = (value, what) => {
    if (!Array.isArray(value)) throw new TypeError(what + ' needs an array of position names');
    return value.map((name) => String(name));
  };

  defineNativeClass('UICollectionView', class UICollectionView extends UIScrollView {
    constructor(layout) {
      super();
      constructNative(this, new.target, 'UICollectionView', [layout]);
      if (new.target === UICollectionView) own(this, 'collectionViewLayout', layout);
    }

    get collectionViewLayout() { return nativeGetOwned(this, 'collectionViewLayout'); }
    // UIKit 里这条是 weak，数据源靠列表活着（原生那边用关联对象持有），
    // 所以镜像里记成列表持有数据源
    get dataSource() { return nativeGetOwned(this, 'dataSource'); }

    get allowsSelection() {
      requireNative(this, 'allowsSelection');
      return nativeGet(this, 'allowsSelection');
    }
    set allowsSelection(value) {
      requireNative(this, 'allowsSelection');
      nativeSet(this, 'allowsSelection', toBoolean(value));
    }
    get allowsMultipleSelection() {
      requireNative(this, 'allowsMultipleSelection');
      return nativeGet(this, 'allowsMultipleSelection');
    }
    set allowsMultipleSelection(value) {
      requireNative(this, 'allowsMultipleSelection');
      nativeSet(this, 'allowsMultipleSelection', toBoolean(value));
    }
    get numberOfSections() {
      requireNative(this, 'numberOfSections');
      return nativeGet(this, 'numberOfSections');
    }
    // 屏幕上的单元格都是从 dequeue 出去的，那一刻已经记过持有边
    get visibleCells() { return nativeGetObjectArray(this, 'visibleCells'); }
    get indexPathsForVisibleItems() {
      requireNative(this, 'indexPathsForVisibleItems');
      return nativeGet(this, 'indexPathsForVisibleItems').map(toPath);
    }
    get indexPathsForSelectedItems() {
      requireNative(this, 'indexPathsForSelectedItems');
      return nativeGet(this, 'indexPathsForSelectedItems').map(toPath);
    }

    // 登记一种单元格。类过不了桥，传的是类名
    registerClass(cellClass, options) {
      const isCell = cellClass === UICollectionViewCell ||
        (typeof cellClass === 'function' && cellClass.prototype instanceof UICollectionViewCell);
      if (!isCell) {
        throw new TypeError('registerClass needs UICollectionViewCell or a subclass of it');
      }
      const o = options === undefined || options === null ? {} : options;
      if (!has(o, 'forCellWithReuseIdentifier')) {
        throw new TypeError('registerClass needs { forCellWithReuseIdentifier }');
      }
      nativeCall(this, 'registerClass:forCellWithReuseIdentifier:',
                 [nativeClassNames.get(cellClass), toText(o.forCellWithReuseIdentifier)]);
    }

    // 取一个单元格。只能在 cellProvider 里调（原生那边查）。
    //
    // 单元格在复用池里时不在视图树上，没有别的边持有它的包装；包装被回收的话，
    // 挂在它上面的监听器和自定义数据就跟着丢了。所以列表持有它取出过的每一个
    // 单元格。代价：系统清复用池时这些单元格不会释放，要等列表本身释放
    dequeueReusableCellWithReuseIdentifier(identifier, options) {
      const o = options === undefined || options === null ? {} : options;
      const cell = nativeCallObject(
        this, 'dequeueReusableCellWithReuseIdentifier:forIndexPath:',
        [toText(identifier), pathArg(o.forIndexPath, 'dequeueReusableCellWithReuseIdentifier')]);
      ownOne(this, 'cells', cell);
      return cell;
    }

    numberOfItemsInSection(section) {
      return nativeCall(this, 'numberOfItemsInSection:', [toInteger(section, 'section')]);
    }
    cellForItemAtIndexPath(indexPath) {
      return nativeCallObject(this, 'cellForItemAtIndexPath:',
                              [pathArg(indexPath, 'cellForItemAtIndexPath')]);
    }
    indexPathForCell(cell) {
      return toPath(nativeCall(this, 'indexPathForCell:', [cell]));
    }
    indexPathForItemAtPoint(point) {
      return toPath(nativeCall(this, 'indexPathForItemAtPoint:',
                               [structArg(point, POINT_FIELDS, 'indexPathForItemAtPoint')]));
    }

    // indexPath 给 null 是取消全部选中。不派发 itemselect
    selectItemAtIndexPath(indexPath, options) {
      const o = options === undefined || options === null ? {} : options;
      const path = indexPath === null ? null : pathArg(indexPath, 'selectItemAtIndexPath');
      nativeCall(this, 'selectItemAtIndexPath:animated:scrollPosition:',
                 [path, has(o, 'animated') ? toBoolean(o.animated) : false,
                  has(o, 'scrollPosition') ? positionsArg(o.scrollPosition, 'scrollPosition') : []]);
    }
    deselectItemAtIndexPath(indexPath, options) {
      const o = options === undefined || options === null ? {} : options;
      nativeCall(this, 'deselectItemAtIndexPath:animated:',
                 [pathArg(indexPath, 'deselectItemAtIndexPath'),
                  has(o, 'animated') ? toBoolean(o.animated) : false]);
    }
    scrollToItemAtIndexPath(indexPath, options) {
      const o = options === undefined || options === null ? {} : options;
      if (!has(o, 'atScrollPosition')) {
        throw new TypeError('scrollToItemAtIndexPath needs { atScrollPosition }');
      }
      nativeCall(this, 'scrollToItemAtIndexPath:atScrollPosition:animated:',
                 [pathArg(indexPath, 'scrollToItemAtIndexPath'),
                  positionsArg(o.atScrollPosition, 'atScrollPosition'),
                  has(o, 'animated') ? toBoolean(o.animated) : false]);
    }
  });

  // 列表的四个事件带的 indexPath 过桥时是 { section, item }，换成 NSIndexPath。
  // itemselect 这个名字标签栏控制器也在用（它带的是页面，不走这张表）
  const withPath = (fields) => (
    fields !== null && typeof fields === 'object' && fields.indexPath != null
      ? { indexPath: toPath(fields.indexPath) }
      : fields);
  for (const type of ['itemselect', 'itemdeselect', 'beforedisplay', 'displayend']) {
    eventFieldConverters.set(type, withPath);
  }

  // ---- 快照 ----
  defineNativeClass('NSDiffableDataSourceSnapshot',
                    class NSDiffableDataSourceSnapshot extends NSObject {
    constructor() {
      super();
      constructNative(this, new.target, 'NSDiffableDataSourceSnapshot', []);
    }
    get numberOfItems() { requireNative(this, 'numberOfItems'); return nativeGet(this, 'numberOfItems'); }
    get numberOfSections() {
      requireNative(this, 'numberOfSections');
      return nativeGet(this, 'numberOfSections');
    }
    get sectionIdentifiers() {
      requireNative(this, 'sectionIdentifiers');
      return nativeGet(this, 'sectionIdentifiers');
    }
    get itemIdentifiers() {
      requireNative(this, 'itemIdentifiers');
      return nativeGet(this, 'itemIdentifiers');
    }

    numberOfItemsInSection(sectionIdentifier) {
      return nativeCall(this, 'numberOfItemsInSection:',
                        [idArg(sectionIdentifier, 'numberOfItemsInSection')]);
    }
    itemIdentifiersInSectionWithIdentifier(sectionIdentifier) {
      return nativeCall(this, 'itemIdentifiersInSectionWithIdentifier:',
                        [idArg(sectionIdentifier, 'itemIdentifiersInSectionWithIdentifier')]);
    }
    sectionIdentifierForSectionContainingItemIdentifier(itemIdentifier) {
      return nativeCall(
        this, 'sectionIdentifierForSectionContainingItemIdentifier:',
        [idArg(itemIdentifier, 'sectionIdentifierForSectionContainingItemIdentifier')]);
    }
    indexOfItemIdentifier(itemIdentifier) {
      return nativeCall(this, 'indexOfItemIdentifier:',
                        [idArg(itemIdentifier, 'indexOfItemIdentifier')]);
    }
    indexOfSectionIdentifier(sectionIdentifier) {
      return nativeCall(this, 'indexOfSectionIdentifier:',
                        [idArg(sectionIdentifier, 'indexOfSectionIdentifier')]);
    }

    appendSectionsWithIdentifiers(sectionIdentifiers) {
      nativeCall(this, 'appendSectionsWithIdentifiers:',
                 [idsArg(sectionIdentifiers, 'appendSectionsWithIdentifiers')]);
    }
    insertSectionsWithIdentifiers(sectionIdentifiers, options) {
      const what = 'insertSectionsWithIdentifiers';
      const ids = idsArg(sectionIdentifiers, what);
      const anchor = anchorArg(options, 'beforeSectionWithIdentifier',
                               'afterSectionWithIdentifier', what);
      nativeCall(this, 'insertSectionsWithIdentifiers:', [ids, anchor.id, anchor.before]);
    }
    deleteSectionsWithIdentifiers(sectionIdentifiers) {
      nativeCall(this, 'deleteSectionsWithIdentifiers:',
                 [idsArg(sectionIdentifiers, 'deleteSectionsWithIdentifiers')]);
    }
    moveSectionWithIdentifier(sectionIdentifier, options) {
      const what = 'moveSectionWithIdentifier';
      const anchor = anchorArg(options, 'beforeSectionWithIdentifier',
                               'afterSectionWithIdentifier', what);
      nativeCall(this, 'moveSectionWithIdentifier:',
                 [idArg(sectionIdentifier, what), anchor.id, anchor.before]);
    }
    reloadSectionsWithIdentifiers(sectionIdentifiers) {
      nativeCall(this, 'reloadSectionsWithIdentifiers:',
                 [idsArg(sectionIdentifiers, 'reloadSectionsWithIdentifiers')]);
    }

    // 不给 intoSectionWithIdentifier 是加到最后一个分区
    appendItemsWithIdentifiers(itemIdentifiers, options) {
      const what = 'appendItemsWithIdentifiers';
      const o = options === undefined || options === null ? {} : options;
      nativeCall(this, 'appendItemsWithIdentifiers:',
                 [idsArg(itemIdentifiers, what),
                  has(o, 'intoSectionWithIdentifier') ? idArg(o.intoSectionWithIdentifier, what) : null]);
    }
    insertItemsWithIdentifiers(itemIdentifiers, options) {
      const what = 'insertItemsWithIdentifiers';
      const ids = idsArg(itemIdentifiers, what);
      const anchor = anchorArg(options, 'beforeItemWithIdentifier', 'afterItemWithIdentifier', what);
      nativeCall(this, 'insertItemsWithIdentifiers:', [ids, anchor.id, anchor.before]);
    }
    deleteItemsWithIdentifiers(itemIdentifiers) {
      nativeCall(this, 'deleteItemsWithIdentifiers:',
                 [idsArg(itemIdentifiers, 'deleteItemsWithIdentifiers')]);
    }
    deleteAllItems() { nativeCall(this, 'deleteAllItems', []); }
    moveItemWithIdentifier(itemIdentifier, options) {
      const what = 'moveItemWithIdentifier';
      const anchor = anchorArg(options, 'beforeItemWithIdentifier', 'afterItemWithIdentifier', what);
      nativeCall(this, 'moveItemWithIdentifier:',
                 [idArg(itemIdentifier, what), anchor.id, anchor.before]);
    }
    reloadItemsWithIdentifiers(itemIdentifiers) {
      nativeCall(this, 'reloadItemsWithIdentifiers:',
                 [idsArg(itemIdentifiers, 'reloadItemsWithIdentifiers')]);
    }
    reconfigureItemsWithIdentifiers(itemIdentifiers) {
      nativeCall(this, 'reconfigureItemsWithIdentifiers:',
                 [idsArg(itemIdentifiers, 'reconfigureItemsWithIdentifiers')]);
    }
  });

  // ---- 数据源 ----
  // 数据源的包装 → 用户给的 cellProvider 和它接的那个列表。挂在 WeakMap 上，
  // 包装一死跟着死
  const providers = new WeakMap();

  // 应用快照：原生做完时调一次登记的那段代码，Promise 兑现
  function applyWith(source, selector, args) {
    let settle;
    const done = new Promise((resolve) => { settle = resolve; });
    const completion = registerBlock(() => settle(undefined), true);
    try {
      nativeCall(source, selector, args.concat([completion]));
    } catch (err) {
      // 参数被原生拒了，没有开始：这个号不会再有人调
      releaseBlock(completion);
      throw err;
    }
    return done;
  }

  defineNativeClass('UICollectionViewDiffableDataSource',
                    class UICollectionViewDiffableDataSource extends NSObject {
    constructor(collectionView, options) {
      super();
      if (new.target !== UICollectionViewDiffableDataSource) return;
      if (!(collectionView instanceof UICollectionView)) {
        throw new TypeError('UICollectionViewDiffableDataSource needs a UICollectionView');
      }
      const o = options === undefined || options === null ? {} : options;
      if (typeof o.cellProvider !== 'function') {
        throw new TypeError('UICollectionViewDiffableDataSource: cellProvider must be a function');
      }
      constructNative(this, new.target, 'UICollectionViewDiffableDataSource', [collectionView]);
      providers.set(this, { provide: o.cellProvider, collectionView });
      own(collectionView, 'dataSource', this);
    }

    // 现在显示的数据的一份副本
    snapshot() { return nativeCallObject(this, 'snapshot', []); }

    applySnapshot(snapshot, options) {
      const o = options === undefined || options === null ? {} : options;
      const animating = has(o, 'animatingDifferences') ? toBoolean(o.animatingDifferences) : true;
      return applyWith(this, 'applySnapshot:animatingDifferences:completion:',
                       [snapshot, animating]);
    }
    applySnapshotUsingReloadData(snapshot) {
      return applyWith(this, 'applySnapshotUsingReloadData:completion:', [snapshot]);
    }

    itemIdentifierForIndexPath(indexPath) {
      return nativeCall(this, 'itemIdentifierForIndexPath:',
                        [pathArg(indexPath, 'itemIdentifierForIndexPath')]);
    }
    indexPathForItemIdentifier(itemIdentifier) {
      return toPath(nativeCall(this, 'indexPathForItemIdentifier:',
                               [idArg(itemIdentifier, 'indexPathForItemIdentifier')]));
    }
    sectionIdentifierForIndex(index) {
      return nativeCall(this, 'sectionIdentifierForIndex:', [toInteger(index, 'index')]);
    }
    indexForSectionIdentifier(sectionIdentifier) {
      return nativeCall(this, 'indexForSectionIdentifier:',
                        [idArg(sectionIdentifier, 'indexForSectionIdentifier')]);
    }
  });

  // 系统当场来要一项的单元格（原生用 NacreEmitEventSync 发的内部事件）。
  // 调用户的 cellProvider，把它返回的单元格交回原生。
  //
  // 这里抛的异常（用户的函数抛了、没返回单元格）会从 application 的 error
  // 事件报出来；原生那边没拿到单元格，就给系统一个空白的
  internalEventHandlers.set('@cell', (source, request) => {
    const entry = providers.get(source);
    if (entry === undefined) {
      throw new TypeError(
        'UICollectionViewDiffableDataSource: no cellProvider is attached to this data source');
    }
    const cell = entry.provide(entry.collectionView,
                               new NSIndexPath(request.section, request.item), request.id);
    if (!(cell instanceof UICollectionViewCell)) {
      throw new TypeError(
        'cellProvider must return a UICollectionViewCell, got ' + describeValue(cell));
    }
    nativeCall(source, 'nacre:provideCell', [cell]);
  });
})
