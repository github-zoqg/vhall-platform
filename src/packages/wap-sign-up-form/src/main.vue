<template>
  <div class="vmp-wap-sign-up-form">
    <div v-if="formOpenLinkStatus == 1" class="vmp-wap-sign-up-form__wrap">
      <header class="cover-pic">
        <img class="form_cover" :src="coverPic" v-parseImgOss="{ url: coverPic }" alt="" />
        <!-- <img :src="coverPic"/></img> -->
      </header>
      <div class="vmp-wap-sign-up-form__content">
        <div class="vmp-wap-sign-up-form__content__title-box">
          <h1 class="title-box__title-text">
            <pre>{{ formInfo.title }}</pre>
          </h1>
          <p
            ref="intro"
            v-if="formInfo.intro"
            :class="[
              'title-box__intro-text',
              overflowStatus
                ? 'title-box__intro-text-ellipsis'
                : showToggle && !overflowStatus
                ? 'title-box__intro-text-padding'
                : ''
            ]"
          >
            <span>
              <pre>{{ formInfo.intro }}</pre>
            </span>
            <span
              @click="changeFoldStatus(false)"
              class="text-tail"
              v-show="overflowStatus && showToggle"
            >
              <span class="is-ellipsis">...</span>
              {{ $t('form.form_1011') }}
            </span>
            <span
              @click="changeFoldStatus(true)"
              class="text-tail text-tail-2"
              v-show="!overflowStatus && showToggle"
            >
              <span class="is-ellipsis"></span>
              {{ $t('form.form_1012') }}
            </span>
          </p>
        </div>
        <div class="vmp-wap-sign-up-form__content__tab-box">
          <template v-for="tab in tabConfig[isSubscribe]">
            <p
              :class="[activeTab === tab.code ? 'active' : '', formInfo.theme_color]"
              :key="tab.code"
              @click="switchTab(tab.code)"
            >
              <span>
                <pre>{{ tab.text }}</pre>
              </span>
            </p>
          </template>
        </div>
        <!--报名表单-->
        <ul v-show="activeTab === 1" class="vmp-wap-sign-up-form__content__tab-content">
          <li
            v-show="![6, '6'].includes(question.type)"
            v-for="(question, quesIndex) in list"
            :key="question.id"
            class="tab-content-li"
          >
            <p class="title-text">
              <span v-if="!!question.is_must" class="star" style="font-family: monospace">*</span>
              <span class="num" v-if="quesIndex < 9">0{{ quesIndex + 1 }}.</span>
              <span class="num" v-else>{{ quesIndex + 1 }}.</span>
              <span class="label">
                <pre>{{ convertLanguage(question.subject, question) }}</pre>
              </span>
            </p>
            <!-- 输入框 -->
            <template
              v-if="(question.type === 0 && question.default_type !== 4) || question.type === 1"
            >
              <input
                :ref="question.id"
                @input="onValidate(question)"
                v-model="form[question.id]"
                :placeholder="placeholderMap[question.default_type] || $t('form.form_1014')"
                type="text"
                :maxlength="getInputLimit(question)"
              />
              <p v-show="!!errMsgMap[question.id]" class="err-msg">
                {{ errMsgMap[question.id] }}
              </p>
            </template>
            <!-- 单选框 -->
            <template v-if="question.default_type === 4 || question.type === 2">
              <template v-if="question.default_type === 4">
                <div @click="handleRadioClick(question, '男')" class="radio-item">
                  <span :class="{ 'radio-value': true, active: '男' == form[question.id] }">
                    {{ $t('form.form_1015') }}
                  </span>
                </div>
                <div @click="handleRadioClick(question, '女')" class="radio-item">
                  <span :class="{ 'radio-value': true, active: '女' == form[question.id] }">
                    {{ $t('form.form_1016') }}
                  </span>
                </div>
              </template>
              <template v-else>
                <div
                  @click="handleRadioClick(question, radioItem)"
                  class="radio-item"
                  v-for="radioItem in question.items"
                  :key="radioItem.id"
                >
                  <span
                    :class="{
                      'radio-value': true,
                      active: radioItem.id == form[question.id],
                      isMultiOther: radioItem.type === 1 && radioItem.id == form[question.id]
                    }"
                  >
                    <pre>{{ radioItem.subject }}</pre>
                  </span>
                  <textarea
                    v-model="form[`${question.id}${radioItem.id}`]"
                    v-if="radioItem.type === 1 && radioItem.id == form[question.id]"
                    maxlength="60"
                    :placeholder="$t('form.form_1017')"
                    type="text"
                  ></textarea>
                </div>
              </template>
              <p v-show="!!errMsgMap[question.id]" class="err-msg">
                {{ errMsgMap[question.id] }}
              </p>
            </template>
            <!-- 多选框 -->
            <template v-if="question.type === 3">
              <div
                @click="handleCheckBoxClick(question, checkItem)"
                class="radio-item"
                v-for="checkItem in question.items"
                :key="checkItem.id"
              >
                <span
                  :class="{
                    'checkbox-value': true,
                    active: form[question.id].some(item => checkItem.id == item)
                  }"
                >
                  <i class="vh-iconfont vh-line-check"></i>
                  <pre>{{ checkItem.subject }}</pre>
                </span>
                <textarea
                  @click.stop="preventClick"
                  v-model="form[`${question.id}${checkItem.id}`]"
                  v-if="
                    checkItem.type === 1 && form[question.id].some(item => checkItem.id == item)
                  "
                  maxlength="60"
                  :placeholder="$t('form.form_1080')"
                  type="text"
                ></textarea>
              </div>
              <p v-show="!!errMsgMap[question.id].length" class="err-msg">
                {{ errMsgMap[question.id] }}
              </p>
            </template>
            <!-- 下拉 -->
            <template v-if="question.type === 4">
              <div class="select-box">
                <custom-select-picker
                  :ref="question.id"
                  v-model="form[question.id]"
                  @change="onValidate(question)"
                  :placeholder="$t('form.form_1018')"
                  :columns="question.items"
                  :option="{ label: 'subject', value: 'id' }"
                ></custom-select-picker>
                <!--                <div class="select-xl">-->
                <!--                  <select-->
                <!--                    :ref="question.id"-->
                <!--                    @change="onValidate(question)"-->
                <!--                    v-model="form[question.id]"-->
                <!--                    class="select-item"-->
                <!--                  >-->
                <!--                    <option value disabled selected hidden>{{ $t('form.form_1018') }}</option>-->
                <!--                    <option v-for="option in question.items" :key="option.id">-->
                <!--                      {{ option.subject }}-->
                <!--                    </option>-->
                <!--                  </select>-->
                <!--                  <label class="select-arrow"></label>-->
                <!--                </div>-->
              </div>
              <p v-show="!!errMsgMap[question.id]" class="err-msg">
                {{ errMsgMap[question.id] }}
              </p>
            </template>
            <!-- 地域选择 -->
            <template v-if="question.type === 5">
              <custom-cascade
                :ref="question.id"
                v-model="cascadeResultList"
                @change="handleCascadeChange(question)"
                :placeholder="$t('form.form_1018')"
                :options="getCascadeOptions(question)"
              ></custom-cascade>
              <!--              &lt;!&ndash; 省 &ndash;&gt;-->
              <!--              <div class="select-box">-->
              <!--                <div class="select-xl">-->
              <!--                  <select-->
              <!--                    :ref="question.id"-->
              <!--                    @change="onValidate(question)"-->
              <!--                    v-model="province"-->
              <!--                    class="select-item"-->
              <!--                  >-->
              <!--                    <option value disabled selected hidden>{{ $t('form.form_1004') }}</option>-->
              <!--                    <option v-for="opt in provinces" :key="opt.value" :value="opt.value">-->
              <!--                      {{ opt.label }}-->
              <!--                    </option>-->
              <!--                  </select>-->
              <!--                  <label class="select-arrow"></label>-->
              <!--                </div>-->
              <!--              </div>-->
              <!--              &lt;!&ndash; 市 &ndash;&gt;-->
              <!--              <div class="select-box" v-if="question.options.show_city == 1">-->
              <!--                <div class="select-xl">-->
              <!--                  <select @change="onValidate(question)" v-model="city" class="select-item">-->
              <!--                    <option value disabled selected hidden>{{ $t('form.form_1005') }}</option>-->
              <!--                    <option v-for="opt in currentCityList" :key="opt.value" :value="opt.value">-->
              <!--                      {{ opt.label }}-->
              <!--                    </option>-->
              <!--                  </select>-->
              <!--                  <label class="select-arrow"></label>-->
              <!--                </div>-->
              <!--              </div>-->
              <!--              &lt;!&ndash; 区 &ndash;&gt;-->
              <!--              <div class="select-box" v-if="question.options.show_district == 1">-->
              <!--                <div class="select-xl">-->
              <!--                  <select @change="onValidate(question)" v-model="county" class="select-item">-->
              <!--                    <option value disabled selected hidden>{{ $t('form.form_1006') }}</option>-->
              <!--                    <option v-for="opt in currentCountyList" :key="opt.value" :value="opt.value">-->
              <!--                      {{ opt.label }}-->
              <!--                    </option>-->
              <!--                  </select>-->
              <!--                  <label class="select-arrow"></label>-->
              <!--                </div>-->
              <!--              </div>-->
              <p v-show="!!errMsgMap[question.id]" class="err-msg">
                {{ errMsgMap[question.id] }}
              </p>
            </template>
          </li>
          <li v-if="isPhoneValidate" class="tab-content-li">
            <div id="setCaptcha1" class="captcha">
              <input v-model.trim="form.imgCode" type="text" />
            </div>
            <p class="err-msg" v-show="errorMsgShow">{{ $t('account.account_1028') }}</p>
          </li>
          <li v-if="isPhoneValidate" class="tab-content-li">
            <div>
              <input
                type="number"
                pattern="[0-9]*"
                maxlength="6"
                oninput="if(value.length>6) value = value.slice(0,6)"
                ref="code"
                :placeholder="$t('form.form_1020')"
                @input="onValidateCode"
                class="verify-code"
                v-model.trim="form.code"
              />
              <button
                :disabled="time != 60"
                @click="getDyCode(true)"
                :class="{ 'code-btn': true, enable: codeEnable && time === 60 }"
              >
                {{ time === 60 ? $t('form.form_1021') : `${time}s` }}
              </button>
            </div>
            <p v-show="!!errMsgMap.code" class="err-msg">{{ errMsgMap.code }}</p>
          </li>
          <li v-if="privacy" class="tab-content-li">
            <div class="privacy-box clearfix" @click="handleClickPrivacy(privacy)">
              <i
                class="privacy-item vh-iconfont vh-line-check"
                :class="{ active: form[privacy.id] }"
              ></i>
              <pre v-html="privacyText"></pre>
            </div>
            <p v-show="!!errMsgMap[privacy.id]" class="err-msg">{{ errMsgMap[privacy.id] }}</p>
          </li>
          <li class="tab-content-li" v-show="loadingEnd">
            <button @click="submit" :class="['submit-btn', formInfo.theme_color]">
              {{ $t('form.form_1019') }}
            </button>
          </li>
          <li v-if="!isEmbed && !privacy">
            <!-- 隐私合规（嵌入不支持） -->
            <vmp-privacy-compliance
              scene="signForm"
              clientType="mobile"
              compType="2"
            ></vmp-privacy-compliance>
          </li>
        </ul>
        <!--验证码表单-->
        <ul v-show="activeTab === 2" class="vmp-wap-sign-up-form__content__tab-content">
          <li class="tab-content-li">
            <p class="title-text">
              <span class="star" style="font-family: monospace">*</span>
              <span class="label">{{ $t('form.form_1081') }}</span>
            </p>
            <input
              ref="verifyphone"
              @input="onValidateVerify(true)"
              v-model="verifyForm.phone"
              :placeholder="$t('account.account_1025')"
              type="text"
            />
            <p class="err-msg" v-show="errPhone">{{ errPhoneMsg }}</p>
          </li>
          <li v-if="isPhoneValidate" class="tab-content-li">
            <div id="setCaptcha2" class="captcha">
              <input style="margin-top: 0" v-model.trim="verifyForm.imgCode" type="text" />
            </div>
            <p class="err-msg" v-show="errorMsgShow">{{ $t('account.account_1028') }}</p>
          </li>
          <li v-if="isPhoneValidate" class="tab-content-li">
            <div>
              <input
                type="number"
                pattern="[0-9]*"
                maxlength="6"
                oninput="if(value.length>6) value = value.slice(0,6)"
                ref="verifycode"
                :placeholder="$t('form.form_1020')"
                @input="onValidateVerify(false)"
                class="verify-code"
                v-model.trim="verifyForm.code"
              />
              <button
                :disabled="verifyTime != 60"
                @click="getDyCode(false)"
                :class="{ 'code-btn': true, enable: verifyCodeEnable && verifyTime === 60 }"
              >
                {{ verifyTime === 60 ? $t('form.form_1021') : `${verifyTime}s` }}
              </button>
            </div>
            <p v-show="errCode" class="err-msg">{{ errCode }}</p>
          </li>
          <li v-if="privacy" class="tab-content-li">
            <div class="privacy-box clearfix" @click="handleClickPrivacy(privacy)">
              <i
                class="privacy-item vh-iconfont vh-line-check"
                :class="{ active: form[privacy.id] }"
              ></i>
              <pre v-html="privacyText"></pre>
            </div>
            <p v-show="!!errMsgMap[privacy.id]" class="err-msg">{{ errMsgMap[privacy.id] }}</p>
          </li>
          <li class="tab-content-li">
            <button @click="submitVerify" :class="['submit-btn', formInfo.theme_color]">
              {{ $t('form.form_1082') }}
            </button>
          </li>
          <li v-if="!isEmbed && !privacy">
            <!-- 隐私合规（嵌入不支持） -->
            <vmp-privacy-compliance
              scene="signForm"
              clientType="mobile"
              compType="2"
            ></vmp-privacy-compliance>
          </li>
        </ul>
      </div>
    </div>
    <div v-if="formOpenLinkStatus == 2" class="no-authority-wrap">
      <p>
        {{ $t('message.message_1006') }}
        <br />
        {{ $t('message.message_1025') }}
      </p>
    </div>
    <!-- 这个元素不显示用于计算两行的高度 -->
    <p id="sign-up-title-intor" ref="noVisible">
      &nbsp;
      <br />
      &nbsp;
    </p>
    <alertBox
      v-if="isSubmitSuccess"
      :title="$t('account.account_1061')"
      :titleBtn="$t('common.common_1033')"
      @authClose="signStartConfirm"
      @authSubmit="signStartConfirm"
    >
      <div slot="content">
        <i18n path="form.form_1032">
          <span place="n">{{ startTime }}</span>
        </i18n>
      </div>
    </alertBox>
  </div>
