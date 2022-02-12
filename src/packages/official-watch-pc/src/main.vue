<template>
  <div class="vmp-officaial">
    <el-dialog
      :title="$t('nav.nav_1002')"
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
        {{ $t('nav.nav_1019') }}
        <br />
        {{ $t('nav.nav_1012') }}
      </p>
    </el-dialog>
  </div>
</template>
<script>
  export default {
    name: 'VmpOfficial',
    data() {
      return {
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
