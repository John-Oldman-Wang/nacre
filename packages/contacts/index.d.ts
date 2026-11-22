// @nacrejs/contacts 的类型定义。
//
// 通讯录选择器：让用户从通讯录里选联系人。选择器是系统的界面，在系统自己的
// 进程里运行，App 只拿得到用户选中的那一个（或几个）联系人，**不需要通讯录
// 权限**，Info.plist 里不用写任何东西。
//
// 这些类跟着这个包走：**没装这个包，就没有这些类型**，也没有这些类。
// 用的时候在入口文件顶上加一行：
//
//     /// <reference types="@nacrejs/contacts" />
//
// 这里用到的 NSObject、UIViewController、Event 是 @nacrejs/types 声明的全局
// 类型。这个文件不自己去引它（理由见 packages/keychain/index.d.ts），两个包
// 的关系写在 peerDependencies 里。

/**
 * 联系人的字段名，对应 `CNContact.h` 里的 `CNContact…Key` 常量。
 *
 * 用在两处：`displayedPropertyKeys`（联系人详情里显示哪些字段）和
 * `isKeyAvailable()`。这里列的比 `CNContact` 上已经能读的成员多：没做成成员
 * 的字段照样可以让详情页显示。
 */
type CNContactKey =
  | 'identifier'
  | 'namePrefix' | 'givenName' | 'middleName' | 'familyName' | 'previousFamilyName'
  | 'nameSuffix' | 'nickname'
  | 'organizationName' | 'departmentName' | 'jobTitle'
  | 'phoneticGivenName' | 'phoneticMiddleName' | 'phoneticFamilyName'
  | 'phoneticOrganizationName'
  | 'birthday' | 'nonGregorianBirthday' | 'note'
  | 'imageData' | 'thumbnailImageData' | 'imageDataAvailable' | 'contactType'
  | 'phoneNumbers' | 'emailAddresses' | 'postalAddresses' | 'dates' | 'urlAddresses'
  | 'contactRelations' | 'socialProfiles' | 'instantMessageAddresses';

/**
 * 姓名拼成一行时用哪一组字段。
 *
 * - `fullName`：姓名
 * - `phoneticFullName`：姓名的注音（日文的读音、中文的拼音那几栏）
 */
type CNContactFormatterStyle = 'fullName' | 'phoneticFullName';

/**
 * 一个电话号码。只读的值，不能 `new`。
 *
 * `stringValue` 是用户在通讯录里填的原文，没有规整过：可能带空格、括号、
 * 国家码。
 */
declare class CNPhoneNumber extends NSObject {
  private constructor();
  readonly stringValue: string;
}

/**
 * 带标签的值。一个联系人可以有几个电话、几个邮箱，每个带一个标签（手机、
 * 住宅、工作…）。只读的值，不能 `new`。
 *
 * ```js
 * for (const item of contact.phoneNumbers) {
 *   const label = item.label === null ? '' : CNLabeledValue.localizedStringForLabel(item.label);
 *   console.log(label, item.value.stringValue);
 * }
 * ```
 */
declare class CNLabeledValue<T = string | CNPhoneNumber> extends NSObject {
  private constructor();
  /**
   * 把标签换成当前语言下给人看的写法。系统自带的标签存的是一个记号（手机是
   * `'_$!<Mobile>!$_'`），用户自己起的标签原样还回来。
   */
  static localizedStringForLabel(label: string): string;

  /** 这一项在这台设备上的标识。 */
  readonly identifier: string;
  /** 标签的原文，显示之前用 `localizedStringForLabel()` 换一下。没有标签是 `null`。 */
  readonly label: string | null;
  /** 电话是 `CNPhoneNumber`，邮箱是字符串。 */
  readonly value: T;
}

/**
 * 一个联系人。只读的值，不能 `new`，只能由选择器交回来。
 *
 * 姓名要显示成一行时用 `CNContactFormatter.stringFromContact()`，不要自己拼：
 * 名和姓谁在前因语言而异。
 */
declare class CNContact extends NSObject {
  private constructor();
  /** 这个联系人在这台设备上的标识。 */
  readonly identifier: string;
  /** 名。没填是空串。 */
  readonly givenName: string;
  /** 姓。没填是空串。 */
  readonly familyName: string;
  /** 公司或组织。没填是空串。 */
  readonly organizationName: string;
  /** 电话，按通讯录里的顺序。没有是空数组。 */
  readonly phoneNumbers: CNLabeledValue<CNPhoneNumber>[];
  /** 邮箱，按通讯录里的顺序。没有是空数组。 */
  readonly emailAddresses: CNLabeledValue<string>[];

  /**
   * 这个联系人带没带某个字段。读一个没带的字段会抛 `TypeError`。
   *
   * @throws {TypeError} 不认识的字段名。
   */
  isKeyAvailable(key: CNContactKey): boolean;
}

