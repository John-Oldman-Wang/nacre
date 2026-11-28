// Nacre 的 JS 引擎封装（纯 C++，只依赖 V8）。
// 线程约定：除 InitializeV8Once 外，所有方法都必须在同一个 JS 线程上调用。
#pragma once

#include <functional>
#include <memory>
#include <string>
#include <vector>

#include "NativeObjectRef.h"

namespace nacre {

// 宿主往 error 里写的那句话默认抛 TypeError。要抛别的类，开头写上这个标记：
//   "\x01RangeError\x01超出范围的说明"、"\x01InvalidStateError\x01……"
// 引擎把名字和说明交给内置脚本建错误（规则见 core/builtin/parts/05-dom-exception.js）
inline constexpr char kNamedErrorMarker = '\x01';

enum class LogLevel { Debug, Log, Info, Warn, Error };

// 引擎需要宿主（iOS 层）提供的能力
struct EngineHost {
  // console.* 的输出
  std::function<void(LogLevel level, const std::string& message)> log;

  // 下面几个是上层 application 的数据源。
  // 它们在 JS 线程上被调用，所以宿主必须事先在主线程把值缓存好，
  // 回调里不能碰 UIKit。
  std::function<std::string()> app_info_json;         // Info.plist，静态，JS 侧缓存
  std::function<std::string()> app_environment_json;  // 实时环境值，每次读取都问

  // JS 发起的能力调用。完成后调 Engine::SettleBool 兑现对应的 Promise
  std::function<void(const std::string& url, int call_id)> open_url;
  std::function<void(bool disabled)> set_idle_timer_disabled;

  // 原生对象的引用计数。JS 包装对象建立时 retain，被 GC 回收时 release。
  // 统一用强引用：弱引用要处理原生对象先死的悬空问题，而强引用最坏只是
  // 数据过期（比如场景已断开），不会崩。
  std::function<void(void* ptr)> retain_native;
  std::function<void(void* ptr)> release_native;

  // 当前已连接的场景
  std::function<std::vector<NativeObjectRef>()> app_scenes;

  // 原生对象的属性读写。值用 JSON 编码，避免为每个属性加一个回调。
  // 宿主内部用一张「类名 + 属性名」的分发表来实现。
  std::function<std::string(void* ptr, const std::string& name)> read_property;
  // 写不进去就往 error 里写一句话（没有这个属性，或者枚举给了个不认识的
  // 名字），引擎据此抛 TypeError——写不进去又不报错是最难查的那种错。
  // 和下面三条调用通道共用同一套约定，见 call_method。
  //
  // warning 是第三种结果：值没写进去，但不算错（枚举属性写了不认识的值）。
  // 宿主填了它，引擎不抛，把这句话作为 setProp 的返回值交给 JS，由内置脚本
  // 打成一条警告。error 和 warning 至多填一个。
  std::function<void(void* ptr, const std::string& name, const std::string& json,
                     std::string* error, std::string* warning)>
      write_property;
  // 属性值本身是原生对象时走这个
  std::function<NativeObjectRef(void* ptr, const std::string& name)> read_object_property;
  std::function<void(void* ptr, const std::string& name, void* value, std::string* error)>
      write_object_property;

  // 由 JS 发起的构造。
  //
  // 两串参数，规则和 call_method 一样：标量在 args_json 里（对象位留 null），
  // 对象按同样的下标放在 args 里。**一开始只有 args**，于是 new 一个要传
  // 数字或字符串的类就做不了——CAMediaTimingFunction、CASpringAnimation 的
  // 感知时长初始化器、WebSocket 的 url 都撞过这堵墙，第三次才补。
  //
  // 宿主必须保证返回的对象活到调用方 retain 为止（ARC 下要 CFAutorelease）。
  std::function<NativeObjectRef(const std::string& class_name,
                                const std::string& args_json,
                                const std::vector<void*>& args, std::string* error)>
      construct_native;
  // 无参无返回值的方法，比如 makeKeyAndVisible
  std::function<void(void* ptr, const std::string& name, std::string* error)>
      call_void_method;

