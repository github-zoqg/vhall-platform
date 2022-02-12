<template>
  <div class="vmp-chat-auth-table">
    <div class="vmp-chat-auth-table__list">
      <el-table v-if="list && list.length" :data="list" style="width: 100%" :show-header="false">
        <el-table-column class-name="table-list__column">
          <div
            class="table-list__chat-item"
            slot-scope="{ $index, row }"
            @click="row.isChecked = !row.isChecked"
          >
            <div class="table-list__chat-item__chat-info">
              <div class="chat-info__title">
                <div class="check-box-row" v-if="selectMenuType === 'auth'">
                  <el-checkbox v-model="row.isChecked" @change="selectChange($index)"></el-checkbox>
                </div>
                <span class="chat-info__name">{{ row.context.nickname }}</span>
                <span class="chat-info__tag" v-if="row.is_gag === 'Y'">(已禁言)</span>
                <span class="chat-info__tag" v-if="row.is_kick === 'Y'">(已踢出)</span>
                <span class="chat-info__time">{{ row.date_time }}</span>
              </div>
              <div class="chat-info__content" :class="{ prohibit: selectMenuType === 'prohibit' }">
                {{ row.data }}
              </div>
            </div>
            <div class="chat-info__operate-box" v-if="selectMenuType === 'auth'">
              <span class="handle-item" @click.stop="handleSetBanned(row)">禁言</span>
              <span class="handle-item" @click.stop="handleSetKicked(row)">踢出</span>
              <el-button
                type="success"
                class="confirm-button"
                size="small"
                round
                @click.stop="handleSetPassed(1, row)"
              >
                通过
              </el-button>
              <el-button
                type="danger"
                class="red-button"
                size="small"
                round
                @click.stop="handleSetProhibit(2, row)"
              >
                阻止
              </el-button>
              <el-button
                v-if="options.hasPassAndReplyBtn"
                type="success"
                class="confirm-button"
                size="small"
                round
                @click.stop="handleSetPassed(3, row)"
              >
                通过并回复
              </el-button>
            </div>
          </div>
        </el-table-column>
      </el-table>
      <div v-else-if="!loading && !list.length" class="vmp-chat-auth-table__no-data">
        暂无聊天数据
      </div>
    </div>
    <div class="vmp-chat-auth-table__page-box">
      <el-pagination
        background
        :pager-count="pageConfig.pagerCount"
        :layout="pageConfig.layout"
        :page-size="pageConfig.pageSize"
        :current-page="pageConfig.currentPage"
        :total="pageConfig.total"
        @current-change="changePage"
      ></el-pagination>
    </div>
    <chat-auth-reply-modal ref="chatAuthReplyModal" :options="options"></chat-auth-reply-modal>
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
        default: () => ''
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
      }
    },
    components: {
      chatAuthReplyModal
    },
    data() {
      return {
        //列表数据
        // list: [
        //   {
        //     data: '9999',
        //     date_time: '2022-01-14 15:39:15',
        //     nick_name: '测试人员5',
        //     context: {
        //       role_name: 2,
        //       nick_name: '测试人员5',
        //       nickname: '测试人员5',
        //       avatar: ''
        //     },
        //     type: 'text',
        //     third_party_user_id: '100696',
        //     msg_id: 'msg_aed7b493cf3d4867ab6814f202af1eac',
        //     avatar: '',
        //     image_urls: null
        //   },
        //   {
        //     data: '6666',
        //     date_time: '2022-01-14 15:38:40',
        //     nick_name: '测试人员5',
        //     context: {
        //       role_name: 2,
        //       nick_name: '测试人员5',
        //       nickname: '测试人员5',
        //       avatar: ''
        //     },
        //     type: 'text',
        //     third_party_user_id: '100696',
        //     msg_id: 'msg_f442e8d3a0ca4115980e5ad9040c480b',
        //     avatar: '',
        //     image_urls: null
        //   },
        //   {
        //     data: '7777',
        //     date_time: '2022-01-13 18:14:14',
        //     nick_name: '测试人员5',
        //     context: {
        //       role_name: 2,
        //       nick_name: '测试人员5',
        //       nickname: '测试人员5',
        //       avatar: ''
        //     },
        //     type: 'text',
        //     third_party_user_id: '100696',
        //     msg_id: 'msg_0a531a2f82d748088cace56d14f09a0f',
        //     avatar: '',
        //     image_urls: null
        //   },
        //   {
        //     data: '6666',
        //     date_time: '2022-01-13 18:13:47',
        //     nick_name: '测试人员5',
        //     context: {
        //       role_name: 2,
        //       nick_name: '测试人员5',
        //       nickname: '测试人员5',
        //       avatar: ''
        //     },
        //     type: 'text',
        //     third_party_user_id: '100696',
        //     msg_id: 'msg_456664c553a84ac58e8bbf7c68e95a57',
        //     avatar: '',
        //     image_urls: null
        //   }
        // ],
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
        }
      };
    },
    methods: {
      //todo 初始化方法
      init() {
        //todo 可能需要有获取禁言列表，踢出列表的逻辑
      },
      //获取列表数据
      getList() {},
      //改变页码
      changePage(num) {
        console.log(num);
      },
      //todo 禁言
      handleSetBanned() {},
      //todo 踢出
      handleSetKicked() {},
      //todo 通过
      handleSetPassed(type, info) {
        console.log(info);
        switch (type) {
          case 3:
            this.$refs.chatAuthReplyModal.openModal();
            break;
        }
      },
      //todo 阻止
      handleSetProhibit() {},
      //todo
      selectChange(index) {
        console.log(index);
      }
    }
  };
</script>

<style lang="less">
  .vmp-chat-auth-table {
    @color-blue-hover: #5d6afe;
    @color-red: #fc5659;
    &__list {
      position: relative;
      height: calc(100% - 60px);
      overflow-y: auto;
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
          background: url('../images/no-data.png') no-repeat;
          background-size: cover;
        }
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
            // margin-left: 10px;
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
    &__no-data {
      width: 100%;
      height: 100%;
      text-align: center;
    }
    &__page-box {
      width: 100%;
      margin-top: 30px;
      margin-bottom: 10px;
      text-align: center;
    }
  }
</style>
