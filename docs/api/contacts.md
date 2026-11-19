---
type: reference
native: CNContactPickerViewController
status: partial
---

# `CNContactPickerViewController`

**`CNContactPickerViewController`** 表示系统的选联系人界面。它列出用户通讯录里的全部联系人，用户从里面选一个（或几个），App 拿到选中的那些。充值时选一个手机号、转账时选收款人、邀请好友时选几个人，用的都是它。

这个界面由系统提供，在系统自己的进程里运行。App 看不到通讯录里的其他联系人，只拿得到用户亲手选中的。所以它**不需要通讯录权限**：系统不会弹出「是否允许访问通讯录」的询问，项目也不用写权限文案。

选择器是一个[页面](ui-view-controller.md)，用页面的 [`presentViewController()`](ui-view-controller/presentviewcontroller.md) 弹出来。用户选中的东西随事件交给 App。同一个包里还有这几个类，它们都只能由选择器交回来，不能 `new`：

| 类 | 表示什么 |
| --- | --- |
| [`CNContact`](cn-contact.md) | 一个联系人 |
| [`CNLabeledValue`](cn-labeled-value.md) | 联系人的一个电话或邮箱，连同它的标签 |
| [`CNPhoneNumber`](cn-phone-number.md) | 一个电话号码 |
| [`CNContactProperty`](cn-contact-property.md) | 用户在联系人详情里点的那一项 |
| [`CNContactFormatter`](cn-contact-formatter.md) | 把联系人的姓名拼成一行 |

