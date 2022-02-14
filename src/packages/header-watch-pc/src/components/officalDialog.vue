<template>
  <el-dialog
    :title="$t('nav.nav_1002')"
    :visible.sync="officialVisible"
    :close-on-click-modal="true"
    :modal-append-to-body="true"
    class="officaial-dialog"
    width="320px"
  >
    <div class="officaial-dialog-wrap">
      <div class="officaial-dialog-wrap-img">
        <img :src="`${officialImg}?x-oss-process=image/resize,m_fill,w_233,h_233`" alt="" />
      </div>
    </div>
    <p class="officaial-dialog-introduce">
      {{ $t('nav.nav_1019') }}
      <br />
      {{ $t('nav.nav_1012') }}
    </p>
  </el-dialog>
</template>
<script>
  export default {
    name: 'OfficaialDialog',
    props: {
      officialImg: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        officialVisible: false
      };
    }
  };
</script>
<style lang="less">
  .officaial-dialog {
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
