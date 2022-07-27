<template>
  <div>
    <div class="subject-detail" v-if="showSubject">
      <div class="subject-poster">
        <img class="poster-image" :src="detailInfo.webinar_subject.cover" alt="" />
      </div>
      <section class="subject-header">
        <h2 class="subject-title">{{ detailInfo.webinar_subject.title }}</h2>
        <p class="subject-create-time">{{ detailInfo.webinar_subject.created_at }}</p>
        <div class="subject-info">
          <p>
            共&nbsp;
            <span class="subject-info_num">{{ detailInfo.webinar_subject.webinar_num }}</span>
            &nbsp;个直播
          </p>
          <p :style="{ visibility: detailInfo.webinar_subject.hide_pv ? 'visible' : 'hidden' }">
            <img src="./img/pv.png" alt="" />
            热度&nbsp;
            <span class="subject-info_num">{{ detailInfo.webinar_subject.pv }}</span>
          </p>
          <p
            :style="{
              visibility: detailInfo.webinar_subject.hide_appointment ? 'visible' : 'hidden'
            }"
          >
            <span class="subject-info_num">{{ detailInfo.webinar_subject.order_num }}</span>
            &nbsp;次预约
          </p>
        </div>
      </section>
      <section class="subject-intro">
        <p class="subject-intro_title">简介</p>
        <div
          @click="handleOpenHide"
          class="subject-intro_value"
          :style="`height: ${open_hide ? 'auto' : ''}`"
        >
          <p v-html="detailInfo.webinar_subject.intro"></p>
        </div>
        <p @click="handleOpenHide" class="subject-intro_switch">
          <i class="vh-iconfont" :class="[open_hide ? 'vh-line-arrow-up' : 'vh-line-arrow-down']" />
        </p>
      </section>
      <section class="subject-menu">
        <p class="subject-menu_title">目录</p>
        <article
          @click="toWatch(item)"
          v-for="item in detailInfo.webinar_subject.webinar_list"
          :key="item.id"
          class="subject-menu_item clearfix"
        >
          <div class="subject-menu_item-left">
            <img :src="item.img_url" alt="" class="item-poster" />
            <span
              class="item-status"
              :style="`background: ${stateArr[item.webinar_state - 1].bgcolor}`"
            >
              {{ liveTag(item) }}
              <span v-if="hasDelayPermission == 1 && item && item.no_delay_webinar == 1">
                | 无延迟
              </span>
            </span>
            <!-- <span class="item-type">付费</span> -->
          </div>
          <div class="subject-menu_item-right">
            <p class="item-title">{{ item.subject }}</p>
            <span v-if="item.hide_pv" class="item-num">
              <img src="./img/pv.png" alt="" />
              <span>{{ item.pv }}</span>
            </span>
            <span class="item-date">{{ item.start_time }}</span>
          </div>
        </article>
      </section>
    </div>
    <!-- 没有此专题 -->
    <div v-else class="error-page">
      <img src="./img/subject_null.png" alt="" />
      <p>专题已下线</p>
    </div>
    <!-- 登录弹窗 -->
    <login-wap ref="loginWap"></login-wap>
    <!-- 权限弹窗 -->
    <confirm-auth
      title="权限验证"
      :width="'100%'"
      v-if="isShowCheck"
      @authSubmit="authSubmit"
      @authClose="authClose"
    >
      <div slot="content" class="vmp-subscribe-body_input">
        <input
          :type="`${isHidden ? 'password' : 'text'}`"
          v-model="textAuth"
          :placeHolder="subjectAuthInfo.placeHolder"
        />
        <i
          :class="`vh-iconfont ${isHidden ? 'vh-line-hidden' : 'vh-line-view'}`"
          @click="isHidden = !isHidden"
        ></i>
      </div>
    </confirm-auth>
  </div>
</template>

