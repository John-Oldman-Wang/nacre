// 动画这一组：插值器（BaseInterpolator 一族）、Animator / ValueAnimator / ObjectAnimator、view.animate()；
// requestAnimationFrame 用的帧时钟（Choreographer）；系统的动画时长缩放。JS 那一侧在 builtin/parts/37-animation.js。
//
// 时长和时刻是毫秒。长度 JS 那边已经按页面的密度换成了像素。animator 的通知照 AnimatorListener 转成事件，
// 排到下一轮派发，不可取消：start、end、cancel、repeat、pause、resume 总是发（不常发，JS 要靠 end
// 放开正在跑的 animator 的包装）；update 每帧一次，有人订才装。
//
// 视图上被动画改的那几个属性（alpha、translationX……）在这里读：它们是系统也会改的状态，挂着时 JS 读原生。
// 读出来的是 float 原样的值（0.3f 读出来是 0.30000001192092896），JS 那边和自己存的值比过再决定用哪个。
package nacre.runtime

import android.animation.Animator
import android.animation.AnimatorListenerAdapter
import android.animation.ArgbEvaluator
import android.animation.ObjectAnimator
import android.animation.PropertyValuesHolder
import android.animation.TimeInterpolator
import android.animation.ValueAnimator
import android.database.ContentObserver
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.util.Property
import android.view.Choreographer
import android.view.View
import android.view.animation.AccelerateDecelerateInterpolator
import android.view.animation.AccelerateInterpolator
import android.view.animation.AnticipateInterpolator
import android.view.animation.AnticipateOvershootInterpolator
import android.view.animation.BaseInterpolator
import android.view.animation.BounceInterpolator
import android.view.animation.CycleInterpolator
import android.view.animation.DecelerateInterpolator
import android.view.animation.LinearInterpolator
import android.view.animation.OvershootInterpolator
import android.view.animation.PathInterpolator
import java.util.Collections
import java.util.WeakHashMap

// requestAnimationFrame 背后的帧时钟。JS 那边是一个不挂在全局的内部类（NacreFrameClock）：
// 有回调在等时 JS 调 request，下一帧 Choreographer 来叫时发一个 frame 事件，带这一帧的时刻
// （System.nanoTime 的毫秒数，JS 换算成 performance.now() 的起点）。动画时长缩放变了也从它发
internal class FrameClock

internal class AnimationDomain(host: DomainHost) : Domain(host) {

    override val classes: Map<Class<*>, String> = mapOf(
        // View 由 ViewDomain 建；这里登记它，是为了 view.animate() 和读被动画改的属性来问这一组
        View::class.java to "View",
        BaseInterpolator::class.java to "BaseInterpolator",
        LinearInterpolator::class.java to "LinearInterpolator",
        AccelerateInterpolator::class.java to "AccelerateInterpolator",
        DecelerateInterpolator::class.java to "DecelerateInterpolator",
        AccelerateDecelerateInterpolator::class.java to "AccelerateDecelerateInterpolator",
        AnticipateInterpolator::class.java to "AnticipateInterpolator",
        OvershootInterpolator::class.java to "OvershootInterpolator",
        AnticipateOvershootInterpolator::class.java to "AnticipateOvershootInterpolator",
        BounceInterpolator::class.java to "BounceInterpolator",
        CycleInterpolator::class.java to "CycleInterpolator",
        PathInterpolator::class.java to "PathInterpolator",
        Animator::class.java to "Animator",
        ValueAnimator::class.java to "ValueAnimator",
        ObjectAnimator::class.java to "ObjectAnimator",
        FrameClock::class.java to "NacreFrameClock",
    )

    // ---- 枚举 ----

    private val repeatModes = EnumTable("restart" to ValueAnimator.RESTART, "reverse" to ValueAnimator.REVERSE)

    override val enums: Map<String, EnumTable<*>> = mapOf("repeatMode" to repeatModes)

    // ---- 值的转换（JS 那边已经照 Web IDL 转好、查过范围，这里只校验类型）----

    private fun float(v: Any?, what: String): Float =
        (v as? Double)?.toFloat() ?: throw NacreTypeError("$what must be a number")

    private fun long(v: Any?, what: String): Long =
        (v as? Double)?.toLong() ?: throw NacreTypeError("$what must be a number")

    private fun int(v: Any?, what: String): Int =
        (v as? Double)?.toInt() ?: throw NacreTypeError("$what must be a number")

