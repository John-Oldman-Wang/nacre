// 拷自 acceptance/src/steps/errors.js，去掉了 NSError 那一段和读不存在的文件那条走到原生的路。
//
// 错误的类：DOMException（核心，两端共用，照 Web IDL）。
//
// 规矩：参数类型不对抛 TypeError，超出范围抛 RangeError；出错的含义 Web 上有的抛
// DOMException，名字用 Web 的。
// 各能力具体抛什么，在各自的步骤里测；这里只测这个类本身

// Web 的老数字码，照 Web IDL 的表
const LEGACY_CODES = {
  IndexSizeError: 1, HierarchyRequestError: 3, WrongDocumentError: 4, InvalidCharacterError: 5,
  NoModificationAllowedError: 7, NotFoundError: 8, NotSupportedError: 9, InUseAttributeError: 10,
  InvalidStateError: 11, SyntaxError: 12, InvalidModificationError: 13, NamespaceError: 14,
  InvalidAccessError: 15, TypeMismatchError: 17, SecurityError: 18, NetworkError: 19,
  AbortError: 20, URLMismatchError: 21, QuotaExceededError: 22, TimeoutError: 23,
  InvalidNodeTypeError: 24, DataCloneError: 25,
  // 没有老数字码的是 0
  NotAllowedError: 0, OperationError: 0, NotReadableError: 0, EncodingError: 0, Error: 0,
};

const CONSTANTS = {
  INDEX_SIZE_ERR: 1, DOMSTRING_SIZE_ERR: 2, HIERARCHY_REQUEST_ERR: 3, WRONG_DOCUMENT_ERR: 4,
  INVALID_CHARACTER_ERR: 5, NO_DATA_ALLOWED_ERR: 6, NO_MODIFICATION_ALLOWED_ERR: 7,
  NOT_FOUND_ERR: 8, NOT_SUPPORTED_ERR: 9, INUSE_ATTRIBUTE_ERR: 10, INVALID_STATE_ERR: 11,
  SYNTAX_ERR: 12, INVALID_MODIFICATION_ERR: 13, NAMESPACE_ERR: 14, INVALID_ACCESS_ERR: 15,
  VALIDATION_ERR: 16, TYPE_MISMATCH_ERR: 17, SECURITY_ERR: 18, NETWORK_ERR: 19, ABORT_ERR: 20,
  URL_MISMATCH_ERR: 21, QUOTA_EXCEEDED_ERR: 22, TIMEOUT_ERR: 23, INVALID_NODE_TYPE_ERR: 24,
  DATA_CLONE_ERR: 25,
};

/** @param {() => unknown} fn */
function thrown(fn) {
  try {
    fn();
    return '没抛';
  } catch (err) {
    return err instanceof Error ? err.name : String(err);
  }
}

/** @param {import("../main.js").StepContext} ctx */
export function stepErrors(ctx) {
  const { assert } = ctx;
  console.log('--- 错误的类：DOMException ---');

  // ---- DOMException：全局上有，接在 Error 上 ----
  assert('DOMException：全局上有这个类', typeof DOMException, 'function');
  if (typeof DOMException !== 'function') return;
  assert('DOMException：原型接在 Error.prototype 上',
         Object.getPrototypeOf(DOMException.prototype), Error.prototype);
  assert('DOMException：不带 new 调用抛 TypeError',
         // @ts-expect-error 故意不带 new
         thrown(() => DOMException('x')), 'TypeError');

  // ---- 构造 ----
  const plain = new DOMException();
  assert('DOMException：不带参数，message 是空串', plain.message, '');
  assert('DOMException：不带参数，name 是 Error', plain.name, 'Error');
  assert('DOMException：不带参数，code 是 0', plain.code, 0);
  const aborted = new DOMException('stopped', 'AbortError');
  assert('DOMException：message', aborted.message, 'stopped');
  assert('DOMException：name', aborted.name, 'AbortError');
  assert('DOMException：是 Error 的实例', aborted instanceof Error, true);
  assert('DOMException：是 DOMException 的实例', aborted instanceof DOMException, true);
  assert('DOMException：toString 是「名字: 信息」', String(aborted), 'AbortError: stopped');
  assert('DOMException：Object.prototype.toString 认得出',
         Object.prototype.toString.call(aborted), '[object DOMException]');
  assert('DOMException：有调用栈', typeof aborted.stack, 'string');
  // 参数照我们的转换规则：不可空的字符串，null 和 undefined 给空串
  assert('DOMException：message 传 null 给空串', new DOMException(/** @type {any} */ (null)).message, '');
  assert('DOMException：message 传数按字符串转', new DOMException(/** @type {any} */ (5)).message, '5');
  assert('DOMException：name 传 undefined 是 Error', new DOMException('m', undefined).name, 'Error');
  assert('DOMException：不认识的名字照收', new DOMException('m', 'MyError').name, 'MyError');
  assert('DOMException：不认识的名字 code 是 0', new DOMException('m', 'MyError').code, 0);

  // ---- 老数字码 ----
  const wrongCodes = Object.entries(LEGACY_CODES)
    .filter(([name, code]) => new DOMException('', name).code !== code)
    .map(([name]) => name);
  assert('DOMException：每个名字的老数字码照 Web IDL 的表', wrongCodes.join(', '), '');
  const wrongConstants = Object.entries(CONSTANTS)
    .filter(([key, value]) => /** @type {any} */ (DOMException)[key] !== value ||
                              /** @type {any} */ (aborted)[key] !== value)
    .map(([key]) => key);
  assert('DOMException：25 个常量在类上和实例上都有', wrongConstants.join(', '), '');

  // ---- 三个字段是原型上的只读 getter ----
  assert('DOMException：name 在原型上',
         typeof Object.getOwnPropertyDescriptor(DOMException.prototype, 'name')?.get, 'function');
  assert('DOMException：实例自己没有 name', Object.prototype.hasOwnProperty.call(aborted, 'name'), false);
  assert('DOMException：写 name 抛 TypeError',
         thrown(() => { /** @type {any} */ (aborted).name = 'X'; }), 'TypeError');
  assert('DOMException：写 message 抛 TypeError',
         thrown(() => { /** @type {any} */ (aborted).message = 'X'; }), 'TypeError');
  assert('DOMException：写 code 抛 TypeError',
         thrown(() => { /** @type {any} */ (aborted).code = 1; }), 'TypeError');
  assert('DOMException：写完值没变', aborted.name + ' ' + aborted.message + ' ' + aborted.code,
         'AbortError stopped 20');

  // ---- 可以继承（Web 上可以） ----
  class AppError extends DOMException {
    constructor() { super('app', 'NotAllowedError'); }
  }
  const sub = new AppError();
  assert('DOMException：子类 instanceof DOMException', sub instanceof DOMException, true);
  assert('DOMException：子类的 name', sub.name, 'NotAllowedError');

  // ---- 运行时自己抛的：structuredClone 克隆不了函数 ----
  let cloneError = null;
  try {
    structuredClone(() => 1);
  } catch (err) {
    cloneError = err;
  }
  assert('运行时抛的 DataCloneError 是 DOMException', cloneError instanceof DOMException, true);
  assert('运行时抛的 DataCloneError：code 是 25', cloneError && /** @type {any} */ (cloneError).code, 25);
}
