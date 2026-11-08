// iOS 原生符号。规则见 types/ios.d.ts 的说明。
//
// 结构体。读出来是只读的 JS 对象，写入时给普通对象也行。

// ---------------------------------------------------------------------------
// 结构体
// ---------------------------------------------------------------------------
//
// 字段**只读**：ObjC 里 view.frame.x = 10 是编译错误（改的是返回的临时副本），
// 用可写对象表示会让它变成静默无效。这里写入直接抛 TypeError。
//
// 要改就整体赋一个新的：view.frame = new CGRect(0, 0, 100, 50)

declare class CGPoint {
  constructor(x: number, y: number);
  readonly x: number;
  readonly y: number;
}

declare class CGSize {
  constructor(width: number, height: number);
  readonly width: number;
  readonly height: number;
}

declare class CGRect {
  constructor(x: number, y: number, width: number, height: number);
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  /** 嵌套访问，和 ObjC 的 {CGPoint origin; CGSize size;} 对得上。 */
  readonly origin: CGPoint;
  readonly size: CGSize;
}

declare class UIEdgeInsets {
  constructor(top: number, left: number, bottom: number, right: number);
  readonly top: number;
  readonly left: number;
  readonly bottom: number;
  readonly right: number;
}

// 写入宽、读出窄：赋值时给个普通对象也行（字段齐就认，少一个会抛），
// 读出来永远是结构体类。所以 setter 收 Like、getter 给类本身。
type CGPointLike = CGPoint | { x: number; y: number };
type CGSizeLike = CGSize | { width: number; height: number };
type CGRectLike =
  | CGRect
  | { x: number; y: number; width: number; height: number };
type UIEdgeInsetsLike =
  | UIEdgeInsets
  | { top: number; left: number; bottom: number; right: number };
