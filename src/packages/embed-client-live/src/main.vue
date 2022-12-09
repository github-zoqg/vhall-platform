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
        <div v-show="tool_component_name == 'questionnaire'">
          <vmp-questionnaire ref="questionnaire"></vmp-questionnaire>
        </div>

        <!-- 抽奖 -->
        <div v-show="tool_component_name == 'lottery'">
          <vmp-air-container cref="lottery" :cuid="childrenCom[4]" :oneself="true" />
        </div>

        <!-- 问答 -->
        <div v-show="tool_component_name == 'qa'">
          <vmp-air-container cref="qa" :cuid="childrenCom[3]" :oneself="true"></vmp-air-container>
        </div>
        <!-- 签到 -->
        <div v-show="tool_component_name == 'signLive'">
          <vmp-air-container cref="signLive" :cuid="childrenCom[5]" :oneself="true" />
        </div>

        <!-- 红包 -->
        <div v-show="tool_component_name == 'redPacketLive'">
          <vmp-air-container cref="redPacketLive" :cuid="childrenCom[6]" :oneself="true" />
        </div>

        <!-- 计时器 -->
        <div v-show="tool_component_name == 'timerSetLive'">
          <vmp-air-container cref="timerSetLive" :cuid="childrenCom[7]" :oneself="true" />
        </div>
        <div v-show="tool_component_name == 'timerSetLive'">
          <vmp-air-container cref="timerLive" :cuid="childrenCom[8]" :oneself="true" />
        </div>
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
  import { browserSupport } from '@/app-shared/utils/getBrowserType.js';
  import { QWebChannel } from '@/app-shared/utils/qwebchannel';
  import { getQueryString } from '@/app-shared/utils/tool';
  import { sessionOrLocal } from '@/packages/chat/src/common/js/utils';
  import { clientMixin } from '../mixins/clientMixin';
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';
  export default {
    name: 'VmpEmbedClient',
    mixins: [clientMixin],
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
        childrenCom: [],
        disTimer: false
      };
    },
    beforeCreate() {
      this.entryformServer = useEntryformServer();
      this.roomBaseServer = useRoomBaseServer();
    },
    async created() {
      this.childrenCom = window.$serverConfig[this.cuid].children;
      console.log('当前客户端嵌入进入', this.childrenCom);
      if (!browserSupport()) return;
      await this.getGrayConfig();
      if (location.search.includes('assistant_token=')) {
        sessionStorage.setItem('vhall_client_token', getQueryString('assistant_token') || '');
      }
      this.assistantToken = getQueryString('assistant_token');
      this.assistantType = getQueryString('assistantType');
      //初始化房间信息
      await this.initRoomInfo();
      // 客户端中嵌入的一个第三方采用的是cef框架，用view_type=cef地址栏传递
      this.webviewType = getQueryString('view_type');
      if (this.assistantType == 'doc') {
        this.componentName = 'Doc';
      } else if (this.assistantType == 'chat') {
        this.componentName = 'Chat';
      } else if (this.assistantType == 'tools') {
        this.componentName = 'Tools';
      }
      // setTimeout(() => {
      //   // 给一些时间去初始化  要不不存在dom对象

      // }, 500);
      this.$nextTick(() => {
        this.initAssistantMsg();
      });
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
      handleAssitant(type) {
        // 获取文档dom
        let container = '';
        try {
          container = document.querySelector('.vhall-document-container');
        } catch (error) {
          console.log(error);
        }
        switch (type) {
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
            this.showAssistantTools('questionnaire');
            this.$refs.questionnaire.open();
            break;
          case 4: // 抽奖
            this.showAssistantTools('lottery');
            this.$refs.lottery.open();
            break;
          case 5: // 签到
            this.showAssistantTools('signLive');
            this.$refs.signLive.openSign();
            break;
          case 6: // 答题
            this.showAssistantTools('qa');
            this.$refs.qa.handleQAPopup();
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
            this.showAssistantTools('redPacketLive');
            this.$refs.redPacketLive.open();
            break;
          case 12: // 通知文档调用doc.sdk.start
            // EventBus.$emit('live_start');
            break;
          // case 13: // 退出全屏
          //   break;
          // case 14: // 全屏
          //   break;
          case 15: // 计时器
            this.showAssistantTools('timerSetLive');
            window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenTimerSet'));
            break;
        }
      },
      // 展示当前互动工具
      showAssistantTools(name) {
        this.$refs.questionnaire.close();
        this.$refs.lottery.close();
        this.$refs.signLive.closeSign();
        this.$refs.qa.close();
        // this.$refs.redPacketLive.close();
        this.tool_component_name = name;
      },
      initAssistantMsg() {
        // window.vhallClientEmbed = this.$refs.vhallClient;
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
          let msg = Number(_msg);
          console.error('展示当前点击的消息转换-------', _msg);
          // 判断执行对应方法
          this.handleAssitant(msg);
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

      // 初始化房间
      async initRoomInfo() {
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
        const promiseList = [
          // 获取房间互动工具状态
          this.getTools(mockResult.interact.room_id),
          this.roomBaseServer.getCustomRoleName()
        ];
        await Promise.all(promiseList);
        console.log('%c------获取互动工具状态完成', 'color:blue');
        await useMsgServer().initMaintMsg({ hide: 1 });
        console.log('%c------服务初始化 msgServer 初始化完成', 'color:blue');
        if (this.assistantType == 'doc') {
          await useDocServer().init();
        }
        console.log('%c------服务初始化 docServer 初始化完成', 'color:blue');
        //初始化嵌入监听
        this.initListener();
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
      // 初始化直domain
      initSendLive(params) {
        const { assistant_token } = this.$route.query;
        if (assistant_token) {
          localStorage.setItem('token', assistant_token);
        }
        const plugins = ['chat'];
        if (this.assistantType == 'doc') {
          plugins.push('doc');
        } else if (this.assistantType == 'tools') {
          plugins.push('interaction', 'questionnaire', 'exam');
        }
        return new Domain({
          plugins,
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
            t_start: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            os: 10,
            type: 4,
            entry_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
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
      },
      // 更改禁用状态
      changeStatus(data, status) {
        console.log(data, status, 'data, status');
        // 举例： disTimer
        this[data] = status;
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
