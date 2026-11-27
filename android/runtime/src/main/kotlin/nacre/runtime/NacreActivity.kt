// 交给 JS 的页面的基类。运行时只把它和它的子类交给 JS（建好时发 activitycreate、进
// application.activities）；别的页面（以后第三方 SDK 自己的支付、登录页）不交，JS 改不到它们的内容。
//
// 继承 AndroidX 的 ComponentActivity：权限和选图的结果回调、Android 11、12 上的返回键回调只有
// AndroidX 版（它不带样式，AppCompatActivity 才带）。里面什么都不写：页面做什么全由 JS 决定。
// 以后要给页面预置的覆写点（方向、状态栏这类，见 project.md「覆写点」）放在这里。
package nacre.runtime

import androidx.activity.ComponentActivity

open class NacreActivity : ComponentActivity()
