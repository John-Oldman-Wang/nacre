// 第一条竖切的那几个类：Context、Activity、View、ViewGroup、LinearLayout、TextView。
// JS 那一侧在 builtin/parts/10-view.js、21-application.js。
package nacre.runtime

import android.app.Activity
import android.content.Context
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import org.json.JSONObject
import java.util.IdentityHashMap

internal class ViewDomain(host: DomainHost) : Domain(host) {

    override val classes: Map<Class<*>, String> = mapOf(
        Context::class.java to "Context",
        Activity::class.java to "Activity",
        View::class.java to "View",
        ViewGroup::class.java to "ViewGroup",
        LinearLayout::class.java to "LinearLayout",
        TextView::class.java to "TextView",
    )

    override fun construct(className: String, args: List<*>, objects: List<Any?>): Any? {
        val context = objects.getOrNull(0) as? Context
            ?: throw NacreTypeError("new $className: argument 1 must be a Context")
        return when (className) {
            "View" -> View(context)
            "LinearLayout" -> LinearLayout(context)
            "TextView" -> TextView(context)
            // Context、Activity 由系统建，ViewGroup 是抽象类；JS 那一侧已经拦了，这里再挡一次
            else -> throw NacreTypeError("Illegal constructor: $className cannot be constructed")
        }
    }

    override fun read(target: Any, name: String): String? = when {
        target is TextView && name == "text" -> JSONObject.quote(target.text.toString())
        target is ViewGroup && name == "childCount" -> target.childCount.toString()
        target is View && name == "paddingLeft" -> target.paddingLeft.toString()
        target is View && name == "paddingTop" -> target.paddingTop.toString()
        target is View && name == "paddingRight" -> target.paddingRight.toString()
        target is View && name == "paddingBottom" -> target.paddingBottom.toString()
        else -> null
    }

    override fun write(target: Any, name: String, value: Any?): Boolean = when {
        target is TextView && name == "text" -> {
            // JS 那边已经照 Web IDL 转成字符串了，这里只校验
            target.text = value as? String ?: throw NacreTypeError("text must be a string")
            true
        }
        else -> false
    }

    override fun call(target: Any, name: String, args: List<*>, objects: List<Any?>): String? {
        when {
            target is Activity && name == "setContentView" -> target.setContentView(viewArg(objects, name))
            target is ViewGroup && name == "addView" -> target.addView(viewArg(objects, name))
            target is View && name == "setPadding" -> {
                // JS 那边已经照 Web IDL 转成了四个整数，这里只校验
                val ints = args.map { (it as? Double)?.toInt() }
                if (ints.size != 4 || ints.any { it == null }) throw NacreTypeError("setPadding: expected 4 numbers")
                target.setPadding(ints[0]!!, ints[1]!!, ints[2]!!, ints[3]!!)
            }
            else -> return null
        }
        return "null"
    }

    override fun callObject(target: Any, name: String, args: List<*>, objects: List<Any?>): Any? = when {
        target is ViewGroup && name == "getChildAt" -> {
            // JS 那边已经照 Web IDL 转成整数了，这里只校验
            val index = (args.getOrNull(0) as? Double)?.toInt()
                ?: throw NacreTypeError("getChildAt: index must be a number")
            target.getChildAt(index)
        }
        else -> NOT_MINE
    }

    private fun viewArg(objects: List<Any?>, where: String): View =
        objects.getOrNull(0) as? View ?: throw NacreTypeError("$where: argument 1 must be a View")

    // 类级的对象属性：application.activity（类名 @application 只是桥上的地址）
    override fun classObject(className: String, name: String): Any? =
        if (className == "@application" && name == "activity") host.activity else NOT_MINE

    // click：有人订阅才装回调，最后一个监听摘掉时拆掉
    override fun subscribe(target: Any, type: String, on: Boolean): Boolean {
        val view = target as? View ?: return false
        if (type != "click") return false
        if (on) {
            clickableBefore[view] = view.isClickable
            // 回调里拿的是 View 本身，不是编号：JS 的包装可能早被回收了（界面上的
            // 东西没人引用时），点击来了再重新发编号、重建包装
            view.setOnClickListener { host.emitter.plain(it, "click") }
        } else {
            view.setOnClickListener(null)
            // setOnClickListener 会顺手把视图设成可点的，拆掉时还原
            clickableBefore.remove(view)?.let { view.isClickable = it }
        }
        return true
    }

    private val clickableBefore = IdentityHashMap<View, Boolean>()
}