  // 带参数、带返回值的方法。args_json 是 JSON 数组；对象参数在数组里留
  // null，真正的指针按同样的下标放在 arg_ptrs 里。返回值用 JSON 编码，
  // void 方法返回空串。
  //
  // error 是这三条调用通道共用的带外错误出口：宿主往里写一句话，就表示
  // 这次调用的参数不被接受（目前只有枚举名不认识会触发），引擎据此抛
  // TypeError。返回值此时会被丢掉。引擎保证它不是 nullptr。
  //
  // 为什么不靠返回空值表示失败：空值本身是合法答案——fontWithName 找不到
  // 字体、hitTest 没命中，都该返回 null 而不是报错。「没有这个东西」和
  // 「你问错了」必须分得开。
  std::function<std::string(void* ptr, const std::string& name,
                            const std::string& args_json,
                            const std::vector<void*>& arg_ptrs, std::string* error)>
      call_method;
  // 返回值是原生对象的方法，参数规则同上
  std::function<NativeObjectRef(void* ptr, const std::string& name,
                                const std::string& args_json,
                                const std::vector<void*>& arg_ptrs, std::string* error)>
      call_object_method;
  // 属性值是原生对象数组，比如 UIView.subviews
  std::function<std::vector<NativeObjectRef>(void* ptr, const std::string& name)>
      read_object_array_property;
  // 可写的原生对象数组属性，比如 UINavigationController.viewControllers。
  // values 按位置传指针，和 construct_native 的 args 一样
  std::function<void(void* ptr, const std::string& name,
                     const std::vector<void*>& values, std::string* error)>
      write_object_array_property;
  // 返回值是原生对象数组的方法，比如 UIView.constraintsAffectingLayoutForAxis:
  // 参数和 error 规则同 call_method
  std::function<std::vector<NativeObjectRef>(void* ptr, const std::string& name,
                                             const std::string& args_json,
                                             const std::vector<void*>& arg_ptrs,
                                             std::string* error)>
      call_object_array_method;

  // 按对象订阅事件。JS 第一次给某个类型加监听器时打开，最后一个移走时关掉。
  // 和启动时注册的全局观察者是两种模式：那种是「通知本来就是广播」，
  // 这种是「每个对象各自注册」——控件事件必须走这种，touchdraginside
  // 在手指移动时每帧都发，没人听还过桥是白费。
  std::function<void(void* ptr, const std::string& type, bool on, std::string* error)>
      set_event_subscription;

  // 类级属性。没有实例，所以用类名定位，比如 UIColor.whiteColor
  std::function<NativeObjectRef(const std::string& class_name, const std::string& name)>
      read_class_object_property;
  // 带参数的类方法，比如 UIFont.systemFontOfSize(17)。参数和 error 规则同 call_method
  std::function<NativeObjectRef(const std::string& class_name, const std::string& name,
                                const std::string& args_json,
                                const std::vector<void*>& arg_ptrs, std::string* error)>
      call_class_object_method;
  // 返回值不是原生对象的类方法，比如 CATransaction.begin()。返回 JSON，
  // 规则和 call_method 一样。和上面那条分开是因为「返回一个对象」和
  // 「返回一个值或什么都不返回」在桥上是两条不同的编码
  std::function<std::string(const std::string& class_name, const std::string& name,
                            const std::string& args_json,
                            const std::vector<void*>& arg_ptrs, std::string* error)>
      call_class_method;
  // 异步方法，完成后调 Engine::SettleBool。对象参数和 call_method 一样：
  // args_json 里留 null，真正的指针按同样的下标在 arg_ptrs 里
  std::function<void(void* ptr, const std::string& name, const std::string& args_json,
                     const std::vector<void*>& arg_ptrs, int call_id)>
      call_async;

  // 异步读一个原生对象的内容。kind 是 'text' / 'arrayBuffer'。
  // 宿主在后台处理完之后兑现 call_id——UTF-8 解码是 CPU 活，不能在主线程干。
  std::function<void(void* ptr, const std::string& kind, int call_id)>
      read_object_async;
  // 用一段段字节建一个原生对象（Blob），按顺序拼起来。字符串段已经由内置脚本编成
  // UTF-8 字节（23-fetch.js），这里只有字节。长度是 0 的段指针可能是空的。
  std::function<NativeObjectRef(const std::vector<std::pair<const void*, size_t>>& parts,
                                const std::string& type)>
      create_blob;

  // ---- 网络 ----
  // 发起一个请求。options_json 带 method / headers；body 是请求体那个原生
  // 对象（宿主自己的 Blob），没有请求体时是空指针。
  // headers 到达时宿主调 SettleJSON(call_id, ...)，失败时 RejectCall。
  // 返回一个 id，用来取消和读 body。
  std::function<int(const std::string& url, const std::string& options_json,
                    void* body, int call_id)>
      fetch_start;
  // 读某个请求的 body。kind 是 'text' / 'arrayBuffer' / 'blob'，
  // 宿主在 body 下载完（并在后台处理完）之后兑现 call_id。
  // kind 是 'chunk' 时不等下完：有数据就用 SettleBytes 兑现一块（当时攒下的
  // 全部），没有了用 SettleJSON 的 null 兑现，出错用 RejectCall。
  std::function<void(int request_id, const std::string& kind, int call_id)>
      fetch_read_body;
  // 取消。已完成的请求上调用是空操作。
  std::function<void(int request_id)> fetch_cancel;
  // 这个请求的内容不会再有人读了（Response 被回收，或者它的流被取消）：
  // 宿主放掉那份数据，没下完的停掉
  std::function<void(int request_id)> fetch_release;

