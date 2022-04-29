<template>
  <div class="vmp-virtual">
    <el-dialog
      title="虚拟人数"
      :visible.sync="virtualVisible"
      :before-close="virtualClose"
      width="440px"
    >
      <div class="vmp-virtual-wrap">
        <div class="vmp-virtual-wrap-contaner">
          <div class="vmp-virtual-wrap-contaner-real">
            实际数据：{{ person.onlineNum }}人在线
            <span style="color: #1a1a1a">｜</span>
            {{ virtualText }} {{ person.pv }}&nbsp;&nbsp;
            <el-tooltip effect="dark" placement="right">
              <i class="iconfont iconicon_help_m"></i>
              <div slot="content">
                1.人数：当前活动在线人数
                <br />
                2.{{ virtualText }}：创建至今，进入观看页面（直播和回放、点播）的浏览量
              </div>
            </el-tooltip>
          </div>
          <div class="vmp-virtual-wrap-contaner-online">
            <p class="vmp-virtual-wrap-contaner-online-num">
              <template v-if="virtualType == 1">
                <span>{{ totalOnlineNum }}</span>
                人在线 &nbsp;&nbsp;|&nbsp;&nbsp;热度
                <span>{{ totalPv }}</span>
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
            <el-form label-width="70px" :rules="virtualRules" :model="formInfo" ref="formInfo">
              <el-form-item label="执行时间" prop="time">
                <el-input placeholder="1 - 120" v-model="formInfo.time" :disabled="!addStatus">
                  <b slot="suffix">分</b>
                </el-input>
              </el-form-item>
              <el-form-item label="人数增加" prop="onlineNum" v-if="virtualType == 1">
                <el-input
                  placeholder="请输入内容"
                  v-model="formInfo.onlineNum"
                  :disabled="!addStatus"
                >
                  <b slot="suffix">人</b>
                </el-input>
              </el-form-item>
              <el-form-item :label="virtualType == 1 ? '热度增加' : '观看次数'" prop="pv">
                <el-input placeholder="请输入内容" v-model="formInfo.pv" :disabled="!addStatus">
                  <b slot="suffix">次</b>
                </el-input>
              </el-form-item>
            </el-form>
          </div>
        </div>
        <div class="vmp-virtual-wrap-btn">
          <div class="vmp-virtual-wrap-btn-left">
            <div v-if="virtualType == 2">
              <span>观看端显示</span>
              <el-switch
                v-model="formInfo.watchShow"
                active-color="#dee1ff"
                inactive-color="#ffd021"
              ></el-switch>
            </div>
          </div>
          <div class="vmp-virtual-wrap-btn-right">
            <el-button
              type="primary"
              round
              size="medium"
              v-if="addStatus"
              @click="addVirtualPeople"
            >
              开始添加
            </el-button>
            <el-button type="primary" round size="medium" v-else>
              <span class="virtual-adding">正在添加</span>
              <span class="virtual-stop" @click="stopAddNumFun">结束添加</span>
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import { useVirtualAudienceServer } from 'middle-domain';
  import CountTo from './js/countTo';
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
        webinarId: this.$route.params.id,
        addCount: 0,
        virtualText: '热度',
        virtualType: 1, // 1:是saas； 2:知客
        formInfo: {
          time: '',
          onlineNum: 80,
          pv: 100,
          watchShow: false
        },
        status: {
          onlineNum: true,
          pv: true
        },
        virtualRules: {
          time: [{ validator: validateTime, trigger: 'blur' }],
          onlineNum: [{ validator: validateOnline, trigger: 'blur' }],
          pv: [{ validator: validatePv, trigger: 'blur' }]
        },
        setIntervalVirtual: null,
        person: {},
        onlineNumCountTo: new CountTo(),
        pvCountTo: new CountTo()
      };
    },
    watch: {
      addStatus(newVal) {
        if (newVal) {
          this.formInfo.time = '';
          this.formInfo.onlineNum = 80;
          this.formInfo.pv = 100;
        }
      }
    },
    beforeCreate() {
      this.virtualAudienceServer = useVirtualAudienceServer();
    },
    computed: {
      totalOnlineNum() {
        // 总在线人数（真实+虚拟）
        return Number(this.person.onlineNum + this.person.baseOnlineNum);
      },
      totalPv() {
        // 总观看人数/热度（真实+虚拟）
        return Number(this.person.basePv + this.person.pv);
      },
      addStatus() {
        return this.status.pv && this.status.onlineNum;
      }
    },
    methods: {
      openVirtualDialog(info) {
        this.virtualVisible = true;
        this.virtualText = info.type == 1 ? '热度' : '观看次数';
        this.virtualType = info.type;
        this.getVirtualPerson();
        this.getVirtualInterval();
      },
      addVirtualPeople() {
        this.$refs.formInfo.validate(valid => {
          if (valid) {
            this.status.onlineNum = false;
            this.status.pv = false;
            this.virtualAudienceServer
              .virtualClientStart({
                webinar_id: this.webinarId
              })
              .then(res => {
                if (res.code == 200) {
                  this.addCount++;
                  this.addVirtualOnline();
                  this.addVirtualPv();
                } else {
                  this.$message.warning(res.msg);
                }
              });
          } else {
            return false;
          }
        });
      },
      addVirtualOnline() {
        this.onlineNumCountTo.start(
          0,
          this.formInfo.onlineNum,
          Number(this.formInfo.time) * 60,
          0.2,
          (count, lastStep, step) => {
            // onlineNum修改
            this.virtualAudienceServer
              .virtualAccumulation({
                webinar_id: this.webinarId,
                online: count,
                pv: 0
              })
              .then(res => {
                console.warn('在线人数成功---', res.data);
                if (lastStep) {
                  this.status.onlineNum = true;
                }
                this.person.baseOnlineNum = Number(this.person.baseOnlineNum) + Number(count);
              })
              .catch(res => {
                this.$message.error(res.msg);
                this.status.onlineNum = true;
                this.onlineNumCountTo.stop();
              });
          }
        );
      },
      addVirtualPv() {
        this.pvCountTo.start(
          0,
          this.formInfo.pv,
          Number(this.formInfo.time) * 60,
          0.2,
          (count, lastStep, step) => {
            // pv修改
            this.virtualAudienceServer
              .virtualAccumulation({
                webinar_id: this.webinarId,
                pv: count,
                online: 0
              })
              .then(res => {
                if (lastStep) {
                  this.status.pv = true;
                }
                this.person.basePv = Number(this.person.basePv) + Number(count);
              })
              .catch(res => {
                this.status.pv = true;
                this.pvCountTo.stop();
                this.$message.error(res.msg);
              });
          }
        );
      },
      stopAddNumFun() {
        this.status.pv = true;
        this.status.onlineNum = true;
        console.log(this.addStatus, '??!234哈哈哈哈');
        this.onlineNumCountTo.stop();
        this.pvCountTo.stop();
      },
      getVirtualPerson() {
        this.virtualAudienceServer
          .virtualClientGet({
            webinar_id: this.webinarId
          })
          .then(res => {
            if (res.code == 200) {
              const { person, addCount } = this.virtualAudienceServer.state;
              this.person = person;
              this.addCount = addCount;
            }
          });
      },
      getVirtualInterval() {
        this.setIntervalVirtual = setInterval(() => {
          this.getVirtualPerson();
        }, 5000);
      },
      virtualClose() {
        this.virtualVisible = false;
        this.$refs.formInfo.resetFields();
        if (this.setIntervalVirtual) {
          clearInterval(this.setIntervalVirtual);
        }
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
          color: @font-error-low;
        }
        .iconfont {
          color: @font-light-low;
          font-size: 16px;
        }
      }
      &-online {
        width: 300px;
        height: 92px;
        color: @font-light-normal;
        background: @bg-virtual;
        border-radius: 4px;
        border: 1px solid @border-virtual;
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
          color: @font-light-low;
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
