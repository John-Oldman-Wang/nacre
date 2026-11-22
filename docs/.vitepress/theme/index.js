// 在默认主题上改样式：颜色、字体、圆角。文档页的结构和组件都没动；
// 首页是自己的组件 NacreHome，中英两份 index.md 都只放它
import DefaultTheme from 'vitepress/theme';
import NacreHome from './home/NacreHome.vue';
import './custom.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('NacreHome', NacreHome);
  },
};
