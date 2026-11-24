// 布局这一组：ViewGroup.LayoutParams 一族、LinearLayout、FrameLayout、ConstraintLayout，
// View 上读布局结果的成员、ViewGroup 的层级操作、layoutchange 事件。
// JS 那一侧在 builtin/parts/31-layout.js。单位都是像素，照 Android 原样。
//
// 枚举（宽高的 matchParent、Gravity、orientation……）的名字和数值的映射只在这里。
// 写错时按位置分：属性抛 NacreWarning（JS 那边打一条警告、值不变），方法参数和构造抛
// NacreTypeError。措辞照 Enums.kt 的 EnumTable。
package nacre.runtime

import android.content.Context
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.LinearLayout
import androidx.constraintlayout.widget.ConstraintLayout
import org.json.JSONObject
import java.util.IdentityHashMap

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
        BaseParams::class.java to "ViewGroup.LayoutParams",
        MarginParams::class.java to "ViewGroup.MarginLayoutParams",
        LLParams::class.java to "LinearLayout.LayoutParams",
        FLParams::class.java to "FrameLayout.LayoutParams",
        CLParams::class.java to "ConstraintLayout.LayoutParams",
    )

    // 宽高和 Gravity 的名字写错：调用的地方按位置换成 NacreTypeError（参数）或 NacreWarning（属性）
    private class EnumProblem(message: String) : Exception(message)

    // ---- 造对象 ----

    override fun construct(className: String, args: List<*>, objects: List<Any?>): Any? {
        when (className) {
            "FrameLayout" -> return FrameLayout(contextArg(objects, className))
            "ConstraintLayout" -> return ConstraintLayout(contextArg(objects, className))
        }
        val source = objects.getOrNull(0) as? BaseParams
        if (source != null) return copyParams(className, source)
        if (args.size < 2) throw NacreTypeError("new $className: expected (width, height) or a LayoutParams to copy")
        val constraint = className == "ConstraintLayout.LayoutParams"
        val width = typeErrors { dimension(args[0], constraint, "width") }
        val height = typeErrors { dimension(args[1], constraint, "height") }
        val third = args.getOrNull(2)
        return when (className) {
            "ViewGroup.LayoutParams" -> BaseParams(width, height)
            "ViewGroup.MarginLayoutParams" -> MarginParams(width, height)
            "LinearLayout.LayoutParams" -> if (third == null) LLParams(width, height)
                else LLParams(width, height, (third as? Double)?.toFloat()
                    ?: throw NacreTypeError("new $className: weight must be a number"))
            "FrameLayout.LayoutParams" -> if (third == null) FLParams(width, height)
                else FLParams(width, height, typeErrors { gravity(third, "gravity", Gravities.Axis.BOTH) })
            "ConstraintLayout.LayoutParams" -> CLParams(width, height)
            else -> null
        }
    }

    private fun contextArg(objects: List<Any?>, className: String): Context =
        objects.getOrNull(0) as? Context ?: throw NacreTypeError("new $className: argument 1 must be a Context")

    // 拷贝构造：Java 按参数的静态类型选重载，这里按实际的类型挑最具体的那个
    private fun copyParams(className: String, src: BaseParams): Any? = when (className) {
        "ViewGroup.LayoutParams" -> BaseParams(src)
        "ViewGroup.MarginLayoutParams" -> if (src is MarginParams) MarginParams(src) else MarginParams(src)
        "LinearLayout.LayoutParams" -> when (src) {
            is LLParams -> LLParams(src)
            is MarginParams -> LLParams(src)
            else -> LLParams(src)
        }
        "FrameLayout.LayoutParams" -> when (src) {
            is FLParams -> FLParams(src)
            is MarginParams -> FLParams(src)
            else -> FLParams(src)
        }
        "ConstraintLayout.LayoutParams" -> CLParams(src)
        else -> null
    }

    // ---- 读属性 ----

    override fun read(target: Any, name: String): String? {
        when (target) {
            is BaseParams -> return readParams(target, name)
            is View -> {
                readView(target, name)?.let { return it }
                if (target is LinearLayout) readLinear(target, name)?.let { return it }
                if (target is FrameLayout && name == "measureAllChildren") return target.measureAllChildren.toString()
                if (target is ConstraintLayout) return when (name) {
                    "minWidth" -> target.minWidth.toString()
                    "minHeight" -> target.minHeight.toString()
                    "maxWidth" -> target.maxWidth.toString()
                    "maxHeight" -> target.maxHeight.toString()
                    else -> null
                }
            }
        }
        return null
    }

    private fun readView(v: View, name: String): String? = when (name) {
        "left" -> v.left.toString()
        "top" -> v.top.toString()
        "right" -> v.right.toString()
        "bottom" -> v.bottom.toString()
        "width" -> v.width.toString()
        "height" -> v.height.toString()
        "measuredWidth" -> v.measuredWidth.toString()
        "measuredHeight" -> v.measuredHeight.toString()
        "isLaidOut" -> v.isLaidOut.toString()
        "isLayoutRequested" -> v.isLayoutRequested.toString()
        "minimumWidth" -> v.minimumWidth.toString()
        "minimumHeight" -> v.minimumHeight.toString()
        "id" -> if (v.id == View.NO_ID) "null" else v.id.toString()
        else -> null
    }

    private fun readLinear(l: LinearLayout, name: String): String? = when (name) {
        "orientation" -> enumJson(orientations, l.orientation)
        "gravity" -> gravityJson(l.gravity)
        "weightSum" -> num(l.weightSum)
        "isBaselineAligned" -> l.isBaselineAligned.toString()
        "baselineAlignedChildIndex" -> l.baselineAlignedChildIndex.let { if (it < 0) "null" else it.toString() }
        "isMeasureWithLargestChildEnabled" -> l.isMeasureWithLargestChildEnabled.toString()
        "showDividers" -> dividerBits.filter { (l.showDividers and it) != 0 }
            .joinToString(",", "[", "]") { JSONObject.quote(dividers.name(it)) }
        "dividerPadding" -> l.dividerPadding.toString()
        else -> null
    }

    private fun readParams(p: BaseParams, name: String): String? {
        val constraint = p is CLParams
        when (name) {
            "width" -> return dimensionJson(p.width, constraint)
            "height" -> return dimensionJson(p.height, constraint)
        }
        if (p is MarginParams) when (name) {
            "leftMargin" -> return p.leftMargin.toString()
            "topMargin" -> return p.topMargin.toString()
            "rightMargin" -> return p.rightMargin.toString()
            "bottomMargin" -> return p.bottomMargin.toString()
            "marginStart" -> return p.marginStart.toString()
            "marginEnd" -> return p.marginEnd.toString()
            "isMarginRelative" -> return p.isMarginRelative.toString()
        }
        when (p) {
            is LLParams -> when (name) {
                "weight" -> return num(p.weight)
                "gravity" -> return gravityJson(p.gravity)
            }
            is FLParams -> if (name == "gravity") return gravityJson(p.gravity)
            is CLParams -> return readConstraint(p, name)
        }
        return null
    }

    // ---- 写属性 ----

    override fun write(target: Any, name: String, value: Any?): Boolean {
        if (warnings { writeEnum(target, name, value) }) return true
        when (target) {
            is BaseParams -> return writeParams(target, name, value)
            is View -> {
                when (name) {
                    "minimumWidth" -> { target.minimumWidth = int(value, name); return true }
                    "minimumHeight" -> { target.minimumHeight = int(value, name); return true }
                    "id" -> { target.id = if (value == null) View.NO_ID else int(value, name); return true }
                }
                if (target is LinearLayout) when (name) {
                    "weightSum" -> { target.weightSum = float(value, name); return true }
                    "isBaselineAligned" -> { target.isBaselineAligned = bool(value, name); return true }
                    "baselineAlignedChildIndex" -> { target.baselineAlignedChildIndex = int(value, name); return true }
                    "isMeasureWithLargestChildEnabled" -> {
                        target.isMeasureWithLargestChildEnabled = bool(value, name); return true
                    }
                    "dividerPadding" -> { target.dividerPadding = int(value, name); return true }
                }
                if (target is FrameLayout && name == "measureAllChildren") {
                    target.measureAllChildren = bool(value, name); return true
                }
                if (target is ConstraintLayout) when (name) {
                    "minWidth" -> { target.minWidth = int(value, name); return true }
                    "minHeight" -> { target.minHeight = int(value, name); return true }
                    "maxWidth" -> { target.maxWidth = int(value, name); return true }
                    "maxHeight" -> { target.maxHeight = int(value, name); return true }
                }
            }
        }
        return false
    }

    private fun writeParams(p: BaseParams, name: String, value: Any?): Boolean {
        if (p is MarginParams) when (name) {
            "leftMargin" -> { p.leftMargin = int(value, name); return true }
            "topMargin" -> { p.topMargin = int(value, name); return true }
            "rightMargin" -> { p.rightMargin = int(value, name); return true }
            "bottomMargin" -> { p.bottomMargin = int(value, name); return true }
            "marginStart" -> { p.marginStart = int(value, name); return true }
            "marginEnd" -> { p.marginEnd = int(value, name); return true }
        }
        if (p is LLParams && name == "weight") { p.weight = float(value, name); return true }
        if (p is CLParams) return writeConstraint(p, name, value)
        return false
    }

    // 属性里的枚举。处理了返回 true；名字写错抛 EnumProblem（write 换成 NacreWarning）
    private fun writeEnum(target: Any, name: String, value: Any?): Boolean {
        when {
            target is BaseParams && (name == "width" || name == "height") -> {
                val v = dimension(value, target is CLParams, name)
                if (name == "width") target.width = v else target.height = v
            }
            target is LLParams && name == "gravity" ->
                target.gravity = if (value == null) -1 else gravity(value, name, Gravities.Axis.BOTH)
            target is FLParams && name == "gravity" ->
                target.gravity = if (value == null) FLParams.UNSPECIFIED_GRAVITY else gravity(value, name, Gravities.Axis.BOTH)
            target is CLParams -> return writeConstraintEnum(target, name, value)
            target is LinearLayout -> when (name) {
                "orientation" -> target.orientation = orientations.forProperty(name, value)
                "gravity" -> target.gravity = gravity(value, name, Gravities.Axis.BOTH)
                "showDividers" -> {
                    val list = value as? List<*> ?: throw NacreTypeError("$name: expected an array of names")
                    target.showDividers = list.fold(0) { acc, n -> acc or dividers.forProperty(name, n) }
                }
                else -> return false
            }
            else -> return false
        }
        return true
    }

    // ---- 方法 ----

    override fun call(target: Any, name: String, args: List<*>, objects: List<Any?>): String? {
        when (target) {
            is MarginParams -> if (name == "setMargins") {
                val m = ints(args, 4, name)
                target.setMargins(m[0], m[1], m[2], m[3])
                return "null"
            }
            is View -> {
                if (target is ViewGroup) callGroup(target, name, args, objects)?.let { return it }
                if (target is LinearLayout) when (name) {
                    "setHorizontalGravity" -> {
                        target.setHorizontalGravity(typeErrors { gravity(args.getOrNull(0), "gravity", Gravities.Axis.HORIZONTAL) })
                        return "null"
                    }
                    "setVerticalGravity" -> {
                        target.setVerticalGravity(typeErrors { gravity(args.getOrNull(0), "gravity", Gravities.Axis.VERTICAL) })
                        return "null"
                    }
                }
                return callView(target, name, args, objects)
            }
        }
        return null
    }

    private fun callView(v: View, name: String, args: List<*>, objects: List<Any?>): String? {
        when (name) {
            "measure" -> { val s = ints(args, 2, name); v.measure(s[0], s[1]) }
            "requestLayout" -> v.requestLayout()
            "forceLayout" -> v.forceLayout()
            "getLocationOnScreen", "getLocationInWindow" -> {
                val xy = IntArray(2)
                if (name == "getLocationOnScreen") v.getLocationOnScreen(xy) else v.getLocationInWindow(xy)
                return "[${xy[0]},${xy[1]}]"
            }
            "@setLayoutParams" -> {
                val params = paramsArg(objects, 0, "layoutParams")
                // 视图已经在一个布局里时，赋一个它不认的类型，下一次排版时 Java 会在原生里抛
                // ClassCastException，整个 App 就没了。这里先照 updateViewLayout 的检查拦下来
                val parent = v.parent as? ViewGroup
                if (parent != null && !accepts(parent, params)) {
                    throw NacreTypeError("layoutParams: ${parent.javaClass.simpleName} does not accept " +
                        "${paramsName(params)}; use the LayoutParams class of the parent layout")
                }
                v.layoutParams = params
            }
            else -> return null
        }
        return "null"
    }

    private fun callGroup(g: ViewGroup, name: String, args: List<*>, objects: List<Any?>): String? {
        when (name) {
            "addView@index" -> g.addView(viewArg(objects, 0, "addView"), int(args.getOrNull(1), "addView"))
            "addView@params" -> g.addView(viewArg(objects, 0, "addView"), paramsArg(objects, 1, "addView"))
            "addView@indexParams" ->
                g.addView(viewArg(objects, 0, "addView"), int(args.getOrNull(1), "addView"), paramsArg(objects, 2, "addView"))
            "addView@size" -> {
                val constraint = g is ConstraintLayout
                val w = typeErrors { dimension(args.getOrNull(1), constraint, "width") }
                val h = typeErrors { dimension(args.getOrNull(2), constraint, "height") }
                g.addView(viewArg(objects, 0, "addView"), w, h)
            }
            "removeView" -> g.removeView(viewArg(objects, 0, name))
            "removeViewAt" -> {
                val index = int(args.getOrNull(0), name)
                // 越界时 Java 不检查，在里面碰到 null 抛 NullPointerException。照 addView 越界的样子报
                if (index < 0 || index >= g.childCount) {
                    throw IndexOutOfBoundsException("index=$index count=${g.childCount}")
                }
                g.removeViewAt(index)
            }
            "removeViews" -> {
                val (start, count) = ints(args, 2, name)
                if (start < 0 || count < 0 || start + count > g.childCount) {
                    throw IndexOutOfBoundsException("start=$start count=$count childCount=${g.childCount}")
                }
                g.removeViews(start, count)
            }
            "removeAllViews" -> g.removeAllViews()
            "indexOfChild" -> return g.indexOfChild(viewArg(objects, 0, name)).toString()
            "bringChildToFront" -> g.bringChildToFront(viewArg(objects, 0, name))
            "updateViewLayout" -> g.updateViewLayout(viewArg(objects, 0, name), paramsArg(objects, 1, name))
            else -> return null
        }
        return "null"
    }

    override fun callObject(target: Any, name: String, args: List<*>, objects: List<Any?>): Any? {
        if (target !is View) return NOT_MINE
        return when (name) {
            "getLayoutParams" -> target.layoutParams
            // 最外层的视图的 parent 是系统的 ViewRootImpl，它不是视图，JS 那边给 null
            "getParent" -> target.parent as? ViewGroup
            else -> NOT_MINE
        }
    }

    // ---- 类级 ----

    override fun classCall(className: String, name: String, args: List<*>, objects: List<Any?>): String? {
        when (className) {
            "View" -> if (name == "generateViewId") return View.generateViewId().toString()
            "View.MeasureSpec" -> when (name) {
                "makeMeasureSpec" -> {
                    val size = int(args.getOrNull(0), name)
                    val mode = measureModes.forArgument("mode", args.getOrNull(1))
                    return View.MeasureSpec.makeMeasureSpec(size, mode).toString()
                }
                "getMode" -> return enumJson(measureModes, View.MeasureSpec.getMode(int(args.getOrNull(0), name)))
                "getSize" -> return View.MeasureSpec.getSize(int(args.getOrNull(0), name)).toString()
            }
        }
        return null
    }

    // ---- 事件：layoutchange ----

    private val layoutListeners = IdentityHashMap<View, View.OnLayoutChangeListener>()

    override fun subscribe(target: Any, type: String, on: Boolean): Boolean {
        if (target !is View || type != "layoutchange") return false
        if (on) {
            // 系统每次排版都来调，四边没变也调（被要求重排过）。只在四边变了时发：不然 JS 在
            // 监听器里 requestLayout 一次，就会一直排下去。回调里拿的是 View 本身，不是编号
            val listener = View.OnLayoutChangeListener { v, l, t, r, b, ol, ot, or, ob ->
                if (l != ol || t != ot || r != or || b != ob) {
                    host.emitter.json(v, "layoutchange",
                        "{\"left\":$l,\"top\":$t,\"right\":$r,\"bottom\":$b," +
                            "\"oldLeft\":$ol,\"oldTop\":$ot,\"oldRight\":$or,\"oldBottom\":$ob}",
                        "LayoutChangeEvent")
                }
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

    // ---- ConstraintLayout.LayoutParams 的字段 ----

    private class Field<T>(val get: (CLParams) -> T, val set: (CLParams, T) -> Unit)

    // 约束：值是视图的 id、parent（0）或者没设（UNSET，-1 → null）
    private val anchors: Map<String, Field<Int>> = mapOf(
        "leftToLeft" to Field({ it.leftToLeft }, { p, v -> p.leftToLeft = v }),
        "leftToRight" to Field({ it.leftToRight }, { p, v -> p.leftToRight = v }),
        "rightToLeft" to Field({ it.rightToLeft }, { p, v -> p.rightToLeft = v }),
        "rightToRight" to Field({ it.rightToRight }, { p, v -> p.rightToRight = v }),
        "topToTop" to Field({ it.topToTop }, { p, v -> p.topToTop = v }),
        "topToBottom" to Field({ it.topToBottom }, { p, v -> p.topToBottom = v }),
        "bottomToTop" to Field({ it.bottomToTop }, { p, v -> p.bottomToTop = v }),
        "bottomToBottom" to Field({ it.bottomToBottom }, { p, v -> p.bottomToBottom = v }),
        "baselineToBaseline" to Field({ it.baselineToBaseline }, { p, v -> p.baselineToBaseline = v }),
        "baselineToTop" to Field({ it.baselineToTop }, { p, v -> p.baselineToTop = v }),
        "baselineToBottom" to Field({ it.baselineToBottom }, { p, v -> p.baselineToBottom = v }),
        "startToEnd" to Field({ it.startToEnd }, { p, v -> p.startToEnd = v }),
        "startToStart" to Field({ it.startToStart }, { p, v -> p.startToStart = v }),
        "endToStart" to Field({ it.endToStart }, { p, v -> p.endToStart = v }),
        "endToEnd" to Field({ it.endToEnd }, { p, v -> p.endToEnd = v }),
        "circleConstraint" to Field({ it.circleConstraint }, { p, v -> p.circleConstraint = v }),
    )

    private val intFields: Map<String, Field<Int>> = mapOf(
        "circleRadius" to Field({ it.circleRadius }, { p, v -> p.circleRadius = v }),
        "baselineMargin" to Field({ it.baselineMargin }, { p, v -> p.baselineMargin = v }),
        "matchConstraintMinWidth" to Field({ it.matchConstraintMinWidth }, { p, v -> p.matchConstraintMinWidth = v }),
        "matchConstraintMinHeight" to Field({ it.matchConstraintMinHeight }, { p, v -> p.matchConstraintMinHeight = v }),
        "matchConstraintMaxWidth" to Field({ it.matchConstraintMaxWidth }, { p, v -> p.matchConstraintMaxWidth = v }),
        "matchConstraintMaxHeight" to Field({ it.matchConstraintMaxHeight }, { p, v -> p.matchConstraintMaxHeight = v }),
    )

    // 视图隐藏时的外边距：没设是 GONE_UNSET → null
    private val goneMargins: Map<String, Field<Int>> = mapOf(
        "goneLeftMargin" to Field({ it.goneLeftMargin }, { p, v -> p.goneLeftMargin = v }),
        "goneTopMargin" to Field({ it.goneTopMargin }, { p, v -> p.goneTopMargin = v }),
        "goneRightMargin" to Field({ it.goneRightMargin }, { p, v -> p.goneRightMargin = v }),
        "goneBottomMargin" to Field({ it.goneBottomMargin }, { p, v -> p.goneBottomMargin = v }),
        "goneStartMargin" to Field({ it.goneStartMargin }, { p, v -> p.goneStartMargin = v }),
        "goneEndMargin" to Field({ it.goneEndMargin }, { p, v -> p.goneEndMargin = v }),
        "goneBaselineMargin" to Field({ it.goneBaselineMargin }, { p, v -> p.goneBaselineMargin = v }),
    )

    private val floatFields: Map<String, Field<Float>> = mapOf(
        "horizontalBias" to Field({ it.horizontalBias }, { p, v -> p.horizontalBias = v }),
        "verticalBias" to Field({ it.verticalBias }, { p, v -> p.verticalBias = v }),
        "circleAngle" to Field({ it.circleAngle }, { p, v -> p.circleAngle = v }),
        "matchConstraintPercentWidth" to Field({ it.matchConstraintPercentWidth }, { p, v -> p.matchConstraintPercentWidth = v }),
        "matchConstraintPercentHeight" to Field({ it.matchConstraintPercentHeight }, { p, v -> p.matchConstraintPercentHeight = v }),
    )

    // 链的权重：没设是 UNSET（-1）→ null
    private val weights: Map<String, Field<Float>> = mapOf(
        "horizontalWeight" to Field({ it.horizontalWeight }, { p, v -> p.horizontalWeight = v }),
        "verticalWeight" to Field({ it.verticalWeight }, { p, v -> p.verticalWeight = v }),
    )

    private val boolFields: Map<String, Field<Boolean>> = mapOf(
        "constrainedWidth" to Field({ it.constrainedWidth }, { p, v -> p.constrainedWidth = v }),
        "constrainedHeight" to Field({ it.constrainedHeight }, { p, v -> p.constrainedHeight = v }),
    )

    private val chainStyles = EnumTable("spread" to CLParams.CHAIN_SPREAD,
        "spreadInside" to CLParams.CHAIN_SPREAD_INSIDE, "packed" to CLParams.CHAIN_PACKED)
    private val matchDefaults = EnumTable("spread" to CLParams.MATCH_CONSTRAINT_SPREAD,
        "wrap" to CLParams.MATCH_CONSTRAINT_WRAP, "percent" to CLParams.MATCH_CONSTRAINT_PERCENT)
    private val wrapBehaviors = EnumTable("included" to CLParams.WRAP_BEHAVIOR_INCLUDED,
        "horizontalOnly" to CLParams.WRAP_BEHAVIOR_HORIZONTAL_ONLY,
        "verticalOnly" to CLParams.WRAP_BEHAVIOR_VERTICAL_ONLY, "skipped" to CLParams.WRAP_BEHAVIOR_SKIPPED)

    private fun readConstraint(p: CLParams, name: String): String? {
        anchors[name]?.let { f ->
            return when (val v = f.get(p)) {
                CLParams.PARENT_ID -> "\"parent\""
                CLParams.UNSET -> "null"
                else -> v.toString()
            }
        }
        intFields[name]?.let { return it.get(p).toString() }
        goneMargins[name]?.let { f -> return f.get(p).let { if (it == CLParams.GONE_UNSET) "null" else it.toString() } }
        floatFields[name]?.let { return num(it.get(p)) }
        weights[name]?.let { f -> return f.get(p).let { if (it == CLParams.UNSET.toFloat()) "null" else num(it) } }
        boolFields[name]?.let { return it.get(p).toString() }
        return when (name) {
            "dimensionRatio" -> p.dimensionRatio?.let(JSONObject::quote) ?: "null"
            "horizontalChainStyle" -> enumJson(chainStyles, p.horizontalChainStyle)
            "verticalChainStyle" -> enumJson(chainStyles, p.verticalChainStyle)
            "matchConstraintDefaultWidth" -> enumJson(matchDefaults, p.matchConstraintDefaultWidth)
            "matchConstraintDefaultHeight" -> enumJson(matchDefaults, p.matchConstraintDefaultHeight)
            "wrapBehaviorInParent" -> enumJson(wrapBehaviors, p.wrapBehaviorInParent)
            else -> null
        }
    }

    private fun writeConstraint(p: CLParams, name: String, value: Any?): Boolean {
        intFields[name]?.let { it.set(p, int(value, name)); return true }
        goneMargins[name]?.let { it.set(p, if (value == null) CLParams.GONE_UNSET else int(value, name)); return true }
        floatFields[name]?.let { it.set(p, float(value, name)); return true }
        weights[name]?.let { it.set(p, if (value == null) CLParams.UNSET.toFloat() else float(value, name)); return true }
        boolFields[name]?.let { it.set(p, bool(value, name)); return true }
        if (name == "dimensionRatio") {
            p.dimensionRatio = when (value) {
                null -> null
                is String -> value
                else -> throw NacreTypeError("dimensionRatio must be a string or null")
            }
            return true
        }
        return false
    }

    // 约束和几个枚举字段。不是这些名字返回 false
    private fun writeConstraintEnum(p: CLParams, name: String, value: Any?): Boolean {
        anchors[name]?.let { f ->
            f.set(p, when (value) {
                null -> CLParams.UNSET
                "parent" -> CLParams.PARENT_ID
                is String -> throw EnumProblem("$name has no value \"$value\"; expected one of: parent / a view id / null")
                else -> int(value, name)
            })
            return true
        }
        when (name) {
            "horizontalChainStyle" -> p.horizontalChainStyle = chainStyles.forProperty(name, value)
            "verticalChainStyle" -> p.verticalChainStyle = chainStyles.forProperty(name, value)
            "matchConstraintDefaultWidth" -> p.matchConstraintDefaultWidth = matchDefaults.forProperty(name, value)
            "matchConstraintDefaultHeight" -> p.matchConstraintDefaultHeight = matchDefaults.forProperty(name, value)
            "wrapBehaviorInParent" -> p.wrapBehaviorInParent = wrapBehaviors.forProperty(name, value)
            else -> return false
        }
        return true
    }

    // ---- 宽高：像素，或者 matchParent / wrapContent（ConstraintLayout 还有 matchConstraint）----

    private fun dimension(value: Any?, constraint: Boolean, where: String): Int = when (value) {
        is Double -> value.toInt().also { if (it < 0) throw NacreTypeError("$where: size must not be negative") }
        "matchParent" -> BaseParams.MATCH_PARENT
        "wrapContent" -> BaseParams.WRAP_CONTENT
        "matchConstraint" -> if (constraint) CLParams.MATCH_CONSTRAINT else throw dimensionProblem("matchConstraint", false, where)
        is String -> throw dimensionProblem(value, constraint, where)
        else -> throw NacreTypeError("$where: expected a size in pixels or a name")
    }

    private fun dimensionProblem(value: String, constraint: Boolean, where: String) = EnumProblem(
        "$where has no value \"$value\"; expected one of: matchParent / wrapContent" +
            (if (constraint) " / matchConstraint" else "") + " / a size in pixels")

    private fun dimensionJson(v: Int, constraint: Boolean): String = when {
        v == BaseParams.MATCH_PARENT -> "\"matchParent\""
        v == BaseParams.WRAP_CONTENT -> "\"wrapContent\""
        constraint && v == CLParams.MATCH_CONSTRAINT -> "\"matchConstraint\""
        else -> v.toString()
    }

    // ---- Gravity：表和规则在 Gravity.kt（文字组的 TextView.gravity 也用）----
    //
    // 名字写错换成这个文件自己的 EnumProblem，再由 typeErrors / warnings 按位置换成
    // NacreTypeError 或 NacreWarning，和别的枚举走同一条路

    private fun gravity(value: Any?, where: String, axis: Gravities.Axis): Int = try {
        Gravities.parse(value, where, axis)
    } catch (e: Gravities.Problem) {
        throw EnumProblem(e.message ?: "invalid gravity")
    }

    // -1 是 LinearLayout.LayoutParams 的「没设」
    private fun gravityJson(value: Int): String = if (value == -1) "null" else Gravities.json(value)

    // ---- 名字 ↔ 数值 ----

    private val orientations = EnumTable("horizontal" to LinearLayout.HORIZONTAL, "vertical" to LinearLayout.VERTICAL)
    private val dividers = EnumTable("beginning" to LinearLayout.SHOW_DIVIDER_BEGINNING,
        "middle" to LinearLayout.SHOW_DIVIDER_MIDDLE, "end" to LinearLayout.SHOW_DIVIDER_END)
    private val dividerBits = listOf(LinearLayout.SHOW_DIVIDER_BEGINNING, LinearLayout.SHOW_DIVIDER_MIDDLE,
        LinearLayout.SHOW_DIVIDER_END)
    private val measureModes = EnumTable("unspecified" to View.MeasureSpec.UNSPECIFIED,
        "exactly" to View.MeasureSpec.EXACTLY, "atMost" to View.MeasureSpec.AT_MOST)

    // 读：名字；表里没有的（不该出现）照原样给数
    private fun enumJson(table: EnumTable<Int>, value: Int): String =
        table.name(value)?.let(JSONObject::quote) ?: value.toString()

    // ---- 小助手 ----

    // 方法参数、构造参数里的名字写错抛 TypeError
    private inline fun <T> typeErrors(block: () -> T): T = try {
        block()
    } catch (e: EnumProblem) {
        throw NacreTypeError(e.message ?: "invalid value")
    }

    // 属性里的名字写错：打警告、值不变
    private inline fun <T> warnings(block: () -> T): T = try {
        block()
    } catch (e: EnumProblem) {
        throw NacreWarning(e.message ?: "invalid value")
    }

    private fun paramsName(p: BaseParams): String = when (p) {
        is CLParams -> "ConstraintLayout.LayoutParams"
        is LLParams -> "LinearLayout.LayoutParams"
        is FLParams -> "FrameLayout.LayoutParams"
        is MarginParams -> "ViewGroup.MarginLayoutParams"
        else -> "ViewGroup.LayoutParams"
    }

    // ViewGroup.checkLayoutParams 是 protected 的公开接口，按父视图的实际类型去问
    private val checkLayoutParams = ViewGroup::class.java
        .getDeclaredMethod("checkLayoutParams", BaseParams::class.java)
        .apply { isAccessible = true }

    private fun accepts(parent: ViewGroup, params: BaseParams): Boolean =
        checkLayoutParams.invoke(parent, params) as Boolean

    private fun viewArg(objects: List<Any?>, index: Int, where: String): View =
        objects.getOrNull(index) as? View ?: throw NacreTypeError("$where: argument ${index + 1} must be a View")

    private fun paramsArg(objects: List<Any?>, index: Int, where: String): BaseParams =
        objects.getOrNull(index) as? BaseParams
            ?: throw NacreTypeError("$where: argument ${index + 1} must be a ViewGroup.LayoutParams")

    // JS 那边已经照 Web IDL 转好了，这里只校验
    private fun int(value: Any?, where: String): Int =
        (value as? Double)?.toInt() ?: throw NacreTypeError("$where: expected a number")

    private fun ints(args: List<*>, count: Int, where: String): List<Int> {
        if (args.size < count) throw NacreTypeError("$where: expected $count numbers")
        return args.take(count).map { int(it, where) }
    }

    private fun float(value: Any?, where: String): Float =
        (value as? Double)?.toFloat() ?: throw NacreTypeError("$where: expected a number")

    private fun bool(value: Any?, where: String): Boolean =
        value as? Boolean ?: throw NacreTypeError("$where: expected a boolean")

    private fun num(f: Float): String = if (f.isFinite()) {
        if (f == Math.round(f).toFloat()) Math.round(f).toString() else f.toString()
    } else "null"
}
