// 后台任务：切到后台之后向系统多要一段时间，把手上的事做完。

/** `runBackgroundTask` 的选项。 */
interface RunBackgroundTaskOptions {
  /** 任务的名字，调试时在系统的日志里看得到。 */
  name?: string;
}

interface Application {
  /**
   * 运行 `work`，这期间 App 切到后台也不会马上被挂起：系统多给一段时间（大约
   * 30 秒，由系统决定）。`work` 返回的 Promise 落定，任务就结束。
   *
   * 系统快到时间时，`work` 拿到的 `signal` 被中止（`reason` 是名字为
   * `'TimeoutError'` 的错误），运行时当场结束任务，不再等 `work`。系统一开始
   * 就不给时间（已经快被挂起了）时，`work` 照样运行，`signal` 一开始就是中止的。
   *
   * 返回 `work` 的结果。`work` 抛错或者拒绝，返回的 Promise 以同一个错误拒绝。
   * `work` 不是函数时以 `TypeError` 拒绝。
   */
  runBackgroundTask<T>(
    work: (signal: AbortSignal) => T | PromiseLike<T>,
    options?: RunBackgroundTaskOptions | null,
  ): Promise<T>;
  /** 在后台还能运行多少秒。在前台时是 `Infinity`。 */
  readonly backgroundTimeRemaining: number;
}
