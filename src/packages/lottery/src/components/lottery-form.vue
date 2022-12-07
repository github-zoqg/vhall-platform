<template>
  <div class="lottery-dialog-content">
    <el-form ref="form" label-width="100px" :style="{ width: '100%' }">
      <el-form-item label="参与条件">
        <el-select style="width: 280px" v-model="joinLotteryType" placeholder="请选择">
          <el-option
            style="width: 279px"
            v-for="item in joinLotteryTypeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
        <el-tooltip
          placement="right"
          :visible-arrow="false"
          popper-class="transfer-box"
          style="margin-left: 4px"
        >
          <i class="vh-iconfont vh-line-question" style="color: #999"></i>
          <div slot="content">
            1、全体参会者：所有参会的观众拥有参与抽奖的资格
            <br />
            2、参与签到的用户：参与签到的观众有参与抽奖的资格
            <br />
            3、参与问卷的用户：参与问卷填写的观众有参与抽奖的资格
            <br />
            4、口令抽奖：开始抽奖后，观众收到抽奖提示，需要输入
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;主办方指定的口令后才能参与抽奖
          </div>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="参与口令" v-show="joinLotteryType == 8">
        <el-input
          style="width: 280px"
          v-model="participationPass"
          maxlength="15"
          placeholder="有趣的口令会带来更多互动"
        >
          <span class="" slot="suffix">{{ participationPass.length }}/15</span>
        </el-input>
      </el-form-item>
      <el-form-item label="选择奖品">
        <el-select
          style="width: 280px"
          @change="prizeChange"
          value-key="prize_name"
          :disabled="prizeList.length == 0"
          v-model="prize"
          placeholder="默认奖品"
        >
          <el-option
            style="width: 280px"
            v-for="item in prizeList"
            :key="item.prize_id"
            :label="item.prize_name"
            :value="item"
          ></el-option>
        </el-select>
        <el-tooltip
          v-if="!hideItem"
          placement="right"
          :visible-arrow="false"
          popper-class="transfer-box"
          style="margin-left: 4px"
        >
          <i class="vh-iconfont vh-line-question" style="margin-left: 4px; color: #999"></i>
          <div slot="content">
            1、请在控制台-直播管理-抽奖中进行创建
            <br />
            2、选择提前设置好的奖品，抽奖结束后中奖
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;结果将显示设置的奖品图片
          </div>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="中奖人数" style="margin-bottom: 0px">
        <el-input
          style="width: 280px"
          v-model="prizeNum"
          maxlength="4"
          placeholder="请输入中奖人数"
        ></el-input>
        <div class="lottery-payment">
          <span>{{ getPrizeCount }}</span>
          人可参与抽奖
        </div>
      </el-form-item>
      <!-- 预设中奖 -->
      <el-form-item label="预设中奖" style="margin-bottom: 10px">
        <el-input
          v-model="userKeywords"
          style="width: 280px"
          class="search-user"
          placeholder="请输入用户名"
        >
          <span slot="append" @click="lotterySearch">搜索</span>
        </el-input>
        <ul class="user-list" v-if="userListShow">
          <li v-for="(item, index) in userList" :key="index" @click="selector(item, index)">
            <span class="name">{{ item.nickname }}</span>
            <span class="slect">选择</span>
          </li>
        </ul>
      </el-form-item>
      <ul v-if="chooseList.length" class="user-lists">
        <li v-for="(item, index) in chooseList" :key="index">
          <span>{{ item.nickname }}</span>
          <span class="vh-iconfont vh-line-close" @click="removeSelector(index)"></span>
        </li>
      </ul>
      <el-form-item size="mini" label="重复中奖" class="repeat-winning">
        <el-switch
          class="lottery-form-switch"
          v-model="repeatWinning"
          active-color="#FB3A32"
          inactive-color="#CECECE"
        ></el-switch>
        <span>
          {{ repeatWinning ? '已开启，已中奖者可再次参与抽奖' : '开启后，已中奖者可再次参与抽奖' }}
        </span>
      </el-form-item>
      <el-form-item size="mini" label="领奖信息" class="repeat-winning">
        <el-switch
          class="lottery-form-switch"
          v-model="needTakeAward"
          active-color="#FB3A32"
          inactive-color="#CECECE"
        ></el-switch>
        <span>
          {{
            needTakeAward
              ? '关闭后，中奖用户不需要填写领奖信息'
              : '开启后，中奖用户需要填写领奖信息'
          }}
        </span>
      </el-form-item>
      <el-form-item size="mini" label="中奖名单" class="repeat-winning">
        <el-switch
          class="lottery-form-switch"
          v-model="showWinner"
          active-color="#FB3A32"
          inactive-color="#CECECE"
        ></el-switch>
        <span>
          {{ showWinner ? '已开启，抽奖结束后显示中奖名单' : '开启后，抽奖结束后显示中奖名单' }}
        </span>
      </el-form-item>
      <div class="start-button">
        <el-button
          @click="startReward"
          type="primary"
          round
          class="common-but lottery-start"
          :disabled="startButtonDisabled"
        >
          开始抽奖
        </el-button>
      </div>
    </el-form>
  </div>
