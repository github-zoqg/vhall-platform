<template>
  <div class="vmp-official-pc" v-if="officialVisible">
    <div class="officaial-dialog">
      <div class="officaial-dialog_wrapper">
        <div class="officaial_title">
          <p>{{ $t('nav.nav_1002') }}</p>
          <i class="vh-iconfont vh-line-close" @click="officialVisible = false"></i>
        </div>
        <div class="officaial_dialog">
          <div class="officaial_dialog_img">
            <img
              :src="`${officicalInfo.img}?x-oss-process=image/resize,m_fill,w_233,h_233`"
              alt=""
            />
          </div>
        </div>
        <p class="officaial_introduce">
          {{ $t('nav.nav_1019') }}
          <br />
          {{ $t('nav.nav_1012') }}
        </p>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'VmpOfficialPc',
    data() {
      return {
        officialVisible: false
      };
    },
    computed: {
      // 获取嵌入方式
      embedObj() {
        return this.$domainStore.state.roomBaseServer.embedObj;
      },
      officicalInfo() {
        return this.$domainStore.state.roomBaseServer.officicalInfo;
      },
      isLive() {
        return this.$domainStore.state.roomBaseServer.watchInitData.status == 'live';
      }
    },
    created() {
      if (this.embedObj.embedVideo) return;
      this.getOfficialInfo();
    },
    methods: {
      getOfficialInfo() {
        if (this.officicalInfo && this.officicalInfo.status == 0 && this.officicalInfo.img) {
          if (this.embedObj.embed) {
            // 嵌入页页并且是直播时 才显示公众号，预约页不显示
            if (this.isLive) this.officialVisible = true;
          } else {
            if (this.officicalInfo.alert_type == 0) {
              this.officialVisible = true;
            }
          }
        }
      },
      openOfficialDialog() {
        this.officialVisible = true;
      }
    }
  };
</script>
<style lang="less">
  .vmp-official-pc {
    .officaial-dialog {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
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
  }
</style>
