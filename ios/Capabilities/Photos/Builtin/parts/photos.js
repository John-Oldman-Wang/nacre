// 相册的 JS 那一半：从相册选图、把图片存进相册。
//
// 这是**能力包自己的 part**：它不在核心里，跟着 NacrePhotos.framework 走
// （Builtin/parts/）。写法和核心的 part 一样——整个文件是一个函数表达式，
// 运行时在核心的 part 全部跑完之后，用同一个 ctx 调它一次。
//
// 六个类，都按 ObjC 的类名挂在全局上：PHPickerFilter、PHPickerConfiguration、
// PHPickerViewController、PHPickerResult、NSItemProvider、PHPhotoLibrary。
// 装了 @nacrejs/photos 才有。
(function (ctx) {
  'use strict';

  const {
    constructNative,
    Event,
    defineNativeClass,
    describeValue,
    has,
    internalEventHandlers,
    nativeCall,
    nativeCallAsync,
    nativeCallObject,
    nativeCallObjectArray,
    nativeClassCall,
    nativeClassCallValue,
    nativeClassObject,
    nativeGet,
    nativeGetOwned,
    nativeOnly,
    nativeSet,
    nativeSetOwned,
    own,
    requireNative,
    toInteger,
    toText,
  } = ctx;

  // ---- 选图界面里显示哪些类型 ----
  //
  // 没有 new：现成的十二个从类上拿，要组合就用三个类方法。
  //
  // 系统每次读 PHPickerFilter.imagesFilter 给的都是一个新对象（isEqual: 为真、
  // 指针不同），照搬过来的话 PHPickerFilter.imagesFilter !== PHPickerFilter.imagesFilter。
  // 所以这十二个按名字留住，读几次都是同一个包装。
  // 组合出来的、从配置上读回来的仍然是各自的对象，要比较用 isEqual()
  const filterConstants = new Map();
  function filterConstant(name) {
    let filter = filterConstants.get(name);
    if (filter === undefined) {
      filter = nativeClassObject('PHPickerFilter', name);
      filterConstants.set(name, filter);
    }
    return filter;
  }

  // 一组子条件 → 过桥的参数，一项一个。
  // 空的不许：系统对空数组是断言失败，进程直接终止，接不住
  function subfilterList(subfilters, what) {
    if (subfilters === null || typeof subfilters !== 'object' ||
        typeof subfilters[Symbol.iterator] !== 'function') {
      throw new TypeError(what + ' needs an array of PHPickerFilter, got ' +
                          describeValue(subfilters));
    }
    const list = Array.from(subfilters);
    list.forEach((item, i) => {
      if (!(item instanceof PHPickerFilter)) {
        throw new TypeError(what + ': subfilters[' + i + '] must be a PHPickerFilter, got ' +
                            describeValue(item));
      }
    });
    if (list.length === 0) {
      throw new TypeError(what + ' needs at least one PHPickerFilter');
    }
    return list;
  }

  const PHPickerFilter = defineNativeClass('PHPickerFilter', class PHPickerFilter extends NSObject {
    constructor() { nativeOnly(new.target); }

    static get imagesFilter() { return filterConstant('imagesFilter'); }
    static get videosFilter() { return filterConstant('videosFilter'); }
    static get livePhotosFilter() { return filterConstant('livePhotosFilter'); }
    static get depthEffectPhotosFilter() { return filterConstant('depthEffectPhotosFilter'); }
    static get burstsFilter() { return filterConstant('burstsFilter'); }
    static get panoramasFilter() { return filterConstant('panoramasFilter'); }
    static get screenshotsFilter() { return filterConstant('screenshotsFilter'); }
    static get screenRecordingsFilter() { return filterConstant('screenRecordingsFilter'); }
    static get cinematicVideosFilter() { return filterConstant('cinematicVideosFilter'); }
    static get slomoVideosFilter() { return filterConstant('slomoVideosFilter'); }
    static get timelapseVideosFilter() { return filterConstant('timelapseVideosFilter'); }
    static get spatialMediaFilter() { return filterConstant('spatialMediaFilter'); }

    // 符合其中任何一个
    static anyFilterMatchingSubfilters(subfilters) {
      return nativeClassCall('PHPickerFilter', 'anyFilterMatchingSubfilters:',
                             subfilterList(subfilters, 'anyFilterMatchingSubfilters'));
    }
    // 每一个都符合
    static allFilterMatchingSubfilters(subfilters) {
      return nativeClassCall('PHPickerFilter', 'allFilterMatchingSubfilters:',
                             subfilterList(subfilters, 'allFilterMatchingSubfilters'));
    }
    // 不符合这一个
    static notFilterOfSubfilter(subfilter) {
      if (!(subfilter instanceof PHPickerFilter)) {
        throw new TypeError('notFilterOfSubfilter needs a PHPickerFilter, got ' +
                            describeValue(subfilter));
      }
      return nativeClassCall('PHPickerFilter', 'notFilterOfSubfilter:', [subfilter]);
    }

    // 两个筛选条件是不是同一个意思。不是筛选条件的东西一律 false
    isEqual(other) {
      requireNative(this, 'isEqual');
      if (!(other instanceof PHPickerFilter)) return false;
      return nativeCall(this, 'isEqual:', [other]);
    }
  });

  // ---- 选图界面的配置 ----
  //
  // 建选择器时被复制一份，之后再改这个对象不影响已经建好的选择器
  const PHPickerConfiguration = defineNativeClass('PHPickerConfiguration',
                                                  class PHPickerConfiguration extends NSObject {
    // ＝ init：用系统的相册
    constructor() {
      super();
      constructNative(this, new.target, 'PHPickerConfiguration', []);
    }

    // 最多选几项。默认 1；0 是不限
    get selectionLimit() {
      requireNative(this, 'selectionLimit');
      return nativeGet(this, 'selectionLimit');
    }
    set selectionLimit(value) {
      requireNative(this, 'selectionLimit');
      const limit = toInteger(value, 'selectionLimit');
      // 负数系统存得进去，但拿它建选择器时进程直接终止
      if (limit < 0) {
        throw new TypeError('selectionLimit must not be negative, got ' + limit);
      }
      nativeSet(this, 'selectionLimit', limit);
    }
    // 显示哪些类型。null 是全部。系统存的是副本，读回来的不是写进去的那个
    // 对象，比较用 isEqual()
    get filter() { return nativeGetOwned(this, 'filter'); }
    set filter(value) { nativeSetOwned(this, 'filter', value); }
    // 一项有几种格式时给哪一种
    get preferredAssetRepresentationMode() {
      requireNative(this, 'preferredAssetRepresentationMode');
      return nativeGet(this, 'preferredAssetRepresentationMode');
    }
    set preferredAssetRepresentationMode(value) {
      requireNative(this, 'preferredAssetRepresentationMode');
      nativeSet(this, 'preferredAssetRepresentationMode', value);
    }
    // 选中的方式：带不带序号、是不是每选一项就通知一次
    get selection() { requireNative(this, 'selection'); return nativeGet(this, 'selection'); }
    set selection(value) { requireNative(this, 'selection'); nativeSet(this, 'selection', value); }
    // 界面的样子：完整的，或者只有一行
    get mode() { requireNative(this, 'mode'); return nativeGet(this, 'mode'); }
    set mode(value) { requireNative(this, 'mode'); nativeSet(this, 'mode', value); }
  });

  // ---- 选中的一项 ----
  //
  // 只有选图界面给得出来。它自己不是图片：图片要从 itemProvider 上取
  defineNativeClass('PHPickerResult', class PHPickerResult extends NSObject {
    constructor() { nativeOnly(new.target); }

    get itemProvider() { return nativeGetOwned(this, 'itemProvider'); }
  });

  // ---- 一项内容的提供者 ----
  //
  // Foundation 的类。这里只接了从它身上取图片要用的那几样

  // 取什么类型的对象。现在只认 UIImage；过桥的是类名
  function loadableClass(aClass, what) {
    if (aClass !== UIImage) {
      throw new TypeError(
        what + ' supports only UIImage for now, got ' +
        (typeof aClass === 'function' && aClass.name ? aClass.name : describeValue(aClass)));
    }
    return 'UIImage';
  }

  defineNativeClass('NSItemProvider', class NSItemProvider extends NSObject {
    // ＝ initWithObject:。现在只收 UIImage
    constructor(object) {
      super();
      if (!(object instanceof UIImage)) {
        throw new TypeError('new NSItemProvider supports only a UIImage for now, got ' +
                            describeValue(object));
      }
      constructNative(this, new.target, 'NSItemProvider', [object]);
      // 提供者拿着那张图
      own(this, 'object', object);
    }

    // 这一项有哪些格式，统一类型标识符（public.jpeg、public.heic…）
    get registeredTypeIdentifiers() {
      requireNative(this, 'registeredTypeIdentifiers');
      return nativeGet(this, 'registeredTypeIdentifiers');
    }
    // 系统建议的文件名，不带扩展名。没有是 null
    get suggestedName() {
      requireNative(this, 'suggestedName');
      return nativeGet(this, 'suggestedName');
    }
    // 是不是某一类内容：'public.image'、'public.movie'
    hasItemConformingToTypeIdentifier(typeIdentifier) {
      return nativeCall(this, 'hasItemConformingToTypeIdentifier:', [toText(typeIdentifier)]);
    }
    canLoadObjectOfClass(aClass) {
      return nativeCall(this, 'canLoadObjectOfClass:',
                        [loadableClass(aClass, 'canLoadObjectOfClass')]);
    }
    // completionHandler: 那一段换成 Promise，兑现成取出来的对象。
    //
    // 异步调用的结果带不了原生对象，所以原生那边先把图存着、兑现一个号，
    // 这里紧接着用一次同步调用按号取走
    loadObjectOfClass(aClass) {
      const className = loadableClass(aClass, 'loadObjectOfClass');
      requireNative(this, 'loadObjectOfClass');
      return nativeCallAsync(this, 'loadObjectOfClass:completionHandler:', [className])
        .then((token) => nativeCallObject(this, 'nacre:takeLoadedObject', [token]));
    }
  });

  // ---- 选图界面 ----
  //
  // 一个页面，用页面的 presentViewController() 弹出来。它在系统自己的进程里
  // 运行，App 只拿到用户选中的那几项，所以**不需要相册权限**。
  //
  // ObjC 那边选完了是调委托的 picker:didFinishPicking:。这里没有委托：选择器
  // 是一个事件目标，选完（或者取消）派发 pick，事件上的 results
  // 是选中的那几项，取消时是空数组。
  //
  // 系统**不会自己把它关掉**，在监听器里调 dismissViewController()
  defineNativeClass('PHPickerViewController',
                    class PHPickerViewController extends UIViewController {
    // ＝ initWithConfiguration:
    constructor(configuration) {
      super();
      if (!(configuration instanceof PHPickerConfiguration)) {
        throw new TypeError('new PHPickerViewController needs a PHPickerConfiguration, got ' +
                            describeValue(configuration));
      }
      constructNative(this, new.target, 'PHPickerViewController', [configuration]);
    }

    // 构造时复制的那一份配置
    get configuration() { return nativeGetOwned(this, 'configuration'); }
  });

  // 选图结束。原生那边把结果存着，发一个带号的内部事件；这里按号取走那一组
  // 结果，建出 pick 再派发。绕这一下是因为事件只带得了一个对象，
  // 而结果是一组
  const PHPickerViewControllerFinishEvent = ctx.defineEventClass(
    'PHPickerViewControllerFinishEvent', Event, { results: ['frozenArray', () => Object.freeze([])] });
  internalEventHandlers.set('@photos-picked', (picker, payload) => {
    const token = payload !== null && typeof payload === 'object' ? payload.token : null;
    const results = nativeCallObjectArray(picker, 'nacre:takeResults', [token]);
    picker.dispatchEvent(new PHPickerViewControllerFinishEvent('pick', { results }));
  });

  // ---- 相册 ----
  //
  // 只接了「添加」那条路：把一张图存进去。读相册里的东西要完整的相册权限，
  // 没有接；让用户选图用上面的选图界面，那个不要权限
  const PHPhotoLibrary = defineNativeClass('PHPhotoLibrary', class PHPhotoLibrary extends NSObject {
    constructor() { nativeOnly(new.target); }

    // 系统的单例一直活着，所以由类自己拿着它的包装
    static get sharedPhotoLibrary() {
      return own(this, 'sharedPhotoLibrary',
                 nativeClassObject('PHPhotoLibrary', 'sharedPhotoLibrary'));
    }

    // 现在的授权状态。只是读，不会弹提示框
    static authorizationStatusForAccessLevel(accessLevel) {
      return nativeClassCallValue('PHPhotoLibrary', 'authorizationStatusForAccessLevel:',
                                  [accessLevel === undefined ? null : accessLevel]);
    }
    // handler: 那一段换成 Promise，兑现成授权状态。
    // 没问过用户时弹系统的提示框；问过了直接给现在的状态
    static requestAuthorizationForAccessLevel(accessLevel) {
      // 级别写错在这里就抛（原生那边认名字），不等到异步那一步
      PHPhotoLibrary.authorizationStatusForAccessLevel(accessLevel);
      return nativeCallAsync(PHPhotoLibrary.sharedPhotoLibrary,
                             'requestAuthorizationForAccessLevel:handler:', [accessLevel]);
    }

    // ObjC 那边是 performChanges:completionHandler:，第一个参数是一段代码，
    // 里面调 [PHAssetChangeRequest creationRequestForAssetFromImage:image]。
    // 那段代码系统在它自己的队列上执行，不在主线程，所以它不能是一段 JS。
    // 这里换成一个对象，键是要做的那种修改的名字：
    //
    //     performChanges({ creationRequestForAssetFromImage: image })
    //
    // completionHandler: 那一段换成 Promise。没问过用户时先按「添加」申请权限
    performChanges(changes) {
      const KEY = 'creationRequestForAssetFromImage';
      if (changes === null || typeof changes !== 'object') {
        throw new TypeError('performChanges needs { ' + KEY + ': image }, got ' +
                            describeValue(changes));
      }
      for (const key of Object.keys(changes)) {
        if (key !== KEY && changes[key] !== undefined) {
          throw new TypeError('performChanges does not support "' + key +
                              '" yet; the only supported change is ' + KEY);
        }
      }
      if (!has(changes, KEY)) {
        throw new TypeError('performChanges needs { ' + KEY + ': image }');
      }
      const image = changes[KEY];
      if (!(image instanceof UIImage)) {
        throw new TypeError(KEY + ' must be a UIImage, got ' + describeValue(image));
      }
      requireNative(this, 'performChanges');
      // 相册把图复制进去，不持有这张图；Promise 结算之前由闭包拿着它
      return PHPhotoLibrary.requestAuthorizationForAccessLevel('addOnly')
        .then(() => nativeCallAsync(this, 'performChanges:completionHandler:', [image]))
        .then(() => undefined);
    }
  });
})
