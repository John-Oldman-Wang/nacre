// 基础的那几个类：Activity、View、ViewGroup、LinearLayout、TextView，加上视图树在原生这一侧的
// 几个内部操作。JS 那一侧在 builtin/parts/10-view.js、21-application.js。
//
// 树记在 JS 里（2026-11-26，见 docs/internals/android.md「自由和挂上」）：视图挂上页面时，
// JS 按自己的树建原生对象、设状态、排子视图。这里的 @ 开头的成员只给 10-view.js 用，
// 不是 API：@setChildren（让原生的子视图正好是这一串）、@detach（从原生的父视图上拿下来）、
// @setContent（页面的内容）、@padding（内边距，像素）、@metrics / @metricschange（页面的密度和系统字号）、
// @whenLaidOut / @laidout（排完版才能设的状态：等这个视图下一次排完版）。
package nacre.runtime

import android.app.Activity
import android.content.Context
import android.content.res.Configuration
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import androidx.activity.ComponentActivity
import androidx.core.util.Consumer
import org.json.JSONObject
import java.util.WeakHashMap

internal class ViewDomain(host: DomainHost) : Domain(host) {

    override val classes: Map<Class<*>, String> = mapOf(
        Activity::class.java to "Activity",
        View::class.java to "View",
        ViewGroup::class.java to "ViewGroup",
        LinearLayout::class.java to "LinearLayout",
        TextView::class.java to "TextView",
    )

    private val orientations = EnumTable(
        "horizontal" to LinearLayout.HORIZONTAL,
        "vertical" to LinearLayout.VERTICAL,
    )

    override val enums: Map<String, EnumTable<*>> = mapOf("orientation" to orientations)

    // 挂上时由 10-view.js 建：参数里第一个对象是要挂上的那个页面
    override fun construct(className: String, args: List<*>, objects: List<Any?>): Any? {
        val context = objects.getOrNull(0) as? Context
            ?: throw NacreTypeError("new $className: argument 1 must be a Context")
        return when (className) {
            "View" -> View(context)
            "LinearLayout" -> LinearLayout(context)
            // 不带系统的默认样式（defStyleAttr = 0）。主题的 textAppearance 还是会给字号、颜色：颜色是
            // 一组按状态变的颜色（禁用时变浅），固定成它平常的那一个，默认值全是常数。
            // 还剩哪些默认值见 docs/internals/android.md「文字」
            "TextView" -> TextView(context, null, 0).apply { setTextColor(currentTextColor) }
            // Activity 由系统建，ViewGroup 是抽象类；JS 那一侧已经拦了，这里再挡一次
            else -> throw NacreTypeError("Illegal constructor: $className cannot be constructed")
        }
    }

    override fun read(target: Any, name: String): String? = when {
        target is TextView && name == "text" -> JSONObject.quote(target.text.toString())
        target is Activity && name == "@metrics" -> metricsJson(target)
        else -> null
    }

    override fun write(target: Any, name: String, value: Any?): Boolean = when {
        target is TextView && name == "text" -> {
            // JS 那边已经照 Web IDL 转成字符串了，这里只校验
            target.text = value as? String ?: throw NacreTypeError("text must be a string")
            true
        }
        target is LinearLayout && name == "orientation" -> {
            target.orientation = orientations.forProperty("orientation", value)
            true
        }
        else -> false
    }

    override fun call(target: Any, name: String, args: List<*>, objects: List<Any?>): String? {
        when {
            target is Activity && name == "@setContent" -> setContent(target, objects.getOrNull(0) as View?)
            target is ViewGroup && name == "@setChildren" -> setChildren(target, objects.map {
                it as? View ?: throw NacreTypeError("@setChildren: every child must be a View")
            })
            target is View && name == "@detach" -> (target.parent as? ViewGroup)?.removeView(target)
            target is View && name == "@whenLaidOut" -> return whenLaidOut(target, args.getOrNull(0) == true).toString()
            target is View && name == "@padding" -> {
                // JS 那边已经把 dp 换成了整数像素：start、top、end、bottom
                val px = args.map { (it as? Double)?.toInt() }
                if (px.size != 4 || px.any { it == null }) throw NacreTypeError("@padding: expected 4 numbers")
                target.setPaddingRelative(px[0]!!, px[1]!!, px[2]!!, px[3]!!)
            }
            else -> return null
        }
        return "null"
    }

    // 让原生的子视图正好是 children 这一串。已经一样的位置不动；不一样的先从它原来的父视图
    // （可能就是这一个，也可能是别的）上拿下来再插到这个位置；最后去掉多出来的
    private fun setChildren(group: ViewGroup, children: List<View>) {
        for ((i, child) in children.withIndex()) {
            if (i < group.childCount && group.getChildAt(i) === child) continue
            (child.parent as? ViewGroup)?.removeView(child)
            group.addView(child, i)
        }
        while (group.childCount > children.size) group.removeViewAt(group.childCount - 1)
    }

