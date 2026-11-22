// DOMException，和运行时建错误的唯一入口 ctx.makeError。
//
// 报错的规矩：参数类型不对是 TypeError，超出范围是 RangeError；出错的含义 Web
// 上有名字的是 DOMException（名字用 Web 的）；含义是平台特有的，交给平台建
// （iOS 上是 NSError）。原生拒绝 Promise、原生同步报错、内置脚本自己报错，
// 都从 ctx.makeError 走，同一个名字在哪条路上出来都是同一个类。
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const { define, native } = ctx;

  // Web IDL 的错误名字表：名字 → 老数字码。没有老数字码的是 0。
  // 只有这张表里的名字建成 DOMException；别的名字是平台的事
  const NAMES = new Map([
    ['IndexSizeError', 1], ['HierarchyRequestError', 3], ['WrongDocumentError', 4],
    ['InvalidCharacterError', 5], ['NoModificationAllowedError', 7], ['NotFoundError', 8],
    ['NotSupportedError', 9], ['InUseAttributeError', 10], ['InvalidStateError', 11],
    ['SyntaxError', 12], ['InvalidModificationError', 13], ['NamespaceError', 14],
    ['InvalidAccessError', 15], ['TypeMismatchError', 17], ['SecurityError', 18],
    ['NetworkError', 19], ['AbortError', 20], ['URLMismatchError', 21],
    ['QuotaExceededError', 22], ['TimeoutError', 23], ['InvalidNodeTypeError', 24],
    ['DataCloneError', 25], ['EncodingError', 0], ['NotReadableError', 0],
    ['UnknownError', 0], ['ConstraintError', 0], ['DataError', 0],
    ['TransactionInactiveError', 0], ['ReadOnlyError', 0], ['VersionError', 0],
    ['OperationError', 0], ['NotAllowedError', 0], ['OptOutError', 0],
  ]);

  const CONSTANTS = [
    ['INDEX_SIZE_ERR', 1], ['DOMSTRING_SIZE_ERR', 2], ['HIERARCHY_REQUEST_ERR', 3],
    ['WRONG_DOCUMENT_ERR', 4], ['INVALID_CHARACTER_ERR', 5], ['NO_DATA_ALLOWED_ERR', 6],
    ['NO_MODIFICATION_ALLOWED_ERR', 7], ['NOT_FOUND_ERR', 8], ['NOT_SUPPORTED_ERR', 9],
    ['INUSE_ATTRIBUTE_ERR', 10], ['INVALID_STATE_ERR', 11], ['SYNTAX_ERR', 12],
    ['INVALID_MODIFICATION_ERR', 13], ['NAMESPACE_ERR', 14], ['INVALID_ACCESS_ERR', 15],
    ['VALIDATION_ERR', 16], ['TYPE_MISMATCH_ERR', 17], ['SECURITY_ERR', 18],
    ['NETWORK_ERR', 19], ['ABORT_ERR', 20], ['URL_MISMATCH_ERR', 21],
    ['QUOTA_EXCEEDED_ERR', 22], ['TIMEOUT_ERR', 23], ['INVALID_NODE_TYPE_ERR', 24],
    ['DATA_CLONE_ERR', 25],
  ];

  // 不可空的字符串：null 和 undefined 给空串（我们的转换规则，不照搬 Web 的 'null'）
  const text = (value) => (value === undefined || value === null ? '' : String(value));

  class DOMException extends Error {
    #name;
    #message;
    constructor(message, name) {
      super();
      this.#message = text(message);
      this.#name = name === undefined ? 'Error' : text(name);
    }
    get name() { return this.#name; }
    get message() { return this.#message; }
    get code() { return NAMES.get(this.#name) ?? 0; }
  }
  for (const key of ['name', 'message', 'code']) {
    Object.defineProperty(DOMException.prototype, key, {
      ...Object.getOwnPropertyDescriptor(DOMException.prototype, key), enumerable: true,
    });
  }
  // Web IDL 的常量：类上和原型上各一份，只读、可枚举、不可配置
  for (const [key, value] of CONSTANTS) {
    const desc = { value, writable: false, enumerable: true, configurable: false };
    Object.defineProperty(DOMException, key, desc);
    Object.defineProperty(DOMException.prototype, key, desc);
  }
  Object.defineProperty(DOMException.prototype, Symbol.toStringTag, {
    value: 'DOMException', writable: false, enumerable: false, configurable: true,
  });

  // 建一个错误。detail 是原生给的原值（{ domain, code }），没有就不带。
  //   TypeError / RangeError → 那两个类
  //   Web IDL 表里的名字     → DOMException，原值建成平台的错误挂在 cause 上
  //   别的名字               → 平台建（ctx.makePlatformError）；平台没给就是 Error 加 name
  function makeError(name, message, detail) {
    const msg = text(message);
    if (name === 'TypeError') return new TypeError(msg);
    if (name === 'RangeError') return new RangeError(msg);
    const hasDetail = detail !== null && typeof detail === 'object' &&
                      typeof detail.domain === 'string' && detail.domain !== '';
    if (NAMES.has(name)) {
      const error = new DOMException(msg, name);
      if (hasDetail && typeof ctx.makePlatformError === 'function') {
        define(error, 'cause', ctx.makePlatformError(undefined, msg, detail));
      }
      return error;
    }
    if (typeof ctx.makePlatformError === 'function') {
      return ctx.makePlatformError(name, msg, detail);
    }
    const error = new Error(msg);
    if (typeof name === 'string' && name !== '' && name !== 'Error') define(error, 'name', name);
    return error;
  }

  ctx.DOMException = DOMException;
  ctx.makeError = makeError;
  // 原生拒绝 Promise、原生同步报错时，引擎调这个函数建错误
  native.setErrorFactory((name, message, detail) => makeError(name, message, detail));
  define(globalThis, 'DOMException', DOMException);
});
