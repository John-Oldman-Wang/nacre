// 布局这一组（2026-11-27 照「接类的总则」重写）：子视图的 LayoutParams（JS 里是 view.layout）、
// 读排版结果（frame、位置、measure）、layoutchange 事件；LinearLayout、FrameLayout、ConstraintLayout
// 自己的状态，ViewGroup 的 clipChildren / clipToPadding。JS 那一侧在 builtin/parts/31-layout.js。
//
// 状态以 JS 为准：这里只把 JS 交来的值设到原生（长度已经换成像素，名字已经在 JS 里查过），不读回去。
// 页面值（frame、位置）读原生。@ 开头的成员只给 31-layout.js 用，不是 API：
//   @layout                   子视图放进父视图之后（或者 layout 改了），按父视图的类型建 LayoutParams
//   @frame / @locationInWindow / @locationOnScreen   排版的结果，像素；没排过版是 null
//   @measure                  按给的条件量一次，交回量出来的像素
//   @id                       视图的 id（ConstraintLayout 按 id 找约束的目标，由 JS 发）
//   @layout.viewId（类级）     发一个新的 id（View.generateViewId()）
package nacre.runtime

import android.content.Context
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.LinearLayout
import androidx.constraintlayout.widget.ConstraintLayout

private typealias CLParams = ConstraintLayout.LayoutParams
private typealias LLParams = LinearLayout.LayoutParams
private typealias FLParams = FrameLayout.LayoutParams
private typealias MarginParams = ViewGroup.MarginLayoutParams
private typealias BaseParams = ViewGroup.LayoutParams

internal class LayoutDomain(host: DomainHost) : Domain(host) {

    override val classes: Map<Class<*>, String> = mapOf(
        View::class.java to "View",
        ViewGroup::class.java to "ViewGroup",
        LinearLayout::class.java to "LinearLayout",
        FrameLayout::class.java to "FrameLayout",
        ConstraintLayout::class.java to "ConstraintLayout",
    )

    // ---- 名字 ↔ 数值（按数值从小到大）----

    private val sizes = EnumTable(
        "wrapContent" to BaseParams.WRAP_CONTENT,
        "matchParent" to BaseParams.MATCH_PARENT,
        "matchConstraint" to CLParams.MATCH_CONSTRAINT,
    )
    private val dividers = EnumTable(
        "beginning" to LinearLayout.SHOW_DIVIDER_BEGINNING,
        "middle" to LinearLayout.SHOW_DIVIDER_MIDDLE,
        "end" to LinearLayout.SHOW_DIVIDER_END,
    )
    private val chainStyles = EnumTable(
        "spread" to CLParams.CHAIN_SPREAD,
        "spreadInside" to CLParams.CHAIN_SPREAD_INSIDE,
        "packed" to CLParams.CHAIN_PACKED,
    )
    private val wrapBehaviors = EnumTable(
        "included" to CLParams.WRAP_BEHAVIOR_INCLUDED,
        "horizontalOnly" to CLParams.WRAP_BEHAVIOR_HORIZONTAL_ONLY,
        "verticalOnly" to CLParams.WRAP_BEHAVIOR_VERTICAL_ONLY,
        "skipped" to CLParams.WRAP_BEHAVIOR_SKIPPED,
    )
    private val measureModes = EnumTable(
        "unspecified" to View.MeasureSpec.UNSPECIFIED,
        "exactly" to View.MeasureSpec.EXACTLY,
        "atMost" to View.MeasureSpec.AT_MOST,
    )

    // Gravity 的三张表（gravityHorizontal / gravityVertical / gravityClip）和文字组共用一份，在 Gravity.kt。
    // 表名只能一个域登记：文字组（TextDomain）和这里谁先合进 main 谁登记，后合的删掉这里的 + Gravities.enums。
    // 布局的 gravity 水平方向只用 start / end，不收 left / right，JS 那边（31-layout.js）挑掉
    override val enums: Map<String, EnumTable<*>> = mapOf(
        "layoutSize" to sizes,
        "showDividers" to dividers,
        "chainStyle" to chainStyles,
        "wrapBehavior" to wrapBehaviors,
    ) + Gravities.enums

    // ---- 造对象：挂上时由 10-view.js 建，参数里第一个对象是那个页面 ----

    override fun construct(className: String, args: List<*>, objects: List<Any?>): Any? {
        val context = objects.getOrNull(0) as? Context
            ?: throw NacreTypeError("new $className: argument 1 must be a Context")
        return when (className) {
            "FrameLayout" -> FrameLayout(context)
            "ConstraintLayout" -> ConstraintLayout(context)
            else -> null
        }
    }

    // ---- 页面值：排版的结果，像素；没排过版是 null ----

