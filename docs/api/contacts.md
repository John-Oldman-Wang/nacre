---
type: reference
native: CNContactPickerViewController
status: partial
---

# 通讯录选择器

**`CNContactPickerViewController`** 表示系统的选联系人界面。它列出用户通讯录里的全部联系人，用户从里面选一个（或几个），App 拿到选中的那些。充值时选一个手机号、转账时选收款人、邀请好友时选几个人，用的都是它。

这个界面由系统提供，在系统自己的进程里运行。App 看不到通讯录里的其他联系人，只拿得到用户亲手选中的。所以它**不需要通讯录权限**：系统不会弹出「是否允许访问通讯录」的询问，项目也不用写权限文案。

`CNContactPickerViewController` 是一个[页面](ui-view-controller.md)，用页面的 [`presentViewController()`](ui-view-controller.md#presentviewcontroller) 弹出来。用户选中的联系人是一个 **`CNContact`**，随事件交给 App。

> **注意**：通讯录选择器不在核心里，要先装 `@nacrejs/contacts` 这个包才有。没装的时候全局没有这一页里的任何一个类，类型检查会报 `Cannot find name`。怎么装见下面「[先装上](#先装上)」。

> **注意**：选择器的创建、属性的默认值和读写、各种写错时的报错，在模拟器（iPhone Air）的验收里验过。选择器弹出来之后的一切（屏幕上的样子、四个事件什么时候来、事件带的联系人）要有人操作，都**未在模拟器验证**，下面不再逐条标注。

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

`nacre.config.json` 里什么都不用加。需要权限的能力包会要求项目在 [`ios.infoPlist`](../guides/project-config.md) 里写一句权限文案，这个包不要求。

## 监听哪个事件，决定选择器怎么选

选择器有三种选法。用哪一种不是靠属性设置的，而是看 App 监听了哪个事件：

| 监听的事件 | 选法 | 事件带的数据 |
| --- | --- | --- |
| `contactselect` | 单选。用户点一个联系人，选择器立刻关掉 | `contact`：选中的联系人 |
| `contactsselect` | 多选。每个联系人前面有一个勾选框，用户勾完点「完成」，选择器关掉 | `contacts`：勾选的联系人，一个数组 |
| `contactpropertyselect` | 选某一项。用户点一个联系人，进入这个联系人的详情；再点详情里的一项（一个电话、一个邮箱），选择器关掉 | `contactProperty`：选中的那一项 |

- **三个事件只监听一个。** 同时监听 `contactsselect` 和另外两个时，选择器是多选的，另外两个事件不会来。同时监听 `contactselect` 和 `contactpropertyselect` 时系统怎么选，Apple 的文档没有说明。
- **在弹出之前监听。** 选择器已经在屏幕上之后再加监听器，选法会不会跟着变没有依据。
- **三个都不监听时**选择器是什么样，没有验证。弹出选择器之前至少监听其中一个。

第四个事件 `cancel` 和选法无关：用户没选就把选择器关掉时派发。

## 选择器什么时候结束

选择器有两种结束方式：

- 用户选中了。派发上表里的某一个事件。
- 用户没选，点了「取消」。派发 `cancel`。

两种情况选择器都由系统关掉，App 不需要调 [`dismissViewController()`](ui-view-controller.md#dismissviewcontroller)。

- **事件派发时选择器是不是已经完全关掉，没有验证。** 同一个页面同一时刻只能弹出一个页面，所以选完之后立刻再弹一个页面（比如确认框）能不能成，要实际试过才知道。不依赖这一点的做法是先把结果显示在当前页面上。
- **用户选完之后，App 手里的联系人是一份当时的副本。** 用户之后在通讯录里改了这个联系人，App 手里的不会变，也收不到通知。

## 推荐的做法

**每次选都新建一个选择器。** 选择器用过一次之后再弹第二次会怎样没有验证。

**只要一个号码时，用「选某一项」，不要用单选。** 一个联系人可以有几个电话。单选拿到的是整个联系人，哪个号码才是用户想要的，App 还得自己再问一次；「选某一项」让用户在系统的详情页里直接点那个号码。写法见[让用户选一个电话号码](#让用户选一个电话号码)。

**显示姓名用 [`CNContactFormatter.stringFromContact()`](#cncontactformatterstringfromcontact)，不要自己把姓和名拼起来。** 中文、日文的姓在前，英文的名在前，中间有没有空格也不一样。这个方法按姓名本身的文字和用户的设置来拼。

**显示电话的标签前，用 [`CNLabeledValue.localizedStringForLabel()`](#cnlabeledvaluelocalizedstringforlabel) 换一下。** 系统自带的标签存的是一个记号（「手机」存的是 `_$!<Mobile>!$_`），不能直接给用户看。

**号码用之前自己规整。** `stringValue` 是用户在通讯录里填的原文，可能带空格、横线、括号、国家码。

## 完整例子

下面的代码从空白 App 开始，在页面上放一个按钮，点它弹出选择器；用户选了一个联系人之后，把姓名和第一个电话显示在页面上。

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/contacts" />

application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
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
    // 1. 每次选都新建一个选择器
    const picker = new CNContactPickerViewController();

    // 2. 监听 contactselect：选择器是单选的
    picker.addEventListener('contactselect', (event) => {
      const contact = event.contact;
      const name = CNContactFormatter.stringFromContact(contact, { style: 'fullName' });
      const phones = contact.phoneNumbers;
      const phone = phones.length > 0 ? phones[0].value.stringValue : '没有电话';
      result.text = (name === null ? '没有名字' : name) + '\n' + phone;
    });

    // 3. 用户没选就关掉了
    picker.addEventListener('cancel', () => {
      result.text = '没有选';
    });

    // 4. 从当前页面弹出来
    page.presentViewController(picker, { animated: true });
  });
});
```

**效果**：

- 页面左上方有一个蓝色文字的按钮「选联系人」。
- 点它，屏幕底部升起系统的联系人列表，顶上有搜索框和「取消」。系统没有弹出权限询问。
- 点联系人 Alex Chen，列表消失，页面上显示两行：`Alex Chen` 和他的第一个电话，比如 `555-0100`。
- 点「取消」，列表消失，页面上显示 `没有选`。

## 常见用法

下面的例子沿用完整例子里的 `page` 和 `result`。

### 让用户选一个电话号码

```js
const picker = new CNContactPickerViewController();
// 联系人详情里只显示电话
picker.displayedPropertyKeys = ['phoneNumbers'];
// 监听 contactpropertyselect：点联系人进详情，再点一个号码
picker.addEventListener('contactpropertyselect', (event) => {
  const property = event.contactProperty;
  if (property.value instanceof CNPhoneNumber) {
    const name = CNContactFormatter.stringFromContact(property.contact, { style: 'fullName' });
    result.text = (name === null ? '' : name + '：') + property.value.stringValue;
  }
});
page.presentViewController(picker, { animated: true });
```

**效果**：

- 点一个联系人，进入他的详情，详情里只有电话那几行。
- 点其中一个号码，选择器关掉，页面上显示 `Alex Chen：555-0100`。

`property.value` 的类型取决于用户点的是哪种字段，所以先用 `instanceof` 判断。`displayedPropertyKeys` 把详情限制成只有电话，用户就点不到别的字段。

### 让用户选一个邮箱

```js
const picker = new CNContactPickerViewController();
picker.displayedPropertyKeys = ['emailAddresses'];
picker.addEventListener('contactpropertyselect', (event) => {
  const value = event.contactProperty.value;
  if (typeof value === 'string') {
    result.text = value;
  }
});
page.presentViewController(picker, { animated: true });
```

**效果**：点一个联系人，详情里只有邮箱；点其中一个，页面上显示这个邮箱，比如 `alex@example.com`。

邮箱的值是字符串，电话的值是 `CNPhoneNumber`。

### 一次选几个联系人

```js
const picker = new CNContactPickerViewController();
// 监听 contactsselect：选择器是多选的
picker.addEventListener('contactsselect', (event) => {
  const names = event.contacts.map((contact) =>
    CNContactFormatter.stringFromContact(contact, { style: 'fullName' }));
  result.text = '选了 ' + names.length + ' 个：' + names.join('、');
});
page.presentViewController(picker, { animated: true });
```

**效果**：

- 列表里每个联系人前面有一个勾选框，右上角有「完成」。
- 勾两个再点「完成」，选择器关掉，页面上显示 `选了 2 个：Alex Chen、Sam Rivera`。

### 把一个联系人的电话连同标签列出来

```js
picker.addEventListener('contactselect', (event) => {
  const lines = event.contact.phoneNumbers.map((item) => {
    const label = item.label === null
      ? ''
      : CNLabeledValue.localizedStringForLabel(item.label) + ' ';
    return label + item.value.stringValue;
  });
  result.text = lines.join('\n');
});
```

**效果**：页面上每行一个电话，前面是标签在当前语言下的写法，比如中文系统上是 `手机 555-0100`、`工作 555-0199`。

`label` 可能是 `null`（这个电话没有标签），所以先判断。

### 联系人只填了公司，没有名字

```js
picker.addEventListener('contactselect', (event) => {
  const contact = event.contact;
  const name = CNContactFormatter.stringFromContact(contact, { style: 'fullName' });
  result.text = name === null ? '（没有名字）' : name;
});
```

**效果**：

- 填了姓名的联系人，显示姓名。
- 只填了公司的联系人，显示公司名。
- 姓名和公司都没填的联系人，`stringFromContact()` 给的是 `null`，显示 `（没有名字）`。

## 带标签的值

一个联系人可以有几个电话、几个邮箱。通讯录里每一个都带一个标签：手机、住宅、工作，或者用户自己起的名字。`CNLabeledValue` 表示这样的一项：

| 成员 | 含义 |
| --- | --- |
| `value` | 值。电话是 `CNPhoneNumber`，邮箱是字符串 |
| `label` | 标签的原文。没有标签是 `null` |
| `identifier` | 这一项在这台设备上的标识 |

标签的原文分两种：

- **系统自带的标签**存的是一个记号，不是给人看的文字。在 macOS 上量到的几个（同一个系统框架，iOS 上未验证）：`_$!<Mobile>!$_`（手机）、`_$!<Home>!$_`（住宅）、`_$!<Work>!$_`（工作）、`_$!<Main>!$_`（主要）、`_$!<Other>!$_`（其他），以及 `iPhone`。
- **用户自己起的标签**存的就是用户输入的文字。

`CNLabeledValue.localizedStringForLabel()` 两种都能处理：系统自带的换成当前语言下的写法，用户自己起的原样还回来。

## 成员说明

### `CNContactPickerViewController`

#### `new CNContactPickerViewController()`

```js
const picker = new CNContactPickerViewController();
```

没有参数。继承它会抛 `TypeError`，见[原生类](native-classes.md)。

#### 属性

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `displayedPropertyKeys` | `CNContactKey[] \| null` | 是 | 是 | `null` | 联系人详情里显示哪些字段。`null`：全部显示。只对「选某一项」有意义：单选和多选不进详情 |

- 数组里写[字段名](#字段名)。数组里有不认识的名字时不抛异常：整次赋值不生效，属性保持原来的值，控制台输出一条警告 `[Nacre] displayedPropertyKeys has no value "phone"; expected one of: identifier / namePrefix / givenName / …, ignored`，省略号处列出全部字段名。数组里写对的字段名不会被单独应用。
- 给的不是数组也不是 `null`：`TypeError: displayedPropertyKeys must be an array of contact key names or null, got "phoneNumbers"`（`got` 后面是实际给的值）。抛了之后原来的值不变。
- 这个属性变化时不派发事件：它只有 App 自己能改。

标题、弹出方式等继承自 [`UIViewController`](ui-view-controller.md)。

#### 弹出和关闭

| 想做的事 | 写法 |
| --- | --- |
| 弹出来 | [`page.presentViewController(picker, { animated: true })`](ui-view-controller.md#presentviewcontroller) |
| 用代码关掉 | [`picker.dismissViewController({ animated: true })`](ui-view-controller.md#dismissviewcontroller)。用代码关掉时派不派发 `cancel` 没有验证，关掉之后要做的事直接写在这一句后面 |

#### 事件

| 事件 | 什么时候派发 | 事件对象多出的字段 |
| --- | --- | --- |
| `contactselect` | 单选时，用户点了一个联系人 | `contact`：[`CNContact`](#cncontact) |
| `contactsselect` | 多选时，用户点了「完成」 | `contacts`：`CNContact[]`。一个都没勾就点「完成」时是不是空数组，没有验证 |
| `contactpropertyselect` | 用户在联系人详情里点了一项 | `contactProperty`：[`CNContactProperty`](#cncontactproperty) |
| `cancel` | 用户没选，点了「取消」 | 没有 |
| `beforedismiss`、`dismiss`、`dismissattempt` | 继承自页面，见[关闭事件](ui-view-controller.md#关闭事件) | |

- 事件对象的 `target` 是这个选择器。
- 一个选择器弹出一次，上面四个事件里最多派发一个、一次。
- 事件不能取消，`preventDefault()` 不起作用。
- 监听哪个事件决定选法，见[上面](#监听哪个事件决定选择器怎么选)。
- 监听别的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。

### `CNContact`

一个联系人。只读，不能 `new`：`TypeError: Illegal constructor: CNContact is a read-only value handed over by CNContactPickerViewController, not created by new`。下面的 `CNLabeledValue`、`CNPhoneNumber`、`CNContactProperty` 同样不能 `new`，报错只有类名不同。

| 属性 | 类型 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `identifier` | `string` | 是 | 否 | 这个联系人在这台设备上的标识。可以保存下来，用来认出下次选中的是不是同一个联系人 |
| `givenName` | `string` | 是 | 否 | 名。没填是空串 |
| `familyName` | `string` | 是 | 否 | 姓。没填是空串 |
| `organizationName` | `string` | 是 | 否 | 公司或组织。没填是空串 |
| `phoneNumbers` | `CNLabeledValue<CNPhoneNumber>[]` | 是 | 否 | 电话，按通讯录里的顺序。没有是空数组 |
| `emailAddresses` | `CNLabeledValue<string>[]` | 是 | 否 | 邮箱，按通讯录里的顺序。没有是空数组 |

- 这些值不会变，所以没有变化事件：`CNContact` 是选中那一刻的副本。
- 给它们赋值抛 `TypeError`（只读属性）。
- 同一个联系人上两次读 `phoneNumbers`，数组里是同一批对象，可以用 `===` 比较。

#### `isKeyAvailable()`

```js
if (contact.isKeyAvailable('emailAddresses')) {
  console.log(contact.emailAddresses.length);
}
```

- **参数**：一个[字段名](#字段名)。
- **返回值**：`boolean`。`true`：这个联系人带着这个字段，可以读。`false`：没带。
- **出错**：不认识的字段名抛 `TypeError: isKeyAvailable has no value "phone"; expected one of: …`，后面列出全部字段名。

系统交给 App 的联系人不保证带着所有字段。读一个没带的字段抛 `TypeError: CNContact.givenName is not available on this contact; check contact.isKeyAvailable("givenName") first`。选择器交回来的联系人是否总是带着上表里的六个字段，还没有验证；拿不准时先问。

### `CNLabeledValue`

带标签的值，见[上面](#带标签的值)。只读，不能 `new`。

| 属性 | 类型 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `value` | `CNPhoneNumber \| string` | 是 | 否 | 电话是 `CNPhoneNumber`，邮箱是字符串 |
| `label` | `string \| null` | 是 | 否 | 标签的原文。没有标签是 `null` |
| `identifier` | `string` | 是 | 否 | 这一项在这台设备上的标识 |

#### `CNLabeledValue.localizedStringForLabel()`

```js
CNLabeledValue.localizedStringForLabel('_$!<Mobile>!$_');   // 中文系统上是 '手机'
CNLabeledValue.localizedStringForLabel('仓库');              // '仓库'
```

- **参数**：标签的原文，字符串。别的类型按[参数转换](../internals/conversion.md)的规矩转成字符串，`null` 当作空串。
- **返回值**：`string`。系统自带的标签换成当前语言下给人看的写法；别的字符串原样返回。
- 不需要联系人就能调。

### `CNPhoneNumber`

一个电话号码。只读，不能 `new`。

| 属性 | 类型 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `stringValue` | `string` | 是 | 否 | 用户在通讯录里填的原文，没有规整过 |

### `CNContactProperty`

用户在联系人详情里选中的那一项。只读，不能 `new`。

| 属性 | 类型 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `contact` | `CNContact` | 是 | 否 | 这一项属于哪个联系人 |
| `key` | `string` | 是 | 否 | [字段名](#字段名)：用户点的是电话就是 `'phoneNumbers'`，是邮箱就是 `'emailAddresses'` |
| `value` | `CNPhoneNumber \| string \| null` | 是 | 否 | 选中的值。电话是 `CNPhoneNumber`；邮箱、网址是字符串；别的类型（地址、生日、日期）是 `null`，见[还不能做的](#还不能做的) |
| `identifier` | `string \| null` | 是 | 否 | 选中的是带标签的值里的一项时，是那一项的 `identifier`；否则是 `null` |
| `label` | `string \| null` | 是 | 否 | 选中的是带标签的值里的一项时，是那一项的标签原文；否则是 `null` |

### `CNContactFormatter`

把联系人的姓名拼成一行。只有一个静态方法，不能 `new`：`TypeError: Illegal constructor: CNContactFormatter has no instances here; use CNContactFormatter.stringFromContact(contact, { style })`。

#### `CNContactFormatter.stringFromContact()`

```js
const name = CNContactFormatter.stringFromContact(contact, { style: 'fullName' });
```

- **参数**：
  - `contact`：一个 `CNContact`。
  - `options.style`：必填。

    | 取值 | 效果 |
    | --- | --- |
    | `'fullName'` | 姓名。名是 Alex、姓是 Chen 的联系人得到 `Alex Chen`；名是「小明」、姓是「陈」的联系人得到 `陈小明`。只填了公司的联系人得到公司名 |
    | `'phoneticFullName'` | 姓名的注音（通讯录里给姓和名填的拼音或读音）。没填注音时是 `null` |

- **返回值**：`string | null`。这个联系人没有可拼的内容时是 `null`。
- **出错**：
  - `style` 没写或者写错：`TypeError: style has no value "short"; expected one of: fullName / phoneticFullName`
  - 第一个参数不是联系人：`TypeError: stringFromContact needs a CNContact`
  - 联系人没带拼姓名要用的字段：`TypeError: stringFromContact: this contact does not carry the name fields this style needs`

上面 `fullName` 的三个结果是在 macOS 上用同一个系统框架量的，iOS 上未验证。

### 字段名

`displayedPropertyKeys` 和 `isKeyAvailable()` 用的名字。它们是联系人在系统里的全部字段，比 `CNContact` 上现在能读的成员多：没做成成员的字段照样可以让详情页显示。

| 字段名 | 含义 |
| --- | --- |
| `'identifier'` | 标识 |
| `'namePrefix'`、`'givenName'`、`'middleName'`、`'familyName'`、`'previousFamilyName'`、`'nameSuffix'`、`'nickname'` | 称谓、名、中间名、姓、曾用姓、后缀、昵称 |
| `'phoneticGivenName'`、`'phoneticMiddleName'`、`'phoneticFamilyName'`、`'phoneticOrganizationName'` | 名、中间名、姓、公司的注音 |
| `'organizationName'`、`'departmentName'`、`'jobTitle'` | 公司、部门、职位 |
| `'phoneNumbers'`、`'emailAddresses'`、`'postalAddresses'`、`'urlAddresses'` | 电话、邮箱、地址、网址 |
| `'birthday'`、`'nonGregorianBirthday'`、`'dates'` | 生日、农历等其他历法的生日、纪念日等日期 |
| `'contactRelations'`、`'socialProfiles'`、`'instantMessageAddresses'` | 关系人、社交账号、即时通信账号 |
| `'note'` | 备注 |
| `'imageData'`、`'thumbnailImageData'`、`'imageDataAvailable'` | 头像、头像的缩略图、有没有头像 |
| `'contactType'` | 是个人还是组织 |

## 与 iOS 原生写法的对照

如果你在看 Apple 的文档或 iOS 的示例代码，按这张表换成 JS 的写法。

| ObjC | JS |
| --- | --- |
| `[[CNContactPickerViewController alloc] init]` | `new CNContactPickerViewController()` |
| `picker.delegate = self`，实现 `contactPicker:didSelectContact:` | `picker.addEventListener('contactselect', (e) => { e.contact })` |
| 实现 `contactPicker:didSelectContacts:` | `picker.addEventListener('contactsselect', (e) => { e.contacts })` |
| 实现 `contactPicker:didSelectContactProperty:` | `picker.addEventListener('contactpropertyselect', (e) => { e.contactProperty })` |
| 实现 `contactPickerDidCancel:` | `picker.addEventListener('cancel', () => { … })` |
| `picker.displayedPropertyKeys = @[CNContactPhoneNumbersKey]` | `picker.displayedPropertyKeys = ['phoneNumbers']` |
| `[self presentViewController:picker animated:YES completion:nil]` | `page.presentViewController(picker, { animated: true })` |
| `contact.givenName`、`contact.phoneNumbers` | 相同 |
| `contact.phoneNumbers[0].value.stringValue` | 相同 |
| `[contact isKeyAvailable:CNContactEmailAddressesKey]` | `contact.isKeyAvailable('emailAddresses')` |
| `[CNLabeledValue localizedStringForLabel:label]` | `CNLabeledValue.localizedStringForLabel(label)` |
| `[CNContactFormatter stringFromContact:contact style:CNContactFormatterStyleFullName]` | `CNContactFormatter.stringFromContact(contact, { style: 'fullName' })` |

ObjC 里选择器的选法由委托实现了哪几个方法决定；JS 里由监听了哪几个事件决定，一一对应。

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 读整个通讯录、按名字搜索联系人 | `CNContactStore` | 不在这个包里。它需要通讯录权限，项目要写 `NSContactsUsageDescription` |
| 新建、修改、删除联系人 | `CNMutableContact`、`CNSaveRequest` | 同上 |
| 通讯录变了的通知 | `CNContactStoreDidChangeNotification` | 同上 |
| 一次选几个电话或几个邮箱 | `contactPicker:didSelectContactProperties:` | 未实现。监听 `didselectcontactproperties` 不报错，但收不到 |
| 让一部分联系人点不了（比如没有电话的） | `predicateForEnablingContact` | 未实现，要先有 `NSPredicate` |
| 只有一个电话的联系人直接选中，有几个的才进详情 | `predicateForSelectionOfContact`、`predicateForSelectionOfProperty` | 未实现，同上 |
| 读联系人的其他字段：中间名、昵称、职位、地址、生日、网址、头像、备注 | `CNContact` 的其余属性，`CNPostalAddress` 等 | 未实现。可以用 `displayedPropertyKeys` 让详情页显示它们，但读不到值 |
| 选中地址、生日这类字段时拿到值 | `CNContactProperty.value` 是 `CNPostalAddress`、`NSDateComponents` | 未实现，`value` 是 `null`；`key` 仍然说明选的是哪种字段 |
| 判断一个标签是不是「手机」 | `CNLabelPhoneNumberMobile` 等常量 | 未实现。现在只能和标签的原文比较 |
| 显示一个联系人的详情页、新建联系人的界面 | `CNContactViewController` | 未实现 |
| 姓名的其他拼法：指定姓在前还是名在前、带格式的文字 | `CNContactFormatter` 的实例、`attributedStringFromContact:` | 未实现 |

## 参见

- [`UIViewController`](ui-view-controller.md)：选择器的父类。弹出、关闭、关闭事件
- [配置 App](../guides/project-config.md)：需要权限的能力包要项目写什么。这个包不需要
- [Keychain](keychain.md)：另一个能力包，装法相同
- [系统分享面板](ui-activity-view-controller.md)：另一个由系统提供的页面
- [原生类](native-classes.md)：哪些类能 `new`、为什么不能继承
- [实现原理：通讯录选择器](../internals/contacts.md)：为什么不需要权限、哪些确认过、哪些没有
