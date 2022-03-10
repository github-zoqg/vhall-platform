<template>
  <section class="vmp-intro">
    <section class="vmp-intro-block">
      <header class="vmp-intro-block__headtitle">
        <i v-if="mode !== 6 && isNoDelay" class="delay-icon">
          <img :src="NoDelayImg" />
        </i>
        {{ languagesInfo.subject }}
      </header>
      <main class="vmp-intro-block__detail">
        <p>
          <i class="vh-iconfont vh-line-time" />
          开始时间:{{ startTime }}
        </p>
        <template v-if="watchInitData.status == 'subscribe' && webinar.type == 2">
          <p v-if="watchInitData.subscribe.show">
            <i class="vh-iconfont vh-line-user"></i>
            预约人数:{{ watchInitData.subscribe.num }} 人
          </p>
        </template>
        <template v-if="watchInitData.status != 'subscribe'">
          <!-- 直播中才展示在线人数 但是直播中没通过权限验证 也是不显示的 -->
          <p v-if="watchInitData.online.show">
            <i class="vh-iconfont vh-line-user"></i>
            在线人数:{{ personCount }} 人
          </p>
        </template>
      </main>
      <div
        class="vmp-intro-block__auth"
        v-if="watchInitData.status == 'subscribe' && watchInitData.join_info.is_subscribe != 1"
      >
        <span>
          {{ webinar.verify == 5 ? '' : Number(webinar.reg_form) ? $t('form.form_1078') : '' }}
          {{
            ((webinar.verify == 4 || webinar.verify == 1) && Number(webinar.reg_form) && '/') || ''
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
      </div>
    </section>
    <section class="vmp-intro-block vmp-intro-block-content">
      <header class="vmp-intro-block__title">活动简介</header>
      <main class="vmp-intro-block__content-main" v-html="content"></main>
    </section>

    <aside>
      <a
        class="vmp-intro-link"
        v-show="isShowCopyRight"
        href="https://www.vhall.com/saas"
        target="_blank"
      >
        微吼提供技术支持
      </a>
      <!-- 暂时借用dom -->
      <vmp-air-container :cuid="cuid"></vmp-air-container>
    </aside>
  </section>
</template>

<script>
  export default {
    name: 'VmpIntroWap',
    filters: {
      formatCount(num) {
        if (num < 10000) return num;

        const integer = Math.floor(num / 10000); // 整数
        let decimals = Math.floor((num % 10000) / 1000); // 小数
        decimals = decimals === 0 ? '' : '.' + decimals;

        return integer + decimals + '万';
      }
    },
    data() {
      return {
        lang: 'zh-CN',
        type: 'default' // default、subscribe
      };
    },
    computed: {
      // 无延迟图片地址
      NoDelayImg() {
        return `${process.env.VUE_APP_STATIC_BASE}/saas-v3/static/common/img/nodelay-icon/v1.0.0/pc/delay-icon_${this.lang}.png`;
      },
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
        return this?.webinarTag?.reserved_status === 1;
      },
      // 无延迟 Type:Boolean
      isNoDelay() {
        return this.webinar.no_delay_webinar === 1;
      },
      // 标题 Type:String 多语言不需要用
      // title() {
      //   return this?.webinar?.subject || '';
      // },
      // 开始时间 Type:String
      startTime() {
        return this?.webinar?.start_time?.substr(0, 16) || '';
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
    position: relative;
    display: flex;
    flex-direction: column;

    .vmp-intro-block {
      padding: 0.4rem;
      background-color: #fff;
      position: relative;

      &:not(:first-child) {
        margin-top: 20px;
      }

      &-content {
        flex: 1 1 auto;
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
        font-weight: bold;
        line-height: 48px;
        color: @font-hover-low;
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
          background: @font-error;
        }
      }

      &__detail {
        p {
          i {
            margin-right: 8px;
          }

          height: 40px;
          font-size: 28px;
          font-family: PingFangSC;
          font-weight: 400;
          color: @bg-end-normal;
          line-height: 40px;
          margin-top: 15px;
          display: flex;
          align-items: center;
        }
      }

      &__content-main {
        padding-bottom: 30px;
        color: #666666;
        word-break: break-all;
        line-height: 1.2;
        p {
          word-break: break-all;
        }

        img {
          width: 100%;
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
