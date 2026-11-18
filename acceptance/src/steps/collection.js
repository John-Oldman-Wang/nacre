import { customEventWorks, enumIgnored, ENUM_IGNORED } from '../support.js';
// 列表：UICollectionView、单元格、列表布局、快照和数据源。
//
// 这是「系统来要数据」那一类同步回调的第一个使用者：系统要显示一项时当场调
// cellProvider，要它返回单元格。
//
// 步骤里有异步的部分（应用快照、延后派发的事件），所以把「全部做完」作为
// Promise 返回，排在后面的步骤等它（见 main.js）。

const sleep = (/** @type {number} */ ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** 抛了就返回错误，没抛返回 null @param {() => unknown} fn */
function caught(fn) {
  try { fn(); return null; } catch (err) { return /** @type {Error} */ (err); }
}
/** 抛的是什么 @param {() => unknown} fn */
const thrown = (fn) => {
  const err = caught(fn);
  return err === null ? '没抛' : err.constructor.name;
};
/** 等条件成立，最多等 limit 毫秒 @param {() => boolean} ready @param {number} [limit] */
async function until(ready, limit = 5000) {
  const deadline = Date.now() + limit;
  while (!ready()) {
    if (Date.now() >= deadline) return false;
    await sleep(50);
  }
  return true;
}
/** @param {NSIndexPath | null} p */
const show = (p) => (p === null ? 'null' : p.section + '-' + p.item);

/** @param {import("../main.js").StepContext} ctx */
export function stepCollection(ctx) {
  const { assert } = ctx;
  const host = ctx.section('列表：UICollectionView（40 行，能滚；点一行看日志）', 300);
  console.log('  --- 列表：NSIndexPath ---');

  // =====================================================================
  // 1. NSIndexPath：只读的值
  const path = new NSIndexPath(2, 5);
  assert('section', path.section, 2);
  assert('item', path.item, 5);
  assert('row 和 item 是同一个数', path.row, 5);
  assert('indexPathForItem', show(NSIndexPath.indexPathForItem(7, { inSection: 1 })), '1-7');
  assert('indexPathForRow', show(NSIndexPath.indexPathForRow(3, { inSection: 0 })), '0-3');
  assert('小数向零取整', show(new NSIndexPath(1.9, 2.9)), '1-2');
  assert('字符串按数转', show(new NSIndexPath(/** @type {any} */ ('1'), /** @type {any} */ ('4'))), '1-4');
  // @ts-expect-error 字段只读
  assert('写字段抛', thrown(() => { path.item = 9; }), 'TypeError');
  assert('负数抛', thrown(() => new NSIndexPath(0, -1)), 'TypeError');
  assert('不是数抛', thrown(() => new NSIndexPath(0, /** @type {any} */ ('abc'))), 'TypeError');
  // @ts-expect-error 少了 inSection
  assert('indexPathForItem 没给 inSection 抛', thrown(() => NSIndexPath.indexPathForItem(1)), 'TypeError');
  assert('转成字符串', String(path), 'NSIndexPath(2, 5)');

  // =====================================================================
  // 2. 快照：纯数据，不用界面
  console.log('  --- 列表：NSDiffableDataSourceSnapshot ---');
  const snap = new NSDiffableDataSourceSnapshot();
  assert('新建的快照没有分区', snap.numberOfSections, 0);
  assert('新建的快照没有项', snap.numberOfItems, 0);
  assert('sectionIdentifiers 是空数组', JSON.stringify(snap.sectionIdentifiers), '[]');
  assert('还没有分区时加项抛', thrown(() => snap.appendItemsWithIdentifiers(['a'])), 'TypeError');

  snap.appendSectionsWithIdentifiers(['fruit', 'veg']);
  assert('加了两个分区', JSON.stringify(snap.sectionIdentifiers), '["fruit","veg"]');
  snap.appendItemsWithIdentifiers(['carrot', 'leek']);
  assert('不指定分区：加到最后一个', JSON.stringify(snap.itemIdentifiersInSectionWithIdentifier('veg')),
         '["carrot","leek"]');
  snap.appendItemsWithIdentifiers(['apple', 'pear'], { intoSectionWithIdentifier: 'fruit' });
  assert('指定分区', JSON.stringify(snap.itemIdentifiersInSectionWithIdentifier('fruit')), '["apple","pear"]');
  assert('itemIdentifiers 按分区的顺序接起来', JSON.stringify(snap.itemIdentifiers),
         '["apple","pear","carrot","leek"]');
  assert('numberOfItems', snap.numberOfItems, 4);
  assert('numberOfSections', snap.numberOfSections, 2);
  assert('numberOfItemsInSection', snap.numberOfItemsInSection('fruit'), 2);
  assert('一项在哪个分区', snap.sectionIdentifierForSectionContainingItemIdentifier('leek'), 'veg');
  assert('没有这一项：null', snap.sectionIdentifierForSectionContainingItemIdentifier('nope'), null);
  assert('indexOfItemIdentifier', snap.indexOfItemIdentifier('carrot'), 2);
  assert('indexOfItemIdentifier 没有：-1', snap.indexOfItemIdentifier('nope'), -1);
  assert('indexOfSectionIdentifier', snap.indexOfSectionIdentifier('veg'), 1);
  assert('indexOfSectionIdentifier 没有：-1', snap.indexOfSectionIdentifier('nope'), -1);

  snap.insertItemsWithIdentifiers(['plum'], { beforeItemWithIdentifier: 'pear' });
  snap.insertItemsWithIdentifiers(['kiwi', 'lime'], { afterItemWithIdentifier: 'apple' });
  assert('在某一项的前后插', JSON.stringify(snap.itemIdentifiersInSectionWithIdentifier('fruit')),
         '["apple","kiwi","lime","plum","pear"]');
  snap.moveItemWithIdentifier('pear', { beforeItemWithIdentifier: 'apple' });
  snap.moveItemWithIdentifier('kiwi', { afterItemWithIdentifier: 'leek' });
  assert('挪动，可以跨分区', JSON.stringify(snap.itemIdentifiers),
         '["pear","apple","lime","plum","carrot","leek","kiwi"]');
  snap.deleteItemsWithIdentifiers(['lime', 'plum', 'ghost']);
  assert('删除，不存在的忽略', JSON.stringify(snap.itemIdentifiers), '["pear","apple","carrot","leek","kiwi"]');

  snap.insertSectionsWithIdentifiers(['grain'], { beforeSectionWithIdentifier: 'veg' });
  snap.insertSectionsWithIdentifiers(['nut'], { afterSectionWithIdentifier: 'veg' });
  assert('在某个分区的前后插分区', JSON.stringify(snap.sectionIdentifiers), '["fruit","grain","veg","nut"]');
  snap.moveSectionWithIdentifier('nut', { beforeSectionWithIdentifier: 'fruit' });
  snap.moveSectionWithIdentifier('grain', { afterSectionWithIdentifier: 'veg' });
  assert('挪分区', JSON.stringify(snap.sectionIdentifiers), '["nut","fruit","veg","grain"]');
  snap.deleteSectionsWithIdentifiers(['nut', 'grain', 'ghost']);
  assert('删分区，不存在的忽略', JSON.stringify(snap.sectionIdentifiers), '["fruit","veg"]');
  snap.deleteSectionsWithIdentifiers(['veg']);
  assert('删分区连同里面的项', JSON.stringify(snap.itemIdentifiers), '["pear","apple"]');
  assert('reloadItemsWithIdentifiers 不抛', thrown(() => snap.reloadItemsWithIdentifiers(['pear'])), '没抛');
  assert('reconfigureItemsWithIdentifiers 不抛', thrown(() => snap.reconfigureItemsWithIdentifiers(['apple'])), '没抛');
  assert('reloadSectionsWithIdentifiers 不抛', thrown(() => snap.reloadSectionsWithIdentifiers(['fruit'])), '没抛');

  // 标识：字符串和整数，类型不同就是不同的标识
  snap.appendItemsWithIdentifiers([1, '1', 0, -7]);
  assert('整数和字符串可以混用，读回来类型不变', JSON.stringify(snap.itemIdentifiers),
         '["pear","apple",1,"1",0,-7]');
  assert('1 和 "1" 是两个标识', snap.indexOfItemIdentifier(1) + ',' + snap.indexOfItemIdentifier('1'), '2,3');

  // 出错的
  assert('项的标识重复（和已有的）', thrown(() => snap.appendItemsWithIdentifiers(['pear'])), 'TypeError');
  assert('项的标识重复（同一次里）', thrown(() => snap.appendItemsWithIdentifiers(['x', 'x'])), 'TypeError');
  assert('分区的标识重复', thrown(() => snap.appendSectionsWithIdentifiers(['fruit'])), 'TypeError');
  assert('出错的那一次什么都没加进去', snap.numberOfItems + '/' + snap.numberOfSections, '6/1');
  const dup = caught(() => snap.appendItemsWithIdentifiers(['pear']));
  console.log('  实测：重复时的报错 = ' + (dup === null ? '没抛' : dup.message));
  assert('报错里点出是哪个标识', dup !== null && dup.message.includes('pear'), true);
  assert('标识是小数', thrown(() => snap.appendItemsWithIdentifiers([1.5])), 'TypeError');
  // @ts-expect-error 标识只能是字符串或整数
  assert('标识是对象', thrown(() => snap.appendItemsWithIdentifiers([{}])), 'TypeError');
  // @ts-expect-error 标识只能是字符串或整数
  assert('标识是 null', thrown(() => snap.appendItemsWithIdentifiers([null])), 'TypeError');
  // @ts-expect-error 要的是数组
  assert('给的不是数组', thrown(() => snap.appendItemsWithIdentifiers('abc')), 'TypeError');
  assert('加到不存在的分区', thrown(() => snap.appendItemsWithIdentifiers(['q'], { intoSectionWithIdentifier: 'nope' })), 'TypeError');
  assert('插到不存在的项旁边', thrown(() => snap.insertItemsWithIdentifiers(['q'], { beforeItemWithIdentifier: 'nope' })), 'TypeError');
  // @ts-expect-error 两个键要给一个
  assert('插入没说插在哪', thrown(() => snap.insertItemsWithIdentifiers(['q'], {})), 'TypeError');
  assert('插入两个键都给了', thrown(() => snap.insertItemsWithIdentifiers(
    ['q'], /** @type {any} */ ({ beforeItemWithIdentifier: 'pear', afterItemWithIdentifier: 'pear' }))), 'TypeError');
  assert('挪不存在的项', thrown(() => snap.moveItemWithIdentifier('nope', { beforeItemWithIdentifier: 'pear' })), 'TypeError');
  assert('挪到自己旁边', thrown(() => snap.moveItemWithIdentifier('pear', { beforeItemWithIdentifier: 'pear' })), 'TypeError');
  assert('重新加载不存在的项', thrown(() => snap.reloadItemsWithIdentifiers(['nope'])), 'TypeError');
  assert('重新设置不存在的项', thrown(() => snap.reconfigureItemsWithIdentifiers(['nope'])), 'TypeError');
  assert('问不存在的分区有几项', thrown(() => snap.numberOfItemsInSection('nope')), 'TypeError');
  assert('问不存在的分区里的项', thrown(() => snap.itemIdentifiersInSectionWithIdentifier('nope')), 'TypeError');
  assert('插分区到不存在的分区旁边', thrown(() => snap.insertSectionsWithIdentifiers(['s'], { afterSectionWithIdentifier: 'nope' })), 'TypeError');
  assert('挪不存在的分区', thrown(() => snap.moveSectionWithIdentifier('nope', { beforeSectionWithIdentifier: 'fruit' })), 'TypeError');
  assert('重新加载不存在的分区', thrown(() => snap.reloadSectionsWithIdentifiers(['nope'])), 'TypeError');
  assert('出错之后快照没变', JSON.stringify(snap.itemIdentifiers), '["pear","apple",1,"1",0,-7]');
  snap.deleteAllItems();
  assert('deleteAllItems 连分区一起清掉', snap.numberOfItems + '/' + snap.numberOfSections, '0/0');

  // =====================================================================
  // 3. 列表的配置和布局
  console.log('  --- 列表：配置和布局 ---');
  const config = new UICollectionLayoutListConfiguration('insetGrouped');
  assert('appearance 是建的时候给的', config.appearance, 'insetGrouped');
  assert('默认画分隔线', config.showsSeparators, true);
  assert('默认没有自己的底色', config.backgroundColor, null);
  assert('默认没有头', config.headerMode, 'none');
  config.showsSeparators = false;
  assert('showsSeparators 可写', config.showsSeparators, false);
  config.showsSeparators = true;
  config.backgroundColor = 'systemBackground';
  assert('backgroundColor 可写', config.backgroundColor, 'systemBackground');
  config.backgroundColor = null;
  assert('backgroundColor 写 null 退回默认', config.backgroundColor, null);
  config.headerMode = 'firstItemInSection';
  assert('headerMode 可写', config.headerMode, 'firstItemInSection');
  config.headerMode = 'none';
  // @ts-expect-error 还不支持
  assert('headerMode 写 supplementary 被拒（还不支持）', thrown(() => { config.headerMode = 'supplementary'; }), 'TypeError');
  assert('headerMode 写错值：不抛、值不变', enumIgnored(() => {
    // @ts-expect-error 不认识的值
    config.headerMode = 'top';
  }, () => config.headerMode), ENUM_IGNORED);
  // @ts-expect-error 只读
  assert('appearance 只读', thrown(() => { config.appearance = 'plain'; }), 'TypeError');
  for (const appearance of /** @type {const} */ (['plain', 'grouped', 'insetGrouped', 'sidebar', 'sidebarPlain'])) {
    assert('外观 ' + appearance + ' 建得出来', new UICollectionLayoutListConfiguration(appearance).appearance, appearance);
  }
  // @ts-expect-error 不认识的外观
  assert('外观写错值', thrown(() => new UICollectionLayoutListConfiguration('card')), 'TypeError');
  // @ts-expect-error 没给外观
  assert('没给外观', thrown(() => new UICollectionLayoutListConfiguration()), 'TypeError');

  const layout = UICollectionViewCompositionalLayout.layoutWithListConfiguration(config);
  assert('布局是 UICollectionViewCompositionalLayout', layout instanceof UICollectionViewCompositionalLayout, true);
  assert('它也是 UICollectionViewLayout', layout instanceof UICollectionViewLayout, true);
  // @ts-expect-error 要的是配置
  assert('给的不是配置', thrown(() => UICollectionViewCompositionalLayout.layoutWithListConfiguration('plain')), 'TypeError');
  // @ts-expect-error 不能构造
  assert('UICollectionViewLayout 不能 new', thrown(() => new UICollectionViewLayout()), 'TypeError');
  // @ts-expect-error 不能构造
  assert('UICollectionViewCompositionalLayout 不能 new', thrown(() => new UICollectionViewCompositionalLayout()), 'TypeError');

  // =====================================================================
  // 4. 内容配置
  console.log('  --- 列表：UIListContentConfiguration ---');
  const content = UIListContentConfiguration.cellConfiguration();
  assert('cellConfiguration 给的是 UIListContentConfiguration', content instanceof UIListContentConfiguration, true);
  assert('默认没有文字', content.text, null);
  assert('默认没有副文字', content.secondaryText, null);
  assert('默认没有图片', content.image, null);
  content.text = '主文字';
  content.secondaryText = '副文字';
  const star = UIImage.systemImageNamed('star');
  content.image = star;
  assert('text 可写', content.text, '主文字');
  assert('secondaryText 可写', content.secondaryText, '副文字');
  assert('image 可写', content.image !== null, true);
  content.text = /** @type {any} */ (42);
  assert('text 写数字转成字符串', content.text, '42');
  content.text = null;
  content.image = null;
  assert('text 写 null 清掉', content.text, null);
  assert('image 写 null 清掉', content.image, null);
  // @ts-expect-error 要的是图片
  assert('image 写别的对象被拒', thrown(() => { content.image = new UIView(); }), 'TypeError');
  assert('subtitleCellConfiguration', UIListContentConfiguration.subtitleCellConfiguration() instanceof UIListContentConfiguration, true);
  assert('valueCellConfiguration', UIListContentConfiguration.valueCellConfiguration() instanceof UIListContentConfiguration, true);
  // @ts-expect-error 不能构造
  assert('UIListContentConfiguration 不能 new', thrown(() => new UIListContentConfiguration()), 'TypeError');

  // =====================================================================
  // 5. 列表本身
  console.log('  --- 列表：UICollectionView ---');
  const list = new UICollectionView(layout);
  assert('是 UIScrollView 的子类', list instanceof UIScrollView, true);
  assert('collectionViewLayout 是建的时候给的那个', list.collectionViewLayout === layout, true);
  assert('还没接数据源', list.dataSource, null);
  assert('默认可以点选', list.allowsSelection, true);
  assert('默认不能多选', list.allowsMultipleSelection, false);
  // 实测：没接数据源的列表，系统报的是 1 个分区、里面 0 项（用例最初写的是 0）
  assert('没接数据源时系统报 1 个分区', list.numberOfSections, 1);
  assert('那个分区里 0 项', list.numberOfItemsInSection(0), 0);
  assert('visibleCells 是空数组', list.visibleCells.length, 0);
  assert('indexPathsForVisibleItems 是空数组', list.indexPathsForVisibleItems.length, 0);
  assert('indexPathsForSelectedItems 是空数组', list.indexPathsForSelectedItems.length, 0);
  list.allowsMultipleSelection = true;
  assert('allowsMultipleSelection 可写', list.allowsMultipleSelection, true);
  list.allowsMultipleSelection = false;
  list.allowsSelection = false;
  assert('allowsSelection 可写', list.allowsSelection, false);
  list.allowsSelection = true;
  // @ts-expect-error 要的是布局
  assert('new UICollectionView 给的不是布局', thrown(() => new UICollectionView('list')), 'TypeError');
  // @ts-expect-error 没给布局
  assert('new UICollectionView 没给布局', thrown(() => new UICollectionView()), 'TypeError');
  // @ts-expect-error 只读
  assert('dataSource 只读', thrown(() => { list.dataSource = null; }), 'TypeError');
  // @ts-expect-error 不能构造
  assert('UICollectionViewCell 不能 new', thrown(() => new UICollectionViewCell()), 'TypeError');
  // @ts-expect-error 不能构造
  assert('UICollectionViewListCell 不能 new', thrown(() => new UICollectionViewListCell()), 'TypeError');
  // @ts-expect-error 不能构造
  assert('UICollectionReusableView 不能 new', thrown(() => new UICollectionReusableView()), 'TypeError');

  assert('registerClass 不抛', thrown(() => {
    list.registerClass(UICollectionViewListCell, { forCellWithReuseIdentifier: 'row' });
    list.registerClass(UICollectionViewCell, { forCellWithReuseIdentifier: 'plain' });
  }), '没抛');
  // @ts-expect-error 要的是单元格的类
  assert('registerClass 给的不是单元格的类', thrown(() => list.registerClass(UIView, { forCellWithReuseIdentifier: 'v' })), 'TypeError');
  // @ts-expect-error 要的是类
  assert('registerClass 给的不是类', thrown(() => list.registerClass('UICollectionViewCell', { forCellWithReuseIdentifier: 'v' })), 'TypeError');
  // @ts-expect-error 少了标识
  assert('registerClass 没给标识', thrown(() => list.registerClass(UICollectionViewCell)), 'TypeError');
  assert('registerClass 标识是空串', thrown(() => list.registerClass(UICollectionViewCell, { forCellWithReuseIdentifier: '' })), 'TypeError');
  assert('不在 cellProvider 里取单元格被拒', thrown(() => list.dequeueReusableCellWithReuseIdentifier(
    'row', { forIndexPath: { section: 0, item: 0 } })), 'TypeError');

  list.translatesAutoresizingMaskIntoConstraints = false;
  host.addSubview(list);
  NSLayoutConstraint.activateConstraints([
    list.topAnchor.constraintEqualToAnchor(host.topAnchor),
    list.bottomAnchor.constraintEqualToAnchor(host.bottomAnchor),
    list.leadingAnchor.constraintEqualToAnchor(host.leadingAnchor),
    list.trailingAnchor.constraintEqualToAnchor(host.trailingAnchor),
  ]);
  host.layoutIfNeeded();

  // =====================================================================
  // 6. 数据源：系统当场来要单元格
  console.log('  --- 列表：数据源和 cellProvider ---');
  /** 每一项的内容。标识 → 标题 @type {Map<string | number, string>} */
  const titles = new Map();
  for (let i = 0; i < 40; i++) titles.set('order-' + i, '订单 ' + (1000 + i));

  /** @type {{ where: string, id: string | number, cell: UICollectionViewCell }[]} */
  const requests = [];
  /** cellProvider 这一次该怎么做。验出错情况时换掉 @type {'normal' | 'throw' | 'nothing' | 'wrong-id' | 'outside-check'} */
  let mode = 'normal';
  /** 取单元格时抛的错（验标识没登记过的那一条） @type {Error | null} */
  let dequeueError = null;
  /** @type {UICollectionView | null} */
  let providerList = null;
  let insideProvider = false;

  // @ts-expect-error 要的是列表
  assert('new 数据源：给的不是列表', thrown(() => new UICollectionViewDiffableDataSource(new UIView(), { cellProvider() { throw new Error('x'); } })), 'TypeError');
  // @ts-expect-error 要 cellProvider
  assert('new 数据源：没给 cellProvider', thrown(() => new UICollectionViewDiffableDataSource(list, {})), 'TypeError');
  // @ts-expect-error 要 options
  assert('new 数据源：没给 options', thrown(() => new UICollectionViewDiffableDataSource(list)), 'TypeError');
  assert('出错的构造没有接上数据源', list.dataSource, null);

  const source = new UICollectionViewDiffableDataSource(list, {
    cellProvider(collectionView, indexPath, id) {
      providerList = collectionView;
      if (mode === 'throw') throw new Error('cellProvider 故意抛的');
      if (mode === 'nothing') return /** @type {any} */ (undefined);
      if (mode === 'wrong-id') {
        dequeueError = caught(() => collectionView.dequeueReusableCellWithReuseIdentifier(
          'never-registered', { forIndexPath: indexPath }));
      }
      insideProvider = true;
      const cell = /** @type {UICollectionViewListCell} */ (
        collectionView.dequeueReusableCellWithReuseIdentifier('row', { forIndexPath: indexPath }));
      const filled = cell.defaultContentConfiguration();
      filled.text = titles.get(id) ?? String(id);
      filled.secondaryText = String(id);
      cell.contentConfiguration = filled;
      requests.push({ where: show(indexPath), id, cell });
      insideProvider = false;
      return cell;
    },
  });
  assert('接上了：list.dataSource 就是它', list.dataSource === source, true);
  assert('空的数据源：snapshot() 是空的', source.snapshot().numberOfItems, 0);
  assert('空的数据源：没有这一项', source.indexPathForItemIdentifier('order-0'), null);
  assert('空的数据源：没有这个位置', source.itemIdentifierForIndexPath({ section: 0, item: 0 }), null);

  // 列表自己的四个事件，在放数据之前就订上
  /** @type {string[]} */
  const displayed = [];
  /** @type {string[]} */
  const ended = [];
  /** @type {string[]} */
  const selections = [];
  let displayEvent = /** @type {UICollectionViewItemEvent | null} */ (null);
  list.addEventListener('beforedisplay', (e) => { displayEvent = e; displayed.push(show(e.indexPath)); });
  list.addEventListener('displayend', (e) => { ended.push(show(e.indexPath)); });
  list.addEventListener('itemselect', (e) => {
    selections.push('itemselect ' + show(e.indexPath));
    // 真实触摸时的日志（自动跑的验收里不会出现）
    console.log('  · [列表] 点了 ' + show(e.indexPath) + '，标识 ' +
                source.itemIdentifierForIndexPath(e.indexPath));
  });
  list.addEventListener('itemdeselect', (e) => { selections.push('itemdeselect ' + show(e.indexPath)); });
  // 类型上滚动视图收任意字符串，所以这里类型检查不报，只有运行时抛
  assert('不认识的事件名当自定义事件', customEventWorks(list, 'not-a-real-event'), '收到一次');

  const first = new NSDiffableDataSourceSnapshot();
  first.appendSectionsWithIdentifiers(['main']);
  first.appendItemsWithIdentifiers(Array.from(titles.keys()));

  // @ts-expect-error 要的是快照
  assert('applySnapshot 给的不是快照', thrown(() => source.applySnapshot({})), 'TypeError');

  const finished = (async () => {
    const applied = source.applySnapshot(first, { animatingDifferences: false });
    assert('applySnapshot 返回 Promise', applied instanceof Promise, true);
    const duringApply = requests.length;
    await applied;
    list.layoutIfNeeded();
    console.log('  实测：applySnapshot 返回时 cellProvider 已经被调了 ' + duringApply +
                ' 次，排完版之后一共 ' + requests.length + ' 次');
    assert('cellProvider 被调过了', requests.length > 0, true);
    assert('只为屏幕上放得下的那几行调，不是 40 行全调', requests.length < 40, true);
    assert('cellProvider 的第一个参数就是这个列表', providerList === list, true);
    assert('第一次请求的是第 0 项', requests[0].where + ' ' + requests[0].id, '0-0 order-0');
    assert('取到的是登记的那个类', requests[0].cell instanceof UICollectionViewListCell, true);
    assert('它也是 UICollectionViewCell', requests[0].cell instanceof UICollectionViewCell, true);
    assert('单元格的 reuseIdentifier', requests[0].cell.reuseIdentifier, 'row');

    assert('numberOfSections', list.numberOfSections, 1);
    assert('numberOfItemsInSection', list.numberOfItemsInSection(0), 40);
    assert('numberOfItemsInSection 没有这个分区', thrown(() => list.numberOfItemsInSection(3)), 'TypeError');
    // 实测：系统会比屏幕上放得下的多要一两个单元格备着（请求 5 次，屏幕上 4 个），
    // 所以请求的次数只会多不会少
    const visible = list.visibleCells;
    console.log('  实测：屏幕上 ' + visible.length + ' 个单元格');
    assert('visibleCells 不为空，个数不超过请求的次数',
           visible.length > 0 && visible.length <= requests.length, true);
    assert('visibleCells 里每一个都是 cellProvider 返回过的那些对象',
           visible.every((cell) => requests.some((r) => r.cell === cell)), true);
    assert('indexPathsForVisibleItems 的个数和 visibleCells 相同', list.indexPathsForVisibleItems.length, visible.length);
    assert('屏幕上有第 0 项', list.indexPathsForVisibleItems.map(show).includes('0-0'), true);

    const cell0 = list.cellForItemAtIndexPath({ section: 0, item: 0 });
    assert('cellForItemAtIndexPath 给的就是 cellProvider 返回的那个对象', cell0 === requests[0].cell, true);
    assert('不在屏幕上的项：null', list.cellForItemAtIndexPath(new NSIndexPath(0, 39)), null);
    assert('没有这一项：null', list.cellForItemAtIndexPath({ section: 0, item: 400 }), null);
    assert('indexPathForCell', show(list.indexPathForCell(requests[0].cell)), '0-0');
    // @ts-expect-error 要的是单元格
    assert('indexPathForCell 给的不是单元格', thrown(() => list.indexPathForCell(new UIView())), 'TypeError');
    const midpoint = cell0 === null ? new CGPoint(0, 0) : cell0.center;
    assert('indexPathForItemAtPoint：第 0 项的中心', show(list.indexPathForItemAtPoint(midpoint)), '0-0');
    assert('indexPathForItemAtPoint：没落在任何一项上', list.indexPathForItemAtPoint({ x: -50, y: -50 }), null);

    // 内容配置写进去的是副本
    const back = cell0 === null ? null : cell0.contentConfiguration;
    assert('contentConfiguration 读得回来', back === null ? 'null' : back.text + ' / ' + back.secondaryText,
           '订单 1000 / order-0');
    if (back !== null && cell0 !== null) {
      back.text = '改了副本';
      const again = cell0.contentConfiguration;
      assert('读出来的是副本，改它不影响单元格', again === null ? 'null' : again.text, '订单 1000');
    }
    assert('单元格有 contentView', cell0 !== null && cell0.contentView instanceof UIView, true);
    assert('contentView 每次读是同一个对象', cell0 !== null && cell0.contentView === cell0.contentView, true);
    assert('默认没选中', cell0 !== null && cell0.isSelected, false);
    assert('默认没按下', cell0 !== null && cell0.isHighlighted, false);

    // 数据源的查询
    assert('itemIdentifierForIndexPath', source.itemIdentifierForIndexPath({ section: 0, item: 3 }), 'order-3');
    assert('itemIdentifierForIndexPath 没有这个位置', source.itemIdentifierForIndexPath({ section: 0, item: 400 }), null);
    assert('indexPathForItemIdentifier', show(source.indexPathForItemIdentifier('order-39')), '0-39');
    assert('indexPathForItemIdentifier 没有这一项', source.indexPathForItemIdentifier('nope'), null);
    assert('sectionIdentifierForIndex', source.sectionIdentifierForIndex(0), 'main');
    assert('sectionIdentifierForIndex 没有', source.sectionIdentifierForIndex(5), null);
    assert('indexForSectionIdentifier', source.indexForSectionIdentifier('main'), 0);
    assert('indexForSectionIdentifier 没有：-1', source.indexForSectionIdentifier('nope'), -1);
    const current = source.snapshot();
    assert('snapshot() 是现在的数据', current.numberOfItems, 40);
    current.deleteAllItems();
    assert('snapshot() 给的是副本，改它不影响列表', list.numberOfItemsInSection(0), 40);

    // beforedisplay 是延后派发的
    const onScreen = list.indexPathsForVisibleItems.map(show);
    await until(() => onScreen.every((where) => displayed.includes(where)));
    assert('屏幕上的每一项都派发过 beforedisplay', onScreen.every((where) => displayed.includes(where)), true);
    assert('同一项没有重复派发', new Set(displayed).size, displayed.length);
    assert('beforedisplay 带 indexPath，是 NSIndexPath', displayEvent !== null &&
           /** @type {UICollectionViewItemEvent} */ (displayEvent).indexPath instanceof NSIndexPath, true);
    assert('beforedisplay 不能取消', displayEvent !== null && /** @type {Event} */ (displayEvent).cancelable, false);

    // ===================================================================
    // 7. 改数据：删两项、头上插一项、改一项的内容
    console.log('  --- 列表：改数据 ---');
    const before = requests.length;
    const next = source.snapshot();
    next.deleteItemsWithIdentifiers(['order-1', 'order-2']);
    next.insertItemsWithIdentifiers(['order-new'], { beforeItemWithIdentifier: 'order-0' });
    titles.set('order-new', '新订单');
    titles.set('order-0', '订单 1000（改过）');
    next.reconfigureItemsWithIdentifiers(['order-0']);
    await source.applySnapshot(next, { animatingDifferences: false });
    list.layoutIfNeeded();
    assert('应用之后项数变了', list.numberOfItemsInSection(0), 39);
    assert('新的一项在最前面', source.itemIdentifierForIndexPath({ section: 0, item: 0 }), 'order-new');
    assert('原来的第 0 项挪到了第 1 个位置', show(source.indexPathForItemIdentifier('order-0')), '0-1');
    assert('删掉的项不在了', source.indexPathForItemIdentifier('order-1'), null);
    assert('为新出现的项又调了 cellProvider', requests.length > before, true);
    const top = list.cellForItemAtIndexPath({ section: 0, item: 0 });
    const topContent = top === null ? null : top.contentConfiguration;
    assert('新的一项显示出来了', topContent === null ? 'null' : topContent.text, '新订单');
    const moved = list.cellForItemAtIndexPath({ section: 0, item: 1 });
    const movedContent = moved === null ? null : moved.contentConfiguration;
    assert('reconfigure 的那一项内容更新了', movedContent === null ? 'null' : movedContent.text, '订单 1000（改过）');
    assert('reconfigure 用的还是原来那个单元格', moved === requests[0].cell, true);

    // 带动画的那一种：Promise 照样兑现
    const animated = source.snapshot();
    animated.deleteItemsWithIdentifiers(['order-new']);
    const started = Date.now();
    await source.applySnapshot(animated);
    console.log('  实测：带动画地应用快照，' + (Date.now() - started) + ' ms 后兑现');
    assert('不写 animatingDifferences（默认带动画）：Promise 兑现，数据已经是新的', list.numberOfItemsInSection(0), 38);

    // 整个重新加载
    const reloaded = new NSDiffableDataSourceSnapshot();
    reloaded.appendSectionsWithIdentifiers(['a', 'b']);
    reloaded.appendItemsWithIdentifiers(['order-10', 'order-11'], { intoSectionWithIdentifier: 'a' });
    reloaded.appendItemsWithIdentifiers(Array.from({ length: 30 }, (_, i) => 'order-' + (i + 12)),
                                        { intoSectionWithIdentifier: 'b' });
    await source.applySnapshotUsingReloadData(reloaded);
    list.layoutIfNeeded();
    assert('applySnapshotUsingReloadData：两个分区', list.numberOfSections, 2);
    assert('第二个分区 30 项', list.numberOfItemsInSection(1), 30);
    assert('跨分区的位置', show(source.indexPathForItemIdentifier('order-12')), '1-0');
    // @ts-expect-error 要的是快照
    assert('applySnapshotUsingReloadData 给的不是快照', thrown(() => source.applySnapshotUsingReloadData(null)), 'TypeError');

    // ===================================================================
    // 8. 选中
    console.log('  --- 列表：选中 ---');
    await sleep(100);
    selections.length = 0;
    list.selectItemAtIndexPath({ section: 0, item: 1 });
    assert('selectItemAtIndexPath 之后读得到', list.indexPathsForSelectedItems.map(show).join(','), '0-1');
    const picked = list.cellForItemAtIndexPath({ section: 0, item: 1 });
    assert('那一项的单元格 isSelected', picked !== null && picked.isSelected, true);
    list.selectItemAtIndexPath(new NSIndexPath(1, 0), { animated: false, scrollPosition: [] });
    assert('单选：选了另一项，前一项不再选中', list.indexPathsForSelectedItems.map(show).join(','), '1-0');
    list.deselectItemAtIndexPath({ section: 1, item: 0 }, { animated: false });
    assert('deselectItemAtIndexPath', list.indexPathsForSelectedItems.length, 0);
    list.selectItemAtIndexPath({ section: 0, item: 0 });
    list.selectItemAtIndexPath(null);
    assert('selectItemAtIndexPath(null) 取消全部选中', list.indexPathsForSelectedItems.length, 0);
    assert('选不存在的项', thrown(() => list.selectItemAtIndexPath({ section: 0, item: 99 })), 'TypeError');
    assert('取消选中不存在的项', thrown(() => list.deselectItemAtIndexPath({ section: 9, item: 0 })), 'TypeError');
    // @ts-expect-error 不认识的位置
    assert('scrollPosition 写错值', thrown(() => list.selectItemAtIndexPath({ section: 0, item: 0 }, { scrollPosition: ['middle'] })), 'TypeError');
    // @ts-expect-error 要的是位置
    assert('selectItemAtIndexPath 给的不是位置', thrown(() => list.selectItemAtIndexPath('0-0')), 'TypeError');
    await sleep(300);
    assert('用代码选中和取消，不派发 itemselect / itemdeselect', selections.length, 0);

    // ===================================================================
    // 9. 滚到某一项；列表的事件和滚动的事件共用一个委托
    console.log('  --- 列表：滚动 ---');
    let scrolls = 0;
    const onScroll = () => { scrolls++; };
    list.addEventListener('scroll', onScroll);
    const shownBefore = displayed.length;
    const endedBefore = ended.length;
    list.scrollToItemAtIndexPath({ section: 1, item: 29 }, { atScrollPosition: ['bottom'], animated: false });
    list.layoutIfNeeded();
    assert('scrollToItemAtIndexPath 之后往下滚了', list.contentOffset.y > 100, true);
    assert('最后一项到了屏幕上', list.indexPathsForVisibleItems.map(show).includes('1-29'), true);
    assert('最后一项有单元格了', list.cellForItemAtIndexPath({ section: 1, item: 29 }) !== null, true);
    assert('滚到不存在的项', thrown(() => list.scrollToItemAtIndexPath({ section: 1, item: 99 }, { atScrollPosition: ['top'] })), 'TypeError');
    // @ts-expect-error 少了 atScrollPosition
    assert('scrollToItemAtIndexPath 没给 atScrollPosition', thrown(() => list.scrollToItemAtIndexPath({ section: 0, item: 0 }, {})), 'TypeError');
    await until(() => scrolls > 0 && displayed.length > shownBefore && ended.length > endedBefore);
    assert('滚动事件照常派发（和列表的事件同时订着）', scrolls > 0, true);
    assert('新滚进来的项派发了 beforedisplay', displayed.length > shownBefore, true);
    assert('滚出去的项派发了 displayend', ended.length > endedBefore, true);
    assert('滚进来的是后面的项', displayed.includes('1-29'), true);

    // 摘掉滚动的监听器，列表的事件不受影响
    list.removeEventListener('scroll', onScroll);
    const shownMid = displayed.length;
    list.scrollToItemAtIndexPath({ section: 0, item: 0 }, { atScrollPosition: ['top'], animated: false });
    list.layoutIfNeeded();
    await until(() => displayed.length > shownMid);
    const scrollsAfterRemove = scrolls;
    assert('摘掉 scroll 的监听器之后，beforedisplay 照常派发', displayed.length > shownMid, true);
    list.contentOffset = new CGPoint(0, 4);
    await sleep(200);
    assert('而 scroll 不再派发', scrolls, scrollsAfterRemove);
    list.contentOffset = new CGPoint(0, 0);

    // ===================================================================
    // 10. 单元格是复用的；往 contentView 里放自己的视图
    console.log('  --- 列表：复用 ---');
    const distinct = new Set(requests.map((r) => r.cell));
    console.log('  实测：到这里 cellProvider 一共被调了 ' + requests.length + ' 次，用到 ' +
                distinct.size + ' 个不同的单元格');
    assert('请求的次数比单元格的个数多（有复用）', requests.length > distinct.size, true);
    const reused = list.cellForItemAtIndexPath({ section: 0, item: 0 });
    if (reused !== null) {
      const badge = new UILabel();
      badge.text = '自己加的';
      badge.frame = new CGRect(200, 10, 80, 20);
      reused.contentView.addSubview(badge);
      assert('contentView 里能放自己的视图', badge.superview === reused.contentView, true);
      /** @type {any} */ (reused).myTag = 'kept';
      assert('挂在单元格上的数据读得回来（同一个包装）',
             /** @type {any} */ (list.cellForItemAtIndexPath({ section: 0, item: 0 })).myTag, 'kept');
      badge.removeFromSuperview();
    }

    // ===================================================================
    // 11. cellProvider 出错：不崩，异常从 error 事件报出来，那一项是空白
    console.log('  --- 列表：cellProvider 出错 ---');
    /** @type {string[]} */
    const errors = [];
    const onError = (/** @type {ErrorEvent} */ e) => { errors.push(e.message); e.preventDefault(); };
    application.addEventListener('error', onError);

    const oneRow = (/** @type {string} */ id) => {
      const s = new NSDiffableDataSourceSnapshot();
      s.appendSectionsWithIdentifiers(['only']);
      s.appendItemsWithIdentifiers([id]);
      return s;
    };
    mode = 'throw';
    await source.applySnapshotUsingReloadData(oneRow('bad-1'));
    list.layoutIfNeeded();
    await until(() => errors.length >= 1, 2000);
    assert('cellProvider 抛了：App 没崩，列表里还是有这一项', list.numberOfItemsInSection(0), 1);
    assert('异常从 application 的 error 事件报出来', errors.some((m) => m.includes('cellProvider 故意抛的')), true);
    assert('那一项有一个（空白的）单元格', list.cellForItemAtIndexPath({ section: 0, item: 0 }) !== null, true);

    errors.length = 0;
    mode = 'nothing';
    await source.applySnapshotUsingReloadData(oneRow('bad-2'));
    list.layoutIfNeeded();
    await until(() => errors.length >= 1, 2000);
    assert('cellProvider 没返回单元格：App 没崩', list.numberOfItemsInSection(0), 1);
    console.log('  实测：没返回单元格时报的错 = ' + errors[0]);
    assert('报了一个错，说的是 cellProvider', errors.some((m) => m.includes('cellProvider')), true);

    errors.length = 0;
    mode = 'wrong-id';
    await source.applySnapshotUsingReloadData(oneRow('ok-1'));
    list.layoutIfNeeded();
    assert('取没登记过的标识：在 cellProvider 里抛 TypeError，能接住',
           dequeueError === null ? '没抛' : /** @type {Error} */ (dequeueError).constructor.name, 'TypeError');
    console.log('  实测：标识没登记过时的报错 = ' +
                (dequeueError === null ? '没抛' : /** @type {Error} */ (dequeueError).message));
    assert('接住之后照常取登记过的，这一项正常显示',
           list.cellForItemAtIndexPath({ section: 0, item: 0 }) instanceof UICollectionViewListCell, true);
    assert('这一次没有报错', errors.length, 0);
    application.removeEventListener('error', /** @type {any} */ (onError));
    assert('cellProvider 之外 insideProvider 是 false（它确实是成对执行的）', insideProvider, false);

    // ===================================================================
    // 收尾：放回一份能看的数据，留给真实触摸
    mode = 'normal';
    const final = new NSDiffableDataSourceSnapshot();
    final.appendSectionsWithIdentifiers(['main']);
    final.appendItemsWithIdentifiers(Array.from({ length: 40 }, (_, i) => 'order-' + i));
    titles.set('order-0', '订单 1000');
    await source.applySnapshotUsingReloadData(final);
    list.layoutIfNeeded();
    assert('收尾：40 行', list.numberOfItemsInSection(0), 40);
    console.log('  ✓ 屏幕上：一个圆角卡片样式的列表，40 行，每行主文字「订单 N」、副文字是标识；' +
                '能滚，点一行高亮并在日志里打出位置和标识（肉眼看）');
    console.log('  ! itemselect / itemdeselect 只有真实触摸能触发，自动跑的验收里未验证');
    console.log('  --- 列表：以上异步断言跑完 ---');
  })().catch((err) => {
    console.log('  ✗ 列表这一步的异步部分中途抛了: ' + (err instanceof Error ? err.message : String(err)));
  });
  return finished;
}
