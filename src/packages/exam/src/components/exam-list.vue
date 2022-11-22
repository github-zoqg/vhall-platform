<template>
  <div class="exam-list-panel">
    <!-- 内层嵌套对话框 -->
    <vh-dialog
      width="400px"
      title="提示"
      :show-close="false"
      custom-class="exam-dlg-share-tip"
      :close-on-click-modal="false"
      :visible.sync="innerVisible"
      top="30vh"
      append-to-body
    >
      <p class="tip-text">保存同时共享至资料管理，便于其他活动使用？</p>
      <p><vh-checkbox v-model="isShare">共享到资料管理</vh-checkbox></p>
      <div class="dialog-footer">
        <vh-button type="primary" round @click="handleShareSubmit">确 定</vh-button>
        <vh-button round @click="handleShareCancel">取 消</vh-button>
      </div>
    </vh-dialog>
    <!-- 快问快答—列表 -->
    <div>
      <!-- 无数据 -->
      <div class="vmp-exam-cur__empty" v-show="examList.length === 0">
        <img src="../img/no-file.png" />
        <p>您还没有快问快答，快来创建吧！</p>
        <div>
          <!-- 创建按钮 -->
          <vh-button type="primary" round @click="handleCreateExam">创建</vh-button>
        </div>
      </div>
      <!-- 有数据 -->
      <div class="vmp-exam-cur__inner" v-show="examList.length > 0">
        <div class="vmp-exam-cur__hd">
          <!-- 创建按钮 -->
          <vh-button type="primary" round @click="handleCreateExam">创建</vh-button>
          <!-- 资料库按钮
          <vh-button round @click="openSelectDialog">
            {{ $t('doc.doc_1015') }}
          </vh-button> -->
          <!-- 搜索框 -->
          <vh-input
            class="input-search"
            placeholder="请输入名称"
            v-model="keywordIpt"
            clearable
            @clear="handleClearKeyWord"
            @keydown.enter.stop.native="queryExamList()"
          >
            <i slot="prefix" class="vh-input__icon vh-icon-search" @click="queryExamList"></i>
          </vh-input>
        </div>
        <div class="vmp-exam-cur__bd">
          <vh-table :data="examList" style="width: 100%" height="295px">
            <template slot="empty">
              <img src="@/app-shared/assets/img/no-search.png" />
              <p>暂未搜索到您想要的内容</p>
            </template>
            <vh-table-column
              prop="title"
              label="名称"
              width="240"
              fixed="left"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                {{ scope.row.title }}
              </template>
            </vh-table-column>
            <vh-table-column label="创建时间" width="148">
              <template slot-scope="scope">
                {{ scope.row.created_at_str }}
              </template>
            </vh-table-column>
            <vh-table-column prop="total_score" width="56" label="总分"></vh-table-column>
            <vh-table-column prop="questions_count" width="56" label="题数"></vh-table-column>
            <vh-table-column label="限时(分)" width="78">
              <template slot-scope="scope">
                {{ scope.row.limit_time_str }}
              </template>
            </vh-table-column>
            <vh-table-column label="状态" width="112">
              <template slot-scope="scope">
                <span class="statusTag" :class="scope.row.status_css">
                  {{ scope.row.status_str }}
                </span>
              </template>
            </vh-table-column>
            <vh-table-column label="操作" width="196" fixed="right">
              <template slot-scope="scope">
                <div :data-vars="(btnConfig = setBtnConfigByStatus(scope.row.status))">
                  <span
                    v-for="item of btnConfig.outsideBtn"
                    :key="item.type"
                    :disabled="item.disabled"
                    class="std-text opt-btn"
                    @click="handleExamOpt(item.type, scope.row)"
                  >
                    {{ item.name }}
                  </span>
                  <vh-dropdown @command="handleCommand">
                    <span class="std-text opt-btn">更多</span>
                    <vh-dropdown-menu slot="dropdown">
                      <vh-dropdown-item
                        v-for="item of btnConfig.moreBtn"
                        :key="item.type"
                        :command="[item.type, scope.row]"
                        :disabled="item.disabled"
                      >
                        {{ item.name }}
                      </vh-dropdown-item>
                    </vh-dropdown-menu>
                  </vh-dropdown>
                </div>
              </template>
            </vh-table-column>
          </vh-table>
        </div>
        <div class="m-t-16">
          <vh-pagination
            class="ma text-center"
            background
            layout="prev, pager, next"
            :page-size="queryParams.limit"
            :total="total"
            :page-count="queryParams.pageNum"
            @current-change="handleChangePage"
          ></vh-pagination>
        </div>
      </div>
    </div>

    <!-- 资料库 -->
  </div>
