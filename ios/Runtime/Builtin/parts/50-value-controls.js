// 数值控件：UISwitch / UISlider / UIStepper / UISegmentedControl /
// UIPageControl / UIDatePicker
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
//
// 六个都是 UIControl 的子类。「值变了」听 change——那 16 个控件事件是
// UIControl 上现成的，这里一行订阅的代码都没有。
(function (ctx) {
  'use strict';

  const {
    RECT_FIELDS,
    SIZE_FIELDS,
    colorArg,
    colorString,
    constructNative,
    defineNativeClass,
    describeValue,
    has,
    nativeCall,
    nativeCallObject,
    nativeGet,
    nativeGetOwned,
    nativeSet,
    nativeSetOwned,
    own,
    ownAll,
    ownOne,
    requireNative,
    stateKey,
    stateOption,
    structArg,
    toBoolean,
    toInteger,
    toNumber,
    toRect,
    toSize,
    toTextOrNull,
  } = ctx;

  // options 里必须带的那一项。缺了就抛，和 stateOption 一个态度
  function requiredOption(options, key, what) {
    const o = options == null ? {} : options;
    if (!has(o, key)) throw new TypeError(what + ' needs { ' + key + ' }');
    return o[key];
  }
  // animated 可以不带，不带就是不要动画
  function animatedOption(options) {
    return toBoolean((options == null ? {} : options).animated);
  }

  // ---- 日期 ----
  // JS 这一侧是 Date，过桥的是毫秒数（getTime() 那个量）。
  // 照 Web 的 input.valueAsDate：只收 Date，不从字符串或数字转。
  // 用 Date.prototype.getTime 来认：它自己带类型检查，不是 Date 就抛
  const dateTime = Date.prototype.getTime;
  function dateArg(value, what) {
    let ms;
    try {
      ms = dateTime.call(value);
    } catch (e) {
      throw new TypeError(what + ' must be a Date, got ' + describeValue(value));
    }
    if (!Number.isFinite(ms)) {
      throw new TypeError(what + ' must be a valid Date, got an invalid one');
    }
    return ms;
  }
  function dateOrNullArg(value, what) {
    return value == null ? null : dateArg(value, what);
  }
  function toDate(ms) {
    return ms === null ? null : new Date(ms);
  }

  // 开关。大小由系统定，写 frame 的宽高不起作用
  defineNativeClass('UISwitch', class UISwitch extends UIControl {
    constructor() {
      super();
      constructNative(this, new.target, 'UISwitch', []);
    }

    get isOn() { requireNative(this, 'isOn'); return nativeGet(this, 'isOn'); }
    set isOn(value) { requireNative(this, 'isOn'); nativeSet(this, 'isOn', toBoolean(value)); }
    // 和写 isOn 的差别只是可以带动画。两个都不派发 change
    setOn(on, options) {
      nativeCall(this, 'setOn:animated:', [toBoolean(on), animatedOption(options)]);
    }

    // 开着的时候轨道的颜色。null 是系统的绿色
    get onTintColor() {
      requireNative(this, 'onTintColor');
      return colorString(nativeGetOwned(this, 'onTintColor'));
    }
    set onTintColor(value) {
      requireNative(this, 'onTintColor');
      const color = colorArg(value, 'onTintColor');
      if (color === undefined) return;   // 不合法，警告过了，保留旧值
      nativeSetOwned(this, 'onTintColor', color);
    }
    // 那个圆钮的颜色
    get thumbTintColor() {
      requireNative(this, 'thumbTintColor');
      return colorString(nativeGetOwned(this, 'thumbTintColor'));
    }
    set thumbTintColor(value) {
      requireNative(this, 'thumbTintColor');
      const color = colorArg(value, 'thumbTintColor');
      if (color === undefined) return;
      nativeSetOwned(this, 'thumbTintColor', color);
    }
  });

  // 滑块。三个值在原生是 32 位 float：写 0.3 读回来是 0.30000001192092896
  defineNativeClass('UISlider', class UISlider extends UIControl {
    constructor() {
      super();
      constructNative(this, new.target, 'UISlider', []);
    }

    // 超出 minimumValue 到 maximumValue 的值被钉在两头
    get value() { requireNative(this, 'value'); return nativeGet(this, 'value'); }
    set value(value) { requireNative(this, 'value'); nativeSet(this, 'value', toNumber(value, 'value')); }
    get minimumValue() { requireNative(this, 'minimumValue'); return nativeGet(this, 'minimumValue'); }
    set minimumValue(value) {
      requireNative(this, 'minimumValue');
      nativeSet(this, 'minimumValue', toNumber(value, 'minimumValue'));
    }
    get maximumValue() { requireNative(this, 'maximumValue'); return nativeGet(this, 'maximumValue'); }
    set maximumValue(value) {
      requireNative(this, 'maximumValue');
      nativeSet(this, 'maximumValue', toNumber(value, 'maximumValue'));
    }
    setValue(value, options) {
      nativeCall(this, 'setValue:animated:', [toNumber(value, 'setValue'), animatedOption(options)]);
    }
    // true：拖动途中一直派发 change；false：只在松手时派发一次
    get isContinuous() { requireNative(this, 'isContinuous'); return nativeGet(this, 'isContinuous'); }
    set isContinuous(value) {
      requireNative(this, 'isContinuous');
      nativeSet(this, 'isContinuous', toBoolean(value));
    }
    get sliderStyle() { requireNative(this, 'sliderStyle'); return nativeGet(this, 'sliderStyle'); }
    set sliderStyle(value) { requireNative(this, 'sliderStyle'); nativeSet(this, 'sliderStyle', value); }

    // ---- 颜色 ----
    get minimumTrackTintColor() {
      requireNative(this, 'minimumTrackTintColor');
      return colorString(nativeGetOwned(this, 'minimumTrackTintColor'));
    }
    set minimumTrackTintColor(value) {
      requireNative(this, 'minimumTrackTintColor');
      const color = colorArg(value, 'minimumTrackTintColor');
      if (color === undefined) return;
      nativeSetOwned(this, 'minimumTrackTintColor', color);
    }
    get maximumTrackTintColor() {
      requireNative(this, 'maximumTrackTintColor');
      return colorString(nativeGetOwned(this, 'maximumTrackTintColor'));
    }
    set maximumTrackTintColor(value) {
      requireNative(this, 'maximumTrackTintColor');
      const color = colorArg(value, 'maximumTrackTintColor');
      if (color === undefined) return;
      nativeSetOwned(this, 'maximumTrackTintColor', color);
    }
    get thumbTintColor() {
      requireNative(this, 'thumbTintColor');
      return colorString(nativeGetOwned(this, 'thumbTintColor'));
    }
    set thumbTintColor(value) {
      requireNative(this, 'thumbTintColor');
      const color = colorArg(value, 'thumbTintColor');
      if (color === undefined) return;
      nativeSetOwned(this, 'thumbTintColor', color);
    }

    // ---- 轨道两头的图 ----
    get minimumValueImage() {
      requireNative(this, 'minimumValueImage');
      return nativeGetOwned(this, 'minimumValueImage');
    }
    set minimumValueImage(value) {
      requireNative(this, 'minimumValueImage');
      nativeSetOwned(this, 'minimumValueImage', value);
    }
    get maximumValueImage() {
      requireNative(this, 'maximumValueImage');
      return nativeGetOwned(this, 'maximumValueImage');
    }
    set maximumValueImage(value) {
      requireNative(this, 'maximumValueImage');
      nativeSetOwned(this, 'maximumValueImage', value);
    }

    // ---- 按状态设的三张图，写法和 UIButton 的 setImage 一样 ----
    setThumbImage(image, options) {
      const state = stateOption(options, 'setThumbImage');
      nativeCall(this, 'setThumbImage:forState:', [image, state]);
      own(this, stateKey('thumbImage', state), image);
    }
    setMinimumTrackImage(image, options) {
      const state = stateOption(options, 'setMinimumTrackImage');
      nativeCall(this, 'setMinimumTrackImage:forState:', [image, state]);
      own(this, stateKey('minimumTrackImage', state), image);
    }
    setMaximumTrackImage(image, options) {
      const state = stateOption(options, 'setMaximumTrackImage');
      nativeCall(this, 'setMaximumTrackImage:forState:', [image, state]);
      own(this, stateKey('maximumTrackImage', state), image);
    }
    // 取值这一侧只认单个状态，和 UIButton 一样
    thumbImageForState(state) {
      return own(this, stateKey('thumbImage', state),
                 nativeCallObject(this, 'thumbImageForState:', [[state]]));
    }
    minimumTrackImageForState(state) {
      return own(this, stateKey('minimumTrackImage', state),
                 nativeCallObject(this, 'minimumTrackImageForState:', [[state]]));
    }
    maximumTrackImageForState(state) {
      return own(this, stateKey('maximumTrackImage', state),
                 nativeCallObject(this, 'maximumTrackImageForState:', [[state]]));
    }
    get currentThumbImage() {
      requireNative(this, 'currentThumbImage');
      return nativeGetOwned(this, 'currentThumbImage');
    }
    get currentMinimumTrackImage() {
      requireNative(this, 'currentMinimumTrackImage');
      return nativeGetOwned(this, 'currentMinimumTrackImage');
    }
    get currentMaximumTrackImage() {
      requireNative(this, 'currentMaximumTrackImage');
      return nativeGetOwned(this, 'currentMaximumTrackImage');
    }

    // ---- 各部分画在哪。bounds 一般就传 slider.bounds ----
    trackRectForBounds(bounds) {
      return toRect(nativeCall(this, 'trackRectForBounds:',
                               [structArg(bounds, RECT_FIELDS, 'trackRectForBounds')]));
    }
    minimumValueImageRectForBounds(bounds) {
      return toRect(nativeCall(this, 'minimumValueImageRectForBounds:',
                               [structArg(bounds, RECT_FIELDS, 'minimumValueImageRectForBounds')]));
    }
    maximumValueImageRectForBounds(bounds) {
      return toRect(nativeCall(this, 'maximumValueImageRectForBounds:',
                               [structArg(bounds, RECT_FIELDS, 'maximumValueImageRectForBounds')]));
    }
    thumbRectForBounds(bounds, options) {
      const what = 'thumbRectForBounds';
      const trackRect = requiredOption(options, 'trackRect', what);
      const value = requiredOption(options, 'value', what);
      return toRect(nativeCall(this, 'thumbRectForBounds:trackRect:value:', [
        structArg(bounds, RECT_FIELDS, what),
        structArg(trackRect, RECT_FIELDS, 'trackRect'),
        toNumber(value, 'value'),
      ]));
    }
  });

  // 步进器：一个减号一个加号。值是双精度
  defineNativeClass('UIStepper', class UIStepper extends UIControl {
    constructor() {
      super();
      constructNative(this, new.target, 'UIStepper', []);
    }

    get value() { requireNative(this, 'value'); return nativeGet(this, 'value'); }
    set value(value) { requireNative(this, 'value'); nativeSet(this, 'value', toNumber(value, 'value')); }
    get minimumValue() { requireNative(this, 'minimumValue'); return nativeGet(this, 'minimumValue'); }
    set minimumValue(value) {
      requireNative(this, 'minimumValue');
      nativeSet(this, 'minimumValue', toNumber(value, 'minimumValue'));
    }
    get maximumValue() { requireNative(this, 'maximumValue'); return nativeGet(this, 'maximumValue'); }
    set maximumValue(value) {
      requireNative(this, 'maximumValue');
      nativeSet(this, 'maximumValue', toNumber(value, 'maximumValue'));
    }
    // 点一下加减多少。必须大于 0
    get stepValue() { requireNative(this, 'stepValue'); return nativeGet(this, 'stepValue'); }
    set stepValue(value) {
      requireNative(this, 'stepValue');
      nativeSet(this, 'stepValue', toNumber(value, 'stepValue'));
    }
    // true：按住连加时每加一次都派发 change；false：松手才派发
    get isContinuous() { requireNative(this, 'isContinuous'); return nativeGet(this, 'isContinuous'); }
    set isContinuous(value) {
      requireNative(this, 'isContinuous');
      nativeSet(this, 'isContinuous', toBoolean(value));
    }
    // 按住不放时连续加减
    get autorepeat() { requireNative(this, 'autorepeat'); return nativeGet(this, 'autorepeat'); }
    set autorepeat(value) {
      requireNative(this, 'autorepeat');
      nativeSet(this, 'autorepeat', toBoolean(value));
    }
    // 加到头再点回到最小值（反过来也是）
    get wraps() { requireNative(this, 'wraps'); return nativeGet(this, 'wraps'); }
    set wraps(value) { requireNative(this, 'wraps'); nativeSet(this, 'wraps', toBoolean(value)); }
  });

  // 构造时给的那一组分段：字符串或者 UIImage，可以混着给
  function segmentItems(items) {
    if (items == null) return [];
    if (typeof items !== 'object' || typeof items[Symbol.iterator] !== 'function') {
      throw new TypeError('new UISegmentedControl needs an array of strings and UIImages, got ' +
                          describeValue(items));
    }
    return Array.from(items, (item, i) => {
      if (item instanceof UIImage) return item;
      const kind = typeof item;
      if (kind === 'string' || kind === 'number' || kind === 'boolean') return String(item);
      throw new TypeError('new UISegmentedControl: items[' + i +
                          '] must be a string or a UIImage, got ' + describeValue(item));
    });
  }

  // 分段选择：横着排开的几段，一次选中一段。
  // 每段的图记在 segmentImages 这条所有权边上。段被删掉或者换成文字之后
  // 那张图会多留一阵（到 removeAllSegments 或者控件自己被回收），不会给错答案
  defineNativeClass('UISegmentedControl', class UISegmentedControl extends UIControl {
    constructor(items) {
      super();
      const list = segmentItems(items);
      constructNative(this, new.target, 'UISegmentedControl', list);
      for (const item of list) {
        if (typeof item !== 'string') ownOne(this, 'segmentImages', item);
      }
    }

    get numberOfSegments() {
      requireNative(this, 'numberOfSegments');
      return nativeGet(this, 'numberOfSegments');
    }
    // 选中的是第几段。-1 是一段都没选中
    get selectedSegmentIndex() {
      requireNative(this, 'selectedSegmentIndex');
      return nativeGet(this, 'selectedSegmentIndex');
    }
    set selectedSegmentIndex(value) {
      requireNative(this, 'selectedSegmentIndex');
      nativeSet(this, 'selectedSegmentIndex', toInteger(value, 'selectedSegmentIndex'));
    }
    // true：点完不保持选中，当一排按钮用
    get isMomentary() { requireNative(this, 'isMomentary'); return nativeGet(this, 'isMomentary'); }
    set isMomentary(value) {
      requireNative(this, 'isMomentary');
      nativeSet(this, 'isMomentary', toBoolean(value));
    }
    // true：每段的宽按内容分；false：各段等宽
    get apportionsSegmentWidthsByContent() {
      requireNative(this, 'apportionsSegmentWidthsByContent');
      return nativeGet(this, 'apportionsSegmentWidthsByContent');
    }
    set apportionsSegmentWidthsByContent(value) {
      requireNative(this, 'apportionsSegmentWidthsByContent');
      nativeSet(this, 'apportionsSegmentWidthsByContent', toBoolean(value));
    }
    get selectedSegmentTintColor() {
      requireNative(this, 'selectedSegmentTintColor');
      return colorString(nativeGetOwned(this, 'selectedSegmentTintColor'));
    }
    set selectedSegmentTintColor(value) {
      requireNative(this, 'selectedSegmentTintColor');
      const color = colorArg(value, 'selectedSegmentTintColor');
      if (color === undefined) return;
      nativeSetOwned(this, 'selectedSegmentTintColor', color);
    }

    // ---- 插入和删除 ----
    insertSegmentWithTitle(title, options) {
      const what = 'insertSegmentWithTitle';
      const index = toInteger(requiredOption(options, 'atIndex', what), 'atIndex');
      nativeCall(this, 'insertSegmentWithTitle:atIndex:animated:',
                 [toTextOrNull(title), index, animatedOption(options)]);
    }
    insertSegmentWithImage(image, options) {
      const what = 'insertSegmentWithImage';
      const index = toInteger(requiredOption(options, 'atIndex', what), 'atIndex');
      nativeCall(this, 'insertSegmentWithImage:atIndex:animated:',
                 [image, index, animatedOption(options)]);
      ownOne(this, 'segmentImages', image);
    }
    removeSegmentAtIndex(index, options) {
      nativeCall(this, 'removeSegmentAtIndex:animated:',
                 [toInteger(index, 'removeSegmentAtIndex'), animatedOption(options)]);
    }
    removeAllSegments() {
      nativeCall(this, 'removeAllSegments', []);
      ownAll(this, 'segmentImages', []);
    }

    // ---- 每一段的内容。一段要么是标题要么是图，设了一样另一样就没了 ----
    setTitle(title, options) {
      const index = toInteger(requiredOption(options, 'forSegmentAtIndex', 'setTitle'),
                              'forSegmentAtIndex');
      nativeCall(this, 'setTitle:forSegmentAtIndex:', [toTextOrNull(title), index]);
    }
    titleForSegmentAtIndex(index) {
      return nativeCall(this, 'titleForSegmentAtIndex:',
                        [toInteger(index, 'titleForSegmentAtIndex')]);
    }
    setImage(image, options) {
      const index = toInteger(requiredOption(options, 'forSegmentAtIndex', 'setImage'),
                              'forSegmentAtIndex');
      nativeCall(this, 'setImage:forSegmentAtIndex:', [image, index]);
      ownOne(this, 'segmentImages', image);
    }
    imageForSegmentAtIndex(index) {
      const image = nativeCallObject(this, 'imageForSegmentAtIndex:',
                                     [toInteger(index, 'imageForSegmentAtIndex')]);
      ownOne(this, 'segmentImages', image);
      return image;
    }
    // 宽 0 是「自动」
    setWidth(width, options) {
      const index = toInteger(requiredOption(options, 'forSegmentAtIndex', 'setWidth'),
                              'forSegmentAtIndex');
      nativeCall(this, 'setWidth:forSegmentAtIndex:', [toNumber(width, 'setWidth'), index]);
    }
    widthForSegmentAtIndex(index) {
      return nativeCall(this, 'widthForSegmentAtIndex:',
                        [toInteger(index, 'widthForSegmentAtIndex')]);
    }
    // 把这一段里的标题或图挪一点。是个 size：width 往右，height 往下
    setContentOffset(offset, options) {
      const index = toInteger(requiredOption(options, 'forSegmentAtIndex', 'setContentOffset'),
                              'forSegmentAtIndex');
      nativeCall(this, 'setContentOffset:forSegmentAtIndex:',
                 [structArg(offset, SIZE_FIELDS, 'setContentOffset'), index]);
    }
    contentOffsetForSegmentAtIndex(index) {
      return toSize(nativeCall(this, 'contentOffsetForSegmentAtIndex:',
                               [toInteger(index, 'contentOffsetForSegmentAtIndex')]));
    }
    setEnabled(enabled, options) {
      const index = toInteger(requiredOption(options, 'forSegmentAtIndex', 'setEnabled'),
                              'forSegmentAtIndex');
      nativeCall(this, 'setEnabled:forSegmentAtIndex:', [toBoolean(enabled), index]);
    }
    isEnabledForSegmentAtIndex(index) {
      return nativeCall(this, 'isEnabledForSegmentAtIndex:',
                        [toInteger(index, 'isEnabledForSegmentAtIndex')]);
    }
  });

  // 页码：一排小圆点，表示「一共几页、现在第几页」
  defineNativeClass('UIPageControl', class UIPageControl extends UIControl {
    constructor() {
      super();
      constructNative(this, new.target, 'UIPageControl', []);
    }

    get numberOfPages() { requireNative(this, 'numberOfPages'); return nativeGet(this, 'numberOfPages'); }
    set numberOfPages(value) {
      requireNative(this, 'numberOfPages');
      nativeSet(this, 'numberOfPages', toInteger(value, 'numberOfPages'));
    }
    // 从 0 数。超出范围的值被钉到 0 和最后一页之间
    get currentPage() { requireNative(this, 'currentPage'); return nativeGet(this, 'currentPage'); }
    set currentPage(value) {
      requireNative(this, 'currentPage');
      nativeSet(this, 'currentPage', toInteger(value, 'currentPage'));
    }
    get hidesForSinglePage() {
      requireNative(this, 'hidesForSinglePage');
      return nativeGet(this, 'hidesForSinglePage');
    }
    set hidesForSinglePage(value) {
      requireNative(this, 'hidesForSinglePage');
      nativeSet(this, 'hidesForSinglePage', toBoolean(value));
    }
    // 能不能按住这排点左右拖着翻页
    get allowsContinuousInteraction() {
      requireNative(this, 'allowsContinuousInteraction');
      return nativeGet(this, 'allowsContinuousInteraction');
    }
    set allowsContinuousInteraction(value) {
      requireNative(this, 'allowsContinuousInteraction');
      nativeSet(this, 'allowsContinuousInteraction', toBoolean(value));
    }
    get backgroundStyle() { requireNative(this, 'backgroundStyle'); return nativeGet(this, 'backgroundStyle'); }
    set backgroundStyle(value) {
      requireNative(this, 'backgroundStyle');
      nativeSet(this, 'backgroundStyle', value);
    }
    get direction() { requireNative(this, 'direction'); return nativeGet(this, 'direction'); }
    set direction(value) { requireNative(this, 'direction'); nativeSet(this, 'direction', value); }
    // 最近一次换页是怎么换的：点了一下（discrete）还是拖过去的（continuous）
    get interactionState() {
      requireNative(this, 'interactionState');
      return nativeGet(this, 'interactionState');
    }

    get pageIndicatorTintColor() {
      requireNative(this, 'pageIndicatorTintColor');
      return colorString(nativeGetOwned(this, 'pageIndicatorTintColor'));
    }
    set pageIndicatorTintColor(value) {
      requireNative(this, 'pageIndicatorTintColor');
      const color = colorArg(value, 'pageIndicatorTintColor');
      if (color === undefined) return;
      nativeSetOwned(this, 'pageIndicatorTintColor', color);
    }
    get currentPageIndicatorTintColor() {
      requireNative(this, 'currentPageIndicatorTintColor');
      return colorString(nativeGetOwned(this, 'currentPageIndicatorTintColor'));
    }
    set currentPageIndicatorTintColor(value) {
      requireNative(this, 'currentPageIndicatorTintColor');
      const color = colorArg(value, 'currentPageIndicatorTintColor');
      if (color === undefined) return;
      nativeSetOwned(this, 'currentPageIndicatorTintColor', color);
    }

    // ---- 把圆点换成图 ----
    get preferredIndicatorImage() {
      requireNative(this, 'preferredIndicatorImage');
      return nativeGetOwned(this, 'preferredIndicatorImage');
    }
    set preferredIndicatorImage(value) {
      requireNative(this, 'preferredIndicatorImage');
      nativeSetOwned(this, 'preferredIndicatorImage', value);
    }
    get preferredCurrentPageIndicatorImage() {
      requireNative(this, 'preferredCurrentPageIndicatorImage');
      return nativeGetOwned(this, 'preferredCurrentPageIndicatorImage');
    }
    set preferredCurrentPageIndicatorImage(value) {
      requireNative(this, 'preferredCurrentPageIndicatorImage');
      nativeSetOwned(this, 'preferredCurrentPageIndicatorImage', value);
    }
    // 单独给某一页换
    setIndicatorImage(image, options) {
      const page = toInteger(requiredOption(options, 'forPage', 'setIndicatorImage'), 'forPage');
      nativeCall(this, 'setIndicatorImage:forPage:', [image, page]);
      own(this, 'indicatorImage:' + page, image);
    }
    indicatorImageForPage(page) {
      const index = toInteger(page, 'indicatorImageForPage');
      return own(this, 'indicatorImage:' + index,
                 nativeCallObject(this, 'indicatorImageForPage:', [index]));
    }
    setCurrentPageIndicatorImage(image, options) {
      const page = toInteger(requiredOption(options, 'forPage', 'setCurrentPageIndicatorImage'),
                             'forPage');
      nativeCall(this, 'setCurrentPageIndicatorImage:forPage:', [image, page]);
      own(this, 'currentPageIndicatorImage:' + page, image);
    }
    currentPageIndicatorImageForPage(page) {
      const index = toInteger(page, 'currentPageIndicatorImageForPage');
      return own(this, 'currentPageIndicatorImage:' + index,
                 nativeCallObject(this, 'currentPageIndicatorImageForPage:', [index]));
    }

    // 放得下这么多页至少要多大
    sizeForNumberOfPages(pageCount) {
      return toSize(nativeCall(this, 'sizeForNumberOfPages:',
                               [toInteger(pageCount, 'sizeForNumberOfPages')]));
    }
  });

  // 日期选择器。日期在 JS 这一侧是 Date
  defineNativeClass('UIDatePicker', class UIDatePicker extends UIControl {
    constructor() {
      super();
      constructNative(this, new.target, 'UIDatePicker', []);
    }

    // 每次读都是一个新的 Date 对象（Date 是可变的，共用一个会互相改）
    get date() { requireNative(this, 'date'); return toDate(nativeGet(this, 'date')); }
    set date(value) { requireNative(this, 'date'); nativeSet(this, 'date', dateArg(value, 'date')); }
    setDate(date, options) {
      nativeCall(this, 'setDate:animated:', [dateArg(date, 'setDate'), animatedOption(options)]);
    }
    // 能选的范围。null 是不限
    get minimumDate() { requireNative(this, 'minimumDate'); return toDate(nativeGet(this, 'minimumDate')); }
    set minimumDate(value) {
      requireNative(this, 'minimumDate');
      nativeSet(this, 'minimumDate', dateOrNullArg(value, 'minimumDate'));
    }
    get maximumDate() { requireNative(this, 'maximumDate'); return toDate(nativeGet(this, 'maximumDate')); }
    set maximumDate(value) {
      requireNative(this, 'maximumDate');
      nativeSet(this, 'maximumDate', dateOrNullArg(value, 'maximumDate'));
    }

    // 选什么：时间、日期、两样都选、倒计时的时长、年月
    get datePickerMode() { requireNative(this, 'datePickerMode'); return nativeGet(this, 'datePickerMode'); }
    set datePickerMode(value) {
      requireNative(this, 'datePickerMode');
      nativeSet(this, 'datePickerMode', value);
    }
    // 想要的样式；实际用的是哪种读 datePickerStyle
    get preferredDatePickerStyle() {
      requireNative(this, 'preferredDatePickerStyle');
      return nativeGet(this, 'preferredDatePickerStyle');
    }
    set preferredDatePickerStyle(value) {
      requireNative(this, 'preferredDatePickerStyle');
      nativeSet(this, 'preferredDatePickerStyle', value);
    }
    get datePickerStyle() {
      requireNative(this, 'datePickerStyle');
      return nativeGet(this, 'datePickerStyle');
    }

    // 倒计时模式下选中的时长，**秒**
    get countDownDuration() {
      requireNative(this, 'countDownDuration');
      return nativeGet(this, 'countDownDuration');
    }
    set countDownDuration(value) {
      requireNative(this, 'countDownDuration');
      nativeSet(this, 'countDownDuration', toNumber(value, 'countDownDuration'));
    }
    // 分钟那一栏隔几分钟一档
    get minuteInterval() { requireNative(this, 'minuteInterval'); return nativeGet(this, 'minuteInterval'); }
    set minuteInterval(value) {
      requireNative(this, 'minuteInterval');
      nativeSet(this, 'minuteInterval', toInteger(value, 'minuteInterval'));
    }
    get roundsToMinuteInterval() {
      requireNative(this, 'roundsToMinuteInterval');
      return nativeGet(this, 'roundsToMinuteInterval');
    }
    set roundsToMinuteInterval(value) {
      requireNative(this, 'roundsToMinuteInterval');
      nativeSet(this, 'roundsToMinuteInterval', toBoolean(value));
    }
  });
})
