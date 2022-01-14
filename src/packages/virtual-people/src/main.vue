<template>
  <div class="vmp-virtual">
    <el-dialog
      title="虚拟人数"
      :visible.sync="virtualVisible"
      :close-on-click-modal="false"
      width="440px"
    >
      <div class="vmp-virtual-wrap">
        <div class="vmp-virtual-wrap-contaner">
          <div class="vmp-virtual-wrap-contaner-real">
            实际数据：1人在线
            <span>｜</span>
            热度 66&nbsp;&nbsp;
            <el-tooltip effect="dark" placement="right">
              <i class="iconfont iconicon_help_m"></i>
              <div slot="content">
                1.人数：当前活动在线人数
                <br />
                2.热度：创建至今，进入观看页面（直播和回放、点播）的浏览量
              </div>
            </el-tooltip>
          </div>
          <div class="vmp-virtual-wrap-contaner-online">
            <p class="vmp-virtual-wrap-contaner-online-num">
              <template>
                <span>1</span>
                人在线 &nbsp;&nbsp;|&nbsp;&nbsp;热度
                <span>360</span>
              </template>
            </p>
            <p v-if="addCount == 0" class="vmp-virtual-wrap-contaner-online-vir">
              暂未添加虚拟人数
            </p>
            <p class="vmp-virtual-wrap-contaner-online-vir" v-else>
              已累计添加{{ addCount }}次虚拟人数
            </p>
          </div>
          <div class="vmp-virtual-wrap-contaner-form">
            <el-form label-width="70px" :rules="virtualRules" :model="formInfo">
              <el-form-item label="执行时间" prop="time">
                <el-input placeholder="1 - 120" v-model="formInfo.time" :disabled="addStatus">
                  <b slot="suffix">分</b>
                </el-input>
              </el-form-item>
              <el-form-item label="人数增加" prop="onlineNum">
                <el-input
                  placeholder="请输入内容"
                  v-model="formInfo.onlineNum"
                  :disabled="addStatus"
                >
                  <b slot="suffix">人</b>
                </el-input>
              </el-form-item>
              <el-form-item label="热度增加" prop="pv">
                <el-input placeholder="请输入内容" v-model="formInfo.pv" :disabled="addStatus">
                  <b slot="suffix">次</b>
                </el-input>
              </el-form-item>
            </el-form>
          </div>
        </div>
        <div class="vmp-virtual-wrap-btn">
          <div class="vmp-virtual-wrap-btn-left">
            <div v-if="isShowSwitch">
              <span>观看端显示</span>
              <el-switch
                v-model="formInfo.watchShow"
                active-color="#dee1ff"
                inactive-color="#ffd021"
              ></el-switch>
            </div>
          </div>
          <div class="vmp-virtual-wrap-btn-right">
            <el-button type="primary" round size="medium" v-if="!addStatus">开始添加</el-button>
            <el-button type="primary" round size="medium" v-else>
              <span class="virtual-adding">正在添加</span>
              <span class="virtual-stop">结束添加</span>
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  export default {
    name: 'VmpVirtualPeople',
    data() {
      const validateTime = (rule, value, callback) => {
        const re = /^\d+$/;
        value = Number(value);
        if (!re.test(value) || value > 120 || value <= 0) {
          callback(new Error('请输入1~120分的正整数'));
        } else {
          callback();
        }
      };
      const validateOnline = (rule, value, callback) => {
        const re = /^\d+$/;
        value = Number(value);
        const targetOnlineCount = Math.floor(this.formInfo.pv * 0.8);
        if (!re.test(value) || value <= 0 || value > 999999) {
          callback(new Error('请输入1-999999之间的正整数'));
        } else if (value > targetOnlineCount) {
          callback(new Error('在线人数不能大于观看次数的80%'));
        } else {
          callback();
        }
      };
      const validatePv = (rule, value, callback) => {
        const re = /^\d+$/;
        value = Number(value);
        const targetOnlineCount = Math.floor(value * 0.8);
        if (!re.test(value) || value > 999999 || value <= 0) {
          callback(new Error('请输入1-999999之间的正整数'));
        } else if (targetOnlineCount < this.formInfo.onlineNum) {
          callback(new Error('在线人数不能大于观看次数的80%'));
        } else {
          callback();
        }
      };
      return {
        virtualVisible: false,
        addCount: 0,
        addStatus: false,
        formInfo: {
          time: '',
          onlineNum: '',
          pv: 100,
          watchShow: false
        },
        isShowSwitch: false,
        virtualRules: {
          time: [{ validator: validateTime, trigger: 'blur' }],
          onlineNum: [{ validator: validateOnline, trigger: 'blur' }],
          pv: [{ validator: validatePv, trigger: 'blur' }]
        }
      };
    },
    methods: {
      openVirtualDialog() {
        this.virtualVisible = true;
      }
    }
  };
</script>
<style lang="less">
  .vmp-virtual-wrap {
    &-contaner {
      &-real {
        color: @font-light-normal;
        font-size: 14px;
        span {
          color: @font-dark-normal;
        }
        .iconfont {
          color: @font-light-low;
          font-size: 16px;
        }
      }
      &-online {
        width: 300px;
        height: 92px;
        color: #1a1a1a;
        background: rgba(255, 235, 235, 0.5);
        border-radius: 4px;
        border: 1px solid #fed8d6;
        text-align: center;
        margin-top: 10px;
        margin-left: 70px;
        &-num {
          font-size: 14px;
          padding-top: 18px;
          span {
            font-weight: 700;
            font-size: 24px;
          }
        }
        &-vir {
          margin-top: 9px;
          color: #999;
          font-size: 14px;
        }
      }
      &-form {
        width: 100%;
        font-size: 12px;
        padding-top: 16px;
        .el-form-item__label {
          text-align: left;
        }
      }
    }
    &-btn {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 24px;
      &-left {
        span {
          padding-right: 10px;
        }
      }
      &-right {
        .virtual-stop {
          display: none;
        }
        &:hover {
          .virtual-stop {
            display: block;
          }
          .virtual-adding {
            display: none;
          }
        }
      }
    }
  }
</style>
