<template>
  <div class="publish-wrap">
    <div v-if="roomStatus.show" class="vh-embed-live">
      <!-- 聊天 -->
      <vmp-air-container
        v-if="componentName == 'Chat'"
        :cuid="childrenCom[2]"
        :oneself="true"
      ></vmp-air-container>
      <div v-if="componentName == 'Doc'" class="embed-doc-box" style="height: 100%">
        <!-- 文档 -->
        <vmp-air-container :cuid="childrenCom[0]" :oneself="true"></vmp-air-container>
        <!-- 文档列表 -->
        <vmp-air-container :cuid="childrenCom[1]" :oneself="true"></vmp-air-container>
      </div>
      <div v-if="componentName == 'Tools'" class="h100">
        <!-- 问卷 -->
        <vmp-questionnaire
          ref="questionnaire"
          v-show="tool_component_name == 'questionnaire'"
        ></vmp-questionnaire>
        <!-- 抽奖 -->
        <VmpLotteryLive ref="lottery" v-show="tool_component_name == 'lottery'" />
        <!-- 问答 -->
        <vmp-qa ref="qa" v-show="tool_component_name == 'qa'"></vmp-qa>
        <!-- 签到 -->
        <vmp-sign-live ref="signLive" v-show="tool_component_name == 'signLive'"></vmp-sign-live>
        <!-- 红包 -->
        <VmpRedPacketLive ref="redPacketLive" v-show="tool_component_name == 'redPacketLive'" />
      </div>
    </div>
  </div>