<script>
  import { useSubjectServer } from 'middle-domain';
  import { initWeChatSdk } from '@/app-shared/utils/wechat';
  import { getQueryString } from '@/app-shared/utils/tool.js';
  import { urlToLink, padStringWhenTooLang } from './js/utils.js';
  import loginWap from '@/packages/reg-login-wap/src/main.vue';
  import confirmAuth from '../components/confirm.vue';
  export default {
    data() {
      return {
        open_hide: false,
        showSubject: true,
        isShowCheck: false,
        webinarId: '',
        textAuth: '',
        isHidden: true,
        detailInfo: {
          webinar_subject: {
            cover: '',
            title: '',
            created_at: '',
            webinar_num: '',
            hide_pv: '',
            order_num: '',
            intro: '',
            webinar_list: [],
            hasDelayPermission: 0
          }
        },
        stateArr: [
          {
            value: '直播',
            bgcolor: '#fb3a32'
          },
          {
            value: '预告',
            bgcolor: '#5ea6ec'
          },
          {
            value: '结束',
            bgcolor: '#999999'
          },
          {
            value: '点播',
            bgcolor: '#ff8834'
          },
          {
            value: '回放',
            bgcolor: '#2ab804'
          }
        ]
      };
    },
    components: {
      loginWap,
      confirmAuth
    },
    beforeCreate() {
      this.subjectServer = useSubjectServer();
    },
    created() {
      this.getDetail();
      this.hasDelayPermission = this.$route.query.delay;
    },
    computed: {
      subjectAuthInfo() {
        return this.subjectServer.state.subjectAuthInfo;
      }
    },
    mounted() {
      this.$i18n.locale = 'zh-CN';
    },
    methods: {
      liveTag(val) {
        /**
         * webinar_state  1直播 2预约 3结束 4点播 5回放
         * webinar_type  1音频直播 2视频直播 3互动直播 5 定时直播 6 分组直播
         */
        const liveTypeStr = ['', '直播', '预告', '结束', '点播', '回放'];
        const liveStatusStr = ['', '音频直播', '视频直播', '互动直播', '', '', '分组直播'];
        let str = liveTypeStr[val.webinar_state];
        if (val.webinar_state != 4 && val.webinar_type != 5) {
          str += ` | ${liveStatusStr[val.webinar_type]}`;
        }
        return str;
      },
      async getDetail() {
        try {
          const res = await this.subjectServer.getSubjectInfo({
            subject_id: this.$route.query.id
          });
          if (res.code !== 200) {
            this.showSubject = false;
            this.$toast(res.msg);
            return;
          }

          this.detailInfo = res.data;
          this.detailInfo.webinar_subject.intro = urlToLink(this.detailInfo.webinar_subject.intro);
          this.initSubjectAuth();
          this.wxShareInfo(res.data.webinar_subject);
        } catch (err) {
          this.$toast(err.msg);
        }
      },
      // 获取专题的初始化信息
      initSubjectAuth() {
        const visitorId = sessionStorage.getItem('visitorId');
        let params = {
          subject_id: this.$route.query.id,
          visitor_id: !['', null, void 0].includes(visitorId) ? visitorId : undefined,
          ...this.$route.query
        };
        // 如果已经鉴权过，就直接进入观看端，否则走鉴权
        this.subjectServer.initSubjectInfo(params);
      },
      // 获取微信分享信息
      async wxShareInfo(info) {
        const wx_url =
          window.location.protocol +
          process.env.VUE_APP_WAP_WATCH +
          process.env.VUE_APP_WEB_KEY +
          `/special/detail?id=${this.$route.query.id}`;

        const res = await this.subjectServer.wechatShare({
          wx_url
        });
        if (res.code != 200 || !res.data) return;
        console.log('获取微信分享数据', res.data);

        const params = {
          appId: res.data.appId,
          timestamp: res.data.timestamp,
          nonceStr: res.data.nonceStr,
          signature: res.data.signature
        };

        // set desc
        let desc = info.intro.replace(/&nbsp;/g, '');
        desc = desc.replace(/<[^>]+>|&[^>]+;/g, '');
        desc = padStringWhenTooLang(desc, '...', 32);

        const link =
          window.location.protocol +
          `${process.env.VUE_APP_WAP_WATCH}${process.env.VUE_APP_WEB_KEY}/special/detail?id=${this.$route.query.id}`;

        // wechat-sdk 初始化
        const wechatRes = await initWeChatSdk(
          { ...params },
          {
            title: info.title,
            desc,
            link,
            imgUrl: info.cover
          }
        );
        // const shareSuccessStr = '分享成功';
        // wechatRes.isSuccess && this.$toast(shareSuccessStr);
      },
      handleOpenHide() {
        this.open_hide = !this.open_hide;
      },
      toWatch(item) {
        this.webinarId = item.webinar_id;
        // 预告状态、有暖场视频
        if (item.webinar_state == 2 && item.is_open_warm_video == 1) {
          this.goWatch();
          return;
        }
        // 回放状态、开启了试看
        if (item.webinar_state == 5 && this.subjectAuthInfo.is_preview == 1) {
          this.goWatch();
          return;
        }
        this.subjectAuthInfo.pass == 1 ? this.goWatchUrl() : this.handleAuthInfo();
      },
      goWatchUrl() {
        window.location.href = `${window.location.origin}${process.env.VUE_APP_ROUTER_BASE_URL}/lives/watch/${this.webinarId}`;
      },
      handleAuthInfo() {
        let data = {
          subject_id: this.detailInfo.webinar_subject.id,
          refer: this.$route.query.refer,
          record_id: this.$route.query.record_id,
          type: this.subjectAuthInfo.verify,
          verify_value: undefined,
          ...this.$route.query
        };
        this.subjectServer.getSubjectWatchAuth(data).then(res => {
          this.handleAuthErrorCode(res.code, res.msg);
        });
      },
      handleAuthErrorCode(code, msg) {
        let queryString = '';
        let shareId = getQueryString('shareId');
        let share_id = getQueryString('share_id');
        switch (code) {
          case 510008: // 未登录
            this.$refs.loginWap.open();
            break;
          case 512525: // 填写表单
            queryString = this.$route.query.refer
              ? `?refer=${this.$route.query.refer}&isIndependent=0`
              : '?isIndependent=0';
            //  微博分享时携带的入参 - 优化设置了报名表单但是未参会时，调用接口无效,shareId未携带问题。
            if (queryString.indexOf('?') != -1) {
              queryString += share_id ? `&share_id=${share_id}` : '';
              queryString += shareId ? `&shareId=${shareId}` : '';
            } else if (queryString.indexOf('?') == -1 && share_id) {
              queryString += share_id ? `?share_id=${share_id}` : '';
            } else if (queryString.indexOf('?') == -1 && shareId) {
              queryString += shareId ? `?shareId=${shareId}` : '';
            }
            // 邀请卡分享
            queryString += this.$route.query.invite ? `&invite=${this.$route.query.invite}` : '';
            window.location.href = `${window.location.origin}${process.env.VUE_APP_ROUTER_BASE_URL}/lives/entryform/${this.webinarId}${queryString}`;
            break;
          case 512002:
          case 512522:
            setTimeout(() => {
              window.location.reload();
            }, 1500);
            break;
          case 512531:
            // 邀请码
            this.subjectAuthInfo.placeHolder = this.subjectAuthInfo.fcode_verify || '请输入邀请码';
            this.isShowCheck = true;
            break;
          case 512528:
            // 密码
            this.subjectAuthInfo.placeHolder = this.subjectAuthInfo.password_verify || '请输入密码';
            this.isShowCheck = true;
            break;
          case 512532:
            //白名单
            this.subjectAuthInfo.placeHolder =
              this.subjectAuthInfo.white_verify || '请输入手机号/邮箱/工号';
            this.isShowCheck = true;
            break;
          case 512523:
            // 付费
            break;
          default:
            this.$toast(msg || '验证失败');
            break;
        }
      },
      authSubmit() {
        let data = {
          subject_id: this.detailInfo.webinar_subject.id,
          visitor_id: this.subjectAuthInfo.visitor_id,
          type: this.subjectAuthInfo.verify,
          verify_value: this.textAuth,
          ...this.$route.query
        };
        this.subjectServer.getSubjectWatchAuth(data).then(res => {
          if (res.code == 200) {
            window.location.href =
              window.location.origin +
              process.env.VUE_APP_ROUTER_BASE_URL +
              `/lives/watch/${this.webinarId}`;
          } else {
            this.$toast(res.msg || '验证失败');
          }
        });
      },
      authClose() {
        this.isShowCheck = false;
      }
    }
  };
