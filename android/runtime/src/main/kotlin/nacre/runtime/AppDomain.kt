// App 层：application 的包信息、openURL()、trimmemory；activity 的生命周期、返回、配置、
// 被链接打开。JS 那一侧在 builtin/parts/33-app.js。
//
// 这些都是 AndroidX 的 ComponentActivity 给的能力（Lifecycle、OnBackPressedDispatcher、
// 配置变化和新 intent 的监听），壳必须继承它（project.md 第 4 节「页面」）。
// 只把系统发生了什么告诉 JS，不替 JS 做任何决定：返回键接不接由 JS 提前写进 handlesBack，
// 原生照着答。
package nacre.runtime

import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.ComponentCallbacks2
import android.content.Intent
import android.content.res.Configuration
import android.net.Uri
import android.view.View
import androidx.activity.BackEventCompat
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.core.util.Consumer
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import org.json.JSONArray
import org.json.JSONObject
import java.lang.ref.WeakReference
import java.util.WeakHashMap

internal class AppDomain(host: DomainHost) : Domain(host) {

    override val classes: Map<Class<*>, String> = mapOf(Activity::class.java to "Activity")

    // 页面可能同时有几个，也可能一个都没有（运行时跟着 App 生死），这一组的状态按页面分开存。
    // 键是弱引用，Page 也只弱引用着页面：页面销毁、JS 也不再拿着它时，这一项跟着没了
    private val pages = WeakHashMap<Activity, Page>()

    private fun componentOf(target: Activity): ComponentActivity = target as? ComponentActivity
        ?: throw NacreTypeError("the activity must extend androidx.activity.ComponentActivity")

    private fun pageOf(target: Activity): Page = pages.getOrPut(target) { Page(componentOf(target)) }

    private inner class Page(activity: ComponentActivity) {
        private val ref = WeakReference(activity)

        // 原生真的会发的事件：有人订了的才发
        val subscribed = mutableSetOf<String>()

        fun emit(type: String) {
            val a = ref.get() ?: return
            if (type in subscribed) host.emitter.plain(a, type)
        }

        // ---- 返回：handlesBack 就是这个回调开没开 ----
        //
        // 系统要在手势开始之前就知道 App 接不接返回（预测性返回的动画要先选好），所以不能等
        // JS 当场答，由 JS 提前设好。默认关着：系统照它自己的做法处理返回
        val backCallback = object : OnBackPressedCallback(false) {
            override fun handleOnBackStarted(backEvent: BackEventCompat) = emitBack("backstart", backEvent)
            override fun handleOnBackProgressed(backEvent: BackEventCompat) = emitBack("backprogress", backEvent)
            override fun handleOnBackPressed() = emit("back")
            override fun handleOnBackCancelled() = emit("backcancel")
        }
        var backCallbackAdded = false

        private fun emitBack(type: String, e: BackEventCompat) {
            if (type !in subscribed) return
            val edge = when (e.swipeEdge) {
                BackEventCompat.EDGE_LEFT -> "left"
                BackEventCompat.EDGE_RIGHT -> "right"
                else -> "none"
            }
            val json = JSONObject()
                .put("progress", e.progress.toString().toDouble())
                .put("touchX", e.touchX.toString().toDouble())
                .put("touchY", e.touchY.toString().toDouble())
                .put("swipeEdge", edge)
            val a = ref.get() ?: return
            host.emitter.json(a, type, json.toString(), "BackEvent")
        }

        // ---- 生命周期 ----

        // addObserver 会当场把已经发生过的事件补发给新的观察者，那些不是「现在发生了」，不发
        var addingObserver = false
        val lifecycleObserver = LifecycleEventObserver { _, event ->
            if (!addingObserver) lifecycleEvents[event]?.let(::emit)
        }

        // ---- 配置变化、新的 intent、内存告警 ----

        val configurationListener = Consumer<Configuration> { emit("configurationchange") }

        val newIntentListener = Consumer<Intent> { intent ->
            val url = intent.data?.toString() ?: return@Consumer
            val a = ref.get()
            if (a != null && "openurl" in subscribed) {
                host.emitter.json(a, "openurl", JSONObject().put("url", url).toString(), "OpenURLEvent")
            }
        }

        // 内存告警是整个 App 的事，JS 那边挂在 application 上；application 没有原生对象，
        // 所以发在页面上，用内部的名字，33-app.js 转过去
        val trimMemoryListener = Consumer<Int> { level ->
            val a = ref.get()
            if (a != null && TRIM_EVENT in subscribed) {
                host.emitter.json(a, TRIM_EVENT, JSONObject().put("level", trimLevelName(level)).toString(),
                                  "TrimMemoryEvent")
            }
        }

        fun close() {
            backCallback.remove()
            ref.get()?.let { a ->
                a.lifecycle.removeObserver(lifecycleObserver)
                a.removeOnConfigurationChangedListener(configurationListener)
                a.removeOnNewIntentListener(newIntentListener)
                a.removeOnTrimMemoryListener(trimMemoryListener)
            }
            subscribed.clear()
        }
    }

    override fun read(target: Any, name: String): String? {
        if (target !is Activity) return null
        return when (name) {
            "lifecycleState" -> JSONObject.quote(componentOf(target).lifecycle.currentState.name.lowercase())
            "launchURL" -> target.intent?.data?.toString()?.let(JSONObject::quote) ?: "null"
            "configuration" -> configurationJson(target.resources.configuration)
            "handlesBack" -> pageOf(target).backCallback.isEnabled.toString()
            else -> null
        }
    }

