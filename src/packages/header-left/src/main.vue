<template>
  <div class="vmp-header-left">
    <div :title="subject" class="vhall-room-name">{{ subject }}</div>
    <div class="vhall-room-id-container">
      <div class="vhall-room-id-icon">ID</div>
      <div id="vhall-room-id-copy-val" class="vhall-room-id">{{ id }}</div>
      <div :data-clipboard-text="id" class="vhall-room-id-copy" @click="handleCopy">
        <i class="iconfont iconfuzhi"></i>
      </div>
    </div>
    <!---->
    <div class="nopdelay-icon">
      <img
        src="//cnstatic01.e.vhall.com/saas-v3/static/common/img/nodelay-icon/v1.0.0/pc/delay-icon_zh-CN.png"
        alt=""
      />
    </div>
  </div>
</template>
<script>
  import { contextServer } from 'vhall-sass-domain';
  export default {
    name: 'VmpHeaderLeft',
    data() {
      return {
        className: '',
        selected: false,
        disable: false,
        kind: '',
        icon: '',
        text: '',
        subject: '', // 直播名称
        id: '' // 房间id
      };
    },
    created() {
      const { watchInitData } = contextServer.get('roomBaseServer').state;
      this.subject = watchInitData?.webinar?.subject || '';
      this.id = watchInitData?.webinar?.id || '';
    },
    mounted() {
      this.initConfig();
    },
    methods: {
      // 初始化配置
      initConfig() {
        const widget = window.$serverConfig && window.$serverConfig[this.cuid];
        if (widget && widget.options) {
          // eslint-disable-next-line
          if (widget.options.hasOwnProperty('className')) {
            this.className = widget.options.className;
          }
          // eslint-disable-next-line
          if (widget.options.hasOwnProperty('selected')) {
            this.selected = widget.options.selected;
          }
          // eslint-disable-next-line
          if (widget.options.hasOwnProperty('disable')) {
            this.disable = widget.options.disable;
          }
          // eslint-disable-next-line
          if (widget.options.hasOwnProperty('icon')) {
            this.icon = widget.options.icon;
          }
          // eslint-disable-next-line
          if (widget.options.hasOwnProperty('text')) {
            this.text = widget.options.text;
          }
        }
      },
      // 负责roomId
      handleCopy() {
        // this.$vhall_paas_port({
        //   k: 110000,
        //   data: {
        //     business_uid: this.userInfo.third_party_user_id,
        //     user_id: '',
        //     webinar_id: this.webinar_id,
        //     refer: '',
        //     s: '',
        //     report_extra: {},
        //     ref_url: '',
        //     req_url: ''
        //   }
        // });
        const clipboard = new this.$clipboard('.vhall-room-id-copy');
        clipboard.on('success', e => {
          this.$message.success(this.$t('i18n.usual.copySucceeded'));
          clipboard.destroy();
        });
        clipboard.on('error', e => {
          this.$message.error(this.$t('i18n.usual.copyFailed'));
          clipboard.destroy();
        });
      }
    }
  };
</script>
<style lang="less">
  .vmp-header-left {
    display: flex;
    height: 100%;
    margin-left: 20px;
    justify-content: flex-start;
    align-items: center;

    .vhall-room-name {
      font-size: 16px;
      color: #fff;
      line-height: 22px;
      max-width: 720px;
      margin-right: 10px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .vhall-room-id-container {
      height: 20px;
      border-radius: 2px;
      border: 1px solid #979797;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      -webkit-box-orient: horizontal;
      -webkit-box-direction: normal;
      -ms-flex-direction: row;
      flex-direction: row;
      -webkit-box-pack: justify;
      -ms-flex-pack: justify;
      justify-content: space-between;
      padding-right: 3px;
    }

    .vhall-room-id-icon {
      width: 22px;
      height: 20px;
      background: #979797;
      font-size: 12px;
      color: #fff;
      line-height: 19px;
      text-align: center;
    }
    .vhall-room-id {
      width: 100%;
      height: 20px;
      font-size: 12px;
      font-weight: 400;
      color: #999;
      line-height: 20px;
      padding-left: 2px;
      text-align: center;
    }
    .vhall-room-id-copy {
      width: 19px;
      height: 19px;
      color: #999;
      line-height: 20px;
      text-align: center;
      cursor: pointer;
    }
    .nopdelay-icon {
      line-height: 34px;
      margin-left: 4px;

      img {
        display: inline-block;
        width: 100%;
        height: 28px;
      }
    }
  }
</style>
