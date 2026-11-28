// 动图在一处的样子：画的是解出来的那一个 AnimatedImageDrawable。图片组用（ImageDomain.kt）。
//
// 外观组的 Drawable 每用在一个视图上就按状态建一个原生对象（「一处」）。动图不行：它是解码时
// 原生先有的，带着解码器和播放进度，按状态建不出第二个。所以动图只有一个原生对象，每一处是
// 这里的一个薄 Drawable，画的都是它：几个视图显示的是同一帧，一起播。
//
// - 动图自己的边界固定成它的固有大小，每一处在 draw 里用画布的变换缩放到自己的边界：
//   动图的边界只有一个，几个大小不同的视图不能各设各的。
// - 透明度和着色是每一处自己的（ImageView 的 imageAlpha、colorFilter 设到这一处上），
//   用的时候套一层：动图的透明度、着色只有一份，几处共用。
// - 动图的 Drawable.Callback 只有一个（弱引用），换成一个转发器：动图要重画时，让每一处都重画。
//   Android 9 起硬件加速的画布上动图由渲染线程播，之后的帧不用再通知视图。
package nacre.runtime

import android.graphics.Canvas
import android.graphics.ColorFilter
import android.graphics.Paint
import android.graphics.PixelFormat
import android.graphics.drawable.AnimatedImageDrawable
import android.graphics.drawable.Drawable
import android.os.Handler
import android.os.Looper
import java.lang.ref.WeakReference
import java.util.WeakHashMap

internal class AnimatedImagePlace(val image: AnimatedImageDrawable) : Drawable() {

    private var placeAlpha = 255
    private var placeFilter: ColorFilter? = null
    private val layerPaint = Paint()

    init {
        // 固有大小的边界只设一次就行（每一处设的都一样）
        val w = image.intrinsicWidth
        val h = image.intrinsicHeight
        if (image.bounds.width() != w || image.bounds.height() != h) image.setBounds(0, 0, w, h)
        Forwarder.of(image).add(this)
    }

    override fun draw(canvas: Canvas) {
        val b = bounds
        val w = image.intrinsicWidth
        val h = image.intrinsicHeight
        if (b.isEmpty || w <= 0 || h <= 0 || placeAlpha == 0) return
        val count = if (placeAlpha < 255 || placeFilter != null) {
            layerPaint.alpha = placeAlpha
            layerPaint.colorFilter = placeFilter
            canvas.saveLayer(b.left.toFloat(), b.top.toFloat(), b.right.toFloat(), b.bottom.toFloat(), layerPaint)
        } else {
            canvas.save()
        }
        canvas.translate(b.left.toFloat(), b.top.toFloat())
        canvas.scale(b.width().toFloat() / w, b.height().toFloat() / h)
        image.draw(canvas)
        canvas.restoreToCount(count)
    }

    override fun getIntrinsicWidth(): Int = image.intrinsicWidth
    override fun getIntrinsicHeight(): Int = image.intrinsicHeight

    override fun setAlpha(alpha: Int) {
        if (alpha == placeAlpha) return
        placeAlpha = alpha
        invalidateSelf()
    }

    override fun getAlpha(): Int = placeAlpha

    override fun setColorFilter(colorFilter: ColorFilter?) {
        placeFilter = colorFilter
        invalidateSelf()
    }

    override fun getColorFilter(): ColorFilter? = placeFilter

    @Deprecated("Deprecated in Java")
    override fun getOpacity(): Int = PixelFormat.TRANSLUCENT

    // 动图的回调：一个动图一个，转给它现在的每一处。动图只弱引用着回调，所以这张表强引用着它；
    // 转发器只弱引用着每一处，视图放掉那一处它就没了
    private class Forwarder : Callback {
        private val places = ArrayList<WeakReference<AnimatedImagePlace>>()
        private val handler = Handler(Looper.getMainLooper())

        fun add(place: AnimatedImagePlace) {
            places.removeAll { it.get() == null }
            places.add(WeakReference(place))
        }

        override fun invalidateDrawable(who: Drawable) {
            for (ref in places.toList()) ref.get()?.invalidateSelf()
        }

        // 软件绘制时动图自己排下一帧（硬件加速时由渲染线程播，不走这里）
        override fun scheduleDrawable(who: Drawable, what: Runnable, `when`: Long) {
            handler.postAtTime(what, who, `when`)
        }

        override fun unscheduleDrawable(who: Drawable, what: Runnable) {
            handler.removeCallbacks(what, who)
        }

        companion object {
            private val forwarders = WeakHashMap<AnimatedImageDrawable, Forwarder>()

            fun of(image: AnimatedImageDrawable): Forwarder = forwarders.getOrPut(image) {
                Forwarder().also { image.callback = it }
            }
        }
    }
}
