<template>
  <vmp-brush-popup>
    <template v-slot:item>
      <div
        v-for="item in itemArr"
        :key="item.value"
        :title="item.label"
        :class="{
          active: highlighter.size === item.value
        }"
        @click.stop="handleChange('size', item.value)"
      >
        <i
          class="vh-iconfont vh-full-brush-l"
          :style="`font-size:12px;line-height:1;transform:scale(${item.value / 6})`"
        ></i>
      </div>
    </template>
    <template v-slot:color>
      <div
        v-for="color in colorArr"
        class="color-box"
        :key="color.color"
        :title="color.title"
        :class="{
          active: highlighter.color == color.value
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
    name: 'VmpPenPopup',
    components: {
      VmpBrushPopup
    },
    inject: ['highlighter', 'changeTool'],
    data() {
      return {
        itemArr: Object.freeze([
          { label: '4', value: 4 },
          { label: '7', value: 7 },
          { label: '10', value: 10 },
          { label: '13', value: 13 }
        ]),
        colorArr: Object.freeze([
          { value: '#FFFFFF', title: this.$t('color.color_1001') },
          { value: '#9B9B9B', title: this.$t('color.color_1002') },
          { value: '#2E3038', title: this.$t('color.color_1003') },
          { value: '#000000', title: this.$t('color.color_1004') },
          { value: '#FD2C0A', title: this.$t('color.color_1005') },
          { value: '#FF6E00', title: this.$t('color.color_1006') },
          { value: '#FFD400', title: this.$t('color.color_1007') },
          { value: '#98CD47', title: this.$t('color.color_1008') },
          { value: '#01D6D1', title: this.$t('color.color_1009') },
          { value: '#0097F0', title: this.$t('color.color_1010') },
          { value: '#8B6DC2', title: this.$t('color.color_1011') },
          { value: '#FF9B9E', title: this.$t('color.color_1012') }
        ])
      };
    },
    methods: {
      handleChange(type, value) {
        this.changeTool('highlighter', type, value);
      }
    }
  };
</script>
<style lang="less"></style>
