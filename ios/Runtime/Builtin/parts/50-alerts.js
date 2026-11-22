// 系统弹窗和分享面板
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const {
    constructNative,
    defineField,
    defineNativeClass,
    describeValue,
    finalCheck,
    has,
    kSubscribe,
    nativeCall,
    nativeClassCall,
    nativeClassNames,
    nativeGet,
    nativeGetObjectArray,
    nativeGetOwned,
    nativeSet,
    nativeSetOwned,
    ownAll,
    ownOne,
    requireNative,
    subscribeNative,
    toBoolean,
    toText,
    toTextOrNull,
  } = ctx;

  // ---- 系统弹窗 ----
  //
  // UIAlertController 是一个页面（UIViewController 的子类），用页面的
  // presentViewController() 弹出来。两种样式：'alert' 是屏幕中间的提示框，
  // 'actionSheet' 是从底部升起来的菜单。弹窗上的每个按钮是一个 UIAlertAction。
  //
  // ObjC 那边按钮被点了是调创建时给的 handler（一个 block）。这里没有回调
  // 参数：按钮是一个事件目标，被点了派发 click。理由见
  // docs/internals/alerts.md
  //
  // 两个类都**没有 new**：ObjC 给的入口就是类方法。UIAlertAction 的标题和
  // 样式只能在创建时给；UIAlertController 的样式也是
  //
  // 弹窗上**不能监听页面的那三个关闭事件**（beforedismiss / dismiss /
  // dismissattempt）：它们靠呈现委托，而系统不许动提示框的呈现委托。
  // 原生那边把弹窗上的订阅全部认领了，这三个名字会抛。运行时自己给每个
  // 被呈现的页面订的 @dismissed 也在那边接住；弹窗被系统关掉时，由按钮的
  // handler 替它补发，「呈现者持有它」那条边照样放得开
  function noPublicInit(newTarget, hint) {
    finalCheck(newTarget);   // 是子类化就先报子类化
    throw new TypeError(
      'Illegal constructor: ' + (nativeClassNames.get(newTarget) || 'this class') +
      ' has no public initializer; use ' + hint);
  }

  defineNativeClass('UIAlertAction', class UIAlertAction extends NSObject {
    constructor() {
      noPublicInit(new.target, 'UIAlertAction.actionWithTitle(title, { style })');
    }

    // handler: 那一段没有了，换成按钮上的事件。
    // 标题转成字符串，null 给空串：系统不收没有标题的按钮
    static actionWithTitle(title, options) {
      const o = options === undefined || options === null ? {} : options;
      return nativeClassCall('UIAlertAction', 'actionWithTitle:style:handler:',
                             [toText(title), o.style]);
    }

    [kSubscribe](type, on) { subscribeNative(this, type, on); }

    get title() { requireNative(this, 'title'); return nativeGet(this, 'title'); }
    get style() { requireNative(this, 'style'); return nativeGet(this, 'style'); }
    // false 时按钮是灰的、点不动。弹窗已经在屏幕上时改它也生效
    get isEnabled() { requireNative(this, 'isEnabled'); return nativeGet(this, 'isEnabled'); }
    set isEnabled(value) { requireNative(this, 'isEnabled'); nativeSet(this, 'isEnabled', toBoolean(value)); }
  });

  defineNativeClass('UIAlertController', class UIAlertController extends UIViewController {
    constructor() {
      noPublicInit(new.target,
        'UIAlertController.alertControllerWithTitle(title, { message, preferredStyle })');
    }

    static alertControllerWithTitle(title, options) {
      const o = options === undefined || options === null ? {} : options;
      return nativeClassCall(
        'UIAlertController', 'alertControllerWithTitle:message:preferredStyle:',
        [toTextOrNull(title), has(o, 'message') ? toTextOrNull(o.message) : null, o.preferredStyle]);
    }

    // title 继承自 UIViewController，弹窗上显示的就是它
    get message() { requireNative(this, 'message'); return nativeGet(this, 'message'); }
    set message(value) { requireNative(this, 'message'); nativeSet(this, 'message', toTextOrNull(value)); }
    get preferredStyle() {
      requireNative(this, 'preferredStyle');
      return nativeGet(this, 'preferredStyle');
    }
    get severity() { requireNative(this, 'severity'); return nativeGet(this, 'severity'); }
    set severity(value) { requireNative(this, 'severity'); nativeSet(this, 'severity', value); }

    // 持有边：弹窗拿着它的按钮。按钮是 JS 建好交进来的，丢了引用之后包装
    // 还要活着——监听器挂在包装上
    get actions() {
      return ownAll(this, 'actions', nativeGetObjectArray(this, 'actions'));
    }
    addAction(action) {
      nativeCall(this, 'addAction:', [action]);
      ownOne(this, 'actions', action);
    }
    // 提示框里加粗的那个按钮，接了键盘时按回车触发的也是它。
    // 必须是已经加进来的按钮
    get preferredAction() { return nativeGetOwned(this, 'preferredAction'); }
    set preferredAction(value) { nativeSetOwned(this, 'preferredAction', value); }

    // 输入框。ObjC 那边是 addTextFieldWithConfigurationHandler:，配置用的
    // block 会收到新建的输入框；这里把那个输入框直接当返回值
    get textFields() {
      return ownAll(this, 'textFields', nativeGetObjectArray(this, 'textFields'));
    }
    addTextField() {
      nativeCall(this, 'addTextFieldWithConfigurationHandler:', []);
      const fields = this.textFields;
      return fields[fields.length - 1];
    }
  });

  // ---- 系统分享面板 ----
  //
  // 也是一个页面，同样用 presentViewController() 弹出来。要分享的东西在
  // 构造时给，之后不能换；一个面板分享一次。

  // 要分享的东西 → 过桥的参数。图片是原生对象，原样传；文字和网址包成
  // { text } / { url }，原生那边才分得出哪个字符串是网址
  function activityItemArgs(items) {
    if (items === null || typeof items !== 'object' ||
        typeof items[Symbol.iterator] !== 'function') {
      throw new TypeError(
        'new UIActivityViewController: activityItems must be an array of strings, ' +
        'URLs and UIImages, got ' + describeValue(items));
    }
    return Array.from(items, (item, i) => {
      if (item instanceof UIImage) return item;
      if (item instanceof URL) return { url: item.href };
      const kind = typeof item;
      if (kind === 'string' || kind === 'number' || kind === 'boolean' || kind === 'bigint') {
        return { text: String(item) };
      }
      throw new TypeError('activityItems[' + i + '] must be a string, a URL or a UIImage, got ' +
                          describeValue(item));
    });
  }

  // 一组名字（枚举的数组）。名字认不认识由原生说，这里只管「是不是数组」
  function nameList(value, what) {
    if (value === null || typeof value !== 'object' ||
        typeof value[Symbol.iterator] !== 'function') {
      throw new TypeError(what + ' must be an array of names, got ' + describeValue(value));
    }
    return Array.from(value);
  }

  // complete 事件带的数据。原生那边把完成回调的结果记在面板上、发一个不带
  // 数据的事件；这个监听器在构造时就挂上，所以排在所有别的监听器前面，
  // 把结果取出来挂到事件对象上。
  //
  // 绕这一下是因为核心的事件汇入口只认它知道的那几种负载形状，新的形状会
  // 被丢掉，而那个文件不归这个域改。结果取一次就清，所以自己 dispatchEvent
  // 一个 complete 时这里什么都不挂
  function attachCompletion(event) {
    const result = nativeCall(this, 'nacre:takeCompletion', []);
    if (result === null) return;
    defineField(event, 'activityType', result.activityType);
    defineField(event, 'completed', result.completed);
    let failure = null;
    if (result.activityError !== null) {
      failure = ctx.makeError('NSError', result.activityError.message, result.activityError);
    }
    defineField(event, 'activityError', failure);
  }

  defineNativeClass('UIActivityViewController',
                    class UIActivityViewController extends UIViewController {
    // ＝ initWithActivityItems:applicationActivities:
    constructor(activityItems, options) {
      super();
      const o = options === undefined || options === null ? {} : options;
      if (o.applicationActivities !== undefined && o.applicationActivities !== null) {
        throw new TypeError(
          'new UIActivityViewController: applicationActivities is not supported yet');
      }
      constructNative(this, new.target, 'UIActivityViewController',
                      activityItemArgs(activityItems));
      this.addEventListener('complete', attachCompletion);
    }

    // 不想出现在面板里的系统动作。null 是一个都不排除
    get excludedActivityTypes() {
      requireNative(this, 'excludedActivityTypes');
      return nativeGet(this, 'excludedActivityTypes');
    }
    set excludedActivityTypes(value) {
      requireNative(this, 'excludedActivityTypes');
      nativeSet(this, 'excludedActivityTypes',
                value === null || value === undefined
                  ? null : nameList(value, 'excludedActivityTypes'));
    }
    // 整块隐藏的分区
    get excludedActivitySectionTypes() {
      requireNative(this, 'excludedActivitySectionTypes');
      return nativeGet(this, 'excludedActivitySectionTypes');
    }
    set excludedActivitySectionTypes(value) {
      requireNative(this, 'excludedActivitySectionTypes');
      nativeSet(this, 'excludedActivitySectionTypes',
                nameList(value, 'excludedActivitySectionTypes'));
    }
    // 系统可以把某一个动作放大显示在面板顶部。false 是不许
    get allowsProminentActivity() {
      requireNative(this, 'allowsProminentActivity');
      return nativeGet(this, 'allowsProminentActivity');
    }
    set allowsProminentActivity(value) {
      requireNative(this, 'allowsProminentActivity');
      nativeSet(this, 'allowsProminentActivity', toBoolean(value));
    }
  });
})
