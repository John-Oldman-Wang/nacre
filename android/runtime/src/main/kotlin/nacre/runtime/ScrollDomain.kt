// 滚动这一组：View 上的滚动位置、滚动条、越界效果、边缘渐隐、嵌套滚动和 scroll 事件；
// ScrollView、HorizontalScrollView。JS 那一侧在 builtin/parts/36-scroll.js。
//
// 状态以 JS 为准（2026-11-26 的总则）：JS 那边已经把 dp 换成了像素、查过类型和范围，这里只管设。
// 只有滚动位置读原生（系统也会改：手指一划就变）。颜色过桥的是 ARGB 的无符号整数。
package nacre.runtime

import android.graphics.drawable.Drawable
import android.view.View
import android.widget.HorizontalScrollView
import android.widget.ScrollView

internal class ScrollDomain(host: DomainHost) : Domain(host) {

    override val classes: Map<Class<*>, String> = mapOf(
        // View 由 ViewDomain 建；这里登记它，是为了 View 上的滚动成员也来问这一组
        View::class.java to "View",
        ScrollView::class.java to "ScrollView",
        HorizontalScrollView::class.java to "HorizontalScrollView",
    )

    // ---- 枚举（名字交给 JS，写错的在 JS 里当场查）----

    private val overScrollModes = EnumTable(
        "always" to View.OVER_SCROLL_ALWAYS,
        "ifContentScrolls" to View.OVER_SCROLL_IF_CONTENT_SCROLLS,
        "never" to View.OVER_SCROLL_NEVER)

    private val scrollBarStyles = EnumTable(
        "insideOverlay" to View.SCROLLBARS_INSIDE_OVERLAY,
        "insideInset" to View.SCROLLBARS_INSIDE_INSET,
        "outsideOverlay" to View.SCROLLBARS_OUTSIDE_OVERLAY,
        "outsideInset" to View.SCROLLBARS_OUTSIDE_INSET)

    private val scrollbarPositions = EnumTable(
        "default" to View.SCROLLBAR_POSITION_DEFAULT,
        "left" to View.SCROLLBAR_POSITION_LEFT,
        "right" to View.SCROLLBAR_POSITION_RIGHT)

    // 位掩码：一位一个名字
    private val scrollIndicators = EnumTable(
        "top" to View.SCROLL_INDICATOR_TOP,
        "bottom" to View.SCROLL_INDICATOR_BOTTOM,
        "left" to View.SCROLL_INDICATOR_LEFT,
        "right" to View.SCROLL_INDICATOR_RIGHT,
        "start" to View.SCROLL_INDICATOR_START,
        "end" to View.SCROLL_INDICATOR_END)

    // 滚动的方向。canScroll 四个都收；fullScroll / pageScroll / arrowScroll 在 Java 里用焦点的方向常量
    // FOCUS_*，竖的只收 up / down，横的只收 left / right（JS 那边分开查）
    private val directions = EnumTable(
        "up" to View.FOCUS_UP,
        "down" to View.FOCUS_DOWN,
        "left" to View.FOCUS_LEFT,
        "right" to View.FOCUS_RIGHT)

    override val enums: Map<String, EnumTable<*>> = mapOf(
        "overScrollMode" to overScrollModes,
        "scrollBarStyle" to scrollBarStyles,
        "verticalScrollbarPosition" to scrollbarPositions,
        "scrollIndicator" to scrollIndicators,
        "scrollDirection" to directions,
    )

    // ---- 值的转换（JS 那边已经照 Web IDL 转好了类型，这里只校验）----

    private fun int(v: Any?, what: String): Int =
        (v as? Double)?.toInt() ?: throw NacreTypeError("$what must be a number")

    private fun bool(v: Any?, what: String): Boolean =
        v as? Boolean ?: throw NacreTypeError("$what must be a boolean")

    private fun color(v: Any?, what: String): Int {
        val d = v as? Double ?: throw NacreTypeError("$what must be a color")
        if (d < 0 || d > 0xFFFFFFFFL.toDouble() || d != Math.floor(d)) throw NacreTypeError("$what must be a color")
        return d.toLong().toInt()
    }

