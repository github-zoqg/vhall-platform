<template>
  <div class="vmp-officaial">
    <div class="vmp-officaial-icon" :style="{ color: themeClass.pageBg }" @click="openOfficial">
      <i class="iconfont iconguankanbuju"></i>
      <p>公众号</p>
    </div>
    <el-dialog
      title="公众号"
      :visible.sync="officialVisible"
      :close-on-click-modal="true"
      :modal-append-to-body="true"
      width="320px"
    >
      <div class="vmp-officaial-wrap">
        <div class="vmp-officaial-wrap-img">
          <img :src="`${officialImg}?x-oss-process=image/resize,m_fill,w_233,h_233`" alt="" />
        </div>
      </div>
      <p class="vmp-officaial-introduce">
        使用微信“扫一扫”
        <br />
        关注公众号
      </p>
    </el-dialog>
  </div>
</template>
<script>
  export default {
    name: 'VmpOfficial',
    data() {
      return {
        themeClass: {
          pageBg: '#3562fa'
        },
        officialImg:
          '//t-alistatic01.e.vhall.com/upload/interacts/wechat-official-imgs/d0/e7/d0e737b7c30eced4bc498a93e647eae6.jpg',
        officialVisible: false
      };
    },
    methods: {
      openOfficial() {
        this.officialVisible = true;
      }
    }
  };
</script>
<style lang="less">
  .vmp-officaial {
    padding-right: 24px;
    &-icon {
      text-align: center;
      cursor: pointer;
      i {
        font-size: 16px;
      }
      p {
        font-size: 14px;
        line-height: 14px;
        padding-top: 5px;
      }
      &:hover {
        i,
        p {
          cursor: pointer;
          color: @font-high-light-normal !important;
        }
      }
    }
    &-wrap {
      padding-bottom: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      &-img {
        width: 132px;
        height: 132px;
        img {
          width: 100%;
          height: 100%;
          object-fit: scale-down;
        }
      }
    }
    &-introduce {
      font-size: 14px;
      font-weight: 400;
      color: @font-light-low;
      line-height: 20px;
      text-align: center;
      word-break: break-word;
    }
  }
</style>
