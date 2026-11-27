// 外观这一组：View 的背景、前景、透明度、可见性、高度和阴影、轮廓和裁切、变换、模糊；Drawable 一族
// （Drawable、ColorDrawable、GradientDrawable、RippleDrawable）；RenderEffect 的模糊（Android 12 起）。
// JS 那一侧在 builtin/parts/30-appearance.js。
//
// 状态以 JS 为准（2026-11-26 的总则）：JS 记着每个值，挂上时、改了时交到这里设上，这里不往回读。
// Drawable、RenderEffect 每用在一个视图上，JS 就让这里按那个页面建一个（「一处」一个原生对象）。
// 交过来的已经是原生要的单位：长度是像素（JS 按页面密度换好了），颜色是 ARGB 的无符号整数
// （0–0xFFFFFFFF 的数），透明度在 Drawable 上是 0–255，枚举是名字。JS 那边查过一遍，这里只校验。
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
        // View 由别的域建；这里登记它，是为了 View 的外观属性和方法也来问这一组
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

    // Shader.TileMode：模糊到边缘时怎么取边外的像素。DECAL 是 API 31 起才有，和 RenderEffect 同时
    private val edgeTreatments by lazy {
        EnumTable("clamp" to Shader.TileMode.CLAMP, "repeat" to Shader.TileMode.REPEAT,
                  "mirror" to Shader.TileMode.MIRROR, "decal" to Shader.TileMode.DECAL)
    }

    // 名字交给 JS（启动时取一次），写错的名字在 JS 里当场查。表名在所有域里不能重复
    override val enums: Map<String, EnumTable<*>> = buildMap {
        put("visibility", visibilities)
        put("outlineProvider", outlineProviders)
        put("gradientShape", shapes)
        put("gradientType", gradientTypes)
        put("gradientOrientation", orientations)
        if (hasRenderEffect) put("edgeTreatment", edgeTreatments)
    }

    // ---- 值的校验（JS 那边已经照 Web IDL 转好、查过范围了）----

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

    private fun colors(v: Any?, what: String): IntArray {
        val list = v as? List<*> ?: throw NacreTypeError("$what must be an array of colors")
        // 少于两个，系统到画的时候才崩；JS 那边已经拦了，这里再挡一次
        if (list.size < 2) throw NacreTypeError("$what needs at least 2 colors")
        return IntArray(list.size) { color(list[it], what) }
    }

    private fun floats(v: Any?, what: String): FloatArray? {
        if (v == null) return null
        val list = v as? List<*> ?: throw NacreTypeError("$what must be an array of numbers")
        return FloatArray(list.size) { float(list[it], what) }
    }

    private fun drawableArg(objects: List<Any?>, i: Int, where: String): Drawable? {
        val o = objects.getOrNull(i) ?: return null
        return o as? Drawable ?: throw NacreTypeError("$where: argument ${i + 1} must be a Drawable")
    }

    // ---- 造对象：每一处一个 ----

    override fun construct(className: String, args: List<*>, objects: List<Any?>): Any? = when (className) {
        "ColorDrawable" -> ColorDrawable()
        "GradientDrawable" -> GradientDrawable()
        // 颜色、内容、遮罩：内容和遮罩只有构造时能给（Java 的 LayerDrawable），换了 JS 就重建
        "RippleDrawable" -> RippleDrawable(
            ColorStateList.valueOf(color(args.getOrNull(0), "new RippleDrawable")),
            drawableArg(objects, 1, "new RippleDrawable"),
            drawableArg(objects, 2, "new RippleDrawable"))
        "RenderEffect" -> renderEffect(args)
        // Drawable 是抽象类，View 由别的域建
        else -> throw NacreTypeError("Illegal constructor: $className cannot be constructed")
    }

    private fun renderEffect(args: List<*>): Any {
        if (!hasRenderEffect) throw NacreTypeError("RenderEffect requires Android 12 (API 31)")
        return when (args.getOrNull(0)) {
            "blur" -> RenderEffect.createBlurEffect(
                float(args.getOrNull(1), "radiusX"), float(args.getOrNull(2), "radiusY"),
                edgeTreatments.forArgument("edgeTreatment", args.getOrNull(3)))
            else -> throw NacreTypeError("unknown RenderEffect kind")
        }
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

    // 长度都是像素
    private fun writeView(v: View, name: String, value: Any?): Boolean {
        when (name) {
            "alpha" -> v.alpha = float(value, name)
            "visibility" -> v.visibility = visibilities.forProperty(name, value)
            "elevation" -> v.elevation = float(value, name)
            "translationX" -> v.translationX = float(value, name)
            "translationY" -> v.translationY = float(value, name)
            "translationZ" -> v.translationZ = float(value, name)
            "scaleX" -> v.scaleX = float(value, name)
            "scaleY" -> v.scaleY = float(value, name)
            "rotation" -> v.rotation = float(value, name)
            "rotationX" -> v.rotationX = float(value, name)
            "rotationY" -> v.rotationY = float(value, name)
            "cameraDistance" -> v.cameraDistance = float(value, name)
            "outlineProvider" -> v.outlineProvider = outlineProviders.forProperty(name, value)
            "clipToOutline" -> v.clipToOutline = bool(value, name)
            "outlineAmbientShadowColor" -> v.outlineAmbientShadowColor = color(value, name)
            "outlineSpotShadowColor" -> v.outlineSpotShadowColor = color(value, name)
            else -> return false
        }
        return true
    }

    // 透明度 0–255
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
            // -1 是按比例算
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
            "color" -> d.setColor(ColorStateList.valueOf(color(value, name)))
            // -1 是 RADIUS_AUTO
            "radius" -> d.radius = int(value, name)
            else -> return false
        }
        return true
    }

    // ---- 方法 ----

    override fun call(target: Any, name: String, args: List<*>, objects: List<Any?>): String? {
        when {
            target is View && name == "setBackground" -> target.background = drawableArg(objects, 0, name)
            target is View && name == "setForeground" -> target.foreground = drawableArg(objects, 0, name)
            target is View && name == "setRenderEffect" && hasRenderEffect -> {
                val o = objects.getOrNull(0)
                if (o != null && o !is RenderEffect) throw NacreTypeError("setRenderEffect: argument 1 must be a RenderEffect")
                target.setRenderEffect(o as RenderEffect?)
            }
            target is View && name == "setPivot" -> {
                target.pivotX = float(args.getOrNull(0), name)
                target.pivotY = float(args.getOrNull(1), name)
            }
            target is View && name == "resetPivot" -> target.resetPivot()
            target is GradientDrawable && name == "setColors" -> {
                val c = colors(args.getOrNull(0), name)
                val offsets = floats(args.getOrNull(1), name)
                // 个数不同，系统到画的时候才抛；JS 那边不会给，这里再挡一次
                if (offsets != null && offsets.size != c.size) throw NacreTypeError("setColors: offsets must match colors")
                target.setColors(c, offsets)
            }
            target is GradientDrawable && name == "setGradientCenter" ->
                target.setGradientCenter(float(args.getOrNull(0), name), float(args.getOrNull(1), name))
            target is GradientDrawable && name == "setStroke" -> target.setStroke(
                int(args.getOrNull(0), name), color(args.getOrNull(1), name),
                float(args.getOrNull(2), name), float(args.getOrNull(3), name))
            // -1 是没有固有尺寸
            target is GradientDrawable && name == "setSize" ->
                target.setSize(int(args.getOrNull(0), name), int(args.getOrNull(1), name))
            else -> return null
        }
        return "null"
    }

    // 类级的值：这台设备有没有 RenderEffect（类名 @appearance 只是桥上的地址）
    override fun classCall(className: String, name: String, args: List<*>, objects: List<Any?>): String? =
        if (className == "@appearance" && name == "hasRenderEffect") hasRenderEffect.toString() else null
}