  // 解析一个 URL。base 为空串表示没有基准——我们没有 location，所以
  // 相对 URL 无依可循，这种情况返回解析失败而不是编一个出来。
  // 成功返回各部分的 JSON，失败返回空串。
  std::function<std::string(const std::string& url, const std::string& base)>
      parse_url;

  // 往一段内存里填密码学强度的随机字节。失败返回 false。
  // 随机源是系统能力，所以归宿主；引擎只管把类型数组的那段字节指给它
  std::function<bool(void* bytes, size_t length)> fill_random;

  // ---- 任务调度 ----
  // 这两条是定时器要用的。调度逻辑（到期堆、排序、预算）全在 Engine 里，
  // 平台层只负责「怎么把自己叫醒」和「怎么排一个任务」——前者各平台的
  // 定时器 API 不同，后者各平台的主队列不同，但堆是通用的。
  //
  // 要求宿主在 delay_ms 之后回调 Engine::FireDueTimers()。每次调用都覆盖
  // 上一次的约定；delay_ms < 0 表示撤销（堆空了，不用再叫了）。
  std::function<void(double delay_ms)> schedule_wakeup;
  // 把一个任务排到宿主队列的尾部。用于未处理拒绝的延后结算——要让它排在
  // 当前已排队的任务之后，补挂的 handler 才来得及抑制上报（对齐 Chromium）。
  std::function<void(std::function<void()>)> post_task;
};

struct Script {
  std::string name;  // 用于报错时显示的文件名，如 "main.js"
  std::string source;
};

class Engine {
 public:
  // 进程级初始化：V8 平台只能初始化一次
  static void InitializeV8Once();
  static const char* V8Version();

  // 创建 Isolate 和 Context，并准备好全局对象（globalThis、console）
  explicit Engine(EngineHost host);
  ~Engine();

  Engine(const Engine&) = delete;
  Engine& operator=(const Engine&) = delete;

  // 执行一段脚本。出现未捕获异常时通过 host.log 输出错误并返回 false
  bool Evaluate(const Script& script);

  // 执行内置脚本的一个 part。
  //
  // part 的源码整个是一个函数表达式 `(function (ctx) { … })`：这里编译执行拿到
  // 那个函数，再用所有 part 共享的 ctx 调一次。第一个 part 调用时建出 ctx。
  //
  // 为什么是函数包裹而不是多个脚本按序执行：后者要共享就得让内部助手变成顶层
  // const（全局词法绑定），那会**把内部名变成用户的保留字**——用户在 main.js
  // 顶层声明同名 const 直接 SyntaxError，而我们的内部名里有 define、own、num。
  // 函数包裹三条都占住：每个 part 各自正确的文件名和行号、零全局污染、不占用
  // 用户的标识符。
  //
  // 任何一个 part 失败都是致命的（后面的 part 会在半加载的状态上继续），
  // 所以调用方要在第一个 false 上停下并点名是哪个文件。
  bool RunBuiltinPart(const Script& script);

  // 所有 part 跑完，放掉对 ctx 的引用——它只在装载期间需要
  void FinishBuiltinParts();

  // 处理 V8 平台投递的任务（每轮 JS 任务结束后调用）
  void PumpMessageLoop();

  // 在主线程即将空闲时调用，把这段空闲时间交给 V8 做增量 GC 等后台工作。
  // Chrome 就是这么在帧间隙做 GC 的。只能在 JS 所在线程调用。
  void RunIdleTasks(double idle_time_in_seconds);

  // 系统说内存不够了：让 V8 尽快释放内存（会做一次完整的 GC）。iOS 的内存警告
  // 只有一个级别，对应 V8 的 kCritical。只能在 JS 所在线程调用。
  void NotifyMemoryPressure();

  // 把一个 App 级事件派发给 JS 里的 application。只能在 JS 线程上调用。
  // 内置脚本还没执行时静默忽略。
  void EmitAppEvent(const std::string& type);

  // 把一个原生对象作为 payload 派发事件：JS 收到的事件上会有 event[key] = 包装对象。
  // 只能在 JS 所在线程调用。
  void EmitAppEventWithObject(const std::string& type, const std::string& key,
                              const NativeObjectRef& ref);