    private fun bool(v: Any?, what: String): Boolean =
        v as? Boolean ?: throw NacreTypeError("$what must be a boolean")

    private fun list(v: Any?, what: String): List<*> {
        val l = v as? List<*> ?: throw NacreTypeError("$what must be an array")
        if (l.isEmpty()) throw NacreTypeError("$what needs at least one value")
        return l
    }

    private fun floats(v: Any?, what: String): FloatArray = list(v, what).let { l -> FloatArray(l.size) { float(l[it], what) } }
    private fun ints(v: Any?, what: String): IntArray = list(v, what).let { l -> IntArray(l.size) { int(l[it], what) } }

    // 颜色：ARGB 的无符号整数（JS 那边解析好的）
    private fun colors(v: Any?, what: String): IntArray = list(v, what).let { l ->
        IntArray(l.size) {
            val d = l[it] as? Double ?: throw NacreTypeError("$what must be colors")
            if (d < 0 || d > 0xFFFFFFFFL.toDouble() || d != Math.floor(d)) throw NacreTypeError("$what must be colors")
            d.toLong().toInt()
        }
    }

    // null 是 Android 默认的曲线（先加速后减速）。Java 的 setInterpolator(null) 是线性的，这里不照搬
    private fun interpolatorArg(objects: List<Any?>, i: Int, where: String): TimeInterpolator {
        val o = objects.getOrNull(i) ?: return AccelerateDecelerateInterpolator()
        return o as? TimeInterpolator ?: throw NacreTypeError("$where: argument ${i + 1} must be an interpolator")
    }

    // float 原样写成 double（0.3f 写成 0.30000001192092896），JS 那边按 float 比
    private fun exact(f: Float): String = if (f.isFinite()) f.toDouble().toString() else "null"

    // ---- 颜色动画 ----
    //
    // 颜色动画的值是 Integer，和整数动画分不开，所以记下哪些是颜色动画；animatedValue 交给 JS 时
    // 包成 {"argb": n}，JS 写成 CSS 的颜色字符串
    private val argbAnimators: MutableSet<ValueAnimator> = Collections.newSetFromMap(WeakHashMap())

    // ---- 造对象 ----

    override fun construct(className: String, args: List<*>, objects: List<Any?>): Any? = when (className) {
        "LinearInterpolator" -> LinearInterpolator()
        "AccelerateInterpolator" -> AccelerateInterpolator(float(args.getOrNull(0), "factor"))
        "DecelerateInterpolator" -> DecelerateInterpolator(float(args.getOrNull(0), "factor"))
        "AccelerateDecelerateInterpolator" -> AccelerateDecelerateInterpolator()
        "AnticipateInterpolator" -> AnticipateInterpolator(float(args.getOrNull(0), "tension"))
        "OvershootInterpolator" -> OvershootInterpolator(float(args.getOrNull(0), "tension"))
        "AnticipateOvershootInterpolator" ->
            AnticipateOvershootInterpolator(float(args.getOrNull(0), "tension"), float(args.getOrNull(1), "extraTension"))
        "BounceInterpolator" -> BounceInterpolator()
        "CycleInterpolator" -> CycleInterpolator(float(args.getOrNull(0), "cycles"))
        "PathInterpolator" -> PathInterpolator(float(args.getOrNull(0), "x1"), float(args.getOrNull(1), "y1"),
                                               float(args.getOrNull(2), "x2"), float(args.getOrNull(3), "y2"))
        // 空的，JS 接着把 values 这些设上（ObjectAnimator 的目标和值在开始播时交）
        "ValueAnimator" -> watched(ValueAnimator())
        "ObjectAnimator" -> watched(ObjectAnimator())
        // Animator、BaseInterpolator 是抽象类；帧时钟由运行时建
        else -> throw NacreTypeError("Illegal constructor: $className cannot be constructed")
    }

    // JS 建的 animator 一建好就装上监听：start、end 这几个总是发
    private fun <T : ValueAnimator> watched(a: T): T {
        a.addListener(object : Animator.AnimatorListener {
            override fun onAnimationStart(animation: Animator) = host.emitter.plain(animation, "start")
            override fun onAnimationEnd(animation: Animator) = host.emitter.plain(animation, "end")
            override fun onAnimationCancel(animation: Animator) = host.emitter.plain(animation, "cancel")
            override fun onAnimationRepeat(animation: Animator) = host.emitter.plain(animation, "repeat")
        })
        a.addPauseListener(object : Animator.AnimatorPauseListener {
            override fun onAnimationPause(animation: Animator) = host.emitter.plain(animation, "pause")
            override fun onAnimationResume(animation: Animator) = host.emitter.plain(animation, "resume")
        })
        return a
    }

