// 外观这一组：View 的背景、透明度、可见性、高度和阴影、轮廓和裁切、变换；Drawable 一族
// （Drawable、ColorDrawable、GradientDrawable、RippleDrawable）；RenderEffect 的模糊（Android 12 起）。
// JS 那一侧在 builtin/parts/30-appearance.js。
//
// 颜色在 JS 那边解析（CSS 的写法，纯文本运算），过桥的是 ARGB 的无符号整数（0–0xFFFFFFFF
// 的数）；读出来也交 ARGB，由 JS 写回字符串。单位是像素，角度是度。
package nacre.runtime

import android.content.res.ColorStateList
import android.graphics.RenderEffect
import android.graphics.Shader
import android.graphics.drawable.ColorDrawable
import android.graphics.drawable.Drawable
import android.graphics.drawable.GradientDrawable
import android.graphics.drawable.RippleDrawable
import android.os.Build
import android.view.View
import android.view.ViewOutlineProvider

internal class AppearanceDomain(host: DomainHost) : Domain(host) {

    // RenderEffect 是 Android 12（API 31）才有的类：11 上连类都没有，不能出现在表里
    private val hasRenderEffect = Build.VERSION.SDK_INT >= Build.VERSION_CODES.S

    override val classes: Map<Class<*>, String> = buildMap {
        // View 由 ViewDomain 建（Domains.kt 里它排在前面）；这里登记它，是为了 View 的属性和方法也来问这一组
        put(View::class.java, "View")
        put(Drawable::class.java, "Drawable")
        put(ColorDrawable::class.java, "ColorDrawable")
        put(GradientDrawable::class.java, "GradientDrawable")
        put(RippleDrawable::class.java, "RippleDrawable")
        if (hasRenderEffect) put(RenderEffect::class.java, "RenderEffect")
    }

    // ---- 枚举 ----

    private val visibilities = EnumTable(
        "visible" to View.VISIBLE, "invisible" to View.INVISIBLE, "gone" to View.GONE)

    // ViewOutlineProvider 的三个现成的实现；不要轮廓是 null
    private val outlineProviders = EnumTable<ViewOutlineProvider?>(
        "background" to ViewOutlineProvider.BACKGROUND,
        "bounds" to ViewOutlineProvider.BOUNDS,
        "paddedBounds" to ViewOutlineProvider.PADDED_BOUNDS,
        "none" to null)

    private val shapes = EnumTable(
        "rectangle" to GradientDrawable.RECTANGLE, "oval" to GradientDrawable.OVAL,
        "line" to GradientDrawable.LINE, "ring" to GradientDrawable.RING)

    private val gradientTypes = EnumTable(
        "linearGradient" to GradientDrawable.LINEAR_GRADIENT,
        "radialGradient" to GradientDrawable.RADIAL_GRADIENT,
        "sweepGradient" to GradientDrawable.SWEEP_GRADIENT)

    private val orientations = EnumTable(
        "topBottom" to GradientDrawable.Orientation.TOP_BOTTOM,
        "trBl" to GradientDrawable.Orientation.TR_BL,
        "rightLeft" to GradientDrawable.Orientation.RIGHT_LEFT,
        "brTl" to GradientDrawable.Orientation.BR_TL,
        "bottomTop" to GradientDrawable.Orientation.BOTTOM_TOP,
        "blTr" to GradientDrawable.Orientation.BL_TR,
        "leftRight" to GradientDrawable.Orientation.LEFT_RIGHT,
        "tlBr" to GradientDrawable.Orientation.TL_BR)

    // RippleDrawable.radius 的哨兵：交给系统按视图大小定
    private val rippleRadius = EnumTable("auto" to RippleDrawable.RADIUS_AUTO)

    // Shader.TileMode：模糊到边缘时怎么取边外的像素。DECAL 是 API 31 起才有，和 RenderEffect 同时
    private val tileModes by lazy {
        EnumTable("clamp" to Shader.TileMode.CLAMP, "repeat" to Shader.TileMode.REPEAT,
                  "mirror" to Shader.TileMode.MIRROR, "decal" to Shader.TileMode.DECAL)
    }

    // ---- 值的转换（JS 那边已经照 Web IDL 转好了类型，这里只校验）----

    private fun float(v: Any?, what: String): Float =
        (v as? Double)?.toFloat() ?: throw NacreTypeError("$what must be a number")

    private fun int(v: Any?, what: String): Int =
        (v as? Double)?.toInt() ?: throw NacreTypeError("$what must be a number")