    override fun read(target: Any, name: String): String? {
        if (target !is View) return null
        return when (name) {
            "@frame" -> if (!target.isLaidOut) "null"
                else "[${target.left},${target.top},${target.width},${target.height}]"
            "@locationInWindow", "@locationOnScreen" -> if (!target.isLaidOut) "null" else {
                val xy = IntArray(2)
                if (name == "@locationInWindow") target.getLocationInWindow(xy) else target.getLocationOnScreen(xy)
                "[${xy[0]},${xy[1]}]"
            }
            else -> null
        }
    }

    // ---- 状态：JS 交来的值已经转好了（长度是像素），这里只校验类型 ----

    override fun write(target: Any, name: String, value: Any?): Boolean {
        if (target !is View) return false
        when (name) {
            // ConstraintLayout 按 id 找约束的目标，id 由 JS 发（见 31-layout.js）
            "@id" -> { target.id = int(value, name); return true }
            "minimumWidth" -> { target.minimumWidth = int(value, name); return true }
            "minimumHeight" -> { target.minimumHeight = int(value, name); return true }
        }
        if (target is ViewGroup) when (name) {
            "clipChildren" -> { target.clipChildren = bool(value, name); return true }
            "clipToPadding" -> { target.clipToPadding = bool(value, name); return true }
        }
        if (target is LinearLayout) when (name) {
            "gravity" -> { target.gravity = gravity(value, name); return true }
            // null 是「按子视图的权重加起来算」：Java 里写 0 也是这个意思（大于 0 才用它）
            "weightSum" -> { target.weightSum = if (value == null) 0f else float(value, name); return true }
            "isBaselineAligned" -> { target.isBaselineAligned = bool(value, name); return true }
            "isMeasureWithLargestChildEnabled" -> { target.isMeasureWithLargestChildEnabled = bool(value, name); return true }
            "showDividers" -> { target.showDividers = names(value, name).fold(0) { acc, n -> acc or dividers.forArgument(name, n) }; return true }
            "dividerPadding" -> { target.dividerPadding = int(value, name); return true }
        }
        if (target is FrameLayout && name == "measureAllChildren") {
            target.measureAllChildren = bool(value, name)
            return true
        }
        if (target is ConstraintLayout) when (name) {
            "minWidth" -> { target.minWidth = int(value, name); return true }
            "minHeight" -> { target.minHeight = int(value, name); return true }
            // null 是不限：ConstraintLayout 自己的默认值就是 Integer.MAX_VALUE
            "maxWidth" -> { target.maxWidth = if (value == null) Int.MAX_VALUE else int(value, name); return true }
            "maxHeight" -> { target.maxHeight = if (value == null) Int.MAX_VALUE else int(value, name); return true }
        }
        return false
    }

    // ---- 方法 ----

    override fun call(target: Any, name: String, args: List<*>, objects: List<Any?>): String? {
        if (target !is View) return null
        when (name) {
            "@layout" -> applyLayout(target, args.getOrNull(0) as? Map<*, *>
                ?: throw NacreTypeError("@layout: expected an object"))
            "@measure" -> return measure(target, args)
            else -> return null
        }
        return "null"
    }

    override fun classCall(className: String, name: String, args: List<*>, objects: List<Any?>): String? =
        if (className == "@layout" && name == "viewId") View.generateViewId().toString() else null

    // ---- 子视图的 LayoutParams ----
    //
    // 每次都按父视图现在的类型建一个新的：父视图自己的 generateLayoutParams（protected 的公开接口，
    // 按父视图的实际类型分派）把宽高转成它的类型，再填外边距和各个类型自己的字段。宽高是 null 时用
    // 父视图的 generateDefaultLayoutParams（竖向 LinearLayout 是 matchParent × wrapContent，
    // FrameLayout 是 matchParent × matchParent，ConstraintLayout 是 wrapContent × wrapContent）。
    // 认不出来的父视图（以后别的组的 ViewGroup）只设宽高和外边距
    private fun applyLayout(child: View, spec: Map<*, *>) {
        val parent = child.parent as? ViewGroup ?: return
        val inConstraint = parent is ConstraintLayout
        val width = size(spec["width"], inConstraint, "width")
        val height = size(spec["height"], inConstraint, "height")
        val defaults = if (width == null || height == null) generateDefault(parent) else null
        val params = generate(parent, BaseParams(width ?: defaults!!.width, height ?: defaults!!.height))
        if (params is MarginParams) {
            val m = ints(spec["margin"], 4, "margin")
            params.marginStart = m[0]
            params.topMargin = m[1]
            params.marginEnd = m[2]
            params.bottomMargin = m[3]
        }
        when (params) {
            is LLParams -> {
                params.weight = float(spec["weight"], "weight")
                params.gravity = spec["gravity"]?.let { gravity(it, "gravity") } ?: -1
            }
            is FLParams -> params.gravity = spec["gravity"]?.let { gravity(it, "gravity") } ?: FLParams.UNSPECIFIED_GRAVITY
            is CLParams -> (spec["constraints"] as? Map<*, *>)?.let { constrain(params, it) }
        }
        child.layoutParams = params
    }

