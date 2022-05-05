<template>
  <div class="vmp-error" :class="propType == 'encrypt_error' ? 'vmp-error-encrypt' : ''">
    <div
      :class="`vmp-error__main error__pc ${propType} ${layout_line ? 'vmp__layout__line' : ''}`"
      :style="{ 'margin-top': mainTop }"
    >
      <!-- 图片区域 -->
      <div class="vmp-error__img">
        <!-- 账号在其它设备登录观看  it_end -->
        <img v-if="propType == 'it_end'" src="./img/it_end.png" alt="" />
        <!-- 此视频已下线 video_null -->
        <img v-else-if="propType == 'video_null'" src="./img/video_null.png" alt="" />
        <!-- 活动不存在 active_lost -->
        <img v-else-if="propType == 'active_lost'" src="./img/video_null.png" alt="" />
        <!-- 主持人、嘉宾或助理不允许进入观看端 no_entry -->
        <img v-else-if="propType == 'no_entry'" src="./img/video_null.png" alt="" />
        <!-- 此专题已下线 subject_null -->
        <img v-else-if="propType == 'subject_null'" src="./img/subject_null.png" alt="" />
        <!-- 页面停止服务 stop_serve -->
        <img v-else-if="propType == 'stop_serve'" src="./img/stop_serve.png" alt="" />
        <!-- 禁止访问 un_auth -->
        <img v-else-if="propType == 'un_auth'" src="./img/un_auth.png" alt="" />
        <!-- 人数超上线 surpass_limit -->
        <img v-else-if="propType == 'surpass_limit'" src="./img/surpass_limit.png" alt="" />
        <!-- 清除浏览器cookies  clear_cookie -->
        <img v-else-if="propType == 'clear_cookie'" src="./img/clear_cookie.png" alt="" />
        <!-- 浏览器版本低 browser_version -->
        <img v-else-if="propType == 'browser_version'" src="./img/browser_version.png" alt="" />
        <!-- 嵌入页面验证方式 embed_verify -->
        <img v-else-if="propType == 'embed_verify'" src="./img/embed_verify.png" alt="" />
        <!-- 视频转码中  transcoding -->
        <img v-else-if="propType == 'transcoding'" src="./img/transcoding.png" alt="" />
        <!-- 页面404 page_404 -->
        <img v-else-if="propType == 'page_404'" src="./img/page_404.png" alt="" />
        <!-- 加密视频无法观看提示 -->
        <img v-else-if="propType == 'encrypt_error'" src="./img/encrypt_error.png" alt="" />
        <!-- 观看限制提示 -->
        <img
          v-else-if="propType == 'view_restriction'"
          src="./img/view_restriction.png"
          alt=""
          style="margin-left: 120px"
        />
        <slot v-else name="image">
          <!-- 空页面，网络开小差 network -->
          <img src="./img/network.png" alt="" />
        </slot>
      </div>
      <!-- 文本 + 按钮区域 -->
      <div class="vmp-error__content">
        <!-- 插槽标题区域  -->
        <h1 v-if="showTitle">
          {{ propTitle || '404' }}
        </h1>
        <!-- 插槽内容区域  -->
        <slot name="body">
          <p v-for="(item, key) in (typeContent[propType] || '').split('=_=')" :key="`st_${key}`">
            {{ item }}
          </p>
        </slot>
        <div class="vmp-error__slot">
          <slot name="footer">
            <!-- 插槽按钮区域  -->
            <el-button
              v-if="propType == 'it_end' || propType == 'network'"
              type="primary"
              @click="demoHandler"
            >
              {{ propType == 'it_end' ? $t('webinar.webinar_1031') : $t('webinar.webinar_1032') }}
            </el-button>
          </slot>
        </div>
      </div>
    </div>
    <!-- 占位层，勿删 -->
    <div class="vmp-error__div">&nbsp;</div>
  </div>