    private fun bool(v: Any?, what: String): Boolean =
        v as? Boolean ?: throw NacreTypeError("$what must be a boolean")

    // 颜色：0–0xFFFFFFFF 的数 → Java 的 int（ARGB）
    private fun color(v: Any?, what: String): Int {
        val d = v as? Double ?: throw NacreTypeError("$what must be a color")
        if (d < 0 || d > 0xFFFFFFFFL.toDouble() || d != Math.floor(d)) throw NacreTypeError("$what must be a color")
        return d.toLong().toInt()
    }

    private fun colors(v: Any?, what: String): IntArray? {
        if (v == null) return null
        val list = v as? List<*> ?: throw NacreTypeError("$what must be an array of colors")
        return IntArray(list.size) { color(list[it], what) }
    }

    private fun floats(v: Any?, what: String): FloatArray? {
        if (v == null) return null
        val list = v as? List<*> ?: throw NacreTypeError("$what must be an array of numbers")
        return FloatArray(list.size) { float(list[it], what) }
    }

    // ---- 返回值写成 JSON ----

    // Java 的 float 用最短的写法（0.3f 写成 0.3，不是 0.30000001192092896）
    private fun num(f: Float): String = if (f.isFinite()) f.toString() else "null"

    private fun argb(c: Int): String = (c.toLong() and 0xFFFFFFFFL).toString()

    private fun quote(s: String): String = "\"$s\""

    private fun nameOf(table: EnumTable<*>, name: String?): String =
        name?.let(::quote) ?: throw IllegalStateException("unknown native value in $table")

    // ---- 造对象 ----

    override fun construct(className: String, args: List<*>, objects: List<Any?>): Any? = when (className) {
        "ColorDrawable" ->
            if (args.isEmpty()) ColorDrawable() else ColorDrawable(color(args[0], "new ColorDrawable"))
        "GradientDrawable" ->
            if (args.isEmpty()) {
                GradientDrawable()
            } else {
                GradientDrawable(orientations.forArgument("orientation", args[0]),
                                 colors(args.getOrNull(1), "new GradientDrawable") ?: IntArray(0))
            }
        "RippleDrawable" -> RippleDrawable(
            ColorStateList.valueOf(color(args.getOrNull(0), "new RippleDrawable")),
            drawableArg(objects, 1, "new RippleDrawable"),
            drawableArg(objects, 2, "new RippleDrawable"))
        // RenderEffect 没有构造函数，JS 那边的工厂方法从这里建：第一个参数是哪一种
        "RenderEffect" -> renderEffect(args)
        // Drawable 是抽象类，View 由 ViewDomain 建
        else -> throw NacreTypeError("Illegal constructor: $className cannot be constructed")
    }

    private fun drawableArg(objects: List<Any?>, i: Int, where: String): Drawable? {
        val o = objects.getOrNull(i) ?: return null
        return o as? Drawable ?: throw NacreTypeError("$where: argument ${i + 1} must be a Drawable")
    }

    private fun renderEffect(args: List<*>): Any {
        if (!hasRenderEffect) throw NacreTypeError("RenderEffect requires Android 12 (API 31)")
        return when (args.getOrNull(0)) {
            "blur" -> RenderEffect.createBlurEffect(
                float(args.getOrNull(1), "radiusX"), float(args.getOrNull(2), "radiusY"),
                tileModes.forArgument("edgeTreatment", args.getOrNull(3)))
            else -> throw NacreTypeError("unknown RenderEffect kind")
        }
    }

    // ---- 读属性 ----

    override fun read(target: Any, name: String): String? = when (target) {
        is View -> readView(target, name)
        is ColorDrawable -> readColorDrawable(target, name) ?: readDrawable(target, name)
        is GradientDrawable -> readGradient(target, name) ?: readDrawable(target, name)
        is RippleDrawable -> readRipple(target, name) ?: readDrawable(target, name)
        is Drawable -> readDrawable(target, name)
        else -> null
    }

