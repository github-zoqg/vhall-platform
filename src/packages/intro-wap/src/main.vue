<template>
  <section :class="['vmp-intro', isConcise || isPortraitLive ? ' vmp-intro__concise' : '']">
    <section class="vmp-intro-main">
      <div :class="{ 'vmp-intor-haveIcon': showIconNum }">
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
            <!-- 预约人数 -->
            <template v-if="watchInitData.status == 'subscribe' && webinar.type == 2">
              <p class="num" v-if="watchInitData.subscribe.show">
                <i18n path="appointment.appointment_1018">
                  <span place="n">{{ watchInitData.subscribe.num }}</span>
                </i18n>
              </p>
            </template>
            <!-- 在线人数 -->
            <template v-if="watchInitData.status != 'subscribe' && !isConcise && !isPortraitLive">
              <!-- 直播中才展示在线人数 但是直播中没通过权限验证 也是不显示的 -->
              <p v-if="watchInitData.online.show">
                <i class="vh-iconfont vh-line-group"></i>
                {{ personCountTxt | formatHotNum }}
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
      </div>
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
  import { throttle } from 'lodash';
  export default {
    name: 'VmpIntroWap',
    data() {
      return {
        type: 'default', // default、subscribe
        personCountTxt: 0
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
      },
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
      // 展示icon数量
      showIconNum() {
        return this.$domainStore.state.roomBaseServer.showIconNum;
      },
      // 竖屏直播
      isPortraitLive() {
        return (
          this.$domainStore.state.roomBaseServer.watchInitData?.webinar?.webinar_show_type == 0
        );
      }
    },
    created() {
      this.personCountTxt = this.personCount;
    },
    watch: {
      personCount(val) {
        this.updatePersonCount(val);
      }
    },
    methods: {
      updatePersonCount: throttle(function (val) {
        this.personCountTxt = val;
      }, 1000)
    }
  };
</script>

<style lang="less">
  .vmp-intro {
    background-color: var(--theme-tab-content-intro-introLink-bg);
    height: 100%;
    overflow-y: auto;
    position: relative;
    display: flex;
    flex-direction: column;

    .vmp-intor-haveIcon {
      width: calc(100% - 84px);
      .vmp-intro-block-content,
      .vmp-intro-block {
        padding-right: 0;
      }
    }

    .vmp-intro-block {
      padding: 24px 24px 0 24px;
      background-color: var(--theme-tab-content-intro-introLink-bg);
      position: relative;

      // &:not(:first-child) {
      //   margin-top: 20px;
      // }

      &-content {
        flex: 1 1 auto;
        padding-top: 32px;
      }

      &__headtitle {
        font-size: 32px;
        text-overflow: -o-ellipsis-lastline;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        /* autoprefixer: ignore next */
        -webkit-box-orient: vertical;
        word-break: break-all;
        font-weight: 500;
        line-height: 50px;
        color: var(--theme-tab-content-intro-title-font);
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
        color: var(--theme-tab-content-intro-subTitle-font);
        margin-top: 7px;
        p {
          // i {
          //   margin-right: 8px;
          // }
          // .vh-line-user {
          //   font-size: 12px;
          //   line-height: 40px;
          // }
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
        .num {
          color: var(--theme-component-subscribe);
        }
        .vh-line-group {
          margin-right: 10px;
        }
      }

      &__content-main {
        padding-bottom: 24px;
        color: var(--theme-tab-content-intro-subTitle-font);
        word-break: break-word;
        line-height: 1.4;
        // p {
        //   word-break: break-word;
        // }

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
        color: var(--theme-tab-content-intro-introLink-font);
        line-height: 100px;
        text-align: center;
        display: block;
      }
    }

    &__concise {
      /* 简洁模式 */
    }
  }
</style>
