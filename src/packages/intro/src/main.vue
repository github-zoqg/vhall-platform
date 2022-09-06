<template>
  <section class="vmp-intro">
    <overlay-scrollbars ref="introScroll" :options="overlayScrollBarsOptions" style="height: 100%">
      <section class="vmp-intro-block vmp-intro-block-content">
        <main v-if="content" class="vmp-intro-block__content-main">
          <section v-html="content"></section>
        </main>
      </section>
    </overlay-scrollbars>
  </section>
</template>

<script>
  import IntroEmptyImg from './assets/images/intro-empty.png';
  export default {
    name: 'VmpIntro',
    data() {
      return {
        IntroEmptyImg,
        type: 'default', // default、subscribe
        overlayScrollBarsOptions: {
          resize: 'none',
          paddingAbsolute: true,
          className: 'os-theme-light os-theme-vhall',
          scrollbars: {
            autoHide: 'leave',
            autoHideDelay: 200
          }
        }
      };
    },
    computed: {
      watchInitData() {
        return this?.$domainStore?.state?.roomBaseServer?.watchInitData;
      },
      webinar() {
        return this?.watchInitData?.webinar;
      },
      webinarTag() {
        return this?.$domainStore?.state?.roomBaseServer?.webinarTag;
      },
      // 是否显示版权信息 type:Boolean
      isShowCopyRight() {
        return this?.webinarTag?.reserved_status === 1;
      },
      // 无延迟 Type:Boolean
      isNoDelay() {
        return this.webinar.no_delay_webinar === 1;
      },
      // 标题 Type:String
      title() {
        return this?.webinar?.subject || '';
      },
      // 开始时间 Type:String
      startTime() {
        return this?.webinar?.start_time?.substr(0, 16) || '';
      },
      // 在线人数或订阅人数 Type:String
      personCount() {
        return (
          Number(this.$domainStore.state.virtualAudienceServer.uvOnline) +
          Number(this.$domainStore.state.virtualAudienceServer.virtualOnline)
        );
      },
      languagesInfo() {
        return this.$domainStore.state.roomBaseServer.languages.curLang;
      },
      // 简介富文本正文 Type:String
      content() {
        const defaultText = this.$t('appointment.appointment_1019');
        const defaultContent = `
        <section style="text-align:center;padding-bottom:20px">
          <img class="empty" style="display: block;width: 160px;height: 120px;margin: 50px auto 10px auto;" src="${IntroEmptyImg}" alt="">
          <div class="info" style="color:#999">${defaultText}</div>
        </section>
        `;

        const introduction = this.languagesInfo.introduction;
        if (introduction && introduction !== '<p></p>') {
          return introduction;
        }

        return defaultContent;
      }
    }
  };
</script>

<style lang="less">
  .vmp-intro {
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;

    .vmp-intro-block {
      padding: 0 0;

      &__content-main {
        box-sizing: border-box;
        padding: 16px 24px 12px 24px;
        width: 100%;
        height: 100%;
        background: transparent;
        font-size: 14px;
        font-weight: 400;
        color: var(--theme-tab-content-intro-font);
        word-break: break-word;
        overflow: hidden;

        p {
          margin-bottom: 8px;
        }
        img {
          margin: 16px auto;
          display: block;
          max-width: 100%;
        }

        .empty {
          display: block;
          width: 160px;
          height: 120px;
          margin: 80px auto 10px auto;
        }
        .info {
          width: 100%;
          height: 22px;
          font-size: 16px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #999999;
          line-height: 22px;
          text-align: center;
        }
      }
    }

    aside {
      flex: 0 0 auto;

      .vmp-intro-link {
        width: 100%;
        height: 100px;
        font-size: 28px;
        font-weight: 400;
        color: rgba(129, 129, 129, 1);
        line-height: 100px;
        text-align: center;
        display: block;
      }
    }
  }
</style>