</template>
<script>
  // 发起抽奖表单组件
  export default {
    name: 'LotteryForm',
    inject: ['lotteryServer'],
    data() {
      return {
        getPrizeCount: 0, // 可参与人数
        prizeList: [], // 奖品列表
        choosePrize: '',
        joinLotteryType: '1', // 选中的参与条件
        joinLotteryTypeList: [
          // 可参与条件列表
          {
            value: '1',
            label: '全体参会者'
          },
          {
            value: '2',
            label: '参与问卷的用户'
          },
          {
            value: '3',
            label: '参与签到的用户'
          },
          {
            value: '8',
            label: '口令抽奖'
          }
        ],
        prize: {}, // 选中的奖品
        repeatWinning: false, // 是否可重复中奖
        participationPass: '', // 口令
        prizeNum: '', // 设置的中奖人数
        chooseList: [], // 预中奖人员
        userList: [], //
        userKeywords: '',
        userListShow: false,
        showWinner: false, // 中奖名单
        needTakeAward: true, // 是否需要填写中奖信息
        startButtonDisabled: false
      };
    },
    mounted() {
      this.resetForm();
    },
    computed: {
      // 权限配置
      configList() {
        return this.$domainStore.state.roomBaseServer.configList;
      },
      // 隐藏部分文案及选项(安利定制)
      hideItem() {
        return (
          this.configList['initiate_embed_function_close'] &&
          (this.$route.query.liveT ||
            this.$route.query.live_token ||
            this.$route.query.assistant_token)
        );
      }
    },
    watch: {
      joinLotteryType() {
        this.getLotteryCount();
      },
      repeatWinning() {
        this.getLotteryCount();
      },
      prizeNum(val) {
        this.prizeNum = `${val}`.replace(/^(0+)|[^\d]+/g, '');
      }
    },
    methods: {
      /**
       * 初始化发起状态
       */
      resetForm() {
        this.joinLotteryType = '1';
        this.needTakeAward = true;
        this.prize = {};
        this.updateLotteryUser().then(() => {
          const st = setTimeout(() => {
            clearTimeout(st); // 延迟1秒请求 防止用户数据量太大
            this.getLotteryCount();
          }, 1000);
        });
        this.getPrizeList();
      },
      /**
       * 获取奖品列表
       */
      getPrizeList() {
        this.lotteryServer
          .getPrizeList()
          .then(res => {
            this.prizeList = res.data.list;
          })
          .catch(() => {
            this.prizeList = [];
          });
      },
      /**
       * 更新在线人数
       */
      updateLotteryUser() {
        return this.lotteryServer.updateLotteryUser();
      },
      /**
       * 搜索预设中奖的人员
       */
      lotterySearch() {
        if (!this.userKeywords) return this.$message.warning('请输入中奖人用户名');
        this.lotteryServer
          .queryQualifiedPerson({
            keyword: this.userKeywords,
            lottery_type: this.joinLotteryType,
            is_repetition: this.repeatWinning ? 1 : 0
          })
          .then(res => {
            if (res.code === 200) {
              if (res.data.list.length > 0) {
                this.userList = res.data.list.filter(u => {
                  return !this.chooseList.some(c => {
                    return c.account_id === u.account_id;
                  });
                });
                this.userListShow = true;
              } else {
                this.$message.warning('搜索结果为空');
              }
            }
            return res;
          })
          .catch(err => {
            this.$message.error(err.msg);
          });
      },
      /**
       * 选择设为预设中奖的人员
       */
      selector(item) {
        this.chooseList.push(item);
        this.userListShow = false;
      },
      /**
       *移除预设中奖的人员
       */
      removeSelector(idx) {
        this.chooseList.splice(idx, 1);
      },
      prizeChange() {},
      /**
       * 获取可参与人数
       */
      getLotteryCount() {
        const failure = err => {
          this.getPrizeCount = 0;
          return err;
        };
        this.lotteryServer
          .queryQualifiedPerson({
            lottery_type: this.joinLotteryType,
            is_repetition: this.repeatWinning ? 1 : 0
          })
          .then(res => {
            if (res.code === 200) {
              this.getPrizeCount = res.data.count || 0;
            } else {
              failure(res);
            }
          })
          .catch(err => {
            failure(err);
          });
      },
      /**
       * 开始抽奖
       */
      startReward() {
        // 1.数据校验
        if (this.joinLotteryType == 8 && this.participationPass.trim() == '') {
          return this.$message.warning('参与口令不能为空');
        }
        if (!this.prizeNum) {
          return this.$message.warning('请输入中奖人数');
        }
        if (this.prizeNum > this.getPrizeCount) {
          this.$message.warning('中奖人数不可以大于参与抽奖人员数');
          return;
        }
        if (this.prizeNum > 2000) {
          return this.$message.warning('中奖人数不能超过2000');
        }
        console.warn(this.chooseList);
        // 2.组织参数
        const chooseUserArr = this.chooseList.map(item => {
          return item.account_id;
        });
        console.warn(chooseUserArr);
        const params = {
          lottery_type: this.joinLotteryType, // 1:全体参会者 2:参与问卷的用户 3:参与签到的用户 8:口令抽奖
          lottery_number: this.prizeNum, // 中奖人数(正整数)
          lottery_user_ids: chooseUserArr.join(',') || '', // 设置中奖用户ID
          is_repetition: this.repeatWinning ? 1 : 0, // 是否允许重复中奖1:允许0:不允许
          is_publish: this.showWinner ? 1 : 0, // 是否公布中奖名单1:公布0:不公布
          prize_id: this.prize?.prize_id || '', // 奖品ID
          need_take_award: this.needTakeAward ? 1 : 0
        };
        if (this.joinLotteryType == 8) {
          //  口令 <=15个字符, lottery_type=8时不能为空
          params.command = this.participationPass;
        }
        this.startButtonDisabled = true;
        const failure = err => {
          console.error(err);
          this.startButtonDisabled = false;
          this.$message.warning(err.msg);
        };
        this.lotteryServer
          .pushLottery(params)
          .then(res => {
            if (res.code === 200) {
              this.reportLottery();
              this.$emit('startLottery', res.data);
              this.startButtonDisabled = false;
            } else {
              failure(res);
            }
          })
          .catch(err => {
            failure(err);
          });
      },
      // 大数据上报
      reportLottery() {
        window.vhallReportForProduct && window.vhallReportForProduct.report(110029);
        const arrType = [110030, 110031, 110032];
        let lotteryCode = this.joinLotteryType == 8 ? 110033 : arrType[this.joinLotteryType - 1];
        window.vhallReportForProduct && window.vhallReportForProduct.report(lotteryCode);
        window.vhallReportForProduct && window.vhallReportForProduct.report(110034);
        window.vhallReportForProduct &&
          window.vhallReportForProduct.report(this.repeatWinning ? 110035 : 110036);
        window.vhallReportForProduct &&
          window.vhallReportForProduct.report(this.showWinner ? 110037 : 110038);
      }
    }
  };
