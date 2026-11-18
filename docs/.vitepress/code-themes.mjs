// 代码块的两套配色，照 Xcode 默认的浅色和深色主题的色相定：
// 关键字偏紫红、字符串偏红、数字偏蓝、类型偏青、注释是灰的。
// 这里只定前景色，底色由样式表里的 --vp-code-block-bg 管。

function theme(name, type, c) {
  return {
    name,
    type,
    colors: {
      'editor.foreground': c.plain,
      'editor.background': c.bg,
    },
    tokenColors: [
      { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: c.comment } },
      {
        scope: ['keyword', 'storage', 'storage.type', 'storage.modifier', 'keyword.operator.new',
          'keyword.operator.expression', 'keyword.control', 'constant.language', 'variable.language'],
        settings: { foreground: c.keyword },
      },
      { scope: ['keyword.operator', 'punctuation'], settings: { foreground: c.plain } },
      {
        scope: ['string', 'string.quoted', 'string.template', 'punctuation.definition.string'],
        settings: { foreground: c.string },
      },
      { scope: ['string.regexp', 'constant.character.escape'], settings: { foreground: c.string } },
      { scope: ['constant.numeric'], settings: { foreground: c.number } },
      {
        scope: ['entity.name.type', 'entity.name.class', 'support.class', 'support.type',
          'entity.other.inherited-class', 'variable.other.constant.object'],
        settings: { foreground: c.type },
      },
      {
        scope: ['entity.name.function', 'support.function', 'meta.function-call entity.name.function'],
        settings: { foreground: c.func },
      },
      {
        scope: ['variable.other.property', 'support.variable.property', 'meta.object-literal.key',
          'variable.other.object.property'],
        settings: { foreground: c.property },
      },
      { scope: ['variable', 'variable.parameter', 'variable.other'], settings: { foreground: c.plain } },
      // JSON、YAML 的键
      {
        scope: ['support.type.property-name', 'entity.name.tag'],
        settings: { foreground: c.type },
      },
      { scope: ['entity.other.attribute-name'], settings: { foreground: c.func } },
      // Markdown 和 diff
      { scope: ['markup.heading', 'markup.bold'], settings: { foreground: c.keyword } },
      { scope: ['markup.inserted'], settings: { foreground: c.func } },
      { scope: ['markup.deleted'], settings: { foreground: c.string } },
    ],
  };
}

export const codeLight = theme('nacre-light', 'light', {
  bg: '#f5f5f7',
  plain: '#1d1d1f',
  comment: '#707f8c',
  keyword: '#ad3da4',
  string: '#d12f1b',
  number: '#272ad8',
  type: '#3e8087',
  func: '#326d74',
  property: '#1d1d1f',
});

export const codeDark = theme('nacre-dark', 'dark', {
  bg: '#1d1d1f',
  plain: '#f5f5f7',
  comment: '#7f8c98',
  keyword: '#ff7ab2',
  string: '#ff8170',
  number: '#d9c97c',
  type: '#6bdfff',
  func: '#78c2b3',
  property: '#f5f5f7',
});
