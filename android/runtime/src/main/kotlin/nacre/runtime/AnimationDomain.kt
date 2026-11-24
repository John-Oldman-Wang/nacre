// 动画这一组：插值器（BaseInterpolator 一族）、Animator / ValueAnimator / ObjectAnimator、
// view.animate() 的 ViewPropertyAnimator；requestAnimationFrame 用的帧时钟（Choreographer）；
// 系统的动画时长缩放。JS 那一侧在 builtin/parts/37-animation.js。
//
// 时长和时刻是毫秒。动画的通知照 AnimatorListener 转成事件，排到下一轮派发，不可取消：
// start、end、cancel、repeat、pause、resume 总是发（不常发，JS 要靠 end 放开正在跑的
// animator 的包装）；update 每帧一次，有人订才装。
package nacre.runtime

import android.animation.Animator
import android.animation.ObjectAnimator
import android.animation.TimeInterpolator
import android.animation.ValueAnimator
import android.database.ContentObserver
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.view.Choreographer
import android.view.View
import android.view.ViewPropertyAnimator
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
import java.util.IdentityHashMap
import java.util.WeakHashMap

// requestAnimationFrame 背后的帧时钟。JS 那边是一个不挂在全局的内部类（NacreFrameClock）：
// 有回调在等时 JS 调 request，下一帧 Choreographer 来叫时发一个 frame 事件，带这一帧的时刻
// （System.nanoTime 的毫秒数，JS 换算成 performance.now() 的起点）。动画时长缩放变了也从它发
internal class FrameClock

internal class AnimationDomain(host: DomainHost) : Domain(host) {

    override val classes: Map<Class<*>, String> = mapOf(
        // View 由 ViewDomain 建；这里登记它，是为了 view.animate() 来问这一组
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
        ViewPropertyAnimator::class.java to "ViewPropertyAnimator",
        FrameClock::class.java to "NacreFrameClock",
    )

    // ---- 枚举 ----

    private val repeatModes = EnumTable("restart" to ValueAnimator.RESTART, "reverse" to ValueAnimator.REVERSE)
    // repeatCount 是次数或者这个哨兵
    private val repeatCounts = EnumTable("infinite" to ValueAnimator.INFINITE)

    // ---- 值的转换（JS 那边已经照 Web IDL 转好了类型，这里只校验）----

    private fun float(v: Any?, what: String): Float =
        (v as? Double)?.toFloat() ?: throw NacreTypeError("$what must be a number")

    private fun long(v: Any?, what: String): Long =
        (v as? Double)?.toLong() ?: throw NacreTypeError("$what must be a number")

    private fun int(v: Any?, what: String): Int =
        (v as? Double)?.toInt() ?: throw NacreTypeError("$what must be a number")

    private fun bool(v: Any?, what: String): Boolean =
        v as? Boolean ?: throw NacreTypeError("$what must be a boolean")

    private fun color(v: Any?, what: String): Int {
        val d = v as? Double ?: throw NacreTypeError("$what must be a color")
        if (d < 0 || d > 0xFFFFFFFFL.toDouble() || d != Math.floor(d)) throw NacreTypeError("$what must be a color")
        return d.toLong().toInt()
    }

    private fun list(v: Any?, what: String): List<*> {
        val l = v as? List<*> ?: throw NacreTypeError("$what must be an array")
        if (l.isEmpty()) throw NacreTypeError("$what needs at least one value")
        return l
    }

    private fun floats(v: Any?, what: String): FloatArray = list(v, what).let { l -> FloatArray(l.size) { float(l[it], what) } }
    private fun ints(v: Any?, what: String): IntArray = list(v, what).let { l -> IntArray(l.size) { int(l[it], what) } }
    private fun colors(v: Any?, what: String): IntArray = list(v, what).let { l -> IntArray(l.size) { color(l[it], what) } }

    private fun interpolatorArg(objects: List<Any?>, i: Int, where: String): TimeInterpolator? {
        val o = objects.getOrNull(i) ?: return null
        return o as? TimeInterpolator ?: throw NacreTypeError("$where: argument ${i + 1} must be an interpolator")
    }

    // Java 的 float 用最短的写法（0.3f 写成 0.3）
    private fun num(f: Float): String = if (f.isFinite()) f.toString() else "null"

    private fun quote(s: String): String = "\"$s\""

    // ---- 颜色动画 ----
    //
    // ofArgb 的值是 Integer，和 ofInt 分不开，所以记下哪些是颜色动画；animatedValue 交给 JS 时
    // 包成 {"argb": n}，JS 写成 CSS 的颜色字符串。setFloatValues / setIntValues 之后就不是了
    private val argbAnimators: MutableSet<ValueAnimator> = Collections.newSetFromMap(WeakHashMap())

