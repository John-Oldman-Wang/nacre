// 壳的页面。继承 NacreActivity，运行时才把它交给 JS（activitycreate）；里面什么都不写，
// 页面上放什么全由 JS 在 activitycreate 里决定。
package nacre.shell

import nacre.runtime.NacreActivity

class MainActivity : NacreActivity()
