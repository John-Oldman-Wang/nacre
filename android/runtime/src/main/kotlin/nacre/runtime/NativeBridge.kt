// 原生对象和引擎之间的那一层：身份表，加上按顺序问各个域（Domain.kt）「认不认领」。
// 引擎经 JNI（NacreJni.cpp）调到这里；全部在主线程上。
//
// 这里不认识任何一个具体的类：各组类在自己的域里处理，登记在 Domains.kt。
// 只有引擎专门留的几个入口（建 Blob、读 Blob、fetch）在这里，它们是 core 的约定，不按类分。
package nacre.runtime

import android.app.Application
import android.view.View
import org.json.JSONArray
import org.json.JSONObject
import java.util.IdentityHashMap

// 参数类型不对之类的错：JS 那边抛 TypeError。别的异常（Java 自己抛的）JS 那边是
// 一个 name 为异常类名的 Error，见 errorText
internal class NacreTypeError(message: String) : RuntimeException(message)

// 属性写入没生效、但不算错（枚举属性写了不认识的值）：JS 那边不抛，打一条警告，值不变。
// 只在写属性时有这个意思；方法参数写错抛 NacreTypeError。措辞见 Enums.kt
internal class NacreWarning(message: String) : RuntimeException(message)

internal class NativeBridge(
    app: Application,
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
        // 当场派发、不带数据（不排到下一轮）：系统这一刻在做一件 JS 要跟着做的事，
        // 比如页面的密度变了，视图的长度要赶在下一次排版之前重设
        fun plainNow(target: Any, type: String)
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

    // ---- 域 ----

    private val domains: List<Domain> = registeredDomains(DomainHost(app, settle, emitter))

    // 所有域登记的「Java 类 → JS 类名」，按继承层级从深到浅排：一个对象用离它最近的那个
    private class Entry(val type: Class<*>, val jsName: String, val domain: Domain, val depth: Int)
    private val entries: List<Entry> = domains.flatMap { d ->
        d.classes.map { (type, name) -> Entry(type, name, d, depthOf(type)) }
    }.sortedByDescending { it.depth }

    private fun depthOf(type: Class<*>): Int {
        var depth = 0
        var c: Class<*>? = type
        while (c != null) { depth++; c = c.superclass }
        return depth
    }

    // JS 那边按这个名字找类：所有域里离这个对象最近的那个类
    fun className(obj: Any): String = entries.firstOrNull { it.type.isInstance(obj) }?.jsName ?: "Object"

    // 要问的域：管着这个对象的那些，离它最近的先问（子类所在的域排在父类前面，和 iOS 一样）
    private fun domainsFor(target: Any): List<Domain> {
        val out = ArrayList<Domain>()
        for (e in entries) if (e.type.isInstance(target) && e.domain !in out) out.add(e.domain)
        return out
    }

    private fun describe(target: Any?) = target?.let(::className) ?: "object"
    private fun argList(packed: ByteArray): List<*> = Packed.decode(packed) as? List<*> ?: emptyList<Any?>()
    private fun objectsOf(ptrs: LongArray): List<Any?> = ptrs.map { if (it == 0L) null else obj(it) }

    fun classNameOf(id: Long): String = obj(id)?.let(::className) ?: ""

    // ---- 造对象 ----

    // 返回编号；建不了交 0（JS 那边抛 TypeError），或者域抛 NacreTypeError
    fun construct(className: String, args: ByteArray, ptrs: LongArray): Long {
        val values = argList(args)
        val objs = objectsOf(ptrs)
        for (d in domains) {
            if (className !in d.classes.values) continue
            val made = d.construct(className, values, objs) ?: return 0L
            // 视图的状态以 JS 为准：不让系统在进程被杀之后按 id 把旧的状态（滚动位置这类）
            // 灌回新建的视图
            if (made is View) made.isSaveEnabled = false
            return intern(made)
        }
        throw NacreTypeError("Illegal constructor: $className cannot be constructed")
    }

    // ---- 属性 ----

    // 返回 JSON 的 UTF-8 字节（不走 Java 字符串交回 C++：JNI 的字符串是「改良 UTF-8」）
    fun readProperty(id: Long, name: String): ByteArray {
        val target = obj(id)
        val json = target?.let { t -> domainsFor(t).firstNotNullOfOrNull { it.read(t, name) } } ?: "null"
        return json.toByteArray(Charsets.UTF_8)
    }

    // 写进去了交空数组；域抛了 NacreWarning（值没动）交那句话的 UTF-8 字节，引擎当成警告
    fun writeProperty(id: Long, name: String, packed: ByteArray): ByteArray {
        val target = obj(id)
        val value = Packed.decode(packed)
        try {
            if (target != null && domainsFor(target).any { it.write(target, name, value) }) return ByteArray(0)
        } catch (warning: NacreWarning) {
            return (warning.message ?: "").toByteArray(Charsets.UTF_8)
        }
        throw NacreTypeError("${describe(target)} has no writable property $name")
    }

    // 类级的对象属性（没有实例，用类名定位）。没有交 0
    fun readClassObjectProperty(className: String, name: String): Long {
        for (d in domains) {
            val found = d.classObject(className, name)
            if (found !== Domain.NOT_MINE) return found?.let(::intern) ?: 0L
        }
        return 0L
    }

    // ---- 方法 ----

    fun callMethod(id: Long, name: String, packed: ByteArray, ptrs: LongArray): ByteArray {
        val target = obj(id)
        val args = argList(packed)
        val objs = objectsOf(ptrs)
        val json = target?.let { t -> domainsFor(t).firstNotNullOfOrNull { it.call(t, name, args, objs) } }
            ?: throw NacreTypeError("${describe(target)} has no method $name")
        return json.toByteArray(Charsets.UTF_8)
    }

    // 返回原生对象的方法。null 交 0
    fun callObjectMethod(id: Long, name: String, packed: ByteArray, ptrs: LongArray): Long {
        val target = obj(id)
        val args = argList(packed)
        val objs = objectsOf(ptrs)
        if (target != null) {
            for (d in domainsFor(target)) {
                val result = d.callObject(target, name, args, objs)
                if (result !== Domain.NOT_MINE) return result?.let(::intern) ?: 0L
            }
        }
        throw NacreTypeError("${describe(target)} has no method $name")
    }

    // 返回值不是原生对象的类方法（Intl 那一组）
    fun callClassMethod(className: String, name: String, packed: ByteArray, ptrs: LongArray): ByteArray {
        if (className == "@bridge" && name == "enumNames") return enumNames().toByteArray(Charsets.UTF_8)
        val args = argList(packed)
        val objs = objectsOf(ptrs)
        val json = domains.firstNotNullOfOrNull { it.classCall(className, name, args, objs) }
            ?: throw NacreTypeError("$className has no class method $name")
        return json.toByteArray(Charsets.UTF_8)
    }

    // 返回一个原生对象的类方法（Typeface.create）。null 交 0
    fun callClassObjectMethod(className: String, name: String, packed: ByteArray, ptrs: LongArray): Long {
        val args = argList(packed)
        val objs = objectsOf(ptrs)
        for (d in domains) {
            val result = d.classCallObject(className, name, args, objs)
            if (result !== Domain.NOT_MINE) return result?.let(::intern) ?: 0L
        }
        throw NacreTypeError("$className has no class method $name")
    }

    // 返回 Promise 的方法。结果由域用 settle 兑现
    fun callAsync(id: Long, name: String, packed: ByteArray, ptrs: LongArray, callId: Int) {
        val target = obj(id)
        val args = argList(packed)
        val objs = objectsOf(ptrs)
        if (target != null && domainsFor(target).any { it.callAsync(target, name, args, objs, callId) }) return
        settle.reject(callId, "TypeError", "${describe(target)} has no method $name")
    }

    // 各个域的枚举表的名字：{ 表名: [名字…] }。JS 在启动时取一次，写错的名字当场查；
    // 名字和数值的映射只在原生这一侧
    private fun enumNames(): String {
        val out = JSONObject()
        for (d in domains) {
            for ((table, enum) in d.enums) {
                check(!out.has(table)) { "enum table \"$table\" is registered twice" }
                out.put(table, JSONArray(enum.names))
            }
        }
        return out.toString()
    }

    // ---- 事件 ----

    // 某个事件类型的监听器从无到有、从有到无。没有域处理就是 JS 自己的自定义事件，什么都不做
    fun setEventSubscription(id: Long, type: String, on: Boolean) {
        val target = obj(id) ?: return
        for (d in domainsFor(target)) if (d.subscribe(target, type, on)) return
    }

    // ---- Blob 和 fetch（core/builtin/parts/23-fetch.js 的专门入口）----

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
        for (d in domains) d.close()
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
}
