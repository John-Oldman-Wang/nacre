// Android 的运行时工程。runtime 是运行时本身（以后打成交付的库），
// shell 是开发用的最小壳：以后有了 CLI，它挪进 CLI 的模板。
pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "nacre-android"
include(":runtime", ":shell")