    // 宽高：像素、名字，null 是用父视图的默认值。matchConstraint 只有 ConstraintLayout 认，
    // 别的父视图下 JS 那边已经换成了 null
    private fun size(value: Any?, inConstraint: Boolean, where: String): Int? = when (value) {
        null -> null
        is Double -> value.toInt()
        "matchConstraint" -> if (inConstraint) CLParams.MATCH_CONSTRAINT else null
        is String -> sizes.forArgument(where, value)
        else -> throw NacreTypeError("$where: expected a size in pixels or a name")
    }

    // ViewGroup 的这两个是 protected 的公开接口（不是隐藏的接口），按父视图的实际类型分派
    private val generateFrom = ViewGroup::class.java
        .getDeclaredMethod("generateLayoutParams", BaseParams::class.java)
        .apply { isAccessible = true }
    private val generateDefaultMethod = ViewGroup::class.java
        .getDeclaredMethod("generateDefaultLayoutParams")
        .apply { isAccessible = true }

    private fun generate(parent: ViewGroup, from: BaseParams): BaseParams =
        generateFrom.invoke(parent, from) as BaseParams

    private fun generateDefault(parent: ViewGroup): BaseParams =
        generateDefaultMethod.invoke(parent) as BaseParams

    // ---- ConstraintLayout 的约束：JS 已经把目标换成了 id（指父视图是 "parent"）----

    private fun constrain(p: CLParams, c: Map<*, *>) {
        (c["anchors"] as? Map<*, *>)?.forEach { (field, target) ->
            val set = anchors[field] ?: throw NacreTypeError("constraints: unknown anchor $field")
            set(p, targetId(target, "constraints"))
        }
        p.horizontalBias = float(c["horizontalBias"], "horizontalBias")
        p.verticalBias = float(c["verticalBias"], "verticalBias")
        p.horizontalChainStyle = chainStyles.forArgument("horizontalChainStyle", c["horizontalChainStyle"])
        p.verticalChainStyle = chainStyles.forArgument("verticalChainStyle", c["verticalChainStyle"])
        // 链的权重：没设是 UNSET（-1）
        p.horizontalWeight = (c["horizontalWeight"] as? Double)?.toFloat() ?: CLParams.UNSET.toFloat()
        p.verticalWeight = (c["verticalWeight"] as? Double)?.toFloat() ?: CLParams.UNSET.toFloat()
        p.dimensionRatio = c["dimensionRatio"] as? String
        p.constrainedWidth = bool(c["constrainedWidth"], "constrainedWidth")
        p.constrainedHeight = bool(c["constrainedHeight"], "constrainedHeight")
        // matchConstraint 的大小：给了百分比是 percent，不然是 spread（填满两个锚点之间）。
        // 最大值 0 在 ConstraintLayout 里是不限
        val widthPercent = c["widthPercent"] as? Double
        p.matchConstraintDefaultWidth =
            if (widthPercent != null) CLParams.MATCH_CONSTRAINT_PERCENT else CLParams.MATCH_CONSTRAINT_SPREAD
        if (widthPercent != null) p.matchConstraintPercentWidth = widthPercent.toFloat()
        val heightPercent = c["heightPercent"] as? Double
        p.matchConstraintDefaultHeight =
            if (heightPercent != null) CLParams.MATCH_CONSTRAINT_PERCENT else CLParams.MATCH_CONSTRAINT_SPREAD
        if (heightPercent != null) p.matchConstraintPercentHeight = heightPercent.toFloat()
        p.matchConstraintMinWidth = int(c["minWidth"], "minWidth")
        p.matchConstraintMinHeight = int(c["minHeight"], "minHeight")
        p.matchConstraintMaxWidth = (c["maxWidth"] as? Double)?.toInt() ?: 0
        p.matchConstraintMaxHeight = (c["maxHeight"] as? Double)?.toInt() ?: 0
        (c["circle"] as? List<*>)?.let { circle ->
            p.circleConstraint = targetId(circle.getOrNull(0), "circle")
            p.circleRadius = int(circle.getOrNull(1), "circle.radius")
            p.circleAngle = float(circle.getOrNull(2), "circle.angle")
        }
        // 隐藏时的外边距：上、下、起、止、基线，没设是 GONE_UNSET
        val gone = (c["goneMargin"] as? List<*>)?.map { (it as? Double)?.toInt() ?: CLParams.GONE_UNSET }
        if (gone != null && gone.size == 5) {
            p.goneTopMargin = gone[0]
            p.goneBottomMargin = gone[1]
            p.goneStartMargin = gone[2]
            p.goneEndMargin = gone[3]
            p.goneBaselineMargin = gone[4]
        }
        p.baselineMargin = int(c["baselineMargin"], "baselineMargin")
        p.wrapBehaviorInParent = wrapBehaviors.forArgument("wrapBehaviorInParent", c["wrapBehaviorInParent"])
    }