  // 把事件派发给某个原生对象自己的 JS 包装（而不是 application）。
  // 场景的生命周期事件走这条路。
  void EmitObjectEvent(const NativeObjectRef& target, const std::string& type);
  // 同上，外加一个原生对象作为负载（导航的 beforeshow / show 要带「哪个页面」）。
  //
  // 带负载的这几个都有 event_class：事件对象用哪个类建（'UIControlTouchEvent'
  // 这样的名字，内置脚本登记过的）。哪个事件是哪个类只在原生这边写一份。
  // 给空串就是普通的 Event
  void EmitObjectEventWith(const NativeObjectRef& target, const std::string& type,
                           const NativeObjectRef& payload, const std::string& event_class = "");
  // 同上，但负载是一个 JSON 值而不是原生对象（动画的 stop 要带 finished）。
  // JS 侧的 sink 一视同仁：拿到什么就往事件上挂什么
  //
  // 返回值：监听器有没有对这个事件调 preventDefault()。只有 JS 侧把这个
  // 事件建成 cancelable 的时候才可能是 true（现在只有网页的 will-navigate）。
  // 给「原生能把默认动作推迟到 JS 答复之后」的场合用：系统给了一个可以晚点
  // 再调的回调，原生先不答，派发完看这个返回值再答
  //
  // cancelable：这一次派发要不要建成可取消的事件。原生**当场**等这个返回值
  // 来决定做不做默认动作时传 true（输入框的 beforeinput 一类，见下面的
  // 同步回调）。
  bool EmitObjectEventWithJSON(const NativeObjectRef& target, const std::string& type,
                               const std::string& json, bool cancelable = false,
                               const std::string& event_class = "");

  // 当场派发一个不可取消的事件，事件对象上 answer_field 这个字段**可写**；派发完
  // 把它的值编成 JSON 文本交回来。系统当场要一个值（不是「要不要」）时用，第一处
  // 是滚动视图松手时问停在哪。监听器没改、改成了 JSON 表示不了的东西、抛了、
  // 引擎出了岔子，都返回空串，调用方照系统原来的值做。
  std::string EmitObjectEventForAnswer(const NativeObjectRef& target, const std::string& type,
                                       const std::string& json, const std::string& answer_field,
                                       const std::string& event_class = "");

  // ---- 同步回调：系统问、JS 当场答 ----
  //
  // 上面那些 Emit… 本身都是同步执行的，「延后一轮」是宿主排的队。同步回调
  // 就是宿主不排队、当场调。两种时机都可以：JS 没在跑（系统从 run loop 里
  // 来问），或者 JS 正在调原生、原生又回头问 JS（嵌套一层）。
  //
  // 调一段 JS 交过来的代码（「代码块」）。id 是 JS 侧登记时给的号，参数是
  // 一段 JSON 数组。当场执行，执行完才返回。那段代码抛的异常由 JS 侧自己
  // 接住再处理（见内置脚本），到不了这里。
  void CallBlock(int block_id, const std::string& args_json);
  // 现在是不是在 JS 的调用里面（嵌套进入时为 true）。宿主靠它决定进入之后
  // 要不要处理平台投递的任务——那只能在最外层做
  bool IsInJS() const;

  // 结束一个由 JS 发起的异步调用，用布尔值兑现它的 Promise。
  // 只能在 JS 线程上调用；call_id 不存在时静默忽略。
  void SettleBool(int call_id, bool value);

  // ---- 异步调用的兑现 ----
  // 都只能在 JS 线程上调用；call_id 不存在时静默忽略（可能已经被取消）。
  // 每个 call_id 只能被兑现一次，之后就从待定表里摘掉了。

  // 用一个 JSON 值兑现，比如 fetch 的 {status, headers, url}
  void SettleJSON(int call_id, const std::string& json);
  // 用一个原生对象兑现，比如 Blob
  void SettleObject(int call_id, const NativeObjectRef& ref);
  // 用一段字节兑现成 ArrayBuffer。**零拷贝**：V8 直接接管这块内存，
  // GC 回收时调 deleter，所以调用方把所有权交出来就别再碰了。
  void SettleBytes(int call_id, void* data, size_t byte_length,
                   void (*deleter)(void* data, size_t length, void* info),
                   void* deleter_info);
  // 拒绝。name 是错误类型（'TypeError' / 'AbortError' …），内置脚本据此建对应的类
  // （TypeError、DOMException，或者平台的错误）。detail_json 是系统给的原值
  // {"domain": …, "code": …}，平台建成它自己的错误（iOS 是 NSError）：Web 上
  // 有的名字挂在 cause 上，别的名字就是那个错误本身。给空串表示没有。
  void RejectCall(int call_id, const std::string& name, const std::string& message,
                  const std::string& detail_json = "");

  // ---- 定时器 ----
  // 宿主被 schedule_wakeup 叫醒后调这个。执行到期的定时器，
  // 每个之间跑微任务检查点，用完时间预算就让出主线程去渲染。
  //
  // 注册和取消没有出现在这里：它们由 JS 调 setTimeout 触发，全程在
  // Engine 内部，不需要穿过这个接口。这一层也就不必认识 v8 的类型。
  void FireDueTimers();

 private:
  struct Impl;
  std::unique_ptr<Impl> impl_;
};

}  // namespace nacre