    // ---- 造对象 ----

    override fun construct(className: String, args: List<*>, objects: List<Any?>): Any? = when (className) {
        "LinearInterpolator" -> LinearInterpolator()
        "AccelerateInterpolator" ->
            if (args.isEmpty()) AccelerateInterpolator() else AccelerateInterpolator(float(args[0], "factor"))
        "DecelerateInterpolator" ->
            if (args.isEmpty()) DecelerateInterpolator() else DecelerateInterpolator(float(args[0], "factor"))
        "AccelerateDecelerateInterpolator" -> AccelerateDecelerateInterpolator()
        "AnticipateInterpolator" ->
            if (args.isEmpty()) AnticipateInterpolator() else AnticipateInterpolator(float(args[0], "tension"))
        "OvershootInterpolator" ->
            if (args.isEmpty()) OvershootInterpolator() else OvershootInterpolator(float(args[0], "tension"))
        "AnticipateOvershootInterpolator" -> when (args.size) {
            0 -> AnticipateOvershootInterpolator()
            1 -> AnticipateOvershootInterpolator(float(args[0], "tension"))
            else -> AnticipateOvershootInterpolator(float(args[0], "tension"), float(args[1], "extraTension"))
        }
        "BounceInterpolator" -> BounceInterpolator()
        "CycleInterpolator" -> CycleInterpolator(float(args.getOrNull(0), "cycles"))
        "PathInterpolator" -> when (args.size) {
            2 -> PathInterpolator(float(args[0], "controlX"), float(args[1], "controlY"))
            4 -> PathInterpolator(float(args[0], "controlX1"), float(args[1], "controlY1"),
                                  float(args[2], "controlX2"), float(args[3], "controlY2"))
            else -> throw NacreTypeError("PathInterpolator expects 2 or 4 numbers")
        }
        // 第一个参数是哪一种造法：空的（new ValueAnimator()）、ofFloat / ofInt / ofArgb
        "ValueAnimator" -> watched(valueAnimator(args))
        "ObjectAnimator" -> watched(objectAnimator(args, objects))
        // Animator、BaseInterpolator 是抽象类；ViewPropertyAnimator、帧时钟由系统和运行时建
        else -> throw NacreTypeError("Illegal constructor: $className cannot be constructed")
    }

    private fun valueAnimator(args: List<*>): ValueAnimator = when (args.getOrNull(0)) {
        null -> ValueAnimator()
        "ofFloat" -> ValueAnimator.ofFloat(*floats(args.getOrNull(1), "ofFloat"))
        "ofInt" -> ValueAnimator.ofInt(*ints(args.getOrNull(1), "ofInt"))
        "ofArgb" -> ValueAnimator.ofArgb(*colors(args.getOrNull(1), "ofArgb")).also { argbAnimators.add(it) }
        else -> throw NacreTypeError("unknown ValueAnimator factory")
    }

    // ObjectAnimator.ofXxx(target, propertyName, ...values)：args 是 [造法, 目标, 属性名, 值]，目标在 objects[1]
    private fun objectAnimator(args: List<*>, objects: List<Any?>): ObjectAnimator {
        val kind = args.getOrNull(0) ?: return ObjectAnimator()
        val target = objects.getOrNull(1) ?: throw NacreTypeError("$kind: argument 1 must be a native object")
        val property = args.getOrNull(2) as? String ?: throw NacreTypeError("$kind: propertyName must be a string")
        return when (kind) {
            "ofFloat" -> ObjectAnimator.ofFloat(target, property, *floats(args.getOrNull(3), "ofFloat"))
            "ofInt" -> ObjectAnimator.ofInt(target, property, *ints(args.getOrNull(3), "ofInt"))
            "ofArgb" -> ObjectAnimator.ofArgb(target, property, *colors(args.getOrNull(3), "ofArgb"))
                .also { argbAnimators.add(it) }
            else -> throw NacreTypeError("unknown ObjectAnimator factory")
        }
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
        is ObjectAnimator -> readObjectAnimator(target, name) ?: readValueAnimator(target, name)
        is ValueAnimator -> readValueAnimator(target, name)
        is ViewPropertyAnimator -> when (name) {
            "duration" -> target.duration.toString()
            "startDelay" -> target.startDelay.toString()
            else -> null
        }
        else -> null
    }