</script>

<style lang="less" scoped>
  .subject-detail {
    width: 100%;
    overflow-y: auto;
    height: 100%;
    .subject-poster {
      width: 100%;
      .poster-image {
        width: 100%;
        height: 420px;
      }
    }
    .subject-header {
      width: calc(100% - 40px);
      height: 186px;
      margin: 0 20px;
      padding: 20px 0;
      border-bottom: 4.1px solid #e2e2e2;
      .subject-title {
        font-size: 36px;
        color: #676767;
        line-height: 48px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .subject-create-time {
        font-size: 24px;
        color: #8c8786;
        padding: 5px 0 25px;
        line-height: 32px;
      }
      .subject-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 24px;
        color: #666;
        line-height: 32px;
        p {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        img {
          width: 30px;
        }
      }
      .subject-info_num {
        color: #ff3332;
      }
    }
    .subject-intro {
      padding: 20px 20px 0 20px;
      border-bottom: 10px solid #f7f7f7;
      .subject-intro_title {
        line-height: 38px;
        color: #5b5b5b;
        font-size: 28px;
        padding-left: 6px;
        border-left: 8px solid #f15c5c;
      }
      .subject-intro_value {
        padding-top: 8px;
        min-height: 100px;
        height: 100px;
        font-size: 24px;
        overflow: hidden;
        color: #818181;
        ::v-deep strong {
          font-weight: bold;
        }
        ::v-deep img {
          max-width: 100%;
        }
        .show-link {
          color: #3562fa;
          cursor: pointer;
        }
      }
      .subject-intro_switch {
        padding: 10px 0;
        line-height: 16px;
        text-align: center;
        img {
          width: 36px;
        }
      }
    }
    .subject-menu {
      .subject-menu_title {
        margin: 20px 20px 0 20px;
        line-height: 38px;
        color: #5b5b5b;
        font-size: 28px;
        padding-left: 6px;
        border-left: 8px solid #f15c5c;
      }
      .subject-menu_item {
        border-bottom: 4px solid #f7f7f7;
        padding: 20px;
        zoom: 1;
      }
      .subject-menu_item-left {
        height: 160px;
        width: 280px;
        position: relative;
        float: left;
        img {
          width: 100%;
          height: 160px;
          border: none;
        }
        .item-status {
          position: absolute;
          left: 0;
          top: 0;
          display: inline-block;
          text-align: center;
          line-height: 36px;
          font-size: 20px;
          color: #fff;
          padding: 2.7px 5.3px;
          background-color: #5ea6ec;
        }
        .item-type {
          position: absolute;
          bottom: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.5) none repeat scroll 0 0;
          color: #fff;
          font-size: 20px;
          line-height: 36px;
          padding: 2.7px 5.3px;
          text-align: center;
        }
      }
      .subject-menu_item-right {
        height: 160px;
        width: 400px;
        position: relative;
        float: right;
      }
      .item-title {
        font-size: 28px;
        color: #000;
        line-height: 38px;
        word-break: break-all;
        text-overflow: ellipsis;
        display: -webkit-box; /** 对象作为伸缩盒子模型显示 **/
        /* autoprefixer: ignore next */
        -webkit-box-orient: vertical; /** 设置或检索伸缩盒对象的子元素的排列方式 **/
        -webkit-line-clamp: 2; /** 显示的行数 **/
        overflow: hidden; /** 隐藏超出的内容 **/
      }
      .item-num {
        color: #818181;
        position: absolute;
        bottom: 0;
        left: 0;
        font-size: 24px;
        line-height: 32px;
        display: flex;
        align-items: center;
        img {
          width: 30px;
          padding-right: 5px;
        }
      }
      .item-date {
        color: #818181;
        position: absolute;
        bottom: 0;
        right: 0;
        font-size: 24px;
        line-height: 32px;
      }
    }
    .delay-icon {
      display: inline-block;
      // width: 116px;
      height: 50px;
      vertical-align: bottom;
    }
  }

  .error-page {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 50%;
    img {
      width: 460px;
      height: 200px;
    }
    p {
      padding-top: 30px;
    }
  }
</style>
