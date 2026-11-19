# Handling errors in one place

This guide covers how to catch, in one place, every uncaught exception and unhandled Promise rejection in the app. It uses two events on [`application`](../api/application.md): [`error`](../api/application/error-event.md) and [`unhandledrejection`](../api/application/unhandledrejection-event.md).

## Recommended approach

- **Put the listeners for both events at the very top of `main.js`, and hand both to the same function.** They go at the very top because they can't receive exceptions thrown by top-level code that comes before them.
- **No need to wrap callbacks.** Exceptions thrown in event listeners also fire `error`, so errors in the `sceneconnect` callback or a tap callback reach this function too.
- **Whether to call `preventDefault()` depends on whether your own handling replaces the default log.** `preventDefault()` cancels only the default log line the runtime prints. The exception has already happened, and the interrupted code doesn't resume.

An uncaught exception doesn't make the app exit: the piece of code that threw stops running, and everything else keeps running as usual; see [Unhandled exceptions don't make the app exit](../api/application.md#unhandled-exceptions-dont-terminate-the-app).

## The first error handler

```js
/** @param {unknown} reason */
function report(reason) {
  console.error('something went wrong', String(reason));
}

application.addEventListener('error', (e) => {
  report(e.error);
  e.preventDefault();
});
application.addEventListener('unhandledrejection', (e) => {
  report(e.reason);
  e.preventDefault();
});

application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();
  throw new Error('failed while building the interface');
});
```

**Effect**

- The screen shows a blank view controller. The code before `throw` has already run, so the window is shown as usual.
- The console prints `something went wrong Error: failed while building the interface`. Because `preventDefault()` was called, there is no default log line starting with `Uncaught`.
- The app keeps running.

Verified in the acceptance tests: after a listener throws, the `error` event is received once, `e.error` is exactly the thrown object, and the other listeners for the same event run as usual. This code has not been run as a whole in the simulator.

> **Note:** When an `error` listener itself throws, the runtime doesn't fire `error` again for it; it only prints the default log to the console.

## Seeing where the error happened

```js
application.addEventListener('error', (e) => {
  console.log('error location', e.filename, e.lineno);
  console.log('is it an Error object', e.error instanceof Error);
  e.preventDefault();
});

throw new Error('an exception nobody catches');
```

**Effect**

- The console prints `error location main.js` followed by the line number of the `throw`.
- The console prints `is it an Error object true`.
- Because `preventDefault()` was called, the runtime no longer prints the default error log. Without it, the runtime prints a log at the `console.error` level starting with `Uncaught`.

[`filename`](../api/error-event/filename.md) and [`lineno`](../api/error-event/lineno.md) point to the bundled `main.js`, not the source files before bundling. To find the failing code, open the bundle output and look at that line.

> **Note:** An exception thrown at the top level of the script stops the rest of `main.js`'s top-level code from running. The `error` event is only a notification and doesn't resume execution. Listeners already registered remain in effect.

## Catching unhandled Promise rejections

```js
application.addEventListener('unhandledrejection', (e) => {
  console.log('unhandled rejection', String(e.reason));
  e.preventDefault();
});

Promise.reject(new Error('a rejection nobody handles'));
```

**Effect**

- The console prints `unhandled rejection Error: a rejection nobody handles`.
- Because `preventDefault()` was called, the runtime no longer prints the default log. Without it, the runtime prints an error-level log starting with `Uncaught (in promise)`, followed by the rejection reason.

Exceptions thrown in an `async` function that nobody `await`s also end up here. A Promise that gets a handler attached shortly after being rejected isn't reported: the runtime schedules the report at the end of the task queue, so attaching a handler with `setTimeout(fn, 0)` after the rejection is still in time.

## See also

- [`error`](../api/application/error-event.md), [`ErrorEvent`](../api/error-event.md)
- [`unhandledrejection`](../api/application/unhandledrejection-event.md), [`PromiseRejectionEvent`](../api/promise-rejection-event.md)
- [Timers](../api/timers.md): the timing of `unhandledrejection` reports is related to them