</template>
<script>
  import changeView from '../common/mixins/changeView.js';
  import initComp from '../common/mixins/initComp.js';

  // 操作按钮
  const btnMap = {
    publish: { type: 'publish', name: '公布' },
    score: { type: 'score', name: '成绩' },
    push: { type: 'push', name: '推送' },
    edit: { type: 'edit', name: '编辑' },
    stop: { type: 'stop', name: '收卷' },
    copy: { type: 'copy', name: '复制' },
    prev: { type: 'prev', name: '预览' },
    del: { type: 'del', name: '删除' }
  };
  //操作按钮策略
  const operateTactics = {
    publish: 'handleExamPublish',
    score: 'handleExamScore',
    push: 'handleExamPush',
    edit: 'handleExamEdit',
    stop: 'handleExamStop',
    copy: 'handleExamCopy',
    prev: 'handleExamPrev',
    del: 'handleExamDel'
  };
  const noop = () => {}; // 空函数
  export default {
    name: 'VmpExamListPanel',
    mixins: [changeView, initComp],
    inject: ['examServer'],
    data() {
      return {
        innerVisible: false,
        isShare: false, // 是否共享到资料库
        keywordIpt: '', // 搜索关键字
        loading: false, // 列表请求加载中
        queryParams: {
          // 快问快答-列表搜索参数
          limit: 4,
          pageNum: 1,
          keyword: '' // 搜索的关键字
        },
        examList: [],
        totalPages: 0,
        total: 0,
        selectedExam: null
      };
    },
    created() {},
    methods: {
      initComp() {
        console.log('🚀 ~ file: exam-list.vue ~ line 187 ~ initComp ~ initComp', initComp);
        this.queryExamList();
      },
      // 创建快问快答
      handleCreateExam() {
        this.$emit('changeView', { view: 'ExamCreate' });
      },
      // 共享到资料库 —— 确定
      handleShareSubmit() {},
      // 共享到资料库 —— 取消
      handleShareCancel() {},
      // 点击打开资料库
      openSelectDialog() {},
      // 转换每行可操作的按钮 [设置按钮是否可点击 -> 通过状态过滤是否展示 -> 依据可点击按钮在前进行排序]
      setBtnConfigByStatus(status) {
        const outsideBtn = []; // 在列表显示的
        const moreBtn = []; // 更多中的
        switch (status) {
          case 0: //0.未推送
            outsideBtn.push(btnMap.push);
            outsideBtn.push(btnMap.edit);
            outsideBtn.push(btnMap.copy);
            moreBtn.push(btnMap.del);
            moreBtn.push(btnMap.prev);
            break;
          case 1: //1.答题中
            outsideBtn.push(btnMap.stop);
            outsideBtn.push(btnMap.copy);
            outsideBtn.push(btnMap.prev);
            moreBtn.push({
              ...btnMap.push,
              disabled: true
            });
            moreBtn.push({
              ...btnMap.edit,
              disabled: true
            });
            moreBtn.push({
              ...btnMap.del,
              disabled: true
            });
            break;
          case 2: //2.成绩待公布
          case 3: //3.成绩已公布
            outsideBtn.push(btnMap.publish);
            outsideBtn.push(btnMap.score);
            outsideBtn.push(btnMap.push);
            moreBtn.push(btnMap.copy);
            moreBtn.push(btnMap.prev);
            moreBtn.push({
              ...btnMap.edit,
              disabled: true
            });
            moreBtn.push({
              ...btnMap.del,
              disabled: true
            });
            break;
        }
        return { outsideBtn, moreBtn };
      },
      // 更多列表的操作
      handleCommand(args) {
        this.handleExamOpt(...args);
      },
      // 操作问卷
      handleExamOpt(type, examObj) {
        console.log('🚀 ~ file: exam-list.vue ~ line 293 ~ handleExamOpt ~ type', type, examObj);
        const tactics = operateTactics[type] || '';
        const fn = this[tactics];
        fn && fn(examObj);
      },
      // 公布
      handleExamPublish(examObj) {
        console.log('公布成绩');
        // 确认公布
        const confirmCb = () => {};
        this.$confirm('公布成绩后观众将会收到成绩排行榜，确定公布？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          roundButton: true,
          type: 'warning'
        })
          .then(confirmCb)
          .catch(noop);
      },
      // 成绩
      score(btnIsDisabled) {
        console.log('公布成绩');
      },
      // 推送
      handleExamPush(examObj) {
        // 确认推送
        const confirmCb = () => {};
        this.$confirm('公布成绩后观众将会收到成绩排行榜，确定公布？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          roundButton: true
        })
          .then(confirmCb)
          .catch(noop);
      },
      // 编辑
      edit(examObj) {
        // if (btnIsDisabled) {
        //   this.$message.error('已推送的快问快答不支持编辑，建议进行「复制」');
        // } else {
        //   // 正常编辑

        // }
        this.$emit('changeView', { view: 'ExamCreate', examId: examObj.id });
      },
      // 收卷
      close(btnIsDisabled) {
        this.$confirm('收卷后将不能继续答卷，确定收卷？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          customClass: 'zdy-message-box',
          cancelButtonClass: 'zdy-confirm-cancel'
        }).then(() => {});
      },
      // 复制
      copy(btnIsDisabled) {},
      // 预览
      preview(btnIsDisabled) {
        this.$emit('examBtnClick', {
          type: 'preview',
          currentRow: this.selectedExam
        });
      },
      // 删除
      del(btnIsDisabled) {
        if (btnIsDisabled) {
          this.$message.error('已推送的快问快答不支持删除');
        } else {
          // 正常删除
        }
      },
      handleClearKeyWord() {
        this.keywordIpt = [];
        this.queryExamList(true);
      },
      /**
       * @description 条件搜索列表
       */
      queryExamList() {
        const keyword = (this.queryParams.keyword = this.keywordIpt);
        const params = {
          limit: this.queryParams.limit,
          pos: (this.queryParams.pageNum - 1) * this.queryParams.limit,
          keyword
        };
        // TODO 调用查询接口
        // this.loading = false;
        this.examServer?.getExamList(params).then(res => {
          console.log(
            '🚀 ~ file: exam-list.vue ~ line 344 ~ this.examServer?.getExamList ~ res',
            res
          );
          this.examList = res.data.list || [];
          this.total = res.data.total;
          this.firstLoad = true;
          this.totalPages = Math.ceil(res.data.total / this.queryParams.limit);
        });
        // let res = {
        //   data: {
        //     list: [
        //       {
        //         id: 1,
        //         title: 'Apple产品功能知识点①',
        //         created_at: '2022-10-23 00:00:00',
        //         updated_at: '2022-10-23 00:00:00',
        //         total_score: 100,
        //         questions_count: 10,
        //         limit_time_switch: 1,
        //         limit_time: 70,
        //         auto_push_switch: 0,
        //         status: 0
        //       },
        //       {
        //         id: 2,
        //         title: 'Apple产品功能知识点2',
        //         created_at: '2022-10-23 00:00:00',
        //         updated_at: '2022-10-23 00:00:00',
        //         total_score: 100,
        //         questions_count: 10,
        //         limit_time_switch: 0,
        //         limit_time: 0,
        //         auto_push_switch: 0,
        //         status: 1
        //       },
        //       {
        //         id: 3,
        //         title: 'Apple产品功能知识点3',
        //         created_at: '2022-10-23 00:00:00',
        //         updated_at: '2022-10-23 00:00:00',
        //         total_score: 100,
        //         questions_count: 10,
        //         limit_time_switch: 0,
        //         limit_time: 0,
        //         auto_push_switch: 0,
        //         status: 2
        //       },
        //       {
        //         id: 4,
        //         title:
        //           'Apple产品功能知识点Apple产品功能知识点Apple产品功能知识点Apple产品功能知识点4',
        //         created_at: '2022-10-23 00:00:00',
        //         updated_at: '2022-10-23 00:00:00',
        //         total_score: 100,
        //         questions_count: 10,
        //         limit_time_switch: 0,
        //         limit_time: 0,
        //         auto_push_switch: 0,
        //         status: 3
        //       },
        //       {
        //         id: 5,
        //         title:
        //           'Apple产品功能知识点Apple产品功能知识点Apple产品功能知识点Apple产品功能知识点4',
        //         created_at: '2022-10-23 00:00:00',
        //         updated_at: '2022-10-23 00:00:00',
        //         total_score: 100,
        //         questions_count: 10,
        //         limit_time_switch: 0,
        //         limit_time: 0,
        //         auto_push_switch: 0,
        //         status: 0
        //       }
        //     ]
        //   }
        // };
      },
      handleChangePage(page) {
        this.queryParams.pageNum = page;
        this.getExamList();
      }
    }
  };
