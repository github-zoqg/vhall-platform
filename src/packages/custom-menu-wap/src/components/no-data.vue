<template>
  <section>
    <div>
      <img
        src="../assets/imgs/noData_red.png"
        alt=""
        srcset=""
        v-show="(isPortraitLive || isConcise) && ![4, 5].includes(backGroundColor)"
      />
      <img
        src="../assets/imgs/noData_golden.png"
        alt=""
        srcset=""
        v-show="(isPortraitLive || isConcise) && backGroundColor == 4"
      />
      <img
        src="../assets/imgs/noData_blue.png"
        alt=""
        srcset=""
        v-show="(isPortraitLive || isConcise) && backGroundColor == 5"
      />
    </div>
    <p>
      {{ showType ? $t('nav.nav_1038') : $t('nav.nav_1039') }}
    </p>
  </section>
</template>

<script>
  export default {
    name: 'noData',
    props: {
      showType: {
        // 0 显示打赏文案，1显示邀请文案
        type: Number,
        default: 1
      }
    },
    computed: {
      // 是否是手机端 - 简洁模式
      isConcise() {
        let skin_json_wap = {
          style: 1
        };
        const skinInfo = this.$domainStore.state.roomBaseServer.skinInfo;
        if (skinInfo?.skin_json_wap && skinInfo.skin_json_wap != 'null') {
          skin_json_wap = skinInfo.skin_json_wap;
        }
        return !!(skin_json_wap?.style == 3);
      },
      // 竖屏直播
      isPortraitLive() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar_show_type == 0;
      },
      backGroundColor() {
        let skin_json_wap = {
          style: 1
        };
        const skinInfo = this.$domainStore.state.roomBaseServer.skinInfo;
        if (skinInfo?.skin_json_wap && skinInfo.skin_json_wap != 'null') {
          skin_json_wap = skinInfo.skin_json_wap;
        }
        return skin_json_wap.backGroundColor;
      }
    }
  };
</script>

<style lang="less" scoped>
  section {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    margin-top: 82px;
    div {
      width: 200px;
      img {
        width: 100%;
        margin-left: 54px;
      }
    }
    p {
      margin-top: 28px;
      text-align: center;
      font-size: 28px;
      font-weight: 400;
      color: var(--theme-tab-content-rank-noData-font);
    }
  }
</style>
