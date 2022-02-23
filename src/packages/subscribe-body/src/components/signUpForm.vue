<template>
  <div class="signFormBox">
    <div class="signWrap">
      <overlay-scrollbars ref="osComponentRef" :options="osComponentOptions" style="height: 100%">
        <div class="entryFormBox">
          <header>
            <img :src="baseInfo.cover ? `${uploadBase}${baseInfo.cover}` : defaultHeader" alt="" />
          </header>
          <article>
            <h1 class="pageTitle">{{ baseInfo.title }}</h1>
            <p
              v-if="baseInfo.intro"
              ref="intro"
              :class="['pageIntro', overflowStatus == 1 ? 'pageIntroEllipsis' : '']"
            >
              {{ baseInfo.intro }}
              <span v-show="overflowStatus == 1" class="textTail" @click="handleUnfold(2)">
                <span class="isEllipsis">...</span>
                {{ $t('form.form_1011') }}
              </span>
              <span v-show="overflowStatus == 2" class="textTail" @click="handleUnfold(1)">
                <span class="isEllipsis"></span>
                {{ $t('form.form_1012') }}
              </span>
            </p>
            <div v-if="isSubscribe === 1" class="tabsBox">
              <div :class="['tabs', baseInfo.theme_color + '1']">
                <div :class="{ active: tabs == 1 }" @click="changeTab(1)">
                  {{ $t(baseInfo.tab_form_title) }}
                </div>
                <div :class="{ active: tabs == 2 }" @click="changeTab(2)">
                  {{ $t(baseInfo.tab_verify_title) }}
                </div>
              </div>
            </div>
            <div v-if="isSubscribe === 2" class="tabsBox">
              <div :class="['tabs', baseInfo.theme_color + '1']">
                <div :class="{ active: tabs == 2 }" @click="changeTab(2)">
                  {{ $t(baseInfo.tab_verify_title) }}
                </div>
                <div :class="{ active: tabs == 1 }" @click="changeTab(1)">
                  {{ $t(baseInfo.tab_form_title) }}
                </div>
              </div>
            </div>
            <!-- 报名表单 -->
            <template>
              <el-form
                v-show="tabs === 1"
                ref="form"
                :model="form"
                class="entryForm"
                :rules="rules"
              >
                <el-form-item
                  v-for="(question, quesIndex) in list"
                  v-show="question.type != 6"
                  :key="question.id"
                  :prop="question.id + ''"
                  :label="
                    question.subject === '隐私声明'
                      ? ''
                      : `${quesIndex < 9 ? `0${quesIndex + 1}` : quesIndex + 1}.${$t(
                          question.subject
                        )}`
                  "
                >
                  <!-- 输入框 -->
                  <template
                    v-if="
                      (question.type === 0 && question.default_type !== 4) || question.type === 1
                    "
                  >
                    <VhallInput
                      v-if="question.type == 0 && question.default_type == 2"
                      v-model.number="form[question.id]"
                      :maxlength="question.type == 0 ? '' : 60"
                      :show-word-limit="question.type != 0"
                      autocomplete="off"
                      :placeholder="placeholderList[question.default_type] || $t('form.form_1014')"
                    ></VhallInput>
                    <VhallInput
                      v-else
                      v-model="form[question.id]"
                      :maxlength="
                        question.type == 0 && question.default_type == 1
                          ? 50
                          : question.type == 0
                          ? ''
                          : 60
                      "
                      :show-word-limit="question.type != 0"
                      autocomplete="off"
                      :placeholder="placeholderList[question.default_type] || $t('form.form_1014')"
                    ></VhallInput>
                  </template>
                  <!-- 单选 -->
                  <template v-if="question.default_type === 4 || question.type === 2">
                    <el-radio-group v-model="form[question.id]">
                      <template v-if="question.default_type === 4">
                        <div>
                          <el-radio :label="$t('form.form_1015')" name="gender"></el-radio>
                        </div>
                        <div>
                          <el-radio :label="$t('form.form_1016')" name="gender"></el-radio>
                        </div>
                      </template>
                      <template v-else>
                        <div v-for="radioItem in question.items" :key="radioItem.id">
                          <el-radio :label="radioItem.id" :name="question.id + ''">
                            {{ radioItem.subject }}
                          </el-radio>
                          <template v-if="radioItem.type === 1">
                            <VhallInput
                              v-show="form[question.id] == radioItem.id"
                              v-model="form[`${question.id}${radioItem.id}`]"
                              maxlength="60"
                              autocomplete="off"
                              show-word-limit
                              :placeholder="$t('form.form_1017')"
                              style="margin-top: 10px"
                              class="radioInput"
                            ></VhallInput>
                          </template>
                        </div>
                      </template>
                    </el-radio-group>
                  </template>
                  <!-- 多选 -->
                  <template v-if="question.type === 3">
                    <el-checkbox-group v-model="form[question.id]">
                      <div v-for="checkItem in question.items" :key="checkItem.id">
                        <el-checkbox :label="checkItem.id" :name="question.id + ''">
                          {{ checkItem.subject }}
                        </el-checkbox>
                        <template v-if="checkItem.type === 1">
                          <VhallInput
                            v-show="form[question.id].some(id => id == checkItem.id)"
                            v-model="form[`${question.id}${checkItem.id}`]"
                            :maxlength="60"
                            autocomplete="off"
                            show-word-limit
                            :placeholder="$t('form.form_1017')"
                            style="margin-top: 10px"
                            class="radioInput"
                          ></VhallInput>
                        </template>
                      </div>
                    </el-checkbox-group>
                  </template>
                  <!-- 下拉 -->
                  <template v-if="question.type === 4">
                    <el-select
                      ref="autoCloseRefFlag"
                      v-model="form[question.id]"
                      :placeholder="$t('form.form_1018')"
                    >
                      <el-option
                        v-for="option in question.items"
                        :key="option.id"
                        :label="option.subject"
                        :value="option.subject"
                      ></el-option>
                    </el-select>
                  </template>
                  <!-- 地域选择 -->
                  <template v-if="question.type === 5">
                    <el-row :gutter="20">
                      <el-col :span="question.colNum">
                        <VhallInput
                          v-show="false"
                          v-model="form[question.id]"
                          autocomplete="off"
                        ></VhallInput>
                        <el-select
                          ref="autoCloseRefFlag"
                          v-model="province"
                          :placeholder="$t('form.form_1004')"
                          @change="regionalChange('province')"
                        >
                          <el-option
                            v-for="opt in provinces"
                            :key="opt.value"
                            :label="opt.label"
                            :value="opt.value"
                          ></el-option>
                        </el-select>
                      </el-col>
                      <el-col v-if="question.options.show_city == 1" :span="question.colNum">
                        <el-select
                          ref="autoCloseRefFlag"
                          v-model="city"
                          :placeholder="$t('form.form_1005')"
                          @change="regionalChange('city')"
                        >
                          <el-option
                            v-for="opt in cityList"
                            :key="opt.value"
                            :label="opt.label"
                            :value="opt.value"
                          ></el-option>
                        </el-select>
                      </el-col>
                      <el-col v-if="question.options.show_district == 1" :span="question.colNum">
                        <el-select
                          ref="autoCloseRefFlag"
                          v-model="county"
                          :placeholder="$t('form.form_1006')"
                          @change="regionalChange('county')"
                        >
                          <el-option
                            v-for="opt in countyList"
                            :key="opt.value"
                            :label="opt.label"
                            :value="opt.value"
                          ></el-option>
                        </el-select>
                      </el-col>
                    </el-row>
                  </template>
                </el-form-item>
                <el-form-item
                  v-if="isPhoneValidate"
                  class="verifyCodeBox"
                  :required="false"
                  prop="code"
                >
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <div id="setCaptcha" class="captcha">
                        <VhallInput v-model.trim="form.imgCode" autocomplete="off"></VhallInput>
                        <!-- <p class="errorText" v-show="errorMsgShow">图形码错误</p> -->
                      </div>
                    </el-col>
                    <el-col :span="12">
                      <VhallInput
                        v-model.trim="form.code"
                        auto-complete="off"
                        :placeholder="$t('form.form_1020')"
                      ></VhallInput>
                      <el-button
                        :disabled="time !== 60 || isPreview"
                        :class="showCaptcha && isValidPhone ? 'isLoginActive' : 'no-border'"
                        size="mini"
                        @click="time === 60 && getDyCode(true)"
                      >
                        {{ time === 60 ? $t('form.form_1021') : `${time}s` }}
                      </el-button>
                    </el-col>
                  </el-row>
                </el-form-item>
                <el-form-item v-if="provicy" class="provicy-item" :prop="provicy.id + ''">
                  <!-- 隐私声明 -->
                  <template>
                    <el-checkbox v-model="form[provicy.id]" class="provicy-checkbox">
                      <p v-html="provicyText"></p>
                    </el-checkbox>
                  </template>
                </el-form-item>
                <div class="btnBox">
                  <el-button
                    style="margin-top: 11px"
                    :disabled="isPreview"
                    :class="[baseInfo.theme_color + '1']"
                    round
                    type="primary"
                    @click="submitForm"
                  >
                    {{ $t('form.form_1019') }}
                  </el-button>
                </div>
              </el-form>
            </template>

            <!-- 验证 -->
            <template>
              <el-form
                v-show="tabs === 2"
                ref="verifyForm"
                class="entryForm"
                :model="verifyForm"
                :rules="verifyRules"
              >
                <el-form-item :label="$t('form.form_1022')" prop="phone">
                  <VhallInput
                    v-model.number.trim="verifyForm.phone"
                    type="number"
                    auto-complete="off"
                    :placeholder="$t('account.account_1025')"
                  ></VhallInput>
                </el-form-item>
                <el-form-item v-if="isPhoneValidate" class="verifyCodeBox" prop="code">
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <div id="setCaptcha1" class="captcha">
                        <VhallInput
                          v-model.trim="verifyForm.imgCode"
                          autocomplete="off"
                        ></VhallInput>
                      </div>
                      <!-- <p class="errorText" v-show="verifyErrorMsgShow">验证失败，请重试</p> -->
                    </el-col>
                    <el-col :span="12">
                      <VhallInput
                        v-model.trim="verifyForm.code"
                        auto-complete="off"
                        :placeholder="$t('form.form_1076')"
                      ></VhallInput>
                      <el-button
                        :disabled="verifyTime !== 60 || isPreview"
                        :class="showCaptcha && isValidPhone ? 'isLoginActive' : 'no-border'"
                        size="mini"
                        @click="verifyTime === 60 && getDyCode(false)"
                      >
                        {{ verifyTime === 60 ? $t('form.form_1021') : `${verifyTime}s` }}
                      </el-button>
                    </el-col>
                  </el-row>
                </el-form-item>
                <div class="btnBox">
                  <el-button
                    :disabled="isPreview"
                    :class="[baseInfo.theme_color + '1']"
                    round
                    type="primary"
                    @click="submitVerify"
                  >
                    {{ $t('interact_tools.interact_tools_1019') }}
                  </el-button>
                </div>
              </el-form>
            </template>
          </article>
        </div>
      </overlay-scrollbars>
      <!-- <vhscroll @handle-scroll="handleAutoCloseSelect">

      </vhscroll> -->
      <i v-if="!isEntryForm" class="closeBtn" @click="closePreview">
        <img width="14px" src="../img/icon_close.png" alt="" />
      </i>
    </div>
  </div>
