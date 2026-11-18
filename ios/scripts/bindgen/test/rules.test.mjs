// 机械规则的用例：已定的写法（docs/project.md「已定的写法」）照着套出来是什么。
//
//   node --test ios/scripts/bindgen/test/
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { lowerFirst, enumValues, methodShape, propertyName, typeKind } from '../rules.mjs';

test('首字母小写：开头是缩写时整段缩写小写', () => {
  assert.equal(lowerFirst('Automatic'), 'automatic');
  assert.equal(lowerFirst('URL'), 'url');
  assert.equal(lowerFirst('URLOnly'), 'urlOnly');
  assert.equal(lowerFirst('ASCIICapable'), 'asciiCapable');
  assert.equal(lowerFirst('EmailAddress'), 'emailAddress');
  assert.equal(lowerFirst('X'), 'x');
  assert.equal(lowerFirst('3D'), '3D');
});

test('枚举：去掉类型前缀、首字母小写', () => {
  const out = enumValues({ name: 'SampleMode', constants: [
    { name: 'SampleModeAutomatic', value: '0' }, { name: 'SampleModeURLOnly', value: '1' }] });
  assert.deepEqual(out.values.map((v) => v.js), ['automatic', 'urlOnly']);
  assert.equal(out.prefixIsTypeName, true);
});

test('枚举：一个数值两个名字，先声明的是主名，后面的是别名', () => {
  const out = enumValues({ name: 'SampleMode', constants: [
    { name: 'SampleModeAutomatic', value: '0' }, { name: 'SampleModeURLOnly', value: '1' },
    { name: 'SampleModeDefault', value: '0' }] });
  assert.deepEqual(out.values.map((v) => [v.js, v.aliasOf]),
                   [['automatic', null], ['urlOnly', null], ['default', 'automatic']]);
});

// 手写的约定是照 NSLineBreakMode 定的：值是 NSLineBreakByWordWrapping，去掉的是
// 它和类型名共有的那一段（NSLineBreak），得到 byWordWrapping，不是 wordWrapping
test('枚举：值不以类型名开头时，去掉它和类型名共有的那一段（按单词切）', () => {
  const out = enumValues({ name: 'SampleBreakMode', constants: [
    { name: 'SampleBreakByWord', value: '0' }, { name: 'SampleBreakByChar', value: '1' }] });
  assert.equal(out.prefixIsTypeName, false);
  assert.deepEqual(out.values.map((v) => v.js), ['byWord', 'byChar']);
});

test('枚举：类型名是复数时，值用的是单数（UNAuthorizationOptions 的 UNAuthorizationOptionBadge）', () => {
  const out = enumValues({ name: 'SampleOptions', options: true, constants: [
    { name: 'SampleOptionBadge', value: '1' }, { name: 'SampleOptionSound', value: '2' }] });
  assert.deepEqual(out.values.map((v) => v.js), ['badge', 'sound']);
});

test('枚举：每个值各算各的前缀（LABiometryType 里混着 LABiometryNone 这样的旧名字）', () => {
  const out = enumValues({ name: 'SampleKindType', constants: [
    { name: 'SampleKindTypeNone', value: '0' }, { name: 'SampleKindTypeFace', value: '1' },
    { name: 'SampleKindNone', value: '0' }] });
  assert.deepEqual(out.values.map((v) => [v.js, v.aliasOf]), [['none', null], ['face', null], ['none', 'none']]);
});

test('枚举：共有的那一段不能把一个单词切开', () => {
  // Top 和 Type 都以 T 开头，共有的只到 SampleEdge
  const out = enumValues({ name: 'SampleEdgeType', constants: [
    { name: 'SampleEdgeTop', value: '0' }, { name: 'SampleEdgeTrailing', value: '1' }] });
  assert.deepEqual(out.values.map((v) => v.js), ['top', 'trailing']);
});

