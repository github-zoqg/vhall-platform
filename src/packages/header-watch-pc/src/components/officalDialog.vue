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
        <img :src="`${officicalInfo.img}?x-oss-process=image/resize,m_fill,w_233,h_233`" alt="" />
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
  import { useRoomBaseServer } from 'middle-domain';
  export default {
    name: 'OfficaialDialog',
    props: {
      officicalInfo: {
        type: Object,
        default: () => {}
      },
      screenPosterInfo: {
        type: Object,
        default: () => {}
      }
    },
    watch: {
      officicalInfo: {
        immediate: true,
        deep: true,
        handler() {
          if (
            this.officicalInfo &&
            this.officicalInfo.alert_type == 0 &&
            this.officicalInfo.status == 0
          ) {
            if (this.screenPosterInfo.status == 1) {
              this.officialVisible = true;
            } else {
              this.roomBaseServer.$on('screenPostClose', () => {
                this.officialVisible = true;
              });
            }
          }
        }
      }
    },
    data() {
      return {
        officialVisible: false
      };
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
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
