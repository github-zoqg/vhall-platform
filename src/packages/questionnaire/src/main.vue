<template>
  <div>
    <el-dialog
      :visible.sync="dialogVisible"
      width="720px"
      custom-class="questionnaire-dialog"
      lock-scroll
      :close-on-click-modal="false"
    >
      <!-- title -->
      <header slot="title" class="dialog-title">
        <i
          v-if="!showQuestionnaireTable"
          class="vh-iconfont vh-line-arrow-left back-btn"
          style="cursor: pointer"
          @click="initPage"
        />
        问卷
      </header>
      <!-- body -->
      <section class="question__content">
        <!-- table -->
        <div class="vhall-question__content" v-show="showQuestionnaireTable">
          <div class="show-no-list" v-if="noQuestionnaire">
            <div class="text-center show-no-msg">
              <span class="no-img"><img src="./images/no-create@2x.png" alt="" /></span>
              <p class="no-msg">您还没有创建过问卷！</p>
              <p class="list-create" @click="createQuestion('')">创建问卷</p>
            </div>
          </div>
          <template v-else>
            <div class="vhall-question__content-search">
              <el-button class="create" type="danger" round @click="createQuestion(null)">
                创建问卷
              </el-button>
              <el-input
                v-model="keyword"
                placeholder="请输入问卷名称"
                style="width: 220px; float: right"
                @keyup.enter.native="queryQuestionnaireList"
                @clear="clearKeyword"
                clearable
              >
                <i
                  slot="prefix"
                  class="el-icon-search el-input__icon"
                  style="cursor: pointer; line-height: 36px"
                  @click="clearKeyword"
                ></i>
              </el-input>
            </div>
            <div class="popbody">
              <el-table
                :data="questionnaireList"
                v-loading="loading"
                style="width: 100%"
                max-height="400"
              >
                <!-- 没有搜到数据 -->
                <div slot="empty" class="show-no-msg">
                  <span v-if="!loading" class="no-img">
                    <img src="./images/no-search@2x.png" alt="" />
                  </span>
                  <p class="no-msg">暂未搜索到您想要的内容！</p>
                </div>
                <el-table-column prop="title" width="220" label="问卷名称"></el-table-column>
                <el-table-column
                  prop="topic_num"
                  width="60"
                  align="center"
                  label="题数"
                ></el-table-column>
                <el-table-column prop="updated_at" label="更新时间"></el-table-column>
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <el-button type="text" @click="publish(scope.row)">推送</el-button>
                    <el-button type="text" @click="prevQuestion(scope.row.question_id)">
                      预览
                    </el-button>
                    <el-button type="text" @click="editQuestion(scope.row.question_id)">
                      编辑
                    </el-button>
                    <el-dropdown
                      style="margin-left: 10px"
                      trigger="click"
                      @click.prevent.stop
                      @command="handleCommand"
                      @visible-change="dropDownVisibleChange(scope.row)"
                    >
                      <el-button type="text">更多</el-button>
                      <el-dropdown-menu
                        style="text-align: center"
                        class="qn-more__dropdown"
                        slot="dropdown"
                      >
                        <el-dropdown-item v-if="scope.row.publish === 1" command="data">
                          数据
                        </el-dropdown-item>
                        <el-dropdown-item command="copy">复制</el-dropdown-item>
                        <el-dropdown-item command="del">删除</el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </div>
        <section
          class="qn-server-warp"
          :class="{
            preview: prevQuestionnaireId
          }"
          v-show="!showQuestionnaireTable"
        >
          <div id="qn-server-box"></div>
          <el-button class="publish-btn" round v-if="prevQuestionnaireId">发布</el-button>
        </section>
      </section>
    </el-dialog>
    <el-dialog
      :visible.sync="saveDialogVisible"
      custom-class="save-dialog"
      width="400px"
      title="提示"
    >
      <div class="async__ctx">
        <p>保存问卷同时共享至资料管理，便于其他活动使用？</p>
        <el-checkbox v-model="shareQuestionnaire">共享到资料管理</el-checkbox>
      </div>
      <div class="async__footer" slot="footer">
        <el-button
          type="primary"
          :disabled="!saveDialogVisible"
          @click="saveQuestionnaire(true)"
          round
        >
          确 定
        </el-button>
        <el-button @click="saveQuestionnaire(false)" round>取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import { useQuestionnaireServer, useChatServer } from 'middle-domain';
  const QUESTIONNAIRE_PUSH = 'questionnaire_push'; // 推送消息
  export default {
    name: 'VmpQuestionnaire',
    provide() {
      return {
        questionnaireServer: this.questionnaireServer
      };
    },
    data() {
      return {
        dialogVisible: false, // 顶层弹窗是否显示
        showQuestionnaireTable: true, // 显示问卷列表
        firstLoad: false, // 完成首次列表数据加载(防止首次加载闪动画面)
        loading: false, // 列表请求加载中
        questionnaireList: [], // 问卷列表
        selectedQuestionnarie: null, // 为下拉框交互中转变量
        queryParams: {
          // 问卷列表搜索参数
          limit: 10,
          pos: 0,
          pageNum: 1,
          keyword: ''
        },
        keyword: '', //input的value;
        questionnaireCreateInfo: null, // 已创建弹窗的中转
        saveDialogVisible: false, // 同步问卷弹窗
        shareQuestionnaire: true, // 同步到管理
        prevQuestionnaireId: false, // 显示预览状态的相关UI
        saving: false //保存中的状态
      };
    },
    computed: {
      noQuestionnaire() {
        // 未创建过问卷
        return (
          this.firstLoad &&
          !this.questionnaireList.length &&
          this.queryParams.keyword === '' &&
          !this.loading
        );
      }
    },
    methods: {
      open() {
        if (!this.questionnaireServer) {
          this.initSDK();
        }
        this.initPage();
        this.dialogVisible = true;
      },
      initPage() {
        this.firstLoad = false;
        this.queryParams = {
          // 问卷列表搜索参数
          limit: 10,
          pos: 0,
          pageNum: 1,
          keyword: ''
        };
        this.showQuestionnaireTable = true;
        this.queryQuestionnaireList();
      },
      initSDK() {
        this.questionnaireServer = useQuestionnaireServer({
          uploadUrl: process.env.VUE_APP_BASE_URL,
          creatSelector: '#qs-create-box',
          mode: 'live'
        });
        this.initEvent();
      },
      initEvent() {
        this.questionnaireServer.$on(VHall_Questionnaire_Const.EVENT.CREATE, data => {
          this.questionnaireCreateInfo = data;
          this.saveDialogVisible = true;
          this.shareQuestionnaire = true;
          this.saving = false;
        });
        this.questionnaireServer.$on(VHall_Questionnaire_Const.EVENT.UPDATE, res => {
          if (res.code === 200) {
            this.initPage();
          }
        });
        this.questionnaireServer.$on(QUESTIONNAIRE_PUSH, msg => {
          const join_info = this.$domainStore?.state?.roomBaseServer?.watchInitData?.join_info;
          const text = this.$getRoleName(msg.room_role);
          useChatServer().addChatToList({
            nickname: '问卷',
            avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
            content: {
              text_content: `${text}发起了问卷`,
              questionnaire_id: msg.questionnaire_id
            },
            roleName: join_info.role_name,
            type: msg.type
          });
        });
      },
      /**
       * @description 条件搜索列表
       */
      queryQuestionnaireList() {
        this.loading = true;
        this.queryParams.keyword = this.keyword;
        this.questionnaireServer
          .queryQuestionnaireList({
            keyword: this.queryParams.keyword,
            limit: this.queryParams.limit,
            pos: this.queryParams.pos
          })
          .then(res => {
            this.questionnaireList = res.data.list || [];
            this.loading = false;
            this.firstLoad = true;
          });
      },
      /**
       * @description 清空关键字搜索
       */
      clearKeyword() {
        this.queryParams = {
          limit: 10,
          pos: 0,
          pageNum: 1,
          keyword: ''
        };
        this.queryQuestionnaireList();
      },
      /**
       * @description 创建问卷
       */
      createQuestion() {
        const selector = '#qn-server-box';
        this.showQuestionnaireTable = false;
        this.prevQuestionnaireId = null;
        this.questionnaireServer.renderCreatQuestionnaire(selector);
      },
      /**
       * @description 编辑问卷
       */
      editQuestion(id) {
        const selector = '#qn-server-box';
        this.showQuestionnaireTable = false;
        this.prevQuestionnaireId = null;
        this.questionnaireServer.renderCreatQuestionnaire(selector, id);
      },
      /**
       * @description 预览问卷
       */
      prevQuestion(id) {
        const selector = '#qn-server-box';
        this.showQuestionnaireTable = false;
        this.prevQuestionnaireId = id;
        this.questionnaireServer.renderQuestionnaire4Watch(selector, id);
      },
      /**
       * @description 保存问卷
       */
      saveQuestionnaire(confirm = false) {
        this.saveDialogVisible = false;
        this.showQuestionnaireTable = true;
        this.saving = true;
        this.questionnaireServer
          .saveQuestionnaire(this.questionnaireCreateInfo, this.shareQuestionnaire && confirm)
          .then(res => {
            console.log('saveQuestionnaire', res);
            if (confirm) {
              // 确认同步才需要弹窗提示
              this.$message({
                message: res.code == 200 ? '同步成功' : '同步失败',
                showClose: true,
                type: res.code == 200 ? 'success' : 'error',
                customClass: 'zdy-info-box'
              });
            }
            if (res.code === 200) {
              // 数据有延迟
              const st = setTimeout(() => {
                this.queryQuestionnaireList();
                clearInterval(st);
              }, 1000);
            }
          })
          .finally(() => {
            this.saving = false;
          });
      },

      // 下拉框显示是, 中转当前选中变量
      dropDownVisibleChange(row) {
        this.selectedQuestionnarie = row;
      },
      handleCommand(command) {
        if (!this.selectedQuestionnarie) return false;
        const id = this.selectedQuestionnarie.question_id;
        switch (command) {
          case 'data':
            this.goDetail(this.selectedQuestionnarie);
            break;
          case 'copy':
            this.copy(id);
            break;
          case 'del':
            this.delete(id);
            break;
        }
      },
      // 查看数据
      goDetail(questionnaireItem) {
        const watchInitData = this.$domainStore.state.roomBaseServer.watchInitData;
        const { webinar, interact } = watchInitData;
        window.open(
          `/v3/live/lookSingleQuestion/${webinar.id}?surveyId=${questionnaireItem.question_id}&subject=${questionnaireItem.title}&roomId=${interact.room_id}`
        );
      },
      // 复制功能
      copy(id) {
        this.questionnaireServer.copyQuestionnaire(id).then(res => {
          this.$message({
            type: res.code == 200 ? 'success' : 'error',
            message: res.msg
          });
          if (res.code == 200) {
            this.queryQuestionnaireList();
          }
        });
      },
      // 删除
      delete(id) {
        this.$confirm('删除后，此问卷将无法使用，确认删除？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          customClass: 'zdy-message-box',
          lockScroll: false,
          cancelButtonClass: 'zdy-confirm-cancel'
        }).then(() => {
          this.questionnaireServer.deleteQuestionnaire(id).then(res => {
            this.$message({
              type: res.code == 200 ? 'success' : 'error',
              message: res.msg
            });
            if (res.code == 200) {
              this.queryQuestionnaireList();
            }
          });
        });
      },
      // 推送
      publish(questionnaireItem) {
        const watchInitData = this.$domainStore.state.roomBaseServer.watchInitData;
        const { webinar } = watchInitData;
        if (webinar.type !== 1) {
          return this.$message({
            type: 'warning',
            message: '请在直播开始后使用'
          });
        }
        this.questionnaireServer.publishQuestionnaire(questionnaireItem.question_id).then(res => {
          if (res.code === 200) {
            this.$message({
              type: 'success',
              message: res.msg
            });
            questionnaireItem.publish = 1;
          }
        });
      }
    }
  };
