<template>
  <div class="vmp-chat-user-control-wrap" v-show="isShow" @click.capture="isShow = false">
    <div class="vmp-chat-user-control" :style="style">
      <div class="vmp-chat-user-control__item" @click="reply(count)">
        <i></i>
        <span>回复</span>
      </div>
      <div
        :class="
          this.atList.find(u => u.nickname === this.nickname)
            ? 'vmp-chat-user-control__item disabled'
            : 'vmp-chat-user-control__item'
        "
        @click="atUser(accountId)"
      >
        <i></i>
        <span>@TA</span>
      </div>
      <div class="vmp-chat-user-control__item" @click="deleteMsg(count)" v-if="godMode">
        <i></i>
        <span>删除</span>
      </div>
      <div class="vmp-chat-user-control__item" @click="setBanned" v-if="godMode && !isInGroup">
        <i></i>
        <span>{{ userStatus.is_banned ? '取消禁言' : '禁言' }}</span>
      </div>
      <div class="vmp-chat-user-control__item" @click="setKicked" v-if="godMode && !isInGroup">
        <i></i>
        <span>{{ userStatus.is_kicked ? '取消踢出' : '踢出' }}</span>
      </div>
    </div>
  </div>
</template>
<script>
  import EventBus from '../js/Events.js';
  import dataReportMixin from '@/packages/chat/src/mixin/data-report-mixin';
  import { useChatServer, useRoomBaseServer, useGroupServer } from 'middle-domain';

  export default {
    mixins: [dataReportMixin],
    props: {
      roomId: {
        required: true
      },
      userId: {
        required: true
      },
      reply: {
        required: true
      },
      atUser: {
        required: true
      },
      atList: {
        required: true
      }
    },
    data() {
      return {
        isShow: false,
        style: {},
        userStatus: {
          is_banned: null,
          is_kicked: null
        },
        nickname: '',
        godMode: false,
        assistantType: ''
      };
    },
    beforeCreate() {
      this.chatServer = useChatServer();
      this.roomBaseServer = useRoomBaseServer();
      this.groupServer = useGroupServer();
    },
    computed: {
      // 是否在小组中
      isInGroup() {
        return !!this.groupServer.state.groupInitData?.isInGroup;
      }
    },
    created() {
      this.assistantType = this.$route.query.assistantType;
    },
    mounted() {
      //todo 待改为信令
      EventBus.$on('set_person_status_in_chat', async (el, accountId, count, nickname) => {
        const roleName = this.roomBaseServer.state.watchInitData.join_info.role_name;
        if (accountId == this.userId) return; // 不能点击自己
        if (roleName == 3 || roleName == 4 || roleName == 1) {
          this.accountId = accountId;
          this.count = count;
          const boundedList = await this.getUserStatus();
          this.userStatus.is_banned = boundedList[0].data.list.some(user => {
            return user.account_id == accountId;
          });
          this.userStatus.is_kicked = boundedList[1].data.list.some(user => {
            return user.account_id == accountId;
          });
          this.isShow = true;
          this.godMode = [1, '1', 3, '3', 4, '4'].includes(roleName);
          this.calculate(el);
          this.nickname = nickname;
          this.roleName = roleName;
        }
      });
      //todo 待改为信令
      // 监听客户端踢出操作
      EventBus.$on('assistantKickoutCallback', msg => {
        if (msg.type == 0) return;
        this.chatServer
          .setKicked({
            room_id: this.roomId,
            receive_account_id: msg.data.room_join_id,
            status: 1
          })
          .then(() => {
            EventBus.$emit('kicked_in_chat', { nextStatus: 1, accountId: this.accountId });
          });
      });
    },
    methods: {
      deleteMsg(count) {
        this.$emit('deleteMsg', count);
      },
      calculate(el) {
        const rect = el.getBoundingClientRect();
        const clientHeight = this.getClientHeight();
        const modalHeight = this.godMode ? 152 : 68;
        if (clientHeight - rect.bottom < modalHeight) {
          this.style = {
            top: `${rect.top - modalHeight}px`,
            left: `${rect.left}px`
          };
        } else {
          this.style = {
            top: `${rect.top + rect.height + 1}px`,
            left: `${rect.left}px`
          };
        }
      },
      /**
       * todo domain提供的服务 得到用户状态是否被禁言/踢出
       */
      getUserStatus() {
        return Promise.all([
          this.chatServer.getBannedList({ room_id: this.roomId }),
          this.chatServer.getKickedList({ room_id: this.roomId })
        ]);
      },
      /**
       * 禁言/取消禁言
       * todo domain提供的服务
       */
      setBanned() {
        const nextStatus = this.userStatus.is_banned ? 0 : 1;
        const params = {
          receive_account_id: this.accountId,
          status: nextStatus,
          room_id: this.roomId
        };
        this.chatServer.setBanned(params);
        this.buriedPointReport(110122, {
          business_uid: this.userId,
          webinar_id: this.$route.params.il_id
        });
      },
      /**
       * 踢出/取消踢出
       * todo domain提供的服务
       */
      setKicked() {
        const nextStatus = this.userStatus.is_kicked ? 0 : 1;
        const confirmText = nextStatus ? '您确定要执行踢出操作？' : '您确定要执行取消踢出操作？';
        const data = {
          receive_account_id: this.accountId,
          status: nextStatus,
          room_id: this.roomId
        };
        if (this.assistantType) {
          return EventBus.$emit('assistantKickout', {
            ...data,
            confirmText,
            roleName: this.roleName
          });
        }
        this.$confirm(confirmText, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          customClass: 'zdy-message-box',
          cancelButtonClass: 'zdy-confirm-cancel'
          // type: 'info',
          // center: true
        })
          .then(() => {
            const params = {
              room_id: this.roomId,
              receive_account_id: this.accountId,
              status: nextStatus
            };
            this.chatServer.setKicked(params).then(() => {
              this.buriedPointReport(110123, {
                business_uid: this.userId,
                webinar_id: this.$route.params.il_id
              });
              EventBus.$emit('kicked_in_chat', { nextStatus, accountId: this.accountId });
            });
          })
          .catch(() => {});
      },
      /**
       * 获取窗口可视化区域高度
       */
      getClientHeight() {
        let clientHeight = 0;
        if (document.body.clientHeight && document.documentElement.clientHeight) {
          clientHeight =
            document.body.clientHeight < document.documentElement.clientHeight
              ? document.body.clientHeight
              : document.documentElement.clientHeight;
        } else {
          clientHeight =
            document.body.clientHeight > document.documentElement.clientHeight
              ? document.body.clientHeight
              : document.documentElement.clientHeight;
        }
        return clientHeight;
      }
    }
  };
</script>
<style lang="less">
  .vmp-chat-user-control-wrap {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: transparent;
    z-index: 900;
    .vmp-chat-user-control {
      position: absolute;
      width: 96px;
      padding: 6px 0;
      background-color: #ffffff;
      border-radius: 4px;
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
      overflow: hidden;
      box-sizing: border-box;
      cursor: pointer;
      &__item {
        font-size: 14px;
        height: 28px;
        color: #666666;
        text-align: left;
        line-height: 28px;
        padding: 0;
        padding-left: 10px;
        user-select: none;
        &.disabled {
          color: #c3c3c3;
          &:hover {
            color: #c3c3c3;
            background-color: #ffffff;
            cursor: not-allowed;
          }
        }
        &:hover {
          color: #ffffff;
          background-color: #fb3a32;
        }
      }
    }
  }
</style>
