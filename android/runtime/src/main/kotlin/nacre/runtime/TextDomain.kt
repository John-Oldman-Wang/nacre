// 文字这一组：TextView 上的字号、颜色、字体、对齐、行数、省略号、行高、字间距、可选中、
// 测量、字体特性和可变字体的轴、按基线定高、自动缩字号、下划线和删除线（paintFlags）、
// 文字阴影，View 上的 textAlignment，以及 Typeface。JS 那一侧在 builtin/parts/32-text.js。
//
// TextView、View 这两个类 ViewDomain 也登记了，这里再登记一次（JS 类名一样），
// 为的是 NativeBridge 问到它们的成员时也问这个域。
//
// 规矩（project.md 第 4 节「接类的规矩」）：整数常量 → 字符串枚举，名字和数值的映射只在
// 这里（Enums.kt 的 EnumTable）：属性位写错抛 NacreWarning（JS 打警告、值不变），方法参数
// 写错抛 NacreTypeError。颜色在 JS 那边从 CSS 的写法解析成 ARGB 的无符号数（30-appearance.js
// 的 colorArgument / colorProperty），这里只收数。JS 那边已经照 Web IDL 转好了类型，这里只校验。
package nacre.runtime

import android.graphics.Paint
import android.graphics.Typeface
import android.os.Build
import android.text.TextUtils
import android.util.TypedValue
import android.view.View
import android.widget.TextView
import org.json.JSONArray
import org.json.JSONObject
import kotlin.math.roundToInt

internal class TextDomain(host: DomainHost) : Domain(host) {

    override val classes: Map<Class<*>, String> = mapOf(
        View::class.java to "View",
        TextView::class.java to "TextView",
        Typeface::class.java to "Typeface",
    )

    // ---- 枚举 ----

    // TypedValue.COMPLEX_UNIT_*：去掉前缀、小写
    private val units = EnumTable(
        "px" to TypedValue.COMPLEX_UNIT_PX,
        "dip" to TypedValue.COMPLEX_UNIT_DIP,
        "sp" to TypedValue.COMPLEX_UNIT_SP,
        "pt" to TypedValue.COMPLEX_UNIT_PT,
        "in" to TypedValue.COMPLEX_UNIT_IN,
        "mm" to TypedValue.COMPLEX_UNIT_MM,
    )

    // Typeface.NORMAL / BOLD / ITALIC / BOLD_ITALIC
    private val styles = EnumTable(
        "normal" to Typeface.NORMAL,
        "bold" to Typeface.BOLD,
        "italic" to Typeface.ITALIC,
        "boldItalic" to Typeface.BOLD_ITALIC,
    )

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

    // TextView.AUTO_SIZE_TEXT_TYPE_*
    private val autoSizeTypes = EnumTable(
        "none" to TextView.AUTO_SIZE_TEXT_TYPE_NONE,
        "uniform" to TextView.AUTO_SIZE_TEXT_TYPE_UNIFORM,
    )

    // Paint.*_FLAG：去掉 _FLAG、转驼峰。位掩码，JS 里是字符串数组
    private val paintFlagTable = linkedMapOf(
        "antiAlias" to Paint.ANTI_ALIAS_FLAG,
        "filterBitmap" to Paint.FILTER_BITMAP_FLAG,
        "dither" to Paint.DITHER_FLAG,
        "underlineText" to Paint.UNDERLINE_TEXT_FLAG,
        "strikeThruText" to Paint.STRIKE_THRU_TEXT_FLAG,
        "fakeBoldText" to Paint.FAKE_BOLD_TEXT_FLAG,
        "linearText" to Paint.LINEAR_TEXT_FLAG,
        "subpixelText" to Paint.SUBPIXEL_TEXT_FLAG,
        "devKernText" to Paint.DEV_KERN_TEXT_FLAG,
        "embeddedBitmapText" to Paint.EMBEDDED_BITMAP_TEXT_FLAG,
        "verticalText" to Paint.VERTICAL_TEXT_FLAG,
    )
    private val paintFlagMask = paintFlagTable.values.fold(0) { acc, v -> acc or v }
    private val paintFlagNamesTable = EnumTable(*paintFlagTable.entries.map { it.key to it.value }.toTypedArray())