</script>
<style lang="less">
  // 内嵌对话框，挂载到body下 【是否共享到资料库】
  .exam-dlg-share-tip {
    width: 400px;
    height: 200px;
    box-shadow: 0 12px 42px 0 rgb(51 51 51 / 24%);
    border-radius: 4px;
    background-color: #fff;
    position: relative;
    margin-top: -10%;

    .tip-text {
      padding-bottom: 10px;
    }
    .vh-checkbox {
      font-weight: 400 !important;
    }
    .vh-checkbox__input.is-checked + .vh-checkbox__label {
      color: #606266 !important;
    }

    .dialog-footer {
      text-align: right;
      margin-top: 20px;
      padding-left: 130px;
    }
  }

  /* 快问快答 - 列表相关 */
  .exam-list-panel {
    .statusTag {
      font-size: 14px;
      &::before {
        content: '';
        width: 8px;
        height: 8px;
        border-radius: 50%;
        display: inline-block;
        margin-right: 6px;
      }
      &.no-push::before {
        background: #8c8c8c;
      }
      &.answer::before {
        background: #fb2626;
      }
      &.no-publish::before {
        background: #fc9600;
      }
      &.publish::before {
        background: #14ba6a;
      }
    }
    .vmp-exam-cur__empty {
      height: 380px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      p {
        line-height: 20px;
        margin-top: 8px;
        margin-bottom: 30px;
        font-size: 15px;
        color: @font-light-second;
      }
      .vh-button {
        width: 120px;
      }
    }
    .vmp-exam-cur {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .vmp-exam-cur__hd {
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: 16px 0 12px;
    }
    .vmp-exam-cur__bd {
      .vh-button.vh-button--text {
        color: #666;
        border: 0;
        margin-left: 0;
        font-size: 14px;
        padding: 2px 8px;
      }
    }
    .input-search {
      width: 180px;
      margin-left: auto;
      .vh-button.is-round {
        padding: 7px 24px;
      }
      .vh-input__inner {
        border-radius: 20px;
      }
    }
    .vh-table .cell .file-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      &__text {
        vertical-align: middle;
      }
    }
    .vh-table th > .cell {
      font-weight: normal;
    }
    .vh-table th:first-child .cell,
    .vh-table tr td:first-child .cell {
      padding-left: 24px;
    }

    .vh-table--enable-row-hover .vh-table__body tr:hover > td {
      background-color: #f7f7f7;
      .vh-button--text {
        color: #fb3a32;
      }
    }
    // .item {
    //   margin-left: 16px;
    //   font-style: normal;
    //   font-weight: 400;
    //   font-size: 14px;
    //   line-height: 22px;
    //   color: rgba(0, 0, 0, 0.85);
    //   cursor: pointer;
    //   &:hover,
    //   &:active,
    //   &:focus {
    //     color: #fb3232;
    //   }
    //   &:first-child {
    //     margin-left: 0;
    //   }
    //   &.is-disabled {
    //     color: rgba(0, 0, 0, 0.25);
    //     &:hover,
    //     &:active,
    //     &:focus {
    //       color: rgba(0, 0, 0, 0.25);
    //     }
    //   }
    // }
    .opt-btn {
      cursor: pointer;
      &:not(:last-child) {
        margin-right: 8px;
      }
    }
  }
</style>