> **注意**：通讯录选择器不在核心里，要先装 `@nacrejs/contacts` 这个包才有。没装的时候全局没有上面任何一个类，类型检查会报 `Cannot find name`。怎么装见下面「[先装上](#先装上)」。

> **注意**：选择器的创建、属性的默认值和读写、各种写错时的报错，在模拟器（iPhone Air）的验收里验过。选择器弹出来之后的一切（屏幕上的样子、四个事件什么时候来、事件带的联系人）要有人操作，都**未在模拟器验证**，这一组页面里不再逐条标注。

**继承关系**：`EventTarget` → `NSObject` → `UIResponder` → [`UIViewController`](ui-view-controller.md) → `CNContactPickerViewController`

怎么让用户选一个联系人、一个电话或几个人，见指南[让用户选联系人](../guides/pick-contact.md)。

## 先装上

通讯录选择器是一个单独的能力包。在项目里装它：

```bash
npm install @nacrejs/contacts
```

**效果**：下次生成 `ios/` 时，工程里多嵌一个 `NacreContacts.framework`；不装的项目，产物里没有它。

然后在入口文件顶上加一行，让类型进来：

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/contacts" />
```

**效果**：编辑器里 `CNContactPickerViewController`、`CNContact` 这些类有了补全和检查。

`nacre.config.json` 里什么都不用加。需要权限的能力包会要求项目在 [`ios.infoPlist`](../guides/project-config.md#写权限文案) 里写一句权限文案，这个包不要求，所以也没有「没写时生成报错」这一步。

## 构造函数

[`CNContactPickerViewController()`](contacts/constructor.md)

创建一个选择器。一个选择器用一次，每次选都新建一个。

## 实例属性

还继承 [`UIViewController`](ui-view-controller.md) 的属性，比如 `title`、`modalPresentationStyle`。

| 属性 | 说明 |
| --- | --- |
| [`displayedPropertyKeys`](contacts/displayedpropertykeys.md) | 联系人详情里显示哪些字段 |

## 实例方法

没有自己的方法。弹出和关闭用继承自 [`UIViewController`](ui-view-controller.md) 的方法：

| 想做的事 | 写法 |
| --- | --- |
| 弹出来 | [`page.presentViewController(picker, { animated: true })`](ui-view-controller/presentviewcontroller.md) |
| 用代码关掉 | [`picker.dismissViewController({ animated: true })`](ui-view-controller/dismissviewcontroller.md)。用代码关掉时派不派发 `cancel` 没有验证，关掉之后要做的事直接写在这一句后面 |

## 事件

用 `addEventListener()` 监听。监听哪个事件决定选择器怎么选，见[选法](#选法)。

| 事件 | 什么时候派发 |
| --- | --- |
| [`contactselect`](contacts/contactselect-event.md) | 单选时，用户点了一个联系人 |
| [`contactsselect`](contacts/contactsselect-event.md) | 多选时，用户点了「完成」 |
| [`contactpropertyselect`](contacts/contactpropertyselect-event.md) | 用户在联系人详情里点了一项 |
| [`cancel`](contacts/cancel-event.md) | 用户没选，点了「取消」 |
| `beforedismiss`、`dismiss`、`dismissattempt` | 继承自 `UIViewController`，见[关闭事件](ui-view-controller.md#关闭事件) |

- 一个选择器弹出一次，上面四个自己的事件里最多派发一个、一次。
- 事件不能取消，`preventDefault()` 不起作用。
- 监听别的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。

## 选法

选择器有三种选法。用哪一种不是靠属性设置的，而是看 App 监听了哪个事件：

| 监听的事件 | 选法 | 事件带的数据 |
| --- | --- | --- |
| `contactselect` | 单选。用户点一个联系人，选择器立刻关掉 | `contact`：选中的联系人 |
| `contactsselect` | 多选。每个联系人前面有一个勾选框，用户勾完点「完成」，选择器关掉 | `contacts`：勾选的联系人，一个数组 |
| `contactpropertyselect` | 选某一项。用户点一个联系人，进入这个联系人的详情；再点详情里的一项（一个电话、一个邮箱），选择器关掉 | `contactProperty`：选中的那一项 |

- **三个事件只监听一个。** 同时监听 `contactsselect` 和另外两个时，选择器是多选的，另外两个事件不会来。同时监听 `contactselect` 和 `contactpropertyselect` 时系统怎么选，Apple 的文档没有说明。
- **在弹出之前监听。** 选择器已经在屏幕上之后再加监听器，选法会不会跟着变没有依据。
- **三个都不监听时**选择器是什么样，没有验证。弹出选择器之前至少监听其中一个。

第四个事件 `cancel` 和选法无关。

## 选择器什么时候结束

选择器有两种结束方式：

- 用户选中了。派发上表里的某一个事件。
- 用户没选，点了「取消」。派发 `cancel`。

两种情况选择器都由系统关掉，App 不需要调 [`dismissViewController()`](ui-view-controller/dismissviewcontroller.md)。

- **事件派发时选择器是不是已经完全关掉，没有验证。** 同一个页面同一时刻只能弹出一个页面，所以选完之后立刻再弹一个页面（比如确认框）能不能成，要实际试过才知道。不依赖这一点的做法是先把结果显示在当前页面上。
- **用户选完之后，App 手里的联系人是一份当时的副本。** 用户之后在通讯录里改了这个联系人，App 手里的不会变，也收不到通知。

## 示例

### 选一个联系人

下面的代码从空白 App 开始，在页面上放一个按钮，点它弹出选择器；用户选了一个联系人之后，把姓名和第一个电话显示在页面上。

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/contacts" />

application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const button = UIButton.buttonWithType('system');
  button.setTitle('选联系人', { forState: ['normal'] });
  button.frame = new CGRect(40, 120, 200, 44);
  page.view.addSubview(button);

  const result = new UILabel();
  result.frame = new CGRect(40, 180, 300, 60);
  result.numberOfLines = 0;
  page.view.addSubview(result);

  button.addEventListener('click', () => {
    const picker = new CNContactPickerViewController();
    picker.addEventListener('contactselect', (event) => {
      const contact = event.contact;
      const name = CNContactFormatter.stringFromContact(contact, { style: 'fullName' });
      const phones = contact.phoneNumbers;
      const phone = phones.length > 0 ? phones[0].value.stringValue : '没有电话';
      result.text = (name === null ? '没有名字' : name) + '\n' + phone;
    });
    picker.addEventListener('cancel', () => {
      result.text = '没有选';
    });
    page.presentViewController(picker, { animated: true });
  });
});
```

**效果**：

- 页面左上方有一个蓝色文字的按钮「选联系人」。
- 点它，屏幕底部升起系统的联系人列表，顶上有搜索框和「取消」。系统没有弹出权限询问。
- 点联系人 Alex Chen，列表消失，页面上显示两行：`Alex Chen` 和他的第一个电话，比如 `555-0100`。
- 点「取消」，列表消失，页面上显示 `没有选`。

更多写法见指南[让用户选联系人](../guides/pick-contact.md)。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[[CNContactPickerViewController alloc] init]` | `new CNContactPickerViewController()` |
| `picker.delegate = self`，实现 `contactPicker:didSelectContact:` | `picker.addEventListener('contactselect', (e) => { e.contact })` |
| 实现 `contactPicker:didSelectContacts:` | `picker.addEventListener('contactsselect', (e) => { e.contacts })` |
| 实现 `contactPicker:didSelectContactProperty:` | `picker.addEventListener('contactpropertyselect', (e) => { e.contactProperty })` |
| 实现 `contactPickerDidCancel:` | `picker.addEventListener('cancel', () => { … })` |
| `picker.displayedPropertyKeys = @[CNContactPhoneNumbersKey]` | `picker.displayedPropertyKeys = ['phoneNumbers']` |
| `[self presentViewController:picker animated:YES completion:nil]` | `page.presentViewController(picker, { animated: true })` |

ObjC 里选择器的选法由委托实现了哪几个方法决定；JS 里由监听了哪几个事件决定，一一对应。

## 参见

- [让用户选联系人](../guides/pick-contact.md)：推荐的做法、选一个电话、选一个邮箱、一次选几个
- [`CNContact`](cn-contact.md)：选中的联系人
- [`UIViewController`](ui-view-controller.md)：选择器的父类。弹出、关闭、关闭事件
- [核心和能力包](capabilities.md)：`@nacrejs/contacts` 是一个能力包，能力包怎么用
- [系统分享面板](ui-activity-view-controller.md)：另一个由系统提供的页面
- [原生类](native-classes.md)：哪些类能 `new`、不能继承
