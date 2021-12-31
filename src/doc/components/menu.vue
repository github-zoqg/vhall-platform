<template>
  <div class="doc-container">
    <el-menu default-active="1" class="el-menu" @select="handleOpen">
      <el-menu-item v-for="item of options" :key="item.name" :index="item.name">
        <span slot="title">{{ item.name }}</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script>
  import { dynamicLoadPacks } from '../utils/dynamicLoad';

  export default {
    name: 'VhDocMenu',
    data() {
      return {
        options: Object.freeze(dynamicLoadPacks())
      };
    },
    methods: {
      handleOpen(key) {
        if (this.$route.name === key) return;
        this.$router.push({ name: key });
      },
      handleClose(key, keyPath) {
        console.log(key, keyPath);
      }
    }
  };
</script>

<style lang="less" scoped>
  .doc-container {
    display: inline-block;
    width: 16em;
    height: 100vh;
    overflow-y: auto;

    .el-menu {
      height: 100%;
    }
  }
</style>
