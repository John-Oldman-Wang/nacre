# `@nacrejs/cli`

The command-line tool for [Nacre](https://john-oldman-wang.github.io/nacre/), a JavaScript runtime for iOS apps. The command is `nacre`, and it has one subcommand: generate a Nacre project's `ios/` folder.

[Documentation](https://john-oldman-wang.github.io/nacre/) · [中文文档](https://john-oldman-wang.github.io/nacre/zh/)

## Install

The command takes everything it puts into `ios/` from [`@nacrejs/ios`](https://www.npmjs.com/package/@nacrejs/ios), so the project installs both:

```bash
npm install -D @nacrejs/ios @nacrejs/cli @nacrejs/types
```

## Usage

```bash
npx nacre generate .
```

**Effect**: the project gets a new (or fully rebuilt) `ios/` folder with the launch shell, the runtime, the capability packages the project installed, the app icon, the launch screen, and an XcodeGen project description, `project.yml`.

`ios/` is generated: keep it out of version control and don't edit files inside it. Delete and regenerate it at any time.

After generating, two more steps: bundle your JS into `ios/JS/main.js`, then run `xcodegen generate` inside `ios/`. [Building your own app](https://john-oldman-wang.github.io/nacre/guides/your-own-app) puts the three steps into one `npm run ios` script.

```
nacre generate <project-dir> [--runtime=framework|source] [--runtime-path=<dir>]
```

| Option | Meaning |
| --- | --- |
| `--runtime=framework` | The default. The project uses the compiled `Nacre.xcframework` from `@nacrejs/ios` |
| `--runtime=source` | The project builds the runtime from its source tree. Only for working on Nacre itself |
| `--runtime-path=<dir>` | Where the runtime's source tree is, for `--runtime=source` |

The project's settings (name, bundle ID, languages, orientations, usage descriptions, app icon, launch screen) are in `nacre.config.json`. See [Configuring the app](https://john-oldman-wang.github.io/nacre/guides/project-config).

## Capability packages

Capability packages such as `@nacrejs/core-location` are added to the generated project when they are in the project's own `dependencies` or `devDependencies`. There is nothing else to declare. See [Core and capability packages](https://john-oldman-wang.github.io/nacre/api/capabilities).

## Errors

Errors start with `nacre:`. **When there is an error, the command stops before changing any file.**

| Situation | Error |
| --- | --- |
| `@nacrejs/ios` isn't installed in the project | `@nacrejs/ios is not installed in <project-dir>. … Run: npm install @nacrejs/ios` |
| `@nacrejs/ios` and `@nacrejs/cli` are versions that don't match | `the installed @nacrejs/ios uses manifest version …, but this @nacrejs/cli reads manifest version 1. Update @nacrejs/cli and @nacrejs/ios so that they match` |
| A package is missing its compiled framework | `<package>: <file> is missing from <dir>. The package is incomplete; reinstall it` |
| A dependency is listed in `package.json` but not installed | `dependency <package> is not installed. Run npm install in the project first` |
| A mistake in `nacre.config.json` | See [Errors for invalid configuration](https://john-oldman-wang.github.io/nacre/guides/project-config#errors-for-invalid-configuration) |

## License

FSL-1.1-MIT, see `LICENSE.md`.
