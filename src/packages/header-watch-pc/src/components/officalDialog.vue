<template>
  <div class="officaial-dialog" v-if="officialVisible">
    <div class="officaial-dialog_wrapper">
      <div class="officaial_title">
        <p>{{ $t('nav.nav_1002') }}</p>
        <i class="vh-iconfont vh-line-close" @click="officialVisible = false"></i>
      </div>
      <div class="officaial_dialog">
        <div class="officaial_dialog_img">
          <img :src="`${officicalInfo.img}?x-oss-process=image/resize,m_fill,w_233,h_233`" alt="" />
        </div>
      </div>
      <p class="officaial_introduce">
        {{ $t('nav.nav_1019') }}
        <br />
        {{ $t('nav.nav_1012') }}
      </p>
    </div>
  </div>
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
            this.officialVisible = true;
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
    position: fixed;
    top: 0;
    right: 0;
    margin: 0;
    width: 100%;
    z-index: 45;
    &_wrapper {
      width: 320px;
      background: #fff;
      border-radius: 4px;
      margin: 15vh auto 0;
      .officaial_title {
        padding: 24px 32px;
        display: flex;
        justify-content: space-between;
        p {
          font-size: 20px;
          font-weight: 500;
          color: #1a1a1a;
          line-height: 28px;
        }
        i {
          margin-top: 10px;
          font-size: 14px;
          color: #666;
          cursor: pointer;
        }
      }
      .officaial_dialog {
        padding-bottom: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        &_img {
          width: 132px;
          height: 132px;
          img {
            width: 100%;
            height: 100%;
            object-fit: scale-down;
          }
        }
      }
      .officaial_introduce {
        font-size: 14px;
        font-weight: 400;
        color: @font-light-low;
        line-height: 20px;
        text-align: center;
        word-break: break-word;
        padding-bottom: 24px;
      }
    }
  }
</style>
