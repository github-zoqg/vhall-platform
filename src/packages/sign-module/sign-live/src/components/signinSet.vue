<template>
  <el-form class="sign-form-wrap" :model="form" inline>
    <el-form-item label="签到提示">
      <el-input
        class="form-input"
        maxlength="15"
        show-word-limit
        v-model="form.signTip"
        @focus="tipFocus"
        @blur="tipBlur"
      ></el-input>
    </el-form-item>
    <el-form-item label="结束时长">
      <el-select class="form-input" v-model="form.duration" popper-class="sign-select">
        <el-option
          v-for="(opt, idx) in durationOps"
          :key="idx"
          :label="opt.label"
          :value="opt.value"
          class="sign-form-wrap-select"
        ></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="自动签到">
      <el-switch
        @change="autoSignChange"
        v-model="form.autoSign"
        active-color="#FB3A32"
      ></el-switch>
      <el-tooltip placement="right">
        <div class="sign-form-wrap-tip" slot="content" style="background: #333">
          <div>1.默认关闭；</div>
          <div>2.开启自动签到后，观众将在设置的时间收到签到提示；</div>
          <div>3.活动结束或回放时，观看者收不到签到提示。</div>
        </div>
        <i class="vh-iconfont vh-line-question" style="vertical-align: middle"></i>
      </el-tooltip>
    </el-form-item>
    <el-form-item label="间隔时长" v-show="form.autoSign">
      <el-select class="form-input" v-model="form.interval" popper-class="sign-select">
        <el-option
          v-for="(opt, idx) in intervalOps"
          :key="idx"
          :label="opt.label"
          :value="opt.value"
          class="select-option"
        ></el-option>
      </el-select>
      <el-tooltip placement="right" class="form-input-tip">
        <div class="tip-content" slot="content" style="background: #333">
          <div>
            签到间隔时长：开启自动签到后，设置好每次签到的间隔时间，观众将在指定时间收到签到提示
          </div>
        </div>
        <i class="vh-iconfont vh-line-question" style="padding-left: 6px"></i>
      </el-tooltip>
    </el-form-item>
    <div class="sign-form-wrap-start">
      <el-button
        type="primary"
        round
        class="sign-form-wrap-start-btn"
        @click="$emit('start', form)"
      >
        开始签到
      </el-button>
    </div>
  </el-form>
</template>

<script>
  export default {
    name: 'SigninSet',
    data() {
      const tipText = '主持人发起了签到';
      return {
        defaultText: tipText,
        form: {
          signTip: tipText, // 签到提示语
          duration: 30, // 签到显示的时间，单位秒，
          autoSign: false, // 是否自动发起签到，1自动，0取消自动
          interval: 900 // 自动发起签到的轮询定时时间，单位秒
        },
        durationOps: [
          {
            value: 10,
            label: '10秒'
          },
          {
            value: 30,
            label: '30秒'
          },
          {
            value: 60,
            label: '60秒'
          },
          {
            value: 120,
            label: '2分钟'
          },
          {
            value: 180,
            label: '3分钟'
          }
        ],
        intervalOps: [
          {
            value: 60,
            label: '1分钟'
          },
          {
            value: 300,
            label: '5分钟'
          },
          {
            value: 900,
            label: '15分钟'
          },
          {
            value: 1800,
            label: '30分钟'
          }
        ]
      };
    },
    mounted() {
      if (process.env.VUE_APP_NODE_ENV != 'test' && process.env.VUE_APP_NODE_ENV != 'development') {
        this.intervalOps = this.intervalOps.slice(1);
      }
    },
    methods: {
      autoSignChange(value) {
        console.warn('test----自动签到  改变值', value);
        // window.sessionStorage.setItem('isAutoSign', value)
      },
      tipFocus(e) {
        if (e.target.value === this.defaultText) {
          this.form.signTip = '';
        }
      },
      tipBlur(e) {
        if (e.target.value === '') {
          this.form.signTip = this.defaultText;
        }
      }
    }
  };
</script>

<style lang="less">
  .sign-form-wrap {
    margin: 0 auto;
    .el-form-item {
      margin-right: 0;
      width: 100%;
      .el-form-item__label {
        width: 76px;
      }
      .el-form-item__content {
        width: calc(100% - 76px);
        .form-input {
          width: 100%;
          &-tip {
            position: absolute;
            left: 100%;
          }
        }
      }
    }
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
    .el-switch.is-checked .el-switch__core::after {
      margin-left: -13px;
    }
    &-select {
      line-height: 40px !important;
      &:hover {
        background-color: #f7f7f7;
      }
      &.hover {
        font-weight: normal;
        background: none;
      }
      &:hover {
        background-color: #f7f7f7;
      }
      &.selected {
        background-color: #f7f7f7;
        font-weight: normal;
        color: #606266;
      }
    }
    &-tip {
      line-height: 18px;
      font-size: 12px;
      width: 238px;
      font-family: @fontRegular;
      font-weight: 400;
      color: #ffffff;
      line-height: 18px;
    }
    &-start {
      text-align: right;
      &-btn {
        text-align: center;
        width: 120px;
        background: #fb3a32;
        color: #fff;
        line-height: 20px;
      }
    }
    .vh-iconfont {
      color: #999;
      font-size: 14px;
    }
  }
</style>