    // ---- 读属性 ----

    override fun read(target: Any, name: String): String? = when (target) {
        is ValueAnimator -> readAnimator(target, name)
        is View -> readView(target, name)
        else -> null
    }

    private fun readAnimator(a: ValueAnimator, name: String): String? = when (name) {
        "animatedValue" -> when (val v = a.animatedValue) {
            is Float -> exact(v)
            is Int -> if (a in argbAnimators) "{\"argb\":${v.toLong() and 0xFFFFFFFFL}}" else v.toString()
            else -> "null"
        }
        "animatedFraction" -> exact(a.animatedFraction)
        "currentPlayTime" -> a.currentPlayTime.toString()
        "isRunning" -> a.isRunning.toString()
        "isStarted" -> a.isStarted.toString()
        "isPaused" -> a.isPaused.toString()
        else -> null
    }

    // 被动画改的属性（像素、度、0–1），float 原样。外观组（AppearanceDomain）只管设，不读
    private fun readView(v: View, name: String): String? = viewProperties[name]?.let { exact(it.get(v)) }

    // ---- 写属性 ----

    override fun write(target: Any, name: String, value: Any?): Boolean {
        val a = target as? ValueAnimator ?: return false
        when (name) {
            "duration" -> a.duration = long(value, name)
            "startDelay" -> a.startDelay = long(value, name)
            // -1 是无限次（JS 那边的 Infinity）
            "repeatCount" -> a.repeatCount = int(value, name).let { if (it < 0) ValueAnimator.INFINITE else it }
            "repeatMode" -> a.repeatMode = repeatModes.forProperty(name, value)
            "currentPlayTime" -> a.currentPlayTime = long(value, name)
            "autoCancel" -> (a as? ObjectAnimator ?: return false).setAutoCancel(bool(value, name))
            else -> return false
        }
        return true
    }

    // ---- 方法 ----

    override fun call(target: Any, name: String, args: List<*>, objects: List<Any?>): String? {
        when (target) {
            is TimeInterpolator -> {
                if (name != "getInterpolation") return null
                return exact(target.getInterpolation(float(args.getOrNull(0), name)))
            }
            is ValueAnimator -> when (name) {
                "start" -> target.start()
                "cancel" -> target.cancel()
                "end" -> target.end()
                "pause" -> target.pause()
                "resume" -> target.resume()
                "reverse" -> target.reverse()
                "setInterpolator" -> target.interpolator = interpolatorArg(objects, 0, name)
                "@values" -> setValues(target, args)
                "@configure" -> configure(target as? ObjectAnimator ?: return null, args, objects)
                else -> return null
            }
            is FrameClock -> when (name) {
                "request" -> requestFrame()
                else -> return null
            }
            else -> return null
        }
        return "null"
    }

    // values：每次换一个新的 PropertyValuesHolder（在原来的上面改，从整数换成小数时会留下旧的关键帧）
    private fun setValues(a: ValueAnimator, args: List<*>) {
        when (args.getOrNull(0)) {
            "float" -> {
                a.setValues(PropertyValuesHolder.ofFloat("", *floats(args.getOrNull(1), "values")))
                argbAnimators.remove(a)
            }
            "argb" -> {
                a.setValues(PropertyValuesHolder.ofInt("", *colors(args.getOrNull(1), "values")))
                a.setEvaluator(ArgbEvaluator())
                argbAnimators.add(a)
            }
            else -> throw NacreTypeError("@values: unknown kind")
        }
    }

    // ObjectAnimator 开始播之前：目标（视图）、属性名（就是 Java 的属性名，反射找 setXxx）、整数还是小数、值（像素）
    private fun configure(a: ObjectAnimator, args: List<*>, objects: List<Any?>) {
        val view = objects.getOrNull(0) as? View ?: throw NacreTypeError("@configure: target must be a View")
        val property = args.getOrNull(1) as? String ?: throw NacreTypeError("@configure: propertyName must be a string")
        a.setValues(when (args.getOrNull(2)) {
            "int" -> PropertyValuesHolder.ofInt(property, *ints(args.getOrNull(3), "values"))
            else -> PropertyValuesHolder.ofFloat(property, *floats(args.getOrNull(3), "values"))
        })
        a.target = view
    }

