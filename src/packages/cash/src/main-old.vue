<template>
  <div class="vmp-cash">
    <el-dialog
      v-if="dialogVisible"
      :title="$t('cash.cash_1001')"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      class="vmp-cash-dialog"
      width="365px"
      @close="closeDialog"
    >
      <div class="vmp-cash-wrap">
        <!-- 第一段，文案展示 -->
        <div class="vmp-cash-wrap-top">
          <div>
            <p class="vmp-cash-wrap-top__title">{{ $t('cash.cash_1002') }}</p>
            <p class="vmp-cash-wrap-top__money">
              ¥{{ useCashServer.state.cashInfo.red_packet_balance || '0.00' }}
            </p>
          </div>
          <div>
            <el-button
              :disabled="
                useCashServer.state.cashInfo.red_packet_balance < 1 ||
                useCashServer.state.cashInfo.in_red_withdraw
              "
              class="vmp-cash-red-button vmp-cash-length-middle"
              round
              :style="{ visibility: step === 0 ? 'visible' : 'hidden' }"
              @click="checkPhoneToWx"
            >
              {{
                useCashServer.state.cashInfo.in_red_withdraw == true
                  ? $t('cash.cash_1004')
                  : $t('cash.cash_1005')
              }}
              <div
                v-if="useCashServer.state.cashInfo.red_packet_balance < 1"
                class="vmp-cash_btn_hover"
              >
                {{ $t('cash.cash_1006') }}
              </div>
            </el-button>
            <div v-if="step !== 3" class="vmp-cash__question">
              <p>{{ $t('cash.cash_1007') }}</p>
              <div class="vmp-cash__question__box">
                <p class="vmp-cash__question__padding"></p>
                <div class="vmp-cash__question__ctx">
                  <p>Q1: {{ $t('cash.cash_1008') }}</p>
                  <p>A1: {{ $t('cash.cash_1009') }}</p>
                  <br />
                  <p>
                    <span>●</span>
                    {{ $t('cash.cash_1010') }}
                  </p>
                  <p>
                    <span>●</span>
                    {{ $t('cash.cash_1011') }}
                  </p>
                  <p>*{{ $t('cash.cash_1012') }}</p>
                  <br />
                  <p>Q2:{{ $t('cash.cash_1013') }}</p>
                  <p>A2: {{ $t('cash.cash_1014') }}</p>
                  <br />
                  <p>Q3: {{ $t('cash.cash_1015') }}</p>
                  <p>A3: {{ $t('cash.cash_1016') }}</p>
                  <br />
                  <p>Q4: {{ $t('cash.cash_1017') }}</p>
                  <p>A4: {{ $t('cash.cash_1018') }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 第二段-00， 200条数据 -->
        <div v-show="step === 0" class="vmp-cash-list-box">
          <div v-if="useCashServer.state.cashList.length > 0" class="vmp-cash-list">
            <ul>
              <li v-for="(item, index) in useCashServer.state.cashList" :key="index">
                <div>
                  <p>{{ item.type == 0 ? $t('cash.cash_1019') : $t('cash.cash_1005') }}</p>
                  <p>{{ item.time }}</p>
                </div>
                <div :class="item.type == 0 ? 'tag-green' : 'tag-red'">
                  <span>{{ item.type == 0 ? '+' : '-' }}</span>
                  <span>¥{{ item.money }}</span>
                </div>
              </li>
            </ul>
          </div>
          <div v-else class="vmp-cash-null-list">
            {{ $t('cash.cash_1020') }}
          </div>
        </div>

        <!-- 第二段-01， 绑定手机号 -->
        <div v-show="step === 1" class="vmp-cash__bind-phone">
          <el-form ref="bindForm" :model="bindForm" :rules="bindFormRules" label-width="0">
            <p class="cash-bind-notice">{{ $t('cash.cash_1021') }}</p>
            <el-form-item key="phone" prop="phone">
              <el-input
                v-model.trim="bindForm.phone"
                auto-complete="off"
                :placeholder="$t('account.account_1025')"
                :maxlength="30"
              />
            </el-form-item>
            <el-form-item
              v-if="step === 1"
              id="captcha-box"
              :class="cashCaptVo.eMsg_bind ? 'vmp-cash-box__msg__error__bottom' : ''"
            >
              <div id="captcha_bind">
                <el-input v-model.trim="bindForm.imgCode" style="display: none"></el-input>
              </div>
              <span v-if="cashCaptVo.eMsg_bind" class="vmp-cash-form-error">
                {{ $t('account.account_1028') }}
              </span>
            </el-form-item>
            <el-form-item key="code" prop="code" class="vmp-cash-wrap-code">
              <el-input
                v-model.trim="bindForm.code"
                clearable
                type="captcha"
                :maxlength="6"
                :placeholder="$t('account.account_1029')"
              ></el-input>
              <span
                type="danger"
                :disabled="cashCaptVo.btnCtrl_bind == 'disabled'"
                :class="['vmp-cash-code-btn', cashCaptVo.btnCtrl_bind]"
                @click.stop.prevent="getCaptha('bindForm', 'code')"
              >
                {{
                  cashCaptVo.sendCode_bind
                    ? $t('account.account_1031', { n: cashCaptVo.time_bind })
                    : $t('account.account_1030')
                }}
              </span>
              <!-- TODO 可能注释掉 -->
              <span v-if="cashCaptVo.codeErr_bind != ''" class="vmp-cash-form-error">
                {{ cashCaptVo.codeErr_bind }}
              </span>
            </el-form-item>
          </el-form>
          <el-button
            v-preventReClick
            class="vmp-cash-red-button vmp-cash__length-max"
            @click="cashPhoneToWx()"
          >
            {{ $t('cash.cash_1022') }}
          </el-button>
        </div>

        <!-- 第三段-02， 绑定提现微信 -->
        <div v-show="step === 2" class="vmp-cash__bind-wx">
          <div class="vmp-share__img__box">
            <img
              v-if="qrcode"
              :src="`//aliqr.e.vhall.com/qr.png?t=${encodeURIComponent(qrcode)}`"
              alt=""
            />
          </div>
          <p>{{ $t('cash.cash_1023') }}</p>
          <p>{{ $t('cash.cash_1024') }}</p>
        </div>

        <!-- 第四段-03， 提现表单 -->
        <div v-show="step === 3" class="vmp-cash__submit-wx">
          <el-form ref="cashForm" :model="cashForm" :rules="cashFormRules" label-width="0">
            <el-form-item key="money" prop="money">
              <el-input
                v-model.trim="cashForm.money"
                clearable
                oninput="this.value=this.value.replace(/[^\d^\.]+/g, '')"
                :placeholder="$t('cash.cash_1025')"
              ></el-input>
            </el-form-item>
            <el-form-item
              v-if="step === 3"
              id="captcha-box"
              :class="cashCaptVo.eMsg_cash ? 'vmp-cash-box__msg__error__bottom' : ''"
            >
              <div id="captcha_cash">
                <el-input v-model.trim="cashForm.imgCode" style="display: none"></el-input>
              </div>
              <span v-if="cashCaptVo.eMsg_cash" class="vmp-cash-form-error">
                {{ $t('account.account_1028') }}
              </span>
            </el-form-item>
            <el-form-item key="code" prop="code" class="vmp-cash-wrap-code">
              <el-input
                v-model.trim="cashForm.code"
                clearable
                type="captcha"
                :maxlength="6"
                :placeholder="$t('account.account_1029')"
              ></el-input>
              <span
                type="danger"
                :disabled="cashCaptVo.btnCtrl_cash == 'disabled'"
                :class="['vmp-cash-code-btn', cashCaptVo.btnCtrl_cash]"
                @click.stop.prevent="getCaptha('cashForm', 'code')"
              >
                {{
                  cashCaptVo.sendCode_cash
                    ? $t('account.account_1031', { n: cashCaptVo.time_cash })
                    : $t('account.account_1030')
                }}
              </span>
              <!-- TODO 可能注释掉 -->
              <span v-if="cashCaptVo.codeErr_cash != ''" class="vmp-cash-form-error">
                {{ cashCaptVo.codeErr_cash }}
              </span>
            </el-form-item>
            <el-form-item>
              <div class="vmp-wrap-cash-wx">
                <label class="vmp-wrap-cash__title">{{ $t('cash.cash_1026') }}</label>
                <div class="vmp-wrap-cash__avatar">
                  <img
                    v-show="!cashUserInfo.avatar"
                    src="data:image/png;base64,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"
                    alt=""
                  />
                  <img v-show="cashUserInfo.avatar" :src="cashUserInfo.avatar" alt="" />
                </div>
                <label class="vmp-wrap-cash__name">
                  {{
                    (cashUserInfo && cashUserInfo.nick_name ? cashUserInfo.nick_name : '')
                      | splitLenStr(6)
                  }}
                  {{
                    cashUserInfo && cashUserInfo.nick_name
                      ? `（${$t('account.account_1019')}）`
                      : `（${$t('account.account_1020')}）`
                  }}
                </label>
                <el-button
                  v-preventReClick
                  class="vmp-wrap-cash__btn"
                  type="text"
                  @click="changeWx"
                >
                  {{ $t('account.account_1004') }}
                </el-button>
              </div>
            </el-form-item>
          </el-form>
          <el-button
            v-preventReClick
            class="vmp-cash-red-button vmp-cash__length-max"
            @click="cashFormSubmit()"
          >
            {{ $t('cash.cash_1027') }}
          </el-button>
          <p class="vmp-cash-protol">
            <span>{{ $t('cash.cash_1028') }}</span>
            <span class="vmp-cash-link" @click="toCashProtol">{{ $t('cash.cash_1029') }}</span>
          </p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script src="./js/cash.js"></script>
<style lang="less">
  .vmp-cash {
    .vmp-cash-dialog {
      .el-dialog__header {
        padding: 24px 32px;
      }
      .el-dialog__body {
        height: auto;
        padding: 0 0 24px 0;
      }
    }
    .vmp-cash-wrap {
      .vmp-cash-length-middle {
        width: 92px;
        background: #fb3a32;
        border-radius: 20px;
        text-align: center;
        position: relative;
        .vmp-cash_btn_hover {
          display: none;
        }
        &.is-disabled:hover {
          .vmp-cash_btn_hover {
            display: block;
            position: absolute;
            top: -1px;
            border-radius: 4px;
            word-break: break-all;
            line-height: 20px;
            background: rgba(26, 26, 26, 0.8);
            font-size: 12px;
            color: #fff;
            padding: 8px 12px;
            text-align: left;
            right: 0;
          }
        }
      }
      .vmp-cash-form-error {
        position: absolute;
        left: 0;
        top: 43px;
        font-size: 12px;
        font-weight: 400;
        color: #fb3a32;
        line-height: 17px;
      }
      .vmp-cash__length-max {
        width: 100%;
        height: 40px;
        border-radius: 20px;
      }
      button.el-button.vmp-cash-red-button {
        background: #fb3a32;
        color: #ffffff;
        padding: 8px 12px;
        text-align: center;
        border: 1px solid #fb3a32;
        &:hover {
          color: #fff;
          background: #fc615b;
          border: 1px solid #fc615b;
        }
        &:focus {
          color: #fff;
          background: #fb3a32;
          border: 1px solid #fb3a32;
        }
        &:active {
          background: #e2332c;
          border: 1px solid #e2332c;
        }
        &.is-disabled {
          background: #f09d99;
          border: 1px solid #f09d99;
          cursor: not-allowed;
          color: #fff;
          &:hover,
          &:focus,
          &:active {
            background: #f09d99;
            border: 1px solid #f09d99;
          }
        }
      }
      .vmp-cash-wrap-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding-bottom: 13px;
        border-bottom: 1px solid #e6e6e6;
        margin: 0 32px;
        .vmp-cash-wrap-top__title {
          font-size: 14px;
          font-weight: 400;
          color: #1a1a1a;
          line-height: 20px;
        }
        .vmp-cash-wrap-top__money {
          font-size: 28px;
          font-weight: 800;
          color: #1a1a1a;
          line-height: 35px;
          font-family: Gilroy;
          span {
            font-size: 14px;
            color: #1a1a1a;
            font-weight: normal;
          }
        }
        .vmp-cash__question {
          text-align: center;
          margin-top: 12px;
          font-size: 14px;
          font-weight: 400;
          color: #3562fa;
          line-height: 20px;
          position: relative;
          cursor: pointer;
          .vmp-cash__question__box {
            display: none;
          }
          &:hover {
            .vmp-cash__question__box {
              display: block;
            }
          }
        }
        .vmp-cash__question__box {
          position: absolute;
          right: 0;
          top: 20px;
          background: transparent;
          z-index: 20;
          .vmp-cash__question__padding {
            height: 6px;
          }
        }
        .vmp-cash__question__ctx {
          width: 247px;
          height: 213px;
          background: rgba(0, 0, 0, 0.9);
          border-radius: 4px;
          padding: 23px 27px;
          text-align: left;
          overflow-y: auto;
          p {
            font-size: 12px;
            font-weight: 400;
            color: #ffffff;
            line-height: 17px;
            span {
              font-size: 20px;
            }
          }
        }
        .vmp-cash__question__ctx::-webkit-scrollbar {
          width: 6px;
          height: 71px;
          background: #7f7f7f;
          border-radius: 3px;
        }
        .vmp-cash__question__ctx::-webkit-scrollbar-thumb {
          background: #7f7f7f;
        }
        .vmp-cash__question__ctx::-webkit-scrollbar-track {
          background-color: rgba(0, 0, 0, 0.9);
        }
      }
      .vmp-cash-null-list {
        text-align: center;
        padding-top: 129px;
        font-size: 14px;
        font-weight: 400;
        color: #999999;
        line-height: 20px;
      }
      .vmp-cash-list-box {
        padding: 0 29px;
        overflow: auto;
        height: 260px;
        margin: 0 3px;
      }
      .vmp-cash-list-box::-webkit-scrollbar {
        width: 6px;
        height: 71px;
        background: #7f7f7f;
        border-radius: 3px;
      }
      .vmp-cash-list-box::-webkit-scrollbar-thumb {
        background: #7f7f7f;
      }
      .vmp-cash-list-box::-webkit-scrollbar-track {
        background-color: #ffffff;
      }
      .vmp-cash-list {
        li {
          list-style-type: none;
          border-bottom: 1px solid #e6e6e6;
          padding: 8px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          span:first-child {
            padding-right: 4px;
          }
          p {
            font-size: 14px;
            font-weight: 400;
            color: #1a1a1a;
            line-height: 20px;
            &:last-child {
              font-size: 14px;
              font-weight: 400;
              color: #999999;
              line-height: 14px;
            }
          }
          .tag-green {
            font-size: 14px;
            font-weight: 400;
            color: #14ba6a;
            line-height: 20px;
          }
          .tag-red {
            font-size: 14px;
            font-weight: 400;
            color: #fb3a32;
            line-height: 20px;
          }
        }
      }
      /* 验证手机号 */
      .vmp-cash__bind-phone {
        padding: 0 32px 8px 32px;
        .el-form-item {
          margin-bottom: 16px;
          &.vmp-cash-box__msg__error__bottom {
            margin-bottom: 24px;
          }
          &.is-error {
            margin-bottom: 24px;
          }
          &.vmp-cash-box__msg__error {
            margin-bottom: 24px;
          }
        }
        .cash-bind-notice {
          height: 47px;
          font-size: 14px;
          font-family: PingFangSC-Regular, PingFang SC;
          color: #fb3a32;
          line-height: 20px;
          margin-top: 12px;
        }
      }
      .vmp-cash-wrap-code {
        position: relative;
        .el-input__suffix {
          margin-right: 80px;
        }
      }
      .vmp-cash-code-btn {
        position: absolute;
        right: 10px;
        top: 0;
        border-radius: 4px;
        border: none;
        outline: none;
        height: 40px;
        font-size: 14px;
        font-weight: 400;
        line-height: 40px;
        text-align: right;
        &.disabled {
          cursor: not-allowed;
          color: #999999;
        }
        &.start {
          cursor: pointer;
          color: #fb3a32;
        }
        &.pending {
          cursor: not-allowed;
          color: #999999;
        }
      }
      .vmp-cash__bind-wx {
        text-align: center;
        .vmp-share__img__box {
          padding: 12px 0 7px 0;
          img {
            width: 215px;
            height: 215px;
          }
        }
        p {
          font-size: 14px;
          font-weight: 400;
          color: #1a1a1a;
          line-height: 20px;
        }
      }
      .vmp-cash__submit-wx {
        padding: 16px 32px 8px 32px;
        .el-form-item {
          margin-bottom: 16px;
          &.vmp-cash-box__msg__error__bottom {
            margin-bottom: 24px;
          }
          &.is-error {
            margin-bottom: 24px;
          }
          &.vmp-cash-box__msg__error {
            margin-bottom: 24px;
          }
        }
        .vmp-cash-protol {
          font-size: 14px;
          font-weight: 400;
          color: #999999;
          line-height: 20px;
          text-align: center;
          margin-top: 16px;
          .vmp-cash-link {
            color: #5cb8ff;
            cursor: pointer;
          }
        }
        .vmp-wrap-cash-wx {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          .vmp-wrap-cash__title {
            height: 20px;
            font-size: 14px;
            font-weight: 400;
            color: #1a1a1a;
            line-height: 20px;
            margin-right: 12px;
          }
          .vmp-wrap-cash__avatar {
            width: 24px;
            height: 24px;
            display: inline-block;
            vertical-align: middle;
            margin-right: 4px;
            border-radius: 100%;
            overflow: hidden;
            img {
              display: block;
              width: 100%;
              height: 100%;
              -o-object-fit: cover;
              object-fit: cover;
            }
          }
          label.vmp-wrap-cash__name {
            font-size: 14px;
            font-weight: 400;
            color: #1a1a1a;
            line-height: 20px;
          }
          .vmp-wrap-cash__btn {
            margin-left: auto;
            color: #3562fa;
          }
        }
      }
    }
  }
</style>
