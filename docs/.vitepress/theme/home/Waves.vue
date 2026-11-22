<script setup>
// 一层层慢慢往左漂的细线，像珍珠层的纹理。路径宽两倍，平移一半正好接上
const props = defineProps({ count: { type: Number, default: 7 }, top: { type: Number, default: 300 }, gap: { type: Number, default: 22 } });
const paths = Array.from({ length: props.count }, (_, i) => {
  const y = props.top + i * props.gap;
  const amp = 26 + i * 6;
  let d = `M 0 ${y}`;
  for (let x = 0; x <= 2880; x += 240) d += ` Q ${x + 120} ${y + ((x / 240) % 2 ? amp : -amp)} ${x + 240} ${y}`;
  return { d, opacity: 0.16 + i * 0.05, dur: `${38 + i * 7}s` };
});
</script>

<template>
  <svg class="nh-waves" viewBox="0 0 1440 520" preserveAspectRatio="none" aria-hidden="true">
    <path v-for="(p, i) in paths" :key="i" :d="p.d" fill="none" stroke="url(#nh-wave-stroke)" stroke-width="1.2" :opacity="p.opacity" :style="{ animationDuration: p.dur }" />
  </svg>
</template>

<style scoped>
.nh-waves { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; }
path { animation: nh-drift linear infinite; }
@keyframes nh-drift { to { transform: translateX(-50%); } }
@media (prefers-reduced-motion: reduce) { path { animation: none; } }
</style>
