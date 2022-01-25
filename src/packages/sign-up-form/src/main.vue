<template>
  <div class="vmp-sign-up-form">
    <el-dialog title="" :visible.sync="visible" width="720px" custom-class="vmp-sign-up-form">
      <div class="vmp-sign-up-form__wrap">
        <!--顶部banner图-->
        <div class="vmp-sign-up-form__banner">
          <img :src="formInfo.cover ? `${baseUrl}${formInfo.cover}` : defaultHeader" alt="" />
        </div>
        <div class="vmp-sign-up-form__content">
          <!--表单名称-->
          <div class="vmp-sign-up-form__title">{{ formInfo.title }}</div>
          <!--表单简介-->
          <div
            class="vmp-sign-up-form__introduction"
            v-if="formInfo.intro"
            ref="intro"
            :class="[overflowStatus ? 'vmp-sign-up-form__introduction-fold' : '']"
          >
            {{ formInfo.intro }}
            <span
              v-show="overflowStatus"
              class="vmp-sign-up-form__introduction__detail"
              @click="changeFoldStatus(false)"
            >
              <span class="is-ellipsis">...</span>
              {{ $t('form.form_1011') }}
            </span>
            <span
              v-show="!overflowStatus"
              class="vmp-sign-up-form__introduction__detail"
              @click="changeFoldStatus(true)"
            >
              <span class="is-ellipsis"></span>
              {{ $t('form.form_1012') }}
            </span>
          </div>
          <!--切换的tab-->
          <div class="vmp-sign-up-form__tab-bar">
            <div :class="['vmp-sign-up-form__tab-bar-tabs', formInfo.theme_color + '1']">
              <template v-for="tab in tabConfig[isSubscribe]">
                <div
                  :class="{ active: activeTab === tab.code }"
                  :key="tab.code"
                  @click="switchTab(tab.code)"
                >
                  {{ tab.text }}
                </div>
              </template>
            </div>
          </div>
          <!--报名表单-->
          <div class="vmp-sign-up-form__main-form" v-show="activeTab === 1">
            <!-- 报名表单 -->
            <template>
              <el-form
                ref="form"
                :model="form"
                class="entryForm"
                :rules="rules"
                label-position="top"
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
                    <el-input
                      v-if="question.type == 0 && question.default_type == 2"
                      v-model.number="form[question.id]"
                      :maxlength="question.type == 0 ? '' : 60"
                      :show-word-limit="question.type != 0"
                      autocomplete="off"
                      :placeholder="findPlaceHolder(question.default_type)"
                    ></el-input>
                    <el-input
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
                      :placeholder="findPlaceHolder(question.default_type)"
                    ></el-input>
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
                            <el-radio
                              v-show="form[question.id] == radioItem.id"
                              v-model="form[`${question.id}${radioItem.id}`]"
                              maxlength="60"
                              autocomplete="off"
                              show-word-limit
                              :placeholder="$t('form.form_1017')"
                              style="margin-top: 10px"
                              class="radio-input"
                            ></el-radio>
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
                          <el-input
                            v-show="form[question.id].some(id => id == checkItem.id)"
                            v-model="form[`${question.id}${checkItem.id}`]"
                            :maxlength="60"
                            autocomplete="off"
                            show-word-limit
                            :placeholder="$t('form.form_1017')"
                            style="margin-top: 10px"
                            class="radioInput"
                          ></el-input>
                        </template>
                      </div>
                    </el-checkbox-group>
                  </template>
                  <!-- 下拉 -->
                  <template v-if="question.type === 4">
                    <el-select
                      ref="autoCloseRefFlag"
                      v-model="form[question.id]"
                      style="width: 100%"
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
                        <el-input
                          v-show="false"
                          v-model="form[question.id]"
                          autocomplete="off"
                        ></el-input>
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
                  class="verify-code-box"
                  :required="false"
                  prop="code"
                >
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <div id="setCaptcha" class="captcha">
                        <el-input v-model.trim="form.imgCode" autocomplete="off"></el-input>
                      </div>
                    </el-col>
                    <el-col :span="12">
                      <el-input
                        v-model.trim="form.code"
                        auto-complete="off"
                        :placeholder="$t('form.form_1020')"
                      ></el-input>
                      <el-button
                        :disabled="time !== 60 || isPreview"
                        class="send-code-btn"
                        :class="showCaptcha && isValidPhone ? 'isLoginActive' : 'no-border'"
                        size="mini"
                        @click="time === 60 && getDyCode(true)"
                      >
                        {{ time === 60 ? $t('form.form_1021') : `${time}s` }}
                      </el-button>
                    </el-col>
                  </el-row>
                </el-form-item>
                <!-- 隐私声明 -->
                <el-form-item v-if="privacy" class="privacy-item" :prop="privacy.id + ''">
                  <template>
                    <el-checkbox v-model="form[privacy.id]" class="privacy-checkbox">
                      <p v-html="privacyText"></p>
                    </el-checkbox>
                  </template>
                </el-form-item>
                <div class="btn-box">
                  <el-button
                    style="margin-top: 11px"
                    :disabled="isPreview"
                    :class="[formInfo.theme_color + '1']"
                    round
                    type="primary"
                    @click="submitForm"
                  >
                    {{ $t('form.form_1019') }}
                  </el-button>
                </div>
              </el-form>
            </template>
          </div>
          <!--验证码表单-->
          <div class="vmp-sign-up-form__verify-form" v-show="activeTab === 2">
            <!-- 验证 -->
            <template>
              <el-form ref="verifyForm" class="entryForm" :model="verifyForm" :rules="verifyRules">
                <el-form-item :label="$t('form.form_1022')" prop="phone">
                  <el-input
                    v-model.number.trim="verifyForm.phone"
                    type="number"
                    auto-complete="off"
                    :placeholder="$t('account.account_1025')"
                  ></el-input>
                </el-form-item>
                <el-form-item v-if="isPhoneValidate" class="verify-code-box" prop="code">
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <div id="setCaptcha1" class="captcha">
                        <el-input v-model.trim="verifyForm.imgCode" autocomplete="off"></el-input>
                      </div>
                    </el-col>
                    <el-col :span="12">
                      <el-input
                        v-model.trim="verifyForm.code"
                        auto-complete="off"
                        :placeholder="$t('form.form_1076')"
                      ></el-input>
                      <el-button
                        :disabled="verifyTime !== 60 || isPreview"
                        :class="showCaptcha && isValidPhone ? 'isLoginActive' : 'no-border'"
                        size="mini"
                        class="send-code-btn"
                        @click="verifyTime === 60 && getDyCode(false)"
                      >
                        {{ verifyTime === 60 ? $t('form.form_1021') : `${verifyTime}s` }}
                      </el-button>
                    </el-col>
                  </el-row>
                </el-form-item>
                <div class="btn-box">
                  <el-button
                    :disabled="isPreview"
                    :class="[formInfo.theme_color + '1']"
                    round
                    type="primary"
                    @click="submitVerify"
                  >
                    {{ $t('interact_tools.interact_tools_1019') }}
                  </el-button>
                </div>
              </el-form>
            </template>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import defaultHeader from './images/formHeader.png';
  import { useRoomBaseServer } from 'middle-domain';
  export default {
    name: 'VmpSignUpForm',
    data() {
      return {
        //默认的兜底的banner图
        defaultHeader,
        //todo 后续从node的环境变量里面取
        baseUrl: 'https://t-vhallsaas-static.oss-cn-beijing.aliyuncs.com/upload/',
        //表单信息
        formInfo: {},
        //简介内容是否超长
        overflowStatus: false,
        //模态窗是否可见
        visible: true,
        //是否是预览
        isPreview: false,
        //当前登陆人的电话号码
        currentPhone: '',
        //表单视图模型
        form: {},
        //验证表单
        verifyForm: {
          phone: '',
          imgCode: ''
        },
        //是否有隐私声明
        privacy: false,
        //隐私声明文字
        privacyText: '',
        //tab栏的配置
        tabConfig: {
          1: [
            {
              code: 1,
              text: this.$t('form.form_1025')
            },
            {
              code: 2,
              text: this.$t('form.form_1024')
            }
          ],
          2: [
            {
              code: 2,
              text: this.$t('form.form_1024')
            },
            {
              code: 1,
              text: this.$t('form.form_1025')
            }
          ]
        },
        //初始化的活动类型
        isSubscribe: 1,
        //当前激活的tab
        activeTab: 1,
        //报名表单验证
        rules: {},
        //输入文字提示的map
        placeholderMap: {
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
        //表单项配置
        list: [],
        //省份
        province: '',
        //城市
        city: '',
        //国家
        county: '',
        //省份列表
        provinces: [],
        //城市列表
        cities: {},
        //国家列表
        counties: {},
        //是否手机验证
        isPhoneValidate: false,
        // 云盾key
        captchakey: 'b7982ef659d64141b7120a6af27e19a0',
        // 云盾值
        mobileKey: '',
        // 云盾实例
        captcha1: null,
        // 云盾实例
        captcha2: null,
        //报名表单的倒计时
        time: 60,
        //验证表单的倒计时
        verifyTime: 60,
        // 专门用于 校验登录次数 接口返回 需要显示图形验证码时使用
        showCaptcha: false,
        //是否是校验手机
        isValidPhone: false,
        //已报名的表单
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
        }
      };
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
                    validator: this.validEmail,
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
    computed: {
      findPlaceHolder() {
        return function (type) {
          return this.placeholderMap[type] || this.$t('form.form_1014');
        };
      },
      //城市列表
      cityList() {
        return this.cities[this.province];
      },
      //国家列表
      countyList() {
        if (!this.counties[this.city]) {
          return [];
        }
        return this.counties[this.city];
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
    },
    mounted() {
      //todo 临时测试用待移除
      this.openModal();
    },
    methods: {
      //打开模态窗
      openModal() {
        this.initViewData();
        this.getWebinarInfo();
        this.getQuestionInfo();
        this.visible = true;
      },
      initViewData() {
        const { watchInitData = {} } = this.roomBaseServer.state;
        const { webinar = {} } = watchInitData;
        //设置活动类型
        this.isSubscribe = webinar.type === 2 ? 1 : 2;
        //初始化默认激活的tab
        this.activeTab = webinar.type === 2 ? 1 : 2;
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
      //隐私协议勾选验证
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
      //todo 邮件验证
      validEmail(rule, value, callback) {
        console.log(rule, value, callback);
      },
      //校验验证码 todo
      validCode(rule, value, callback) {
        console.log(rule, value, callback);
      },
      //地域验证 todo
      validRegional(rule, value, callback) {
        console.log(rule, value, callback);
      },
      //初始化活动信息 todo 假数据替换
      getWebinarInfo() {
        this.$set(this, 'formInfo', {
          webinar_id: 768635971,
          title: '测试用报名表单',
          intro: '测试用报名介绍',
          cover: 'sys/img_url/74/22/742222c698ad6d990e2c4d0d079098bb.jpeg',
          theme_color: 'red',
          tab_verify_title: '我已报名',
          tab_form_title: '活动报名',
          open_link: 0,
          created_at: '2022-01-21 11:10:49',
          updated_at: '2022-01-21 11:11:05',
          enable_status: 1,
          phone: ''
        });
      },
      //初始化表单问题信息 todo 待更换假数据
      getQuestionInfo() {
        let res = {
          data: {
            ques_list: [
              {
                id: 31353,
                type: 0,
                default_type: 1,
                subject: '姓名',
                order_num: 4,
                is_must: 1,
                options: '',
                items: []
              },
              {
                id: 32644,
                type: 0,
                default_type: 4,
                subject: '性别',
                order_num: 5,
                is_must: 1,
                options: '',
                items: []
              },
              {
                id: 32642,
                type: 2,
                default_type: 0,
                subject: '单选题',
                order_num: 6,
                is_must: 1,
                options: '',
                items: [
                  {
                    id: 12465,
                    ques_id: 32642,
                    subject: '选项1',
                    type: 0
                  },
                  {
                    id: 12466,
                    ques_id: 32642,
                    subject: '选项2',
                    type: 0
                  }
                ]
              },
              {
                id: 32643,
                type: 3,
                default_type: 0,
                subject: '多选题',
                order_num: 7,
                is_must: 1,
                options: '',
                items: [
                  {
                    id: 12467,
                    ques_id: 32643,
                    subject: '选项1',
                    type: 0
                  },
                  {
                    id: 12468,
                    ques_id: 32643,
                    subject: '选项2',
                    type: 0
                  }
                ]
              },
              {
                id: 32645,
                type: 1,
                default_type: 0,
                subject: '今年是哪一年',
                order_num: 8,
                is_must: 0,
                options: '',
                items: []
              },
              {
                id: 32647,
                type: 4,
                default_type: 0,
                subject: '下拉题',
                order_num: 9,
                is_must: 1,
                options: '',
                items: [
                  {
                    id: 12469,
                    ques_id: 32647,
                    subject: '选项1',
                    type: 0
                  },
                  {
                    id: 12470,
                    ques_id: 32647,
                    subject: '选项2',
                    type: 0
                  },
                  {
                    id: 12471,
                    ques_id: 32647,
                    subject: '选项3',
                    type: 0
                  },
                  {
                    id: 12472,
                    ques_id: 32647,
                    subject: '选项4',
                    type: 0
                  }
                ]
              },
              {
                id: 31354,
                type: 0,
                default_type: 2,
                subject: '手机',
                order_num: 10,
                is_must: 1,
                options: '{"open_verify":1}',
                items: []
              },
              {
                id: 32646,
                type: 6,
                default_type: 0,
                subject: '隐私声明',
                order_num: 11,
                is_must: 1,
                options:
                  '[{"id":32646,"webinar_id":768635971,"user_id":16422770,"type":6,"default_type":0,"subject":"隐私声明","order_num":11,"is_must":1,"created_at":"2022-01-21 11:12:26","updated_at":"2022-01-21 11:12:35","options":"{\\"content\\":\\"\\\\u6211\\\\u4eec\\\\u6839\\\\u636e\\\\u300a\\\\u9690\\\\u79c1\\\\u58f0\\\\u660e\\\\u300b\\\\u4fdd\\\\u62a4\\\\u60a8\\\\u586b\\\\u5199\\\\u7684\\\\u6240\\\\u6709\\\\u4fe1\\\\u606f\\",\\"color_text\\":\\"\\\\u300a\\\\u9690\\\\u79c1\\\\u58f0\\\\u660e\\\\u300b\\",\\"url\\":\\"\\"}"}]',
                items: []
              }
            ],
            phone: '15351234596'
          }
        };
        // 按照 order_num 从小到大排序
        const list = res.data.ques_list.sort(this.compare('order_num'));
        !this.isPreview && res.data.phone && (this.currentPhone = Number(res.data.phone));
        // 手机号验证开启状态
        const phoneItem = list.find(item => item.type == 0 && item.default_type == 2);
        this.isPhoneValidate = phoneItem.options && JSON.parse(phoneItem.options).open_verify == 1;
        // 默认填写手机号
        !this.isPreview && res.data.phone && (this.verifyForm.phone = Number(res.data.phone));
        this.list = list;
        //todo  地域 options 格式化处理
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
        if (lastQuestion.subject === '隐私声明') {
          this.privacy = lastQuestion;
          this.privacy && this.privacyFormatter();
        }
        list.some(item => item.type === 5) && this.getAreaList();
      },
      //获取区域列表 todo domain获取
      getAreaList() {},
      //切换tab
      switchTab(type) {
        if (type === this.activeTab) {
          return;
        }
        this.activeTab = type;
      },
      //关闭模态窗
      handleClose() {
        this.visible = false;
      },
      //切换展开/收起状态
      changeFoldStatus(status) {
        this.overflowStatus = status;
      },
      //排序
      compare(property) {
        return function (a, b) {
          let value1 = a[property];
          let value2 = b[property];
          return value1 - value2;
        };
      },
      //区域变化
      regionalChange(type) {
        this.form[this.regionalId] = this[type];
        this.$refs.form.validateField('' + this.regionalId, res => {
          console.log(res);
        });
      },
      //获取短信验证码
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

        //todo 获取短信验证码
        if (this.mobileKey) {
          this.countDown(isForm);
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
       * 初始化网易易盾图片验证码 todo 待改善
       */
      callCaptcha(id) {
        const captcha = id === '#setCaptcha' ? 'captcha1' : 'captcha2';
        const that = this;
        // eslint-disable-next-line
        initNECaptcha({
          captchaId: that.captchakey,
          element: id,
          //todo 动态读取项目的中英文设置
          lang: 'zh-CN',
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
      //隐私声明格式化
      privacyFormatter() {
        const parseOpts = JSON.parse(this.privacy.options);
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

        this.privacyText = text;
      },
      //todo 提交报名表单
      submitForm() {},
      //提交已报名的表单
      submitVerify() {}
    }
  };
</script>

<style lang="less">
  .vmp-sign-up-form {
    @red: #fb3a32;
    @redBg: #ffebeb;
    @blue: #3562fa;
    @blueBg: #ebefff;
    @purple: #8d57a4;
    @purpleBg: #f5bdea;
    .el-dialog__header {
      padding: 0;
    }
    .el-dialog__headerbtn {
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
      -webkit-box-align: center;
      -ms-flex-align: center;
      align-items: center;
      .el-dialog__close {
        color: #fff;
      }
    }

    .el-dialog__body {
      padding: 0;
    }
    &__wrap {
      padding-bottom: 87px;
    }
    &__banner {
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
    &__content {
      padding: 0 75px;
    }
    &__title {
      font-size: 22px;
      color: #1a1a1a;
      margin: 40px 0 22px;
      text-align: center;
      font-weight: 500;
      font-family: PingFangSC-Medium, PingFang SC;
      line-height: 33px;
    }
    &__introduction {
      color: #666666;
      font-size: 14px;
      line-height: 20px;
      word-break: break-all;
      font-weight: 400;
      position: relative;
      &__detail {
        position: absolute;
        bottom: 0;
        right: 4px;
        cursor: pointer;
        background-color: #fff;
        color: #3562fa;
        .isEllipsis {
          color: #666666;
        }
      }
    }
    &__introduction-fold {
      word-break: break-all;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }
    &__tab-bar {
      width: 100%;
      margin: 43px auto 20px;
      display: flex;
      justify-content: center;
    }
    &__tab-bar-tabs {
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
    &__main-form {
      .el-radio-group {
        width: 100%;
        padding-left: 0;
        > div {
          padding: 10px 0;
        }
      }
    }
    &__verify-form {
    }
    .verify-code-box {
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
      // 云盾样式重置
      .captcha {
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
            background-image: url(./images/icon-slide1.png) !important;
            background-size: 28px 20px;
            background-position: center;
            margin-top: -5px;
          }
          &:hover {
            .yidun_slider__icon {
              background-image: url(./images/icon-slide.png) !important;
            }
          }
        }
        .yidun--success {
          .yidun_control {
            .yidun_slider__icon {
              background-image: url(./images/icon-succeed.png) !important;
            }
            .yidun_slider {
              .yidun_slider__icon {
                background-image: url(./images/icon-succeed.png);
                background-size: 28px 20px;
                background-position: center;
              }
              &:hover {
                .yidun_slider__icon {
                  background-image: url(./images/icon-succeed.png);
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
      .send-code-btn {
        position: absolute;
        right: 13px;
        top: 3px;
        height: 34px;
        width: 90px;
        padding: 0;
        border-radius: 2px;
        font-size: 13px;
        border: 0;
      }
    }
    .btn-box {
      text-align: center;
    }
  }
</style>