    // ---- view.animate() ----
    //
    // 一次 animate 一个 ValueAnimator（0 → 1），每帧按进度把几个属性从起点插到终点（起点在真的开始时读，
    // 延迟之后）。同一个视图、同一个属性上后开始的接走先开始的：被接走的属性那个动画不再管；属性全被接走的
    // 那个取消，兑现 false。和 ViewPropertyAnimator 的规矩一样，只是每一次有自己的结果
    private val viewProperties: Map<String, Property<View, Float>> = mapOf(
        "alpha" to View.ALPHA,
        "translationX" to View.TRANSLATION_X,
        "translationY" to View.TRANSLATION_Y,
        "translationZ" to View.TRANSLATION_Z,
        "scaleX" to View.SCALE_X,
        "scaleY" to View.SCALE_Y,
        "rotation" to View.ROTATION,
        "rotationX" to View.ROTATION_X,
        "rotationY" to View.ROTATION_Y,
        "elevation" to object : Property<View, Float>(Float::class.java, "elevation") {
            override fun get(v: View) = v.elevation
            override fun set(v: View, value: Float) { v.elevation = value }
        },
    )

    private inner class ViewAnimation(val id: Int, val view: View, val ends: MutableMap<String, Float>, val callId: Int) {
        val animator: ValueAnimator = ValueAnimator.ofFloat(0f, 1f)
        val starts = HashMap<String, Float>()
        var cancelled = false

        fun start(duration: Long, delay: Long, interpolator: TimeInterpolator) {
            animator.duration = duration
            animator.startDelay = delay
            animator.interpolator = interpolator
            animator.addListener(object : AnimatorListenerAdapter() {
                override fun onAnimationStart(animation: Animator) {
                    for ((name, _) in ends) starts[name] = viewProperties.getValue(name).get(view)
                }
                override fun onAnimationCancel(animation: Animator) { cancelled = true }
                override fun onAnimationEnd(animation: Animator) = finish(this@ViewAnimation, !cancelled)
            })
            animator.addUpdateListener {
                val f = it.animatedValue as Float
                for ((name, end) in ends) {
                    val start = starts[name] ?: continue
                    viewProperties.getValue(name).set(view, start + (end - start) * f)
                }
            }
            animator.start()
        }
    }

    private val viewAnimations = HashMap<Int, ViewAnimation>()
    private val owners = WeakHashMap<View, HashMap<String, ViewAnimation>>()

    override fun callAsync(target: Any, name: String, args: List<*>, objects: List<Any?>, callId: Int): Boolean {
        if (target !is View || name != "@animate") return false
        val id = int(args.getOrNull(0), "id")
        val names = list(args.getOrNull(1), "names").map { it as? String ?: throw NacreTypeError("names must be strings") }
        val values = floats(args.getOrNull(2), "values")
        val ends = LinkedHashMap<String, Float>()
        for ((i, n) in names.withIndex()) {
            if (n !in viewProperties) throw NacreTypeError("$n cannot be animated")
            ends[n] = values[i]
        }
        val a = ViewAnimation(id, target, ends, callId)
        // 接走同一个属性上先开始的
        val mine = owners.getOrPut(target) { HashMap() }
        for (n in ends.keys) {
            val old = mine.put(n, a) ?: continue
            old.ends.remove(n)
            if (old.ends.isEmpty()) old.animator.cancel()
        }
        viewAnimations[id] = a
        a.start(long(args.getOrNull(3), "duration"), long(args.getOrNull(4), "delay"), interpolatorArg(objects, 5, name))
        return true
    }

    private fun finish(a: ViewAnimation, completed: Boolean) {
        if (viewAnimations.remove(a.id) == null) return
        owners[a.view]?.let { mine -> mine.entries.removeAll { it.value === a } }
        host.settle.json(a.callId, completed.toString())
    }

    // ---- 事件 ----

