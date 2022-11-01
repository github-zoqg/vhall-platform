<template>
  <div class="exam-list-panel">
    <!-- 内层嵌套对话框 -->
    <el-dialog
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
      <p><el-checkbox v-model="isShare">共享到资料管理</el-checkbox></p>
      <div class="dialog-footer">
        <el-button type="primary" round @click="handleShareSubmit">确 定</el-button>
        <el-button round @click="handleShareCancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 快问快答—列表 -->
    <div>
      <!-- 无数据 -->
      <div class="vmp-exam-cur__empty" v-show="examList.length === 0">
        <img src="../img/no-file.png" />
        <p>您还没有快问快答，快来创建吧！</p>
        <div>
          <!-- 创建按钮 -->
          <el-button type="primary" round @click="handleCreateExam">创建</el-button>
        </div>
      </div>
      <!-- 有数据 -->
      <div class="vmp-exam-cur__inner" v-show="examList.length > 0">
        <div class="vmp-exam-cur__hd">
          <!-- 创建按钮 -->
          <el-button type="primary" round @click="handleCreateExam">创建</el-button>
          <!-- 资料库按钮
          <el-button round @click="openSelectDialog">
            {{ $t('doc.doc_1015') }}
          </el-button> -->
          <!-- 搜索框 -->
          <el-input
            class="input-search"
            placeholder="请输入名称"
            v-model="queryParams.keyword"
            clearable
            @clear="initQueryList"
            @keydown.enter.stop.native="initQueryList()"
          >
            <i slot="prefix" class="el-input__icon el-icon-search" @click="initQueryList"></i>
          </el-input>
        </div>
        <div class="vmp-exam-cur__bd">
          <el-table
            :data="examList"
            style="width: 100%"
            height="320px"
            v-loadMore="moreLoadData"
            @cell-mouse-enter="handleCellMouseEnter"
            @cell-mouse-leave="handleCellMouseLeave"
          >
            <!-- 未搜索到数据展示 -->
            <template slot="empty">
              <img src="@/app-shared/assets/img/no-search.png" />
              <p>暂未搜索到您想要的内容</p>
            </template>
            <!-- 表格展示 -->
            <el-table-column
              prop="title"
              label="名称"
              width="220"
              fixed="left"
              :show-overflow-tooltip="true"
            >
              <template slot-scope="scope">
                <!--  <el-tooltip placement="top" :content="scope.row.title">
                  <p class="file-name custom-tooltip-content">
                    <span class="file-name__text">
                      {{ scope.row.title }}
                    </span>
                  </p>
                </el-tooltip> -->
                {{ scope.row.title }}
              </template>
            </el-table-column>
            <el-table-column label="创建时间" width="170">
              <template slot-scope="scope">
                {{ scope.row.created_at_str }}
              </template>
            </el-table-column>
            <el-table-column prop="total_score" label="总分"></el-table-column>
            <el-table-column prop="questions_count" label="题数"></el-table-column>
            <el-table-column label="限时(分)" width="170">
              <template slot-scope="scope">
                {{ scope.row.limit_time_str }}
              </template>
            </el-table-column>
            <el-table-column label="状态" width="170">
              <template slot-scope="scope">
                <span class="statusTag" :class="scope.row.status_css">
                  {{ scope.row.status_str }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="348" fixed="right">
              <template slot-scope="scope">
                <template v-for="btnItem in scope.row.btnList">
                  <span
                    :class="`item ${btnItem.disabled ? 'is-disabled' : ''}`"
                    :key="`btn${btnItem.type}`"
                    @click="handleCommand(btnItem, scope.row)"
                  >
                    {{ btnItem.name }}
                  </span>
                </template>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <!-- 资料库 -->
  </div>
</template>
<script>
  import tableCellTooltip from '@/packages/app-shared/mixins/tableCellTooltip';
  export default {
    name: 'VmpExamListPanel',
    mixins: [tableCellTooltip],
    directives: {
      drag(el) {
        el.onmousedown = function (e) {
          const disx = e.pageX - el.offsetLeft;
          const disy = e.pageY - el.offsetTop;
          document.onmousemove = function (e) {
            let l = e.pageX - disx;
            let t = e.pageY - disy;
            if (l < 230) {
              l = 230;
            }
            if (l > window.innerWidth - 170) {
              l = window.innerWidth - 170;
            }
            if (t < 5) {
              t = 5;
            }
            if (t > window.innerHeight - 240) {
              t = window.innerHeight - 240;
            }
            el.style.left = l + 'px';
            el.style.top = t + 'px';
          };
          document.onmouseup = function () {
            document.onmousemove = document.onmouseup = null;
          };
        };
      }
    },
    data() {
      return {
        innerVisible: false,
        isShare: false, // 是否共享到资料库
        keyword: '', // 搜索关键字
        loading: false, // 列表请求加载中
        queryParams: {
          // 快问快答-列表搜索参数
          limit: 10,
          pos: 0,
          pageNum: 1,
          keyword: ''
        },
        examList: [],
        totalPages: 0,
        total: 0,
        selectedExam: null
      };
    },
    methods: {
      // 创建快问快答
      handleCreateExam() {},
      // 共享到资料库 —— 确定
      handleShareSubmit() {},
      // 共享到资料库 —— 取消
      handleShareCancel() {},
      // 点击打开资料库
      openSelectDialog() {},
      // 转换每行可操作的按钮 [设置按钮是否可点击 -> 通过状态过滤是否展示 -> 依据可点击按钮在前进行排序]
      setBtnList(item) {
        const baseBtnList = [
          { type: 'publish', name: '公布', disabled: true },
          { type: 'score', name: '成绩', disabled: true },
          { type: 'push', name: '推送', disabled: true },
          { type: 'edit', name: '编辑', disabled: true },
          { type: 'close', name: '收卷', disabled: true },
          { type: 'copy', name: '复制', disabled: true },
          { type: 'preview', name: '预览', disabled: true },
          { type: 'del', name: '删除', disabled: true }
        ];
        baseBtnList.map(sItem => {
          // 状态 0.未推送 1.答题中 2.成绩待公布 3.成绩已公布
          if (item.status == 1) {
            // 答题中（收卷、复制、预览）可以点击，其余不可点击
            sItem.disabled = !['close', 'copy', 'preview'].includes(sItem.type);
          } else if ([2, 3].includes(Number(item.status))) {
            // 成绩待公布 or 已公布（公布、成绩、推送、复制、预览）可以点击，其余不可点击
            sItem.disabled = !['publish', 'score', 'push', 'copy', 'preview'].includes(sItem.type);
          } else {
            // 默认未推送 （推送、编辑、复制、删除、预览）可以点击，其余不可点击
            sItem.disabled = !['push', 'edit', 'copy', 'del', 'preview'].includes(sItem.type);
          }
        });
        let filterList = baseBtnList.filter(sItem => {
          if (item.status == 1) {
            // 答题中，仅展示（收卷、复制、预览、推送、编辑、删除），不展示（公布、成绩）
            return !['publish', 'score'].includes(sItem.type);
          } else if ([2, 3].includes(Number(item.status))) {
            // 成绩待公布 or 已公布，仅展示（公布、成绩、推送、复制、预览、编辑、删除），不展示（收卷）
            return sItem.type != 'close';
          } else {
            // 默认未推送，仅展示（推送、复制、预览、编辑、删除），不展示（公布、成绩、收卷）
            return !['publish', 'score', 'close'].includes(sItem.type);
          }
        });
        return filterList.sort((lastVo, nextVo) => {
          return lastVo.disabled - nextVo.disabled;
        });
      },
      // 更多列表的操作
      handleCommand(btnVo, selectedExam) {
        if (!btnVo.type) return;
        if (selectedExam) {
          this.selectedExam = selectedExam;
        }
        eval(`this.${btnVo.type}(${btnVo.disabled})`);
      },
      // 下拉框显示是, 中转当前选中变量
      dropDownVisibleChange(row) {
        this.selectedExam = row;
      },
      // 公布
      publish(btnIsDisabled) {
        console.log('公布成绩');
        this.$confirm('公布成绩后观众将会收到成绩排行榜，确定公布？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          customClass: 'zdy-message-box',
          cancelButtonClass: 'zdy-confirm-cancel'
        }).then(() => {});
      },
      // 成绩
      score(btnIsDisabled) {
        console.log('公布成绩');
      },
      // 推送
      push(btnIsDisabled) {
        if (btnIsDisabled) {
          this.$message.error('已推送快问快答不支持再次推送');
        } else {
          // 正常编辑
        }
      },
      // 编辑
      edit(btnIsDisabled) {
        if (btnIsDisabled) {
          this.$message.error('已推送的快问快答不支持编辑，建议进行「复制」');
        } else {
          // 正常编辑
        }
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
      preview(btnIsDisabled) {},
      // 删除
      del(btnIsDisabled) {
        if (btnIsDisabled) {
          this.$message.error('已推送的快问快答不支持删除');
        } else {
          // 正常删除
        }
      },
      // 查询列表接口
      initQueryList() {
        this.queryExamList(true);
      },
      /**
       * @description 条件搜索列表
       */
      queryExamList(refresh = false) {
        if (refresh) {
          this.queryParams = {
            limit: 10,
            pos: 0,
            pageNum: 1,
            keyword: ''
          };
          this.examList = [];
        }
        this.loading = true;
        this.queryParams.keyword = this.keyword;
        // TODO 调用查询接口
        this.loading = false;
        let res = {
          data: {
            list: [
              {
                id: 1,
                title: 'Apple产品功能知识点①',
                created_at: '2022-10-23 00:00:00',
                updated_at: '2022-10-23 00:00:00',
                total_score: 100,
                questions_count: 10,
                limit_time_switch: 1,
                limit_time: 70,
                auto_push_switch: 0,
                status: 0
              },
              {
                id: 2,
                title: 'Apple产品功能知识点2',
                created_at: '2022-10-23 00:00:00',
                updated_at: '2022-10-23 00:00:00',
                total_score: 100,
                questions_count: 10,
                limit_time_switch: 0,
                limit_time: 0,
                auto_push_switch: 0,
                status: 1
              },
              {
                id: 3,
                title: 'Apple产品功能知识点3',
                created_at: '2022-10-23 00:00:00',
                updated_at: '2022-10-23 00:00:00',
                total_score: 100,
                questions_count: 10,
                limit_time_switch: 0,
                limit_time: 0,
                auto_push_switch: 0,
                status: 2
              },
              {
                id: 4,
                title:
                  'Apple产品功能知识点Apple产品功能知识点Apple产品功能知识点Apple产品功能知识点4',
                created_at: '2022-10-23 00:00:00',
                updated_at: '2022-10-23 00:00:00',
                total_score: 100,
                questions_count: 10,
                limit_time_switch: 0,
                limit_time: 0,
                auto_push_switch: 0,
                status: 3
              },
              {
                id: 5,
                title:
                  'Apple产品功能知识点Apple产品功能知识点Apple产品功能知识点Apple产品功能知识点4',
                created_at: '2022-10-23 00:00:00',
                updated_at: '2022-10-23 00:00:00',
                total_score: 100,
                questions_count: 10,
                limit_time_switch: 0,
                limit_time: 0,
                auto_push_switch: 0,
                status: 0
              }
            ]
          }
        };
        const dataList = res.data.list || [];
        dataList.map(item => {
          let btnList = this.setBtnList(item);
          item.btnList = btnList;
          console.log(item.btnList.length);
          item.created_at_str = item.created_at.substring(0, 16);
          item.updated_at_str = item.updated_at.substring(0, 16);
          item.limit_time_str = item.limit_time_switch == 1 ? item.limit_time : '不限时';
          item.status_css = ['no-push', 'answer', 'no-publish', 'publish'][item.status];
          item.status_str = ['未推送', '答题中', '成绩待公布', '成绩已公布'][item.status];
        });
        this.examList = this.examList.concat(dataList);
        this.total = res.data.total;
        this.firstLoad = true;
        this.totalPages = Math.ceil(res.data.total / this.queryParams.limit);
      },
      moreLoadData() {
        console.log('查看是否触发滑动查询');
        if (this.queryParams.pageNum >= this.totalPages) {
          return false;
        }
        this.queryParams.pageNum++;
        this.queryParams.pos = parseInt((this.queryParams.pageNum - 1) * this.queryParams.limit);
        this.queryExamList();
      },
      // 初始化界面
      initComp() {
        this.initQueryList();
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
    .el-checkbox {
      font-weight: 400 !important;
    }
    .el-checkbox__input.is-checked + .el-checkbox__label {
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
      .el-button {
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
      padding: 24px 0;
    }
    .vmp-exam-cur__bd {
      .el-button.el-button--text {
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
      .el-button.is-round {
        padding: 7px 24px;
      }
      .el-input__inner {
        border-radius: 20px;
      }
    }
    .el-table .cell .file-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      &__text {
        vertical-align: middle;
      }
    }
    .el-table th > .cell {
      font-weight: normal;
    }
    .el-table th:first-child .cell,
    .el-table tr td:first-child .cell {
      padding-left: 24px;
    }

    .el-table--enable-row-hover .el-table__body tr:hover > td {
      background-color: #f7f7f7;
      .el-button--text {
        color: #fb3a32;
      }
    }
    .item {
      margin-left: 16px;
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 22px;
      color: rgba(0, 0, 0, 0.85);
      cursor: pointer;
      &:hover,
      &:active,
      &:focus {
        color: #fb3232;
      }
      &:first-child {
        margin-left: 0;
      }
      &.is-disabled {
        color: rgba(0, 0, 0, 0.25);
        &:hover,
        &:active,
        &:focus {
          color: rgba(0, 0, 0, 0.25);
        }
      }
    }
  }
</style>
