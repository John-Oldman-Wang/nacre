// 一组类在原生这一侧的处理（一个「域」）。照 iOS 的 NacreRegisterDomain：
// 一组类一个文件，在 Domains.kt 的列表里登记一行；NativeBridge 只负责挨个问
// 「认不认领」，不知道任何一个具体的类。几组类就可以分开、同时接，互不碰文件。
//
// 一个域只处理自己的类和成员，不认识的一律交回「不是我的」（null / false / NOT_MINE），
// 由 NativeBridge 去问下一个。接一组类的办法见 docs/internals/android.md「接一组类」。
package nacre.runtime

import android.app.Activity

// 域能用到的运行时的东西
internal class DomainHost(
    // App 唯一的那个页面
    val activity: Activity,
    // 异步调用的兑现（哪个线程都能调，实现里排到主线程）
    val settle: Settle,
    // 事件的出口（排到下一轮再派发）
    val emitter: NativeBridge.Emitter,
)

internal abstract class Domain(protected val host: DomainHost) {

    // 这一组管的 Java 类 → JS 类名。决定两件事：
    //   哪些对象归它问：对象是其中某个类的实例（isInstance）；
    //   对象交给引擎时用哪个 JS 类名建包装：所有域里离它最近（继承层级最深）的那个类。
    // JS 类名是 JS 那一侧 defineNativeClass 登记的名字，两边要对上
    abstract val classes: Map<Class<*>, String>

    // new 一个 JS 类（className 是 JS 类名，是这一组 classes 里的名字才会问到）。
    // objects 是参数里的原生对象，按下标对齐 args（不是对象的位置是 null）。
    // 返回建好的对象；建不了抛 NacreTypeError
    open fun construct(className: String, args: List<*>, objects: List<Any?>): Any? = null

    // 读属性，返回 JSON 文本。不是这一组的成员返回 null
    open fun read(target: Any, name: String): String? = null

    // 写属性。value 是解好的值（null、Boolean、Double、String、List、Map）。
    // 处理了返回 true；值不对抛 NacreTypeError
    open fun write(target: Any, name: String, value: Any?): Boolean = false

    // 调方法（返回值不是原生对象），返回 JSON 文本（没有返回值给 "null"）。不是这一组的返回 null
    open fun call(target: Any, name: String, args: List<*>, objects: List<Any?>): String? = null

    // 调方法（返回一个原生对象，可以是 null）。不是这一组的返回 NOT_MINE
    open fun callObject(target: Any, name: String, args: List<*>, objects: List<Any?>): Any? = NOT_MINE

    // 返回 Promise 的方法。处理了返回 true，结果用 host.settle 兑现
    open fun callAsync(target: Any, name: String, args: List<*>, objects: List<Any?>, callId: Int): Boolean = false

    // 某个事件类型的监听器从无到有（on = true）、从有到无。原生真的会发这个事件才处理，
    // 处理了返回 true。不认识的名字是 JS 自己的自定义事件，返回 false 就行
    open fun subscribe(target: Any, type: String, on: Boolean): Boolean = false

    // 类级的对象属性（没有实例，用类名定位）。不是这一组的返回 NOT_MINE
    open fun classObject(className: String, name: String): Any? = NOT_MINE

    // 类级的方法（返回值不是原生对象），返回 JSON 文本。不是这一组的返回 null
    open fun classCall(className: String, name: String, args: List<*>, objects: List<Any?>): String? = null

    // 类级的方法（返回一个原生对象，可以是 null）。不是这一组的返回 NOT_MINE
    open fun classCallObject(className: String, name: String, args: List<*>, objects: List<Any?>): Any? = NOT_MINE

    // 运行时关掉时
    open fun close() {}

    companion object {
        // 「不是我的」。返回对象的那几个方法里 null 是合法的结果，所以另用一个记号
        val NOT_MINE = Any()
    }
}
