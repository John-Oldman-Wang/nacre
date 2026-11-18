// 提取器的用例：真的调一次 clang，解析 fixtures/Sample.h，核对提取出来的描述。
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { before, test } from 'node:test';
import { extract } from '../extract.mjs';

const HEADER = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'Sample.h');
let api;
before(async () => {
  api = await extract({ framework: 'Sample', source: HEADER, owns: (file) => file === HEADER });
});
const cls = (name) => api.classes.find((c) => c.name === name);
const prop = (c, name) => cls(c).properties.find((p) => p.name === name);
const method = (c, selector) => cls(c).methods.find((m) => m.selector === selector);

test('类：名字、父类，声明的先后照头文件', () => {
  assert.deepEqual(api.classes.map((c) => [c.name, c.super]),
                   [['NSObject', null], ['NSString', 'NSObject'], ['SampleView', 'NSObject'],
                    ['SampleItem', 'NSObject'], ['SampleWell', 'SampleItem']]);
  assert.equal(api.framework, 'Sample');
});

test('属性：读写、所有权、可空、getter 的别名、类属性', () => {
  assert.deepEqual(prop('SampleView', 'on'),
    { name: 'on', getter: 'isOn', type: 'BOOL', nullable: null, readonly: false, ownership: 'assign',
      static: false, deprecated: false, unavailable: false });
  assert.equal(prop('SampleView', 'mode').readonly, true);
  assert.equal(prop('SampleView', 'mode').type, 'SampleMode');
  assert.deepEqual([prop('SampleView', 'title').ownership, prop('SampleView', 'title').nullable,
                    prop('SampleView', 'title').type], ['copy', true, 'NSString *']);
  assert.deepEqual([prop('SampleView', 'delegate').ownership, prop('SampleView', 'delegate').type],
                   ['weak', 'id<SampleDelegate>']);
  assert.deepEqual([prop('SampleView', 'item').ownership, prop('SampleView', 'item').nullable],
                   ['strong', false]);
  assert.deepEqual([prop('SampleView', 'sharedView').static, prop('SampleView', 'sharedView').readonly],
                   [true, true]);
  assert.equal(prop('SampleView', 'legacyValue').deprecated, true);
});

test('方法：selector、参数的名字和类型、返回值、类方法；属性自带的读写方法不算', () => {
  assert.deepEqual(method('SampleView', 'insertItem:atIndex:'),
    { selector: 'insertItem:atIndex:', static: false,
      returns: { type: 'void', nullable: null },
      params: [{ name: 'item', type: 'SampleItem *', nullable: false },
               { name: 'index', type: 'NSInteger', nullable: null }],
      deprecated: false, unavailable: false, designated: false });
  assert.deepEqual(method('SampleView', 'itemAtIndex:').returns, { type: 'SampleItem *', nullable: true });
  assert.equal(method('SampleView', 'instanceCount').static, true);
  assert.equal(method('SampleView', 'viewWithName:').static, true);
  assert.equal(method('SampleView', 'initWithFrame:').designated, true);
  assert.equal(method('SampleView', 'oldMethod').deprecated, true);
  assert.equal(method('SampleView', 'forbidden').unavailable, true);
  assert.equal(method('SampleView', 'loadWithCompletionHandler:').params[0].type, 'void (^)(BOOL)');
  for (const implicit of ['isOn', 'setOn:', 'title', 'setTitle:', 'sharedView']) {
    assert.equal(method('SampleView', implicit), undefined, implicit + ' 是属性自带的，不该列成方法');
  }
});

test('同一个框架里给自己的类写的分类：并进那个类', () => {
  assert.equal(prop('SampleView', 'width').readonly, true);
  assert.ok(method('SampleView', 'sizeToFit'));
});

test('给别的框架的类写的分类：单独列，不并进类', () => {
  // 用例里 NSString 也在这个头文件里，所以拿 owns 再提一遍，把 NSString 当成别人的
  assert.equal(method('NSString', 'sampleLength') !== undefined, true);
});