</script>
<style lang="less">
  .questionnaire-dialog {
    .el-dialog__body {
      // padding: 10px 20px 20px;
      padding: 0;
      height: 500px;
      overflow: auto;
      background-color: #f7f7f7;
    }
  }

  .el-dropdown-menu {
    &.qn-more__dropdown {
      background-color: #fff;
      border: 1px solid #ebeef5;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

      .el-dropdown-menu__item {
        &:focus,
        &:not(.is-disabled):hover {
          color: #606266;
          background-color: #ecf5ff;
        }
      }
      &.el-popper[x-placement^='bottom'] {
        margin-top: 0;
      }
      &.el-popper[x-placement^='bottom'] .popper__arrow {
        border-bottom-color: transparent;
      }
      &.el-popper[x-placement^='bottom'] .popper__arrow::after {
        border-bottom-color: #fff;
      }
      &.el-popper[x-placement^='top'] .popper__arrow {
        border-top-color: transparent;
      }
      &.el-popper[x-placement^='top'] .popper__arrow::after {
        border-top-color: #fff;
      }
    }
  }
</style>
<style lang="less">
  .save-dialog {
    .el-dialog__body {
      min-height: initial;
    }
  }
  .dialog-title {
    position: relative;
    .back-btn {
      position: absolute;
      top: 4px;
      left: -20px;
    }
  }

  .vhall-question-box {
    background: #fff;
    padding-bottom: 10px;
    .q-wrap .q-title {
      font-size: 26px;
    }
  }
  .el-popper[x-placement^='bottom'] {
    margin-top: -10px;
  }
  /*复选选中效果重置*/
  .el-checkbox__input.is-checked .el-checkbox__inner,
  .el-checkbox__input.is-indeterminate .el-checkbox__inner {
    background-color: #fb3a32 !important;
    border-color: #fb3a32 !important;
  }
  .el-checkbox__inner:hover {
    border-color: #fb3a32;
  }
  .el-checkbox__input.is-focus .el-checkbox__inner {
    border-color: #dcdfe6;
  }
  .el-checkbox__input.is-checked.is-focus .el-checkbox__inner {
    background-color: #fb3a32;
    border-color: #fb3a32;
  }

  /*单选选中效果重置*/
  .el-radio__input.is-checked .el-radio__inner {
    background-color: #fb3a32;
    border-color: #fb3a32;
  }
  .el-radio__inner:hover {
    border-color: #fb3a32;
  }
  /* 日期选择效果重置*/
  .el-date-table td.today span {
    color: #fb3a32;
  }
  .el-date-table td.available:hover {
    color: #fb3a32;
  }
  .el-date-table td.current:not(.disabled) span {
    color: #fff;
    background-color: #fb3a32 !important;
  }

  .el-dropdown-menu {
    background-color: #fff;
  }
  .el-dropdown-menu__item:not(.is-disabled):hover {
    background-color: #f7f7f7;
    color: #1a1a1a;
  }
  .qn-server-warp {
    padding: 10px 20px 20px;
    background: #f7f7f7;
    &.preview {
      padding: 0;
      background: #fff;
      .q-btns {
        display: none; // 隐藏提交问卷
      }
    }
  }

  .publish-btn {
    display: block;
    width: 160px;
    border: none;
    margin: 40px auto;
    background-color: #fb3a32;
    color: #fff !important;
  }

  .async__body {
    background: #fff;
    padding: 10px 32px 24px;
    p {
      font-size: 14px;
    }
    .async__ctx {
      .el-checkbox {
        padding: 8px 0 !important;
      }
      .el-checkbox__label {
        color: #1a1a1a;
      }
      .el-checkbox__input.is-checked .el-checkbox__inner {
        background-color: #fb3a32 !important;
        border-color: #fb3a32 !important;
      }
      .el-checkbox__input.is-focus .el-checkbox__inner {
        border-color: #fb3a32;
      }
      .el-checkbox__inner:hover {
        border-color: #fb3a32;
      }
    }
    .async__footer {
      padding-top: 16px;
      float: right;
    }
  }
  .zdy-message-box {
    .zdy-confirm-cancel {
      padding: 4px 30px;
    }
    .el-message-box .el-button--primary {
      background: #fb3a32 !important;
      border-color: #fb3a32 !important;
      &:hover {
        background: #fc615b !important;
      }
      &:active {
        background: #e2332c !important;
      }
    }
  }
  .return-btn {
    position: absolute;
    top: 25px;
    left: 12px;
    font-size: 14px;
    color: #666;
    cursor: pointer;
    i {
      font-size: 13px;
    }
  }
  .qa-create-out {
    height: 500px;
    background: #fff;
    overflow: auto;
    position: relative;

    .black {
      font-size: 12px;
      height: 30px;
      line-height: 28px;
      width: 80px;
      border: solid 1px #999999;
      border-radius: 2px;
      background-color: #fff;
      color: #666;
      outline: none;
      cursor: pointer;
      display: inline-block;
      position: absolute;
      top: 10px;
      right: 20px;
      text-decoration: none;
      text-align: center;
      // float: right;
      z-index: 100;
      &:hover {
        color: #fff;
        border: 1px solid #fc5659;
        background-color: #fc5659;
      }
    }
  }

  .question__content {
    height: 100%;
    background: #fff;
  }

  .vhall-question__content {
    box-sizing: border-box;
    height: 100%;
    padding: 16px 32px;
    overflow: hidden;
    background: #fff;
    position: relative;
    &-search {
      .create {
        height: 36px;
        background: #fb3a32;
        color: #fff;
        font-size: 14px;
        text-align: center;
      }
      .el-input__inner {
        height: 36px;
        border-radius: 20px !important;
      }
      .el-input__icon {
        line-height: 36px;
      }
    }
    &.assistantStyle {
      height: 420px;
    }
    &-title {
      height: 42px;
      line-height: 42px;
      background: #fff;
    }
    ::-webkit-scrollbar {
      width: 6px; // 横向滚动条
      height: 6px; // 纵向滚动条 必写
    }
    // 滚动条的滑块
    ::-webkit-scrollbar-thumb {
      border-radius: 5px;
      transition: all 0.3s;
      cursor: pointer;
      display: none;
      background-color: #e0e0e0;
    }
    ::-webkit-scrollbar-track {
      background-color: transparent;
    }
    &:hover {
      ::-webkit-scrollbar-thumb {
        display: block;
      }
    }
    .popbody {
      // height: 100%;
      padding-top: 24px;
      .vhall-question__content-list {
        max-height: 420px;
        margin: 0 32px;
        &.assistantStyle {
          height: 370px;
        }
        overflow-y: auto;
        li {
          display: flex;
          line-height: 56px;
          height: 56px;
          font-size: 14px;
          color: #1a1a1a;
        }
      }
      .creatBtn {
        height: 50px;
        line-height: 50px;
      }
      .vhall-question__content-list__colmun-title {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .fontColor {
        color: #666;
      }
    }
    &-list {
      font-size: 12px;
      color: #666;
      li {
        height: 45px;
        line-height: 56px;
        padding-left: 40px;
        padding-right: 15px;
        // &:nth-child(odd) {
        //   background: #f8f8f8;
        // }
        span {
          display: inline-block;
        }
        &:hover {
          background: #f7f7f7;
          .item {
            color: #fb3a32;
          }
          .colorItem {
            color: #fb3a32;
          }
        }
      }
      &__colmun-title {
        width: 245px;
        padding-right: 20px;
      }

      &__colmun-time {
        width: 80px;
      }

      &__colmun-source {
        width: 160px;
      }

      &__colmun-action {
        width: 210px;
        a {
          display: inline-block;
          width: 36px;
          height: 20px;
          vertical-align: middle;
        }
        span {
          font-size: 14px;
          cursor: pointer;
          color: #1a1a1a;
        }
        .item {
          padding: 0 8px;
        }
        .el-dropdown {
          color: #1a1a1a !important;
        }
        &--send {
          background: url(./images/fq.png) no-repeat;
          background-size: 100%;
          &:hover {
            background: url(./images/fq-hover.png) no-repeat;
            background-size: 100%;
          }
        }
        &--preview {
          background: url(./images/yl.png) no-repeat;
          background-size: 100%;
          &:hover {
            background: url(./images/yl-hover.png) no-repeat;
            background-size: 100%;
          }
        }
        &--editor {
          background: url(./images/xg.png) no-repeat;
          background-size: 100%;
          &:hover {
            background: url(./images/xg-hover.png) no-repeat;
            background-size: 100%;
          }
        }
        &--detail {
          background: url(./images/xq.png) no-repeat;
          background-size: 100%;
          &:hover {
            background: url(./images/xq-hover.png) no-repeat;
            background-size: 100%;
          }
        }
      }
    }

    &-list__title {
      height: 56px;
      line-height: 56px;
      background: #f7f7f7;
    }

    .vhall-question-btn {
      background-color: #fff;
      border: 1px solid #fb3a32;
      color: #fb3a32;
      font-size: 12px;
      width: 100px;
      height: 30px;
      box-sizing: border-box;
      border-radius: 2px;
      padding: 0;
      line-height: 26px;
      display: inline-block;
      cursor: pointer;
      &:hover {
        background: #fb3a32;
        color: #fff;
      }
    }
    .show-no-msg {
      text-align: center;
      .no-img {
        display: inline-block;
        width: 130px;
        height: 130px;
        margin-top: 50px;
      }
      img {
        width: 100%;
        height: 100%;
        object-fit: scale-down;
      }
      .no-msg {
        color: #666;
        font-size: 14px;
        line-height: 20px;
      }
      .list-create {
        display: inline-block;
        width: 100px;
        height: 36px;
        line-height: 36px;
        border-radius: 20px;
        background: #fb3a32;
        color: #fff;
        font-size: 14px;
        text-align: center;
        margin-top: 32px;
        cursor: pointer;
      }
    }
    .text-center {
      margin-top: 60px;
    }
  }
  #qs-create-box {
    .goback-btn {
      display: none;
    }
    .question-edit-wrap {
      padding: 10px 20px 20px;
      background: #f7f7f7;
      .edit-content-main {
        padding-bottom: 30px;
      }
      .question-bottom {
        margin-bottom: 30px;
        & > .el-button {
          line-height: 0px !important;
        }
      }
    }
  }
  .q-wrap {
    padding-bottom: 30px;
  }
  .cef-q-wrap {
    .q-wrap {
      overflow-y: hidden;
    }
  }
</style>
