// 网页的自定义协议：session.protocol。

/**
 * 一个分区的自定义协议。从 `session.defaultSession.protocol` 或者
 * `webContents.session.protocol` 拿，不能自己建。每次读是同一个对象。
 *
 * 只对之后新建的网页起作用：网页建好之后，它认哪些协议就定了。
 */
declare class Protocol {
  private constructor();
  /**
   * 之后新建的、用这个分区的网页里，`scheme://任意主机/路径` 从 `directory`
   * 里取文件。主机名不参与找文件，但决定网页的来源（`app://local/a.html` 的
   * 来源是 `app://local`）。同一个协议再调一次就换成新的目录。
   *
   * `directory` 相对路径相对 App 包，绝对路径原样用。
   *
   * 协议名不合法（要小写字母开头，只有小写字母、数字、`+`、`-`、`.`）、是
   * WebKit 自己处理的协议（`http`、`https`、`file` 这类）、目录不存在或者不是
   * 目录，都抛 `TypeError`。
   */
  serveDirectory(scheme: string, directory: string): void;
  /** 去掉。之后新建的网页不再认这个协议。没注册过就什么都不做。 */
  unhandle(scheme: string): void;
  /** 这个协议现在有没有注册。 */
  isProtocolHandled(scheme: string): boolean;
}

interface Session {
  /** 这个分区的自定义协议。每次读是同一个对象。 */
  readonly protocol: Protocol;
}
