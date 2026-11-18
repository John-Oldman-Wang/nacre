// 通讯录选择器（@nacrejs/contacts）：CNContactPickerViewController，以及它交回来的
// 只读的值 CNContact、CNLabeledValue、CNPhoneNumber、CNContactProperty，和把
// 姓名拼成一行的 CNContactFormatter。
//
// 选择器是系统的界面，在系统自己的进程里运行，App 只拿得到用户选中的那一个
// 联系人，不需要通讯录权限。
//
// 两段：
//   - 自动跑的只验不弹界面的：类在不在、建选择器、读写属性、订阅和退订、
//     写错参数时抛什么
//   - 真的弹出选择器要人点：面板里多一排按钮，点了才弹，选中的联系人打到
//     终端里。CNContact 那一组的成员只能在这里验——没有选择器就拿不到联系人

import { collectGarbage, customEventWorks, enumIgnored, ENUM_IGNORED } from '../support.js';
import { panelRow, systemPanel } from './pasteboard.js';

/**
 * 断言 fn 抛 TypeError，而且报错里有 expected 这一段。
 *
 * @param {import("../main.js").StepContext["assert"]} assert
 * @param {string} label
 * @param {() => unknown} fn
 * @param {string} expected
 */
function throwsTypeError(assert, label, fn, expected) {
  try {
    fn();
    assert(label, '没有抛', '抛 TypeError');
  } catch (err) {
    const ok = err instanceof TypeError && err.message.includes(expected);
    assert(label, ok ? 'TypeError' : String(err), 'TypeError');
    if (ok) console.log('      ' + err.message);
  }
}

/**
 * 把一个联系人打到终端里，顺带验它的每一个成员。
 *
 * @param {import("../main.js").StepContext["assert"]} assert
 * @param {string} tag 日志前缀
 * @param {CNContact} contact
 */
function checkContact(assert, tag, contact) {
  assert(tag + '是 CNContact', contact instanceof CNContact, true);
  assert(tag + 'identifier 是非空字符串',
         typeof contact.identifier === 'string' && contact.identifier.length > 0, true);
  assert(tag + '姓、名、组织都是字符串',
         [contact.givenName, contact.familyName, contact.organizationName]
           .every((s) => typeof s === 'string'), true);

  // 姓名拼成一行：顺序和分隔由系统按语言和用户的设置定
  const full = CNContactFormatter.stringFromContact(contact, { style: 'fullName' });
  assert(tag + 'stringFromContact 给字符串或 null', full === null || typeof full === 'string', true);
  const phonetic = CNContactFormatter.stringFromContact(contact, { style: 'phoneticFullName' });
  assert(tag + '注音那一种也给字符串或 null',
         phonetic === null || typeof phonetic === 'string', true);
  throwsTypeError(assert, tag + '不认识的 style 被拒',
                  // @ts-expect-error 没有这种样式
                  () => CNContactFormatter.stringFromContact(contact, { style: 'short' }),
                  'fullName');

  // 有没有取到某个字段
  assert(tag + 'isKeyAvailable("givenName")', contact.isKeyAvailable('givenName'), true);
  assert(tag + 'isKeyAvailable("phoneNumbers")', contact.isKeyAvailable('phoneNumbers'), true);
  throwsTypeError(assert, tag + 'isKeyAvailable 不认识的名字被拒',
                  // @ts-expect-error 没有这个字段名
                  () => contact.isKeyAvailable('phone'), 'phoneNumbers');

  // 电话：带标签的值，值是 CNPhoneNumber
  const phones = contact.phoneNumbers;
  assert(tag + 'phoneNumbers 是数组', Array.isArray(phones), true);
  assert(tag + '每一项是 CNLabeledValue，值是 CNPhoneNumber',
         phones.every((p) => p instanceof CNLabeledValue && p.value instanceof CNPhoneNumber &&
                             typeof p.value.stringValue === 'string'), true);
  assert(tag + '每一项的 label 是字符串或 null，identifier 是字符串',
         phones.every((p) => (p.label === null || typeof p.label === 'string') &&
                             typeof p.identifier === 'string'), true);
  if (phones.length > 0) {
    assert(tag + '两次读 phoneNumbers，同一项是同一个对象', contact.phoneNumbers[0] === phones[0], true);
    assert(tag + '两次读 value 是同一个对象', phones[0].value === phones[0].value, true);
  }
  // 邮箱：带标签的值，值是字符串
  const emails = contact.emailAddresses;
  assert(tag + 'emailAddresses 是数组', Array.isArray(emails), true);
  assert(tag + '每一项是 CNLabeledValue，值是字符串',
         emails.every((m) => m instanceof CNLabeledValue && typeof m.value === 'string'), true);

  // 只读：写不进去（严格模式下抛）
  throwsTypeError(assert, tag + 'givenName 只读',
                  // @ts-expect-error 只读
                  () => { contact.givenName = 'x'; }, 'givenName');

  /** @param {CNLabeledValue<unknown>} item */
  const labelOf = (item) =>
    item.label === null ? '（没有标签）' : CNLabeledValue.localizedStringForLabel(item.label);
  console.log('    ' + tag + '姓名 = ' + JSON.stringify(full) +
              '，名 = ' + JSON.stringify(contact.givenName) +
              '，姓 = ' + JSON.stringify(contact.familyName) +
              '，组织 = ' + JSON.stringify(contact.organizationName));
  for (const p of phones) {
    console.log('    ' + tag + '电话 ' + labelOf(p) + '：' + p.value.stringValue +
                '（label 原文 ' + JSON.stringify(p.label) + '）');
  }
  for (const m of emails) {
    console.log('    ' + tag + '邮箱 ' + labelOf(m) + '：' + m.value);
  }
}

