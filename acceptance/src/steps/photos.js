import { customEventWorks, enumIgnored, ENUM_IGNORED } from '../support.js';
// 相册（@nacrejs/photos）：从相册选图、把图片存进相册。
//
// 六个类：PHPickerFilter、PHPickerConfiguration、PHPickerViewController、
// PHPickerResult、NSItemProvider、PHPhotoLibrary。
//
// 自动跑的部分**不弹任何系统界面**：选图界面和权限提示框都要人去点，所以
// 这里验的是建配置、读写属性、建选择器、订阅和退订、写错时抛什么，外加
// 一条不用界面就走得通的取图（自己建一个 NSItemProvider）。真的弹出选图
// 界面、真的存图在本步最后的两排按钮上，点了才做，结果打在日志里。

import { panelRow } from './pasteboard.js';

/** @param {import("../main.js").StepContext} ctx */
export function stepPhotos(ctx) {
  const { assert } = ctx;

  console.log('--- 相册（@nacrejs/photos）---');
  // 验收用的一张图：包里的小圆点
  const dot = /** @type {UIImage} */ (UIImage.imageNamed('JS/assets/dot'));
  // 区块现在就建，位置才对；按钮在本步最后加
  const host = ctx.section('相册（点这些按钮）', 84);

  /**
   * 断言一段代码抛 TypeError，并且报错里有指定的那几个字。
   *
   * @param {string} label
   * @param {() => unknown} fn
   * @param {string} needle
   */
  const rejects = (label, fn, needle) => {
    try {
      fn();
      console.log('  ✗ ' + label + '：居然通过了');
    } catch (err) {
      const message = String(/** @type {Error} */ (err).message);
      const passed = err instanceof TypeError && message.includes(needle);
      console.log((passed ? '  ✓ ' : '  ✗ ') + label + '：' + message +
                  (passed ? '' : '（期望是 TypeError，并且提到 ' + needle + '）'));
    }
  };

  // ===== PHPickerFilter：选图界面里显示哪些类型 =====

  rejects('PHPickerFilter 不能 new',
          // @ts-expect-error 构造函数不公开
          () => new PHPickerFilter(),
          'Illegal constructor');

  const FILTER_NAMES = /** @type {const} */ ([
    'imagesFilter', 'videosFilter', 'livePhotosFilter', 'depthEffectPhotosFilter',
    'burstsFilter', 'panoramasFilter', 'screenshotsFilter', 'screenRecordingsFilter',
    'cinematicVideosFilter', 'slomoVideosFilter', 'timelapseVideosFilter',
    'spatialMediaFilter',
  ]);
  let filtersMade = 0;
  for (const name of FILTER_NAMES) {
    if (PHPickerFilter[name] instanceof PHPickerFilter) filtersMade += 1;
  }
  assert('十二个现成的筛选条件都是 PHPickerFilter', filtersMade, 12);

  const images = PHPickerFilter.imagesFilter;
  const videos = PHPickerFilter.videosFilter;
  // 系统每次读给的是一个新对象（macOS 上的命令行探针量的），运行时把这
  // 十二个按名字留住，所以 === 成立
  assert('同一个筛选条件读两次是同一个对象', PHPickerFilter.imagesFilter === images, true);
  assert('图片和视频不是同一个', /** @type {unknown} */ (images) === videos, false);
  assert('isEqual：图片 = 图片', images.isEqual(PHPickerFilter.imagesFilter), true);
  assert('isEqual：图片 ≠ 视频', images.isEqual(videos), false);
  assert('isEqual：和不是筛选条件的东西比是 false', images.isEqual('imagesFilter'), false);
  assert('isEqual：和 null 比是 false', images.isEqual(null), false);
  rejects('筛选条件是只读的',
          // @ts-expect-error 只读
          () => { PHPickerFilter.imagesFilter = videos; },
          '');

  // ---- 组合 ----
  const any = PHPickerFilter.anyFilterMatchingSubfilters([images, videos]);
  assert('anyFilterMatchingSubfilters 给的是 PHPickerFilter', any instanceof PHPickerFilter, true);
  assert('同样的组合再建一次 isEqual',
         any.isEqual(PHPickerFilter.anyFilterMatchingSubfilters([images, videos])), true);
  assert('组合出来的和单个的不相等', any.isEqual(images), false);
  const all = PHPickerFilter.allFilterMatchingSubfilters(
    [images, PHPickerFilter.screenshotsFilter]);
  assert('allFilterMatchingSubfilters 给的是 PHPickerFilter', all instanceof PHPickerFilter, true);
  const not = PHPickerFilter.notFilterOfSubfilter(PHPickerFilter.livePhotosFilter);
  assert('notFilterOfSubfilter 给的是 PHPickerFilter', not instanceof PHPickerFilter, true);
  assert('可以嵌套',
         PHPickerFilter.allFilterMatchingSubfilters([any, not]) instanceof PHPickerFilter, true);
  assert('收任何可迭代的东西（Set）',
         PHPickerFilter.anyFilterMatchingSubfilters(new Set([images, videos]))
           instanceof PHPickerFilter, true);

  // 空数组在系统里是一个接不住的断言失败（macOS 上量到进程直接终止），
  // 所以必须在到达系统之前拦掉
  rejects('anyFilterMatchingSubfilters 不收空数组',
          () => PHPickerFilter.anyFilterMatchingSubfilters([]),
          'at least one');
  rejects('allFilterMatchingSubfilters 不收空数组',
          () => PHPickerFilter.allFilterMatchingSubfilters([]),
          'at least one');
  rejects('anyFilterMatchingSubfilters 要数组',
          // @ts-expect-error 要的是数组
          () => PHPickerFilter.anyFilterMatchingSubfilters(images),
          'array of PHPickerFilter');
  rejects('数组里不是筛选条件',
          // @ts-expect-error 要的是 PHPickerFilter
          () => PHPickerFilter.anyFilterMatchingSubfilters([images, 'videos']),
          'PHPickerFilter');
  rejects('数组里是别的原生对象',
          // @ts-expect-error 要的是 PHPickerFilter
          () => PHPickerFilter.allFilterMatchingSubfilters([images, UIDevice.currentDevice]),
          'PHPickerFilter');
  rejects('notFilterOfSubfilter 要一个筛选条件',
          // @ts-expect-error 要的是 PHPickerFilter
          () => PHPickerFilter.notFilterOfSubfilter(null),
          'PHPickerFilter');
  assert('playbackStyleFilter 没有接',
         'playbackStyleFilter' in PHPickerFilter, false);

  // ===== PHPickerConfiguration：选图界面的配置 =====

  const config = new PHPickerConfiguration();
  assert('new PHPickerConfiguration() 建得出来', config instanceof PHPickerConfiguration, true);
  assert('默认 selectionLimit', config.selectionLimit, 1);
  assert('默认 filter', config.filter, null);
  assert('默认 preferredAssetRepresentationMode', config.preferredAssetRepresentationMode,
         'automatic');
  assert('默认 selection', config.selection, 'default');
  assert('默认 mode', config.mode, 'default');

  // ---- selectionLimit ----
  config.selectionLimit = 5;
  assert('selectionLimit 写 5', config.selectionLimit, 5);
  config.selectionLimit = 0;
  assert('selectionLimit 写 0（不限）', config.selectionLimit, 0);
  // @ts-expect-error 宽松接收：字符串按数转
  config.selectionLimit = '3';
  assert("selectionLimit 写 '3' 得到 3", config.selectionLimit, 3);
  config.selectionLimit = 2.9;
  assert('selectionLimit 写 2.9 向零取整', config.selectionLimit, 2);
  rejects('selectionLimit 写 NaN',
          () => { config.selectionLimit = NaN; },
          'finite number');
  rejects('selectionLimit 写 undefined',
          // @ts-expect-error 要的是数
          () => { config.selectionLimit = undefined; },
          'finite number');
  // 负数进了系统，建选择器时进程直接终止（macOS 上量的），所以在这里拦
  rejects('selectionLimit 写负数',
          () => { config.selectionLimit = -1; },
          'must not be negative');
  assert('被拒之后值没变', config.selectionLimit, 2);

  // ---- filter ----
  config.filter = images;
  assert('filter 写进去读得回来（系统存的是副本，用 isEqual 比）',
         config.filter !== null && config.filter.isEqual(images), true);
  assert('读回来的是 PHPickerFilter', config.filter instanceof PHPickerFilter, true);
  config.filter = any;
  assert('filter 换成组合的', config.filter !== null && config.filter.isEqual(any), true);
  config.filter = null;
  assert('filter 写 null（所有类型）', config.filter, null);
  rejects('filter 写字符串',
          // @ts-expect-error 要的是 PHPickerFilter
          () => { config.filter = 'images'; },
          'native object');
  rejects('filter 写别的原生对象',
          // @ts-expect-error 要的是 PHPickerFilter
          () => { config.filter = UIDevice.currentDevice; },
          'PHPickerFilter');

  // ---- 三个枚举 ----
  for (const value of /** @type {const} */ (['current', 'compatible', 'automatic'])) {
    config.preferredAssetRepresentationMode = value;
    assert('preferredAssetRepresentationMode 写 ' + value,
           config.preferredAssetRepresentationMode, value);
  }
  for (const value of /** @type {const} */ (
    ['ordered', 'continuous', 'continuousAndOrdered', 'default'])) {
    config.selection = value;
    assert('selection 写 ' + value, config.selection, value);
  }
  for (const value of /** @type {const} */ (['compact', 'default'])) {
    config.mode = value;
    assert('mode 写 ' + value, config.mode, value);
  }
  assert('preferredAssetRepresentationMode 写错：不抛、值不变', enumIgnored(() => {
    // @ts-expect-error 没有这个值
    config.preferredAssetRepresentationMode = 'original';
  }, () => config.preferredAssetRepresentationMode), ENUM_IGNORED);
  assert('selection 写错：不抛、值不变', enumIgnored(() => {
    // @ts-expect-error 没有这个值
    config.selection = 'multiple';
  }, () => config.selection), ENUM_IGNORED);
  assert('mode 写错：不抛、值不变', enumIgnored(() => {
    // @ts-expect-error 没有这个值
    config.mode = 'full';
  }, () => config.mode), ENUM_IGNORED);
  assert('枚举写数字：不抛、值不变', enumIgnored(() => {
    // @ts-expect-error 枚举是字符串
    config.mode = 1;
  }, () => config.mode), ENUM_IGNORED);

  // ---- 没接的成员不在 ----
  for (const name of ['preselectedAssetIdentifiers', 'edgesWithoutContentMargins',
                      'disabledCapabilities', 'metadataOptions', 'searchText']) {
    assert('PHPickerConfiguration 上没有 ' + name, name in config, false);
  }

  // ===== PHPickerViewController：选图界面 =====
  //
  // 只建、不呈现：建出来不会弹任何东西

  rejects('PHPickerViewController 不给配置',
          // @ts-expect-error 少了配置
          () => new PHPickerViewController(),
          'PHPickerConfiguration');
  rejects('PHPickerViewController 给的不是配置',
          // @ts-expect-error 要的是 PHPickerConfiguration
          () => new PHPickerViewController({ selectionLimit: 3 }),
          'PHPickerConfiguration');
  rejects('PHPickerViewController 给别的原生对象',
          // @ts-expect-error 要的是 PHPickerConfiguration
          () => new PHPickerViewController(UIDevice.currentDevice),
          'PHPickerConfiguration');

  config.selectionLimit = 3;
  config.filter = images;
  config.selection = 'ordered';
  const picker = new PHPickerViewController(config);
  assert('new PHPickerViewController(config) 建得出来',
         picker instanceof PHPickerViewController, true);
  assert('它是一个页面', picker instanceof UIViewController, true);
  assert('建出来没有被呈现', picker.presentingViewController, null);

  // 配置在构造时被复制
  const copied = picker.configuration;
  assert('picker.configuration 是 PHPickerConfiguration',
         copied instanceof PHPickerConfiguration, true);
  assert('它不是传进去的那个对象（是副本）', copied === config, false);
  assert('两次读是同一个对象', picker.configuration === copied, true);
  assert('副本的 selectionLimit', copied.selectionLimit, 3);
  assert('副本的 selection', copied.selection, 'ordered');
  assert('副本的 filter', copied.filter !== null && copied.filter.isEqual(images), true);
  config.selectionLimit = 9;
  assert('构造之后改原来的配置，选择器里的不变', picker.configuration.selectionLimit, 3);
  rejects('configuration 是只读的',
          // @ts-expect-error 只读
          () => { picker.configuration = config; },
          '');

  // ---- 事件：订阅和退订 ----
  let finished = 0;
  /** @type {unknown} */
  let seenResults = 'untouched';
  /** @param {Event} event */
  const onFinish = (event) => {
    finished += 1;
    seenResults = /** @type {PHPickerViewControllerFinishEvent} */ (event).results;
  };
  picker.addEventListener('pick', onFinish);
  // 自己派发的事件只到监听器，不带 results：那是系统给的
  picker.dispatchEvent(new Event('pick'));
  assert('订了之后自己派发的收得到', finished, 1);
  assert('自己派发的事件上没有 results', seenResults, undefined);
  picker.removeEventListener('pick', onFinish);
  picker.dispatchEvent(new Event('pick'));
  assert('退订之后收不到', finished, 1);
  // 页面本来就有的事件照常订得上
  const noop = () => {};
  picker.addEventListener('dismiss', noop);
  picker.removeEventListener('dismiss', noop);
  picker.addEventListener('appear', noop);
  picker.removeEventListener('appear', noop);
  console.log('  ✓ 页面的 dismiss 和 appear 在选择器上订得上、退得掉');
  assert('不认识的事件名：当自定义事件', customEventWorks(picker, 'not-a-real-event'), '收到一次');

  // ---- 没接的成员不在 ----
  for (const name of ['delegate', 'updatePickerUsingConfiguration', 'deselectAssetsWithIdentifiers',
                      'moveAssetWithIdentifier', 'scrollToInitialPosition', 'zoomIn', 'zoomOut']) {
    assert('PHPickerViewController 上没有 ' + name, name in picker, false);
  }

  // ===== PHPickerResult：选中的一项 =====
  //
  // 只有选图界面给得出来，这里只能看它的形状

  rejects('PHPickerResult 不能 new',
          // @ts-expect-error 构造函数不公开
          () => new PHPickerResult(),
          'Illegal constructor');
  assert('PHPickerResult 有 itemProvider',
         typeof Object.getOwnPropertyDescriptor(PHPickerResult.prototype, 'itemProvider')?.get,
         'function');
  assert('itemProvider 只读',
         Object.getOwnPropertyDescriptor(PHPickerResult.prototype, 'itemProvider')?.set,
         undefined);
  assert('assetIdentifier 没有接', 'assetIdentifier' in PHPickerResult.prototype, false);

  // ===== PHPhotoLibrary：存图 =====

  rejects('PHPhotoLibrary 不能 new',
          // @ts-expect-error 构造函数不公开
          () => new PHPhotoLibrary(),
          'Illegal constructor');
  const library = PHPhotoLibrary.sharedPhotoLibrary;
  assert('sharedPhotoLibrary 是 PHPhotoLibrary', library instanceof PHPhotoLibrary, true);
  assert('两次读是同一个对象', PHPhotoLibrary.sharedPhotoLibrary === library, true);

  // 读授权状态不会弹提示框
  const STATUSES = ['notDetermined', 'restricted', 'denied', 'authorized', 'limited'];
  const status = PHPhotoLibrary.authorizationStatusForAccessLevel('addOnly');
  assert('authorizationStatusForAccessLevel(addOnly) 是五个状态之一（现在是 ' + status + '）',
         STATUSES.includes(status), true);
  rejects('readWrite 不支持：它要另一句权限文案',
          // @ts-expect-error 只支持 addOnly
          () => PHPhotoLibrary.authorizationStatusForAccessLevel('readWrite'),
          'addOnly');
  rejects('不认识的访问级别',
          // @ts-expect-error 没有这个值
          () => PHPhotoLibrary.authorizationStatusForAccessLevel('all'),
          'addOnly');
  // 申请授权：级别写错在发起之前就抛，不会弹提示框。写对的那一种会弹，
  // 留给按钮
  rejects('requestAuthorizationForAccessLevel 写错级别：同步抛',
          // @ts-expect-error 只支持 addOnly
          () => PHPhotoLibrary.requestAuthorizationForAccessLevel('readWrite'),
          'addOnly');
  rejects('requestAuthorizationForAccessLevel 不给级别',
          // @ts-expect-error 少了参数
          () => PHPhotoLibrary.requestAuthorizationForAccessLevel(),
          'addOnly');

  // performChanges 的参数都在发起之前验，同步抛，所以这几条不会弹提示框
  rejects('performChanges 不给参数',
          // @ts-expect-error 少了参数
          () => library.performChanges(),
          'creationRequestForAssetFromImage');
  rejects('performChanges 给空对象',
          // @ts-expect-error 少了 creationRequestForAssetFromImage
          () => library.performChanges({}),
          'creationRequestForAssetFromImage');
  rejects('performChanges 的图片不是 UIImage',
          // @ts-expect-error 要的是 UIImage
          () => library.performChanges({ creationRequestForAssetFromImage: 'dot.png' }),
          'UIImage');
  rejects('performChanges 的图片是别的原生对象',
          // @ts-expect-error 要的是 UIImage
          () => library.performChanges({ creationRequestForAssetFromImage: UIDevice.currentDevice }),
          'UIImage');
  rejects('performChanges 给函数（ObjC 那种写法）',
          // @ts-expect-error 不收函数
          () => library.performChanges(() => {}),
          'creationRequestForAssetFromImage');
  rejects('performChanges 里有不支持的修改',
          () => library.performChanges({
            creationRequestForAssetFromImage: dot,
            // @ts-expect-error 没有接
            deleteAssets: [],
          }),
          'deleteAssets');
  for (const name of ['authorizationStatus', 'requestAuthorization',
                      'presentLimitedLibraryPickerFromViewController']) {
    assert('PHPhotoLibrary 上没有 ' + name,
           name in PHPhotoLibrary || name in library, false);
  }

  // ===== NSItemProvider：一项内容的提供者 =====
  //
  // 选图界面给的每个结果带一个；也可以自己用一张图建一个（initWithObject:）。
  // 后一种不用界面，取图的整条路在这里就走得通

  rejects('NSItemProvider 不给东西',
          // @ts-expect-error 少了参数
          () => new NSItemProvider(),
          'UIImage');
  rejects('NSItemProvider 给字符串',
          // @ts-expect-error 现在只收 UIImage
          () => new NSItemProvider('hello'),
          'UIImage');

  const provider = new NSItemProvider(dot);
  assert('new NSItemProvider(image) 建得出来', provider instanceof NSItemProvider, true);
  const types = provider.registeredTypeIdentifiers;
  assert('registeredTypeIdentifiers 是字符串数组',
         Array.isArray(types) && types.length > 0 && types.every((t) => typeof t === 'string'),
         true);
  console.log('  · 一张图的 registeredTypeIdentifiers: ' + types.join(', '));
  assert('hasItemConformingToTypeIdentifier(public.image)',
         provider.hasItemConformingToTypeIdentifier('public.image'), true);
  assert('hasItemConformingToTypeIdentifier(public.movie)',
         provider.hasItemConformingToTypeIdentifier('public.movie'), false);
  assert('suggestedName 是字符串或 null',
         provider.suggestedName === null || typeof provider.suggestedName === 'string', true);
  assert('canLoadObjectOfClass(UIImage)', provider.canLoadObjectOfClass(UIImage), true);
  rejects('canLoadObjectOfClass 只认 UIImage',
          // @ts-expect-error 现在只支持 UIImage
          () => provider.canLoadObjectOfClass(UIColor),
          'UIImage');
  rejects('loadObjectOfClass 只认 UIImage：同步抛',
          // @ts-expect-error 现在只支持 UIImage
          () => provider.loadObjectOfClass(UIView),
          'UIImage');
  rejects('loadObjectOfClass 不给类',
          // @ts-expect-error 少了参数
          () => provider.loadObjectOfClass(),
          'UIImage');
  for (const name of ['loadDataRepresentationForTypeIdentifier',
                      'loadFileRepresentationForTypeIdentifier', 'loadItemForTypeIdentifier',
                      'registerObject']) {
    assert('NSItemProvider 上没有 ' + name, name in provider, false);
  }

  // ---- 屏幕上：两排按钮，点了才弹、才存 ----
  addButtons(ctx, host, dot);

  // ---- 取图：异步，兑现成 UIImage ----
  const loading = provider.loadObjectOfClass(UIImage);
  assert('loadObjectOfClass 返回 Promise', loading instanceof Promise, true);
  return (async () => {
    try {
      const loaded = await loading;
      assert('loadObjectOfClass 兑现成 UIImage', loaded instanceof UIImage, true);
      assert('取出来的图有尺寸', loaded.size.width > 0 && loaded.size.height > 0, true);
      // 同一个提供者可以再取一次，两次并发也各自兑现
      const [a, b] = await Promise.all([
        provider.loadObjectOfClass(UIImage),
        new NSItemProvider(dot).loadObjectOfClass(UIImage),
      ]);
      assert('并发取两次都兑现成 UIImage', a instanceof UIImage && b instanceof UIImage, true);
    } catch (err) {
      console.log('  ✗ 取图被拒了: ' + (err instanceof Error ? err.name + ': ' + err.message : err));
    }
  })();
}

