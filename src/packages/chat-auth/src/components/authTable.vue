<template>
  <div class="vmp-chat-auth-table">
    <div class="vmp-chat-auth-table__list">
      <el-table
        v-if="list && list.length"
        :data="list"
        style="width: 100%"
        :show-header="false"
        max-height="600"
      >
        <el-table-column class-name="table-list__column">
          <template slot-scope="{ $index, row }">
            <div class="table-list__chat-item" @click="row.isChecked = !row.isChecked">
              <div class="table-list__chat-item__chat-info">
                <div class="chat-info__title">
                  <!--                  <div class="check-box-row" v-if="selectMenuType === 'auth'">-->
                  <!--                    <el-checkbox-->
                  <!--                      v-model="row.isChecked"-->
                  <!--                      @change="selectChange($index)"-->
                  <!--                    ></el-checkbox>-->
                  <!--                  </div>-->
                  <span class="chat-info__name">{{ row.nick_name || row.nickname || '' }}</span>
                  <!--                <span class="chat-info__tag" v-if="row.is_gag === 'Y'">(已禁言)</span>-->
                  <!--                <span class="chat-info__tag" v-if="row.is_kick === 'Y'">(已踢出)</span>-->
                  <span
                    class="chat-info__time"
                    v-if="!['muted', 'kickedOut'].includes(selectMenuType)"
                  >
                    {{ row.time || row.date_time }}
                  </span>
                  <span
                    class="chat-info__time"
                    v-if="['muted', 'kickedOut'].includes(selectMenuType)"
                  >
                    {{ row.created_at }}
                  </span>
                </div>
                <div
                  class="chat-info__content"
                  :class="{ prohibit: selectMenuType === 'prohibit' }"
                  v-if="!['muted', 'kickedOut'].includes(selectMenuType)"
                >
                  <template v-if="row.type === 'text'">
                    <p>{{ row.barrageTxt || row.text_content || row.data }}</p>
                  </template>
                  <template v-else-if="row.type === 'image'">
                    <img
                      v-for="(item, ind) in row.image_urls"
                      :src="item"
                      alt=""
                      :key="ind"
                      @click="infoClick(item, row.type)"
                    />
                    <span v-if="row.text_content || row.data">
                      {{ row.barrageTxt || row.text_content || row.data }}
                    </span>
                  </template>
                  <template v-else-if="row.type === 'link'">
                    <a :href="row.link_url" target="_blank">{{ row.link_url }}</a>
                  </template>
                  <template v-else-if="row.type === 'voice'">
                    <audio controls>
                      <source :src="row.voice_url" type="audio/mpeg" />
                      您的浏览器不支持 audio 元素。
                    </audio>
                  </template>
                  <template v-else-if="row.type === 'video'">
                    <p class="video" alt="" @click="infoClick(row.video_url, row.type)">
                      视频消息：{{ row.video_url }}
                    </p>
                  </template>
                </div>
              </div>
              <div
                class="chat-info__operate-box"
                v-if="selectMenuType === 'auth'"
                :class="{ 'operate-disable': operateDisable }"
              >
                <span
                  class="handle-item"
                  @click.stop="handleSetBanned(row)"
                  v-if="showMutedAndKickedBtn(row)"
                >
                  禁言
                </span>
                <span
                  class="handle-item"
                  @click.stop="handleSetKicked(row)"
                  v-if="showMutedAndKickedBtn(row)"
                >
                  踢出
                </span>
                <el-button
                  type="danger"
                  class="confirm-button"
                  size="small"
                  round
                  @click.stop="handleSetPassed(1, row)"
                >
                  通过
                </el-button>
                <el-button
                  type="default"
                  class="red-button"
                  size="small"
                  round
                  @click.stop="handleSetProhibit(row)"
                >
                  阻止
                </el-button>
                <el-button
                  v-if="options.hasPassAndReplyBtn"
                  type="default"
                  class="confirm-button"
                  size="small"
                  round
                  @click.stop="handleSetPassed(3, row)"
                >
                  通过并回复
                </el-button>
              </div>
              <div
                class="chat-info__operate-box"
                v-if="['muted', 'kickedOut'].includes(selectMenuType)"
                :class="{ 'operate-disable': operateDisable }"
              >
                <span
                  class="handle-item"
                  v-if="['muted'].includes(selectMenuType)"
                  @click.stop="handleCancelMuted(row)"
                >
                  取消禁言
                </span>
                <span
                  class="handle-item"
                  v-if="['kickedOut'].includes(selectMenuType)"
                  @click.stop="handleCancelKicked(row)"
                >
                  取消踢出
                </span>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div v-else-if="!loading && !list.length" class="vmp-chat-auth-table__no-data">
        暂无聊天数据
      </div>
    </div>
    <!--    <div class="vmp-chat-auth-table__page-box">-->
    <!--      <el-pagination-->
    <!--        background-->
    <!--        :pager-count="pageConfig.pagerCount"-->
    <!--        :layout="pageConfig.layout"-->
    <!--        :page-size="pageConfig.pageSize"-->
    <!--        :current-page="pageConfig.currentPage"-->
    <!--        :total="pageConfig.total"-->
    <!--        @current-change="changePage"-->
    <!--      ></el-pagination>-->
    <!--    </div>-->
    <chat-auth-reply-modal
      ref="chatAuthReplyModal"
      :options="options"
      @confirm="handlePassedAndReply"
    ></chat-auth-reply-modal>
  </div>
</template>

