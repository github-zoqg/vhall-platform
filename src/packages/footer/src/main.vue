<template>
  <div class="vmp-footer" v-if="!isEmbed && webinarTag && webinarTag.reserved_status">
    <div class="vmp-footer_text">
      <a href="https://www.vhall.com/saas" target="_blank">{{ $t('footer.footer_1021') }}</a>
      &nbsp;|&nbsp;
      <span @click="openFeedHandler">{{ $t('footer.footer_1001') }}</span>
    </div>
    <!-- 反馈与举报弹出框 -->
    <el-dialog
      :title="$t('footer.footer_1001')"
      :visible.sync="dialogFooterVisible"
      :close-on-click-modal="false"
      custom-class="vmp-footer-feedback"
      width="440px"
      @closed="closeFeedHandler"
    >
      <div class="vmp-footer_main">
        <el-form ref="feedbackForm" label-width="68px">
          <el-form-item :label="$t('footer.footer_1002')" class="radio-btn">
            <el-radio-group v-model="type" @change="radioChange">
              <el-radio :label="1">{{ $t('footer.footer_1003') }}</el-radio>
              <el-radio :label="2">{{ $t('footer.footer_1004') }}</el-radio>
            </el-radio-group>
            <el-select v-model="selectValue" :placeholder="$t('form.form_1018')">
              <el-option
                v-for="item in renderOption"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('footer.footer_1017')">
            <el-input
              v-model="desc"
              type="textarea"
              :rows="5"
              maxlength="1000"
              :placeholder="$t('footer.footer_1020')"
              show-word-limit
            ></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="vmp-footer_main_submit">
          <el-button type="primary" size="medium" round @click="feedExecuteHandler">
            {{ $t('interact_tools.interact_tools_1019') }}
          </el-button>
        </span>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import { useRoomBaseServer } from 'middle-domain';
  export default {
    name: 'VmpFooter',
    data() {
      return {
        dialogFooterVisible: false,
        webinarTag: {},
        embedObj: {},
        type: 1,
        questionOptions: [
          {
            label: this.$t('footer.footer_1005'),
            value: 1
          },
          {
            label: this.$t('footer.footer_1006'),
            value: 2
          },
          {
            label: this.$t('footer.footer_1007'),
            value: 3
          }
        ],
        renderVideoOption: [
          {
            label: this.$t('footer.footer_1005'),
            value: 1
          },
          {
            label: this.$t('footer.footer_1006'),
            value: 2
          },
          {
            label: this.$t('footer.footer_1007'),
            value: 3
          },
          {
            label: this.$t('footer.footer_1008'),
            value: 10
          },
          {
            label: this.$t('footer.footer_1009'),
            value: 11
          },
          {
            label: this.$t('footer.footer_1010'),
            value: 12
          },
          {
            label: this.$t('footer.footer_1011'),
            value: 13
          },
          {
            label: this.$t('footer.footer_1012'),
            value: 14
          },
          {
            label: this.$t('form.form_1063'),
            value: 4
          }
        ],
        feedBackOptions: [
          {
            label: this.$t('footer.footer_1013'),
            value: 1
          },
          {
            label: this.$t('footer.footer_1014'),
            value: 2
          },
          {
            label: this.$t('footer.footer_1015'),
            value: 3
          },
          {
            label: this.$t('footer.footer_1016'),
            value: 4
          },
          {
            label: this.$t('form.form_1063'),
            value: 5
          }
        ],
        selectValue: 1,
        desc: '',
        timer: null
      };
    },
    computed: {
      renderOption() {
        if (this.type == 1) {
          return this.renderVideoOption;
        } else {
          return this.feedBackOptions;
        }
      },
      isEmbed() {
        // 是不是嵌入
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
    },
    created() {
      this.roomBaseState = this.roomBaseServer.state;
      this.webinarTag = this.roomBaseState.webinarTag || {};
      this.embedObj = this.roomBaseState.embedObj;
    },
    methods: {
      radioChange() {
        this.selectValue = 1;
      },
      openFeedHandler() {
        this.dialogFooterVisible = true;
      },
      closeFeedHandler() {
        this.type = 1;
        this.selectValue = 1;
        this.desc = '';
        this.dialogFooterVisible = false;
      },
      feedExecuteHandler() {
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          let params = {
            webinar_id: this.$route.params.id,
            type: this.selectValue
          };
          if (this.desc.trim()) {
            params = Object.assign({}, params, {
              content: this.desc.trim()
            });
          }
          if (params.content && params.content.length > 1000) {
            this.$message({
              message: this.$t('footer.footer_1018'),
              showClose: true,
              // duration: 0,
              type: 'error',
              customClass: 'zdy-info-box'
            });
            return;
          }
          if (this.type == 1) {
            params.source = 1; // 2app 3小助手
            this.roomBaseServer
              .feedbackInfo({ ...params })
              .then(res => {
                if (res.code == 200) {
                  this.$message({
                    message: this.$t('footer.footer_1019'),
                    showClose: true,
                    // duration: 0,
                    type: 'success',
                    customClass: 'zdy-info-box'
                  });
                  this.closeFeedHandler();
                } else {
                  this.$message({
                    message: this.$tec(res.code) || res.msg,
                    showClose: true,
                    // duration: 0,
                    type: 'error',
                    customClass: 'zdy-info-box'
                  });
                }
              })
              .catch(e => {
                this.$message({
                  message: e.msg,
                  showClose: true,
                  // duration: 0,
                  type: 'error',
                  customClass: 'zdy-info-box'
                });
              });
          } else {
            this.roomBaseServer
              .tipOffInfo({
                ...params
              })
              .then(res => {
                if (res.code == 200) {
                  this.$message({
                    message: this.$t('footer.footer_1019'),
                    showClose: true,
                    // duration: 0,
                    type: 'success',
                    customClass: 'zdy-info-box'
                  });
                  this.closeFeedHandler();
                } else {
                  this.$message({
                    message: this.$tec(res.code) || res.msg,
                    showClose: true,
                    // duration: 0,
                    type: 'error',
                    customClass: 'zdy-info-box'
                  });
                }
              })
              .catch(e => {
                this.$message({
                  message: e.msg,
                  showClose: true,
                  // duration: 0,
                  type: 'error',
                  customClass: 'zdy-info-box'
                });
              });
          }
        }, 300);
      }
    }
  };
</script>
<style lang="less">
  .vmp-footer {
    color: var(--footer-color-font);
    width: 100%;
    padding: 24px 0;
    &_text {
      font-size: 14px;
      text-align: center;
      a {
        color: var(--footer-color-font);
        &:hover {
          color: var(--theme-color);
        }
      }
      span {
        cursor: pointer;
        &:hover {
          color: var(--theme-color);
        }
      }
    }
    &_main {
      &_submit {
        display: flex;
        justify-content: center;
        align-items: flex-end;
        flex-direction: column;
      }
      .el-form-item__label {
        color: #1a1a1a;
      }
      .el-select {
        width: 100%;
      }
    }
  }
</style>
