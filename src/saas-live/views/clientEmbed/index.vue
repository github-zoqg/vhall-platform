<template>
  <chrome v-if="downloadChrome" :type="'master'"></chrome>
  <tip v-else-if="tipMsg" :text="tipMsg"></tip>
  <div v-else class="publish-wrap">
    <div v-if="roomStatus.show">
      <!-- 聊天 -->
      <vmp-chat v-if="componentName == 'Chat'"></vmp-chat>
      <div v-if="componentName == 'Doc'">
        <!-- 文档 -->
        <vmp-doc-une></vmp-doc-une>
        <!-- 文档列表 -->
        <vmp-doc-dlglist></vmp-doc-dlglist>
      </div>
      <div v-if="componentName == 'Tools'">
        <!-- 问卷 -->
        <vmp-questionnaire></vmp-questionnaire>
        <!-- 抽奖 -->
        <!-- 问答 -->
        <vmp-qa></vmp-qa>
        <!-- 签到 -->
        <vmp-sign-live></vmp-sign-live>
      </div>
    </div>
  </div>
</template>
<script>
  import { Domain, useRoomBaseServer, useEntryformServer } from 'middle-domain';
  // import VhallReport from '@/components/VhallReport/main';
  import { browserSupport } from '@/packages/app-shared/utils/tool.js';
  import { QWebChannel } from '@/packages/app-shared/utils/qwebchannel';
  import { getQueryString } from '@/packages/app-shared/utils/tool';
  import { sessionOrLocal } from '@/packages/chat/src/js/utils';
  import chrome from '../Chrome.vue';
  import tip from '../MsgTip.vue';
  // import { useRoomInitGroupServer } from '@/domain';
  export default {
    name: 'Client',
    components: {
      chrome,
      tip
    },
    data() {
      return {
        rootActive: {}, // 活动信息
        roomStatus: {
          show: false
        }, // 房间信息
        roomId: '',
        il_id: this.$route.params.il_id,
        vss_token: '',
        joinId: '',
        third_party_user_id: '',
        params_verify_token: '',
        qaStatus: 0,
        saas_join_id: '',
        domains: {},
        duration: 0,
        permission: [],
        is_interact: '',
        document_id: '',
        cut_record_status: '',
        record_notice: 1,
        userInfo: {},
        shareId: '',
        downloadChrome: !browserSupport(),
        docLowPriority: '', // 文档转换优先级
        recordTip: '', // 是否弹出默认回放弹框
        tipMsg: '', // info接口返回的错误信息
        componentName: ''
      };
    },
    beforeCreate() {
      // this.roomInitGroupServer = useRoomInitGroupServer();
      this.entryformServer = useEntryformServer();
      this.roomBaseServer = useRoomBaseServer();
    },
    async created() {
      if (!browserSupport()) return;
      await this.getGrayConfig();
      if (location.search.includes('assistant_token=')) {
        sessionStorage.setItem('vhall_client_token', getQueryString('assistant_token') || '');
      }
      this.assistantToken = getQueryString('assistant_token');
      this.assistantType = getQueryString('assistantType');
      this.webviewType = getQueryString('view_type');
      if (this.assistantType == 'doc') {
        this.componentName = 'Doc';
      } else if (this.assistantType == 'chat') {
        this.componentName = 'Chat';
      } else if (this.assistantType == 'tools') {
        this.componentName = 'Tools';
      }
      await this.getUserinfo();
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
        return this.entryformServer
          .initGrayBefore({
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
      // 给予 客户端嵌入使用方法
      assistantMsg(type, msg) {
        console.log('接受上下线消息', { type, msg });
        if (this.webviewType != 'cef') {
          if (window.bridge) {
            window.bridge.JsCallQtMsg(JSON.stringify({ type, msg }));
          } else {
            console.error('此方法不存在');
          }
        } else {
          window.JsCallQtMsg(JSON.stringify({ type, msg })); // Join,Leave
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
          this.$refs.vhallClient.handleAssitant(msg);
        };
        // 显示/隐藏文档工具栏
        window.QtCallJsChangeDocTool = _msg => {
          const msg = Number(_msg);
          this.$refs.vhallClient.handleAssitantDocTool(msg);
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
      getUserinfo() {
        return new Promise((resolve, reject) => {
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

          this.roomBaseServer
            .initLive({
              ..._data
            })
            .then(async res => {
              const { watchInitData } = this.roomBaseServer.state;

              const mockResult = (this.rootActive = watchInitData);
              console.warn('*************this.rootActive*************', this.rootActive);
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
              sessionStorage.setItem(
                'defaultMainscreenDefinition',
                mockResult.push_definition || ''
              );
              sessionStorage.setItem(
                'defaultSmallscreenDefinition',
                mockResult.hd_definition || ''
              );
              sessionStorage.setItem('interact_token', mockResult.interact.interact_token);
              this.shareId = mockResult.share_id;
              this.userInfo = mockResult.join_info;
              this.roomId = mockResult.interact.room_id;
              this.vss_token = mockResult.interact.paas_access_token;
              this.third_party_user_id = mockResult.join_info.third_party_user_id;
              this.saas_join_id = mockResult.join_info.join_id;
              this.params_verify_token = ''; // 先注为空  后续进行删除
              this.permission = mockResult.permission;
              this.qaStatus = mockResult.qa_open || 0;
              // 单独增加 static、upload、web  为了减少修改，将这个
              this.domains = {
                ...(mockResult.urls || {}),
                ...{
                  static: mockResult.urls.static_url,
                  upload: mockResult.urls.upload_url,
                  webinar: '',
                  web: mockResult.urls.web_url
                }
              };
              sessionStorage.setItem('vhall_domain', JSON.stringify(this.domains));
              this.duration = mockResult.webinar.live_time;
              this.is_interact = mockResult.webinar.mode == 3 ? 1 : 0; // 做一下判断 ??? mode 直播模式：1-音频、2-视频、3-互动
              this.document_id = mockResult.webinar.document_id;
              this.cut_record_status = mockResult.cut_record_status;
              this.record_notice = mockResult.record_notice || 3; // 设置默认回放视频提示 ???
              this.docLowPriority = mockResult.doc_low_priority || 0; // ???  互动工具
              this.recordTip = mockResult.record_tip;
              await this.getTools(mockResult.interact.room_id);
              // 初始化数据上报
              this.initVHallReport(mockResult);
              console.warn(324234444444444444444444444444444);

              resolve();
            })
            .catch(err => {
              resolve();
              this.tipMsg = err.msg;
              console.log('catch', err);
            });
        });
      },
      // 获取房间互动工具状态
      getTools(roomId) {
        return new Promise((resolve, reject) => {
          this.roomBaseServer
            .getRoomToolStatus({ room_id: roomId })
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
      initSendLive() {
        const { id } = this.$route.params;
        const { token } = this.$route.query;
        if (token) {
          localStorage.setItem('token', token);
        }
        return new Domain({
          plugins: ['chat', 'player', 'doc', 'interaction'],
          requestHeaders: {
            token: localStorage.getItem('token') || '',
            'gray-id': sessionStorage.getItem('initGrayId')
          },
          initRoom: {
            webinar_id: id, //活动id
            clientType: 'send' //客户端类型
          }
        });
      },
      async initVHallReport(roominfo) {
        const domain = await this.initSendLive();
        domain.initVhallReport({
          user_id: this.rootActive.join_info.join_id,
          webinar_id: this.rootActive.webinar.id,
          t_start: this.$moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
          os: 10,
          type: 4,
          entry_time: this.$moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
          pf: 7,
          env: ['production', 'pre'].includes(process.env.VUE_APP_NODE_ENV) ? 'production' : 'test'
        });
        window.vhallReport && window.vhallReport.report('ENTER_WATCH');
      }
    }
  };
</script>
<style lang="less" scoped>
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
</style>