test('枚举：和类型名只共有框架前缀时，退到各个值之间共有的前缀和后缀', () => {
  // NSAttributedStringKey 的值是 NSFontAttributeName 这样的
  const keys = enumValues({ name: 'NSSampleStringKey', constants: [
    { name: 'NSFontAttributeName', value: null }, { name: 'NSParagraphStyleAttributeName', value: null }] });
  assert.deepEqual(keys.values.map((v) => v.js), ['font', 'paragraphStyle']);
  // CACornerMask 的值是 kCALayerMinXMinYCorner 这样的：和类型名什么都不共有
  const corners = enumValues({ name: 'CASampleMask', constants: [
    { name: 'kCALayerMinXMinYCorner', value: '1' }, { name: 'kCALayerMaxXMinYCorner', value: '2' },
    { name: 'kCALayerMinXMaxYCorner', value: '4' }, { name: 'kCALayerMaxXMaxYCorner', value: '8' }] });
  assert.deepEqual(corners.values.map((v) => v.js), ['minXMinY', 'maxXMinY', 'minXMaxY', 'maxXMaxY']);
  // 后缀也不能把一个单词切开：Linear 和 Cubic 没有共有的后缀
  const modes = enumValues({ name: 'CASampleMode', constants: [
    { name: 'kCAAnimationLinear', value: null }, { name: 'kCAAnimationCubic', value: null }] });
  assert.deepEqual(modes.values.map((v) => v.js), ['linear', 'cubic']);
});

test('枚举：位掩码里数值是 0 的那个标出来（JS 里它是空数组，不是一个名字）', () => {
  const out = enumValues({ name: 'SampleEdge', options: true, constants: [
    { name: 'SampleEdgeNone', value: '0' }, { name: 'SampleEdgeTop', value: '1' }] });
  assert.deepEqual(out.values.map((v) => [v.js, v.zero]), [['none', true], ['top', false]]);
});

test('方法名：selector 的第一段是方法名，其余段是 options 的键', () => {
  assert.deepEqual(methodShape('sizeToFit'), { name: 'sizeToFit', options: [], positional: 0 });
  assert.deepEqual(methodShape('addSubview:'), { name: 'addSubview', options: [], positional: 1 });
  assert.deepEqual(methodShape('insertSubview:atIndex:'),
                   { name: 'insertSubview', options: ['atIndex'], positional: 1 });
  assert.deepEqual(methodShape('setOn:animated:'),
                   { name: 'setOn', options: ['animated'], positional: 1 });
});

test('属性名：getter 是 is 开头的别名时用它', () => {
  assert.equal(propertyName({ name: 'on', getter: 'isOn' }), 'isOn');
  assert.equal(propertyName({ name: 'title', getter: null }), 'title');
  // 别的别名不用（头文件里很少见，用了反而和属性名对不上）
  assert.equal(propertyName({ name: 'count', getter: 'getCount' }), 'count');
});

test('类型归类：机械规则认得出哪一种', () => {
  const ctx = { enums: new Map([['SampleMode', { options: false }], ['SampleEdge', { options: true }]]),
                structs: new Set(['CGPoint']), classes: new Set(['SampleItem', 'NSString']),
                typedefs: new Map([['SampleDistance', 'double'], ['CGRect', 'struct CGRect'],
                                   ['SampleRef', 'struct Sample *'], ['SampleAlias', 'enum SampleMode']]) };
  const kind = (type) => typeKind(type, ctx);
  assert.equal(kind('BOOL'), 'boolean');
  assert.equal(kind('CGFloat'), 'number');
  assert.equal(kind('NSInteger'), 'number');
  assert.equal(kind('NSString *'), 'string');
  assert.equal(kind('UIColor *'), 'color');
  assert.equal(kind('CGColorRef'), 'color');
  assert.equal(kind('SampleMode'), 'enum');
  assert.equal(kind('SampleEdge'), 'options');
  assert.equal(kind('CGPoint'), 'struct');
  assert.equal(kind('SampleItem *'), 'object');
  assert.equal(kind('NSArray<SampleItem *> *'), 'array');
  assert.equal(kind('void (^)(BOOL)'), 'block');
  assert.equal(kind('void'), 'void');
  assert.equal(kind('id<SampleDelegate>'), 'delegate');
  assert.equal(kind('id'), 'unmapped');
  assert.equal(kind('CGPoint *'), 'unmapped');
  assert.equal(kind('SomethingElse *'), 'unmapped');
  // 起了别名的类型按它本来的类型算
  assert.equal(kind('SampleDistance'), 'number');
  assert.equal(kind('CGRect'), 'struct');
  assert.equal(kind('SampleAlias'), 'enum');
  assert.equal(kind('SampleRef'), 'unmapped');
  // 最后一个参数是 NSError ** 的方法，出错在 JS 里是抛异常
  assert.equal(kind('NSError **'), 'errorOut');
});