/**
 * 用户在联系人详情里选中的那一项：哪个联系人的哪个字段的哪个值。
 * 只读的值，不能 `new`。
 */
declare class CNContactProperty extends NSObject {
  private constructor();
  /** 这一项属于哪个联系人。 */
  readonly contact: CNContact;
  /** 字段名，比如 `'phoneNumbers'`。 */
  readonly key: CNContactKey | (string & {});
  /**
   * 选中的值。电话是 `CNPhoneNumber`；邮箱、网址这类是字符串；别的类型
   * （地址、日期）还没有暴露，是 `null`。
   */
  readonly value: string | CNPhoneNumber | null;
  /** 选中的是带标签的值里的一项时，是那一项的标识；否则是 `null`。 */
  readonly identifier: string | null;
  /** 选中的是带标签的值里的一项时，是那一项的标签（原文）；否则是 `null`。 */
  readonly label: string | null;
}

/**
 * 把联系人的姓名拼成一行。名和姓谁在前、中间有没有空格，由系统按姓名的
 * 文字和用户的设置定。
 *
 * 只有类方法，不能 `new`。
 */
declare class CNContactFormatter extends NSObject {
  private constructor();
  /**
   * `style` 必填。联系人没有可拼的名字时是 `null`（只填了公司的联系人，
   * `fullName` 给的是公司名）。
   *
   * @throws {TypeError} 第一个参数不是 `CNContact`，或者 `style` 写错。
   */
  static stringFromContact(
    contact: CNContact,
    options: { style: CNContactFormatterStyle },
  ): string | null;
}

/** 选择器自己的事件名。 */
type CNContactPickerEventType =
  | 'cancel' | 'contactselect' | 'contactsselect' | 'contactpropertyselect';

/** `contactselect` 的事件对象。 */
declare class CNContactPickerContactEvent extends Event {
  constructor(type: string, init?: EventInit & Partial<Pick<CNContactPickerContactEvent, 'contact'>>);
  /** 用户选中的联系人。 */
  readonly contact: CNContact;
}

/** `contactsselect` 的事件对象。 */
declare class CNContactPickerContactsEvent extends Event {
  constructor(type: string, init?: EventInit & Partial<Pick<CNContactPickerContactsEvent, 'contacts'>>);
  /** 用户勾选的联系人。 */
  readonly contacts: CNContact[];
}

/** `contactpropertyselect` 的事件对象。 */
declare class CNContactPickerContactPropertyEvent extends Event {
  constructor(type: string, init?: EventInit & Partial<Pick<CNContactPickerContactPropertyEvent, 'contactProperty'>>);
  /** 用户在联系人详情里选中的那一项。 */
  readonly contactProperty: CNContactProperty;
}

/** 选联系人界面上每个事件名对应的事件对象：自己的四个，加上页面的那些。 */
interface CNContactPickerViewControllerEventMap extends UIViewControllerEventMap {
  'cancel': Event;
  'contactselect': CNContactPickerContactEvent;
  'contactsselect': CNContactPickerContactsEvent;
  'contactpropertyselect': CNContactPickerContactPropertyEvent;
}

/**
 * 系统的选联系人界面。
 *
 * 它是一个页面，用 `presentViewController()` 弹出来；用户选中了或者取消了，
 * 系统自己把它关掉。**一个选择器用一次**，每次选新建一个。
 *
 * **监听哪个事件，决定选择器是哪种模式**，所以三个「选中了」的事件只监听
 * 一个：
 *
 * | 监听 | 模式 |
 * | --- | --- |
 * | `contactselect` | 单选：点一个联系人就交回来 |
 * | `contactsselect` | 多选：勾几个，点「完成」一起交回来 |
 * | `contactpropertyselect` | 点联系人进详情，再点详情里的一项（一个电话、一个邮箱） |
 *
 * ```js
 * const picker = new CNContactPickerViewController();
 * picker.addEventListener('contactselect', (e) => {
 *   console.log(CNContactFormatter.stringFromContact(e.contact, { style: 'fullName' }));
 * });
 * vc.presentViewController(picker, { animated: true });
 * ```
 */
declare class CNContactPickerViewController extends UIViewController {
  constructor();

  /**
   * 联系人详情里显示哪些字段。默认 `null`，全部显示。
   *
   * @throws {TypeError} 不认识的字段名。
   */
  displayedPropertyKeys: CNContactKey[] | null;

  addEventListener<K extends keyof CNContactPickerViewControllerEventMap>(
    type: K,
    callback: ((event: CNContactPickerViewControllerEventMap[K]) => void) | null,
    options?: AddEventListenerOptions,
  ): void;
  removeEventListener<K extends keyof CNContactPickerViewControllerEventMap>(
    type: K,
    callback: ((event: CNContactPickerViewControllerEventMap[K]) => void) | null,
  ): void;
}