    private fun paintFlagNames(value: Int) = paintFlagTable.filterValues { value and it != 0 }.keys.toList()


    // ---- 取参数（JS 那边已经转好了，这里只校验）----

    private fun number(value: Any?, where: String): Double {
        val n = value as? Double
        if (n == null || !n.isFinite()) throw NacreTypeError("$where: expected a finite number")
        return n
    }

    // 颜色：JS 那边已经把 CSS 的写法解析成了 ARGB 的无符号数（0–0xFFFFFFFF）
    private fun color(value: Any?, where: String): Int {
        val n = value as? Double
        if (n == null || n < 0 || n > 0xFFFFFFFFL.toDouble() || n != Math.floor(n)) {
            throw NacreTypeError("$where: expected an ARGB color number")
        }
        return n.toLong().toInt()
    }

    // 读的时候交回无符号数，JS 那边写成 '#rrggbb' / '#rrggbbaa'
    private fun colorJson(color: Int) = (color.toLong() and 0xFFFFFFFFL).toString()

    private fun bool(value: Any?, where: String): Boolean =
        value as? Boolean ?: throw NacreTypeError("$where: expected a boolean")

    private fun quoted(name: String?) = if (name == null) "null" else JSONObject.quote(name)

    // Float 用它自己的最短写法交给 JSON：0.1f 读回来是 0.1，不是 0.10000000149011612
    private fun json(f: Float) = if (f.isFinite()) f.toString() else "null"

    // ---- 属性 ----

    override fun read(target: Any, name: String): String? {
        if (target is Typeface) return when (name) {
            "style" -> quoted(styles.name(target.style))
            "weight" -> target.weight.toString()
            "isBold" -> target.isBold.toString()
            "isItalic" -> target.isItalic.toString()
            else -> null
        }
        if (target is TextView) when (name) {
            "textSize" -> return json(target.textSize)
            "textSizeUnit" -> return quoted(units.name(target.textSizeUnit))
            "currentTextColor" -> return colorJson(target.currentTextColor)
            "highlightColor" -> return colorJson(target.highlightColor)
            "gravity" -> return JSONArray(Gravities.names(target.gravity)).toString()
            "maxLines" -> return target.maxLines.toString()
            "minLines" -> return target.minLines.toString()
            "ellipsize" -> return quoted(target.ellipsize?.let { ellipsizes.name(it) })
            "lineHeight" -> return target.lineHeight.toString()
            "lineSpacingExtra" -> return json(target.lineSpacingExtra)
            "lineSpacingMultiplier" -> return json(target.lineSpacingMultiplier)
            "letterSpacing" -> return json(target.letterSpacing)
            "includeFontPadding" -> return target.includeFontPadding.toString()
            "isTextSelectable" -> return target.isTextSelectable.toString()
            "lineCount" -> return target.lineCount.toString()
            "baseline" -> return target.baseline.toString()
            "fontFeatureSettings" -> return quoted(target.fontFeatureSettings)
            "fontVariationSettings" -> return quoted(target.fontVariationSettings)
            "firstBaselineToTopHeight" -> return target.firstBaselineToTopHeight.toString()
            "lastBaselineToBottomHeight" -> return target.lastBaselineToBottomHeight.toString()
            "autoSizeTextType" -> return quoted(autoSizeTypes.name(target.autoSizeTextType))
            "autoSizeMinTextSize" -> return target.autoSizeMinTextSize.toString()
            "autoSizeMaxTextSize" -> return target.autoSizeMaxTextSize.toString()
            "autoSizeStepGranularity" -> return target.autoSizeStepGranularity.toString()
            "autoSizeTextAvailableSizes" -> return JSONArray(target.autoSizeTextAvailableSizes.toList()).toString()
            "paintFlags" -> return JSONArray(paintFlagNames(target.paintFlags)).toString()
            "shadowRadius" -> return json(target.shadowRadius)
            "shadowDx" -> return json(target.shadowDx)
            "shadowDy" -> return json(target.shadowDy)
            "shadowColor" -> return colorJson(target.shadowColor)
        }
        if (target is View && name == "textAlignment") return quoted(alignments.name(target.textAlignment))
        return null
    }