</template>
<script>
  export default {
    name: 'Error',
    data() {
      return {
        marginCss: {
          // 默认计算公式： 设计稿上边距 - 图片本身大小的一半 = 差距间距
          it_end: 48,
          video_null: 72,
          subject_null: 72,
          stop_serve: '-26',
          un_auth: 46,
          surpass_limit: 77,
          clear_cookie: 64,
          network: '-21',
          browser_version: 34,
          embed_verify: 16,
          page_404: 35, // 横向布局特殊计算： 设计稿上边距 - (（main高度区域 - 图片本身大小的一半）/ 2 ) = 差距间距
          transcoding: 78
        },
        typeContent: {
          // =_= 表示文本断行
          it_end: this.$t('message.message_1003'),
          video_null: this.$t('message.message_1004'),
          subject_null: this.$t('message.message_1005'),
          stop_serve: `${this.$t('message.message_1006')}=_=${this.$t('message.message_1025')}`,
          un_auth: this.$t('message.message_1007'),
          surpass_limit: this.$t('message.message_1008'),
          clear_cookie: `${this.$t('message.message_1009')}'`,
          network: `${this.$t('message.message_1010')}`,
          browser_version: this.$t('message.message_1011'),
          embed_verify: this.$t('message.message_1012'),
          page_404: this.$t('message.message_1013'),
          transcoding: this.$t('message.message_1014'),
          active_lost: this.$t('message.message_1004'),
          no_entry: this.$t('message.message_1016'),
          view_restriction: this.$t('other.other_1020')
        }
      };
    },
    props: {
      propType: {
        required: false,
        // 错误类型，跟样式一一对应 ['it_end', 'video_null', 'subject_null', 'stop_serve', 'un_auth', 'surpass_limit', 'clear_cookie', 'network', 'browser_version', 'embed_verify', 'page_404', 'transcoding']
        default: function () {
          return [
            'it_end',
            'video_null',
            'subject_null',
            'stop_serve',
            'un_auth',
            'surpass_limit',
            'clear_cookie',
            'network',
            'browser_version',
            'embed_verify',
            'page_404',
            'transcoding',
            'encrypt_error'
          ].includes(this.$route.params.str)
            ? this.$route.params.str
            : 'network';
        }
      },
      propLayout: {
        required: false,
        // 布局类别，default -- 纵向；line -- 横向
        default: 'default'
      },
      propTitle: {
        required: false,
        // 标题 - 入参
        default: ''
      }
    },
    computed: {
      layout_line: function () {
        // 若当前 propType 类型为404空页面，展示横向布局；或者传入的 propLayout 不为 default表示展示横向布局
        return this.propType == 'page_404' || this.propLayout != 'default';
      },
      showTitle: function () {
        // 若当前 propType 类型为404空页面，展示默认404标题；或者传入了propTitle字段，展示标题
        return this.propType == 'page_404' || this.propTitle != '';
      },
      mainTop: function () {
        // 若有传入，以传入的为主；否则以默认设置的margin-top为主
        return `${this.marginCss[this.propType]}px`;
      }
    },
    methods: {
      demoHandler() {
        if (this.propType == 'it_end') {
          // 单点登录失效，刷新页面
          window.location.reload();
        } else {
          this.$router.go(0);
        }
      }
    }
  };
</script>
<style lang="less">
  .vmp-error {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #ffffff;
    /* 按钮红色 */
    .el-button {
      padding: 9px 31px;
      &.el-button--primary {
        background: #fb3a32;
        border: 1px solid #fb3a32;
        font-size: 14px;
        font-weight: 400;
        color: #ffffff;
        line-height: 20px;
        border-radius: 20px;
        &:hover {
          color: #fff;
          background: #fc615b;
          border: 1px solid #fc615b;
        }
        &:focus {
          color: #fff;
          background: #fb3a32;
          border: 1px solid #fb3a32;
        }
        &:active {
          background: #e2332c;
          border: 1px solid #e2332c;
        }
        &.is-disabled {
          background: #f09d99;
          border: 1px solid #f09d99;
          cursor: not-allowed;
          color: #fff;

          &:hover,
          &:focus,
          &:active {
            background: #f09d99;
            border: 1px solid #f09d99;
          }
        }
      }
    }
  }
  .vmp-error__main {
    margin: 0 auto 0 auto;
    height: auto;
    &.error__pc {
      max-width: 800px;
    }
    .vmp-error__img {
      text-align: center;
      transform: scale(0.5);
      transform-origin: center bottom;
      /* img {
      width: 100%;
    } */
    }
    .vmp-error__content {
      margin-top: 24px;
      h1 {
        font-size: 40px;
        font-weight: 600;
        color: #e6e6e6;
        line-height: 56px;
        text-align: center;
      }
      p {
        text-align: center;
        font-size: 16px;
        font-weight: 400;
        color: #1a1a1a;
        line-height: 22px;
        padding-left: 60px;
      }
    }
    .vmp-error__slot {
      margin-top: 24px;
      text-align: center;
    }
    /* 左右布局 */
    &.vmp__layout__line {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      .vmp-error__img {
        margin-right: 24px;
        transform-origin: center right;
      }
      .vmp-error__content {
        h1,
        p {
          text-align: left;
        }
      }
      .vmp-error__slot {
        text-align: left;
      }
    }
    &.it_end {
      .vmp-error__content {
        margin-top: 18px;
      }
      .vmp-error__slot {
        margin-top: 24px;
      }
    }
    &.video_null {
      .vmp-error__content {
        margin-top: 16px;
      }
    }
    &.subject_null {
      .vmp-error__content {
        margin-top: 15px;
      }
    }
    &.stop_serve {
      .vmp-error__content {
        margin-top: 14px;
      }
    }
    &.un_auth {
      .vmp-error__content {
        margin-top: 8px;
      }
    }
    &.surpass_limit {
      .vmp-error__content {
        margin-top: 15px;
      }
    }
    &.clear_cookie {
      .vmp-error__content {
        margin-top: 24px;
      }
    }
    &.network {
      .vmp-error__content {
        margin-top: 14px;
      }
      .vmp-error__slot {
        margin-top: 30px;
      }
    }
    &.browser_version {
      .vmp-error__content {
        margin-top: 13px;
      }
    }
    &.embed_verify {
      .vmp-error__content {
        margin-top: 16px;
      }
    }
    &.transcoding {
      .vmp-error__content {
        margin-top: 15px;
      }
    }
  }
  .vmp-error__div {
    margin-top: auto;
    width: 100%;
    flex: 1;
  }
  .vmp-error-encrypt {
    background: rgba(0, 0, 0, 0.9);
    .vmp-error__content {
      p {
        padding: 0;
        color: #fff;
      }
    }
    .vmp-error__main .vmp-error__img {
      transform-origin: center;
    }
    .vmp-error__content {
      margin: 0;
      position: relative;
      top: -190px;
    }
  }
</style>