    private fun drawableArg(objects: List<Any?>, where: String): Drawable? {
        val o = objects.getOrNull(0) ?: return null
        return o as? Drawable ?: throw NacreTypeError("$where: argument 1 must be a Drawable")
    }

    // ---- 造对象 ----

    // 挂上时由 10-view.js 建：参数里第一个对象是页面。不带系统的默认样式（defStyleAttr = 0）：滚动条、
    // 渐隐都关着，滚动条也没有滑块，样式由 JS 定（默认值实测过，见 docs/internals/android.md「滚动」）
    override fun construct(className: String, args: List<*>, objects: List<Any?>): Any? {
        val context = objects.getOrNull(0) as? android.content.Context
            ?: throw NacreTypeError("new $className: argument 1 must be a Context")
        return when (className) {
            "ScrollView" -> ScrollView(context, null, 0)
            "HorizontalScrollView" -> HorizontalScrollView(context, null, 0)
            // View 由 ViewDomain 建（Domains.kt 里它排在前面），不会问到这里
            else -> throw NacreTypeError("Illegal constructor: $className cannot be constructed")
        }
    }

    // ---- 读属性：只有滚动位置（像素）----

    override fun read(target: Any, name: String): String? {
        val v = target as? View ?: return null
        return when (name) {
            "scrollX" -> v.scrollX.toString()
            "scrollY" -> v.scrollY.toString()
            else -> null
        }
    }

    // ---- 写属性 ----

    override fun write(target: Any, name: String, value: Any?): Boolean = when (target) {
        is ScrollView -> writeScrollView(target, name, value) || writeView(target, name, value)
        is HorizontalScrollView -> writeHorizontal(target, name, value) || writeView(target, name, value)
        is View -> writeView(target, name, value)
        else -> false
    }

    private fun writeView(v: View, name: String, value: Any?): Boolean {
        when (name) {
            // ScrollView 覆写了 scrollTo，夹在内容的范围里
            "scrollX" -> v.scrollX = int(value, name)
            "scrollY" -> v.scrollY = int(value, name)
            "overScrollMode" -> v.overScrollMode = overScrollModes.forProperty(name, value)
            "isVerticalScrollBarEnabled" -> v.isVerticalScrollBarEnabled = bool(value, name)
            "isHorizontalScrollBarEnabled" -> v.isHorizontalScrollBarEnabled = bool(value, name)
            "isScrollbarFadingEnabled" -> v.isScrollbarFadingEnabled = bool(value, name)
            "scrollBarFadeDuration" -> v.scrollBarFadeDuration = int(value, name)
            "scrollBarDefaultDelayBeforeFade" -> v.scrollBarDefaultDelayBeforeFade = int(value, name)
            "scrollBarSize" -> v.scrollBarSize = int(value, name)
            "scrollBarStyle" -> v.scrollBarStyle = scrollBarStyles.forProperty(name, value)
            "verticalScrollbarPosition" -> v.verticalScrollbarPosition = scrollbarPositions.forProperty(name, value)
            "scrollIndicators" -> {
                val list = value as? List<*> ?: throw NacreTypeError("$name must be an array")
                var bits = 0
                for (item in list) bits = bits or scrollIndicators.forProperty(name, item)
                v.scrollIndicators = bits
            }
            "isVerticalFadingEdgeEnabled" -> v.isVerticalFadingEdgeEnabled = bool(value, name)
            "isHorizontalFadingEdgeEnabled" -> v.isHorizontalFadingEdgeEnabled = bool(value, name)
            "fadingEdgeLength" -> v.setFadingEdgeLength(int(value, name))
            "isNestedScrollingEnabled" -> v.isNestedScrollingEnabled = bool(value, name)
            else -> return false
        }
        return true
    }

    private fun writeScrollView(v: ScrollView, name: String, value: Any?): Boolean {
        when (name) {
            "isFillViewport" -> v.isFillViewport = bool(value, name)
            "isSmoothScrollingEnabled" -> v.isSmoothScrollingEnabled = bool(value, name)
            "topEdgeEffectColor" -> v.topEdgeEffectColor = color(value, name)
            "bottomEdgeEffectColor" -> v.bottomEdgeEffectColor = color(value, name)
            else -> return false
        }
        return true
    }