</template>

<script>
  // TODO整个待翻译
  import { mapState } from 'vuex';
  import { validEmail } from '@/utils/validate.js';
  import defaultHeader from '../img/formHeader.png';
  import VhallInput from './input';
  export default {
    components: {
      VhallInput
    },
    data() {
      return {
        uploadBase: process.env.VUE_APP_UPLOAD_BASE,
        webinar_id: this.$route.params.id || this.$route.params.str || this.$route.params.il_id,
        isEntryForm: this.$route.path.indexOf('/entryform') !== -1, // 是否是独立表单
        isPreview: this.$route.path.indexOf('/live/signup') !== -1,
        isSubscribe: 0,
        isValidPhone: false,
        colorIndex: 'red',
        tabs: 0,
        province: '',
        city: '',
        county: '',
        provinces: [],
        cities: {},
        counties: {},
        list: [],
        isPhoneValidate: false,
        currentPhone: '',
        errorMsgShow: false,
        showCaptcha: false, // 专门用于 校验登录次数 接口返回 需要显示图形验证码时使用
        captchakey: 'b7982ef659d64141b7120a6af27e19a0', // 云盾key
        mobileKey: '', // 云盾值
        captcha1: null, // 云盾实例
        captcha2: null, // 云盾实例
        time: 60,
        provicy: false,
        provicyText: '',
        placeholderL: ['', ''],
        placeholderList: {
          1: this.$t('interact_tools.interact_tools_1005'),
          2: this.$t('account.account_1025'),
          3: this.$t('form.form_1023'),
          5: {
            province: this.$t('form.form_1003'),
            city: this.$t('form.form_1004'),
            county: this.$t('form.form_1005')
          },
          6: this.$t('form.form_1020')
        },
        rules: {},
        form: {},
        answer: {},
        baseInfo: {
          cover: 1,
          open_link: 0,
          theme_color: 'red',
          tab_verify_title: this.$t('form.form_1024'),
          tab_form_title: this.$t('form.form_1025'),
          intro: ''
        },
        verifyForm: {
          phone: '',
          imgCode: ''
        },
        verifyRules: {
          phone: {
            type: 'number',
            required: true,
            message: this.$t('acount.account_1069'),
            trigger: 'blur'
          },
          code: {
            required: true,
            validator: this.validCode,
            trigger: 'blur'
          }
        },
        verifyErrorMsgShow: false,
        verifyTime: 60,
        colNum: 8,
        regionalId: '',
        isVerifyCodeErr: false,
        overflowStatus: 0, // 文本溢出的状态，0 未溢出；1 溢出未展开；2溢出展开
        defaultHeader: defaultHeader,
        isValidRegional: true,
        osComponentOptions: {
          resize: 'none',
          paddingAbsolute: true,
          className: 'os-theme-light os-theme-vhall',
          scrollbars: {
            autoHide: 'leave',
            autoHideDelay: 200
          }
        }
      };
    },
    computed: {
      ...mapState('watchBase', ['toolsCount', 'languages']),
      cityList() {
        return this.cities[this.province];
      },
      countyList() {
        if (!this.counties[this.city]) {
          return [];
        }
        return this.counties[this.city];
      }
    },
    watch: {
      province(newVal, oldVal) {
        if (newVal != oldVal) {
          this.city = '';
          this.county = '';
        }
      },
      city(newVal, oldVal) {
        if (newVal != oldVal) {
          this.county = '';
        }
      },
      isPhoneValidate: {
        immediate: true,
        handler(newVal) {
          // 根据是否开启短信验证，生成相应的手机号验证规则
          if (newVal) {
            this.verifyRules.phone = {
              required: true,
              validator: this.validPhone,
              trigger: 'blur'
            };
          } else {
            this.verifyRules.phone = {
              type: 'number',
              required: true,
              message: this.$t('acount.account_1069'),
              trigger: 'blur'
            };
          }
          // 云盾实例
          if (newVal) {
            this.$nextTick(() => {
              this.callCaptcha('#setCaptcha');
              this.callCaptcha('#setCaptcha1');
            });
          }
        }
      },
      list: {
        deep: true,
        handler(newList) {
          const form = {};
          const rules = {};
          newList &&
            newList.length &&
            newList.forEach(item => {
              form[item.id] = '';
              if (item.type === 3) {
                form[item.id] = [];
                item.items.forEach(opt => {
                  if (opt.type === 1) {
                    form[`${item.id}${opt.id}`] = '';
                  }
                });
              } else if (item.type === 0 && item.default_type === 2 && this.currentPhone) {
                // 手机号
                form[item.id] = this.currentPhone;
              } else if (item.type === 2) {
                // 单选/多选
                item.items.forEach(opt => {
                  if (opt.type === 1) {
                    form[`${item.id}${opt.id}`] = '';
                  }
                });
              }

              // 生成验证规则
              if (item.type === 0 && item.default_type === 1) {
                // 姓名
                rules[item.id] = {
                  required: !!item.is_must,
                  message: this.$t('form.form_1026'),
                  trigger: 'blur'
                };
              } else if (item.type === 0 && item.default_type === 2) {
                // 手机号
                if (this.isPhoneValidate) {
                  rules[item.id] = {
                    required: !!item.is_must,
                    validator: this.validPhone,
                    trigger: 'blur'
                  };
                } else {
                  // TODO待翻译
                  rules[item.id] = {
                    type: 'number',
                    required: !!item.is_must,
                    message: this.$t('acount.account_1069'),
                    trigger: 'blur'
                  };
                }
              } else if (item.type === 0 && item.default_type === 4) {
                // 性别
                rules[item.id] = {
                  required: !!item.is_must,
                  message: this.$t('form.form_1027'),
                  trigger: 'change'
                };
              } else if (item.type === 0 && item.default_type === 3) {
                // 邮箱
                rules[item.id] = [
                  {
                    required: !!item.is_must,
                    validator: validEmail.bind(this),
                    trigger: 'blur'
                  }
                ];
              } else if (item.type === 1) {
                // 问答
                rules[item.id] = {
                  required: !!item.is_must,
                  message: this.$t('form.form_1028'),
                  trigger: 'blur'
                };
              } else if (item.type === 2 || item.type === 4) {
                // 单选/下拉
                rules[item.id] = {
                  required: !!item.is_must,
                  message: this.$t('form.form_1029'),
                  trigger: 'change'
                };
              } else if (item.type === 3) {
                // 多选
                rules[item.id] = {
                  type: 'array',
                  required: !!item.is_must,
                  message: this.$t('form.form_1029'),
                  trigger: 'change'
                };
              } else if (item.type === 5) {
                // 地域
                rules[item.id] = {
                  required: !!item.is_must,
                  validator: this.validRegional,
                  trigger: 'blur'
                };
              } else if (item.type === 6 && item.is_must) {
                // 隐私协议勾选
                rules[item.id] = {
                  required: !!item.is_must,
                  validator: this.validPrivate,
                  message: this.$t('form.form_1030'),
                  trigger: 'change'
                };
              }
            });
          rules.code = {
            required: true,
            validator: this.validCode,
            trigger: 'blur'
          };
          this.form = {
            imgCode: '',
            code: '',
            ...form
          };
          this.rules = {
            ...rules
          };
        }
      }
    },
    async created() {
      await this.getWebinarType();
      this.getBaseInfo();
      this.getQuestionList();
    },
    mounted() {
      document.body.style.overflow = 'hidden';
    },
    beforeDestroy() {
      document.body.style.overflow = 'auto';
    },
    methods: {
      handleAutoCloseSelect() {
        this.$refs.autoCloseRefFlag.forEach(item => {
          item.blur();
        });
      },
      // 获取当前活动类型
      getWebinarType() {
        this.$vhallapi.watchBase
          .watchInit({
            webinar_id: this.webinar_id
          })
          .then(res => {
            this.isSubscribe = res.data.webinar.type == 2 ? 1 : 2;
            this.tabs = res.data.webinar.type == 2 ? 1 : 2;
            // TODO - 20210729 16点 reset灰度
            // if (res.data.webinar && res.data.webinar.userinfo) {
            //   this.$VhallStorage.set(`V3_WAP_US_${res.data.webinar.id}`, res.data.webinar.userinfo.user_id, 'session')
            // }
            // 灰度存储
            if (res.code == 512503 || res.code == 512502) {
              window.location.href = `${window.location.origin}/${this.webinar_id}`;
            }
          });
      },
      changeTab(index) {
        this.tabs = index;
        // this.isValidPhone = false;
        this.showCaptcha = false;
        this.mobileKey = '';
        if (this.isPhoneValidate) {
          index == 1 ? this.callCaptcha('#setCaptcha') : this.callCaptcha('#setCaptcha1');
        }
      },
      // 手机号验证
      validPhone(rule, value, callback) {
        const reg = /^1[3|4|5|6|7|8|9]\d{9}$/;
        if (!value) {
          this.isValidPhone = false;
          return callback ? callback(new Error(this.$t('account.account_1025'))) : false;
        } else if (!reg.test(value)) {
          this.isValidPhone = false;
          // TODO待翻译
          return callback ? callback(new Error(this.$t('acount.account_1069'))) : false;
        } else {
          this.isValidPhone = true;
          if (callback) {
            callback();
          } else {
            return true;
          }
        }
      },
      validPrivate(rule, value, callback) {
        if (!value) {
          return callback ? callback(new Error(this.$t('form.form_1030'))) : false;
        } else {
          if (callback) {
            callback();
          } else {
            return true;
          }
        }
      },
      handleUnfold(val) {
        this.overflowStatus = val;
      },
      validCode(rule, value, callback) {
        if (this.isVerifyCodeErr) {
          // TODO待翻译
          return callback ? callback(new Error(this.$t('511057'))) : false;
        } else {
          callback();
        }
      },
      validRegional(rule, value, callback) {
        if (!this.isValidRegional) {
          callback();
        }
        if (!this.province) {
          return callback ? callback(new Error(this.$t('form.form_1004'))) : false;
        } else if (!this.city && this.colNum <= 12) {
          return callback ? callback(new Error(this.$t('form.form_1005'))) : false;
        } else if (!this.county && this.colNum <= 8) {
          return callback ? callback(new Error(this.$t('form.form_1006'))) : false;
        } else {
          callback();
        }
      },
      regionalChange(type) {
        this.form[this.regionalId] = this[type];
        this.$refs.form.validateField('' + this.regionalId, res => {
          console.log(res);
        });
      },
      closePreview() {
        this.$emit('closeSignUp');
      },
      // 获取表单基本信息
      getBaseInfo() {
        this.$vhallapi.signupForm
          .getFormBaseInfo({
            webinar_id: this.webinar_id
          })
          .then(res => {
            if (res.code === 200) {
              this.baseInfo = res.data;
              this.$nextTick(() => {
                this.calculateText();
              });
            } else {
              this.$message({
                message: this.$t('form.form_1031'),
                showClose: true,
                // duration: 0,
                type: 'error',
                customClass: 'zdy-info-box'
              });
            }
          });
      },
      calculateText() {
        const txtDom = this.$refs.intro;
        if (!txtDom) return false;
        const twoHeight = 40;
        const curHeight = txtDom.offsetHeight;
        if (curHeight > twoHeight) {
          this.overflowStatus = 1;
        }
      },
      getDyCode(isForm) {
        let isPhoneValid = true;
        let phone = '';
        if (isForm) {
          const phoneItem = this.list.find(item => item.type === 0 && item.default_type === 2);
          phone = this.form[phoneItem.id];
          // 点击获取短信验证码之前验证手机号
          this.$refs.form.validateField('' + phoneItem.id, err => {
            if (!err) {
              isPhoneValid = true;
            } else {
              isPhoneValid = false;
            }
          });
        } else {
          phone = this.verifyForm.phone;
          this.$refs.verifyForm.validateField('phone', err => {
            if (!err) {
              isPhoneValid = true;
            } else {
              isPhoneValid = false;
            }
          });
        }
        if (!isPhoneValid) {
          return false;
        }

        // 获取短信验证码
        if (this.mobileKey) {
          this.$vhallapi.signupForm
            .sendVerifyCode({
              webinar_id: this.webinar_id,
              phone: phone,
              captcha: this.mobileKey
            })
            .then(() => {
              this.countDown(isForm);
            });
        }
      },
      // 倒计时函数
      countDown(isForm) {
        const key = isForm ? 'time' : 'verifyTime';
        if (this[key]) {
          this[key]--;
          setTimeout(() => {
            this.countDown(isForm);
          }, 1000);
        } else {
          this[key] = 60;
          this.showCaptcha = false;
          this.mobileKey = '';
          isForm ? this.callCaptcha('#setCaptcha') : this.callCaptcha('#setCaptcha1');
        }
      },
      /**
       * 初始化网易易盾图片验证码
       */
      callCaptcha(id) {
        const captcha = id === '#setCaptcha' ? 'captcha1' : 'captcha2';
        const that = this;
        // eslint-disable-next-line
        initNECaptcha({
          captchaId: that.captchakey,
          element: id,
          lang: this.languages.lang,
          mode: 'float',
          onReady(instance) {
            console.log('instance', instance);
          },
          onVerify(err, data) {
            if (data) {
              that.mobileKey = data.validate;
              that.showCaptcha = true;
              console.log('data>>>', data);
              that.errorMsgShow = '';
            } else {
              that[captcha] = '';
              console.log('errr>>>', err);
              that.errorMsgShow = true;
            }
          },
          onload(instance) {
            console.log('onload', instance);
            that[captcha] = instance;
          }
        });
      },
      // 获取当前活动状态，如果直播中，跳转到直播间
      getWebinarStatus(isSumitForm) {
        this.$vhallapi.watchBase
          .watchInit({
            webinar_id: this.webinar_id
          })
          .then(res => {
            if (res.code == 512503 || res.code == 512502) {
              window.location.href = `${window.location.origin}/${this.webinar_id}`;
              return false;
            }
            // 如果是独立链接，判断状态进行跳转
            if (this.isEntryForm) {
              // const type = res.data.webinar.type
              const queryString = this.$route.query.refer
                ? `?refer=${this.$route.query.refer}`
                : '';
              if (res.data.status == 'live') {
                window.location.href =
                  window.location.origin +
                  process.env.VUE_APP_WEB_KEY +
                  `/lives/watch/${this.webinar_id}${queryString}`;
                // this.$router.push({
                //   path: `/lives/watch/${this.webinar_id}`
                // })
              } else {
                // 如果预约或结束，跳转到预约页
                if (res.data.webinar.type == 2 && isSumitForm) {
                  // 如果是预约状态，显示开播时间提醒
                  this.$alert(
                    this.$t('form.form_1032', { n: res.data.webinar.start_time.substring(0, 16) }),
                    this.$t('account.account_1061'),
                    {
                      confirmButtonText: this.$t('common.common_1033'),
                      customClass: 'zdy-alert-box',
                      callback: action => {
                        this.closePreview();
                        window.location.href =
                          window.location.origin +
                          process.env.VUE_APP_WEB_KEY +
                          `/lives/subscribe/${this.webinar_id}${queryString}`;
                        // this.$router.push({
                        //   path: `/lives/subscribe/${this.webinar_id}`
                        // })
                      }
                    }
                  );
                } else {
                  window.location.href =
                    window.location.origin +
                    process.env.VUE_APP_WEB_KEY +
                    `/lives/subscribe/${this.webinar_id}${queryString}`;

                  // this.$router.push({
                  //   path: `/lives/subscribe/${this.webinar_id}`
                  // })
                }
              }
            } else {
              if (res.data.webinar.type == 2 && isSumitForm) {
                // 如果是预约状态，显示开播时间提醒
                this.$alert(
                  this.$t('form.form_1032', { n: res.data.webinar.start_time.substring(0, 16) }),
                  this.$t('account.account_1061'),
                  {
                    confirmButtonText: this.$t('common.common_1033'),
                    customClass: 'zdy-alert-box',
                    callback: action => {
                      this.closePreview();
                      this.$VhallEventBus.$emit(this.$VhallEventType.Form.AUTHENTICATE_SUCCESS);
                    }
                  }
                );
              } else {
                this.closePreview();
                this.$VhallEventBus.$emit(this.$VhallEventType.Form.AUTHENTICATE_SUCCESS);
              }
            }
          });
      },
      // 提交表单
      submitForm() {
        this.$refs.form.validate((valid, errObj) => {
          if (valid) {
            this.formHandler();
            const options = {
              webinar_id: this.webinar_id,
              form: JSON.stringify(this.answer)
            };
            this.isPhoneValidate && (options.verify_code = this.form.code);
            const visitorId =
              this.$VhallStorage.get('visitorWatchId', 'session') ||
              this.$VhallStorage.get('visitorId', 'session');
            if (visitorId) {
              options.visit_id = visitorId;
            }
            this.$route.query.refer && (options.refer = this.$route.query.refer);
            this.$vhallapi.signupForm.regAnswerSubmit(options).then(res => {
              if (res.code == 200) {
                res.data.visit_id &&
                  this.$VhallStorage.set('visitorWatchId', res.data.visit_id, 'session');
                // 报名成功的操作，跳转到直播间
                // 判断当前直播状态，进行相应的跳转
                this.getWebinarStatus(true);
              } else if (res.code == 512809 || res.code == 512570) {
                // 短信验证码验证失败，触发表单验证失败
                // 现在的表单验证码逻辑完全由后端返回结果决定，前端不验证格式
                this.isVerifyCodeErr = true;
                this.$refs.form.validateField('code', res => {
                  // 还原状态
                  this.isVerifyCodeErr = false;
                });
              } else if (res.code == 512814 || res.code == 512815) {
                // res.data.visit_id && sessionStorage.setItem("visitor_id", res.data.visit_id)
                // 报名成功的操作，跳转到直播间
                this.closePreview();
                // 判断当前直播状态，进行相应的跳转
                this.$message({
                  message: this.$t('form.form_1033'),
                  showClose: true,
                  // duration: 0,
                  type: 'success',
                  customClass: 'zdy-info-box'
                });
                this.getWebinarStatus();
              } else {
                this.$message({
                  message: this.$tec(res.code) || res.msg,
                  showClose: true,
                  // duration: 0,
                  type: 'error',
                  customClass: 'zdy-info-box'
                });
              }
            });
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      submitVerify() {
        this.$refs.verifyForm.validate(valid => {
          if (valid) {
            const options = {
              webinar_id: this.webinar_id,
              phone: this.verifyForm.phone,
              verify_code: this.verifyForm.code
            };
            const visitorId =
              this.$VhallStorage.get('visitorWatchId', 'session') ||
              this.$VhallStorage.get('visitorId', 'session');
            if (visitorId) {
              options.visit_id = visitorId;
            }
            this.$vhallapi.signupForm.checkIsRegistered(options).then(res => {
              if (res.code == 200) {
                // 如果已经报名
                if (res.data.has_registed == 1) {
                  // 已报名，跳转到直播间
                  this.closePreview();
                  res.data.visit_id &&
                    this.$VhallStorage.set('visitorWatchId', res.data.visit_id, 'session');
                  this.$message({
                    message: this.$t('form.form_1033'),
                    showClose: true,
                    // duration: 0,
                    type: 'success',
                    customClass: 'zdy-info-box'
                  });
                  // 判断当前直播状态，进行相应的跳转
                  this.getWebinarStatus();
                } else {
                  this.$message({
                    message: this.$t('form.form_1034'),
                    showClose: true,
                    // duration: 0,
                    type: 'warning',
                    customClass: 'zdy-info-box'
                  });
                  this.tabs = 1;
                }
              } else if (res.code == 512809 || res.code == 512570) {
                // 短信验证码验证失败，触发表单验证失败
                // 现在的表单验证码逻辑完全由后端返回结果决定，前端不验证格式
                this.isVerifyCodeErr = true;
                this.$refs.verifyForm.validateField('code', () => {
                  // 还原状态
                  this.isVerifyCodeErr = false;
                });
              } else {
                this.$message({
                  message: this.$tec(res.code) || res.msg,
                  showClose: true,
                  // duration: 0,
                  type: 'error',
                  customClass: 'zdy-info-box'
                });
              }
            });
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      // form => answer
      formHandler() {
        const answer = {};
        this.list.forEach(item => {
          if (!this.form[item.id] || this.form[item.id] == []) {
            console.log('空答案');
          } else if (item.type === 0) {
            // 系统题目
            !answer.default && (answer.default = []);
            answer.default.push({
              id: item.id,
              content: this.form[item.id] || '',
              default_type: item.default_type
            });
          } else if (item.type === 1) {
            // 问答
            const opts = item.options && JSON.parse(item.options);
            let options = [];
            opts && opts.type === 7 && (options = { type: 7 });
            !answer.text && (answer.text = []);
            answer.text.push({
              id: item.id,
              content: this.form[item.id] || '',
              options: options
            });
          } else if (item.type === 2) {
            // 单选
            !answer.radio && (answer.radio = []);
            const element = item.items.find(elem => elem.id === this.form[item.id]);
            let content = '';
            if (element) {
              content =
                element.type !== 1
                  ? {
                      id: element.id,
                      content: element.subject
                    }
                  : {
                      id: element.id,
                      content: this.form[`${item.id}${element.id}`]
                        ? this.form[`${item.id}${element.id}`]
                        : '其他'
                    };
            }
            answer.radio.push({
              id: item.id,
              content: content
            });
          } else if (item.type === 3) {
            // 多选
            !answer.checkbox && (answer.checkbox = []);
            const content = [];
            this.form[item.id].forEach((checkOpt, index) => {
              const element = item.items.find(elem => elem.id === checkOpt);
              if (element) {
                const obj =
                  element.type !== 1
                    ? {
                        id: element.id,
                        content: element.subject
                      }
                    : {
                        id: element.id,
                        content: this.form[`${item.id}${element.id}`]
                          ? this.form[`${item.id}${element.id}`]
                          : '其他'
                      };
                content.push(obj);
              }
            });
            answer.checkbox.push({
              id: item.id,
              content: content
            });
          } else if (item.type === 4) {
            // 下拉
            !answer.select && (answer.select = []);
            const element = item.items.find(elem => elem.subject === this.form[item.id]);
            element &&
              answer.select.push({
                id: item.id,
                content: {
                  id: element.id,
                  jobTxt: item.subject,
                  content: element.subject
                }
              });
          } else if (item.type === 5) {
            // 地域
            !answer.address && (answer.address = []);
            const provinec = this.provinces.find(ele => ele.value == this.province) || {
              label: '',
              value: ''
            };
            const city = this.cityList.find(ele => ele.value == this.city) || {
              label: '',
              value: ''
            };
            const county = this.countyList.find(ele => ele.value == this.form[item.id]) || {
              label: '',
              value: ''
            };
            answer.address.push({
              id: item.id,
              content: `${provinec.label}${city.label}${county.label}`,
              contentDe: [
                {
                  id: provinec.value,
                  content: provinec.label
                },
                {
                  id: city.value,
                  content: city.label
                },
                {
                  id: county.value,
                  content: county.label
                }
              ]
            });
          } else if (item.type === 6) {
            // 隐私协议勾选
            !answer.statement && (answer.statement = []);
            answer.statement.push({
              id: item.id,
              content: this.form[item.id] ? this.$t('form.form_1035') : this.$t('form.form_1036')
            });
          }
        });
        this.answer = answer;
      },
      // 获取地域列表
      getAreaList() {
        this.$vhallapi.signupForm.getAreaList().then(res => {
          console.warn(res, '加载地址');
          this.provinces = res.provinces;
          this.cities = res.cities;
          this.counties = res.counties;
        });
      },
      // 获取表单题目列表
      getQuestionList() {
        function compare(property) {
          return function (a, b) {
            var value1 = a[property];
            var value2 = b[property];
            return value1 - value2;
          };
        }
        this.$vhallapi.signupForm
          .getFormQuestionList({
            webinar_id: this.webinar_id
          })
          .then(res => {
            // 按照 order_num 从小到大排序
            const list = res.data.ques_list.sort(compare('order_num'));
            !this.isPreview && res.data.phone && (this.currentPhone = Number(res.data.phone));
            // 手机号验证开启状态
            const phoneItem = list.find(item => item.type == 0 && item.default_type == 2);
            this.isPhoneValidate =
              phoneItem.options && JSON.parse(phoneItem.options).open_verify == 1;
            // 默认填写手机号
            !this.isPreview && res.data.phone && (this.verifyForm.phone = Number(res.data.phone));
            this.list = list;
            // 地域 options 格式化处理
            this.list.some(item => {
              if (item.type == 5) {
                this.isValidRegional = !!item.is_must;
                item.options = JSON.parse(item.options);
                item.colNum = 8;
                item.options.show_district == 0 && (item.colNum = 12);
                item.options.show_city == 0 && (item.colNum = 24);
                this.colNum = item.colNum;
                this.regionalId = item.id;
                return true;
              }
            });
            // 隐私声明格式处理
            const lastQuestion = this.list[this.list.length - 1];
            console.log(lastQuestion);
            if (lastQuestion.subject === '隐私声明') {
              this.provicy = lastQuestion;
              this.provicy && this.privacyFormatter();
            }
            list.some(item => item.type === 5) && this.getAreaList();
          })
          .catch(err => {
            console.log(err);
          });
      },
      privacyFormatter() {
        const parseOpts = JSON.parse(this.provicy.options);
        const parseOptsFir = parseOpts[0] && JSON.parse(parseOpts[0].options);
        const parseOptsSec = parseOpts[1] && JSON.parse(parseOpts[1].options);

        let text = parseOptsFir.content;
        const matchPrivacy1 = parseOptsFir.color_text.trim()
          ? text.match(parseOptsFir.color_text)
          : null;
        if (matchPrivacy1) {
          const reg = new RegExp(`(${matchPrivacy1[0]})`);
          text = text.replace(
            reg,
            `<a href="${parseOptsFir.url || 'javascript:void(0);'}" target="_blank">$1</a>`
          );
        }
        const matchPrivacy2 =
          parseOptsSec && parseOptsSec.privacy_info.trim()
            ? text.match(parseOptsSec.privacy_info)
            : null;
        if (matchPrivacy2) {
          const reg = new RegExp(`(${matchPrivacy2[0]})`, 'g');
          text = text.replace(
            reg,
            `<a href="${parseOptsSec.privacy_link || 'javascript:void(0);'}" target="_blank">$1</a>`
          );
        }

        this.provicyText = text;
      }
    }
  };
</script>

<style lang="less" scoped>
  @red: #fb3a32;
  @redBg: #ffebeb;
  @blue: #3562fa;
  @blueBg: #ebefff;
  @purple: #8d57a4;
  @purpleBg: #f5bdea;
  .signFormBox {
    position: fixed;
    top: 0;
    width: 100%;
    height: 100%;
    left: 0;
    background-color: rgba(0, 0, 0, 0.8);
    z-index: 101;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #1a1a1a; // 报名表单字体颜色 scoped ，防止品牌设置皮肤设置影响
    &.signFormBoxHid {
      position: static;
      background-color: #fff;
      width: auto;
      height: auto;
    }
    .signWrap {
      overflow-y: auto;
      height: 85%;
      border-radius: 4px;
      background: #fff;
      position: relative;
      z-index: 101;
      &.signWrapHid {
        height: auto;
        box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.15);
      }
      .entryFormBox {
        width: 720px;
        background: #fff;
        padding-bottom: 87px;
      }
      header {
        width: 100%;
        height: 120px;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        img {
          width: 100%;
          object-fit: cover;
        }
      }
      .pageTitle {
        font-size: 22px;
        color: #1a1a1a;
        margin: 40px 0 22px;
        text-align: center;
        font-weight: 500;
        font-family: PingFangSC-Medium, PingFang SC;
        line-height: 33px;
      }
      .pageIntro {
        // width: 658px;
        // margin: 20px auto 0;
        color: #666666;
        font-size: 14px;
        line-height: 20px;
        word-break: break-all;
        font-weight: 400;
        position: relative;
        &.pageIntroEllipsis {
          word-break: break-all;
          text-overflow: ellipsis;
          display: -webkit-box; /** 对象作为伸缩盒子模型显示 **/
          -webkit-box-orient: vertical; /** 设置或检索伸缩盒对象的子元素的排列方式 **/
          -webkit-line-clamp: 2; /** 显示的行数 **/
          overflow: hidden; /** 隐藏超出的内容 **/
        }
        .textTail {
          position: absolute;
          bottom: 0px;
          right: 4px;
          cursor: pointer;
          background-color: #fff;
          color: #3562fa;
          .isEllipsis {
            color: #666666;
          }
        }
      }
      article {
        padding: 0 75px;
      }
      .closeBtn {
        width: 24px;
        height: 24px;
        background: rgba(0, 0, 0, 0.4);
        border-radius: 28px;
        color: #fff;
        position: absolute;
        right: 16px;
        top: 16px;
        font-style: normal;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .tabsBox {
        width: 100%;
        margin: 43px auto 20px;
        display: flex;
        justify-content: center;
      }
      .tabs {
        width: 446px;
        overflow: hidden;
        border-radius: 4px;
        > div {
          width: calc(50% - 1px);
          float: left;
          border: 1px solid #e6e6e6;
          line-height: 40px;
          height: 40px;
          text-align: center;
          transition: all 0.2s linear;
          cursor: pointer;
          &:nth-child(1) {
            border-right: 0px none;
            border-radius: 4px 0px 0px 4px;
          }
          &:nth-child(2) {
            border-left: 0px none;
            border-radius: 0px 4px 4px 0px;
          }
          &.active {
            border: 1px solid @red;
            background: @redBg;
            color: @red;
            width: calc(50% - 2px);
          }
        }
        &.red1 {
          .active {
            border: 1px solid @red;
            background: @redBg;
            color: @red;
          }
        }
        &.blue1 {
          .active {
            border: 1px solid @blue;
            background: @blueBg;
            color: @blue;
          }
        }
        &.purple1 {
          .active {
            border: 1px solid @purple;
            background: @purpleBg;
            color: @purple;
          }
        }
      }
      /deep/ .el-form-item__label {
        float: none;
      }
      /deep/.is-checked {
        .el-radio__inner,
        .el-checkbox__inner {
          background-color: #fb3a32 !important;
          border-color: #fb3a32 !important;
          background: #fb3a32 !important;
        }
        .el-radio__label,
        .el-checkbox__label {
          color: #fb3a32 !important;
          font-weight: 400;
        }
      }
      /deep/.el-checkbox-group {
        width: 100%;
        padding-left: 20px;
        .el-checkbox {
          display: block;
        }
        /deep/ .el-checkbox__label {
          width: 100%;
          font-weight: 400;
        }
      }
      /deep/.el-radio__inner:hover,
      .el-checkbox__inner:hover {
        border-color: #fb3a32 !important;
      }
      /deep/.is-focus {
        .el-radio__inner,
        .el-checkbox__inner {
          border-color: #fb3a32 !important;
        }
      }
      .el-select {
        width: 100%;
      }
      .el-radio-group {
        width: 100%;
        padding-left: 20px;
        .el-radio {
          display: block;
        }
      }
      .noFull {
        width: calc(100% - 30px);
      }
    }
    .provicy-item {
      margin-bottom: 24px !important;
      /deep/ .el-form-item__content {
        line-height: normal;
      }
    }
    /deep/ .provicy-checkbox {
      display: flex;
      align-items: flex-start;
      line-height: 40px;
      width: 100%;
      white-space: normal;
      font-size: 14px;
      color: #666;
      font-weight: 400;
      .el-checkbox__input {
        padding-top: 2px;
      }
      // .el-checkbox__label {
      //   width: calc(100% - 16px);
      //   padding-left: 20px;
      //   position: absolute;
      // }
      /deep/ .el-checkbox__input.is-checked + .el-checkbox__label {
        color: #666;
      }
      p {
        /deep/ a {
          color: #3562fa;
          &:link {
            color: #3562fa;
          }
          &:active {
            color: #3562fa;
          }
        }
      }
    }
    .entryForm {
      // 云盾滑块背景
      // /deep/ .yidun.yidun--light .yidun_slider:hover {
      //   background-color: #FB3A32;
      // }
      /deep/ .el-form-item {
        margin-bottom: 28px;
      }
      /deep/ .el-form-item__label {
        color: #1a1a1a;
      }
      // 必填form表单 * 颜色
      /deep/ .el-form-item.is-required:not(.is-no-asterisk) > .el-form-item__label {
        position: relative;
        &:before {
          content: '*';
          color: #fb3a32;
          margin-right: 4px;
          position: absolute;
          left: -10px;
        }
      }
      // 错误提示文本颜色
      /deep/ .el-form-item__error {
        color: #fb3a32;
      }
      // 输入框输入状态边框颜色
      /deep/ .el-input__inner:focus {
        border-color: #999;
      }
      // 输入框正常状态边框颜色
      /deep/ .el-input__inner {
        border-color: #ccc;
        height: 40px;
        color: #1a1a1a;
      }
      // 输入框hover状态边框颜色
      /deep/ .el-input__inner:hover {
        border-color: #999;
      }
      // 输入框格式校验失败的边框颜色
      /deep/ .el-form-item.is-error .el-input__inner {
        border-color: #fb3a32;
        &::-webkit-input-placeholder {
          /* WebKit browsers */
          color: #fb3a32;
        }

        &::-moz-placeholder {
          /* Mozilla Firefox 19+ */
          color: #fb3a32;
        }

        &:-ms-input-placeholder {
          /* Internet Explorer 10+ */
          color: #fb3a32;
        }
      }
      // form-item label 样式重置
      /deep/ .el-form-item__label {
        float: none;
        // height: 40px;
        display: block;
        line-height: 22px;
        text-align: left;
        font-size: 14px;
        padding-bottom: 10px;
      }
      // 单选/多选 选项样式重置
      /deep/ .el-radio-group .el-radio,
      .el-checkbox-group .el-checkbox {
        display: flex;
        align-items: flex-start;
        // line-height: 40px;
        color: #1a1a1a;
        white-space: normal;
        font-weight: normal;
        .el-checkbox__input,
        .el-radio__input {
          padding-top: 2px;
          &.is-checked + .el-radio__label,
          &.is-checked + .el-checkbox__label {
            color: #fb3a32;
          }
          &.is-checked .el-radio__inner,
          &.is-checked .el-checkbox__inner {
            border-color: #fb3a32 !important;
            background: #fb3a32 !important;
          }
          .el-radio__inner {
            width: 16px;
            height: 16px;
            &:after {
              width: 6px;
              height: 6px;
            }
          }
        }
        .el-checkbox__label,
        .el-radio__label {
          white-space: normal;
          padding-left: 10px;
          line-height: 20px;
          font-size: 14px;
        }
      }
      /deep/ .el-checkbox__inner {
        width: 16px;
        height: 16px;
        &:after {
          top: 2px;
          left: 5px;
        }
      }
      /deep/ .el-radio__input {
        padding-top: 3px;
      }
      .el-radio-group,
      .el-checkbox-group {
        padding-left: 0px;
        > div {
          padding: 10px 0 10px;
        }
      }
      // 滚动条样式调整
      /deep/ .el-select {
        .el-input__inner {
          &::-webkit-input-placeholder {
            /* WebKit browsers */
            color: #1a1a1a;
          }
          &::-moz-placeholder {
            /* Mozilla Firefox 19+ */
            color: #1a1a1a;
          }
          &:-ms-input-placeholder {
            /* Internet Explorer 10+ */
            color: #1a1a1a;
          }
        }
        .el-input__suffix .el-icon-arrow-up {
          color: #1a1a1a;
        }
      }
      .btnBox {
        display: flex;
        justify-content: center;
        padding-top: 12px;
      }
      .el-button {
        padding: 9px 55px;
        &.el-button--primary {
          color: #fff;
          background: #fb3a32;
          border: 1px solid #fb3a32;
        }
      }
      /deep/ .verifyCodeBox {
        .el-input__inner {
          padding-right: 98px;
        }
        .el-button {
          position: absolute;
          right: 13px;
          top: 3px;
          height: 34px;
          width: 90px;
          padding: 0;
          // background: #dedede;
          border-radius: 2px;
          // color: #666666;
          font-size: 13px;
          border: 0;
          // &:hover{
          //   background: #DEDEDE;
          //   border: #DEDEDE;
          // }
          // &:active{
          //   background: #DEDEDE;
          //   border: #DEDEDE;
          // }
        }
        .no-border {
          background: #dedede;
          color: #666666;
          cursor: not-allowed;
          &:hover {
            border: 0;
          }
          &:focus {
            border: 0;
          }
        }
        .isLoginActive {
          background: #fb3a32;
          color: #ffffff;
          cursor: pointer;
        }
        // 云盾样式重置,注释部分为设计稿样式，暂时不删除，有备无患
        .captcha {
          // /deep/ .yidun .yidun_control {
          // border-radius: 4px!important;
          // border-color: #ccc;
          // background: #fff;
          // overflow: hidden;
          // .yidun_slide_indicator {
          //   border-radius: 4px!important;
          // }
          .yidun_tips {
            color: #999999;
            height: 40px;
            line-height: 38px !important;
            .yidun_tips__text {
              vertical-align: initial;
            }
          }
          .yidun_slider {
            .yidun_slider__icon {
              background-image: url(../img/icon-slide1.png) !important;
              background-size: 28px 20px;
              background-position: center;
              margin-top: -5px;
            }
            &:hover {
              // background-color: #FB3A32;
              .yidun_slider__icon {
                background-image: url(../img/icon-slide.png) !important;
              }
            }
          }
          // &.yidun_control--moving {
          //   background-color: #E2E2E2;
          //   border-color: #FB3A32;
          //   .yidun_slide_indicator {
          //     border-color: #FB3A32;
          //     background-color: #E2E2E2;
          //   }
          // }
          // }
          .yidun--success {
            // .yidun_control--moving {
            //   background-color: #F0F1FE!important;
            //   .yidun_slide_indicator {
            //     background-color: #F0F1FE!important;
            //   }
            // }
            .yidun_control {
              // border-color: #3562FA!important;
              .yidun_slider__icon {
                background-image: url(../img/icon-succeed.png) !important;
              }
              .yidun_slider {
                .yidun_slider__icon {
                  background-image: url(../img/icon-succeed.png);
                  background-size: 28px 20px;
                  background-position: center;
                }
                &:hover {
                  // background-color: #FB3A32;
                  .yidun_slider__icon {
                    background-image: url(../img/icon-succeed.png);
                    background-size: 28px 20px;
                    background-position: center;
                  }
                }
              }
            }
          }
          .yidun.yidun--light.yidun--success.yidun--jigsaw {
            .yidun_control .yidun_slider {
              background-color: #3562fa;
            }
            .yidun_slide_indicator {
              border-color: #3562fa;
              background-color: #f0f1fe;
            }
          }
          .yidun.yidun--light {
            .yidun_feedback {
              background-position: 0px -240px;
              height: 30px;
            }
            .yidun_refresh {
              background-position: 0px -339px;
            }
          }
        }
      }
    }
    .entryForm .blue1 {
      background: @blue!important;
      border-color: @blue!important;
      &:hover {
        background: @blue!important;
        border-color: @blue!important;
      }
    }
    .entryForm .red1 {
      background: @red!important;
      border-color: @red!important;
      &:hover {
        background: @red!important;
        border-color: @red!important;
      }
    }
    .entryForm .purple1 {
      background: @purple!important;
      border-color: @purple!important;
      &:hover {
        background: @purple!important;
        border-color: @purple!important;
      }
    }
    /deep/ .el-popper[x-placement^='bottom'] .popper__arrow::after {
      display: none !important;
    }
    /deep/ .el-popper[x-placement^='top'] .popper__arrow::after {
      display: none !important;
    }
  }
</style>
<style lang="less" scoped>
  .el-select-dropdown__list .el-select-dropdown__item {
    max-width: 570px !important;
    width: 100%;
    line-height: 30px !important;
    height: initial !important;
    span {
      white-space: normal;
      word-wrap: break-word;
      word-break: break-all;
      display: inline-block;
      line-height: 20px;
      padding-top: 4px;
    }
  }
</style>