</template>

<script>
  // import defaultHeader from '@/packages/sign-up-form/src/img/formHeader.png';
  import {
    validEmail,
    validPhone,
    getQueryString,
    replaceHtml,
    delUrlParams
  } from '@/app-shared/utils/tool';
  import { debounce } from 'lodash';
  import {
    useSignUpFormServer,
    useRoomBaseServer,
    setRequestHeaders,
    useSubjectServer
  } from 'middle-domain';
  import { initWeChatSdk } from '@/app-shared/utils/wechat';
  import customSelectPicker from './components/customSelectPicker';
  import customCascade from './components/customCascade';
  import alertBox from '@/app-shared/components/confirm.vue';
  import { cropperImage } from '@/app-shared/utils/common';
  import skins from '@/app-shared/skins/wap';
  export default {
    name: 'VmpWapSignUpForm',
    components: {
      customSelectPicker,
      customCascade,
      alertBox
    },
    data() {
      return {
        // 活动id 或者 专题ID
        webinarOrSubjectId: this.$route.params.id,
        //报名表单独立链接是否有效
        formOpenLinkStatus: 0,
        //默认的图片前缀地址
        defaultImgUrl: `https:${process.env.VUE_APP_PUBLIC_PATH}/upload/`,
        //基础信息
        formInfo: {
          cover: 1
        },
        //表单模板
        form: {},
        //地域的级联选择器保存的值
        cascadeResultList: [],

        //初始化的活动类型
        isSubscribe: 0,
        //简介文字是否超长
        overflowStatus: false,
        showToggle: false,
        //当前激活的tab
        activeTab: 1,
        // 手机短信验证是都开启
        isPhoneValidate: false,
        // 是否支持国外手机号
        isAbroadPhoneValide: false,
        //表单的问题列表
        list: [],
        //题目的类型中文翻译
        langDefaultZH: [
          '姓名',
          '性别',
          '手机',
          '邮箱',
          '地域',
          '公司',
          '职务',
          '隐私声明',
          '活动报名',
          '我已报名',
          '单选题',
          '多选题',
          '问答题',
          '下拉题'
        ],
        //题目的类型的英文翻译
        langDefaultCode: [
          'form.form_1001',
          'form.form_1055',
          'form.form_1064',
          'form.form_1003',
          'form.form_1002',
          'form.form_1054',
          'form.form_1056',
          'form.form_1013',
          'form.form_1025',
          'form.form_1024',
          'form.form_1068',
          'form.form_1069',
          'form.form_1070',
          'form.form_1071'
        ],
        //错误信息的map
        errMsgMap: {},
        //省份
        province: '',
        //城市
        city: '',
        //国家
        county: '',
        //省份列表
        provinces: [],
        //城市列表
        cityList: {},
        //国家列表
        countyList: {},
        //是否有错误信息
        errorMsgShow: false,
        //是否电话号码有误
        errPhone: false,
        //是否验证码有误
        errCode: false,
        //电话号码错误的提示信息
        errPhoneMsg: '',
        //需要单独校验的表单项
        verifyForm: {
          phone: '',
          imgCode: '',
          code: ''
        },
        time: 60,
        //验证码倒计时
        verifyTime: 60,
        //当前用户的手机号
        currentPhone: '',
        //区域选项id
        regionalId: '',
        //区域选项条件
        regionalOptions: {},
        refArr: [],
        //是否有隐私声明
        privacy: false,
        //隐私声明文字
        privacyText: '',
        //答案
        answer: {},
        //是否显示云盾验证码
        codeEnable: false,
        verifyCodeEnable: false,
        showCaptcha: false, // 专门用于 校验登录次数 接口返回 需要显示图形验证码时使用
        captchaKey: 'b7982ef659d64141b7120a6af27e19a0', // 云盾key
        mobileKey: '', // 云盾值
        captcha1: null, // 云盾实例
        captcha2: null, // 云盾实例
        //是第一次验证
        isFirstChange: true,
        //默认的banner图
        defaultHeader:
          'https://cnstatic01.e.vhall.com/common-static/middle/images/platform-common/form_up.png',
        startTime: '',
        queryString: '',
        isSubmitSuccess: false,
        ajaxInfoEnd: false,
        ajaxListEnd: false,
        interfaceType:
          window.location.href.indexOf('/special/entryform') != -1 ? 'subject' : 'webinar', // 依据界面路由，确认当前报名表单接口调用类型：subject-专题相应；webinar-活动相应
        isEmbed: window.location.href.indexOf('/embedclient/') != -1
      };
    },
    computed: {
      // 报名表单是否加载完毕
      loadingEnd() {
        return this.ajaxInfoEnd && this.ajaxListEnd;
      },
      // 广告头图
      coverPic() {
        if (this.formInfo.cover) {
          let cover = `${this.defaultImgUrl}${this.formInfo.cover}`;
          if (cropperImage(cover)) {
            return cover;
          } else {
            return cover + '?x-oss-process=image/resize,m_fill,w_750,h_125,limit_0';
          }
        } else {
          return this.defaultHeader;
        }
      },
      //当前的城市列表
      currentCityList() {
        return this.cityList[this.province];
      },
      //当前的区域列表
      currentCountyList() {
        return this.countyList[this.city];
      },
      //获取级联选择器数据
      getCascadeOptions() {
        return function (question) {
          let list = this.provinces || [];
          const { show_city, show_district } = question?.options || {};
          if (show_city == 1) {
            list = (list || []).map(item => {
              item.children = Array.isArray(this.cityList[item.value])
                ? this.cityList[item.value]
                : [];
              if (show_district == 1) {
                item.children = (item.children || []).map(cityItem => {
                  cityItem.children = Array.isArray(this.countyList[cityItem.value])
                    ? this.countyList[cityItem.value]
                    : [];
                  return cityItem;
                });
              }
              return item;
            });
            return list;
          }
          return list;
        };
      },
      //tab栏的配置
      tabConfig() {
        return {
          1: [
            {
              code: 1,
              text: this.$t(this.formInfo.tab_form_title)
            },
            {
              code: 2,
              text: this.$t(this.formInfo.tab_verify_title)
            }
          ],
          2: [
            {
              code: 2,
              text: this.$t(this.formInfo.tab_verify_title)
            },
            {
              code: 1,
              text: this.$t(this.formInfo.tab_form_title)
            }
          ]
        };
      },
      //输入文字提示的map
      placeholderMap() {
        return {
          1: this.$t('interact_tools.interact_tools_1005'),
          2: this.$t('account.account_1025'),
          3: this.$t('form.form_1023'),
          5: {
            province: this.$t('form.form_1003'),
            city: this.$t('form.form_1004'),
            county: this.$t('form.form_1005')
          },
          6: this.$t('form.form_1020')
        };
      },
      //计算输入框限制的字数
      getInputLimit() {
        return function (question = {}) {
          let maxLength = '';
          if (question.default_type == 1) {
            maxLength = 50;
          } else {
            maxLength = question.type == 0 ? '' : 60;
          }
          return maxLength;
        };
      }
    },
    watch: {
      //是否开启了手机验证码验证
      isPhoneValidate: {
        immediate: true,
        handler(newVal) {
          // 云盾实例
          if (newVal) {
            this.$nextTick(() => {
              this.callCaptcha('#setCaptcha1');
              this.callCaptcha('#setCaptcha2');
            });
          }
        }
      },
      //问题列表
      list: {
        deep: true,
        handler(newList) {
          const form = {};
          let phoneId = '';
          newList &&
            newList.length &&
            newList.forEach(item => {
              form[item.id] = '';
              if (item.type === 3) {
                form[item.id] = [];
              } else if (item.type === 0 && item.default_type === 2 && this.currentPhone) {
                // 手机号
                form[item.id] = this.currentPhone;
                phoneId = item.id;
              }
              if (item.items && item.items.length) {
                item.items.forEach(elem => {
                  if (elem.type === 1) {
                    form[`${item.id}${elem.id}`] = '';
                  }
                });
              }
            });
          this.form = {
            imgCode: '',
            code: '',
            ...form
          };
          this.errMsgMap = {
            code: '',
            ...JSON.parse(JSON.stringify(form))
          };
          this.errMsgMap[phoneId] = '';
        }
      }
    },
    beforeCreate() {
      this.signUpFormServer = useSignUpFormServer();
      if (window.location.href.indexOf('/special/entryform/') != -1) {
        // 专题下独立报名表单
        this.subjectServer = useSubjectServer();
      }
    },
    created() {
      if (
        this.interfaceType === 'subject' ||
        window.location.href.indexOf('/special/detail') != -1
      ) {
        this.subjectServer = useSubjectServer();
        this.$i18n.locale = 'zh-CN';
      }
    },
    mounted() {
      if (
        this.interfaceType !== 'subject' &&
        window.location.href.indexOf('/special/detail') == -1
      ) {
        // 如果是活动下才使用房间Server
        this.roomBaseServer = useRoomBaseServer();
      }
      this.interfaceType === 'subject' ? this.initSubjectInfo() : this.initWebinarInfo();
    },
    methods: {
      getWebinarSkinInfo() {
        this.roomBaseServer
          .getSkinsInfo({
            webinar_id: this.webinarOrSubjectId
          })
          .then(res => {
            if (res.code == 200) {
              this.skinInfo = res.data;
              this.setPageConfig();
            }
          });
      },
      // 设置接口入参，是活动维度 还是 专题维度
      setParamsIdByRoute(params) {
        if (this.interfaceType === 'webinar') {
          params.webinar_id = this.webinarOrSubjectId;
        } else if (this.interfaceType === 'subject') {
          params.subject_id = this.webinarOrSubjectId;
        }
        return params;
      },
      async initWebinarInfo() {
        this.getWebinarSkinInfo();
        await this.getFormLinkStatus();
        await this.roomBaseServer.getLangList(this.$route.params.id);
        const roomBaseState = this.roomBaseServer.state;
        document.title = roomBaseState.languages.curLang.subject;
        let lang = roomBaseState.languages.lang;
        this.$i18n.locale = lang.type;
        if (!this.isEmbed) {
          // 如果是嵌入的时候，不需要token传入
          setRequestHeaders({
            token: localStorage.getItem('token') || ''
          });
        }
        // if (localStorage.getItem('lang')) {
        //   this.$i18n.locale = parseInt(localStorage.getItem('lang')) == 1 ? 'zh' : 'en';
        // } else {
        //   this.$i18n.locale = 'zh';
        // }
        this.getWebinarInfo();
        this.getBaseInfo();
        this.getQuestionList();
      },
      async initSubjectInfo() {
        this.setPageConfig();
        if (this.subjectServer) {
          // 初始化专题
          await this.initSubjectAuth();
        } else {
          console.log('没有专题subjectServer');
        }
        await this.getFormLinkStatus();
        setRequestHeaders({
          token: localStorage.getItem('token') || ''
        });
        this.isSubscribe = 1;
        this.activeTab = 1;
        this.cascadeResultList = [];
        this.getSubjectDetail();
        this.getBaseInfo(); // 获取表单 - 表单基本信息
        this.getQuestionList(); // 获取表单 - 题目列表
      },
      async getSubjectDetail() {
        try {
          const res = await this.subjectServer.getSubjectInfo({
            subject_id: this.webinarOrSubjectId
          });
          if (res.code == 200 && res.data) {
            // 获取专题分享信息
            this.wxShareInfoSubject(res.data);
          } else {
            this.$toast(res.msg || '获取专题信息失败');
            return;
          }
        } catch (err) {
          this.$toast(err.msg || '获取专题信息失败');
        }
      },
      // 初始化专题信息，获取专题访客ID
      async initSubjectAuth() {
        const visitorId = localStorage.getItem('visitorId') || this.$route.query.visitorId;
        let params = {
          subject_id: this.webinarOrSubjectId,
          visitor_id: !['', null, void 0].includes(visitorId) ? visitorId : undefined,
          ...this.$route.query
        };
        // 如果已经鉴权过，就直接进入观看端，否则走鉴权
        await this.subjectServer.initSubjectInfo(params);
      },
      //获取报名独立链接状态
      getFormLinkStatus() {
        if (this.$route.query.isIndependent == 0) {
          this.formOpenLinkStatus = 1;
          return;
        }
        const params = {
          ...this.setParamsIdByRoute({}),
          visit_id: localStorage.getItem('visitorId')
        };
        return this.signUpFormServer
          .getFormLinkStatus(params)
          .then(res => {
            if (res.code == 200) {
              // 如果独立链接无效，显示无效页
              this.formOpenLinkStatus = !res.data.has_registed && res.data.available == 0 ? 2 : 1;
              if (res.data.has_registed) {
                this.jumpPage();
              }
            } else {
              this.formOpenLinkStatus = 2;
            }
          })
          .catch(res => {
            // 错误异常
            this.formOpenLinkStatus = 2;
          });
      },
      // 获取活动信息 及 分享信息
      getWebinarInfo() {
        return this.roomBaseServer
          .getWebinarInfo({
            webinar_id: this.webinarOrSubjectId,
            is_no_check: 1
          })
          .then(async res => {
            // /v3/webinars/webinar/info 接口判断 res.data.webinar_state:  2 预告 1 直播 3 结束 5 回放 4 点播
            // webinar_type: 1.音频 2 视频 3 互动  5 定时直播
            this.isSubscribe = res.data.webinar_state == 2 ? 1 : 2;
            this.activeTab = res.data.webinar_state == 2 ? 1 : 2;
            this.cascadeResultList = [];
            if (!this.isEmbed) {
              // 如果不是嵌入报名表单的时候 才支持分享
              const shareInfo = await this.roomBaseServer.getShareSettingInfo({
                webinarId: res.data.id
              });
              if (shareInfo && shareInfo.code == 200 && shareInfo.data) {
                let title = shareInfo.data.title;
                title = title.length - 30 > 0 ? title.substring(0, 30) : title;
                let shareInfo = {
                  title: title,
                  img_url: shareInfo.data.img_url,
                  introduction: replaceHtml(shareInfo.data.introduction, 42)
                };
                this.wxShareInfoWebinar(shareInfo);
              }
            }
          })
          .catch(error => {
            if (error.code == 512503 || error.code == 512502) {
              // 不支持的活动类型（flash）
              let origin =
                process.env.NODE_ENV === 'production'
                  ? window.location.origin
                  : 'https://t-webinar.e.vhall.com';
              window.location.href = `${origin}/${this.webinarOrSubjectId}`;
            }
          });
      },
      //获取表单基本信息
      getBaseInfo() {
        this.ajaxInfoEnd = false;
        this.signUpFormServer
          .getFormBaseInfo(this.setParamsIdByRoute({}))
          .then(res => {
            this.ajaxInfoEnd = true;
            if (res.data.tab_form_title) {
              res.data.tab_form_title =
                this.langDefaultZH.indexOf(res.data.tab_form_title) > -1
                  ? this.langDefaultCode[this.langDefaultZH.indexOf(res.data.tab_form_title)]
                  : res.data.tab_form_title;
            }
            if (res.data.tab_verify_title) {
              res.data.tab_verify_title =
                this.langDefaultZH.indexOf(res.data.tab_verify_title) > -1
                  ? this.langDefaultCode[this.langDefaultZH.indexOf(res.data.tab_verify_title)]
                  : res.data.tab_verify_title;
            }
            this.formInfo = res.data;
            this.$nextTick(() => {
              this.calculateText();
            });
          })
          .catch(e => {
            this.ajaxInfoEnd = true;
          });
      },
      //计算简介文字是否过长
      calculateText() {
        const txtDom = this.$refs.intro;
        if (!txtDom) return false;
        const twoHeight = this.$refs.noVisible.offsetHeight;
        const curHeight = txtDom.offsetHeight;
        if (curHeight > twoHeight) {
          this.showToggle = true;
        }
      },
      //获取问题列表
      getQuestionList() {
        this.ajaxListEnd = false;
        this.signUpFormServer
          .getQuestionsList(this.setParamsIdByRoute({}))
          .then(res => {
            this.ajaxListEnd = true;
            // 按照 order_num 从小到大排序
            const list = res.data.ques_list.sort(this.compare('order_num'));
            this.currentPhone = res.data.phone;
            // 手机号验证开启状态
            const phoneItem = list.find(item => item.type == 0 && item.default_type == 2);
            this.isPhoneValidate =
              phoneItem.options && JSON.parse(phoneItem.options).open_verify == 1;
            // 是否支持国外手机号
            this.isAbroadPhoneValide =
              phoneItem.options && JSON.parse(phoneItem.options).support_foreign_phone == 1;
            // 默认填写手机号
            res.data.phone && (this.verifyForm.phone = res.data.phone);

            this.list = list;
            // 地域 options 格式化处理
            this.list.some(item => {
              if (item.type == 5) {
                item.options = JSON.parse(item.options);
                this.regionalOptions = item.options;
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
            // 获取地域列表
            list.some(item => item.type === 5) && this.getAreaList();
            // 生成可以获取焦点的题目列表
            this.generateRefArr(list);
          })
          .catch(error => {
            this.ajaxListEnd = true;
            console.log(error);
          });
      },
      // 生成需要获取焦点的题目id列表
      generateRefArr(list) {
        list.forEach(item => {
          if (
            (item.type == 0 && item.default_type != 4) ||
            item.type == 1 ||
            item.type == 4 ||
            item.type == 5
          ) {
            this.refArr.push(item.id);
          }
        });
      },
      // 获取地域列表
      getAreaList() {
        const _this = this;
        this.signUpFormServer
          .getAreaList()
          .then(res => {
            _this.$set(_this, 'provinces', res.provinces);
            _this.$set(_this, 'cityList', res.cities);
            _this.$set(_this, 'countyList', res.counties);
          })
          .catch(error => {
            console.log(error);
          });
      },
      //初始化网易易盾图片验证码
      callCaptcha(id) {
        const captcha = id === '#setCaptcha1' ? 'captcha1' : 'captcha2';
        const that = this;
        // eslint-disable-next-line
        initNECaptcha({
          captchaId: that.captchaKey,
          element: id,
          mode: 'float',
          lang:
            this.interfaceType === 'subject' ||
            window.location.href.indexOf('/special/detail') != -1
              ? 'zh-CN'
              : (localStorage.getItem('lang') == '1' ? 'zh-CN' : 'en') || 'zh-CN',
          onReady() {},
          onVerify(err, data) {
            if (data) {
              that.mobileKey = data.validate;
              that.showCaptcha = true;
              that.errorMsgShow = '';
              if (captcha === 'captcha1') {
                that.codeEnable = true;
              } else {
                that.verifyCodeEnable = true;
              }
            } else {
              that[captcha] = '';
              that.errorMsgShow = true;
              if (captcha === 'captcha1') {
                that.codeEnable = false;
              } else {
                that.verifyCodeEnable = false;
              }
            }
          },
          onload(instance) {
            that[captcha] = instance;
            if (captcha === 'captcha1') {
              that.codeEnable = false;
            } else {
              that.verifyCodeEnable = false;
            }
          }
        });
      },
      //格式化隐私声明
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
      //级联选择器选中处理
      handleCascadeChange(question) {
        const { show_city, show_district } = question?.options || {};
        const list = (this.cascadeResultList || []).map(option => option.value);
        this.province = list[0] || '';
        if (show_city == 1) {
          this.city = list[1] || '';
        }
        if (show_district == 1) {
          this.county = list[2] || '';
        }
        this.onValidate(question);
      },
      //提交报名表单
      submit: debounce(function () {
        this.reportForWatch();
        this.list.forEach(question => {
          // 表单验证
          this.onValidate(question, true);
        });
        this.isPhoneValidate && this.onValidateCode();
        let firstErrIndex = 'first';
        let isValidate = true;
        let item;
        // 遍历 errMsgList 判断是否所有的表单都验证通过
        for (item in this.errMsgMap) {
          if (this.errMsgMap[item] != '') {
            this.refArr.forEach((refItem, index) => {
              if (refItem == item) {
                firstErrIndex == 'first'
                  ? (firstErrIndex = index)
                  : firstErrIndex > index && (firstErrIndex = index);
              }
            });
            isValidate = false;
          }
        }
        // 如果除验证码之外的表单全部验证通过，则判断验证码（这里不需要判断是否开启手机验证）
        firstErrIndex == 'first' && this.errMsgMap.code && (firstErrIndex = 'code');

        if (isValidate) {
          this.formHandler();
          this.submitSignUpForm();
        } else {
          // 验证失败，获取焦点
          if (firstErrIndex != 'first') {
            const firstErrRef =
              firstErrIndex == 'code' ? this.$refs.code : this.$refs[this.refArr[firstErrIndex]][0];
            firstErrRef.focus();
          }
        }
      }, 1000),
      signStartConfirm() {
        this.isSubmitSuccess = false;
        location.replace(
          `${window.location.origin}${process.env.VUE_APP_ROUTER_BASE_URL}/lives${
            this.isEmbed ? '/embedclient' : ''
          }/watch/${this.webinarOrSubjectId}${this.queryString}`
        );
      },
      //提交表单到服务器
      submitSignUpForm() {
        const phoneItem = this.list.find(item => item.type === 0 && item.default_type === 2);
        const nameItem = this.list.find(item => item.type === 0 && item.default_type === 1);

        let params = {
          ...this.setParamsIdByRoute({}),
          phone: this.form[phoneItem.id],
          form: JSON.stringify(this.answer),
          report: JSON.stringify({
            phone: this.form[phoneItem.id],
            real_name: this.form[nameItem.id]
          })
        };

        if (this.isPhoneValidate) {
          params.verify_code = this.form.code;
        }
        if (this.isEmbed) {
          // 如果是嵌入页-报名表单，地址栏有啥就传递啥
          params = {
            ...params,
            ...this.$route.query
          };
        } else {
          if (this.$route.query.refer) {
            params.refer = this.$route.query.refer;
          }
        }
        if (localStorage.getItem('visitorId')) {
          params.visit_id = localStorage.getItem('visitorId');
        }
        return this.signUpFormServer
          .submitSignUpForm(params)
          .then(res => {
            if (res && [200, '200'].includes(res.code)) {
              localStorage.setItem('visitorId', res.data.visit_id);
              // 专题/活动 -- 报名成功后处理
              this.interfaceType === 'subject' ? this.getSubjectStatus() : this.getWebinarStatus();
            } else {
              return Promise.reject(res);
            }
          })
          .catch(err => {
            if (err.code == 512809 || err.code == 512570) {
              // 短信验证码验证失败，触发表单验证失败
              // 现在的表单验证码逻辑完全由后端返回结果决定，前端不验证格式
              this.errMsgMap.code = this.$t('cash.cash_1039');
            } else if (err.code == 512814 || err.code == 512815) {
              this.$toast(this.$t('form.form_1033'));
              // 跳转专题详情 还是 活动报名表单详情
              if (this.interfaceType === 'subject') {
                const queryString = this.returnQueryString('subject');
                location.replace(
                  `${window.location.origin}${process.env.VUE_APP_ROUTER_BASE_URL}/special/detail?id=${this.webinarOrSubjectId}${queryString}`
                );
              } else {
                let queryString = this.returnQueryString();
                if (this.isEmbed) {
                  // 如果是嵌入页表单
                  queryString = delUrlParams(window.location.search, ['isIndependent']);
                }
                location.replace(
                  `${window.location.origin}${process.env.VUE_APP_ROUTER_BASE_URL}/lives${
                    this.isEmbed ? '/embedclient' : ''
                  }/watch/${this.webinarOrSubjectId}${queryString}`
                );
              }
            } else {
              this.$toast(this.$tec(err.code) || err.msg);
            }
          });
      },
      // 组装地址栏入参
      returnQueryString(type = null) {
        let queryString = this.$route.query.refer ? `?refer=${this.$route.query.refer}` : '';
        if (queryString && this.$route.query.invite) {
          queryString += this.$route.query.invite ? `&invite=${this.$route.query.invite}` : '';
        } else if (this.$route.query.invite) {
          queryString = this.$route.query.invite ? `?invite=${this.$route.query.invite}` : '';
        }
        //  微博分享时携带的入参 - 优化设置了报名表单但是未参会时，调用接口无效,shareId未携带问题。
        const share_id = getQueryString('share_id');
        const shareId = getQueryString('shareId');
        if (queryString.indexOf('?') != -1) {
          queryString += share_id ? `&share_id=${share_id}` : '';
          queryString += shareId ? `&shareId=${shareId}` : '';
        } else if (queryString.indexOf('?') == -1 && share_id) {
          queryString += share_id ? `?share_id=${share_id}` : '';
        } else if (queryString.indexOf('?') == -1 && shareId) {
          queryString += shareId ? `?shareId=${shareId}` : '';
        }
        if (type === 'subject') {
          // 专题地址栏要拼接-是否无延迟
          const hasDelay = getQueryString('delay');
          queryString += hasDelay
            ? `${queryString.indexOf('?') != -1 ? '&' : '?'}delay=${hasDelay}`
            : '';
        }
        return queryString;
      },
      //获取活动报名状态
      getWebinarStatus() {
        return this.roomBaseServer
          .getWebinarInfo({
            webinar_id: this.webinarOrSubjectId,
            is_no_check: 1
          })
          .then(res => {
            // /v3/webinars/webinar/info 接口判断 res.data.webinar_state:  2 预告 1 直播 3 结束 5 回放 4 点播
            // webinar_type: 1.音频 2 视频 3 互动  5 定时直播
            const queryString = this.returnQueryString();
            if (res.data.webinar_state == 2) {
              this.startTime = res.data.start_time;
              if (this.isEmbed) {
                // 如果是嵌入页表单
                this.queryString = delUrlParams(window.location.search, ['isIndependent']);
              } else {
                this.queryString = queryString;
              }
              this.isSubmitSuccess = true;
            } else {
              if (this.isEmbed) {
                // 如果是嵌入页表单
                let queryString = delUrlParams(window.location.search, ['isIndependent']);
                location.replace(
                  `${window.location.origin}${process.env.VUE_APP_ROUTER_BASE_URL}/lives/embedclient/watch/${this.webinarOrSubjectId}${queryString}`
                );
              } else {
                location.replace(
                  `${window.location.origin}${process.env.VUE_APP_ROUTER_BASE_URL}/lives/watch/${this.webinarOrSubjectId}${queryString}`
                );
              }
            }
          })
          .catch(e => {
            if (e.code == 512503 || e.code == 512502) {
              // 不支持的活动类型（flash）
              window.location.href = `${window.location.origin}/${this.webinarOrSubjectId}`;
            }
          });
      },
      // 获取专题报名表单状态
      getSubjectStatus() {
        // webinar_state =》 1 直播  2 预告  3 结束 4 点播 5 回放
        const queryString = this.returnQueryString('subject');
        // 提交报名表单成功，跳转专题详情
        location.replace(
          `${window.location.origin}${process.env.VUE_APP_ROUTER_BASE_URL}/special/detail?id=${this.webinarOrSubjectId}${queryString}`
        );
      },
      //将原始表单转化为答案
      formHandler() {
        const answer = {};
        this.list.forEach(item => {
          if (item.type === 0) {
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
                        : this.$t('form.form_1063')
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
            this.form[item.id].forEach(checkOpt => {
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
                          : this.$t('form.form_1063')
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
            const element = item.items.find(elem => elem.id === this.form[item.id]);
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
            const province = this.provinces.find(ele => ele.value == this.province) || {
              label: '',
              value: ''
            };
            const city =
              this.regionalOptions.show_city == 1 && this.currentCityList
                ? this.currentCityList.find(ele => ele.value == this.city)
                : { label: '', value: '' };
            const county =
              this.regionalOptions.show_district == 1 && this.currentCountyList
                ? this.currentCountyList.find(ele => ele.value == this.county)
                : { label: '', value: '' };
            answer.address.push({
              id: item.id,
              content: `${province.label}${city.label}${county.label}`,
              contentDe: [
                {
                  id: province.value,
                  content: province.label
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
      //排序
      compare(property) {
        return function (a, b) {
          let value1 = a[property];
          let value2 = b[property];
          return value1 - value2;
        };
      },
      // 获取微信分享信息
      wxShareInfoWebinar(info) {
        const wx_url = `${window.location.origin}${process.env.VUE_APP_ROUTER_BASE_URL}${
          this.isEmbed ? '/embedclient' : ''
        }/lives/entryform/${this.webinarOrSubjectId}`;
        this.signUpFormServer.getWxShareInfo({ wx_url: wx_url }).then(res => {
          if (res.code == 200 && res.data) {
            const params = {
              appId: res.data.appId,
              timestamp: res.data.timestamp,
              nonceStr: res.data.nonceStr,
              signature: res.data.signature
            };
            let desc = null;
            desc = info.introduction.replace(/&nbsp;/g, '');
            desc = desc.replace(/<[^>]+>|&[^>]+;/g, '');
            desc = desc.length > 32 ? `${desc.trim().substring(0, 30)}...` : desc.trim();
            initWeChatSdk(
              { ...params },
              {
                title: info.title,
                desc,
                link: `${window.location.origin}${process.env.VUE_APP_ROUTER_BASE_URL}${
                  this.isEmbed ? '/embedclient' : ''
                }/lives/entryform/${this.webinarOrSubjectId}`,
                imgUrl: info.img_url
              }
            );
          }
        });
      },
      // 获取微信分享信息
      wxShareInfoSubject(info) {
        const wx_url = `${window.location.origin}${process.env.VUE_APP_ROUTER_BASE_URL}/special/entryform/${this.webinarOrSubjectId}`;
        this.subjectServer.wechatShare({ wx_url: wx_url }).then(res => {
          initWeChatSdk(
            {
              appId: res.data.appId,
              timestamp: res.data.timestamp,
              nonceStr: res.data.nonceStr,
              signature: res.data.signature
            },
            {
              title: info.title,
              desc: replaceHtml(info.intro, 42),
              link: `${window.location.origin}${process.env.VUE_APP_ROUTER_BASE_URL}/special/entryform/${this.webinarOrSubjectId}`,
              imgUrl: info.cover
            }
          );
        });
      },
      //切换展开/收起状态
      changeFoldStatus(status) {
        this.overflowStatus = status;
      },
      //切换tab
      switchTab(type) {
        if (type === this.activeTab) {
          return;
        }
        this.activeTab = type;
      },
      //多语言翻译
      convertLanguage(title, vo) {
        if (
          (vo.default_type == 0 && [1, 4, 5, 2, 3].includes(vo.type)) ||
          (vo.type == 0 && [1, 4, 3, 2].includes(vo.default_type))
        ) {
          // 地域 & 公司 & 职务 +  姓名 & 性别 & 邮箱 翻译标题 翻译标题
          return this.langDefaultZH.indexOf(title) > -1
            ? this.$t(this.langDefaultCode[this.langDefaultZH.indexOf(title)])
            : title;
        } else {
          // 不翻译
          return title;
        }
      },
      //表单验证
      onValidate(question, isSubmit = false) {
        // 如果验证的是隐私声明，并且是第一次验证，则直接通过
        if (question.type === 6 && this.isFirstChange && !isSubmit) {
          this.isFirstChange = false;
          return false;
        }
        // 邮箱 required 为 false 的时候，如果有值仍需校验格式
        if (!question.is_must && !(question.type === 0 && question.default_type === 3)) {
          return false;
        }
        // 输入框
        if (question.type === 0 && question.default_type === 1) {
          // 姓名
          this.errMsgMap[question.id] = !this.form[question.id] ? this.$t('form.form_1026') : '';
        } else if (question.type === 0 && question.default_type === 2) {
          // 手机号
          if (this.isPhoneValidate) {
            if (this.form[question.id] == 0) {
              this.form[question.id] = '';
            }
            this.errMsgMap[question.id] =
              validPhone('', this.form[question.id], this) === true
                ? ''
                : validPhone('', this.form[question.id], this);
          }
          // 支持国外手机号
          else if (this.isAbroadPhoneValide) {
            if (this.form[question.id]) {
              this.errMsgMap[question.id] = /^\d{1,15}$/.test(this.form[question.id])
                ? ''
                : this.$t('account.account_1069');
            } else {
              this.errMsgMap[question.id] = this.$t('account.account_1025');
            }
          } else {
            if (this.form[question.id] == 0) {
              this.form[question.id] = '';
            }
            this.errMsgMap[question.id] = /^[1-9]\d{10}$/.test(this.form[question.id])
              ? ''
              : this.$t('account.account_1069');
          }
        } else if (question.type === 0 && question.default_type === 3) {
          // 邮箱
          this.errMsgMap[question.id] =
            validEmail(question.is_must, this.form[question.id], this) === true
              ? ''
              : validEmail(question.is_must, this.form[question.id], this);
        } else if (question.type === 1) {
          // 问答
          this.errMsgMap[question.id] = !this.form[question.id] ? this.$t('form.form_1028') : '';
        } else if (question.type === 0 && question.default_type === 4) {
          // 性别
          this.errMsgMap[question.id] = !this.form[question.id] ? this.$t('form.form_1027') : '';
        } else if (question.type === 2 || question.type === 4) {
          // 单选/下拉
          this.errMsgMap[question.id] = !this.form[question.id] ? this.$t('form.form_1029') : '';
        } else if (question.type === 3) {
          // 多选
          this.errMsgMap[question.id] = !this.form[question.id].length
            ? this.$t('form.form_1029')
            : '';
        } else if (question.type === 5) {
          // 地域
          this.errMsgMap[question.id] = !this.province ? this.$t('form.form_1004') : '';
          if (this.errMsgMap[question.id]) return false;
          question.options.show_city == 1 &&
            (this.errMsgMap[question.id] = !this.city ? this.$t('form.form_1005') : '');
          if (this.errMsgMap[question.id]) return false;
          question.options.show_district == 1 &&
            (this.errMsgMap[question.id] = !this.county ? this.$t('form.form_1006') : '');
          if (this.errMsgMap[question.id]) return false;
        } else if (question.type === 6) {
          if (this.isFirstChange) {
            this.isFirstChange = false;
          }
          // 隐私
          this.errMsgMap[question.id] = !this.form[question.id] ? this.$t('form.form_1030') : '';
        }
      },
      //校验验证码
      onValidateCode() {
        this.errMsgMap.code = !this.form.code ? this.$t('cash.cash_1039') : '';
      },
      //隐私协议选框点击事件
      handleClickPrivacy(privacy) {
        this.form[privacy.id] = !this.form[privacy.id];
        this.onValidate(privacy);
      },
      // 单选选项点击事件
      handleRadioClick(question, radioItem) {
        if (radioItem === '男') {
          this.form[question.id] = '男';
        } else if (radioItem === '女') {
          this.form[question.id] = '女';
        } else {
          this.form[question.id] = radioItem.id;
        }
        this.onValidate(question);
      },
      // 多选题选项点击事件
      handleCheckBoxClick(question, checkItem) {
        const index = this.form[question.id].findIndex(item => item === checkItem.id);
        index !== -1
          ? this.form[question.id].splice(index, 1)
          : this.form[question.id].push(checkItem.id);
        this.onValidate(question);
      },
      //阻止事件冒泡
      preventClick() {
        return false;
      },
      //获取短信验证码
      getDyCode(isForm) {
        let phone = '';
        let phoneItem = '';
        let isValidate = '';
        if (isForm) {
          phoneItem = this.list.find(item => item.type === 0 && item.default_type === 2);
          phone = this.form[phoneItem.id];
          this.errMsgMap[phoneItem.id] =
            validPhone('', phone, this) === true ? '' : validPhone('', phone, this);
          isValidate = this.errMsgMap[phoneItem.id] === '';
        } else {
          phone = this.verifyForm.phone;
          this.onValidateVerify(true);
          isValidate = !this.errPhone;
        }
        // 获取短信验证码
        if (isValidate && this.mobileKey) {
          this.countDown(isForm);
          const params = { ...this.setParamsIdByRoute({}), phone: phone, captcha: this.mobileKey };
          this.signUpFormServer.sendVerifyCode(params);
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
          this.mobileKey = '';
          isForm ? this.callCaptcha('#setCaptcha1') : this.callCaptcha('#setCaptcha2');
          isForm ? (this.codeEnable = false) : (this.verifyCodeEnable = false);
        }
      },
      //校验表单项
      onValidateVerify(isPhone) {
        if (isPhone) {
          // 如果开启手机短信验证
          if (this.isPhoneValidate) {
            if (validPhone('', this.verifyForm.phone, this) === true) {
              this.errPhone = false;
              this.errPhoneMsg = '';
            } else {
              this.errPhone = true;
              this.errPhoneMsg = validPhone('', this.verifyForm.phone, this);
            }
          } else {
            // 如果没有开启手机验证
            if (this.verifyForm.phone && isNaN(this.verifyForm.phone) === false) {
              this.errPhone = false;
              this.errPhoneMsg = '';
            } else {
              this.errPhone = true;
              this.errPhoneMsg = this.$t('account.account_1069');
            }
          }
        } else {
          this.errCode = this.verifyForm.code == '' ? this.$t('cash.cash_1039') : '';
        }
        // 支持国外手机号
        if (this.isAbroadPhoneValide) {
          if (this.verifyForm.phone) {
            if (this.verifyForm.phone == 0 || !/^\d{1,15}$/.test(this.verifyForm.phone)) {
              this.errPhone = true;
              this.errPhoneMsg = this.$t('account.account_1069');
            }
          } else {
            this.errPhone = true;
            this.errPhoneMsg = this.$t('account.account_1025');
          }
        }
      },
      //取得可用的查询参数
      getQueryVariable(variable) {
        let query = window.location.search.substring(1);
        let vars = query.split('&');
        for (let i = 0; i < vars.length; i++) {
          let pair = vars[i].split('=');
          if (pair[0] == variable) {
            return pair[1];
          }
        }
        return false;
      },
      //我已报名--验证
      submitVerify: debounce(function () {
        if (!this.form[this.privacy.id] && this.privacy && this.privacy.is_must) {
          this.$toast(this.$t('form.form_1030'));
          return;
        }
        this.onValidateVerify(true);
        this.isPhoneValidate && this.onValidateVerify(false);
        if (!this.errPhone && !this.errCode) {
          const refer = this.getQueryVariable('refer');
          const params = {
            ...this.setParamsIdByRoute({}),
            phone: this.verifyForm.phone,
            ...this.$route.query,
            refer
          };
          if (!params.refer) {
            delete params.refer;
          }

          if (this.isPhoneValidate) {
            params.verify_code = this.verifyForm.code;
          }

          if (localStorage.getItem('visitorId')) {
            params.visit_id = localStorage.getItem('visitorId');
          }

          this.signUpFormServer
            .checkIsRegistered(params)
            .then(res => {
              // 如果已经报名
              if (res.data.has_registed == 1) {
                localStorage.setItem('visitorId', res.data.visit_id);
                this.$toast(this.$t('form.form_1033'));
                // 跳转专题详情 还是 活动报名表单详情
                this.jumpPage();
              } else {
                this.$toast(this.$t('form.form_1034'));
                this.activeTab = 1;
                //清空一下级联的选中的数组
                this.cascadeResultList = [];
              }
            })
            .catch(err => {
              // 如果已经报名
              if (err.code == 512809 || err.code == 512570) {
                // 短信验证码验证失败，触发表单验证失败
                // 现在的表单验证码逻辑完全由后端返回结果决定，前端不验证格式
                this.errCode = this.$t('cash.cash_1039');
              } else if (err.code == 512002) {
                this.$toast(this.$t('message.message_1020'));
              } else if (err.code == 512502) {
                this.$toast(this.$t('message.message_1021'));
              }
            });
        } else {
          this.errPhone ? this.$refs.verifyphone.focus() : this.$refs.verifycode.focus();
        }
      }, 1000),
      // 数据上报
      reportForWatch() {
        try {
          const params = {};
          const paramMap = new Map();
          const getReportParamKey = item => {
            if (item.type === 5) {
              return 'address';
            }
            if (item.default_type) {
              const defaultTypeArr = [null, 'name', 'phone_number', 'email', 'gender'];
              return defaultTypeArr[item.default_type];
            }
            // 公司与职务没有其他后端字段能判断,只能靠中文标题匹配
            if (item.subject === '职务' && item.type === 4) {
              return 'career';
            }
            if (item.subject === '公司' && item.type === 1) {
              return 'company';
            }
          };
          // 1.获取当前题型所包含的key值
          Array.isArray(this.list) &&
            this.list.forEach(item => {
              const key = getReportParamKey(item);
              key && paramMap.set(key, item.id);
            });
          // 2. 是否有address, 如果有,组织address数据
          if (paramMap.has('address')) {
            const address = {};
            address.province = this.cascadeResultList[0]?.value || '';
            address.city = this.cascadeResultList[1]?.value || '';
            address.county = this.cascadeResultList[2]?.value || '';
            params.address = address;
            paramMap.delete('address');
          }
          // 3. 是否有手机, 组织数据
          if (paramMap.has('phone_number')) {
            const id = paramMap.get('phone_number');
            params.phone_number = this.form[`${id}`];
            paramMap.delete('phone_number');
          }
          // 4. 是否有职务, 组织数据
          if (paramMap.has('career')) {
            let param = ''; // 默认传空
            const id = paramMap.get('career');
            const answerId = this.form[`${id}`];
            const question = this.list.find(item => id === item.id);
            if (question && Array.isArray(question.items) && question.items.length) {
              const selected = question.items.find(answer => answer.id === answerId);
              if (selected) {
                param = selected.subject ? encodeURIComponent(selected.subject) : '';
              }
            }
            params.career = param;
            paramMap.delete('career');
          }
          // 其余key值组织参数
          paramMap.forEach((item, key) => {
            const value = this.form[`${item}`];
            const param = value ? encodeURIComponent(value) : '';
            params[key] = param;
          });
          if (!window.vhallReportForWatch) {
            this.reportFetch(170018, params);
          } else {
            window.vhallReportForWatch?.report(170018, params);
          }
        } catch (e) {
          console.warn('报名表单:', e);
        }
      },
      // FIXME: 若直接用url访问或者刷新, 无法获取上报的公用信息,也暂时无法使用上报sdk,待更好的方案
      reportFetch(k, params) {
        try {
          const BASE_URL = ['production', 'pre'].includes(process.env.NODE_ENV)
            ? 'https://dc.e.vhall.com/prostat'
            : 'https://t-dc.e.vhall.com:443/prostat';
          params.webinar_id = this.webinar_id; // 公共参数只能拿到webinar_id
          const token = window.btoa(JSON.stringify(params));
          const id = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
          const url = `${BASE_URL}?k=${k}&id=${id}&token=${token}`;
          fetch(url);
        } catch (e) {
          console.warn('数据上报出错', e);
        }
      },
      // 跳转对应页面
      jumpPage() {
        if (this.interfaceType === 'subject') {
          const queryString = this.returnQueryString('subject');
          location.replace(
            `${window.location.origin}${process.env.VUE_APP_ROUTER_BASE_URL}/special/detail?id=${this.webinarOrSubjectId}${queryString}`
          );
        } else {
          let queryString = this.returnQueryString();
          // 如果是嵌入页表单
          if (this.isEmbed) {
            // 如果是嵌入页表单
            queryString = delUrlParams(window.location.search, ['isIndependent']);
          }
          location.replace(
            `${window.location.origin}${process.env.VUE_APP_ROUTER_BASE_URL}/lives${
              this.isEmbed ? '/embedclient' : ''
            }/watch/${this.webinarOrSubjectId}${queryString}`
          );
        }
      },
      setPageConfig() {
        if (this.interfaceType === 'subject') {
          window.skins = skins;
          skins.setTheme(skins.themes.theme_main_white);
        } else {
          const styleMap = {
            1: 'main', // 传统风格
            2: 'fashion', // 时尚风格
            3: 'fashion' // 极简风格预约页使用时尚风格背景
          };

          const themeMap = {
            1: 'black',
            2: 'white',
            3: 'red',
            4: 'golden',
            5: 'blue'
          };

          let skin_json_wap = {
            style: 1,
            backGroundColor: 2
          };

          if (this.skinInfo?.skin_json_wap && this.skinInfo.skin_json_wap != 'null') {
            skin_json_wap = this.skinInfo.skin_json_wap;
          }

          // 设置主题，如果没有就用传统风格白色
          const style = styleMap[skin_json_wap?.style || 1];
          const theme = themeMap[skin_json_wap?.backGroundColor || 2];

          console.log('----设置主题为----', `theme_${style}_${theme}`);

          skins.setTheme(skins.themes[`theme_main_${theme}`]);
        }
      }
    }
  };
</script>

<style lang="less">
  .vmp-wap-sign-up-form {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    overflow-y: auto;
    position: relative;
    background: #fff;
    pre {
      font-family: Arial, 'Microsoft Yahei' !important;
      display: inline;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    &__wrap {
      .cover-pic {
        width: 100%;
        height: 125px;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        .form_cover {
          width: 100%;
          height: 100%;
        }
      }
    }
    &__content {
      font-family: Arial, 'Microsoft Yahei' !important;
      width: 100%;
      padding: 0 0.47rem;
      margin-bottom: 0.27rem;
      font-size: 0.32rem;
      &__title-box {
        .title-box__title-text {
          margin: 0.4rem auto 0;
          font-size: 0.48rem;
          text-align: center;
          color: #232323;
          word-break: break-word;
          line-height: 50px;
        }
        .title-box__intro-text {
          margin: 0.4rem auto 0;
          color: #555;
          font-size: 0.373rem;
          word-break: break-word;
          position: relative;
          line-height: 38px;
          &.title-box__intro-text-ellipsis {
            white-space: nowrap;
            word-break: break-all;
            display: -webkit-box;
            /* autoprefixer: ignore next */
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          &.title-box__intro-text-padding {
            padding-bottom: 38px;
          }
          .text-tail {
            position: absolute;
            bottom: 0;
            right: 0;
            cursor: pointer;
            background-color: #fff;
            color: #3562fa;
            .is-ellipsis {
              color: #666;
            }
          }
          .text-tail-2 {
            right: 4px;
          }
        }
      }
      &__tab-box {
        margin: 0.4rem auto;
        border-radius: 0.11rem;
        height: 1.067rem;
        display: flex;

        p {
          width: calc(50% - 0.02rem);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.37rem;
          color: var(--theme-component-sign-up-tab-font);
          background-color: var(--theme-component-sign-up-tab-bg);
          &:first-child {
            border: 0.02rem solid #d2d2d2;
            border-right: none;
            border-radius: 0.053rem 0 0 0.053rem;
            &.active {
              border-right: 0.02rem solid #d2d2d2;
            }
          }
          &:last-child {
            border: 0.02rem solid #d2d2d2;
            border-left: none;
            border-radius: 0 0.053rem 0.053rem 0;
            &.active {
              border-left: 0.02rem solid #d2d2d2;
            }
          }
          &.active {
            border-color: var(--theme-color);
            background-color: var(--theme-color-sub);
            color: var(--theme-color);
          }
        }
      }
      &__tab-content {
        .tab-content-li {
          margin-top: 0.52rem;
          position: relative;
          margin-bottom: 0.02rem;
          &:last-child {
            margin-top: 90px;
          }
        }
        input {
          height: 1.04rem;
          line-height: 0.84rem;
          width: 9.07rem;
          border: 0.02rem solid #d2d2d2;
          border-radius: 0.11rem;
          font-size: 0.37rem;
          padding: 0.1rem 0.2rem;
          outline: none;
          margin-top: 0.27rem;
          resize: none;
          color: #1a1a1a;
          &.verify-code {
            width: 5.23rem;
            margin-top: 0;
            float: left;
          }
          &::-webkit-input-placeholder {
            line-height: 0.84rem;
          }
        }
        .code-btn {
          display: inline-block;
          height: 1.06rem;
          width: 3.56rem;
          color: #fff;
          margin-left: 0.27rem;
          text-align: center;
          line-height: 0.4rem;
          outline: none;
          border-radius: 0.11rem;
          box-shadow: none;
          outline: #fff;
          cursor: default !important;
          background: #dedede !important;
          border: 0.02rem solid #dedede !important;
          &.enable {
            border: 0.02rem solid var(--theme-color) !important;
            background-color: var(--theme-color) !important;
          }
        }
      }
    }
    .title-text {
      position: relative;
      min-width: 1.52rem;
      max-width: 9rem;
      font-size: 0.37rem;
      .num {
        color: #666;
        margin-left: 0.1rem;
      }
      .label {
        word-break: break-word;
        margin-left: 0.1rem;
        color: #333;
      }
      .star {
        font-family: monospace;
        color: red !important;
        display: inline-block;
        margin-left: 0.133rem;
        font-size: 0.26rem !important;
        opacity: 0.8;
        position: relative;
        top: -0.06rem;
      }
    }
    .err-msg {
      position: absolute;
      bottom: -0.4rem;
      left: 0;
      font-size: 0.32rem;
      color: red;
    }
    .radio-item {
      position: relative;
      padding: 0 0.2rem 0 0.2rem;
      border-radius: 0.11rem;
      margin-top: 0.267rem;
      max-width: 9.07rem;
      textarea {
        word-break: break-all;
        resize: none;
        display: block;
        overflow-y: hidden;
        padding: 0.267rem 0.2rem 0.2rem;
        margin: 0.267rem auto 0;
        width: 94%;
        height: 0.517rem;
        border-radius: 0.1rem;
        border: solid 0.02rem #d2d2d2;
        font-size: 0.37rem;
        line-height: 0.48rem;
        font-family: Arial, 'Microsoft Yahei';
        color: #1a1a1a;
      }
      .radio-value {
        display: block;
        padding: 0.07rem 0 0 0.7rem;
        line-height: 1.5;
        color: #1a1a1a;
        word-break: break-all;
        font-size: 0.37rem;
        &:before {
          content: '';
          display: block;
          position: absolute;
          left: 0.267rem;
          top: 50%;
          transform: translateY(-50%);
          /* prettier-ignore */
          width: 15Px; /*no*/
          /* prettier-ignore */
          height: 15Px; /*no*/
          border-radius: 50%;
          /* prettier-ignore */
          border: 1Px solid #999; /*no*/
          box-sizing: border-box;
        }
        &.active:before {
          border: 0.1rem solid #fb3a32;
        }
        &.isMultiOther:before {
          top: 0.255rem;
        }
      }
      .checkbox-value {
        display: block;
        padding: 0.07rem 0 0 0.7rem;
        line-height: 1.5;
        font-size: 0.37rem;
        color: #1a1a1a;
        word-break: break-all;
        position: relative;
        .vh-line-check {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          /* prettier-ignore */
          width: 15Px; /*no*/
          /* prettier-ignore */
          height: 15Px; /*no*/
          border-radius: 0.1rem;
          /* prettier-ignore */
          border: 1Px solid #999; /*no*/
          box-sizing: border-box;
          line-height: 0.38rem;
          font-size: 0.28rem;
          text-align: center;
          &:before {
            display: none;
          }
        }
        &.active {
          .vh-line-check {
            background-color: #fb3a32;
            border-color: #fb3a32;
            color: #fff;
            &:before {
              display: block;
            }
          }
        }
      }
    }
    .select-box {
      .select-xl {
        position: relative;
      }
      .select-item {
        appearance: none;
        display: inline-block;
        width: 9.07rem;
        height: 1.07rem;
        line-height: 1.04rem;
        padding: 0 0.7rem 0 0.2rem;
        margin-top: 0.27rem;
        background-color: #fff;
        border: 0.02rem solid #d2d2d2;
        outline: none;
        color: #1a1a1a;
        font-size: 0.37rem;
        border-radius: 0.11rem;
      }
      .select-arrow {
        display: inline-block;
        position: absolute;
        width: 0.27rem;
        height: 0.2rem;
        top: 0.71rem;
        right: 0.25rem;
        background: url(./img/arrow-down-mobile.png) no-repeat scroll right center transparent;
        background-size: 100%;
      }
    }
    .privacy-box {
      min-height: 0.5rem;
      span {
        float: left;
        line-height: 0.42rem;
        margin-left: 0.1rem;
        width: calc(100% - 0.52rem);
      }
    }
    .privacy-item {
      &.vh-line-check {
        float: left;
        width: 0.38rem;
        height: 0.38rem;
        border-radius: 0.1rem;
        border: 0.03rem solid #999;
        box-sizing: border-box;
        line-height: 0.38rem;
        font-size: 0.28rem;
        text-align: center;
        margin-right: 3px;
        &:before {
          display: none;
        }
        &.active {
          background-color: #fb3a32;
          border-color: #fb3a32;
          color: #fff;
          &:before {
            display: block;
          }
        }
      }
    }
    .submit-btn {
      border: 0.024rem solid var(--theme-color);
      background-color: var(--theme-color);
      font-size: 0.37rem;
      color: #fff;
      outline: none;
      width: 9.07rem;
      height: 80px;
      border-radius: 50px;
    }
    .no-authority-wrap {
      width: 100%;
      height: 100%;
      background: url(./img/webinar.png) no-repeat center;
      background-size: cover;
      position: relative;
      p {
        text-align: center;
        color: #fff;
        font-size: 36px;
        line-height: 2;
        width: 100%;
        height: 144px;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        margin: auto;
      }
    }
    // 云盾样式重置,注释部分为设计稿样式，暂时不删除，有备无患
    .captcha {
      ::v-deep .yidun_tips {
        color: #999999 !important;
        line-height: 1.05rem !important;
      }
      ::v-deep .yidun_slide_indicator {
        line-height: 1.07rem !important;
        height: 1.07rem !important;
      }
      ::v-deep .yidun_control {
        line-height: 1.07rem !important;
        height: 1.07rem !important;
      }
      ::v-deep .yidun_slider {
        .yidun_slider__icon {
          width: 0.42rem !important;
          margin-left: -0.19rem !important;
          background-image: url(./img/icon-slide1.png) !important;
          background-size: 0.77rem 0.53rem !important;
          background-position: center !important;
          margin-top: -0.13rem !important;
        }
        &:hover {
          .yidun_slider__icon {
            background-image: url(./img/icon-slide.png) !important;
          }
        }
      }
      ::v-deep
        .yidun.yidun--light
        .yidun_control.yidun_control--moving
        .yidun_slider
        .yidun_slider__icon {
        background-image: url(./img/icon-slide.png) !important;
      }
      ::v-deep .yidun.yidun--light.yidun--success {
        .yidun_control {
          .yidun_slider__icon {
            background-image: url(./img/icon-succeed.png) !important;
          }
          .yidun_slider {
            .yidun_slider__icon {
              background-image: url(./img/icon-succeed.png) !important;
              background-size: 0.77rem 0.53rem !important;
              background-position: center !important;
            }
            &:hover {
              .yidun_slider__icon {
                background-image: url(./img/icon-succeed.png) !important;
                background-size: 0.77rem 0.53rem !important;
                background-position: center !important;
              }
            }
          }
        }
      }
      ::v-deep .yidun.yidun--light.yidun--success.yidun--jigsaw {
        .yidun_control .yidun_slider {
          background-color: #3562fa;
        }
        .yidun_slide_indicator {
          border-color: #3562fa;
          background-color: #f0f1fe;
        }
      }
      ::v-deep .yidun.yidun--light {
        .yidun_feedback {
          background-position: 0px -6.4rem;
          height: 0.53rem;
        }
        .yidun_refresh {
          background-position: 0px -9.1rem;
        }
      }
    }
  }
</style>
