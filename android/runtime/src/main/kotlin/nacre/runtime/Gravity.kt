// Gravity 的名字 ↔ 数值，几组共用：TextView.gravity（TextDomain）、LinearLayout.gravity、
// LayoutParams 的 gravity、setHorizontalGravity / setVerticalGravity（LayoutDomain）。
//
// 每个方向最多一个名字，外加两个裁切的开关。横向的几个值不是单独的一位（LEFT = 3、
// START = 0x800003），按「每个方向一个取值」拆。不收 center、fill 这种两个方向合起来的
// 名字：读出来总是拆开的，收了就写进去和读出来不一样。读出的顺序：横向、竖直、裁切。
package nacre.runtime

import android.view.Gravity
import org.json.JSONObject

internal object Gravities {

    // 这个位置收哪些名字：只收横向的、只收竖直的、全收（加两个裁切的开关）
    enum class Axis { HORIZONTAL, VERTICAL, BOTH }

    // 名字写错、同一个方向给了两个。调用的地方按位置换成 NacreWarning（属性）或
    // NacreTypeError（参数），见 forProperty / forArgument
    class Problem(message: String) : Exception(message)

    private val horizontal = linkedMapOf(
        "left" to Gravity.LEFT, "right" to Gravity.RIGHT, "centerHorizontal" to Gravity.CENTER_HORIZONTAL,
        "fillHorizontal" to Gravity.FILL_HORIZONTAL, "start" to Gravity.START, "end" to Gravity.END,
    )
    private val vertical = linkedMapOf(
        "top" to Gravity.TOP, "bottom" to Gravity.BOTTOM, "centerVertical" to Gravity.CENTER_VERTICAL,
        "fillVertical" to Gravity.FILL_VERTICAL,
    )
    private val clip = linkedMapOf("clipHorizontal" to Gravity.CLIP_HORIZONTAL, "clipVertical" to Gravity.CLIP_VERTICAL)
    private val all = horizontal + vertical + clip

    // 名字表交给 JS（JS 在那边当场查写错的名字，见 31-layout.js、32-text.js），按方向分开查「每个方向
    // 最多一个」。表名在所有域里不能重复，只能一个域登记：LayoutDomain 登记，文字组直接取
    val enums: Map<String, EnumTable<*>> = mapOf(
        "gravityHorizontal" to EnumTable(*horizontal.toList().toTypedArray()),
        "gravityVertical" to EnumTable(*vertical.toList().toTypedArray()),
        "gravityClip" to EnumTable(*clip.toList().toTypedArray()),
    )

    // 名字数组 → 数值。不是数组、名字不是字符串抛 NacreTypeError（JS 那边已经转过，到这里
    // 说明调错了）；名字写错、同一个方向两个抛 Problem
    fun parse(value: Any?, where: String, axis: Axis = Axis.BOTH): Int {
        val list = value as? List<*> ?: throw NacreTypeError("$where: expected an array of gravity names")
        val allowed = when (axis) {
            Axis.HORIZONTAL -> horizontal
            Axis.VERTICAL -> vertical
            Axis.BOTH -> all
        }
        var result = 0
        var h: String? = null
        var v: String? = null
        for (item in list) {
            val name = item as? String ?: throw NacreTypeError("$where: gravity names must be strings")
            val bits = allowed[name] ?: throw Problem(
                "$where has no value \"$name\"; expected one of: ${allowed.keys.joinToString(" / ")}")
            if (name in horizontal) {
                if (h != null && h != name) throw Problem(
                    "$where: ${JSONObject.quote(h)} and ${JSONObject.quote(name)} are both horizontal; " +
                        "give at most one per direction")
                h = name
            }
            if (name in vertical) {
                if (v != null && v != name) throw Problem(
                    "$where: ${JSONObject.quote(v)} and ${JSONObject.quote(name)} are both vertical; " +
                        "give at most one per direction")
                v = name
            }
            result = result or bits
        }
        return result
    }

    // 属性位：写错打警告、值不变
    fun forProperty(value: Any?, where: String, axis: Axis = Axis.BOTH): Int = try {
        parse(value, where, axis)
    } catch (e: Problem) {
        throw NacreWarning(e.message ?: "invalid gravity")
    }

    // 方法参数、构造参数：写错抛 TypeError
    fun forArgument(value: Any?, where: String, axis: Axis = Axis.BOTH): Int = try {
        parse(value, where, axis)
    } catch (e: Problem) {
        throw NacreTypeError(e.message ?: "invalid gravity")
    }

    fun names(value: Int): List<String> {
        val out = ArrayList<String>()
        horizontal.entries.firstOrNull { it.value == (value and Gravity.RELATIVE_HORIZONTAL_GRAVITY_MASK) }?.let { out += it.key }
        vertical.entries.firstOrNull { it.value == (value and Gravity.VERTICAL_GRAVITY_MASK) }?.let { out += it.key }
        for ((name, bit) in clip) if ((value and bit) != 0) out += name
        return out
    }

    fun json(value: Int): String = names(value).joinToString(",", "[", "]") { JSONObject.quote(it) }
}
