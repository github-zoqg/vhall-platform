<template>
  <vmp-brush-popup>
    <template v-slot:item>
      <div
        v-for="item in itemArr"
        :key="item.value"
        :title="item.label"
        :class="{
          active: text.size === item.value
        }"
        @click.stop="handleChange('size', item.value)"
      >
        <i :style="`font-size:${item.showSize}px;font-style:normal`">
          {{ item.label }}
        </i>
      </div>
    </template>
    <template v-slot:color>
      <div
        v-for="color in colorArr"
        class="color-box"
        :key="color.color"
        :title="color.title"
        :class="{
          active: text.color == color.value
        }"
        @click.stop="handleChange('color', color.value)"
      >
        <div class="color-block" :style="`background-color:${color.value}`"></div>
      </div>
    </template>
  </vmp-brush-popup>
</template>
<script>
  import VmpBrushPopup from './popup.vue';
  export default {
    name: 'VmpTextPopup',
    components: {
      VmpBrushPopup
    },
    inject: ['text', 'changeTool'],
    data() {
      return {
        itemArr: Object.freeze([
          { label: '小', value: 14, showSize: '12' },
          { label: '中', value: 18, showSize: '16' },
          { label: '大', value: 30, showSize: '18' },
          { label: '超', value: 48, showSize: '20' }
        ]),
        colorArr: Object.freeze([
          { value: '#FFFFFF', title: '白色' },
          { value: '#9B9B9B', title: '浅灰' },
          { value: '#2E3038', title: '深灰' },
          { value: '#000000', title: '黑色' },
          { value: '#FD2C0A', title: '红色' },
          { value: '#FF6E00', title: '橙色' },
          { value: '#FFD400', title: '黄色' },
          { value: '#98CD47', title: '绿色' },
          { value: '#01D6D1', title: '青色' },
          { value: '#0097F0', title: '蓝色' },
          { value: '#8B6DC2', title: '紫色' },
          { value: '#FF9B9E', title: '粉色' }
        ])
      };
    },
    methods: {
      handleChange(type, value) {
        this.changeTool('text', type, value);
      }
    }
  };
</script>
<style lang="less"></style>
