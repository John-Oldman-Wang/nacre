// 滚动这一组：View 上的滚动位置、滚动条、越界效果、边缘渐隐、嵌套滚动和 scroll 事件；
// ScrollView、HorizontalScrollView。JS 那一侧在 builtin/parts/36-scroll.js。
//
// 单位是像素（时长是毫秒）。颜色在 JS 那边解析，过桥的是 ARGB 的无符号整数。
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

    // ---- 枚举 ----

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

    // 位掩码：一位一个名字，读出来按数值从小到大排
    private val scrollIndicators = EnumTable(
        "top" to View.SCROLL_INDICATOR_TOP,
        "bottom" to View.SCROLL_INDICATOR_BOTTOM,
        "left" to View.SCROLL_INDICATOR_LEFT,
        "right" to View.SCROLL_INDICATOR_RIGHT,
        "start" to View.SCROLL_INDICATOR_START,
        "end" to View.SCROLL_INDICATOR_END)
    private val indicatorBits = listOf(
        "top" to View.SCROLL_INDICATOR_TOP, "bottom" to View.SCROLL_INDICATOR_BOTTOM,
        "left" to View.SCROLL_INDICATOR_LEFT, "right" to View.SCROLL_INDICATOR_RIGHT,
        "start" to View.SCROLL_INDICATOR_START, "end" to View.SCROLL_INDICATOR_END)

    // fullScroll / pageScroll / arrowScroll 的方向：Java 用的是焦点的方向常量 FOCUS_*
    private val verticalDirections = EnumTable("up" to View.FOCUS_UP, "down" to View.FOCUS_DOWN)
    private val horizontalDirections = EnumTable("left" to View.FOCUS_LEFT, "right" to View.FOCUS_RIGHT)

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

    private fun argb(c: Int): String = (c.toLong() and 0xFFFFFFFFL).toString()

    private fun quote(s: String): String = "\"$s\""

    private fun nameOf(table: EnumTable<Int>, value: Int): String =
        table.name(value)?.let(::quote) ?: throw IllegalStateException("unknown native value $value")

    private fun drawableArg(objects: List<Any?>, where: String): Drawable? {
        val o = objects.getOrNull(0) ?: return null
        return o as? Drawable ?: throw NacreTypeError("$where: argument 1 must be a Drawable")
    }

    // ---- 造对象 ----

    override fun construct(className: String, args: List<*>, objects: List<Any?>): Any? {
        val context = objects.getOrNull(0) as? android.content.Context
            ?: throw NacreTypeError("new $className: argument 1 must be a Context")
        return when (className) {
            "ScrollView" -> ScrollView(context)
            "HorizontalScrollView" -> HorizontalScrollView(context)
            // View 由 ViewDomain 建（Domains.kt 里它排在前面），不会问到这里
            else -> throw NacreTypeError("Illegal constructor: $className cannot be constructed")
        }
    }

    // ---- 读属性 ----

    override fun read(target: Any, name: String): String? = when (target) {
        is ScrollView -> readScrollView(target, name) ?: readView(target, name)
        is HorizontalScrollView -> readHorizontal(target, name) ?: readView(target, name)
        is View -> readView(target, name)
        else -> null
    }

    private fun readView(v: View, name: String): String? = when (name) {
        "scrollX" -> v.scrollX.toString()
        "scrollY" -> v.scrollY.toString()
        "overScrollMode" -> nameOf(overScrollModes, v.overScrollMode)
        "isVerticalScrollBarEnabled" -> v.isVerticalScrollBarEnabled.toString()
        "isHorizontalScrollBarEnabled" -> v.isHorizontalScrollBarEnabled.toString()
        "isScrollbarFadingEnabled" -> v.isScrollbarFadingEnabled.toString()
        "scrollBarFadeDuration" -> v.scrollBarFadeDuration.toString()
        "scrollBarDefaultDelayBeforeFade" -> v.scrollBarDefaultDelayBeforeFade.toString()
        "scrollBarSize" -> v.scrollBarSize.toString()
        "scrollBarStyle" -> nameOf(scrollBarStyles, v.scrollBarStyle)
        "verticalScrollbarPosition" -> nameOf(scrollbarPositions, v.verticalScrollbarPosition)
        "verticalScrollbarWidth" -> v.verticalScrollbarWidth.toString()
        "scrollIndicators" -> {
            val bits = v.scrollIndicators
            indicatorBits.filter { (_, bit) -> bits and bit != 0 }.joinToString(",", "[", "]") { quote(it.first) }
        }
        "isVerticalFadingEdgeEnabled" -> v.isVerticalFadingEdgeEnabled.toString()
        "isHorizontalFadingEdgeEnabled" -> v.isHorizontalFadingEdgeEnabled.toString()
        "verticalFadingEdgeLength" -> v.verticalFadingEdgeLength.toString()
        "horizontalFadingEdgeLength" -> v.horizontalFadingEdgeLength.toString()
        "isNestedScrollingEnabled" -> v.isNestedScrollingEnabled.toString()
        else -> null
    }

    private fun readScrollView(v: ScrollView, name: String): String? = when (name) {
        "isFillViewport" -> v.isFillViewport.toString()
        "isSmoothScrollingEnabled" -> v.isSmoothScrollingEnabled.toString()
        "maxScrollAmount" -> v.maxScrollAmount.toString()
        "topEdgeEffectColor" -> argb(v.topEdgeEffectColor)
        "bottomEdgeEffectColor" -> argb(v.bottomEdgeEffectColor)
        else -> null
    }

    private fun readHorizontal(v: HorizontalScrollView, name: String): String? = when (name) {
        "isFillViewport" -> v.isFillViewport.toString()
        "isSmoothScrollingEnabled" -> v.isSmoothScrollingEnabled.toString()
        "maxScrollAmount" -> v.maxScrollAmount.toString()
        "leftEdgeEffectColor" -> argb(v.leftEdgeEffectColor)
        "rightEdgeEffectColor" -> argb(v.rightEdgeEffectColor)
        else -> null
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
                // 有一个不认识就整次不生效：先全部换算完再写
                var bits = 0
                for (item in list) bits = bits or scrollIndicators.forProperty(name, item)
                v.scrollIndicators = bits
            }
            "isVerticalFadingEdgeEnabled" -> v.isVerticalFadingEdgeEnabled = bool(value, name)
            "isHorizontalFadingEdgeEnabled" -> v.isHorizontalFadingEdgeEnabled = bool(value, name)
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
            "scrollTo" -> v.scrollTo(int(args.getOrNull(0), name), int(args.getOrNull(1), name))
            "scrollBy" -> v.scrollBy(int(args.getOrNull(0), name), int(args.getOrNull(1), name))
            "canScrollVertically" -> return v.canScrollVertically(int(args.getOrNull(0), name)).toString()
            "canScrollHorizontally" -> return v.canScrollHorizontally(int(args.getOrNull(0), name)).toString()
            "setFadingEdgeLength" -> v.setFadingEdgeLength(int(args.getOrNull(0), name))
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
            "smoothScrollTo" -> v.smoothScrollTo(int(args.getOrNull(0), name), int(args.getOrNull(1), name))
            "smoothScrollBy" -> v.smoothScrollBy(int(args.getOrNull(0), name), int(args.getOrNull(1), name))
            "fling" -> v.fling(int(args.getOrNull(0), name))
            "fullScroll" -> return v.fullScroll(verticalDirections.forArgument("direction", args.getOrNull(0))).toString()
            "pageScroll" -> return v.pageScroll(verticalDirections.forArgument("direction", args.getOrNull(0))).toString()
            "arrowScroll" -> return v.arrowScroll(verticalDirections.forArgument("direction", args.getOrNull(0))).toString()
            "setEdgeEffectColor" -> v.setEdgeEffectColor(color(args.getOrNull(0), name))
            "scrollToDescendant" -> v.scrollToDescendant(
                objects.getOrNull(0) as? View ?: throw NacreTypeError("$name: argument 1 must be a View"))
            else -> return null
        }
        return "null"
    }

    private fun callHorizontal(v: HorizontalScrollView, name: String, args: List<*>): String? {
        when (name) {
            "smoothScrollTo" -> v.smoothScrollTo(int(args.getOrNull(0), name), int(args.getOrNull(1), name))
            "smoothScrollBy" -> v.smoothScrollBy(int(args.getOrNull(0), name), int(args.getOrNull(1), name))
            "fling" -> v.fling(int(args.getOrNull(0), name))
            "fullScroll" -> return v.fullScroll(horizontalDirections.forArgument("direction", args.getOrNull(0))).toString()
            "pageScroll" -> return v.pageScroll(horizontalDirections.forArgument("direction", args.getOrNull(0))).toString()
            "arrowScroll" -> return v.arrowScroll(horizontalDirections.forArgument("direction", args.getOrNull(0))).toString()
            "setEdgeEffectColor" -> v.setEdgeEffectColor(color(args.getOrNull(0), name))
            else -> return null
        }
        return "null"
    }

    override fun callObject(target: Any, name: String, args: List<*>, objects: List<Any?>): Any? {
        val v = target as? View ?: return NOT_MINE
        return when (name) {
            "getVerticalScrollbarThumbDrawable" -> v.verticalScrollbarThumbDrawable
            "getVerticalScrollbarTrackDrawable" -> v.verticalScrollbarTrackDrawable
            "getHorizontalScrollbarThumbDrawable" -> v.horizontalScrollbarThumbDrawable
            "getHorizontalScrollbarTrackDrawable" -> v.horizontalScrollbarTrackDrawable
            else -> NOT_MINE
        }
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