    private fun targetId(value: Any?, where: String): Int = when (value) {
        "parent" -> CLParams.PARENT_ID
        is Double -> value.toInt()
        else -> throw NacreTypeError("$where: expected \"parent\" or a view id")
    }

    private val anchors: Map<String, (CLParams, Int) -> Unit> = mapOf(
        "startToStart" to { p, v -> p.startToStart = v },
        "startToEnd" to { p, v -> p.startToEnd = v },
        "endToStart" to { p, v -> p.endToStart = v },
        "endToEnd" to { p, v -> p.endToEnd = v },
        "topToTop" to { p, v -> p.topToTop = v },
        "topToBottom" to { p, v -> p.topToBottom = v },
        "bottomToTop" to { p, v -> p.bottomToTop = v },
        "bottomToBottom" to { p, v -> p.bottomToBottom = v },
        "baselineToBaseline" to { p, v -> p.baselineToBaseline = v },
        "baselineToTop" to { p, v -> p.baselineToTop = v },
        "baselineToBottom" to { p, v -> p.baselineToBottom = v },
    )

    // ---- 量一次 ----
    //
    // 参数是宽、高各一对（模式的名字、像素）。量完之后量出来的和上一次不一样，就请求重新排版：
    // 父视图之后摆它时用的是量出来的大小，不重新量的话会按这次的结果摆
    private fun measure(v: View, args: List<*>): String {
        if (args.size < 4) throw NacreTypeError("@measure: expected 4 values")
        val widthSpec = spec(args[0], args[1])
        val heightSpec = spec(args[2], args[3])
        val oldWidth = v.measuredWidth
        val oldHeight = v.measuredHeight
        v.measure(widthSpec, heightSpec)
        val width = v.measuredWidth
        val height = v.measuredHeight
        if (width != oldWidth || height != oldHeight) v.requestLayout()
        return "[$width,$height]"
    }

    private fun spec(mode: Any?, size: Any?): Int =
        View.MeasureSpec.makeMeasureSpec(int(size, "measure").coerceIn(0, MAX_SPEC_SIZE), measureModes.forArgument("measure", mode))

    // ---- 事件：layoutchange ----

    private val layoutListeners = java.util.WeakHashMap<View, View.OnLayoutChangeListener>()

    override fun subscribe(target: Any, type: String, on: Boolean): Boolean {
        if (target !is View || type != "layoutchange") return false
        if (on) {
            // 系统每次排版都来调，四边没变也调。只在四边变了时发：不然 JS 在监听器里改一次 layout，
            // 就会一直排下去。不带数据，位置读 frame。回调里拿的是 View 本身，不是编号
            val listener = View.OnLayoutChangeListener { v, l, t, r, b, ol, ot, or, ob ->
                if (l != ol || t != ot || r != or || b != ob) host.emitter.plain(v, "layoutchange")
            }
            layoutListeners.put(target, listener)?.let(target::removeOnLayoutChangeListener)
            target.addOnLayoutChangeListener(listener)
        } else {
            layoutListeners.remove(target)?.let(target::removeOnLayoutChangeListener)
        }
        return true
    }

    override fun close() {
        for ((view, listener) in layoutListeners) view.removeOnLayoutChangeListener(listener)
        layoutListeners.clear()
    }

    // ---- 小助手：JS 那边已经照 Web IDL 转好了，这里只校验 ----

    // Gravity 的名字数组 → 数值（Gravity.kt）。名字 JS 那边查过了，这里再挡一次
    private fun gravity(value: Any?, where: String): Int = Gravities.forArgument(value, where)

    private fun names(value: Any?, where: String): List<*> =
        value as? List<*> ?: throw NacreTypeError("$where: expected an array of names")

    private fun int(value: Any?, where: String): Int =
        (value as? Double)?.toInt() ?: throw NacreTypeError("$where: expected a number")

    private fun ints(value: Any?, count: Int, where: String): List<Int> {
        val list = value as? List<*>
        if (list == null || list.size != count) throw NacreTypeError("$where: expected $count numbers")
        return list.map { int(it, where) }
    }

    private fun float(value: Any?, where: String): Float =
        (value as? Double)?.toFloat() ?: throw NacreTypeError("$where: expected a number")

    private fun bool(value: Any?, where: String): Boolean =
        value as? Boolean ?: throw NacreTypeError("$where: expected a boolean")

    companion object {
        private const val MAX_SPEC_SIZE = (1 shl 30) - 1
    }
}
