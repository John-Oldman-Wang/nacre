// 验收用：模块脚本能执行、能 import 同目录的另一个模块
import { answer } from './lib.mjs';
window.moduleAnswer = answer;