test('枚举：值、数值、是不是位掩码、别名的数值算得出来', () => {
  const mode = api.enums.find((e) => e.name === 'SampleMode');
  assert.equal(mode.options, false);
  assert.deepEqual(mode.constants, [
    { name: 'SampleModeAutomatic', value: '0' }, { name: 'SampleModeURLOnly', value: '1' },
    { name: 'SampleModeDefault', value: '0' }]);
  const edge = api.enums.find((e) => e.name === 'SampleEdge');
  assert.equal(edge.options, true);
  assert.deepEqual(edge.constants.map((c) => c.value), ['0', '1', '2', '3']);
  assert.equal(api.enums.length, 5, '前向声明不该各算一个');
});

test('协议：方法和哪些是可选的', () => {
  const delegate = api.protocols.find((p) => p.name === 'SampleDelegate');
  assert.deepEqual(delegate.methods.map((m) => [m.selector, m.optional]),
                   [['sampleViewDidChange:', false], ['sampleViewShouldClose:', true]]);
  assert.equal(api.protocols.length, 2, '前向声明不该各算一个');
});

test('结构体、C 函数、字符串常量当枚举用的那一类', () => {
  assert.deepEqual(api.structs.find((s) => s.name === 'CGPoint').fields,
                   [{ name: 'x', type: 'CGFloat' }, { name: 'y', type: 'CGFloat' }]);
  const fn = api.functions.find((f) => f.name === 'SamplePointMake');
  assert.deepEqual([fn.returns.type, fn.params.map((p) => p.name)], ['CGPoint', ['x', 'y']]);
  assert.deepEqual(api.typedStrings.find((t) => t.name === 'SampleStyleName').constants,
                   ['SampleStyleNamePlain', 'SampleStyleNameFancy']);
  // 常量的类型不带 const：别的框架的常量要靠类型名归到它那个类型下面
  assert.deepEqual(api.constants.find((c) => c.name === 'SampleStyleNamePlain'),
                   { name: 'SampleStyleNamePlain', type: 'SampleStyleName' });
});

test('起了别名的类型：记下它本来是什么', () => {
  assert.equal(api.typedefs.CGFloat, 'double');
  assert.equal(api.typedefs.CGPoint, 'struct CGPoint');
  assert.equal(api.typedefs.SampleMode, 'enum SampleMode');
});

test('哪个系统版本才有：标了的记下来，没标的不带这个字段', () => {
  assert.equal(prop('SampleWell', 'futureValue').introduced, '99.0');
  assert.equal('introduced' in prop('SampleWell', 'radius'), false);
});

test('枚举里单个值标了废弃的', () => {
  const kind = api.enums.find((e) => e.name === 'SampleKind');
  assert.deepEqual(kind.constants, [
    { name: 'SampleKindNew', value: '0' },
    { name: 'SampleKindOld', value: '1', deprecated: true },
    { name: 'SampleKindLast', value: '2' },
    { name: 'SampleKindGone', value: '3', unavailable: true }]);
});

test('只收归这个框架的文件里的声明', async () => {
  const none = await extract({ framework: 'Other', source: HEADER, owns: () => false });
  assert.deepEqual([none.classes.length, none.enums.length, none.functions.length], [0, 0, 0]);
});

test('分类加在不归这个框架的类上：进 categories', async () => {
  // 把「归我管」收窄到分类之后的那几行，模拟 NSString 是别的框架的
  // 偏移是字节数，所以按字节找
  const from = (await import('node:fs')).readFileSync(HEADER).indexOf('@interface NSString (SampleAdditions)');
  const only = await extract({ framework: 'Sample', source: HEADER,
                               owns: (file, offset) => file === HEADER && offset >= from });
  assert.deepEqual(only.categories.map((c) => [c.class, c.name, c.methods.map((m) => m.selector)]),
                   [['NSString', 'SampleAdditions', ['sampleLength']]]);
});
