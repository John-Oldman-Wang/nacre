plugins {
    id("com.android.application")
}

android {
    namespace = "nacre.shell"
    compileSdk = 37
    // 打包时用 NDK 里的工具去掉 .so 的调试符号，版本要和 runtime 的一致
    ndkVersion = "29.0.14206865"

    defaultConfig {
        // 和 iOS 的验收 App 一样，用不带任何标识的包名
        applicationId = "com.test.test"
        minSdk = 30
        targetSdk = 37
        versionCode = 1
        versionName = "0.0.0"
        ndk {
            abiFilters += "arm64-v8a"
        }
    }

    buildTypes {
        release {
            // 开发用的壳，Release 也用调试证书签，装到手机上就能跑
            signingConfig = signingConfigs.getByName("debug")
            isMinifyEnabled = false
        }
    }

    sourceSets {
        getByName("main") {
            assets.directories += layout.buildDirectory.dir("generated/nacre-assets").get().asFile.path
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation(project(":runtime"))
}

// 壳执行的 main.js。默认是 src/main/js/main.js（只验 console 进 logcat），
// 验收时 scripts/run-device.sh 用 -PnacreMainJs=<路径> 换成验收套件打出来的那个
val mainJs = providers.gradleProperty("nacreMainJs")
    .map { file(it) }
    .orElse(provider { file("src/main/js/main.js") })

val copyMainJs by tasks.registering(Copy::class) {
    from(mainJs) { rename { "main.js" } }
    into(layout.buildDirectory.dir("generated/nacre-assets"))
    inputs.property("mainJsPath", mainJs.map { it.absolutePath })
}

tasks.named("preBuild") { dependsOn(copyMainJs) }
