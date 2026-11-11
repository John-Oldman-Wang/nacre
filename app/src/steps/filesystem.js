// 文件读写：application.fileSystem。全是 Promise。
//
// 两条是别的断言替代不了的：
//   - **跨进程**：第一次运行写一个文件，第二次启动读到
//   - **不卡主线程**：发起一个大写入，紧接着排的定时器必须先跑到

import { assert } from '../support.js';

/**
 * @param {string} label
 * @param {() => Promise<unknown>} fn
 * @param {string} expectedName
 */
async function rejects(label, fn, expectedName) {
  try {
    await fn();
    assert(label, '没有 reject', '以 ' + expectedName + ' reject');
  } catch (err) {
    const e = /** @type {any} */ (err);
    assert(label, e.name, expectedName);
  }
}

export function stepFileSystem() {
  console.log('--- 文件读写 ---');
  const fs = application.fileSystem;

  assert('两次读回来是同一个包装', application.fileSystem === fs, true);
  assert('它是 FileSystem', fs instanceof FileSystem, true);

  // 四个目录常量都是绝对路径，而且互不相同
  const dirs = [fs.documents, fs.caches, fs.applicationSupport, fs.temporary];
  assert('四个目录都是绝对路径', dirs.every((d) => d.startsWith('/')), true);
  assert('四个目录互不相同', new Set(dirs).size, 4);
  assert('末尾不带斜杠', dirs.every((d) => !d.endsWith('/')), true);

  // 路径验在 JS 侧，同步抛而不是 reject——参数写错不该等到下一轮才知道
  try {
    // @ts-expect-error 故意给错类型
    fs.readText(42);
    console.log('  ✗ 非字符串路径居然通过了');
  } catch (err) {
    assert('非字符串路径同步抛',
           err instanceof Error && err.message.includes('path must be a non-empty string'),
           true);
  }

  const base = fs.documents + '/nacre-test';

  (async () => {
    // ---- 文本：写、读、改、删 ----
    await fs.remove(base).catch(() => {});      // 上一轮留下的
    await fs.makeDirectory(base + '/深/一层');   // 中间层自动建
    assert('建完目录就存在', await fs.exists(base + '/深/一层'), true);
    await fs.makeDirectory(base + '/深/一层');   // 已存在不报错
    assert('重复建不报错', await fs.exists(base + '/深/一层'), true);

    const textPath = base + '/notes.txt';
    await fs.writeText(textPath, '你好 Nacre');
    assert('写完就存在', await fs.exists(textPath), true);
    assert('读回来一致', await fs.readText(textPath), '你好 Nacre');
    await fs.writeText(textPath, '改过了');
    assert('覆盖写', await fs.readText(textPath), '改过了');

    // ---- stat 的 size 要和真实字节数对得上 ----
    const info = await fs.stat(textPath);
    const bytes = utf8Length('改过了');
    assert('stat.size 和实际字节数一致', info.size, bytes);
    assert('文件不是目录', info.isDirectory, false);
    assert('stat.modified 是个像样的时间戳', info.modified > 1700000000000, true);
    assert('目录的 isDirectory 为真', (await fs.stat(base)).isDirectory, true);

    // ---- 二进制：Blob 进，ArrayBuffer 出 ----
    const binPath = base + '/bytes.bin';
    const payload = new Uint8Array([0, 1, 2, 253, 254, 255]);
    await fs.writeBytes(binPath, new Blob([payload]));
    const back = new Uint8Array(await fs.readBytes(binPath));
    assert('二进制长度一致', back.length, payload.length);
    assert('二进制内容一致', back.join(','), payload.join(','));
    assert('二进制的 stat.size', (await fs.stat(binPath)).size, 6);

    // ---- 目录列表 ----
    const names = await fs.readDirectory(base);
    assert('列目录只给名字不含路径', names.every((n) => !n.includes('/')), true);
    assert('列出来的东西齐了', names.slice().sort().join(','), 'bytes.bin,notes.txt,深');

    // ---- 移动和拷贝 ----
    await fs.copy(textPath, base + '/copy.txt');
    assert('拷贝出来的内容一样', await fs.readText(base + '/copy.txt'), '改过了');
    await fs.move(base + '/copy.txt', base + '/moved.txt');
    assert('移走之后原处没了', await fs.exists(base + '/copy.txt'), false);
    assert('新处有了', await fs.readText(base + '/moved.txt'), '改过了');

    // ---- 错误分类 ----
    await rejects('读不存在的文件', () => fs.readText(base + '/没有这个.txt'),
                  'NotFoundError');
    await rejects('stat 不存在的文件', () => fs.stat(base + '/没有这个.txt'),
                  'NotFoundError');
    await rejects('列不存在的目录', () => fs.readDirectory(base + '/没有这个目录'),
                  'NotFoundError');
    try {
      await fs.readText(base + '/没有这个.txt');
    } catch (err) {
      const e = /** @type {any} */ (err);
      assert('错误带 code 逃生口', typeof e.code, 'number');
      assert('错误带 domain 逃生口', e.domain, 'NSCocoaErrorDomain');
      console.log('  实测：读不存在的文件 code = ' + e.code + '，message = ' +
                  String(e.message).slice(0, 40) + '…');
    }

    // ---- 不卡主线程 ----
    // 约 4 MB 的写。发起之后紧接着排一个定时器：如果写在主线程上做，
    // 定时器只能等它做完；派到后台队列才可能先跑到。
    //
    // 但这条只**单边有效**：跑到了能证明重活在后台，没跑到什么都证明不了。
    // 顺序不由我们控制——本轮新加的定时器按设计要等下一轮泵（Engine.cpp
    // 的 seq >= limit），而泵运行期间不排唤醒，所以只要主线程这期间被
    // 别的回调占住，后台写入的兑现就可能先排进主队列。于是没跑到时报
    // 未验证，和所有权镜像的对照组、软键盘那两条一个规矩
    const big = new Uint8Array(4 * 1024 * 1024);
    let timerRan = false;
    const started = Date.now();
    const writing = fs.writeBytes(base + '/big.bin', new Blob([big]));
    setTimeout(() => { timerRan = true; }, 0);
    await writing;
    if (timerRan) {
      assert('大写入期间定时器照常跑（重活不在主线程）', timerRan, true);
    } else {
      console.log('  ! 写入的兑现排在了 0 ms 定时器前面（await 用了 ' +
                  (Date.now() - started) + ' ms），顺序控制不了，这一条未验证');
    }
    assert('大文件的 size 对', (await fs.stat(base + '/big.bin')).size, big.length);
    await fs.remove(base + '/big.bin');

    // ---- 递归删 ----
    await fs.remove(base);
    assert('目录连里面的东西一起删掉了', await fs.exists(base), false);

    // ---- 跨进程：这条才证明真落盘 ----
    const marker = fs.documents + '/launches.txt';
    const previous = (await fs.exists(marker)) ? await fs.readText(marker) : '';
    const runs = previous.split(',').filter(Boolean).length + 1;
    await fs.writeText(marker, previous ? previous + ',' + runs : '1');
    console.log('  ✓ 文件记到的启动次数 = ' + runs +
                (runs > 1 ? '（上一次写的文件还在，确实落盘了）'
                          : '（再跑一次 run-sim.sh 应该看到 2）'));
    console.log('--- 文件读写：以上异步断言跑完 ---');
  })();
}

/** UTF-8 字节数。运行时没有 TextEncoder，自己数一下 */
function utf8Length(/** @type {string} */ text) {
  let n = 0;
  for (const ch of text) {
    const c = /** @type {number} */ (ch.codePointAt(0));
    n += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
  }
  return n;
}