<script>
  import chatAuthReplyModal from './replyModal';
  export default {
    name: 'VmpChatAuthTable',
    props: {
      //选中的tab
      selectMenuType: {
        type: String,
        default: ''
      },
      //聊天审核组件的配置
      options: {
        type: Object,
        default: () => {
          return {};
        }
      },
      //当前的列表
      list: {
        type: Array,
        default: () => {
          return [];
        }
      },
      //是否开启了聊天审核(开启后才允许做操作)
      operateDisable: {
        type: Boolean,
        default: false
      }
    },
    components: {
      chatAuthReplyModal
    },
    data() {
      return {
        //是否正在加载
        loading: false,
        //分页配置
        pageConfig: {
          currentPage: 1,
          pageSize: 1,
          limit: 10,
          total: 0,
          pagerCount: 7,
          layout: 'prev, pager, next'
        },
        //todo 特殊消息
        msgDetail: {
          url: '',
          type: ''
        },
        //todo 特殊消息模态窗
        isModalShow: false
      };
    },
    computed: {
      //判断未审核的禁言和踢出按钮是否展示
      showMutedAndKickedBtn() {
        return function (item) {
          const { third_party_user_id = '' } = item;
          const { baseChanelInfo = {}, hostUserId = '' } = this.$domainStore.state.chatAuthServer;
          return (
            third_party_user_id != hostUserId &&
            baseChanelInfo.third_party_user_id != third_party_user_id
          );
        };
      }
    },
    methods: {
      //改变页码
      changePage(num) {
        console.log(num);
      },
      //禁言
      handleSetBanned(info = {}) {
        const params = {
          ...this.$domainStore.state.chatAuthServer.roomInfo,
          receive_account_id: info.third_party_user_id,
          status: 1
        };
        this.$emit('messageOperate', { type: 'setMuted', params });
      },
      //踢出
      handleSetKicked(info = {}) {
        const params = {
          ...this.$domainStore.state.chatAuthServer.roomInfo,
          receive_account_id: info.third_party_user_id,
          status: 1
        };
        this.$emit('messageOperate', { type: 'setKicked', params });
      },
      //通过
      handleSetPassed(type, info = {}) {
        //通过则status传1，阻止则传2
        if (type === 1) {
          const params = {
            ...this.$domainStore.state.chatAuthServer.baseChanelInfo,
            msg_id: info.msg_id,
            status: type
          };
          this.$emit('messageOperate', { type: 'setPassed', params });
          return;
        }
        if (type === 3) {
          this.$refs.chatAuthReplyModal.openModal(info);
        }
      },
      //通过并回复
      handlePassedAndReply(params = {}) {
        this.$emit('messageOperate', { type: 'passedAndReply', params });
      },
      //阻止
      handleSetProhibit(info = {}) {
        const params = {
          ...this.$domainStore.state.chatAuthServer.baseChanelInfo,
          msg_id: info.msg_id,
          status: 2
        };
        this.$emit('messageOperate', { type: 'setProhibit', params });
      },
      //todo
      selectChange(index) {
        console.log(index);
      },
      //特殊消息点击 todo 特殊消息处理 如图片预览
      infoClick(url, type) {
        this.msgDetail.url = url;
        this.msgDetail.type = type;
        this.isModalShow = true;
      },
      //取消禁言
      handleCancelMuted(info = {}) {
        this.$emit('cancelMuted', info);
      },
      //取消踢出
      handleCancelKicked(info = {}) {
        this.$emit('cancelKicked', info);
      }
    }
  };
</script>

<style lang="less">
  .vmp-chat-auth-table {
    @color-blue-hover: #5d6afe;
    @color-red: #fb3a32;
    height: 100%;
    &__list {
      position: relative;
      height: calc(100% - 60px);
      overflow-y: auto;
    }
    &__no-data {
      padding-top: 20px;
      position: absolute;
      display: block;
      width: 100%;
      top: 50%;
      margin-top: -90px;
      text-align: center;
      color: #888;
      font-size: 14px;
      &:before {
        content: '';
        display: block;
        width: 120px;
        height: 120px;
        margin: 10px auto;
        background-size: cover;
      }
    }
    .table-list__column {
      padding: 10px;
    }
    .table-list__chat-item {
      font-size: 0;
      &__chat-info {
        font-size: 14px;
        color: #222;
        .chat-info__title {
          position: relative;
          .check-box-row {
            display: inline-block;
            margin: -3px 22px 0 -10px;
            vertical-align: middle;
          }
          .chat-info__time {
            color: #888;
            position: absolute;
            right: 0;
          }
          .chat-info__name {
            display: inline-block;
            position: relative;
            font-weight: bold;
          }
          .chat-info__tag {
            color: @color-red;
            margin-left: 10px;
          }
        }
        .chat-info__content {
          display: inline-block;
          max-width: calc(100% - 20px);
          padding-left: 30px;
          padding-bottom: 5px;
          line-height: 20px;
          font-size: 14px;
          white-space: break-spaces;
          &.prohibit {
            padding-left: 0;
          }
          img {
            display: inline-block;
            width: 30px;
            cursor: pointer;
            margin-right: 10px;
          }

          .video {
            cursor: pointer;
          }
        }
      }
      .chat-info__operate-box {
        font-size: 14px;
        text-align: right;
        .el-button--danger,
        .el-button--success {
          color: #fff;
        }
        .handle-item {
          display: inline-block;
          margin-left: 15px;
          color: #888;
          vertical-align: middle;
          &:nth-child(2) {
            margin-right: 10px;
          }
          &:hover {
            cursor: pointer;
            color: @color-blue-hover;
          }
        }
      }
    }
    &__page-box {
      width: 100%;
      margin-top: 30px;
      margin-bottom: 10px;
      text-align: center;
    }
    .operate-disable {
      pointer-events: none;
      opacity: 0.6;
      user-select: none;
    }
  }
</style>