/**
 * 两排按钮。这些都要人点：选图界面在系统自己的进程里，脚本点不到；存图会弹
 * 权限提示框。
 *
 * @param {import("../main.js").StepContext} ctx
 * @param {UIView} host
 * @param {UIImage} dot 拿来存的那张图
 */
function addButtons(ctx, host, dot) {
  const panel = new UIStackView();
  panel.axis = 'vertical';
  panel.distribution = 'fillEqually';
  panel.spacing = 6;
  panel.translatesAutoresizingMaskIntoConstraints = false;
  host.addSubview(panel);
  NSLayoutConstraint.activateConstraints([
    panel.leadingAnchor.constraintEqualToAnchor(host.leadingAnchor, { constant: 16 }),
    panel.trailingAnchor.constraintEqualToAnchor(host.trailingAnchor, { constant: -16 }),
    panel.topAnchor.constraintEqualToAnchor(host.topAnchor),
    panel.bottomAnchor.constraintEqualToAnchor(host.bottomAnchor),
  ]);

  // 呈现选图界面的那一页：当时在最上面的那一页
  const topPage = () => {
    /** @type {UIViewController} */
    let page = /** @type {UIViewController} */ (ctx.win.rootViewController);
    while (page.presentedViewController !== null) page = page.presentedViewController;
    return page;
  };

  /**
   * @param {string} label
   * @param {(config: PHPickerConfiguration) => void} configure
   */
  const pick = (label, configure) => () => {
    const config = new PHPickerConfiguration();
    configure(config);
    const picker = new PHPickerViewController(config);
    let times = 0;
    picker.addEventListener('pick', (event) => {
      times += 1;
      const { results } = /** @type {PHPickerViewControllerFinishEvent} */ (event);
      console.log('  ✓ 真实触摸：' + label + ' pick（第 ' + times + ' 次），选了 ' +
                  results.length + ' 项' + (results.length === 0 ? '（取消）' : ''));
      // 选图界面不会自己关
      picker.dismissViewController({ animated: true }).then(
        () => console.log('  ✓ 选图界面关掉了，presentingViewController = ' +
                          picker.presentingViewController));
      results.forEach((result, index) => {
        const provider = result.itemProvider;
        console.log('    · 第 ' + (index + 1) + ' 项: ' + provider.registeredTypeIdentifiers.join(', ') +
                    '，suggestedName = ' + provider.suggestedName +
                    '，canLoad UIImage = ' + provider.canLoadObjectOfClass(UIImage));
        if (!provider.canLoadObjectOfClass(UIImage)) return;
        const before = performance.now();
        provider.loadObjectOfClass(UIImage).then(
          (image) => console.log('    ✓ 第 ' + (index + 1) + ' 项取出来了: ' +
                                 (image instanceof UIImage) + '，' + image.size.width + ' × ' +
                                 image.size.height + ' 点，用了 ' +
                                 (performance.now() - before).toFixed(0) + ' ms'),
          (err) => console.log('    ✗ 第 ' + (index + 1) + ' 项取不出来: ' + err.name + ': ' +
                               err.message));
      });
    });
    picker.addEventListener('dismiss', () => {
      console.log('  ✓ 真实触摸：' + label + ' 被拖走了（dismiss），之前收到 ' + times +
                  ' 次 pick');
    });
    topPage().presentViewController(picker, { animated: true }).then(
      () => console.log('  ✓ 真实触摸：' + label + ' 弹出来了，没有弹权限提示框才对'),
      (err) => console.log('  ✗ ' + label + ' 弹不出来: ' + err.message));
  };

  panelRow(panel, [
    ['选一张图', pick('选一张图', (config) => { config.filter = PHPickerFilter.imagesFilter; })],
    ['最多选三项', pick('最多选三项', (config) => {
      config.selectionLimit = 3;
      config.selection = 'ordered';
    })],
  ]);
  panelRow(panel, [
    ['存图权限', () => {
      console.log('  · 存图权限现在是 ' + PHPhotoLibrary.authorizationStatusForAccessLevel('addOnly'));
      PHPhotoLibrary.requestAuthorizationForAccessLevel('addOnly').then(
        (status) => console.log('  ✓ 真实触摸：requestAuthorizationForAccessLevel 兑现成 ' + status),
        (err) => console.log('  ✗ 申请存图权限被拒: ' + err.name + ': ' + err.message));
    }],
    ['存一张图', () => {
      PHPhotoLibrary.sharedPhotoLibrary.performChanges({ creationRequestForAssetFromImage: dot }).then(
        (value) => console.log('  ✓ 真实触摸：存进相册了（兑现成 ' + value +
                               '），到系统的「照片」里看有没有一个小圆点'),
        (err) => console.log('  ✓ 真实触摸：没存成，' + err.name + ': ' + err.message +
                             '（code ' + err.code + '，domain ' + err.domain + '）'));
    }],
  ]);
  console.log('  ✓ 「相册」区块里有两排按钮：选一张图 / 最多选三项，存图权限 / 存一张图');
}
