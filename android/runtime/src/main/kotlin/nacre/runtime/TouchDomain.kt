// 触摸和手势这一组：View 的触摸事件（touchstart / touchmove / touchend / touchcancel）和 longclick；
// 可点、可长按、可用、按下、触感反馈、点击音、不让父视图抢几个状态；performClick、performLongClick、
// performHapticFeedback；GestureDetector、ScaleGestureDetector、VelocityTracker；页面上的
// ViewConfiguration。JS 那一侧在 builtin/parts/35-touch.js。
//
// 2026-11-28 照「接类的总则」重写（见 docs/internals/android.md「触摸和手势」）：
//   视图上有触摸的监听器、挂着的识别器、或者开着 disallowsParentIntercept 时，装一个 OnTouchListener
//   （Touch）。按下时先替它向父视图声明不许抢（开着的话），再把事件记下来发给 JS、喂给挂着的识别器；
//   有触摸的监听器、或者有识别器有人听时，自己调一次 onTouchEvent（点击、按下态照常）并答「处理了」，
//   这样整段手势都归它。JS 那边延后一轮才收到，等不到它回答，所以由这里替它要下。
//   识别器由 JS 在视图挂上时按那个页面建，经 @touchDetectors 交给视图。
//
// 交给 JS 的长度是 dp（像素除以页面的密度），角度是度，时刻和 performance.now() 同一个钟
// （SystemClock.uptimeMillis 减掉 JS 启动时告诉这里的差）。
package nacre.runtime

import android.app.Activity
import android.content.Context
import android.os.Build
import android.view.GestureDetector
import android.view.HapticFeedbackConstants
import android.view.InputDevice
import android.view.MotionEvent
import android.view.ScaleGestureDetector
import android.view.VelocityTracker
import android.view.View
import android.view.ViewConfiguration
import org.json.JSONArray
import org.json.JSONObject
import java.util.WeakHashMap

internal class TouchDomain(host: DomainHost) : Domain(host) {

    override val classes: Map<Class<*>, String> = mapOf(
        // View 由 ViewDomain 建、Activity 由系统建；这里登记，是为了它们的成员也来问这一组
        View::class.java to "View",
        Activity::class.java to "Activity",
        NacreGestureDetector::class.java to "GestureDetector",
        NacreScaleGestureDetector::class.java to "ScaleGestureDetector",
        NacreVelocityTracker::class.java to "VelocityTracker",
    )

    // ---- 枚举 ----