    // 页面的内容：系统放内容的那个 FrameLayout 里只放这一个，null 是清空
    private fun setContent(activity: Activity, view: View?) {
        val content = activity.findViewById<ViewGroup>(android.R.id.content)
        if (view == null) {
            content.removeAllViews()
            return
        }
        if (view.parent === content && content.childCount == 1) return
        (view.parent as? ViewGroup)?.removeView(view)
        activity.setContentView(view)
    }

    // ---- 排完版才能设的状态（10-view.js 的 afterLayout）----
    //
    // 排过版、也没在等排版，返回 true（JS 当场设）。不然在它下一次排完版时当场发 @laidout（只发一次：
    // 还在这一次排版里，画之前，JS 设的赶得上这一帧），返回 false。force：不问，直接等下一次，并请求一次
    // 排版，保证一定有下一次（挂上、密度变了时用：放回同一个页面的视图大小没变，系统可能不重新排它）
    private val layoutWaits = WeakHashMap<View, View.OnLayoutChangeListener>()

    private fun whenLaidOut(view: View, force: Boolean): Boolean {
        if (!force && view.isLaidOut && !view.isLayoutRequested) return true
        if (!layoutWaits.containsKey(view)) {
            val listener = object : View.OnLayoutChangeListener {
                override fun onLayoutChange(v: View, left: Int, top: Int, right: Int, bottom: Int,
                                            oldLeft: Int, oldTop: Int, oldRight: Int, oldBottom: Int) {
                    v.removeOnLayoutChangeListener(this)
                    layoutWaits.remove(v)
                    host.emitter.plainNow(v, LAID_OUT_EVENT)
                }
            }
            layoutWaits[view] = listener
            view.addOnLayoutChangeListener(listener)
        }
        if (force) view.requestLayout()
        return false
    }

    private fun metricsJson(activity: Activity): String = JSONObject()
        // Float 直接转 Double 会带出尾巴，按它写出来的样子转
        .put("density", activity.resources.displayMetrics.density.toString().toDouble())
        .put("fontScale", activity.resources.configuration.fontScale.toString().toDouble())
        .toString()

    // click：有人订阅才装回调，最后一个监听摘掉时拆掉。
    // @metricschange：页面的密度或系统字号变了，当场告诉 JS（视图的长度要赶在下一次排版之前重设）
    override fun subscribe(target: Any, type: String, on: Boolean): Boolean {
        if (target is Activity && type == METRICS_EVENT) {
            subscribeMetrics(target, on)
            return true
        }
        val view = target as? View ?: return false
        if (type != "click") return false
        if (on) {
            clickableBefore[view] = view.isClickable
            // 回调里拿的是 View 本身，不是编号：交给运行时时再发编号
            view.setOnClickListener { host.emitter.plain(it, "click") }
        } else {
            view.setOnClickListener(null)
            // setOnClickListener 会顺手把视图设成可点的，拆掉时还原
            clickableBefore.remove(view)?.let { view.isClickable = it }
        }
        return true
    }

    // 弱引用：带着监听器的视图被丢掉时（JS 那边的对象被回收了，没走取消订阅），表里的这一项
    // 跟着没了，不连带着把视图和页面留住
    private val clickableBefore = WeakHashMap<View, Boolean>()

    // ---- 页面的密度和系统字号 ----

    private class MetricsWatch(val listener: Consumer<Configuration>, var density: Float, var fontScale: Float)
    private val metricsWatches = WeakHashMap<Activity, MetricsWatch>()

    private fun subscribeMetrics(activity: Activity, on: Boolean) {
        val owner = activity as? ComponentActivity
            ?: throw NacreTypeError("the host activity must extend androidx.activity.ComponentActivity")
        if (on) {
            if (metricsWatches.containsKey(activity)) return
            val resources = activity.resources
            lateinit var watch: MetricsWatch
            val listener = Consumer<Configuration> {
                val density = activity.resources.displayMetrics.density
                val fontScale = activity.resources.configuration.fontScale
                if (density != watch.density || fontScale != watch.fontScale) {
                    watch.density = density
                    watch.fontScale = fontScale
                    host.emitter.plainNow(activity, METRICS_EVENT)
                }
            }
            watch = MetricsWatch(listener, resources.displayMetrics.density, resources.configuration.fontScale)
            metricsWatches[activity] = watch
            owner.addOnConfigurationChangedListener(listener)
        } else {
            metricsWatches.remove(activity)?.let { owner.removeOnConfigurationChangedListener(it.listener) }
        }
    }

    override fun close() {
        for ((activity, watch) in metricsWatches) {
            (activity as? ComponentActivity)?.removeOnConfigurationChangedListener(watch.listener)
        }
        metricsWatches.clear()
    }

    companion object {
        private const val METRICS_EVENT = "@metricschange"
        private const val LAID_OUT_EVENT = "@laidout"
    }
}
