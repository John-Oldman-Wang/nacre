// 文字这一组：TextView 上的字号、颜色、字体、对齐、行数、省略号、行高、字间距、可选中、
// 字体特性和可变字体的轴、按基线定高、自动缩字号、下划线和删除线、文字阴影、测量，
// View 上的 textAlignment，以及 Typeface。JS 那一侧在 builtin/parts/32-text.js。
//
// TextView、View 这两个类 ViewDomain 也登记了，这里再登记一次（JS 类名一样），
// 为的是 NativeBridge 问到它们的成员时也问这个域。
//
// 照「接类的总则」（2026-11-26）：状态记在 JS 里，挂上时 JS 按登记的顺序设到这里。JS 那边已经
// 当场查过类型、范围、枚举名、颜色，这里只校验。长度是 dp，跟着 fontScaling 的那几个（字号、
// 行高、首末基线、自动缩字号）用 Java 自己的单位换算：fontScaling 为 true 是 sp（含 Android 14
// 起的非线性放大），false 是 dp。@ 开头的是 32-text.js 内部用的，不是 API。
package nacre.runtime

import android.graphics.Paint
import android.graphics.Typeface
import android.os.Build
import android.text.TextUtils
import android.util.TypedValue
import android.view.View
import android.widget.TextView
import kotlin.math.max
import kotlin.math.roundToInt

internal class TextDomain(host: DomainHost) : Domain(host) {

    override val classes: Map<Class<*>, String> = mapOf(
        View::class.java to "View",
        TextView::class.java to "TextView",
        Typeface::class.java to "Typeface",
    )

    // ---- 枚举 ----

    // TextUtils.TruncateAt（Java 的 enum，不是整数常量，照同一条规矩）；null 是不加省略号
    private val ellipsizes = EnumTable(
        "start" to TextUtils.TruncateAt.START,
        "middle" to TextUtils.TruncateAt.MIDDLE,
        "end" to TextUtils.TruncateAt.END,
        "marquee" to TextUtils.TruncateAt.MARQUEE,
    )

    // View.TEXT_ALIGNMENT_*
    private val alignments = EnumTable(
        "inherit" to View.TEXT_ALIGNMENT_INHERIT,
        "gravity" to View.TEXT_ALIGNMENT_GRAVITY,
        "textStart" to View.TEXT_ALIGNMENT_TEXT_START,
        "textEnd" to View.TEXT_ALIGNMENT_TEXT_END,
        "center" to View.TEXT_ALIGNMENT_CENTER,
        "viewStart" to View.TEXT_ALIGNMENT_VIEW_START,
        "viewEnd" to View.TEXT_ALIGNMENT_VIEW_END,
    )

    // Gravity 的三张表在 Gravity.kt，由 LayoutDomain 交给 JS（表名全局唯一，只能一个域登记），这里不再登记
    override val enums: Map<String, EnumTable<*>> = mapOf("ellipsize" to ellipsizes, "textAlignment" to alignments)

    // ---- 取参数（JS 那边已经转好了，这里只校验）----

    private fun number(value: Any?, where: String): Double {
        val n = value as? Double
        if (n == null || !n.isFinite()) throw NacreTypeError("$where: expected a finite number")
        return n
    }

    private fun numberOrNull(value: Any?, where: String): Double? = if (value == null) null else number(value, where)

    // 颜色：JS 那边已经把 CSS 的写法解析成了 ARGB 的无符号数（0–0xFFFFFFFF）
    private fun color(value: Any?, where: String): Int {
        val n = value as? Double
        if (n == null || n < 0 || n > 0xFFFFFFFFL.toDouble() || n != Math.floor(n)) {
            throw NacreTypeError("$where: expected an ARGB color number")
        }
        return n.toLong().toInt()
    }

    private fun bool(value: Any?, where: String): Boolean =
        value as? Boolean ?: throw NacreTypeError("$where: expected a boolean")

    private fun stringOrNull(value: Any?, where: String): String? {
        if (value != null && value !is String) throw NacreTypeError("$where: expected a string or null")
        return value as String?
    }

    // Float 用它自己的最短写法交给 JSON：0.1f 读回来是 0.1，不是 0.10000000149011612
    private fun json(f: Float) = if (f.isFinite()) f.toString() else "null"

    // 跟着 fontScaling 的长度：true 是 sp，false 是 dp
    private fun unit(scaling: Any?) = if (bool(scaling, "fontScaling")) TypedValue.COMPLEX_UNIT_SP else TypedValue.COMPLEX_UNIT_DIP

    private fun px(tv: TextView, unit: Int, value: Double): Float =
        TypedValue.applyDimension(unit, value.toFloat(), tv.resources.displayMetrics)

    private fun density(tv: TextView) = tv.resources.displayMetrics.density