    // HapticFeedbackConstants。KEYBOARD_PRESS 和 KEYBOARD_TAP 是同一个值，两个名字都认；
    // Android 14 起才有的那几个，14 以下不在表里（写了抛 TypeError，列出这台机器上有的）
    private val hapticConstants: EnumTable<Int> = run {
        val entries = ArrayList<Pair<String, Int>>()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            entries += "noHaptics" to HapticFeedbackConstants.NO_HAPTICS
        }
        entries += listOf(
            "longPress" to HapticFeedbackConstants.LONG_PRESS,
            "virtualKey" to HapticFeedbackConstants.VIRTUAL_KEY,
            "keyboardTap" to HapticFeedbackConstants.KEYBOARD_TAP,
            "keyboardPress" to HapticFeedbackConstants.KEYBOARD_PRESS,
            "clockTick" to HapticFeedbackConstants.CLOCK_TICK,
            "contextClick" to HapticFeedbackConstants.CONTEXT_CLICK,
            "keyboardRelease" to HapticFeedbackConstants.KEYBOARD_RELEASE,
            "virtualKeyRelease" to HapticFeedbackConstants.VIRTUAL_KEY_RELEASE,
            "textHandleMove" to HapticFeedbackConstants.TEXT_HANDLE_MOVE,
            "gestureStart" to HapticFeedbackConstants.GESTURE_START,
            "gestureEnd" to HapticFeedbackConstants.GESTURE_END,
            "confirm" to HapticFeedbackConstants.CONFIRM,
            "reject" to HapticFeedbackConstants.REJECT,
        )
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            entries += listOf(
                "toggleOn" to HapticFeedbackConstants.TOGGLE_ON,
                "toggleOff" to HapticFeedbackConstants.TOGGLE_OFF,
                "gestureThresholdActivate" to HapticFeedbackConstants.GESTURE_THRESHOLD_ACTIVATE,
                "gestureThresholdDeactivate" to HapticFeedbackConstants.GESTURE_THRESHOLD_DEACTIVATE,
                "dragStart" to HapticFeedbackConstants.DRAG_START,
                "segmentTick" to HapticFeedbackConstants.SEGMENT_TICK,
                "segmentFrequentTick" to HapticFeedbackConstants.SEGMENT_FREQUENT_TICK,
            )
        }
        EnumTable(*entries.toTypedArray())
    }

    override val enums: Map<String, EnumTable<*>> = mapOf("hapticFeedback" to hapticConstants, "toolType" to TOOL_TYPES)

    // ---- 值的转换（JS 那边已经照 Web IDL 转好、核过了，这里只校验）----

    private fun bool(v: Any?, what: String): Boolean =
        v as? Boolean ?: throw NacreTypeError("$what must be a boolean")

    private fun double(v: Any?, what: String): Double =
        (v as? Double)?.takeIf { it.isFinite() } ?: throw NacreTypeError("$what must be a number")

    private fun contextArg(objects: List<Any?>, what: String): Context =
        objects.getOrNull(0) as? Context ?: throw NacreTypeError("$what: argument 1 must be a Context")

    // ---- 造对象 ----

    override fun construct(className: String, args: List<*>, objects: List<Any?>): Any? = when (className) {
        // 识别器由 35-touch.js 在视图挂上时建，参数里的对象是那个页面
        "GestureDetector" -> {
            val context = contextArg(objects, "new GestureDetector")
            val listener = GestureListener(host.emitter, clock, context)
            NacreGestureDetector(context, listener).also { listener.detector = it }
        }
        "ScaleGestureDetector" -> {
            val context = contextArg(objects, "new ScaleGestureDetector")
            val listener = ScaleListener(host.emitter, clock, context)
            NacreScaleGestureDetector(context, listener).also { listener.detector = it }
        }
        "VelocityTracker" -> NacreVelocityTracker()
        else -> null
    }

    // ---- 属性 ----

    override fun read(target: Any, name: String): String? = when {
        target is View && name == "isPressed" -> target.isPressed.toString()
        target is Activity && name == "viewConfiguration" -> viewConfiguration(target)
        target is NacreScaleGestureDetector && name == "isInProgress" -> target.isInProgress.toString()
        else -> null
    }

    override fun write(target: Any, name: String, value: Any?): Boolean {
        when (target) {
            is View -> when (name) {
                // 可点、可长按：JS 交来的已经是原生实际该是的值（写的值，或者听着 click / longclick，或者可选中）
                "isClickable" -> target.isClickable = bool(value, name)
                "isLongClickable" -> target.isLongClickable = bool(value, name)
                "isEnabled" -> target.isEnabled = bool(value, name)
                "isPressed" -> target.isPressed = bool(value, name)
                "isHapticFeedbackEnabled" -> target.isHapticFeedbackEnabled = bool(value, name)
                "isSoundEffectsEnabled" -> target.isSoundEffectsEnabled = bool(value, name)
                "disallowsParentIntercept" -> {
                    touchOf(target).disallowParent = bool(value, name)
                    refresh(target)
                }
                else -> return false
            }
            is NacreGestureDetector -> when (name) {
                "isLongpressEnabled" -> target.setIsLongpressEnabled(bool(value, name))
                else -> return false
            }
            is NacreScaleGestureDetector -> when (name) {
                "isQuickScaleEnabled" -> target.isQuickScaleEnabled = bool(value, name)
                "isStylusScaleEnabled" -> target.isStylusScaleEnabled = bool(value, name)
                else -> return false
            }
            else -> return false
        }
        return true
    }

    // ---- 方法 ----

    override fun call(target: Any, name: String, args: List<*>, objects: List<Any?>): String? {
        when (target) {
            is View -> when (name) {
                "performClick" -> return target.performClick().toString()
                "performLongClick" -> return target.performLongClick().toString()
                "performHapticFeedback" -> {
                    val constant = hapticConstants.forArgument("performHapticFeedback", args.getOrNull(0))
                    var flags = 0
                    if (bool(args.getOrNull(1), "ignoreViewSetting")) {
                        flags = flags or HapticFeedbackConstants.FLAG_IGNORE_VIEW_SETTING
                    }
                    // Android 13 起对普通 App 不起作用（系统的文档），照样传过去
                    @Suppress("DEPRECATION")
                    if (bool(args.getOrNull(2), "ignoreGlobalSetting")) {
                        flags = flags or HapticFeedbackConstants.FLAG_IGNORE_GLOBAL_SETTING
                    }
                    return target.performHapticFeedback(constant, flags).toString()
                }
                // 挂在这个视图上的识别器（35-touch.js 只给它用，不是 API）：正好是这一串，空的是全拿掉
                "@touchDetectors" -> {
                    touchOf(target).detectors = objects.map {
                        it as? FedDetector ?: throw NacreTypeError("@touchDetectors: every item must be a detector")
                    }
                    refresh(target)
                    return "null"
                }
            }
            is NacreVelocityTracker -> when (name) {
                "addMovement" -> {
                    val event = rebuild(args.getOrNull(0))
                    try {
                        target.add(event)
                    } finally {
                        event.recycle()
                    }
                    return "null"
                }
                "getVelocity" -> {
                    val id = args.getOrNull(0)?.let { double(it, "pointerId").toInt() }
                    val max = args.getOrNull(1)?.let { double(it, "maxVelocity").toFloat() }
                    return target.velocity(id, max)
                }
                "clear" -> {
                    target.clear()
                    return "null"
                }
            }
        }
        return null
    }

    // 类级的方法：ViewConfiguration 的几个时限（毫秒）；@touch 的时钟（35-touch.js 启动时用）
    override fun classCall(className: String, name: String, args: List<*>, objects: List<Any?>): String? =
        when (className) {
            "ViewConfiguration" -> when (name) {
                "getTapTimeout" -> ViewConfiguration.getTapTimeout().toString()
                "getDoubleTapTimeout" -> ViewConfiguration.getDoubleTapTimeout().toString()
                "getLongPressTimeout" -> ViewConfiguration.getLongPressTimeout().toString()
                "getJumpTapTimeout" -> ViewConfiguration.getJumpTapTimeout().toString()
                "getPressedStateDuration" -> ViewConfiguration.getPressedStateDuration().toString()
                else -> null
            }
            "@touch" -> when (name) {
                // 现在的时刻：SystemClock.uptimeMillis 那个钟，带小数
                "now" -> (System.nanoTime() / 1e6).toString()
                // 这个钟比 performance.now() 多出来的毫秒数
                "clockOffset" -> {
                    clock.offsetMs = double(args.getOrNull(0), "clockOffset")
                    "null"
                }
                else -> null
            }
            else -> null
        }

    // ---- 页面上的 ViewConfiguration：像素换成 dp ----

    private fun viewConfiguration(activity: Activity): String {
        val c = ViewConfiguration.get(activity)
        val density = densityOf(activity)
        return JSONObject()
            .put("touchSlop", c.scaledTouchSlop / density)
            .put("doubleTapSlop", c.scaledDoubleTapSlop / density)
            .put("pagingTouchSlop", c.scaledPagingTouchSlop / density)
            .put("windowTouchSlop", c.scaledWindowTouchSlop / density)
            .put("hoverSlop", c.scaledHoverSlop / density)
            .put("minimumScalingSpan", c.scaledMinimumScalingSpan / density)
            .put("minimumFlingVelocity", c.scaledMinimumFlingVelocity / density)
            .put("maximumFlingVelocity", c.scaledMaximumFlingVelocity / density)
            .put("ambiguousGestureMultiplier", num(c.scaledAmbiguousGestureMultiplier))
            .toString()
    }

    // ---- 视图上的触摸 ----

    // 一个视图的触摸：JS 听着哪几种、挂着哪些识别器、开没开 disallowsParentIntercept。
    // 不拿着视图本身（WeakHashMap 的值强引用键，视图就永远回收不了），视图从回调的参数里拿
    private inner class Touch : View.OnTouchListener {
        val types = HashSet<String>()
        var detectors: List<FedDetector> = emptyList()
        var disallowParent = false

        fun needed() = types.isNotEmpty() || detectors.isNotEmpty() || disallowParent

        // 要不要替它要下整段手势：有触摸的监听器，或者有识别器有人听
        fun claims() = types.isNotEmpty() || detectors.any { it.listening }

        override fun onTouch(v: View, event: MotionEvent): Boolean {
            // 按下时父视图刚清掉上一次的声明，还没问过要不要抢：这时候声明，当次手势就赶得上
            if (event.actionMasked == MotionEvent.ACTION_DOWN && disallowParent) {
                v.parent?.requestDisallowInterceptTouchEvent(true)
            }
            val type = typeOf(event)
            if (type != null && type in types) {
                host.emitter.json(v, type, motionJson(event, null, densityOf(v), clock), "MotionEvent")
            }
            // 喂的时候识别器可能被换掉（JS 不在这里跑，不会），拷一份防万一
            for (d in detectors.toList()) d.feed(event)
            if (!claims()) return false
            // 答「处理了」之后系统不再调 onTouchEvent，所以自己调一次：点击、长按、按下态照常
            v.onTouchEvent(event)
            return true
        }
    }

    private val touches = WeakHashMap<View, Touch>()

    private fun touchOf(view: View): Touch = touches.getOrPut(view) { Touch() }

    // 用得着才装：没有监听器、识别器，也没开 disallowsParentIntercept 时拿掉
    private fun refresh(view: View) {
        val touch = touches[view] ?: return
        if (touch.needed()) {
            view.setOnTouchListener(touch)
        } else {
            view.setOnTouchListener(null)
            touches.remove(view)
        }
    }

    // ---- 事件 ----

    override fun subscribe(target: Any, type: String, on: Boolean): Boolean {
        when (target) {
            is View -> {
                if (type in TOUCH_TYPES) {
                    val touch = touchOf(target)
                    if (on) touch.types += type else touch.types -= type
                    refresh(target)
                    return true
                }
                if (type == "longclick") {
                    // 答「处理了」：系统照惯例震一下（isHapticFeedbackEnabled 管），松手后不再发 click。
                    // setOnLongClickListener 不管给不给 null 都会把视图设成可长按的，JS 随后按它的值重设
                    if (on) target.setOnLongClickListener { host.emitter.plain(it, "longclick"); true }
                    else target.setOnLongClickListener(null)
                    return true
                }
            }
            is NacreGestureDetector -> if (type in GestureListener.TYPES) {
                if (on) target.listener.subscribed += type else target.listener.subscribed -= type
                return true
            }
            is NacreScaleGestureDetector -> if (type in ScaleListener.TYPES) {
                if (on) target.listener.subscribed += type else target.listener.subscribed -= type
                return true
            }
        }
        return false
    }

    // ---- VelocityTracker：JS 交来的记录重建成 MotionEvent ----

    // JS 那边（35-touch.js 的 packMotionEvent）已经转好、核过了：类型是四种触摸之一，至少一根
    // 手指，actionIndex 在范围里，id 是 0–31 且不重复，history 每个采样的手指个数对得上。
    // 坐标是 dp，直接喂（速度跟着是 dp/秒）；时刻换回 uptimeMillis
    private fun rebuild(raw: Any?): MotionEvent {
        val m = raw as? Map<*, *> ?: throw NacreTypeError("expected a MotionEvent")
        val pointers = m["pointers"] as? List<*> ?: throw NacreTypeError("MotionEvent.pointers must be an array")
        val count = pointers.size
        if (count == 0) throw NacreTypeError("MotionEvent has no pointers")
        val actionIndex = double(m["actionIndex"], "actionIndex").toInt()
        val masked = when (m["type"]) {
            "touchstart" -> if (count == 1) MotionEvent.ACTION_DOWN else MotionEvent.ACTION_POINTER_DOWN
            "touchmove" -> MotionEvent.ACTION_MOVE
            "touchend" -> if (count == 1) MotionEvent.ACTION_UP else MotionEvent.ACTION_POINTER_UP
            "touchcancel" -> MotionEvent.ACTION_CANCEL
            else -> throw NacreTypeError("MotionEvent type must be touchstart, touchmove, touchend or touchcancel")
        }
        val action = if (masked == MotionEvent.ACTION_POINTER_DOWN || masked == MotionEvent.ACTION_POINTER_UP) {
            masked or (actionIndex shl MotionEvent.ACTION_POINTER_INDEX_SHIFT)
        } else masked
        val properties = Array(count) { i ->
            val p = pointers[i] as? Map<*, *> ?: throw NacreTypeError("pointer $i must be an object")
            MotionEvent.PointerProperties().apply {
                id = double(p["id"], "pointer id").toInt()
                toolType = TOOL_TYPES.forArgument("toolType", p["toolType"])
            }
        }
        // 采样：先是 history 里的，最后是这一次的
        val samples = ArrayList<Pair<Long, Array<MotionEvent.PointerCoords>>>()
        for (h in m["history"] as? List<*> ?: emptyList<Any?>()) {
            val sample = h as? Map<*, *> ?: throw NacreTypeError("history entries must be objects")
            samples += clock.uptime(double(sample["eventTime"], "history eventTime")) to coordsOf(sample["pointers"], count)
        }
        samples += clock.uptime(double(m["eventTime"], "eventTime")) to coordsOf(pointers, count)
        val (firstTime, firstCoords) = samples[0]
        val event = MotionEvent.obtain(clock.uptime(double(m["downTime"], "downTime")), firstTime, action, count,
                                       properties, firstCoords, 0, 0, 1f, 1f, 0, 0, InputDevice.SOURCE_TOUCHSCREEN, 0)
        for (i in 1 until samples.size) event.addBatch(samples[i].first, samples[i].second, 0)
        return event
    }

    private fun coordsOf(raw: Any?, count: Int): Array<MotionEvent.PointerCoords> {
        val list = raw as? List<*> ?: throw NacreTypeError("pointers must be an array")
        if (list.size != count) throw NacreTypeError("every history sample must have $count pointers")
        return Array(count) { i ->
            val p = list[i] as? Map<*, *> ?: throw NacreTypeError("pointer $i must be an object")
            MotionEvent.PointerCoords().apply {
                x = double(p["x"], "x").toFloat()
                y = double(p["y"], "y").toFloat()
                pressure = double(p["pressure"], "pressure").toFloat()
                size = double(p["size"], "size").toFloat()
                touchMajor = double(p["touchMajor"], "touchMajor").toFloat()
                touchMinor = double(p["touchMinor"], "touchMinor").toFloat()
                toolMajor = double(p["toolMajor"], "toolMajor").toFloat()
                toolMinor = double(p["toolMinor"], "toolMinor").toFloat()
                orientation = Math.toRadians(double(p["orientation"], "orientation")).toFloat()
            }
        }
    }

    // ---- 时钟 ----

    // performance.now() 和 SystemClock.uptimeMillis 是同一个钟（CLOCK_MONOTONIC），零点不同。
    // 差由 35-touch.js 启动时量好交过来
    class Clock {
        var offsetMs = 0.0

        fun perf(uptimeMs: Long): Double = uptimeMs - offsetMs

        // 交给 MotionEvent.obtain 的整数毫秒。JS 交回来的就是这里发出去的，加回去正好是原来的整数
        fun uptime(perfMs: Double): Long = Math.round(perfMs + offsetMs)
    }

    private val clock = Clock()

    // ---- 识别器 ----

    // 视图喂给识别器的接口：喂一个事件；有没有人听（有人听视图才替它要下整段手势）
    interface FedDetector {
        fun feed(event: MotionEvent)
        val listening: Boolean
    }

    private class NacreGestureDetector(context: Context, val listener: GestureListener) :
        GestureDetector(context, listener), FedDetector {
        override fun feed(event: MotionEvent) { onTouchEvent(event) }
        override val listening: Boolean get() = listener.subscribed.isNotEmpty()
    }

    private class NacreScaleGestureDetector(context: Context, val listener: ScaleListener) :
        ScaleGestureDetector(context, listener), FedDetector {
        override fun feed(event: MotionEvent) { onTouchEvent(event) }
        override val listening: Boolean get() = listener.subscribed.isNotEmpty()
    }

    // GestureDetector 的回调。事件里要嵌 MotionEvent，所以发的是内部事件 @gesture（CustomEvent，
    // detail 里是记录和对外的事件类名），由 JS 那边建成对外的事件再派发。
    // 返回值：JS 有没有听这个事件（只影响 GestureDetector.onTouchEvent 的返回值，那个这里不用）
    private class GestureListener(
        private val emitter: NativeBridge.Emitter,
        private val clock: Clock,
        private val context: Context,
    ) : GestureDetector.OnGestureListener, GestureDetector.OnDoubleTapListener {

        lateinit var detector: NacreGestureDetector
        val subscribed = HashSet<String>()

        private fun fire(type: String, eventClass: String, event: MotionEvent, extra: String = ""): Boolean {
            if (type !in subscribed) return false
            val density = densityOf(context)
            val detail = "{\"type\":\"$type\",\"eventClass\":\"$eventClass\"," +
                "\"motionEvent\":${motionJson(event, typeOf(event), density, clock)}$extra}"
            emitter.json(detector, "@gesture", "{\"detail\":$detail}", "CustomEvent")
            return true
        }

        private fun pair(down: MotionEvent?, a: String, av: Double, b: String, bv: Double): String {
            val density = densityOf(context)
            return ",\"downEvent\":${down?.let { motionJson(it, typeOf(it), density, clock) } ?: "null"}" +
                ",\"$a\":${number(av)},\"$b\":${number(bv)}"
        }

        override fun onDown(e: MotionEvent) = fire("down", "GestureDetectorEvent", e)
        override fun onShowPress(e: MotionEvent) { fire("showpress", "GestureDetectorEvent", e) }
        override fun onSingleTapUp(e: MotionEvent) = fire("singletapup", "GestureDetectorEvent", e)
        // Java 给的是上一次减这一次；JS 的 deltaX 是这一次减上一次（方向和手指一致），换成 dp
        override fun onScroll(e1: MotionEvent?, e2: MotionEvent, distanceX: Float, distanceY: Float): Boolean {
            val density = densityOf(context)
            return fire("pan", "GestureDetectorPanEvent", e2,
                        pair(e1, "deltaX", -distanceX / density, "deltaY", -distanceY / density))
        }
        override fun onLongPress(e: MotionEvent) { fire("longpress", "GestureDetectorEvent", e) }
        // 速度：像素每秒换成 dp/秒
        override fun onFling(e1: MotionEvent?, e2: MotionEvent, velocityX: Float, velocityY: Float): Boolean {
            val density = densityOf(context)
            return fire("fling", "GestureDetectorFlingEvent", e2,
                        pair(e1, "velocityX", velocityX / density, "velocityY", velocityY / density))
        }
        override fun onSingleTapConfirmed(e: MotionEvent) = fire("singletapconfirmed", "GestureDetectorEvent", e)
        override fun onDoubleTap(e: MotionEvent) = fire("doubletap", "GestureDetectorEvent", e)
        override fun onDoubleTapEvent(e: MotionEvent) = fire("doubletapevent", "GestureDetectorEvent", e)

        companion object {
            val TYPES = setOf("down", "showpress", "singletapup", "pan", "longpress", "fling",
                              "singletapconfirmed", "doubletap", "doubletapevent")
        }
    }

    // ScaleGestureDetector 的回调。三个回调都答「是」：要开始、这一次算处理了（下一次的比例
    // 相对这一次算）。识别器的状态会往前走，所以当场把数值记进事件
    private class ScaleListener(
        private val emitter: NativeBridge.Emitter,
        private val clock: Clock,
        private val context: Context,
    ) : ScaleGestureDetector.OnScaleGestureListener {

        lateinit var detector: NacreScaleGestureDetector
        val subscribed = HashSet<String>()

        private fun fire(type: String, d: ScaleGestureDetector) {
            if (type !in subscribed) return
            val density = densityOf(context)
            val json = JSONObject()
                .put("focusX", d.focusX / density)
                .put("focusY", d.focusY / density)
                .put("scaleFactor", num(d.scaleFactor))
                .put("currentSpan", d.currentSpan / density)
                .put("currentSpanX", d.currentSpanX / density)
                .put("currentSpanY", d.currentSpanY / density)
                .put("previousSpan", d.previousSpan / density)
                .put("previousSpanX", d.previousSpanX / density)
                .put("previousSpanY", d.previousSpanY / density)
                .put("timeDelta", d.timeDelta)
                .put("eventTime", clock.perf(d.eventTime))
            emitter.json(detector, type, json.toString(), "ScaleGestureEvent")
        }

        override fun onScaleBegin(detector: ScaleGestureDetector): Boolean {
            fire("scalebegin", detector)
            return true
        }
        override fun onScale(detector: ScaleGestureDetector): Boolean {
            fire("scale", detector)
            return true
        }
        override fun onScaleEnd(detector: ScaleGestureDetector) { fire("scaleend", detector) }

        companion object {
            val TYPES = setOf("scalebegin", "scale", "scaleend")
        }
    }

    // VelocityTracker 加上「哪几根手指有数据」：Java 对没有数据的手指给 0，分不出是停着还是没有，
    // JS 那边没有数据是 null。按下时 Java 自己清掉之前的，这里跟着清
    private class NacreVelocityTracker {
        val tracker: VelocityTracker = VelocityTracker.obtain()
        val seen = HashSet<Int>()

        fun add(event: MotionEvent) {
            if (event.actionMasked == MotionEvent.ACTION_DOWN) seen.clear()
            for (i in 0 until event.pointerCount) seen += event.getPointerId(i)
            tracker.addMovement(event)
        }

        fun velocity(id: Int?, max: Float?): String {
            if (seen.isEmpty() || (id != null && id !in seen)) return "null"
            tracker.computeCurrentVelocity(1000, max ?: Float.MAX_VALUE)
            val x = if (id == null) tracker.xVelocity else tracker.getXVelocity(id)
            val y = if (id == null) tracker.yVelocity else tracker.getYVelocity(id)
            return "{\"x\":${num(x)},\"y\":${num(y)}}"
        }

        fun clear() {
            tracker.clear()
            seen.clear()
        }
    }

    companion object {
        private val TOUCH_TYPES = setOf("touchstart", "touchmove", "touchend", "touchcancel")

        private val TOOL_TYPES = EnumTable(
            "unknown" to MotionEvent.TOOL_TYPE_UNKNOWN,
            "finger" to MotionEvent.TOOL_TYPE_FINGER,
            "stylus" to MotionEvent.TOOL_TYPE_STYLUS,
            "mouse" to MotionEvent.TOOL_TYPE_MOUSE,
            "eraser" to MotionEvent.TOOL_TYPE_ERASER)

        // Java 的 float 用最短的写法（0.3f 写成 0.3，不是 0.30000001192092896）
        private fun num(f: Float): Double = f.toString().toDouble()

        // 1 dp 几个像素：和 10-view.js 换算视图长度用的是同一个数（ViewDomain 的 @metrics）
        private fun densityOf(context: Context): Double = num(context.resources.displayMetrics.density)
        private fun densityOf(view: View): Double = densityOf(view.context)

        private fun number(d: Double): String = if (d.isFinite()) JSONObject.numberToString(d) else "null"

        // 触摸动作 → 事件名。别的动作（悬停、滚轮、鼠标按键）不是触摸，不发
        fun typeOf(event: MotionEvent): String? = when (event.actionMasked) {
            MotionEvent.ACTION_DOWN, MotionEvent.ACTION_POINTER_DOWN -> "touchstart"
            MotionEvent.ACTION_MOVE -> "touchmove"
            MotionEvent.ACTION_UP, MotionEvent.ACTION_POINTER_UP -> "touchend"
            MotionEvent.ACTION_CANCEL -> "touchcancel"
            else -> null
        }

        // MotionEvent 记成 JSON（MotionEvent 这个事件类的 init）。type 不是 null 时也记上
        // （识别器的事件里嵌的那几个要知道自己是哪一种）。长度除以密度，角度换成度，时刻换成
        // performance.now() 的钟。按下、抬起记下是哪一根手指，别的动作没有这个值（null）
        fun motionJson(event: MotionEvent, type: String?, density: Double, clock: Clock): String {
            val masked = event.actionMasked
            val actionIndex: Any = when (masked) {
                MotionEvent.ACTION_DOWN, MotionEvent.ACTION_UP,
                MotionEvent.ACTION_POINTER_DOWN, MotionEvent.ACTION_POINTER_UP -> event.actionIndex
                else -> JSONObject.NULL
            }
            val out = JSONObject()
            if (type != null) out.put("type", type)
            out.put("actionIndex", actionIndex)
            out.put("downTime", clock.perf(event.downTime))
            out.put("eventTime", clock.perf(event.eventTime))
            val pointers = JSONArray()
            for (i in 0 until event.pointerCount) {
                pointers.put(JSONObject()
                    .put("id", event.getPointerId(i))
                    .put("x", event.getX(i) / density)
                    .put("y", event.getY(i) / density)
                    .put("screenX", event.getRawX(i) / density)
                    .put("screenY", event.getRawY(i) / density)
                    .put("pressure", num(event.getPressure(i)))
                    .put("size", num(event.getSize(i)))
                    .put("touchMajor", event.getTouchMajor(i) / density)
                    .put("touchMinor", event.getTouchMinor(i) / density)
                    .put("toolMajor", event.getToolMajor(i) / density)
                    .put("toolMinor", event.getToolMinor(i) / density)
                    .put("orientation", Math.toDegrees(event.getOrientation(i).toDouble()))
                    .put("toolType", TOOL_TYPES.name(event.getToolType(i)) ?: "unknown"))
            }
            out.put("pointers", pointers)
            val history = JSONArray()
            for (h in 0 until event.historySize) {
                val samples = JSONArray()
                for (i in 0 until event.pointerCount) {
                    samples.put(JSONObject()
                        .put("x", event.getHistoricalX(i, h) / density)
                        .put("y", event.getHistoricalY(i, h) / density)
                        .put("pressure", num(event.getHistoricalPressure(i, h)))
                        .put("size", num(event.getHistoricalSize(i, h)))
                        .put("touchMajor", event.getHistoricalTouchMajor(i, h) / density)
                        .put("touchMinor", event.getHistoricalTouchMinor(i, h) / density)
                        .put("toolMajor", event.getHistoricalToolMajor(i, h) / density)
                        .put("toolMinor", event.getHistoricalToolMinor(i, h) / density)
                        .put("orientation", Math.toDegrees(event.getHistoricalOrientation(i, h).toDouble())))
                }
                history.put(JSONObject().put("eventTime", clock.perf(event.getHistoricalEventTime(h))).put("pointers", samples))
            }
            out.put("history", history)
            return out.toString()
        }
    }
}
