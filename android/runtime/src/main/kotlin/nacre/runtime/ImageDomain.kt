// 图片这一组：ImageDecoder（来源、读头、解码）、Bitmap、BitmapDrawable、AnimatedImageDrawable、
// ImageView。JS 那一侧在 builtin/parts/34-image.js。
//
// 解码在后台的线程上做（Java 的 decodeBitmap 是同步的，主线程上解大图会卡），做完用 settle
// 兑现。Java 自己抛的异常（DecodeException、FileNotFoundException……）以异常的简单类名拒绝。
// 单位是像素。
package nacre.runtime

import android.graphics.Bitmap
import android.graphics.ImageDecoder
import android.graphics.PorterDuff
import android.graphics.Rect
import android.graphics.Shader
import android.graphics.drawable.Animatable2
import android.graphics.drawable.AnimatedImageDrawable
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.os.Build
import android.widget.ImageView
import org.json.JSONObject
import java.nio.ByteBuffer
import java.util.IdentityHashMap
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

internal class ImageDomain(host: DomainHost) : Domain(host) {

    override val classes: Map<Class<*>, String> = mapOf(
        ImageDecoder.Source::class.java to "ImageDecoder.Source",
        Bitmap::class.java to "Bitmap",
        BitmapDrawable::class.java to "BitmapDrawable",
        AnimatedImageDrawable::class.java to "AnimatedImageDrawable",
        ImageView::class.java to "ImageView",
    )

    // 解码用的线程。两条：几张图可以同时解，又不至于一下子占满所有核
    private val decoders: ExecutorService = Executors.newFixedThreadPool(2) { r ->
        Thread(r, "nacre.image.decode").apply { isDaemon = true }
    }

    override fun close() {
        decoders.shutdownNow()
    }

    // ---- 枚举 ----

    private val allocators = EnumTable(
        "default" to ImageDecoder.ALLOCATOR_DEFAULT,
        "software" to ImageDecoder.ALLOCATOR_SOFTWARE,
        "sharedMemory" to ImageDecoder.ALLOCATOR_SHARED_MEMORY,
        "hardware" to ImageDecoder.ALLOCATOR_HARDWARE)

    private val memoryPolicies = EnumTable(
        "lowRam" to ImageDecoder.MEMORY_POLICY_LOW_RAM,
        "default" to ImageDecoder.MEMORY_POLICY_DEFAULT)

    private val scaleTypes = EnumTable(
        "matrix" to ImageView.ScaleType.MATRIX,
        "fitXY" to ImageView.ScaleType.FIT_XY,
        "fitStart" to ImageView.ScaleType.FIT_START,
        "fitCenter" to ImageView.ScaleType.FIT_CENTER,
        "fitEnd" to ImageView.ScaleType.FIT_END,
        "center" to ImageView.ScaleType.CENTER,
        "centerCrop" to ImageView.ScaleType.CENTER_CROP,
        "centerInside" to ImageView.ScaleType.CENTER_INSIDE)