</script>
<style lang="less">
  .repeat-winning {
    margin-bottom: 12px;
    .el-switch {
      margin-right: 5px;
      width: 28px;
      height: 16px;
      line-height: 16px;
      &__core {
        width: 100%;
        height: 16px;
      }
      &__core:after {
        width: 12px;
        height: 12px;
      }
    }
  }
  .lottery-dialog-content {
    .el-switch.is-checked .el-switch__core::after {
      margin-left: -13px;
    }
  }
</style>
<style lang="less" scoped>
  .lottery-dialog-content {
    padding: 10px 15px 25px 10px;
    display: flex;
    justify-content: center;
    .repeat-winning {
      margin-bottom: 12px;
      .el-switch {
        margin-right: 5px;
        width: 28px;
        height: 16px;
        line-height: 16px;
        &__core {
          width: 100%;
          height: 16px;
        }
        &__core:after {
          width: 12px;
          height: 12px;
        }
      }

      span {
        font-size: 14px;
        font-family: @fontRegular;
        font-weight: 400;
        color: #999;
        line-height: 20px;
      }
    }
  }
  .search-user {
    &.el-input {
      // border: 1px solid #ccc;
      border-radius: 4px;
    }
    .el-input__inner {
      border: 0;
    }
    .el-input-group__append,
    .el-input-group__prepend {
      background-color: #fff;
      border: 0;
      text-align: center;
    }
    span {
      cursor: pointer;
      color: #666;
    }
  }
  .lottery-payment {
    font-size: 12px;
    color: #999;
    margin-bottom: 0;
    height: 24px;
    line-height: 24px;
    span {
      color: #fb3a32;
    }
  }
  .el-input-group__append {
    padding: 0;
    color: #666;
    width: 52px;
    .el-button {
      padding: 0 30px;
    }
  }
  .start-button {
    position: relative;
    padding-bottom: 20px;
  }
  .lottery-start {
    color: #fff;
    display: block;
    border: 1px solid transparent;
    // margin: 0 auto;
    text-align: center;
    // line-height: 22px;
    width: 120px;
    position: absolute;
    right: 10px;
    bottom: -15px;
  }
  .user-list {
    position: absolute;
    top: 45px;
    background: #fff;
    width: 180px;
    border-radius: 3px;
    max-height: 500px;
    // overflow-y: auto;
    box-shadow: 0px 6px 12px 0px rgba(0, 0, 0, 0.15), 0px 2px 4px 0px rgba(0, 0, 0, 0.02);
    /* background: yellow; */
    // border: 1px solid lightgray;
    z-index: 1;
    float: left;
    li {
      float: left;
      width: 180px;
      height: 40px;
      font-size: 14px;
      line-height: 40px;
      color: #666;
      cursor: pointer;
      text-indent: 12px;
      .name {
        // display: inline-block;
        width: calc(100% - 50px);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        float: left;
        // &:hover {
        //   color: #1a1a1a;
        // }
      }
      .slect {
        cursor: pointer;
        color: #3562fa;
        float: right;
        padding-right: 10px;
      }
      &:hover {
        .name {
          color: #1a1a1a;
        }
      }
    }
  }
  .user-lists {
    overflow: hidden;
    margin-left: 100px;
    padding-bottom: 15px;
    li {
      margin-bottom: 5px;
      border-radius: 4px;
      float: left;
      padding: 0 8px;
      height: 32px;
      line-height: 32px;
      color: #666;
      margin-right: 8px;
      background: #f7f7f7;
      span {
        cursor: pointer;
        color: #666;
      }
      span:first-of-type {
        display: block;
        max-width: 120px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        float: left;
        color: #666;
        font-size: 12px;
      }
      span:last-of-type {
        float: left;
        display: block;
        cursor: pointer;
        text-align: center;
        padding-left: 8px;
        // transform: scale(0.5);
        // width: 15px;
        font-size: 12px;
      }
      .iconfont:hover {
        color: #fb3a32;
      }
    }
  }
  .lottery-form-switch {
    position: relative;
    top: -1px;
  }
</style>
<style lang="less">
  .search-user {
    .el-input__suffix {
      right: 0;
    }
  }
</style>