    private fun readValueAnimator(a: ValueAnimator, name: String): String? = when (name) {
        "duration" -> a.duration.toString()
        "startDelay" -> a.startDelay.toString()
        "repeatCount" -> repeatCounts.name(a.repeatCount)?.let(::quote) ?: a.repeatCount.toString()
        "repeatMode" -> repeatModes.name(a.repeatMode)?.let(::quote)
            ?: throw IllegalStateException("unknown repeatMode ${a.repeatMode}")
        "totalDuration" -> if (a.totalDuration == Animator.DURATION_INFINITE) quote("infinite") else a.totalDuration.toString()
        "animatedValue" -> when (val v = a.animatedValue) {
            null -> "null"
            is Float -> num(v)
            is Int -> if (a in argbAnimators) "{\"argb\":${v.toLong() and 0xFFFFFFFFL}}" else v.toString()
            else -> "null"
        }
        "animatedFraction" -> num(a.animatedFraction)
        "currentPlayTime" -> a.currentPlayTime.toString()
        "isRunning" -> a.isRunning.toString()
        "isStarted" -> a.isStarted.toString()
        "isPaused" -> a.isPaused.toString()
        else -> null
    }

    private fun readObjectAnimator(a: ObjectAnimator, name: String): String? = when (name) {
        "propertyName" -> a.propertyName?.let { org.json.JSONObject.quote(it) } ?: "null"
        else -> null
    }

    // ---- 写属性 ----

    override fun write(target: Any, name: String, value: Any?): Boolean {
        when {
            target is ValueAnimator -> when (name) {
                // 负数由 Java 抛 IllegalArgumentException
                "duration" -> target.duration = long(value, name)
                "startDelay" -> target.startDelay = long(value, name)
                "repeatCount" -> target.repeatCount =
                    if (value is String) repeatCounts.forProperty(name, value) else int(value, name)
                "repeatMode" -> target.repeatMode = repeatModes.forProperty(name, value)
                "currentPlayTime" -> target.currentPlayTime = long(value, name)
                "propertyName" -> (target as? ObjectAnimator ?: return false).setPropertyName(
                    value as? String ?: throw NacreTypeError("$name must be a string"))
                else -> return false
            }
            target is ViewPropertyAnimator -> when (name) {
                "duration" -> target.duration = long(value, name)
                "startDelay" -> target.startDelay = long(value, name)
                else -> return false
            }
            else -> return false
        }
        return true
    }

    // ---- 方法 ----

    // ViewPropertyAnimator 上「设到某值」「加一个量」的那些，参数都是一个 float
    private val vpaMethods = setOf(
        "alpha", "alphaBy", "translationX", "translationXBy", "translationY", "translationYBy",
        "translationZ", "translationZBy", "x", "xBy", "y", "yBy", "z", "zBy",
        "scaleX", "scaleXBy", "scaleY", "scaleYBy", "rotation", "rotationBy",
        "rotationX", "rotationXBy", "rotationY", "rotationYBy")

