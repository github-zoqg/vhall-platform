<template>
  <div
    :class="[
      { 'vmp-basic-layout__noHeader': !showHeader },
      { 'vmp-basic-layout__clearscreen': isClearScreen },
      { 'vmp-basic-layout__clearscreen-hide': isClearScreenComplete },
      isConcise || isPortraitLive ? 'vmp-concise-layout' : 'vmp-basic-layout',
      isPortraitLive ? 'isPortraitLive' : '',
      isPortraitLive && webinarType == 5 ? 'isVod' : ''
    ]"
  >
    <van-loading
      v-show="state === 0"
      size="32px"
      type="spinner"
      :vertical="true"
      style="
        position: absolute;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
      "
    >
      {{ $t('common.common_1001') }}
    </van-loading>
    <div class="vmp-basic-container" v-if="state === 1" @click="clearScreen">
      <vmp-air-container cuid="layerRoot"></vmp-air-container>
    </div>
    <msg-tip v-if="state == 2" :liveErrorTip="liveErrorTip"></msg-tip>
    <WeixinAuth ref="weixin_auth" />
  </div>
</template>

<script>
  import { Domain, useRoomBaseServer } from 'middle-domain';
  import roomState from '../headless/room-state.js';
  import bindWeiXin from '../headless/bindWeixin.js';
  import { getQueryString, getVhallReportOs, isWechatCom, isWechat } from '@/app-shared/utils/tool';
  import { getBrowserType } from '@/app-shared/utils/getBrowserType.js';
  import { imgPositionSizeMap } from '@/app-shared/utils/imgModeMap.js';
  import { logRoomInitFailed } from '@/app-shared/utils/report';
  import MsgTip from './MsgTip.vue';
  import { setPage } from '../page-config/index';
  import skins from '@/app-shared/skins/wap';

  import redDefaultBg from '@/app-shared/assets/img/wap/theme/default_red.png';
  import blueDefaultBg from '@/app-shared/assets/img/wap/theme/default_blue.png';
  import goldenDefaultBg from '@/app-shared/assets/img/wap/theme/default_golden.png';

  import WeixinAuth from './weixinAuth.vue';

  export default {
    name: 'Home',
    components: {
      MsgTip,
      WeixinAuth
    },
    data() {
      return {
        state: 0,
        liveErrorTip: '',
        isClearScreenComplete: false
      };
    },
    computed: {
      isClearScreen() {
        return this.$domainStore.state.roomBaseServer.isClearScreen;
      },
      isConcise() {
        let skinInfo = this.$domainStore.state.roomBaseServer.skinInfo;
        let skin_json_wap = {
          style: 1,
          backGroundColor: 2
        };
        if (skinInfo?.skin_json_wap && skinInfo.skin_json_wap != 'null') {
          skin_json_wap = skinInfo.skin_json_wap;
        }
        return skin_json_wap.style == 3;
      },
      // 竖屏直播
      isPortraitLive() {
        return (
          this.$domainStore.state.roomBaseServer.watchInitData?.webinar?.webinar_show_type == 0
        );
      },
      /**
       * 是否显示头部
       */
      showHeader() {
        if (this.embedObj.embed || (this.webinarTag && this.webinarTag.organizers_status == 0)) {
          return false;
        } else {
          return true;
        }
      },
      // 是否为嵌入页
      embedObj() {
        return this.$domainStore.state.roomBaseServer.embedObj;
      },
      // 主办方配置
      webinarTag() {
        return this.$domainStore.state.roomBaseServer.webinarTag;
      },
      // 是否正在直播
      isLiving() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.type == 1;
      },
      // 活动状态（2-预约 1-直播 3-结束 4-点播 5-回放）
      webinarType() {
        return Number(this.$domainStore.state.roomBaseServer.watchInitData.webinar.type);
      }
    },
    watch: {
      isClearScreen(val) {
        this._clearScreenTimer && clearTimeout(this._clearScreenTimer);
        if (val) {
          this._clearScreenTimer = setTimeout(() => {
            this.isClearScreenComplete = true;
          }, 300);
        } else {
          this.isClearScreenComplete = false;
        }
      }
    },
    beforeRouteEnter(to, from, next) {
      // Vue history模式 微信分享IOS无效解决办法---最终章
      const { system } = getBrowserType();
      if (
        system == 'ios' &&
        `${process.env.VUE_APP_ROUTER_BASE_URL}${to.path}` != `${location.pathname}`
      ) {
        location.assign(`${process.env.VUE_APP_ROUTER_BASE_URL}${to.fullPath}`);
      } else {
        next();
      }
    },
    mounted() {
      this.initRoom();
      //消息监听
      useRoomBaseServer().$on('ROOM_SIGNLE_LOGIN', () => {
        this.state = 2;
        this.liveErrorTip = this.$t('message.message_1003');
      });
    },
    beforeDestroy() {
      window.vhallReport && window.vhallReport.report('LEAVE_WATCH', {}, false);
    },
    methods: {
      async initRoom() {
        try {
          if (isWechatCom()) {
            if (sessionStorage.getItem('reloadStatus')) {
              sessionStorage.setItem('reloadStatus', 2);
            } else {
              sessionStorage.setItem('reloadStatus', 1);
              window.location.reload();
            }
          }
          console.log('%c---初始化直播房间 开始', 'color:blue');
          // 初始化直播房间
          let clientType = 'standard';
          // 初始化直播房间
          const roomBaseServer = useRoomBaseServer();
          // 判断是否是嵌入/单视频嵌入
          try {
            const _param = {
              isEmbed: false,
              isEmbedVideo: false
            };
            if (location.pathname.indexOf('embedclient') != -1) {
              _param.isEmbed = true;
              clientType = 'embed';
            }
            if (getQueryString('embed') == 'video') {
              _param.isEmbedVideo = true;
            }
            roomBaseServer.setEmbedObj(_param);
          } catch (e) {
            console.log('嵌入', e);
          }
          const domain = await this.initReceiveLive(clientType);
          if (
            roomBaseServer.state.watchInitData.live_type != 2 &&
            this.$domainStore.state.roomBaseServer.watchInitData.status == 'subscribe'
          ) {
            // 是否跳转预约页
            this.goSubscribePage(clientType);
            return;
          }

          await roomState();

          this.setPageConfig();

          //微信相关设置
          bindWeiXin();
          console.log('%c---初始化直播房间 完成', 'color:blue');

          const roomBaseState = roomBaseServer.state;
          document.title = roomBaseState.languages.curLang.subject;
          let lang = roomBaseServer.state.languages.lang;
          this.$i18n.locale = lang.type;

          // 如果往观看页跳转，需要清除暖场视频缓存
          window.sessionStorage.removeItem('warm_recordId');
          window.sessionStorage.removeItem('recordIds');
          // 初始化数据上报
          console.log('%c------服务初始化 initVhallReport 初始化完成', 'color:blue');
          const currentTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
          // 上报wiki: http://wiki.vhallops.com/pages/viewpage.action?pageId=290882260
          domain.initVhallReport({
            bu: 0,
            user_id: roomBaseServer.state.watchInitData.join_info.join_id,
            webinar_id: this.$route.params.id,
            t_start: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            os: getVhallReportOs(),
            type: 2, //播放平台 2: wap
            entry_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            pf: 10, // wap
            env: ['production', 'pre'].includes(process.env.VUE_APP_SAAS_ENV)
              ? 'production'
              : 'test'
          });

          window.vhallReport.report('ENTER_WATCH');
          // 产品侧数据埋点初始化
          domain.initVhallReportForProduct({
            env: ['production', 'pre'].includes(process.env.VUE_APP_SAAS_ENV)
              ? 'production'
              : 'test', // 环境，区分上报接口域名
            app_id: process.env.VUE_APP_SAAS_ENV === 'production' ? '15df4d3f' : 'fd8d3653', // 产品 app id
            t_start: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            pf: 3, // 客户端类型  web 网页端用 8
            user_id: roomBaseServer.state.watchInitData.join_info.join_id, // C端用户 id（如果是B端用当前用户id）
            webinar_id: this.$route.params.id // 活动 id
          });
          this.state = 1;
          // 获取缓存 判断是否需要进行授权
          this.$refs['weixin_auth'].getUnionid();
          this.addEventListener();
        } catch (err) {
          //上报日志
          logRoomInitFailed({ error: err });
          console.error('---初始化直播房间出现异常--', err);
          console.error(err);
          this.state = 2;
          this.handleErrorCode(err);
        }
      },
      initReceiveLive(clientType) {
        const { id } = this.$route.params;
        const { token, rehearsal } = this.$route.query;
        if (token) {
          localStorage.setItem('token', token);
        }
        let stealth = 0;
        const roomBaseServer = useRoomBaseServer();
        // 本地没有授权记录&&微信环境&&没有关闭微信授权
        if (
          !localStorage.getItem('unionid') &&
          isWechat() &&
          roomBaseServer.state.configList['ui.hide_wechat'] == 1 &&
          !roomBaseServer.state.embedObj.embed
        ) {
          stealth = 1;
        }
        return new Domain({
          plugins: ['chat', 'player', 'doc', 'interaction', 'report', 'questionnaire'],
          requestHeaders: {
            token: clientType === 'embed' ? '' : localStorage.getItem('token') || ''
          },
          initRoom: {
            webinar_id: id, //活动id
            clientType: clientType, //客户端类型
            live_type: rehearsal == 1 ? 2 : 0, // 2 彩排   0 正式
            stealth, //是否创建参会记录
            ...this.$route.query // 第三方地址栏传参
          },
          // 日志上报的参数
          devLogOptions: {
            namespace: 'saas', //业务线
            env: ['production', 'pre'].includes(process.env.VUE_APP_SAAS_ENV)
              ? 'production'
              : 'test', // 环境
            method: 'post' // 上报方式
          }
        });
      },
      addEventListener() {
        const roomBaseServer = useRoomBaseServer();
        roomBaseServer.$on('ROOM_KICKOUT', () => {
          this.handleKickout();
        });
        // 浏览器或者页面关闭时上报
        window.addEventListener('beforeunload', function (e) {
          console.log('home beforeunload------->', e);
          // 离开H5观看端页面
          if (/lives\/watch/.test(window.location.pathname)) {
            window.vhallReport && window.vhallReport.report('LEAVE_WATCH', {}, false);
          }
        });
      },
      handleKickout() {
        this.state = 2;
        this.handleErrorCode({
          code: 512514,
          msg: this.$t('message.message_1007')
        });
      },
      handleErrorCode(err) {
        let currentQuery = location.search;
        let origin =
          process.env.NODE_ENV === 'production'
            ? window.location.origin
            : 'https://t-webinar.e.vhall.com';
        if (err.code == 512522) {
          this.liveErrorTip = this.$t('message.message_1009');
        } else if (err.code == 512541) {
          this.liveErrorTip = this.$t('message.message_1008');
        } else if (
          err.code == 516324 ||
          err.code == 512562 ||
          err.code == 512571 ||
          err.code == 512002
        ) {
          this.liveErrorTip = this.$t('message.message_1004');
        } else if (err.code == 512503 || err.code == 512502) {
          if (this.embedObj?.embed || this.embedObj?.embedVideo) {
            let _embedQuery = location.search;
            _embedQuery =
              _embedQuery.indexOf('nickname=') != -1
                ? _embedQuery.replace('nickname=', 'name=')
                : _embedQuery;
            _embedQuery =
              _embedQuery.indexOf('record_id=') > -1
                ? _embedQuery.replace('record_id=', 'rid=')
                : _embedQuery;
            window.location.href = `${origin}/webinar/inituser/${this.$route.params.id}${_embedQuery}`;
          } else {
            window.location.href = `${origin}/${this.$route.params.id}`;
          }
        } else if (err.code == 512534) {
          // 第三方k值校验失败 跳转指定地址
          window.location.href = err.data.url;
        } else if (err.code == 611001) {
          this.liveErrorTip = '互动初始化失败，' + err.msg;
        } else if (err.code == 511006 || err.code == 511007) {
          if (this.$route.query?.token) {
            this.liveErrorTip = this.$tec(err.code) || err.msg;
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            this.initRoom();
          }
        } else {
          this.liveErrorTip = this.$tec(err.code) || err.msg;
        }
      },
      goSubscribePage(clientType) {
        let pageUrl = '';
        if (clientType === 'embed') {
          pageUrl = '/embedclient';
        }
        window.location.replace(
          `${window.location.origin}${process.env.VUE_APP_ROUTER_BASE_URL}/lives${pageUrl}/subscribe/${this.$route.params.id}${window.location.search}`
        );
      },
      setPageConfig() {
        /*
        {
            "backGroundColor": "1", //主题色 按照数字逻辑 前端枚举
            "pageStyle": "#FB3A32", // 页面风格
            "popStyle": "",// 原有字段 预留
            "background": "", //背景图
            "backgroundSize": "", //背景图大小字符串
            "blurryDegree": "0", // 模糊程度
            "lightDegree": "10",// 光亮程度
            "style": "1",// 风格 按照数字逻辑 前端枚举
            "inavLayout": "CANVAS_ADAPTIVE_LAYOUT_TILED_MODE", //连麦布局
            "inavDocumentLayout": "1", //连麦+演示布局 1 上下 2 左右
            "videoColor": "#1A1A1A",  //视频底色
            "videoBackGround": "", // 视频背景图
            "videoBlurryDegree": "0",  //视频模糊程度
            "videoLightDegree": "10",//视频亮度
            "videoBackGroundSize": "", //视频图片裁剪大小对象
            "chatLayout": "1" //聊天布局 1 上下 2 左右
          }
        */
        const themeMap = {
          1: 'black',
          2: 'white',
          3: 'red',
          4: 'golden',
          5: 'blue'
        };

        const styleMap = {
          1: 'main', // 传统风格
          2: 'fashion', // 时尚风格
          3: 'concise' // 极简风格
        };

        let skin_json_wap = {
          style: 1,
          backGroundColor: 2
        };

        const skinInfo = this.$domainStore.state.roomBaseServer.skinInfo;
        if (skinInfo?.skin_json_wap && skinInfo.skin_json_wap != 'null') {
          skin_json_wap = skinInfo.skin_json_wap;
        }
        // 竖屏直播
        if (this.isPortraitLive) {
          console.log('------竖屏直播------');
          setPage('fullscreen');
          skins.setTheme(skins.themes[`theme_fullScreen_default`]);
          this.drawBody('main', 'black', {});
          return;
        } else if (skin_json_wap?.style == 3) {
          // 设置极简风格页面
          setPage('concise');
        }
        // 设置主题，如果没有就用传统风格白色
        const style = styleMap[skin_json_wap?.style || 1];
        const theme = themeMap[skin_json_wap?.backGroundColor || 2];

        console.log('------设置主题------', `theme_【${style}】_【${theme}】`, skin_json_wap);

        skins.setTheme(skins.themes[`theme_${style}_${theme}`]);
        this.drawBody(style, theme, skin_json_wap);

        // 挂载到window方便调试
        // window.skins = skins;
      },
      drawBody(style, theme, skin) {
        let app = null;
        if (style == 'main') {
          app = document.getElementById('app');
        } else {
          app = document.body;
        }
        if (skin?.wapBackground || skin?.background) {
          app.style.backgroundImage = `url(${skin?.wapBackground || skin?.background})`;
          const styleMap = imgPositionSizeMap[skin?.backgroundSize?.imageCropMode || 2];
          for (let key in styleMap) {
            app.style[key] = styleMap[key];
          }
        } else {
          if (style == 'main' && (theme == 'black' || theme == 'white')) {
            if (theme == 'black') {
              if (this.isPortraitLive) {
                document.body.style.background = `#000`; // 黑色
              } else {
                document.body.style.background = `#262626`; // 黑色
              }
            }
            if (theme == 'white') {
              app.style.background = `rgba(0, 0, 0, 0.06)`;
            }
          } else {
            if (style == 'main' && ['red', 'blue', 'golden'].includes(theme)) {
              app.style.backgroundImage = `url(${
                theme === 'red' ? redDefaultBg : theme == 'blue' ? blueDefaultBg : goldenDefaultBg
              })`;
            } else {
              app.style.backgroundImage = `url(${
                '//cnstatic01.e.vhall.com/common-static/middle/images/saas-wap/theme/skins/' +
                style +
                '_' +
                theme +
                '.png'
              })`;
            }
            app.style.backgroundSize = 'cover';
          }
        }
      },
      clearScreen(e) {
        const roomBaseServer = useRoomBaseServer();
        if (this.isPortraitLive && e.target === e.currentTarget) {
          roomBaseServer.state.isClearScreen = !roomBaseServer.state.isClearScreen;
        }
      }
    }
  };
</script>
