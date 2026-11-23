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

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation(project(":runtime"))
}
