// 文件读写
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const { defineNativeClass, nativeCallAsync, nativeGet, nativeOnly } = ctx;

  // ---------- 文件读写 ----------
  //
  // 全是 Promise。不是因为「异步一律 Promise」那条原则，而是因为 **JS 跑在
  // 主线程**：同步读一个文件会直接卡住 UI。上面的 storage 能同步，是因为
  // UserDefaults 是内存缓存。
  //
  // 这个类的名字不是 ObjC 类名：「读写文件」这个能力在 iOS 里散在
  // NSFileManager / NSData / NSString 三个类上，没有一个原生对象能直接当它
  // 用，所以上层这个对象是我们自己的。底下接的是 NSFileManager.defaultManager。
  function filePath(value, what) {
    if (typeof value !== 'string' || value === '') {
      throw new TypeError(what + ': path must be a non-empty string');
    }
    return value;
  }

  defineNativeClass('FileSystem', class FileSystem extends NSObject {
    constructor() { nativeOnly(new.target); }

    // 四个目录常量，绝对路径。拼接由 JS 自己做——那是纯字符串运算
    /** 会被备份，用户数据放这里 */
    get documents() { return nativeGet(this, 'documents'); }
    /** 系统空间紧张时**会被清掉** */
    get caches() { return nativeGet(this, 'caches'); }
    /** 会被备份，App 自己的数据放这里 */
    get applicationSupport() { return nativeGet(this, 'applicationSupport'); }
    /** 系统随时删 */
    get temporary() { return nativeGet(this, 'temporary'); }

    readText(path) {
      return nativeCallAsync(this, 'readText', [filePath(path, 'readText')]);
    }
    readBytes(path) {
      return nativeCallAsync(this, 'readBytes', [filePath(path, 'readBytes')]);
    }
    writeText(path, text) {
      const p = filePath(path, 'writeText');
      if (typeof text !== 'string') {
        throw new TypeError('writeText: the second argument must be a string');
      }
      return nativeCallAsync(this, 'writeText', [p, text]).then(() => undefined);
    }
    /** 第二个参数收 Blob。要写 ArrayBuffer 就先 new Blob([buffer]) */
    writeBytes(path, blob) {
      const p = filePath(path, 'writeBytes');
      if (!(blob instanceof Blob)) {
        throw new TypeError('writeBytes: the second argument must be a Blob');
      }
      return nativeCallAsync(this, 'writeBytes', [p, blob]).then(() => undefined);
    }
    exists(path) {
      return nativeCallAsync(this, 'exists', [filePath(path, 'exists')]);
    }
    /** 目录连同里面的东西一起删 */
    remove(path) {
      return nativeCallAsync(this, 'remove', [filePath(path, 'remove')]).then(() => undefined);
    }
    /** 中间层自动建，已经存在不报错 */
    makeDirectory(path) {
      return nativeCallAsync(this, 'makeDirectory', [filePath(path, 'makeDirectory')])
        .then(() => undefined);
    }
    /** 只有名字，不含路径 */
    readDirectory(path) {
      return nativeCallAsync(this, 'readDirectory', [filePath(path, 'readDirectory')]);
    }
    /** { size, isDirectory, modified }，modified 是毫秒时间戳 */
    stat(path) {
      return nativeCallAsync(this, 'stat', [filePath(path, 'stat')]);
    }
    move(from, to) {
      return nativeCallAsync(this, 'move', [filePath(from, 'move'), filePath(to, 'move')])
        .then(() => undefined);
    }
    copy(from, to) {
      return nativeCallAsync(this, 'copy', [filePath(from, 'copy'), filePath(to, 'copy')])
        .then(() => undefined);
    }
  });


  // 这个 part 对外提供的东西
  Object.assign(ctx, { filePath });
})