    private fun writeHorizontal(v: HorizontalScrollView, name: String, value: Any?): Boolean {
        when (name) {
            "isFillViewport" -> v.isFillViewport = bool(value, name)
            "isSmoothScrollingEnabled" -> v.isSmoothScrollingEnabled = bool(value, name)
            "leftEdgeEffectColor" -> v.leftEdgeEffectColor = color(value, name)
            "rightEdgeEffectColor" -> v.rightEdgeEffectColor = color(value, name)
            else -> return false
        }
        return true
    }

    // ---- 方法 ----

    override fun call(target: Any, name: String, args: List<*>, objects: List<Any?>): String? {
        if (target is ScrollView) callScrollView(target, name, args, objects)?.let { return it }
        if (target is HorizontalScrollView) callHorizontal(target, name, args)?.let { return it }
        val v = target as? View ?: return null
        when (name) {
            // 能不能往这个方向滚（Java 用正负号）
            "canScroll" -> return when (directions.forArgument("direction", args.getOrNull(0))) {
                View.FOCUS_UP -> v.canScrollVertically(-1)
                View.FOCUS_DOWN -> v.canScrollVertically(1)
                View.FOCUS_LEFT -> v.canScrollHorizontally(-1)
                else -> v.canScrollHorizontally(1)
            }.toString()
            "setVerticalScrollbarThumbDrawable" -> v.verticalScrollbarThumbDrawable = drawableArg(objects, name)
            "setVerticalScrollbarTrackDrawable" -> v.verticalScrollbarTrackDrawable = drawableArg(objects, name)
            "setHorizontalScrollbarThumbDrawable" -> v.horizontalScrollbarThumbDrawable = drawableArg(objects, name)
            "setHorizontalScrollbarTrackDrawable" -> v.horizontalScrollbarTrackDrawable = drawableArg(objects, name)
            else -> return null
        }
        return "null"
    }

    private fun callScrollView(v: ScrollView, name: String, args: List<*>, objects: List<Any?>): String? {
        when (name) {
            // 只收竖的那个方向
            "smoothScrollTo" -> v.smoothScrollTo(v.scrollX, int(args.getOrNull(0), name))
            "fling" -> v.fling(int(args.getOrNull(0), name))
            "fullScroll" -> return v.fullScroll(directions.forArgument("direction", args.getOrNull(0))).toString()
            "pageScroll" -> return v.pageScroll(directions.forArgument("direction", args.getOrNull(0))).toString()
            "arrowScroll" -> return v.arrowScroll(directions.forArgument("direction", args.getOrNull(0))).toString()
            "scrollToDescendant" -> v.scrollToDescendant(
                objects.getOrNull(0) as? View ?: throw NacreTypeError("$name: argument 1 must be a View"))
            else -> return null
        }
        return "null"
    }

    private fun callHorizontal(v: HorizontalScrollView, name: String, args: List<*>): String? {
        when (name) {
            "smoothScrollTo" -> v.smoothScrollTo(int(args.getOrNull(0), name), v.scrollY)
            "fling" -> v.fling(int(args.getOrNull(0), name))
            "fullScroll" -> return v.fullScroll(directions.forArgument("direction", args.getOrNull(0))).toString()
            "pageScroll" -> return v.pageScroll(directions.forArgument("direction", args.getOrNull(0))).toString()
            "arrowScroll" -> return v.arrowScroll(directions.forArgument("direction", args.getOrNull(0))).toString()
            else -> return null
        }
        return "null"
    }

    // scroll：有人订阅才装 OnScrollChangeListener，最后一个监听摘掉时拆掉。回调带的新旧位置
    // 不交出去：位置读 scrollX / scrollY（和 Web、iOS 一样，事件不带数据）
    override fun subscribe(target: Any, type: String, on: Boolean): Boolean {
        val view = target as? View ?: return false
        if (type != "scroll") return false
        if (on) {
            view.setOnScrollChangeListener { v, _, _, _, _ -> host.emitter.plain(v, "scroll") }
        } else {
            view.setOnScrollChangeListener(null)
        }
        return true
    }
}