    override fun write(target: Any, name: String, value: Any?): Boolean {
        if (target !is Activity || name != "handlesBack") return false
        if (value !is Boolean) throw NacreTypeError("handlesBack: expected a boolean")
        val page = pageOf(target)
        if (!page.backCallbackAdded) {
            componentOf(target).onBackPressedDispatcher.addCallback(page.backCallback)
            page.backCallbackAdded = true
        }
        page.backCallback.isEnabled = value
        return true
    }

    override fun callAsync(target: Any, name: String, args: List<*>, objects: List<Any?>, callId: Int): Boolean {
        if (target !is Activity || name != "openURL") return false
        val url = args.getOrNull(0) as? String ?: throw NacreTypeError("openURL: expected a string")
        // 打开的 App 放进它自己的任务，不叠在这个 App 的页面上面
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        val opened = try {
            target.startActivity(intent)
            true
        } catch (e: ActivityNotFoundException) {
            false
        } catch (e: SecurityException) {
            false
        }
        host.settle.json(callId, opened.toString())
        return true
    }

    override fun subscribe(target: Any, type: String, on: Boolean): Boolean {
        if (target !is Activity) return false
        val a = componentOf(target)
        val page = pageOf(target)
        val subscribed = page.subscribed
        when (type) {
            "start", "resume", "pause", "stop" -> {
                val before = subscribed.any { it in lifecycleEvents.values }
                if (on) subscribed += type else subscribed -= type
                val after = subscribed.any { it in lifecycleEvents.values }
                if (!before && after) {
                    page.addingObserver = true
                    try { a.lifecycle.addObserver(page.lifecycleObserver) } finally { page.addingObserver = false }
                } else if (before && !after) {
                    a.lifecycle.removeObserver(page.lifecycleObserver)
                }
            }
            "back", "backstart", "backprogress", "backcancel" -> {
                if (on) subscribed += type else subscribed -= type
            }
            "configurationchange" -> {
                if (on) a.addOnConfigurationChangedListener(page.configurationListener)
                else a.removeOnConfigurationChangedListener(page.configurationListener)
                if (on) subscribed += type else subscribed -= type
            }
            "openurl" -> {
                if (on) a.addOnNewIntentListener(page.newIntentListener)
                else a.removeOnNewIntentListener(page.newIntentListener)
                if (on) subscribed += type else subscribed -= type
            }
            TRIM_EVENT -> {
                if (on) a.addOnTrimMemoryListener(page.trimMemoryListener)
                else a.removeOnTrimMemoryListener(page.trimMemoryListener)
                if (on) subscribed += type else subscribed -= type
            }
            else -> return false
        }
        return true
    }

    // 包信息：application 没有原生对象，走类级的调用（类名 @application 只是桥上的地址）
    override fun classCall(className: String, name: String, args: List<*>, objects: List<Any?>): String? {
        if (className != "@application" || name != "packageInfo") return null
        val app = host.app
        val info = app.packageManager.getPackageInfo(app.packageName, 0)
        return JSONObject()
            .put("packageName", app.packageName)
            .put("versionName", info.versionName ?: JSONObject.NULL)
            .put("versionCode", info.longVersionCode)
            .toString()
    }

    override fun close() {
        for (page in pages.values) page.close()
        pages.clear()
    }

    private fun configurationJson(c: Configuration): String {
        val orientation = when (c.orientation) {
            Configuration.ORIENTATION_PORTRAIT -> "portrait"
            Configuration.ORIENTATION_LANDSCAPE -> "landscape"
            else -> "undefined"
        }
        val tags = c.locales.toLanguageTags()
        val locales = JSONArray()
        if (tags.isNotEmpty()) tags.split(',').forEach { locales.put(it) }
        return JSONObject()
            .put("orientation", orientation)
            .put("screenWidthDp", c.screenWidthDp)
            .put("screenHeightDp", c.screenHeightDp)
            .put("smallestScreenWidthDp", c.smallestScreenWidthDp)
            .put("densityDpi", c.densityDpi)
            // Float 直接转 Double 会带出 1.149999976 这样的尾巴，按它写出来的样子转
            .put("fontScale", c.fontScale.toString().toDouble())
            .put("isNightModeActive", c.isNightModeActive)
            .put("locales", locales)
            .put("layoutDirection", if (c.layoutDirection == View.LAYOUT_DIRECTION_RTL) "rtl" else "ltr")
            .toString()
    }

    companion object {
        private const val TRIM_EVENT = "@trimmemory"

        private val lifecycleEvents = mapOf(
            Lifecycle.Event.ON_START to "start",
            Lifecycle.Event.ON_RESUME to "resume",
            Lifecycle.Event.ON_PAUSE to "pause",
            Lifecycle.Event.ON_STOP to "stop",
        )

        // 常量去掉 TRIM_MEMORY_ 前缀、首字母小写。系统以后加的级别按落在哪一档归过去
        @Suppress("DEPRECATION")
        fun trimLevelName(level: Int): String = when {
            level >= ComponentCallbacks2.TRIM_MEMORY_COMPLETE -> "complete"
            level >= ComponentCallbacks2.TRIM_MEMORY_MODERATE -> "moderate"
            level >= ComponentCallbacks2.TRIM_MEMORY_BACKGROUND -> "background"
            level >= ComponentCallbacks2.TRIM_MEMORY_UI_HIDDEN -> "uiHidden"
            level >= ComponentCallbacks2.TRIM_MEMORY_RUNNING_CRITICAL -> "runningCritical"
            level >= ComponentCallbacks2.TRIM_MEMORY_RUNNING_LOW -> "runningLow"
            else -> "runningModerate"
        }
    }
}