    override fun write(target: Any, name: String, value: Any?): Boolean {
        if (target is TextView) when (name) {
            "highlightColor" -> { target.highlightColor = color(value, "highlightColor"); return true }
            "gravity" -> {
                val list = value as? List<*> ?: throw NacreTypeError("gravity: expected an array of strings")
                target.gravity = Gravities.forProperty(list, "gravity")
                return true
            }
            "maxLines" -> { target.maxLines = number(value, "maxLines").toInt(); return true }
            "minLines" -> { target.minLines = number(value, "minLines").toInt(); return true }
            "ellipsize" -> {
                target.ellipsize = if (value == null) null else ellipsizes.forProperty("ellipsize", value)
                return true
            }
            "lineHeight" -> { target.lineHeight = number(value, "lineHeight").toInt(); return true }
            "letterSpacing" -> {
                target.letterSpacing = number(value, "letterSpacing").toFloat()
                return true
            }
            "includeFontPadding" -> {
                target.includeFontPadding = bool(value, "includeFontPadding")
                return true
            }
            "fontFeatureSettings" -> {
                if (value != null && value !is String) throw NacreTypeError("fontFeatureSettings: expected a string or null")
                target.fontFeatureSettings = value as String?
                return true
            }
            "firstBaselineToTopHeight" -> {
                target.firstBaselineToTopHeight = number(value, "firstBaselineToTopHeight").toInt()
                return true
            }
            "lastBaselineToBottomHeight" -> {
                target.lastBaselineToBottomHeight = number(value, "lastBaselineToBottomHeight").toInt()
                return true
            }
            "paintFlags" -> {
                val list = value as? List<*> ?: throw NacreTypeError("paintFlags: expected an array of strings")
                var bits = 0
                for (name in list) bits = bits or paintFlagNamesTable.forProperty("paintFlags", name)
                // 表外的位（系统私下设的）原样留着，只换表里的这几位
                target.paintFlags = (target.paintFlags and paintFlagMask.inv()) or bits
                return true
            }
        }
        if (target is View && name == "textAlignment") {
            target.textAlignment = alignments.forProperty("textAlignment", value)
            return true
        }
        return false
    }

    // ---- 方法 ----

