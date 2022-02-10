<template>
  <section class="vmp-custom-menu-promote-list" v-loading="loading">
    <a
      v-for="item of promoteList"
      target="_blank"
      :key="item.id"
      :href="item.link"
      class="promote-item"
    >
      <div class="cover-img" :style="{ backgroundImage: activityImg(item) }"></div>
      <div class="tip-info">
        <div class="tip-title">{{ item.title }}</div>
        <div class="tip-time">{{ item.created_at }}</div>
      </div>
    </a>
  </section>
</template>

<script>
  // TODO: isWebp
  import { mockPromote } from '../mock.js';

  export default {
    name: 'component-promote',
    data() {
      return {
        loading: false,
        promoteList: []
      };
    },
    created() {
      this.getPromoteList();
    },
    methods: {
      getPromoteList() {
        this.promoteList = [...mockPromote];
      },
      activityImg(item) {
        return `url(${item.img_url})`;
      }
    }
  };
</script>

<style lang="less">
  .vmp-custom-menu-promote-list {
    box-sizing: border-box;
    padding: 20px 16px;
    overflow: auto;
    color: #fff;
    .promote-item {
      display: block;
      width: 100%;
      margin-bottom: 24px;
      font-size: 0;
      .cover-img {
        display: inline-block;
        width: 140px;
        height: 80px;
        font-size: 12px;
        border-radius: 4px;
        vertical-align: top;
        // border: solid 1px ;
      }
      .tip-info {
        display: inline-block;
        width: calc(100% - 168px);
        margin-top: 0;
        padding-left: 10px;
        font-size: 14px;
        vertical-align: top;
        .tip-title {
          color: #fff;
          overflow-wrap: break-word;
          max-height: 66px;
          line-height: 22px;
          display: block;
        }
        .tip-time {
          display: block;
          margin-top: 10px;
          color: #888;
        }
      }
    }
  }
</style>
