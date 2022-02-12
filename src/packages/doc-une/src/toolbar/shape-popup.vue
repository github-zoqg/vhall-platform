<template>
  <vmp-brush-popup>
    <template v-slot:item>
      <div
        v-for="item in itemArr"
        :key="item.value"
        :title="item.label"
        :class="{
          active: shape.kind === item.value
        }"
        @click.stop="handleChange('kind', item.value)"
      >
        <i :class="item.icon" style="font-size: 16px"></i>
      </div>
    </template>
    <template v-slot:color>
      <div
        v-for="color in colorArr"
        class="color-box"
        :key="color.color"
        :title="color.title"
        :class="{
          active: shape.color == color.value
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
    name: 'VmpShapePopup',
    components: {
      VmpBrushPopup
    },
    inject: ['shape', 'changeTool'],
    data() {
      return {
        itemArr: Object.freeze([
          { label: '圆形', value: 'setCircle', icon: 'vh-iconfont vh-line-circle' },
          {
            label: '四边形',
            value: 'setSquare',
            icon: 'vh-iconfont vh-line-square'
          },
          {
            label: '单向箭头',
            value: 'setSingleArrow',
            icon: 'vh-iconfont vh-a-line-singlearrow'
          },
          {
            label: '双向箭头',
            value: 'setDoubleArrow',
            icon: 'vh-iconfont vh-a-line-doublearrow'
          }
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
        this.changeTool('shape', type, value);
      }
    }
  };
</script>
<style lang="less"></style>
