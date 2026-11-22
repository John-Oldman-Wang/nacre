// 事件类：一种字段组合是一个类（2026-11-22 定）。
//
// 和 Web 一样：MouseEvent 有 clientX，KeyboardEvent 没有。带字段的事件都是真的类：
//   new XxxEvent(type, init)  字段从 init 里取，没给的取默认值；cancelable 也从 init 里来
//   字段是原型上的 getter，实例自己没有；只读的写了抛 TypeError（严格模式）
//   少数「系统当场要一个值」的字段可写（滚动松手时停在哪）
//
// 这里放两样：定义事件类的助手 ctx.defineEventClass（平台的事件类也用它），和 Web
// 标准的五个：CustomEvent、MessageEvent、CloseEvent、ErrorEvent、PromiseRejectionEvent。
// 原生发事件时带着类名，运行时在 ctx.eventClasses 里按名字找到类、new 出来。
//
// 这是内置脚本的一个 part：整个文件就是一个函数表达式，运行时按文件名
// 顺序编译执行，拿到函数之后用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const { Event, define } = ctx;

  // 字段的值存在实例上这个 Symbol 下面（不可枚举），getter 从这里读
  const kFields = Symbol('eventFields');
  const eventClasses = new Map();

  // ---- 字段的类型：init 里的值照 Web IDL 转换（和别处的 API 一样，规矩见项目说明的
  // 「API 层宽松接收」那条） ----
  //   'number'      Number() 转，转不出有限数抛 TypeError
  //   'integer'     同上，再向零取整
  //   'boolean'     Boolean()
  //   'string'      String()，null 给空串
  //   'string?'     String()，null 是 null
  //   'array'       能迭代的转成数组，别的抛；'frozenArray' 再冻结
  //   'any'         原样
  //   结构体名?     CGPoint / CGRect / CGSize / NSRange：给结构体或者字段齐的普通对象（字段照结构体的
  //                 转换规则转）；末尾带 ? 的可以是 null
  //   别的类名?     原生对象和运行时的类（UIViewController、NSError……）：不转，不是那个类抛
  //                 TypeError；末尾带 ? 的可以是 null。类按名字在全局上找，用到时才找
  const STRUCT_FIELDS = {
    CGPoint: ['x', 'y'], CGSize: ['width', 'height'],
    CGRect: ['x', 'y', 'width', 'height'], NSRange: ['location', 'length'],
  };
  function describe(value) {
    if (value === null) return 'null';
    if (typeof value === 'string') return '"' + value + '"';
    if (typeof value === 'object') return value.constructor ? 'a ' + value.constructor.name : 'an object';
    return String(value);
  }
  function convertField(className, key, type, value) {
    const what = className + ': init.' + key;
    const nullable = type.endsWith('?');
    const base = nullable ? type.slice(0, -1) : type;
    if (value === null && nullable && base !== 'string') return null;
    switch (base) {
      case 'any': return value;
      case 'boolean': return Boolean(value);
      case 'string':
        if (value === null) return nullable ? null : '';
        return String(value);
      case 'number':
      case 'integer': {
        const n = Number(value);
        if (!Number.isFinite(n)) throw new TypeError(what + ' must be a finite number, got ' + describe(value));
        return base === 'integer' ? Math.trunc(n) + 0 : n;
      }
      case 'array':
      case 'frozenArray': {
        if (value === null || typeof value !== 'object' || typeof value[Symbol.iterator] !== 'function') {
          throw new TypeError(what + ' must be an array, got ' + describe(value));
        }
        const array = Array.from(value);
        return base === 'frozenArray' ? Object.freeze(array) : array;
      }
      default: {
        const Cls = globalThis[base];
        if (typeof Cls === 'function' && value instanceof Cls) return value;
        const fields = STRUCT_FIELDS[base];
        if (fields !== undefined && value !== null && typeof value === 'object' &&
            fields.every((f) => f in value)) {
          return new Cls(...fields.map((f) => value[f]));
        }
        throw new TypeError(what + ' must be ' + (nullable ? 'null or ' : '') + 'a ' + base +
                            ', got ' + describe(value));
      }
    }
  }

  /**
   * 定义一个事件类，挂上全局，登记进 ctx.eventClasses。
   * @param {string} name 类名
   * @param {Function} Parent 父类（Event 或者另一个事件类）
   * @param {Record<string, [string, unknown]>} fields 这个类自己的字段：[类型, 默认值]。类型见上；
   *   默认值是函数时每次调它取。init 里给 undefined 视为没给
   * @param {{ writable?: string[], check?: (init: Record<string, unknown>) => void }} [options]
   *   writable：可写的字段（写的时候不转，交给读它的原生去核）；check：构造时核 init，
   *   不合要求就抛（必填的字段）
   */
  function defineEventClass(name, Parent, fields, options) {
    const writable = (options && options.writable) || [];
    const check = options && options.check;
    const keys = Object.keys(fields);
    const Cls = {
      [name]: class extends Parent {
        constructor(type, init) {
          if (arguments.length < 1) {
            throw new TypeError("Failed to construct '" + name + "': 1 argument required, but only 0 present.");
          }
          super(type, init);
          const o = init === undefined || init === null ? {} : init;
          if (check) check(o);
          if (!Object.prototype.hasOwnProperty.call(this, kFields)) {
            Object.defineProperty(this, kFields, { value: Object.create(null) });
          }
          const store = this[kFields];
          for (const key of keys) {
            const [fieldType, fallback] = fields[key];
            const given = o[key];
            store[key] = given !== undefined
              ? convertField(name, key, fieldType, given)
              : (typeof fallback === 'function' ? fallback() : fallback);
          }
        }
      },
    }[name];
    for (const key of keys) {
      const get = function () {
        if (this === null || typeof this !== 'object' || !(kFields in this)) {
          throw new TypeError('Illegal invocation');
        }
        return this[kFields][key];
      };
      const desc = { get, enumerable: true, configurable: true };
      if (writable.includes(key)) {
        desc.set = function (value) {
          if (this === null || typeof this !== 'object' || !(kFields in this)) {
            throw new TypeError('Illegal invocation');
          }
          this[kFields][key] = value;
        };
      }
      Object.defineProperty(Cls.prototype, key, desc);
    }
    eventClasses.set(name, Cls);
    define(globalThis, name, Cls);
    return Cls;
  }

  const CustomEvent = defineEventClass('CustomEvent', Event, { detail: ['any', null] });
  const MessageEvent = defineEventClass('MessageEvent', Event, {
    data: ['any', null], origin: ['string', ''], lastEventId: ['string', ''], source: ['any', null],
    ports: ['frozenArray', () => Object.freeze([])],
  });
  const CloseEvent = defineEventClass('CloseEvent', Event, {
    code: ['integer', 0], reason: ['string', ''], wasClean: ['boolean', false],
  });
  const ErrorEvent = defineEventClass('ErrorEvent', Event, {
    message: ['string', ''], filename: ['string', ''], lineno: ['integer', 0], colno: ['integer', 0],
    error: ['any', undefined],
  });
  const PromiseRejectionEvent = defineEventClass('PromiseRejectionEvent', Event, {
    promise: ['any', undefined], reason: ['any', undefined],
  });

  Object.assign(ctx, {
    CloseEvent, CustomEvent, ErrorEvent, MessageEvent, PromiseRejectionEvent,
    defineEventClass, eventClasses,
  });
});