    override fun call(target: Any, name: String, args: List<*>, objects: List<Any?>): String? {
        val tv = target as? TextView ?: return null
        when (name) {
            "setTextSize" -> when (args.size) {
                1 -> tv.setTextSize(number(args[0], name).toFloat())
                2 -> tv.setTextSize(units.forArgument("unit", args[0]),
                                    number(args[1], name).toFloat())
                else -> throw NacreTypeError("setTextSize: expected 1 or 2 arguments")
            }
            "setTextColor" -> tv.setTextColor(color(args.getOrNull(0), "setTextColor"))
            "setTypeface" -> {
                // 第一个参数是 Typeface 或 null（JS 那边拦过了）
                val typeface = objects.getOrNull(0) as? Typeface
                if (args.size >= 2) tv.setTypeface(typeface, styles.forArgument("style", args[1]))
                else tv.typeface = typeface
            }
            "setLines" -> tv.setLines(number(args.getOrNull(0), name).toInt())
            "setLineHeight" -> when (args.size) {
                1 -> tv.lineHeight = number(args[0], name).toInt()
                2 -> {
                    val unit = units.forArgument("unit", args[0])
                    val value = number(args[1], name).toFloat()
                    if (Build.VERSION.SDK_INT >= 34) {
                        tv.setLineHeight(unit, value)
                    } else {
                        // Android 14 以前没有带单位的版本：换成像素再设，跟不上之后字体大小设置的变化
                        tv.lineHeight = TypedValue.applyDimension(unit, value, tv.resources.displayMetrics).roundToInt()
                    }
                }
                else -> throw NacreTypeError("setLineHeight: expected 1 or 2 arguments")
            }
            "setLineSpacing" -> {
                if (args.size < 2) throw NacreTypeError("setLineSpacing: expected 2 arguments")
                tv.setLineSpacing(number(args[0], name).toFloat(), number(args[1], name).toFloat())
            }
            "setTextIsSelectable" -> tv.setTextIsSelectable(bool(args.getOrNull(0), name))
            "setFontVariationSettings" -> {
                val settings = args.getOrNull(0)
                if (settings != null && settings !is String) throw NacreTypeError("$name: expected a string or null")
                return tv.setFontVariationSettings(settings as String?).toString()
            }
            "setAutoSizeTextTypeWithDefaults" ->
                tv.setAutoSizeTextTypeWithDefaults(autoSizeTypes.forArgument("type", args.getOrNull(0)))
            "setAutoSizeTextTypeUniformWithConfiguration" -> {
                if (args.size < 4) throw NacreTypeError("$name: expected 4 arguments")
                tv.setAutoSizeTextTypeUniformWithConfiguration(
                    number(args[0], name).toInt(), number(args[1], name).toInt(), number(args[2], name).toInt(),
                    units.forArgument("unit", args[3]))
            }
            "setAutoSizeTextTypeUniformWithPresetSizes" -> {
                val sizes = args.getOrNull(0) as? List<*> ?: throw NacreTypeError("$name: sizes must be an array of numbers")
                tv.setAutoSizeTextTypeUniformWithPresetSizes(
                    sizes.map { number(it, name).toInt() }.toIntArray(),
                    units.forArgument("unit", args.getOrNull(1)))
            }
            "setShadowLayer" -> {
                if (args.size < 4) throw NacreTypeError("$name: expected 4 arguments")
                tv.setShadowLayer(number(args[0], name).toFloat(), number(args[1], name).toFloat(),
                                  number(args[2], name).toFloat(), color(args[3], name))
            }
            else -> return null
        }
        return "null"
    }

    // typeface 的读：返回一个原生对象，走返回对象的方法通道
    override fun callObject(target: Any, name: String, args: List<*>, objects: List<Any?>): Any? =
        if (target is TextView && name == "getTypeface") target.typeface else NOT_MINE

    // ---- Typeface 的类级成员 ----

    override fun classObject(className: String, name: String): Any? {
        if (className != "Typeface") return NOT_MINE
        return when (name) {
            "DEFAULT" -> Typeface.DEFAULT
            "DEFAULT_BOLD" -> Typeface.DEFAULT_BOLD
            "SANS_SERIF" -> Typeface.SANS_SERIF
            "SERIF" -> Typeface.SERIF
            "MONOSPACE" -> Typeface.MONOSPACE
            else -> NOT_MINE
        }
    }

    override fun classCallObject(className: String, name: String, args: List<*>, objects: List<Any?>): Any? {
        if (className != "Typeface") return NOT_MINE
        return when (name) {
            "create" -> {
                val family = objects.getOrNull(0) as? Typeface
                when {
                    family != null && args.size >= 3 ->
                        Typeface.create(family, number(args[1], name).toInt(), bool(args[2], name))
                    family != null -> Typeface.create(family, styles.forArgument("style", args.getOrNull(1)))
                    args.size >= 3 -> throw NacreTypeError("Typeface.create(family, weight, italic): family must be a Typeface")
                    else -> Typeface.create(args.getOrNull(0) as? String,
                                            styles.forArgument("style", args.getOrNull(1)))
                }
            }
            "defaultFromStyle" -> Typeface.defaultFromStyle(styles.forArgument("style", args.getOrNull(0)))
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