    private fun setPaintFlag(tv: TextView, flag: Int, on: Boolean) {
        tv.paintFlags = if (on) tv.paintFlags or flag else tv.paintFlags and flag.inv()
    }

    // ---- 属性 ----

    override fun read(target: Any, name: String): String? {
        if (target is Typeface) return when (name) {
            "weight" -> target.weight.toString()
            "isItalic" -> target.isItalic.toString()
            else -> null
        }
        // 页面值：挂着的视图才问到这里。还没排过版（没有 layout）时 lineCount、baseline 是 null
        if (target is TextView) when (name) {
            "resolvedTextSize" -> return json(target.textSize / density(target))
            "lineCount" -> return if (target.layout == null) "null" else target.lineCount.toString()
            "baseline" -> return if (target.layout == null) "null" else json(target.baseline / density(target))
        }
        return null
    }

    override fun write(target: Any, name: String, value: Any?): Boolean {
        if (target is TextView) when (name) {
            "textColor" -> { target.setTextColor(color(value, name)); return true }
            "highlightColor" -> { target.highlightColor = color(value, name); return true }
            "gravity" -> { target.gravity = Gravities.forProperty(value, name); return true }
            // null 是不限：Java 用 Integer.MAX_VALUE
            "maxLines" -> { target.maxLines = numberOrNull(value, name)?.toInt() ?: Int.MAX_VALUE; return true }
            "minLines" -> { target.minLines = number(value, name).toInt(); return true }
            "ellipsize" -> {
                target.ellipsize = if (value == null) null else ellipsizes.forProperty(name, value)
                return true
            }
            "letterSpacing" -> { target.letterSpacing = number(value, name).toFloat(); return true }
            "includeFontPadding" -> { target.includeFontPadding = bool(value, name); return true }
            "isTextSelectable" -> { target.setTextIsSelectable(bool(value, name)); return true }
            "fontFeatureSettings" -> { target.fontFeatureSettings = stringOrNull(value, name); return true }
            "isUnderlineText" -> { setPaintFlag(target, Paint.UNDERLINE_TEXT_FLAG, bool(value, name)); return true }
            "isStrikeThruText" -> { setPaintFlag(target, Paint.STRIKE_THRU_TEXT_FLAG, bool(value, name)); return true }
        }
        if (target is View && name == "textAlignment") {
            target.textAlignment = alignments.forProperty(name, value)
            return true
        }
        return false
    }

    // ---- 几项合成一次的设置（32-text.js 内部用）----

