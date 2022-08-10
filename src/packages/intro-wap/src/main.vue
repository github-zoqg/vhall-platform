<template>
  <section class="vmp-intro">
    <section class="vmp-intro-main">
      <section class="vmp-intro-block">
        <header class="vmp-intro-block__headtitle">
          <i v-if="mode !== 6 && isNoDelay" class="delay-icon">
            <img :src="noDelayIconUrl" />
          </i>
          {{ languagesInfo.subject }}
        </header>
        <main class="vmp-intro-block__detail">
          <p>
            <!-- <i class="vh-iconfont vh-line-time" /> -->
            {{ startTime }}
          </p>
          <template v-if="watchInitData.status == 'subscribe' && webinar.type == 2">
            <p v-if="watchInitData.subscribe.show">
              <i18n path="appointment.appointment_1018">
                <span place="n">{{ watchInitData.subscribe.num }}</span>
              </i18n>
            </p>
          </template>
          <template v-if="watchInitData.status != 'subscribe'">
            <!-- 直播中才展示在线人数 但是直播中没通过权限验证 也是不显示的 -->
            <p v-if="watchInitData.online.show">
              <i class="vh-iconfont vh-line-user"></i>
              {{ $t('common.common_1013') }}:{{ personCount | formatHotNum }}
            </p>
          </template>
        </main>
        <!-- <div
          class="vmp-intro-block__auth"
          v-if="
            !isEmbed &&
            watchInitData.status == 'subscribe' &&
            watchInitData.join_info.is_subscribe != 1
          "
        >
          <span>
            {{ webinar.verify == 5 ? '' : Number(webinar.reg_form) ? $t('form.form_1078') : '' }}
            {{
              ((webinar.verify == 4 || webinar.verify == 1) && Number(webinar.reg_form) && '/') ||
              ''
            }}
            {{
              webinar.verify == 0
                ? ''
                : webinar.verify == 1
                ? $t('form.form_1079')
                : webinar.verify == 2
                ? $t('appointment.appointment_1032')
                : webinar.verify == 3
                ? ''
                : webinar.verify == 4
                ? $t('appointment.appointment_1011')
                : webinar.verify == 5
                ? $t('form.form_1078')
                : ''
            }}
          </span>
        </div> -->
      </section>
      <section class="vmp-intro-block vmp-intro-block-content">
        <!-- <header class="vmp-intro-block__title">{{ $t('common.common_1017') }}</header> -->
        <main class="vmp-intro-block__content-main" v-html="content"></main>
      </section>
      <aside>
        <a
          class="vmp-intro-link"
          v-show="isShowCopyRight"
          href="https://www.vhall.com/saas"
          target="_blank"
        >
          {{ $t('footer.footer_1021') }}
        </a>
        <!-- 暂时借用dom -->
        <vmp-air-container :cuid="cuid"></vmp-air-container>
      </aside>
    </section>
  </section>
</template>

<script>
  export default {
    name: 'VmpIntroWap',
    data() {
      return {
        type: 'default' // default、subscribe
      };
    },
    computed: {
      mode() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.mode;
      },
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
        return this?.webinarTag?.reserved_status === 1 && !this.isEmbed;
      },
      // 无延迟 Type:Boolean
      isNoDelay() {
        return this.webinar.no_delay_webinar === 1;
      },
      // 开始时间 Type:String
      startTime() {
        return this?.webinar?.start_time?.substr(0, 16) || '';
      },
      // 是否为嵌入页
      isEmbed() {
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      },
      languagesInfo() {
        return this.$domainStore.state.roomBaseServer.languages.curLang;
      },
      // 在线人数或订阅人数 Type:String
      personCount() {
        return (
          Number(this.$domainStore.state.virtualAudienceServer.uvOnline) +
          Number(this.$domainStore.state.virtualAudienceServer.virtualOnline)
        );
      },
      // 无延迟图片地址
      noDelayIconUrl() {
        const langArr = ['zh-CN', 'en'];
        const langer = localStorage.getItem('lang') || this.languagesInfo.language_type;
        const lang = langArr[langer - 1] || 'zh-CN';
        return `//cnstatic01.e.vhall.com/common-static/images/nodelay-icon/v1.0.0/pc/delay-icon_${lang}.png`;
      },
      // 简介富文本正文 Type:String
      content() {
        return this.languagesInfo.introduction || '<p></p>';
      }
    }
  };
</script>

<style lang="less">
  .vmp-intro {
    background-color: #f2f2f2;
    height: 100%;
    overflow-y: auto;
    position: relative;
    display: flex;
    flex-direction: column;

    .vmp-intro-block {
      padding: 32px 24px 0 24px;
      background-color: #fff;
      position: relative;

      // &:not(:first-child) {
      //   margin-top: 20px;
      // }

      &-content {
        flex: 1 1 auto;
        padding-top: 32px;
      }

      &__headtitle {
        font-size: 36px;
        text-overflow: -o-ellipsis-lastline;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        word-break: break-all;
        font-weight: 500;
        line-height: 48px;
        color: #262626;
        .delay-icon {
          display: inline-block;
          width: 116px;
          height: 50px;

          img {
            height: 100%;
          }

          vertical-align: bottom;
        }
      }

      &__title {
        font-weight: bold;
        font-size: 32px;
        line-height: 48px;
        color: @font-hover-low;
        display: flex;
        align-items: center;
        padding-left: 14px;
        position: relative;
        margin-bottom: 20px;

        &::before {
          content: '';
          position: absolute;
          left: 0px;
          width: 4px;
          height: 30px;
          background: @bg-error-light;
        }
      }

      &__detail {
        display: flex;
        width: 100%;
        justify-content: space-between;
        align-items: center;
        p {
          i {
            margin-right: 8px;
          }

          height: 40px;
          font-size: 28px;
          font-family: Arial;
          font-weight: 400;
          color: #595959;
          line-height: 40px;
          // margin-top: 15px;
          display: flex;
          align-items: center;
        }
      }

      &__content-main {
        padding-bottom: 24px;
        color: #595959;
        word-break: break-all;
        line-height: 1.4;
        p {
          word-break: break-all;
        }

        img {
          margin: 16px 0;
          max-width: 100%;
          height: auto;
        }
        strong {
          font-weight: bold;
        }
      }

      &__auth {
        position: absolute;
        bottom: 14px;
        right: 30px;
        display: flex;
        flex-direction: column;
        span {
          height: 50px;
          font-size: 32px;
          font-family: PingFangSC;
          font-weight: bold;
          color: rgba(252, 86, 89, 1);
          line-height: 36px;
          text-align: right;
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