/** @param {import("../main.js").StepContext} ctx */
export function stepContacts(ctx) {
  const { assert, vc } = ctx;
  console.log('--- 通讯录选择器（@nacrejs/contacts）---');

  // ===== 类 =====
  assert('六个类都在全局上',
         [CNContactPickerViewController, CNContact, CNLabeledValue, CNPhoneNumber,
          CNContactProperty, CNContactFormatter].every((c) => typeof c === 'function'), true);

  // 联系人那一组是只读的值，只能由选择器交回来；CNContactFormatter 只开了类方法
  for (const Kind of [CNContact, CNLabeledValue, CNPhoneNumber, CNContactProperty,
                      CNContactFormatter]) {
    throwsTypeError(assert, Kind.name + ' 不能 new',
                    // @ts-expect-error 构造函数不公开
                    () => new Kind(), 'Illegal constructor');
  }
  throwsTypeError(assert, '不能继承选择器', () => {
    class Mine extends CNContactPickerViewController {}
    return new Mine();
  }, 'Illegal constructor');

  // ===== 建选择器、读写属性 =====
  const picker = new CNContactPickerViewController();
  assert('选择器是 CNContactPickerViewController', picker instanceof CNContactPickerViewController, true);
  assert('它是页面（UIViewController）', picker instanceof UIViewController, true);
  assert('每次 new 得到新的对象', new CNContactPickerViewController() !== picker, true);
  assert('刚建好还没被呈现', picker.presentingViewController, null);

  // displayedPropertyKeys：联系人详情里显示哪些字段。null 是全部显示
  assert('displayedPropertyKeys 默认是 null', picker.displayedPropertyKeys, null);
  picker.displayedPropertyKeys = ['phoneNumbers', 'emailAddresses'];
  assert('写两个字段名，读回来一样',
         JSON.stringify(picker.displayedPropertyKeys), '["phoneNumbers","emailAddresses"]');
  picker.displayedPropertyKeys = ['givenName', 'familyName', 'organizationName', 'postalAddresses',
                                  'birthday', 'urlAddresses', 'contactRelations'];
  assert('没有做成 CNContact 成员的字段名也能写（只是让详情页显示它）',
         picker.displayedPropertyKeys && picker.displayedPropertyKeys.length, 7);
  assert('不认识的字段名：不抛、值不变', enumIgnored(() => {
    // @ts-expect-error 没有这个字段名
    picker.displayedPropertyKeys = ['phone'];
  }, () => picker.displayedPropertyKeys), ENUM_IGNORED);
  assert('数组里不是字符串：不抛、值不变', enumIgnored(() => {
    // @ts-expect-error 要的是字段名
    picker.displayedPropertyKeys = [1];
  }, () => picker.displayedPropertyKeys), ENUM_IGNORED);
  throwsTypeError(assert, '不是数组被拒',
                  // @ts-expect-error 要的是数组
                  () => { picker.displayedPropertyKeys = 'phoneNumbers'; }, 'array');
  assert('写错之后原来的值没动',
         picker.displayedPropertyKeys && picker.displayedPropertyKeys.length, 7);
  picker.displayedPropertyKeys = null;
  assert('写 null 读回 null', picker.displayedPropertyKeys, null);
  picker.displayedPropertyKeys = [];
  // 空数组读回来是空数组还是 null，头文件没说，打出来看
  console.log('  · 写空数组之后读回来 = ' + JSON.stringify(picker.displayedPropertyKeys));
  picker.displayedPropertyKeys = null;

  // 页面自己的属性照常能用
  picker.modalPresentationStyle = 'pageSheet';
  assert('页面的 modalPresentationStyle 照常读写', picker.modalPresentationStyle, 'pageSheet');

  // ===== 订阅和退订 =====
  //
  // 四个事件。监听哪一个决定选择器是什么模式（单选、多选、选某一个字段），
  // 所以这里只验「订得上、退得掉、名字写错会抛」，不呈现
  let seen = 0;
  const count = () => { seen += 1; };
  const names = /** @type {const} */ (
    ['cancel', 'contactselect', 'contactsselect', 'contactpropertyselect']);
  for (const name of names) {
    picker.addEventListener(name, count);
    picker.dispatchEvent(new Event(name));
  }
  assert('四个事件都订得上，自己派发的事件监听器收得到', seen, 4);
  for (const name of names) {
    picker.removeEventListener(name, count);
    picker.dispatchEvent(new Event(name));
  }
  assert('退订之后不再收到', seen, 4);
  picker.addEventListener('contactselect', count, { once: true });
  picker.dispatchEvent(new Event('contactselect'));
  picker.dispatchEvent(new Event('contactselect'));
  assert('once 只收一次', seen, 5);

  assert('不认识的事件名当自定义事件', customEventWorks(picker, 'not-a-real-event'), '收到一次');
  throwsTypeError(assert, '@ 开头的名字是运行时保留的',
                  // @ts-expect-error 运行时内部的名字
                  () => picker.addEventListener('@contactpicker:contact', count), 'reserved');
  // 第一步没做的那一种：多选某个字段
  assert('didselectcontactproperties 还不支持，当自定义事件', customEventWorks(picker, 'didselectcontactproperties'), '收到一次');
  // 它是页面，页面的事件照常订得上
  let pageEvents = 0;
  for (const name of /** @type {const} */ (['dismiss', 'appear', 'traitchange'])) {
    const noop = () => {};
    picker.addEventListener(name, noop);
    picker.removeEventListener(name, noop);
    pageEvents += 1;
  }
  assert('页面的 dismiss / appear / traitchange 照常订得上、退得掉', pageEvents, 3);

  // ===== CNLabeledValue.localizedStringForLabel =====
  //
  // 系统自带的标签存的是一个记号（手机是 _$!<Mobile>!$_），显示给用户之前
  // 要换成当前语言的写法。不需要联系人就能调
  const mobile = CNLabeledValue.localizedStringForLabel('_$!<Mobile>!$_');
  assert('系统自带的标签换成了给人看的写法',
         typeof mobile === 'string' && mobile.length > 0 && mobile !== '_$!<Mobile>!$_', true);
  console.log('      _$!<Mobile>!$_ → ' + JSON.stringify(mobile) +
              '，_$!<Home>!$_ → ' + JSON.stringify(CNLabeledValue.localizedStringForLabel('_$!<Home>!$_')));
  assert('用户自己起的标签原样还回来', CNLabeledValue.localizedStringForLabel('Warehouse'), 'Warehouse');
  // @ts-expect-error 要的是字符串；照参数转换的规矩，数转成字符串
  assert('数转成字符串', CNLabeledValue.localizedStringForLabel(5), '5');
  // @ts-expect-error 要的是字符串；null 当空串
  assert('null 当空串', CNLabeledValue.localizedStringForLabel(null), '');

  // ===== CNContactFormatter.stringFromContact：写错参数 =====
  //
  // 正常用法要一个联系人，在下面的按钮里验
  throwsTypeError(assert, 'stringFromContact 第一个参数不是联系人被拒',
                  // @ts-expect-error 要的是 CNContact
                  () => CNContactFormatter.stringFromContact(picker, { style: 'fullName' }),
                  'CNContact');
  throwsTypeError(assert, 'stringFromContact 给 null 被拒',
                  // @ts-expect-error 要的是 CNContact
                  () => CNContactFormatter.stringFromContact(null, { style: 'fullName' }),
                  'CNContact');
  throwsTypeError(assert, 'stringFromContact 不带 style 被拒，并且列出可选值',
                  // @ts-expect-error style 必填
                  () => CNContactFormatter.stringFromContact(picker), 'phoneticFullName');
  throwsTypeError(assert, 'stringFromContact 的 style 写错被拒',
                  // @ts-expect-error 没有这种样式
                  () => CNContactFormatter.stringFromContact(picker, { style: 'short' }),
                  'phoneticFullName');

  // ===== 屏幕上：一排按钮，点了才弹出系统的选择器 =====
  //
  // 选择器被系统关掉之后（选中了，或者取消了），「呈现它的页面持有它」那条
  // 边要有人放开，否则它的包装一直不被回收。和弹窗那一步一样：登记一下，
  // 结束之后逼一次 GC 看结果
  const reclaimed = new FinalizationRegistry((/** @type {{ gone: boolean }} */ token) => {
    token.gone = true;
  });
  /** @param {{ gone: boolean }} token */
  const checkReclaimed = (token) => {
    collectGarbage().then((ran) => {
      console.log(!ran ? '  ! 真实触摸：GC 没跑到，选择器有没有被回收这一条未验证'
        : token.gone ? '  ✓ 真实触摸：选择器被系统关掉之后，它的包装被回收了'
          : '  ✗ 真实触摸：选择器被系统关掉之后，它的包装还没被回收');
    });
  };
  /**
   * 建一个选择器并弹出来。每次点都新建：选择器用完就丢。
   *
   * @param {string} what
   * @param {(picker: CNContactPickerViewController, finish: () => void) => void} configure
   */
  const open = (what, configure) => () => {
    const shown = new CNContactPickerViewController();
    const token = { gone: false };
    reclaimed.register(shown, token);
    const finish = () => checkReclaimed(token);
    shown.addEventListener('cancel', (e) => {
      console.log('  ✓ 真实触摸：' + what + '，用户取消了，e.target 是这个选择器 = ' +
                  (e.target === shown));
      finish();
    });
    configure(shown, finish);
    vc.presentViewController(shown, { animated: true }).then(
      (ok) => console.log('  ✓ 真实触摸：' + what + '，选择器弹出来了，present 兑现 = ' + ok),
      (err) => console.log('  ✗ 真实触摸：' + what + '，present 被拒: ' + err.message));
  };

  panelRow(systemPanel(ctx), [
    // 单选：点一个联系人就选中并关掉
    ['选联系人', open('选联系人', (shown, finish) => {
      shown.addEventListener('contactselect', (e) => {
        assert('真实触摸：选联系人，e.target 是这个选择器', e.target === shown, true);
        checkContact(assert, '真实触摸：选联系人，', e.contact);
        finish();
      });
    })],
    // 选某一个电话：点联系人进详情，详情里只显示电话，点一个号码就选中
    ['选电话', open('选电话', (shown, finish) => {
      shown.displayedPropertyKeys = ['phoneNumbers'];
      shown.addEventListener('contactpropertyselect', (e) => {
        const property = e.contactProperty;
        assert('真实触摸：选电话，拿到的是 CNContactProperty',
               property instanceof CNContactProperty, true);
        assert('真实触摸：选电话，key 是 phoneNumbers', property.key, 'phoneNumbers');
        assert('真实触摸：选电话，value 是 CNPhoneNumber',
               property.value instanceof CNPhoneNumber, true);
        assert('真实触摸：选电话，identifier 是字符串', typeof property.identifier, 'string');
        assert('真实触摸：选电话，label 是字符串或 null',
               property.label === null || typeof property.label === 'string', true);
        const value = property.value;
        console.log('    真实触摸：选电话，选中的号码 = ' +
                    (value instanceof CNPhoneNumber ? value.stringValue : String(value)) +
                    '，标签 = ' + (property.label === null ? '（没有）'
                      : CNLabeledValue.localizedStringForLabel(property.label)));
        checkContact(assert, '真实触摸：选电话，它所属的联系人，', property.contact);
        finish();
      });
    })],
    // 多选：列表上可以勾几个，点「完成」一起交回来
    ['多选', open('多选', (shown, finish) => {
      shown.addEventListener('contactsselect', (e) => {
        const picked = e.contacts;
        assert('真实触摸：多选，contacts 是数组', Array.isArray(picked), true);
        console.log('    真实触摸：多选，选了 ' + picked.length + ' 个');
        picked.forEach((contact, i) => {
          checkContact(assert, '真实触摸：多选第 ' + (i + 1) + ' 个，', contact);
        });
        finish();
      });
    })],
  ]);
  console.log('  ✓ 面板里多了一排按钮：选联系人 / 选电话 / 多选，点了才弹出系统的选择器');
}