    private fun readView(v: View, name: String): String? = when (name) {
        "alpha" -> num(v.alpha)
        "visibility" -> nameOf(visibilities, visibilities.name(v.visibility))
        "elevation" -> num(v.elevation)
        "translationZ" -> num(v.translationZ)
        "z" -> num(v.z)
        "translationX" -> num(v.translationX)
        "translationY" -> num(v.translationY)
        "scaleX" -> num(v.scaleX)
        "scaleY" -> num(v.scaleY)
        "rotation" -> num(v.rotation)
        "rotationX" -> num(v.rotationX)
        "rotationY" -> num(v.rotationY)
        "pivotX" -> num(v.pivotX)
        "pivotY" -> num(v.pivotY)
        "isPivotSet" -> v.isPivotSet.toString()
        "cameraDistance" -> num(v.cameraDistance)
        // 系统自己的视图可能装了别的实现（不是那三个现成的），照实说是自定义的
        "outlineProvider" -> quote(outlineProviders.name(v.outlineProvider) ?: "custom")
        "clipToOutline" -> v.clipToOutline.toString()
        "outlineAmbientShadowColor" -> argb(v.outlineAmbientShadowColor)
        "outlineSpotShadowColor" -> argb(v.outlineSpotShadowColor)
        else -> null
    }

    private fun readDrawable(d: Drawable, name: String): String? = when (name) {
        "alpha" -> d.alpha.toString()
        "intrinsicWidth" -> d.intrinsicWidth.toString()
        "intrinsicHeight" -> d.intrinsicHeight.toString()
        else -> null
    }

    private fun readColorDrawable(d: ColorDrawable, name: String): String? = when (name) {
        "color" -> argb(d.color)
        else -> null
    }

    private fun readGradient(d: GradientDrawable, name: String): String? = when (name) {
        "shape" -> nameOf(shapes, shapes.name(d.shape))
        // 纯色是一个 ColorStateList（设了渐变时是 null）；按状态变的颜色这一步不接，取默认的那个
        "color" -> d.color?.defaultColor?.let(::argb) ?: "null"
        "colors" -> d.colors?.joinToString(",", "[", "]") { argb(it) } ?: "null"
        "gradientType" -> nameOf(gradientTypes, gradientTypes.name(d.gradientType))
        "orientation" -> nameOf(orientations, orientations.name(d.orientation))
        "gradientCenterX" -> num(d.gradientCenterX)
        "gradientCenterY" -> num(d.gradientCenterY)
        "gradientRadius" -> num(d.gradientRadius)
        "cornerRadius" -> num(d.cornerRadius)
        "cornerRadii" -> d.cornerRadii?.joinToString(",", "[", "]") { num(it) } ?: "null"
        "innerRadius" -> d.innerRadius.toString()
        "innerRadiusRatio" -> num(d.innerRadiusRatio)
        "thickness" -> d.thickness.toString()
        "thicknessRatio" -> num(d.thicknessRatio)
        "useLevel" -> d.useLevel.toString()
        else -> null
    }

    private fun readRipple(d: RippleDrawable, name: String): String? = when (name) {
        "radius" -> rippleRadius.name(d.radius)?.let(::quote) ?: d.radius.toString()
        else -> null
    }

    // ---- 写属性 ----

    override fun write(target: Any, name: String, value: Any?): Boolean = when (target) {
        is View -> writeView(target, name, value)
        is ColorDrawable -> writeColorDrawable(target, name, value) || writeDrawable(target, name, value)
        is GradientDrawable -> writeGradient(target, name, value) || writeDrawable(target, name, value)
        is RippleDrawable -> writeRipple(target, name, value) || writeDrawable(target, name, value)
        is Drawable -> writeDrawable(target, name, value)
        else -> false
    }

    private fun writeView(v: View, name: String, value: Any?): Boolean {
        when (name) {
            "alpha" -> v.alpha = float(value, name)
            "visibility" -> v.visibility = visibilities.forProperty(name, value)
            "elevation" -> v.elevation = float(value, name)
            "translationZ" -> v.translationZ = float(value, name)
            "z" -> v.z = float(value, name)
            "translationX" -> v.translationX = float(value, name)
            "translationY" -> v.translationY = float(value, name)
            "scaleX" -> v.scaleX = float(value, name)
            "scaleY" -> v.scaleY = float(value, name)
            "rotation" -> v.rotation = float(value, name)
            "rotationX" -> v.rotationX = float(value, name)
            "rotationY" -> v.rotationY = float(value, name)
            "pivotX" -> v.pivotX = float(value, name)
            "pivotY" -> v.pivotY = float(value, name)
            "cameraDistance" -> v.cameraDistance = float(value, name)
            "outlineProvider" -> v.outlineProvider = outlineProviders.forProperty(name, value)
            "clipToOutline" -> v.clipToOutline = bool(value, name)
            "outlineAmbientShadowColor" -> v.outlineAmbientShadowColor = color(value, name)
            "outlineSpotShadowColor" -> v.outlineSpotShadowColor = color(value, name)
            else -> return false
        }
        return true
    }

