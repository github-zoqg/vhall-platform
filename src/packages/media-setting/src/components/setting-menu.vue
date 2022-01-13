<template>
  <ul class="vmp-media-setting-menu">
    <li
      class="vmp-media-setting-menu__item"
      :class="{ 'vmp-media-setting-menu__item--active': selectedItem === item.id }"
      v-for="item of menuList"
      :key="item.id"
      @click="onClickItem(item)"
    >
      {{ item.text }}
    </li>
  </ul>
</template>

<script>
  import { getOptionEntity } from '../js/getOptionEntity';

  export default {
    props: {
      selectedItem: {
        type: String,
        default: 'basic-setting'
      }
    },
    data() {
      return {
        menuList: getOptionEntity()
      };
    },
    methods: {
      onClickItem(item) {
        this.$emit('change', item.id);
      }
    }
  };
</script>

<style lang="less">
  .vmp-media-setting-menu {
    display: flex;
    flex-direction: column;

    .vmp-media-setting-menu__item {
      cursor: pointer;
      box-sizing: border-box;
      height: 40px;
      display: flex;
      align-items: center;

      &:hover {
        color: #fb3a32;
      }

      &--active {
        color: #fb3a32;
        background: #f7f7f7;
      }
    }
  }
</style>
