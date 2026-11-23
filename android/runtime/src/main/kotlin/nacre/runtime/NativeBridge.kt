// 原生对象和引擎之间的那一层：身份表、读写属性、调方法、造对象、订阅事件。
// 引擎经 JNI（NacreJni.cpp）调到这里；全部在主线程上。
//
// 现在是手写的一张小表，只有第一条竖切用到的几个类和成员。以后由 bindgen 生成。
package nacre.runtime

import android.app.Activity
import android.content.Context
import android.view.View
import android.view.ViewGroup
import android.view.WindowInsets
import android.widget.LinearLayout
import android.widget.TextView
import org.json.JSONObject
import java.util.IdentityHashMap

// 参数类型不对之类的错：JS 那边抛 TypeError。别的异常（Java 自己抛的）JS 那边是
// 一个 name 为异常类名的 Error，见 errorText
internal class NacreTypeError(message: String) : RuntimeException(message)

internal class NativeBridge(
    private val activity: Activity,
    // 异步调用的兑现（fetch、Blob 的读取）
    private val settle: Settle,
    // 系统的回调进来了，排到下一轮派发给 JS（不当场进 JS）
    private val emitter: Emitter,
) {
    // 事件的出口。实现在 NacreRuntime：排到主线程的下一轮，再交给引擎
    interface Emitter {
        // 不带数据的事件（click、windowinsetschange）
        fun plain(target: Any, type: String)
        // 带一个 JSON 值的事件。eventClass 是 JS 那边建事件用的类（MessageEvent、CloseEvent……）
        fun json(target: Any, type: String, json: String, eventClass: String)
        // 带一个原生对象的事件（WebSocket 收到的二进制消息是一个 Blob）
        fun obj(target: Any, type: String, payload: Any, eventClass: String)
    }

    // ---- 身份表 ----
    //
    // Java 对象没有固定的地址，所以交给引擎的「指针」是这里发的编号：同一个对象永远是
    // 同一个编号，JS 拿到的就永远是同一个包装。表里强引用着对象：JS 的包装活着，
    // 原生对象就活着（引擎 retain）；包装被回收，引擎 release，这里放手，Java 那边
    // 才可能回收它。和 iOS 的「包装活着就 CFRetain」同一个思路
    private val ids = IdentityHashMap<Any, Long>()
    private val objects = HashMap<Long, Any>()
    private val retains = HashMap<Long, Int>()
    private var nextId = 1L

    fun intern(obj: Any): Long {
        ids[obj]?.let { return it }
        val id = nextId++
        ids[obj] = id
        objects[id] = obj
        retains[id] = 0
        return id
    }

    fun retain(id: Long) {
        retains[id]?.let { retains[id] = it + 1 }
    }

    fun release(id: Long) {
        val count = retains[id] ?: return
        if (count > 1) retains[id] = count - 1 else forget(id)
    }

    // 交给引擎、但引擎没 retain 的（建包装失败了），在主线程空闲时清掉。
    // 正常的交接是同一次 JNI 调用里就 retain 了，到空闲时计数早就不是 0
    fun sweep() {
        val unclaimed = retains.filterValues { it == 0 }.keys
        for (id in unclaimed) forget(id)
    }

    private fun forget(id: Long) {
        retains.remove(id)
        objects.remove(id)?.let { ids.remove(it) }
    }

    private fun obj(id: Long): Any? = objects[id]

    // JS 那边按这个名字找类。从具体到一般，第一个对上的就是
    fun className(obj: Any): String = when (obj) {
        is NacreBlob -> "Blob"
        is NacreWebSocket -> "WebSocket"
        is Activity -> "Activity"
        is TextView -> "TextView"
        is LinearLayout -> "LinearLayout"
        is ViewGroup -> "ViewGroup"
        is View -> "View"
        is Context -> "Context"
        else -> "Object"
    }

    fun classNameOf(id: Long): String = obj(id)?.let(::className) ?: ""

    // ---- 造对象 ----

    fun construct(className: String, args: ByteArray, ptrs: LongArray): Long {
        if (className == "WebSocket") {
            // new WebSocket(url, { protocols, headers })。网址不合法交 0，JS 那边抛 TypeError
            val values = Packed.decode(args) as? List<*> ?: emptyList<Any?>()
            val url = values.getOrNull(0) as? String ?: return 0L
            return NacreWebSocket.open(url, values.getOrNull(1) as? Map<*, *>, webSocketEvents)
                ?.let(::intern) ?: 0L
        }
        val context = ptrs.getOrNull(0)?.let(::obj) as? Context
            ?: throw NacreTypeError("new $className: argument 1 must be a Context")
        val view: View = when (className) {
            "View" -> View(context)
            "LinearLayout" -> LinearLayout(context)
            "TextView" -> TextView(context)
            else -> throw NacreTypeError("Illegal constructor: $className cannot be constructed")
        }
        return intern(view)
    }

    // ---- 属性 ----

    // 返回 JSON 的 UTF-8 字节（不走 Java 字符串交回 C++：JNI 的字符串是「改良 UTF-8」）
    fun readProperty(id: Long, name: String): ByteArray {
        val target = obj(id)
        val json = when {
            target is TextView && name == "text" -> JSONObject.quote(target.text.toString())
            target is NacreWebSocket && name == "readyState" -> target.readyState.toString()
            target is NacreWebSocket && name == "url" -> JSONObject.quote(target.url)
            target is NacreWebSocket && name == "protocol" -> JSONObject.quote(target.protocol)
            target is NacreWebSocket && name == "maximumMessageSize" -> target.maximumMessageSize.toString()
            target is NacreBlob && name == "size" -> target.data.size.toString()
            target is NacreBlob && name == "type" -> JSONObject.quote(target.type)
            target is Activity && name == "windowInsets" ->
                target.window.decorView.rootWindowInsets?.let(::insetsJson) ?: "null"
            target is ViewGroup && name == "childCount" -> target.childCount.toString()
            target is View && name == "paddingLeft" -> target.paddingLeft.toString()
            target is View && name == "paddingTop" -> target.paddingTop.toString()
            target is View && name == "paddingRight" -> target.paddingRight.toString()
            target is View && name == "paddingBottom" -> target.paddingBottom.toString()
            else -> "null"
        }
        return json.toByteArray(Charsets.UTF_8)
    }

    fun writeProperty(id: Long, name: String, packed: ByteArray) {
        val target = obj(id)
        val value = Packed.decode(packed)
        when {
            target is NacreWebSocket && name == "maximumMessageSize" -> {
                target.maximumMessageSize = (value as? Double)?.toInt()
                    ?: throw NacreTypeError("maximumMessageSize must be a number")
            }
            target is TextView && name == "text" -> {
                // JS 那边已经照 Web IDL 转成字符串了，这里只校验
                target.text = value as? String ?: throw NacreTypeError("text must be a string")
            }
            else -> throw NacreTypeError(
                "${target?.let(::className) ?: "object"} has no writable property $name")
        }
    }

    // 类级的对象属性：没有实例，用名字定位。现在只有 application.activity
    fun readClassObjectProperty(className: String, name: String): Long = when {
        className == "@application" && name == "activity" -> intern(activity)
        else -> 0L
    }

    // ---- 方法 ----

    fun callMethod(id: Long, name: String, packed: ByteArray, ptrs: LongArray): ByteArray {
        val target = obj(id)
        when {
            target is Activity && name == "setContentView" -> target.setContentView(viewArg(ptrs, name))
            target is NacreWebSocket && name == "close" -> {
                // JS 那边已经把 code 转成了整数（或者 null），reason 转成了字符串（或者 null）
                val args = Packed.decode(packed) as? List<*> ?: emptyList<Any?>()
                target.close((args.getOrNull(0) as? Double)?.toInt(), args.getOrNull(1) as? String)
            }
            target is ViewGroup && name == "addView" -> target.addView(viewArg(ptrs, name))
            target is View && name == "setPadding" -> {
                // JS 那边已经照 Web IDL 转成了四个整数，这里只校验
                val args = Packed.decode(packed) as? List<*>
                val ints = args?.map { (it as? Double)?.toInt() }
                if (ints == null || ints.size != 4 || ints.any { it == null }) {
                    throw NacreTypeError("setPadding: expected 4 numbers")
                }
                target.setPadding(ints[0]!!, ints[1]!!, ints[2]!!, ints[3]!!)
            }
            else -> throw NacreTypeError(
                "${target?.let(::className) ?: "object"} has no method $name")
        }
        return NULL_JSON
    }

    // 返回原生对象的方法。null 交 0
    fun callObjectMethod(id: Long, name: String, packed: ByteArray, ptrs: LongArray): Long {
        val target = obj(id)
        val args = Packed.decode(packed) as? List<*> ?: emptyList<Any?>()
        return when {
            target is ViewGroup && name == "getChildAt" -> {
                // JS 那边已经照 Web IDL 转成整数了，这里只校验
                val index = (args.getOrNull(0) as? Double)?.toInt()
                    ?: throw NacreTypeError("getChildAt: index must be a number")
                target.getChildAt(index)?.let(::intern) ?: 0L
            }
            else -> throw NacreTypeError(
                "${target?.let(::className) ?: "object"} has no method $name")
        }
    }

    private fun viewArg(ptrs: LongArray, where: String): View =
        ptrs.getOrNull(0)?.let(::obj) as? View
            ?: throw NacreTypeError("$where: argument 1 must be a View")

    // ---- 异步的方法（返回 Promise）----

    // send 和 ping 都是「发出去，等一个结果」，所以 JS 那边是 Promise
    fun callAsync(id: Long, name: String, packed: ByteArray, ptrs: LongArray, callId: Int) {
        val target = obj(id)
        if (target is NacreWebSocket) {
            when (name) {
                "send" -> {
                    val blob = ptrs.getOrNull(0)?.let(::obj) as? NacreBlob
                    val text = (Packed.decode(packed) as? List<*>)?.getOrNull(0) as? String
                    target.send(text, blob, settle, callId)
                }
                // OkHttp 没有公开「手动发一个 ping、等 pong」的接口，只有定时自动发
                "ping" -> settle.reject(callId, "NotSupportedError",
                                        "ping: not supported on Android (OkHttp has no manual ping)")
                else -> settle.reject(callId, "TypeError", "WebSocket has no method $name")
            }
            return
        }
        settle.reject(callId, "TypeError", "${target?.let(::className) ?: "object"} has no method $name")
    }

    // WebSocket 的事件：总是发，不看有没有人订（和 iOS 一样）
    private val webSocketEvents = object : NacreWebSocket.Events {
        override fun plain(socket: NacreWebSocket, type: String) = emitter.plain(socket, type)
        override fun json(socket: NacreWebSocket, type: String, json: String, eventClass: String) =
            emitter.json(socket, type, json, eventClass)
        override fun blob(socket: NacreWebSocket, type: String, blob: NacreBlob, eventClass: String) =
            emitter.obj(socket, type, blob, eventClass)
    }

    // ---- Blob 和 fetch（core/builtin/parts/23-fetch.js）----

    private val fetch = FetchService(settle)

    // new Blob(parts, { type })。返回编号，由引擎把 JS 那边正在构造的 Blob 绑上去
    fun createBlob(partsJson: ByteArray, buffers: Array<ByteArray?>, type: ByteArray): Long =
        intern(NacreBlob.fromParts(String(partsJson, Charsets.UTF_8), buffers, String(type, Charsets.UTF_8)))

    // 读 Blob 的内容。字节本来就在内存里，但 UTF-8 解码是 CPU 活，放到后台
    fun readObjectAsync(id: Long, kind: String, callId: Int) {
        val blob = obj(id) as? NacreBlob
        if (blob == null) {
            settle.reject(callId, "TypeError", "not a Blob")
            return
        }
        readWork.execute {
            if (kind == "text") settle.json(callId, JSONObject.quote(NacreBlob.decodeUtf8(blob.data)))
            else settle.bytes(callId, blob.data.copyOf())
        }
    }

    private val readWork = java.util.concurrent.Executors.newSingleThreadExecutor { r ->
        Thread(r, "nacre.blob.read").apply { isDaemon = true }
    }

    fun fetchStart(url: ByteArray, optionsJson: ByteArray, bodyId: Long, callId: Int): Int {
        val body = if (bodyId == 0L) null else obj(bodyId)
        if (body != null && body !is NacreBlob) {
            settle.reject(callId, "TypeError", "fetch body must be a Blob")
            return 0
        }
        return fetch.start(String(url, Charsets.UTF_8), String(optionsJson, Charsets.UTF_8),
                           body as NacreBlob?, callId)
    }

    fun fetchReadBody(requestId: Int, kind: String, callId: Int) = fetch.readBody(requestId, kind, callId)
    fun fetchCancel(requestId: Int) = fetch.cancel(requestId)
    fun fetchRelease(requestId: Int) = fetch.release(requestId)

    fun close() {
        fetch.close()
        readWork.shutdownNow()
    }

    // ---- 事件 ----

    // 某个事件类型的监听器从无到有、从有到无。只有原生真的会发的类型才装回调；
    // 不认识的名字是 JS 自己的自定义事件，什么都不做
    fun setEventSubscription(id: Long, type: String, on: Boolean) {
        val target = obj(id)
        if (target is Activity && type == "windowinsetschange") {
            subscribeWindowInsets(target, on)
            return
        }
        val view = target as? View ?: return
        if (type != "click") return
        if (on) {
            clickableBefore[view] = view.isClickable
            // 回调里拿的是 View 本身，不是编号：JS 的包装可能早被回收了（界面上的
            // 东西没人引用时），点击来了再重新发编号、重建包装
            view.setOnClickListener { emitter.plain(it, "click") }
        } else {
            view.setOnClickListener(null)
            // setOnClickListener 会顺手把视图设成可点的，拆掉时还原
            clickableBefore.remove(view)?.let { view.isClickable = it }
        }
    }

    private val clickableBefore = IdentityHashMap<View, Boolean>()

    // ---- 窗口边衬（安全区域）----

    // 系统每次分发窗口边衬都先经过页面最外层的视图。值变了才发事件（同样的值系统会
    // 重复分发好几次）；分发本身原样交给它默认的处理，不替 JS 做任何排版决定
    private var lastInsets: WindowInsets? = null

    private fun subscribeWindowInsets(activity: Activity, on: Boolean) {
        val decor = activity.window.decorView
        if (on) {
            lastInsets = null
            decor.setOnApplyWindowInsetsListener { v, insets ->
                if (insets != lastInsets) {
                    lastInsets = insets
                    emitter.plain(activity, "windowinsetschange")
                }
                v.onApplyWindowInsets(insets)
            }
        } else {
            decor.setOnApplyWindowInsetsListener(null)
            lastInsets = null
        }
    }

    // 各类边衬照 WindowInsets.Type 的名字，每类是 [左, 上, 右, 下]，单位像素
    private fun insetsJson(insets: WindowInsets): String {
        val types = linkedMapOf(
            "systemBars" to WindowInsets.Type.systemBars(),
            "statusBars" to WindowInsets.Type.statusBars(),
            "navigationBars" to WindowInsets.Type.navigationBars(),
            "displayCutout" to WindowInsets.Type.displayCutout(),
            "ime" to WindowInsets.Type.ime(),
            "systemGestures" to WindowInsets.Type.systemGestures(),
            "tappableElement" to WindowInsets.Type.tappableElement(),
        )
        return types.entries.joinToString(",", "{", "}") { (name, type) ->
            val i = insets.getInsets(type)
            "\"$name\":[${i.left},${i.top},${i.right},${i.bottom}]"
        }
    }

    // 把一个异常写成引擎认的那句话：参数类的错是普通的说明（JS 那边抛 TypeError）；
    // Java 自己抛的，开头带上「\u0001类名\u0001」，JS 那边是 name 为这个类名的 Error
    fun errorText(error: Throwable): ByteArray {
        val text = if (error is NacreTypeError) {
            error.message ?: "TypeError"
        } else {
            "\u0001${error.javaClass.simpleName}\u0001${error.message ?: ""}"
        }
        return text.toByteArray(Charsets.UTF_8)
    }

    companion object {
        private val NULL_JSON = "null".toByteArray(Charsets.UTF_8)
    }
}