    override fun call(target: Any, name: String, args: List<*>, objects: List<Any?>): String? {
        val tv = target as? TextView ?: return null
        when (name) {
            // 字体和可变字体的轴 [Typeface 或 null, 轴或 null]，总是一起设。Java 不替我们管这两样的关系：
            // 换字体时轴不跟过去；轴的写法和上次一样时 setFontVariationSettings 什么都不做；清掉轴是在
            // 当前（已经带着轴的）字体上再派生，留着上一次的。所以每次都先清掉、换回 JS 的字体，再设轴。
            // 没有一个字体认得这些轴时 Java 返回 false、什么都不设，照 JS 的状态就是没设
            "@font" -> {
                val settings = stringOrNull(args.getOrNull(1), "fontVariationSettings")
                tv.setFontVariationSettings(null)
                tv.typeface = objects.getOrNull(0) as? Typeface
                if (settings != null) tv.setFontVariationSettings(settings)
            }
            // 字号 [大小, fontScaling]。自动缩字号开着时 Java 不理，关掉时 JS 再设一次
            "@textSize" -> tv.setTextSize(unit(args.getOrNull(1)), number(args.getOrNull(0), "textSize").toFloat())
            // 行高 [dp 或 null, fontScaling]。null 是字体自己的行高
            "@lineHeight" -> {
                val value = numberOrNull(args.getOrNull(0), "lineHeight")
                val unit = unit(args.getOrNull(1))
                when {
                    value == null -> tv.setLineSpacing(0f, 1f)
                    Build.VERSION.SDK_INT >= 34 -> tv.setLineHeight(unit, value.toFloat())
                    // Android 14 以前没有带单位的版本：换成像素再设（系统字号变了 JS 会重设）
                    else -> tv.lineHeight = px(tv, unit, value).roundToInt()
                }
            }
            // 首末基线 [首, 末, fontScaling, 上内边距, 下内边距]（内边距是 JS 里的值换成的像素）。
            // 写了的一边按字体度量换成内边距，盖过 JS 的内边距；null 的一边用 JS 的内边距。照 Java 的
            // setFirstBaselineToTopHeight 算，只是要的距离比字体自己的还小时内边距是 0（Java 不动它）
            "@baselines" -> {
                val first = numberOrNull(args.getOrNull(0), "firstBaselineToTopHeight")
                val last = numberOrNull(args.getOrNull(1), "lastBaselineToBottomHeight")
                val unit = unit(args.getOrNull(2))
                var top = number(args.getOrNull(3), "paddingTop").toInt()
                var bottom = number(args.getOrNull(4), "paddingBottom").toInt()
                val metrics = tv.paint.fontMetricsInt
                if (first != null) {
                    val fontTop = if (tv.includeFontPadding) metrics.top else metrics.ascent
                    top = max(0, px(tv, unit, first).roundToInt() + fontTop)
                }
                if (last != null) {
                    val fontBottom = if (tv.includeFontPadding) metrics.bottom else metrics.descent
                    bottom = max(0, px(tv, unit, last).roundToInt() - fontBottom)
                }
                tv.setPaddingRelative(tv.paddingStart, top, tv.paddingEnd, bottom)
            }
            // 文字阴影 [null] 或 [半径, dx, dy（像素）, 颜色]
            "@textShadow" -> {
                if (args.getOrNull(0) == null) {
                    tv.setShadowLayer(0f, 0f, 0f, 0)
                } else {
                    if (args.size < 4) throw NacreTypeError("textShadow: expected 4 values")
                    tv.setShadowLayer(number(args[0], "radius").toFloat(), number(args[1], "dx").toFloat(),
                                      number(args[2], "dy").toFloat(), color(args[3], "color"))
                }
            }
            // 自动缩字号 [null]、['range', min, max, step, fontScaling] 或 ['sizes', [..], fontScaling]。
            // Java 收的是某个单位下的整数，dp 可以是小数，所以先按单位换成像素再取整
            "@autoSize" -> when (args.getOrNull(0)) {
                null -> tv.setAutoSizeTextTypeWithDefaults(TextView.AUTO_SIZE_TEXT_TYPE_NONE)
                "range" -> {
                    val unit = unit(args.getOrNull(4))
                    val min = max(1, px(tv, unit, number(args.getOrNull(1), "min")).roundToInt())
                    val maxSize = px(tv, unit, number(args.getOrNull(2), "max")).roundToInt()
                    val step = max(1, px(tv, unit, number(args.getOrNull(3), "step")).roundToInt())
                    tv.setAutoSizeTextTypeUniformWithConfiguration(min, maxSize, step, TypedValue.COMPLEX_UNIT_PX)
                }
                "sizes" -> {
                    val unit = unit(args.getOrNull(2))
                    val sizes = args.getOrNull(1) as? List<*> ?: throw NacreTypeError("autoSize.sizes: expected an array")
                    tv.setAutoSizeTextTypeUniformWithPresetSizes(
                        sizes.map { max(1, px(tv, unit, number(it, "sizes")).roundToInt()) }.toIntArray(),
                        TypedValue.COMPLEX_UNIT_PX)
                }
                else -> throw NacreTypeError("autoSize: unknown kind")
            }
            else -> return null
        }
        return "null"
    }

    // ---- Typeface 的类级成员 ----

    override fun classObject(className: String, name: String): Any? {
        if (className != "Typeface") return NOT_MINE
        return when (name) {
            "DEFAULT" -> Typeface.DEFAULT
            "SANS_SERIF" -> Typeface.SANS_SERIF
            "SERIF" -> Typeface.SERIF
            "MONOSPACE" -> Typeface.MONOSPACE
            else -> NOT_MINE
        }
    }

    override fun classCallObject(className: String, name: String, args: List<*>, objects: List<Any?>): Any? {
        if (className != "Typeface") return NOT_MINE
        return when (name) {
            // create(family, { weight, italic })：family 是 Typeface、字体族的名字或 null（默认的字体族）。
            // 没给的那一项照 family 自己的；两项都没给就是 family 本身
            "create" -> {
                val base = objects.getOrNull(0) as? Typeface
                    ?: Typeface.create(stringOrNull(args.getOrNull(0), "family"), Typeface.NORMAL)
                val weight = numberOrNull(args.getOrNull(1), "weight")?.toInt()
                val italic = args.getOrNull(2)?.let { bool(it, "italic") }
                if (weight == null && italic == null) base
                else Typeface.create(base, weight ?: base.weight, italic ?: base.isItalic)
            }
            "createFromAsset" -> {
                val path = args.getOrNull(0) as? String ?: throw NacreTypeError("createFromAsset: path must be a string")
                Typeface.createFromAsset(host.app.assets, "$PROJECT_ASSETS/$path")
            }
            else -> NOT_MINE
        }
    }

    companion object {
        // 项目的 assets/ 在包里的位置（开发用的壳放在这里，见 android/shell/build.gradle.kts）
        const val PROJECT_ASSETS = "app"
    }
}