    override fun call(target: Any, name: String, args: List<*>, objects: List<Any?>): String? {
        when (target) {
            is TimeInterpolator -> {
                if (name != "getInterpolation") return null
                return num(target.getInterpolation(float(args.getOrNull(0), name)))
            }
            is ValueAnimator -> when (name) {
                "start" -> target.start()
                "cancel" -> target.cancel()
                "end" -> target.end()
                "pause" -> target.pause()
                "resume" -> target.resume()
                "reverse" -> target.reverse()
                "setCurrentFraction" -> target.setCurrentFraction(float(args.getOrNull(0), name))
                "setFloatValues" -> {
                    target.setFloatValues(*floats(args.getOrNull(0), name))
                    argbAnimators.remove(target)
                }
                "setIntValues" -> {
                    target.setIntValues(*ints(args.getOrNull(0), name))
                    argbAnimators.remove(target)
                }
                // null 时 Java 换成 LinearInterpolator
                "setInterpolator" -> target.interpolator = interpolatorArg(objects, 0, name)
                "setAutoCancel" -> (target as? ObjectAnimator ?: return null).setAutoCancel(bool(args.getOrNull(0), name))
                "setTarget" -> (target as? ObjectAnimator ?: return null).target =
                    objects.getOrNull(0) ?: throw NacreTypeError("$name: argument 1 must be a native object")
                else -> return null
            }
            is ViewPropertyAnimator -> when (name) {
                in vpaMethods -> vpaCall(target, name, float(args.getOrNull(0), name))
                "setInterpolator" -> target.interpolator = interpolatorArg(objects, 0, name)
                "withLayer" -> target.withLayer()
                "start" -> target.start()
                "cancel" -> target.cancel()
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

    private fun vpaCall(a: ViewPropertyAnimator, name: String, v: Float) {
        when (name) {
            "alpha" -> a.alpha(v)
            "alphaBy" -> a.alphaBy(v)
            "translationX" -> a.translationX(v)
            "translationXBy" -> a.translationXBy(v)
            "translationY" -> a.translationY(v)
            "translationYBy" -> a.translationYBy(v)
            "translationZ" -> a.translationZ(v)
            "translationZBy" -> a.translationZBy(v)
            "x" -> a.x(v)
            "xBy" -> a.xBy(v)
            "y" -> a.y(v)
            "yBy" -> a.yBy(v)
            "z" -> a.z(v)
            "zBy" -> a.zBy(v)
            "scaleX" -> a.scaleX(v)
            "scaleXBy" -> a.scaleXBy(v)
            "scaleY" -> a.scaleY(v)
            "scaleYBy" -> a.scaleYBy(v)
            "rotation" -> a.rotation(v)
            "rotationBy" -> a.rotationBy(v)
            "rotationX" -> a.rotationX(v)
            "rotationXBy" -> a.rotationXBy(v)
            "rotationY" -> a.rotationY(v)
            "rotationYBy" -> a.rotationYBy(v)
        }
    }

    override fun callObject(target: Any, name: String, args: List<*>, objects: List<Any?>): Any? = when {
        // 同一个视图每次给的是同一个（View 自己缓存着它）
        target is View && name == "animate" -> target.animate()
        target is ValueAnimator && name == "getInterpolator" -> target.interpolator
        target is ObjectAnimator && name == "getTarget" -> target.target
        target is ViewPropertyAnimator && name == "getInterpolator" -> target.interpolator
        else -> NOT_MINE
    }

    // ---- 事件 ----

    // ViewPropertyAnimator 只有一个监听的位子（setListener），有人订 start / end / cancel 时装上
    private val vpaSubscriptions = IdentityHashMap<ViewPropertyAnimator, MutableSet<String>>()

    override fun subscribe(target: Any, type: String, on: Boolean): Boolean {
        when (target) {
            is ValueAnimator -> {
                // 另外几个总是发，不用订
                if (type != "update") return type in ANIMATOR_EVENTS
                if (on) target.addUpdateListener(updateListener) else target.removeUpdateListener(updateListener)
                return true
            }
            is ViewPropertyAnimator -> {
                if (type == "update") {
                    target.setUpdateListener(if (on) ValueAnimator.AnimatorUpdateListener {
                        host.emitter.plain(target, "update")
                    } else null)
                    return true
                }
                if (type !in VPA_EVENTS) return false
                val set = vpaSubscriptions.getOrPut(target) { HashSet() }
                if (on) set.add(type) else set.remove(type)
                if (set.isEmpty()) {
                    vpaSubscriptions.remove(target)
                    target.setListener(null)
                } else if (on && set.size == 1) {
                    target.setListener(vpaListener(target))
                }
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

    // 回调里拿到的是 ViewPropertyAnimator 内部的那个 Animator，事件发在 ViewPropertyAnimator 上
    private fun vpaListener(owner: ViewPropertyAnimator) = object : Animator.AnimatorListener {
        override fun onAnimationStart(animation: Animator) = host.emitter.plain(owner, "start")
        override fun onAnimationEnd(animation: Animator) = host.emitter.plain(owner, "end")
        override fun onAnimationCancel(animation: Animator) = host.emitter.plain(owner, "cancel")
        override fun onAnimationRepeat(animation: Animator) {}
    }

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
        else Settings.Global.getFloat(host.activity.contentResolver, Settings.Global.ANIMATOR_DURATION_SCALE, 1f)

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
                host.activity.contentResolver.registerContentObserver(
                    Settings.Global.getUriFor(Settings.Global.ANIMATOR_DURATION_SCALE), false, observer)
                scaleListener = observer
            }
        } else {
            val l = scaleListener
            if (hasScaleApi && l is ValueAnimator.DurationScaleChangeListener) {
                ValueAnimator.unregisterDurationScaleChangeListener(l)
            } else if (l is ContentObserver) {
                host.activity.contentResolver.unregisterContentObserver(l)
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
            "durationScale" -> num(durationScale())
            "areAnimatorsEnabled" -> ValueAnimator.areAnimatorsEnabled().toString()
            else -> null
        }
    }

    override fun close() {
        Choreographer.getInstance().removeFrameCallback(frameCallback)
        watchDurationScale(false)
    }

    companion object {
        private val ANIMATOR_EVENTS = setOf("start", "end", "cancel", "repeat", "pause", "resume")
        private val VPA_EVENTS = setOf("start", "end", "cancel")
    }
}
