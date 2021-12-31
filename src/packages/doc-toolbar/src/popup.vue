<template>
  <div class="vmp-pencil-popup">
    <div class="list-container">
      <div class="item-list">
        <div
          v-for="item in itemArr"
          :key="item"
          :title="item.label"
          :class="{
            active: itemValue === item.value
          }"
          @click.stop="handleItem(item.value)"
        >
          <!-- 画笔和荧光笔 -->
          <i
            v-if="itemType === 'pen'"
            class="iconfont iconhuabichicun"
            :style="`font-size:12px;transform:scale(${item.value / 12})`"
          ></i>
          <!-- 形状 -->
          <i v-if="itemType === 'shape'" :class="item.icon" style="font-size: 16px"></i>
          <!-- 文字 -->
          <i v-if="itemType === 'text'" :style="`font-size:${item.showSize}px;font-style:normal`">
            {{ item.label }}
          </i>
        </div>
      </div>
      <div class="color-list">
        <div
          v-for="color in colorArr"
          class="color-box"
          :key="color.color"
          :title="color.title"
          :class="{
            active: colorValue == color.value
          }"
          @click.stop="handleColor(color.value)"
        >
          <div class="color-block" :style="`background-color:${color.value}`"></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'VmpPencilPopup',
    props: {
      // 初始值
      dval: {
        type: Number || String,
        default: () => {
          return '';
        }
      },
      // 某项类型
      itemType: {
        type: String,
        default: () => {
          return 'pen';
        }
      },
      // 某项可选数组
      itemArr: {
        type: Array,
        default: () => {
          return [];
        }
      },
      // 颜色可选数组
      colorArr: {
        type: Array,
        default: () => {
          return [];
        }
      }
    },
    data() {
      return {
        itemValue: this.dval,
        colorValue: '#FD2C0A'
      };
    },

    methods: {
      // 选择某项
      handleItem(val) {
        this.itemValue = val;
      },
      // 选择颜色
      handleColor(val) {
        this.colorValue = val;
      }
    }
  };
</script>
<style lang="less">
  .vmp-pencil-popup {
    display: none;
    position: absolute;
    top: 36px;
    left: 0;
    padding-top: 4px;

    .list-container {
      width: 129px;
      background: rgba(0, 0, 0, 0.59);
      border-radius: 4px;
      opacity: 0.8;
      .item-list {
        width: 100%;
        border-bottom: 1px solid rgba(67, 67, 67, 1);
        height: 41px;
        display: flex;
        justify-content: space-around;
        align-items: center;
        & > div {
          height: 24px;
          width: 24px;
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
          border-radius: 1px;
          &:hover {
            background: #434343;
          }
          &:active,
          &.active {
            background: #333333;
          }
        }
      }
      .color-list {
        width: 100%;
        display: flex;
        justify-content: space-around;
        flex-wrap: wrap;
        .color-box {
          height: 20px;
          width: 20px;
          border-radius: 1px;
          display: flex;
          justify-content: center;
          align-items: center;
          box-sizing: border-box;
          margin: 6px;
          .color-block {
            height: 16px;
            width: 16px;
          }
          &:hover {
            border: 1px solid #e6d2d2;
          }
          &:active {
            border: 1px solid #b6aeae;
          }
          &.active {
            border: 1px solid #ffffff;
          }
        }
      }
    }
  }
</style>