    private fun writeDrawable(d: Drawable, name: String, value: Any?): Boolean {
        when (name) {
            "alpha" -> d.alpha = int(value, name)
            else -> return false
        }
        return true
    }

    private fun writeColorDrawable(d: ColorDrawable, name: String, value: Any?): Boolean {
        when (name) {
            "color" -> d.color = color(value, name)
            else -> return false
        }
        return true
    }

    private fun writeGradient(d: GradientDrawable, name: String, value: Any?): Boolean {
        when (name) {
            "shape" -> d.shape = shapes.forProperty(name, value)
            "color" -> d.setColor(color(value, name))
            "colors" -> d.colors = colors(value, name)
            "gradientType" -> d.gradientType = gradientTypes.forProperty(name, value)
            "orientation" -> d.orientation = orientations.forProperty(name, value)
            "gradientRadius" -> d.gradientRadius = float(value, name)
            "cornerRadius" -> d.cornerRadius = float(value, name)
            "cornerRadii" -> {
                val radii = floats(value, name)
                // 少于 8 个，系统到画的时候才越界崩；JS 那边已经拦了，这里再挡一次
                if (radii != null && radii.size != 8) throw NacreTypeError("cornerRadii must have 8 values")
                d.cornerRadii = radii
            }
            "innerRadius" -> d.innerRadius = int(value, name)
            "innerRadiusRatio" -> d.innerRadiusRatio = float(value, name)
            "thickness" -> d.thickness = int(value, name)
            "thicknessRatio" -> d.thicknessRatio = float(value, name)
            "useLevel" -> d.useLevel = bool(value, name)
            else -> return false
        }
        return true
    }

    private fun writeRipple(d: RippleDrawable, name: String, value: Any?): Boolean {
        when (name) {
            // 数（像素），或者 'auto'
            "radius" -> d.radius = if (value is String) rippleRadius.forProperty(name, value) else int(value, name)
            else -> return false
        }
        return true
    }

    // ---- 方法 ----

    override fun call(target: Any, name: String, args: List<*>, objects: List<Any?>): String? {
        when {
            target is View && name == "setBackground" -> target.background = drawableArg(objects, 0, name)
            target is View && name == "setForeground" -> target.foreground = drawableArg(objects, 0, name)
            target is View && name == "setBackgroundColor" -> target.setBackgroundColor(color(args.getOrNull(0), name))
            target is View && name == "resetPivot" -> target.resetPivot()
            target is View && name == "setRenderEffect" && hasRenderEffect -> {
                val o = objects.getOrNull(0)
                if (o != null && o !is RenderEffect) throw NacreTypeError("setRenderEffect: argument 1 must be a RenderEffect")
                target.setRenderEffect(o as RenderEffect?)
            }
            target is GradientDrawable && name == "setColors" -> {
                val c = colors(args.getOrNull(0), name) ?: throw NacreTypeError("setColors: colors must be an array")
                val offsets = floats(args.getOrNull(1), name)
                // 个数不同，系统到画的时候才抛；JS 那边已经拦了，这里再挡一次
                if (offsets != null && offsets.size != c.size) throw NacreTypeError("setColors: offsets must match colors")
                target.setColors(c, offsets)
            }
            target is GradientDrawable && name == "setGradientCenter" ->
                target.setGradientCenter(float(args.getOrNull(0), name), float(args.getOrNull(1), name))
            target is GradientDrawable && name == "setStroke" -> when (args.size) {
                2 -> target.setStroke(int(args[0], name), color(args[1], name))
                4 -> target.setStroke(int(args[0], name), color(args[1], name), float(args[2], name), float(args[3], name))
                else -> throw NacreTypeError("setStroke: expected 2 or 4 arguments")
            }
            target is GradientDrawable && name == "setSize" ->
                target.setSize(int(args.getOrNull(0), name), int(args.getOrNull(1), name))
            target is RippleDrawable && name == "setColor" ->
                target.setColor(ColorStateList.valueOf(color(args.getOrNull(0), name)))
            else -> return null
        }
        return "null"
    }

    override fun callObject(target: Any, name: String, args: List<*>, objects: List<Any?>): Any? = when {
        target is View && name == "getBackground" -> target.background
        target is View && name == "getForeground" -> target.foreground
        else -> NOT_MINE
    }

    // 类级的值：这台设备有没有 RenderEffect（类名 @appearance 只是桥上的地址）
    override fun classCall(className: String, name: String, args: List<*>, objects: List<Any?>): String? =
        if (className == "@appearance" && name == "hasRenderEffect") hasRenderEffect.toString() else null
}
