// 通讯录选择器的 JS 那一半。
//
// 这是**能力包自己的 part**：它不在核心里，跟着 NacreContacts.framework 走
// （Builtin/parts/）。写法和核心的 part 一样——整个文件是一个函数表达式，
// 运行时在核心的 part 全部跑完之后，用同一个 ctx 调它一次。
(function (ctx) {
  'use strict';

  const {
    Event,
    constructNative,
    defineNativeClass,
    describeValue,
    finalCheck,
    internalEventHandlers,
    kSubscribe,
    nativeCall,
    nativeCallObjectArray,
    nativeClassCallValue,
    nativeClassNames,
    nativeGet,
    nativeGetObjectArray,
    nativeGetOwned,
    nativeSet,
    ownAll,
    requireNative,
    toText,
  } = ctx;

  // ---- 只读的值：联系人和它里面的东西 ----
  //
  // CNContact、CNLabeledValue、CNPhoneNumber、CNContactProperty 都不能 new：
  // 它们只能由选择器交回来。新建和修改联系人不在这个包里（那要读写整个
  // 通讯录，也就要权限）
  function valueOnly(newTarget) {
    finalCheck(newTarget);   // 是子类化就先报子类化
    throw new TypeError(
      'Illegal constructor: ' + (nativeClassNames.get(newTarget) || 'this class') +
      ' is a read-only value handed over by CNContactPickerViewController, not created by new');
  }

  // 读联系人的一个字段之前先问它带没带。系统交回来的联系人不一定带着所有
  // 字段，读一个没取到的，系统那边是抛异常；这里报成说得清的 TypeError
  function contactKey(contact, key) {
    requireNative(contact, key);
    if (!nativeCall(contact, 'isKeyAvailable:', [key])) {
      throw new TypeError(
        'CNContact.' + key + ' is not available on this contact; ' +
        'check contact.isKeyAvailable("' + key + '") first');
    }
  }

  defineNativeClass('CNPhoneNumber', class CNPhoneNumber extends NSObject {
    constructor() { valueOnly(new.target); }

    // 用户在通讯录里填的原文，没有规整过：可能带空格、括号、国家码
    get stringValue() { requireNative(this, 'stringValue'); return nativeGet(this, 'stringValue'); }
  });

  // 带标签的值：一个联系人可以有几个电话、几个邮箱，每个带一个标签
  // （手机、住宅、工作…）
  defineNativeClass('CNLabeledValue', class CNLabeledValue extends NSObject {
    constructor() { valueOnly(new.target); }

    // 标签 → 当前语言下给人看的写法。系统自带的标签存的是一个记号
    // （手机是 _$!<Mobile>!$_），用户自己起的标签原样还回来
    static localizedStringForLabel(label) {
      return nativeClassCallValue('CNLabeledValue', 'localizedStringForLabel:', [toText(label)]);
    }

    get identifier() { requireNative(this, 'identifier'); return nativeGet(this, 'identifier'); }
    // 标签的原文。没有标签是 null
    get label() { requireNative(this, 'label'); return nativeGet(this, 'label'); }
    // 邮箱是字符串，电话是 CNPhoneNumber。字符串走标量那条通道，对象走对象
    // 那条；持有边记在这一项上，两次读是同一个对象
    get value() {
      requireNative(this, 'value');
      const text = nativeGet(this, 'value');
      return text !== null ? text : nativeGetOwned(this, 'value');
    }
  });

  defineNativeClass('CNContact', class CNContact extends NSObject {
    constructor() { valueOnly(new.target); }

    // 这个联系人在这台设备上的标识
    get identifier() { requireNative(this, 'identifier'); return nativeGet(this, 'identifier'); }
    // 名、姓、组织。没填的是空串
    get givenName() { contactKey(this, 'givenName'); return nativeGet(this, 'givenName'); }
    get familyName() { contactKey(this, 'familyName'); return nativeGet(this, 'familyName'); }
    get organizationName() {
      contactKey(this, 'organizationName');
      return nativeGet(this, 'organizationName');
    }
    // 电话和邮箱。持有边：联系人拿着它的每一项，两次读是同一批对象
    get phoneNumbers() {
      contactKey(this, 'phoneNumbers');
      return ownAll(this, 'phoneNumbers', nativeGetObjectArray(this, 'phoneNumbers'));
    }
    get emailAddresses() {
      contactKey(this, 'emailAddresses');
      return ownAll(this, 'emailAddresses', nativeGetObjectArray(this, 'emailAddresses'));
    }

    // 这个联系人带没带某个字段。字段名认不认识由原生说，不认识的抛
    isKeyAvailable(key) {
      return nativeCall(this, 'isKeyAvailable:', [key]);
    }
  });

  // 用户在联系人详情里选中的那一项：哪个联系人的哪个字段的哪个值
  defineNativeClass('CNContactProperty', class CNContactProperty extends NSObject {
    constructor() { valueOnly(new.target); }

    get contact() { return nativeGetOwned(this, 'contact'); }
    // 字段名：'phoneNumbers'、'emailAddresses'…
    get key() { requireNative(this, 'key'); return nativeGet(this, 'key'); }
    // 字符串的值（邮箱、网址）是字符串，电话是 CNPhoneNumber；别的类型
    // （地址、日期）还没有暴露，是 null
    get value() {
      requireNative(this, 'value');
      const text = nativeGet(this, 'value');
      return text !== null ? text : nativeGetOwned(this, 'value');
    }
    // 选中的是带标签的值里的一项时，是那一项的标识和标签；否则是 null
    get identifier() { requireNative(this, 'identifier'); return nativeGet(this, 'identifier'); }
    get label() { requireNative(this, 'label'); return nativeGet(this, 'label'); }
  });

  // ---- 姓名拼成一行 ----
  //
  // 名和姓谁在前、中间有没有空格，由系统按姓名的文字和用户的设置定。
  // ObjC 那边这个类可以建实例；这里只开了类方法，够用，也少一个要管的对象
  defineNativeClass('CNContactFormatter', class CNContactFormatter extends NSObject {
    constructor() {
      finalCheck(new.target);
      throw new TypeError(
        'Illegal constructor: CNContactFormatter has no instances here; ' +
        'use CNContactFormatter.stringFromContact(contact, { style })');
    }

    // ＝ +stringFromContact:style:。style 必填；联系人没有可拼的名字时是 null
    static stringFromContact(contact, options) {
      const o = options === undefined || options === null ? {} : options;
      return nativeClassCallValue('CNContactFormatter', 'stringFromContact:style:',
                                  [contact, o.style]);
    }
  });

  // ---- 选择器 ----
  //
  // 系统的选联系人界面。它是一个页面，用页面的 presentViewController() 弹
  // 出来；用户选中了或者取消了，系统自己把它关掉。
  //
  // ObjC 那边结果是调委托的方法，而且**委托实现了哪几个方法决定选择器的
  // 模式**。这里没有委托：结果是选择器上的事件，监听了哪个事件就是哪种模式
  //   contactselect          单选，点一个联系人就交回来
  //   contactsselect         多选，点「完成」一起交回来
  //   contactpropertyselect  点联系人进详情，再点详情里的一项
  //   cancel                 用户没选就关掉了

  // 和原生那边的四个名字是同一张表（NacreContacts.mm），两处要一起改
  const PICKER_EVENTS = ['cancel', 'contactselect', 'contactsselect',
                         'contactpropertyselect'];

  // 一组字段名。名字认不认识由原生说，这里只管「是不是数组」
  function keyList(value) {
    if (value === null || typeof value !== 'object' ||
        typeof value[Symbol.iterator] !== 'function') {
      throw new TypeError(
        'displayedPropertyKeys must be an array of contact key names or null, got ' +
        describeValue(value));
    }
    return Array.from(value);
  }

  defineNativeClass('CNContactPickerViewController',
                    class CNContactPickerViewController extends UIViewController {
    constructor() {
      super();
      constructNative(this, new.target, 'CNContactPickerViewController', []);
    }

    // 这四个事件归这个包；别的名字交给页面（模态的、出现和消失的、外观
    // 变化）。哪边都不认识的名字不拒绝，当自定义事件
    [kSubscribe](type, on) {
      super[kSubscribe](type, on);
    }

    // 联系人详情里显示哪些字段。null 是全部显示
    get displayedPropertyKeys() {
      requireNative(this, 'displayedPropertyKeys');
      return nativeGet(this, 'displayedPropertyKeys');
    }
    set displayedPropertyKeys(value) {
      requireNative(this, 'displayedPropertyKeys');
      nativeSet(this, 'displayedPropertyKeys',
                value === null || value === undefined ? null : keyList(value));
    }
  });

  // 选中的东西是原生对象，原生那边用运行时内部的事件（@ 开头）带过来；
  // 在这里建事件对象，再派发给监听器。三种选中各是一个事件类
  const eventClasses = {
    contact: ctx.defineEventClass('CNContactPickerContactEvent', Event, { contact: ['CNContact?', null] }),
    contacts: ctx.defineEventClass('CNContactPickerContactsEvent', Event, { contacts: ['array', () => []] }),
    contactProperty: ctx.defineEventClass('CNContactPickerContactPropertyEvent', Event,
                                          { contactProperty: ['CNContactProperty?', null] }),
  };
  function dispatch(picker, type, field, value) {
    picker.dispatchEvent(new eventClasses[field](type, { [field]: value }));
  }
  internalEventHandlers.set('@contactpicker:contact', (picker, contact) => {
    dispatch(picker, 'contactselect', 'contact', contact);
  });
  internalEventHandlers.set('@contactpicker:property', (picker, property) => {
    dispatch(picker, 'contactpropertyselect', 'contactProperty', property);
  });
  // 多选：事件出口一次只能带一个对象，所以原生那边先把那一组联系人记着，
  // 这里再取走
  internalEventHandlers.set('@contactpicker:contacts', (picker) => {
    dispatch(picker, 'contactsselect', 'contacts',
             nativeCallObjectArray(picker, 'nacre:takeSelectedContacts', []));
  });
})