    override fun subscribe(target: Any, type: String, on: Boolean): Boolean {
        when (target) {
            is ValueAnimator -> {
                // 另外几个总是发，不用订
                if (type != "update") return type in ANIMATOR_EVENTS
                if (on) target.addUpdateListener(updateListener) else target.removeUpdateListener(updateListener)
                return true
            }
            is FrameClock -> when (type) {
                // frame 只在 JS 调了 request 之后发，不用订
                "frame" -> return true
                "durationscalechange" -> {
                    watchDurationScale(on)
                    return true
                }
                else -> return false
            }
            else -> return false
        }
    }

    private val updateListener = ValueAnimator.AnimatorUpdateListener { host.emitter.plain(it, "update") }

    // ---- 帧时钟 ----

    private val clock = FrameClock()
    private var frameRequested = false
    private val frameCallback = Choreographer.FrameCallback { frameTimeNanos ->
        frameRequested = false
        host.emitter.json(clock, "frame", "{\"detail\":${frameTimeNanos / 1e6}}", "CustomEvent")
    }

    // 下一帧叫一次。JS 有回调在等、而且这一帧还没约过时才调
    private fun requestFrame() {
        if (frameRequested) return
        frameRequested = true
        Choreographer.getInstance().postFrameCallback(frameCallback)
    }

    // ---- 动画时长缩放 ----
    //
    // Android 13 起系统有现成的读法和变化通知；11、12 读系统设置、用 ContentObserver 盯着它
    private val hasScaleApi = Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU
    private var lastScale = Float.NaN
    private var scaleListener: Any? = null

    private fun durationScale(): Float =
        if (hasScaleApi) ValueAnimator.getDurationScale()
        else Settings.Global.getFloat(host.app.contentResolver, Settings.Global.ANIMATOR_DURATION_SCALE, 1f)

    // 值真的变了才发（系统可能重复通知同一个值）
    private fun scaleMaybeChanged(scale: Float) {
        if (scale == lastScale) return
        lastScale = scale
        host.emitter.plain(clock, "durationscalechange")
    }

    private fun watchDurationScale(on: Boolean) {
        if (on == (scaleListener != null)) return
        if (on) {
            lastScale = durationScale()
            if (hasScaleApi) {
                val l = ValueAnimator.DurationScaleChangeListener { scaleMaybeChanged(it) }
                ValueAnimator.registerDurationScaleChangeListener(l)
                scaleListener = l
            } else {
                val observer = object : ContentObserver(Handler(Looper.getMainLooper())) {
                    override fun onChange(selfChange: Boolean) = scaleMaybeChanged(durationScale())
                }
                host.app.contentResolver.registerContentObserver(
                    Settings.Global.getUriFor(Settings.Global.ANIMATOR_DURATION_SCALE), false, observer)
                scaleListener = observer
            }
        } else {
            val l = scaleListener
            if (hasScaleApi && l is ValueAnimator.DurationScaleChangeListener) {
                ValueAnimator.unregisterDurationScaleChangeListener(l)
            } else if (l is ContentObserver) {
                host.app.contentResolver.unregisterContentObserver(l)
            }
            scaleListener = null
        }
    }

    // ---- 类级的 ----

    // 帧时钟只有一个（类名 @animation 只是桥上的地址）
    override fun classObject(className: String, name: String): Any? =
        if (className == "@animation" && name == "frameClock") clock else NOT_MINE

    override fun classCall(className: String, name: String, args: List<*>, objects: List<Any?>): String? {
        if (className != "@animation") return null
        return when (name) {
            // 和 Choreographer 给的帧时刻同一个时钟，JS 用它换算到 performance.now() 的起点
            "now" -> (System.nanoTime() / 1e6).toString()
            // 照 float 写出来的样子（0.5f 是 0.5），不带 float 换成 double 的尾巴
            "durationScale" -> durationScale().toString().toDouble().toString().let { if (it.endsWith(".0")) it.dropLast(2) else it }
            // view.animate() 被 signal 中止、视图离开页面时取消。已经结束的不管
            "cancelViewAnimation" -> {
                viewAnimations[int(args.getOrNull(0), "id")]?.animator?.cancel()
                "null"
            }
            else -> null
        }
    }

    override fun close() {
        Choreographer.getInstance().removeFrameCallback(frameCallback)
        watchDurationScale(false)
        for (a in viewAnimations.values.toList()) a.animator.cancel()
    }

    companion object {
        private val ANIMATOR_EVENTS = setOf("start", "end", "cancel", "repeat", "pause", "resume")
    }
}
