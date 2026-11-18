// 读手写的类型定义（packages/types 和各能力包的 .d.ts），得到「现在 JS 里有什么」。
//
// 类型定义是三份手写的东西里最好读的一份，check-api.sh 保证它和另外两份
// （原生的分发表、内置脚本）符号一致，所以拿它代表手写的结果。
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// TypeScript 是 acceptance 的开发依赖，版本钉在它的 package.json 里
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const ts = createRequire(path.join(REPO, 'acceptance', 'package.json'))('typescript');

const has = (node, kind) => (node.modifiers || []).some((m) => m.kind === kind);
const nameOf = (node) => (node.name && (node.name.text ?? node.name.escapedText)) || null;

/**
 * @param {string[]} files .d.ts 文件
 * @returns {{ classes: Map<string, any>, enums: Map<string, string[]> }}
 */
export function readHandwritten(files) {
  const classes = new Map();
  const enums = new Map();
  const shapes = new Map();   // 接口和对象类型的别名：名字 → 它的键，options 写成引用时用
  const pending = [];
  const interfaces = [];      // 留到最后：和某个类同名的是声明合并，成员要并进那个类

  for (const file of files) {
    const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
    const visit = (statements) => {
      for (const node of statements) {
        if (ts.isModuleDeclaration(node) && node.body && node.body.statements) visit(node.body.statements);
        else if (ts.isClassDeclaration(node)) readClass(node, file);
        else if (ts.isInterfaceDeclaration(node)) {
          shapes.set(nameOf(node), keysOf(node.members));
          interfaces.push(node);
        }
        else if (ts.isTypeAliasDeclaration(node)) readAlias(node);
      }
    };
    visit(source.statements);
  }
  // 往已有的类上加成员在类型里是声明合并：interface UILabel { attributedText: … }。
  // 这些成员是这个类的，不并进来的话「这个类手写了哪些成员」就少算了
  for (const node of interfaces) {
    const entry = classes.get(nameOf(node));
    if (entry) readMembers(node.members, entry);
  }
  for (const [method, ref] of pending) method.options = shapes.get(ref) || [];
  return { classes, enums };

  function keysOf(members) {
    return members.filter((m) => ts.isPropertySignature(m)).map(nameOf).filter(Boolean);
  }

  function readAlias(node) {
    if (ts.isTypeLiteralNode(node.type)) { shapes.set(nameOf(node), keysOf(node.type.members)); return; }
    const parts = ts.isUnionTypeNode(node.type) ? node.type.types : [node.type];
    const values = parts.map((p) => (ts.isLiteralTypeNode(p) && ts.isStringLiteral(p.literal) ? p.literal.text : null));
    if (values.length > 0 && values.every((v) => v !== null)) enums.set(nameOf(node), values);
  }

  function readMembers(list, entry) {
    const setters = new Set();
    for (const member of list) {
      const name = nameOf(member);
      const isStatic = has(member, ts.SyntaxKind.StaticKeyword);
      if (ts.isConstructorDeclaration(member)) entry.hasConstructor = true;
      else if (ts.isPropertyDeclaration(member) || ts.isPropertySignature(member)) {
        entry.properties.set(name, { readonly: has(member, ts.SyntaxKind.ReadonlyKeyword), static: isStatic });
      } else if (ts.isGetAccessorDeclaration(member)) {
        if (!entry.properties.has(name)) entry.properties.set(name, { readonly: true, static: isStatic });
      } else if (ts.isSetAccessorDeclaration(member)) setters.add(name);
      else if (ts.isMethodDeclaration(member) || ts.isMethodSignature(member)) {
        // 同名的几个签名（重载）并成一个：options 的键取并集
        const method = entry.methods.get(name) || { static: isStatic, options: [] };
        const last = member.parameters[member.parameters.length - 1];
        if (last && last.type && ts.isTypeLiteralNode(last.type)) {
          for (const key of keysOf(last.type.members)) if (!method.options.includes(key)) method.options.push(key);
        } else if (last && last.type && ts.isTypeReferenceNode(last.type) && /options/i.test(nameOf(last) || '')) {
          pending.push([method, last.type.typeName.getText()]);
        }
        entry.methods.set(name, method);
      }
    }
    for (const name of setters) if (entry.properties.has(name)) entry.properties.get(name).readonly = false;
  }

  function readClass(node, file) {
    const heritage = (node.heritageClauses || []).find((h) => h.token === ts.SyntaxKind.ExtendsKeyword);
    const entry = { name: nameOf(node), file: path.basename(file),
                    super: heritage ? heritage.types[0].expression.getText() : null,
                    properties: new Map(), methods: new Map(), hasConstructor: false };
    readMembers(node.members, entry);
    classes.set(entry.name, entry);
  }
}
