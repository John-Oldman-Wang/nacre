// 对照的用例：机械规则算出来的和手写的类型定义差在哪。
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { before, test } from 'node:test';
import { extract } from '../extract.mjs';
import { readHandwritten } from '../handwritten.mjs';
import { compare } from '../compare.mjs';

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');
const HEADER = path.join(DIR, 'Sample.h');
let hand;
let result;
before(async () => {
  const api = await extract({ framework: 'Sample', source: HEADER, owns: (file) => file === HEADER });
  hand = readHandwritten([path.join(DIR, 'sample.d.ts')]);
  result = compare([api], hand);
});
const view = () => result.classes.find((c) => c.name === 'SampleView');
const names = (list) => list.map((m) => m.name).sort();

test('读类型定义：类、成员、只读、枚举的可选值', () => {
  const c = hand.classes.get('SampleView');
  assert.equal(c.super, 'NSObject');
  assert.deepEqual([c.properties.get('isOn').readonly, c.properties.get('mode').readonly,
                    c.properties.get('title').readonly, c.properties.get('sharedView').static],
                   [false, true, false, true]);
  assert.deepEqual(c.methods.get('insertItem').options, ['atIndex', 'aboveItem']);
  assert.deepEqual(c.methods.get('setOn').options, ['animated']);
  assert.deepEqual(hand.enums.get('SampleMode'), ['automatic', 'urlOnly']);
});

test('读类型定义：用声明合并加到类上的成员也算这个类的', () => {
  const merged = readHandwritten([path.join(DIR, 'merge.d.ts')]).classes.get('MergedView');
  assert.deepEqual([...merged.properties.keys()].sort(), ['attributedTitle', 'isMerged', 'tint', 'title']);
  assert.deepEqual([merged.properties.get('isMerged').readonly, merged.properties.get('tint').readonly], [true, false]);
  assert.deepEqual([...merged.methods.keys()].sort(), ['reset', 'setAttributedTitle']);
  assert.deepEqual(merged.methods.get('setAttributedTitle').options, ['forState']);
  assert.equal(readHandwritten([path.join(DIR, 'merge.d.ts')]).classes.has('MergedOptions'), false);
});

test('两边都有、名字一样的成员', () => {
  assert.deepEqual(names(view().same.filter((m) => m.kind === 'property')),
                   ['edges', 'isOn', 'mode', 'sharedView', 'title', 'width']);
  assert.deepEqual(names(view().same.filter((m) => m.kind === 'method')),
                   ['insertItem', 'setOn', 'sizeToFit']);
});

test('同名的重载并成一个方法：options 的键是各个 selector 的并集', () => {
  const m = view().same.find((x) => x.name === 'insertItem');
  assert.deepEqual(m.selectors.sort(), ['insertItem:aboveItem:', 'insertItem:atIndex:']);
});

test('名字一样但对不上的：只读不一样', () => {
  assert.deepEqual(view().different.map((d) => [d.name, d.what]),
                   [['origin', 'readonly']]);
});

test('只在手写里有的：分清是改了名，还是头文件里根本没有', () => {
  const only = new Map(view().handOnly.map((m) => [m.name, m]));
  assert.deepEqual([...only.keys()].sort(), ['addEventListener', 'item', 'load']);
  assert.equal(only.get('item').guess, 'itemAtIndex:');
  assert.equal(only.get('load').guess, 'loadWithCompletionHandler:');
  assert.equal(only.get('addEventListener').guess, null);
});

test('只在头文件里有的：还没接的；废弃的和不可用的不算缺口', () => {
  assert.deepEqual(names(view().generatedOnly),
                   ['addMarker', 'delegate', 'instanceCount', 'item', 'markerCountWithScale', 'removeMarker', 'viewWithName']);
  assert.deepEqual(names(view().skipped), ['forbidden', 'legacyValue', 'oldMethod']);
});

// 只有 init… 算构造方法。+viewWithName: 这样造对象的类方法，手写的就是一个静态方法
// （UIButton.buttonWithType、UIBezierPath.bezierPathWithRect），照普通方法对
test('构造方法单独列，不和普通方法混；造对象的类方法是普通的静态方法', () => {
  assert.deepEqual(view().constructors, ['initWithFrame:']);
});

test('枚举：值对得上的、手写多出来的、头文件里有而手写没有的', () => {
  const mode = result.enums.find((e) => e.name === 'SampleMode');
  assert.deepEqual([mode.same.sort(), mode.handOnly, mode.generatedOnly],
                   [['automatic', 'urlOnly'], [], ['default']]);
  const edge = result.enums.find((e) => e.name === 'SampleEdge');
  // none 的数值是 0，在 JS 里是空数组，不算头文件里多出来的名字
  assert.deepEqual([edge.same.sort(), edge.handOnly, edge.generatedOnly.sort()],
                   [['left', 'top'], ['bottom'], ['all']]);
});

test('合计的数字和各类加起来对得上', () => {
  const t = result.totals;
  assert.equal(t.classes, 1);
  assert.equal(t.same, 9);
  assert.equal(t.different, 1);
  assert.equal(t.handOnly, 3);
  assert.equal(t.generatedOnly, 7);
});