</template>
<script>
  import {
    Domain,
    useRoomBaseServer,
    useEntryformServer,
    useMsgServer,
    useDocServer
  } from 'middle-domain';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';
  import { browserSupport } from '@/packages/app-shared/utils/getBrowserType.js';
  import { QWebChannel } from '@/packages/app-shared/utils/qwebchannel';
  import { getQueryString } from '@/packages/app-shared/utils/tool';
  import { sessionOrLocal } from '@/packages/chat/src/js/utils';
  export default {
    name: 'VmpEmbedClient',
    data() {
      return {
        rootActive: {}, // 活动信息
        roomStatus: {
          show: false
        }, // 房间信息
        il_id: this.$route.params.il_id,
        componentName: '',
        domain: null,
        tool_component_name: '',
        childrenCom: []
      };
    },
    beforeCreate() {
      this.entryformServer = useEntryformServer();
      this.roomBaseServer = useRoomBaseServer();
    },
    async created() {
      this.childrenCom = window.$serverConfig[this.cuid].children;
      console.log('当前客户端嵌入进入');
      if (!browserSupport()) return;
      await this.getGrayConfig();
      if (location.search.includes('assistant_token=')) {
        sessionStorage.setItem('vhall_client_token', getQueryString('assistant_token') || '');
      }
      this.assistantToken = getQueryString('assistant_token');
      this.assistantType = getQueryString('assistantType');
      // 客户端中嵌入的一个第三方采用的是cef框架，用view_type=cef地址栏传递
      this.webviewType = getQueryString('view_type');
      if (this.assistantType == 'doc') {
        this.componentName = 'Doc';
        // TODO: 待优化 dom按时无法获取
        // let dom = document.getElementsByClassName('embed-doc-box')[0];
        // if (!dom) {
        //   let timer = setInterval(() => {
        //     this.$nextTick(() => {
        //       console.log(document.getElementsByClassName('embed-doc-box')[0], 'embed-doc-box');
        //     });
        //     document.getElementsByClassName('embed-doc-box')[0].style.height =
        //       window.innerHeight + 'px';
        //     clearInterval(timer);
        //   }, 500);
        // }
      } else if (this.assistantType == 'chat') {
        this.componentName = 'Chat';
      } else if (this.assistantType == 'tools') {
        this.componentName = 'Tools';
      }
      await this.getUserInfo();
      setTimeout(() => {
        // 给一些时间去初始化  要不不存在dom对象
        this.initAssistantMsg();
      }, 500);
    },

    mounted() {
      console.error('进入到mounted------------------');
      if (this.assistantType == 'doc' && this.webviewType == 'cef') {
        // 新版webview添加退出事件，（客户端内监听不到esc键）
        window.addEventListener('keydown', e => {
          if (e.keyCode == 27) {
            window.JsCallQtMsg(JSON.stringify({ type: 'esc', msg: true }));
          }
        });
      }
    },

    methods: {
      // 灰度
      getGrayConfig() {
        return this.roomBaseServer
          .webinarInitBefore({
            webinar_id: this.il_id
          })
          .then(res => {
            if (res.code == 200 && res.data) {
              window.sessionStorage.setItem(`V3_WAP_US_${this.il_id}`, res.data.user_id);
              const clientTokenVal = this.$clientToken('token');
              if (clientTokenVal) {
                sessionOrLocal.set('token', clientTokenVal, 'localStorage');
                sessionOrLocal.set('platform', this.$clientToken('platform'), 'localStorage');
              } else if (!(this.$clientToken('live_token') || this.$clientToken('liveT'))) {
                // 如果是非免登录的情况，初次进入项目的时候刷新一次 token
                this.$refreshToken();
              }
            } else {
              console.log(`房间-灰度ID-获取活动by用户信息失败~${res.msg}`);
            }
          })
          .catch(e => {
            console.log(`房间-灰度ID-获取活动by用户信息失败~${e}`);
          });
      },
      /*
       * assistantMsg 给予 客户端嵌入使用方法 【注意错误提示也是这个】
       * type 消息类型
       * msg 消息内容
       * error_type 异常提示类型，参数有：info、warning、error （注意： error_type此参数在 type=‘notice_msg'时生效）
       */
      assistantMsg(type, msg, error_type = null) {
        console.log('接受客户上下线消息、前端异常提示等', { type, msg, error_type });
        let messageObj = { type, msg };
        if (type === 'notice_msg' && error_type) {
          messageObj.error_type = error_type;
        }
        if (this.webviewType != 'cef') {
          if (window.bridge) {
            window.bridge.JsCallQtMsg(JSON.stringify(messageObj));
          } else {
            console.error('此方法不存在');
          }
        } else {
          window.JsCallQtMsg(JSON.stringify(messageObj)); // Join,Leave
        }
      },
      initAssistantMsg() {
        window.vhallClientEmbed = this.$refs.vhallClient;
        console.warn('this.$refs.vhallClient', this.$refs.vhallClient, this.$refs);
        if (this.webviewType != 'cef') {
          /* eslint-disable no-new */
          new QWebChannel(window.qt.webChannelTransport, function (channel) {
            if (channel.objects.bridge) {
              window.bridge = channel.objects.bridge;
            }
          });
        }
        window.QtCallFunctionPage = _msg => {
          const msg = Number(_msg);
          console.error('展示当前点击的消息转换-------', _msg);
          // 获取文档dom
          let container = '';
          try {
            container = document.querySelector('.vhall-document-container');
          } catch (error) {
            console.log(error);
          }
          // 判断执行对应方法
          switch (msg) {
            case 1: // 文档
              window.$middleEventSdk?.event?.send(
                boxEventOpitons(this.cuid, 'emiSwitchTo', ['document'])
              );
              break;
            case 2: // 白板
              window.$middleEventSdk?.event?.send(
                boxEventOpitons(this.cuid, 'emiSwitchTo', ['board'])
              );
              break;
            case 3: // 问卷
              this.closeAssistantTools('questionnaire');
              this.$refs.questionnaire.open();
              break;
            case 4: // 抽奖
              this.closeAssistantTools('lottery');
              this.$refs.lottery.open();
              break;
            case 5: // 签到
              this.closeAssistantTools('signLive');
              this.$refs.signLive.openSign();
              break;
            case 6: // 答题
              this.closeAssistantTools('qa');
              // this.$refs.qa.open();
              break;
            case 7: // 隐藏文档
              container && (container.style.opacity = 0);
              break;
            case 8: // 显示文档
              container && (container.style.opacity = 1);
              break;
            case 9: // 文档最小化
              this.exitFullscreen('#vhall-document-container');
              break;
            case 11: // 打开红包
              this.closeAssistantTools('redPacketLive');
              this.$refs.redPacketLive.open();
              break;
            case 12: // 打开红包
              // this.closeAssistantTools()
              // this.openRedPacketPopup()
              // EventBus.$emit('live_start');
              break;
          }
        };
        // 显示/隐藏文档工具栏
        window.QtCallJsChangeDocTool = _msg => {
          const msg = Number(_msg);
          this.$refs.doc.handleAssitantDocTool(msg);
        };
        // 踢出用户回调
        window.QtCallJsKickOut = (msg, bool) => {
          this.$refs.vhallClient.handleAssitantKickout(msg.msg, bool);
        };
        // 文档区域获取焦点
        window.QtCallDocFocus = msg => {
          this.$refs.vhallClient.handleAssitantDocFocus(msg);
        };
      },
      // 关闭其他互动工具
      closeAssistantTools(name) {
        this.tool_component_name = name;
        // 关闭签到弹框
        this.$refs.signLive.signVisible = false;
      },
      // 初始化房间
      async getUserInfo() {
        const _data = {
          webinar_id: this.il_id,
          check_online: 0,
          clientType: 'clientEmbed'
        };
        if (this.$route.query.nickname) {
          _data.nickname = this.$route.query.nickname;
        }
        if (this.$route.query.email) {
          _data.email = this.$route.query.email;
        }

        _data.token = sessionOrLocal.get('token', 'localStorage') || '';

        if (location.search.includes('liveT') || location.search.includes('live_token')) {
          _data.live_token = getQueryString('liveT') || getQueryString('live_token');
          // 只要 queryString 中存在 live_token 就不需要传 token 了
          _data.token = '';
        }

        if (location.search.includes('assistant_token=')) {
          _data.token = sessionStorage.getItem('vhall_client_token');

          if (location.search.includes('token_type=')) {
            // 1: livetoken   0:token
            const isNull = getQueryString('token_type') == 1;
            if (isNull) {
              _data.token = '';
              if (_data.live_token == '' || !_data.live_token) {
                _data.live_token = sessionStorage.getItem('vhall_client_token');
              }
            } else {
              _data.token = sessionStorage.getItem('vhall_client_token');
              _data.live_token = '';
            }
          }
        }

        this.domain = await this.initSendLive(_data);
        const { watchInitData } = this.roomBaseServer.state;

        // 使用活动的标题作为浏览器title显示, 由于发起端不用翻译所以直接用活动下的, 如果后期要翻译需要, 通过翻译里取
        document.title = watchInitData.webinar.subject;

        const mockResult = (this.rootActive = watchInitData);
        this.getTools(mockResult.interact.room_id);
        await useMsgServer().init();
        console.log('%c------服务初始化 msgServer 初始化完成', 'color:blue');

        await useDocServer().init();
        console.log('%c------服务初始化 docServer 初始化完成', 'color:blue');

        // this.roomBaseServer
        //   .initLive({
        //     ..._data
        //   })
        //   .then(async res => {

        console.warn(
          '*************this.rootActive*************',
          this.roomBaseServer.state.watchInitData,
          watchInitData,
          this.rootActive
        );
        sessionStorage.setItem(
          'host_uid',
          JSON.stringify(mockResult.join_info.third_party_user_id)
        );
        sessionStorage.setItem('user', JSON.stringify(mockResult.join_info));
        sessionStorage.setItem('userInfo', JSON.stringify(mockResult.join_info));
        sessionStorage.setItem('vss_token', mockResult.join_info.interact_token);
        sessionStorage.setItem('roomId', mockResult.interact.room_id);
        sessionStorage.setItem('report_extra', JSON.stringify(mockResult.report_data));
        sessionStorage['vhall-vsstoken'] = mockResult.join_info.interact_token;
        sessionStorage.setItem('defaultMainscreenDefinition', mockResult.push_definition || '');
        sessionStorage.setItem('defaultSmallscreenDefinition', mockResult.hd_definition || '');
        sessionStorage.setItem('interact_token', mockResult.interact.interact_token);

        // // 初始化数据上报
        this.initVHallReport();

        // })
        // .catch(err => {
        //   resolve();
        //   this.tipMsg = err.msg;
        //   console.log('catch', err);
        // });
      },
      // 获取房间互动工具状态
      getTools(roomId) {
        return new Promise((resolve, reject) => {
          this.roomBaseServer
            .getInavToolStatus({ room_id: roomId })
            .then(res => {
              res.data.show = true;
              this.roomStatus = res.data;
              resolve();
            })
            .catch(err => {
              this.$message.error(err.msg);
              console.warn(err, 'catch');
              resolve();
            });
        });
      },
      // 初始化直播房间
      initSendLive(params) {
        const { assistant_token } = this.$route.query;
        if (assistant_token) {
          localStorage.setItem('token', assistant_token);
        }
        return new Domain({
          plugins: ['chat', 'player', 'doc', 'interaction', 'questionnaire'],
          requestHeaders: {
            token: localStorage.getItem('token') || ''
          },
          initRoom: params
        });
      },
      initVHallReport() {
        console.log(this.domain, 'this.domain');
        this.domain.initVhallReport(
          {
            user_id: this.rootActive.join_info.join_id,
            webinar_id: this.rootActive.webinar.id,
            t_start: this.$moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            os: 10,
            type: 4,
            entry_time: this.$moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            pf: 7,
            env: ['production', 'pre'].includes(process.env.VUE_APP_NODE_ENV)
              ? 'production'
              : 'test'
          },
          {
            namespace: 'saas', //业务线
            env: 'test', // 环境
            method: 'post' // 上报方式
          }
        );
        window.vhallReport && window.vhallReport.report('ENTER_WATCH');
      }
    }
  };
</script>
<style lang="less" scoped>
  .vh-embed-live {
    height: 100%;
  }
  a {
    text-decoration: none;
  }
  .publish-wrap {
    width: 100%;
    height: 100%;
    min-width: auto;
    overflow: hidden;
  }
  .alert {
    box-sizing: content-box;
  }
  .h100 {
    height: 100%;
  }
</style>