    // Shader.TileMode。DECAL 是 API 31 起才有；BitmapDrawable 不平铺时是 null
    private val tileModes: EnumTable<Shader.TileMode?> by lazy {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            EnumTable("clamp" to Shader.TileMode.CLAMP, "repeat" to Shader.TileMode.REPEAT,
                      "mirror" to Shader.TileMode.MIRROR, "decal" to Shader.TileMode.DECAL)
        } else {
            EnumTable("clamp" to Shader.TileMode.CLAMP, "repeat" to Shader.TileMode.REPEAT,
                      "mirror" to Shader.TileMode.MIRROR)
        }
    }

    // PorterDuff.Mode：去掉下划线转驼峰（SRC_ATOP → srcAtop），按 Java 里的先后
    private val porterDuffModes = EnumTable(*PorterDuff.Mode.values().map { camel(it.name) to it }.toTypedArray())

    // AnimatedImageDrawable.repeatCount 的哨兵：一直播
    private val repeatCounts = EnumTable("infinite" to AnimatedImageDrawable.REPEAT_INFINITE)

    // ---- 值的转换（JS 那边已经照 Web IDL 转好了类型，这里只校验）----

    private fun int(v: Any?, what: String): Int =
        (v as? Double)?.toInt() ?: throw NacreTypeError("$what must be a number")

    private fun bool(v: Any?, what: String): Boolean =
        v as? Boolean ?: throw NacreTypeError("$what must be a boolean")

    private fun color(v: Any?, what: String): Int {
        val d = v as? Double ?: throw NacreTypeError("$what must be a color")
        if (d < 0 || d > 0xFFFFFFFFL.toDouble() || d != Math.floor(d)) throw NacreTypeError("$what must be a color")
        return d.toLong().toInt()
    }

    private fun quote(s: String): String = JSONObject.quote(s)

    private fun argb(c: Int): String = (c.toLong() and 0xFFFFFFFFL).toString()

    // 没设、不限这类哨兵读出来是 null
    private fun intOrNull(value: Int, none: Int): String = if (value == none) "null" else value.toString()

    // ---- 造对象 ----

    override fun construct(className: String, args: List<*>, objects: List<Any?>): Any? = when (className) {
        // ImageDecoder.createSource：JS 那边的工厂方法从这里建。来源是一个 Blob，或者 assets/ 里的路径
        "ImageDecoder.Source" -> {
            val blob = objects.getOrNull(0) as? NacreBlob
            val path = args.getOrNull(0) as? String
            when {
                blob != null -> ImageDecoder.createSource(ByteBuffer.wrap(blob.data))
                path != null -> ImageDecoder.createSource(host.activity.assets, "$PROJECT_ASSETS/$path")
                else -> throw NacreTypeError("createSource: expected a Blob or a path")
            }
        }
        // Resources 用页面的（JS 里没有这个类），图的密度照它换算
        "BitmapDrawable" -> {
            val o = objects.getOrNull(0)
            if (o != null && o !is Bitmap) throw NacreTypeError("new BitmapDrawable: argument 1 must be a Bitmap")
            BitmapDrawable(host.activity.resources, o as Bitmap?)
        }
        "ImageView" -> ImageView(
            objects.getOrNull(0) as? android.content.Context
                ?: throw NacreTypeError("new ImageView: argument 1 must be a Context"))
        // Bitmap、AnimatedImageDrawable 只由解码和类方法建
        else -> throw NacreTypeError("Illegal constructor: $className cannot be constructed")
    }

    // ---- 读属性 ----

    override fun read(target: Any, name: String): String? = when (target) {
        is Bitmap -> readBitmap(target, name)
        is BitmapDrawable -> readBitmapDrawable(target, name)
        is AnimatedImageDrawable -> readAnimated(target, name)
        is ImageView -> readImageView(target, name)
        else -> null
    }

    private fun readBitmap(b: Bitmap, name: String): String? = when (name) {
        "width" -> b.width.toString()
        "height" -> b.height.toString()
        "config" -> b.config?.let { quote(camel(it.name)) } ?: "null"
        "density" -> intOrNull(b.density, Bitmap.DENSITY_NONE)
        "byteCount" -> b.byteCount.toString()
        "allocationByteCount" -> b.allocationByteCount.toString()
        "isMutable" -> b.isMutable.toString()
        "isPremultiplied" -> b.isPremultiplied.toString()
        "isRecycled" -> b.isRecycled.toString()
        else -> null
    }

    private fun readBitmapDrawable(d: BitmapDrawable, name: String): String? = when (name) {
        "tileModeX" -> tileModes.name(d.tileModeX)?.let(::quote) ?: "null"
        "tileModeY" -> tileModes.name(d.tileModeY)?.let(::quote) ?: "null"
        "isFilterBitmap" -> d.isFilterBitmap.toString()
        else -> null
    }

    private fun readAnimated(d: AnimatedImageDrawable, name: String): String? = when (name) {
        "repeatCount" -> repeatCounts.name(d.repeatCount)?.let(::quote) ?: d.repeatCount.toString()
        "isRunning" -> d.isRunning.toString()
        else -> null
    }

    private fun readImageView(v: ImageView, name: String): String? = when (name) {
        "scaleType" -> scaleTypes.name(v.scaleType)?.let(::quote)
            ?: throw IllegalStateException("unknown scale type ${v.scaleType}")
        "adjustViewBounds" -> v.adjustViewBounds.toString()
        "maxWidth" -> intOrNull(v.maxWidth, Int.MAX_VALUE)
        "maxHeight" -> intOrNull(v.maxHeight, Int.MAX_VALUE)
        "imageAlpha" -> v.imageAlpha.toString()
        "cropToPadding" -> v.cropToPadding.toString()
        else -> null
    }

    // ---- 写属性 ----

    override fun write(target: Any, name: String, value: Any?): Boolean {
        when {
            target is Bitmap && name == "density" ->
                target.density = if (value == null) Bitmap.DENSITY_NONE else int(value, name)
            // null 是不平铺
            target is BitmapDrawable && name == "tileModeX" ->
                target.tileModeX = value?.let { tileModes.forProperty(name, it) }
            target is BitmapDrawable && name == "tileModeY" ->
                target.tileModeY = value?.let { tileModes.forProperty(name, it) }
            target is BitmapDrawable && name == "isFilterBitmap" -> target.isFilterBitmap = bool(value, name)
            target is AnimatedImageDrawable && name == "repeatCount" ->
                target.repeatCount = if (value is String) repeatCounts.forProperty(name, value) else int(value, name)
            target is ImageView -> return writeImageView(target, name, value)
            else -> return false
        }
        return true
    }

    private fun writeImageView(v: ImageView, name: String, value: Any?): Boolean {
        when (name) {
            "scaleType" -> v.scaleType = scaleTypes.forProperty(name, value)
            "adjustViewBounds" -> v.adjustViewBounds = bool(value, name)
            "maxWidth" -> v.maxWidth = if (value == null) Int.MAX_VALUE else int(value, name)
            "maxHeight" -> v.maxHeight = if (value == null) Int.MAX_VALUE else int(value, name)
            "imageAlpha" -> v.imageAlpha = int(value, name)
            "cropToPadding" -> v.cropToPadding = bool(value, name)
            else -> return false
        }
        return true
    }

    // ---- 方法 ----

    override fun call(target: Any, name: String, args: List<*>, objects: List<Any?>): String? {
        when {
            target is Bitmap && name == "getPixel" ->
                return argb(target.getPixel(int(args.getOrNull(0), name), int(args.getOrNull(1), name)))
            target is Bitmap && name == "hasAlpha" -> return target.hasAlpha().toString()
            target is Bitmap && name == "recycle" -> target.recycle()
            target is BitmapDrawable && name == "setTileModeXY" ->
                target.setTileModeXY(args.getOrNull(0)?.let { tileModes.forArgument("tileModeX", it) },
                                     args.getOrNull(1)?.let { tileModes.forArgument("tileModeY", it) })
            target is AnimatedImageDrawable && name == "start" -> target.start()
            target is AnimatedImageDrawable && name == "stop" -> target.stop()
            target is ImageView && name == "setImageBitmap" -> {
                val o = objects.getOrNull(0)
                if (o != null && o !is Bitmap) throw NacreTypeError("setImageBitmap: argument 1 must be a Bitmap")
                target.setImageBitmap(o as Bitmap?)
            }
            target is ImageView && name == "setImageDrawable" -> {
                val o = objects.getOrNull(0)
                if (o != null && o !is Drawable) throw NacreTypeError("setImageDrawable: argument 1 must be a Drawable")
                target.setImageDrawable(o as Drawable?)
            }
            target is ImageView && name == "setColorFilter" ->
                target.setColorFilter(color(args.getOrNull(0), name),
                                      porterDuffModes.forArgument("mode", args.getOrNull(1)))
            target is ImageView && name == "clearColorFilter" -> target.clearColorFilter()
            else -> return null
        }
        return "null"
    }

    override fun callObject(target: Any, name: String, args: List<*>, objects: List<Any?>): Any? = when {
        // Bitmap 的两个类方法挂在原图上过桥（Java 可能把原图原样还回来，同一个对象要是同一个包装）
        target is Bitmap && name == "createScaledBitmap" -> Bitmap.createScaledBitmap(
            target, int(args.getOrNull(0), name), int(args.getOrNull(1), name), bool(args.getOrNull(2), name))
        target is Bitmap && name == "createBitmap" -> Bitmap.createBitmap(
            target, int(args.getOrNull(0), name), int(args.getOrNull(1), name),
            int(args.getOrNull(2), name), int(args.getOrNull(3), name))
        target is BitmapDrawable && name == "getBitmap" -> target.bitmap
        target is ImageView && name == "getDrawable" -> target.drawable
        else -> NOT_MINE
    }

    // ---- 解码：后台做，Promise 兑现 ----

    override fun callAsync(target: Any, name: String, args: List<*>, objects: List<Any?>, callId: Int): Boolean {
        if (target !is ImageDecoder.Source) return false
        when (name) {
            "decodeHeader" -> decoders.execute { settleFailures(callId) { decodeHeader(target, callId) } }
            "decodeBitmap", "decodeDrawable" -> {
                // 设置在这里（主线程上）先校验完，写错的当场拒，不进后台。异步的调用里抛出去
                // Promise 就悬着了，所以自己拒
                val settings = try {
                    Settings.from(args.getOrNull(0) as? Map<*, *>, this)
                } catch (e: NacreTypeError) {
                    host.settle.reject(callId, "TypeError", e.message ?: "")
                    return true
                }
                decoders.execute {
                    settleFailures(callId) {
                        val listener = ImageDecoder.OnHeaderDecodedListener { decoder, _, _ -> settings.apply(decoder) }
                        val result: Any = if (name == "decodeBitmap") ImageDecoder.decodeBitmap(target, listener)
                                          else ImageDecoder.decodeDrawable(target, listener)
                        host.settle.obj(callId, result)
                    }
                }
            }
            else -> return false
        }
        return true
    }

    // 只读头：拿到 ImageInfo 就扔一个自己的异常中止，像素一个都不解。ImageInfo 出了回调就不能用，
    // 所以当场抄成 JSON
    private class HeaderOnly(val json: String) : RuntimeException()

    private fun decodeHeader(source: ImageDecoder.Source, callId: Int) {
        try {
            ImageDecoder.decodeDrawable(source) { _, info, _ ->
                throw HeaderOnly(JSONObject()
                    .put("width", info.size.width)
                    .put("height", info.size.height)
                    .put("mimeType", info.mimeType)
                    .put("isAnimated", info.isAnimated)
                    .toString())
            }
            throw IllegalStateException("decodeHeader: the header listener was not called")
        } catch (header: HeaderOnly) {
            host.settle.json(callId, header.json)
        }
    }

    private inline fun settleFailures(callId: Int, block: () -> Unit) {
        try {
            block()
        } catch (e: NacreTypeError) {
            host.settle.reject(callId, "TypeError", e.message ?: "")
        } catch (e: Throwable) {
            host.settle.reject(callId, e.javaClass.simpleName, e.message ?: "")
        }
    }

    // 解码时的设置：OnHeaderDecodedListener 里的 set…，JS 那边写成一个对象（JS 不实现 Java 的接口）
    private class Settings(
        val targetSize: IntArray?, val targetSampleSize: Int?, val crop: Rect?, val allocator: Int?,
        val mutableRequired: Boolean?, val unpremultipliedRequired: Boolean?, val memorySizePolicy: Int?,
        val decodeAsAlphaMaskEnabled: Boolean?,
    ) {
        fun apply(d: ImageDecoder) {
            targetSize?.let { d.setTargetSize(it[0], it[1]) }
            targetSampleSize?.let { d.setTargetSampleSize(it) }
            crop?.let { d.crop = it }
            allocator?.let { d.allocator = it }
            mutableRequired?.let { d.isMutableRequired = it }
            unpremultipliedRequired?.let { d.isUnpremultipliedRequired = it }
            memorySizePolicy?.let { d.memorySizePolicy = it }
            decodeAsAlphaMaskEnabled?.let { d.isDecodeAsAlphaMaskEnabled = it }
        }

        companion object {
            fun from(map: Map<*, *>?, domain: ImageDomain): Settings {
                if (map == null) return Settings(null, null, null, null, null, null, null, null)
                fun ints(key: String, n: Int): IntArray? {
                    val v = map[key] ?: return null
                    val list = v as? List<*> ?: throw NacreTypeError("$key must be an object")
                    if (list.size != n) throw NacreTypeError("$key must be an object")
                    return IntArray(n) { domain.int(list[it], key) }
                }
                fun boolOf(key: String) = map[key]?.let { domain.bool(it, key) }
                val crop = ints("crop", 4)?.let { Rect(it[0], it[1], it[2], it[3]) }
                return Settings(
                    targetSize = ints("targetSize", 2),
                    targetSampleSize = map["targetSampleSize"]?.let { domain.int(it, "targetSampleSize") },
                    crop = crop,
                    allocator = map["allocator"]?.let { domain.allocators.forArgument("allocator", it) },
                    mutableRequired = boolOf("mutableRequired"),
                    unpremultipliedRequired = boolOf("unpremultipliedRequired"),
                    memorySizePolicy = map["memorySizePolicy"]?.let {
                        domain.memoryPolicies.forArgument("memorySizePolicy", it)
                    },
                    decodeAsAlphaMaskEnabled = boolOf("decodeAsAlphaMaskEnabled"),
                )
            }
        }
    }

    // ---- 类级的方法 ----

    override fun classCall(className: String, name: String, args: List<*>, objects: List<Any?>): String? =
        if (className == "ImageDecoder" && name == "isMimeTypeSupported") {
            val mime = args.getOrNull(0) as? String ?: throw NacreTypeError("isMimeTypeSupported: expected a string")
            ImageDecoder.isMimeTypeSupported(mime).toString()
        } else {
            null
        }

    // ---- 动图的事件：有人订才装回调 ----

    private class Watch(val callback: Animatable2.AnimationCallback, val types: MutableSet<String>)
    private val watches = IdentityHashMap<AnimatedImageDrawable, Watch>()

    override fun subscribe(target: Any, type: String, on: Boolean): Boolean {
        val d = target as? AnimatedImageDrawable ?: return false
        if (type != "animationstart" && type != "animationend") return false
        if (on) {
            val watch = watches.getOrPut(d) {
                // 回调里拿的是 Drawable 本身，不是编号：包装可能被回收过，派发时再重建
                val callback = object : Animatable2.AnimationCallback() {
                    override fun onAnimationStart(drawable: Drawable) = emit(drawable, "animationstart")
                    override fun onAnimationEnd(drawable: Drawable) = emit(drawable, "animationend")
                }
                d.registerAnimationCallback(callback)
                Watch(callback, HashSet())
            }
            watch.types.add(type)
        } else {
            val watch = watches[d] ?: return true
            watch.types.remove(type)
            if (watch.types.isEmpty()) {
                d.unregisterAnimationCallback(watch.callback)
                watches.remove(d)
            }
        }
        return true
    }

    private fun emit(drawable: Drawable, type: String) {
        val d = drawable as? AnimatedImageDrawable ?: return
        if (watches[d]?.types?.contains(type) == true) host.emitter.plain(d, type)
    }

    companion object {
        // 项目的 assets/ 在包里的位置（和文字组的 Typeface.createFromAsset 一样，见 android/shell/build.gradle.kts）
        const val PROJECT_ASSETS = "app"

        // ARGB_8888 → argb8888，RGBA_F16 → rgbaF16，SRC_ATOP → srcAtop：第一段小写，后面每段首字母大写
        fun camel(name: String): String = name.split('_').mapIndexed { i, part ->
            if (i == 0) part.lowercase() else part.lowercase().replaceFirstChar { it.uppercase() }
        }.joinToString("")
    }
}
