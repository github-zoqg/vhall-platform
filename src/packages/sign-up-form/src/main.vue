<template>
  <div class="vmp-sign-up-form" :class="[isEntryForm ? 'vmp-sign-up-form--entry-from' : '']">
    <template v-if="!isEntryForm">
      <el-dialog
        title=""
        :visible.sync="visible"
        width="720px"
        custom-class="vmp-sign-up-form"
        @close="handleClose"
      >
        <div class="vmp-sign-up-form__wrap">
          <!--顶部banner图-->
          <div class="vmp-sign-up-form__banner">
            <img :class="`form_img form_bg_${imageCropperMode}`" :src="coverPic" alt="" />
            <!-- <el-image
              v-if="formInfo && formInfo.cover != 1"
              :src="formInfo.cover ? coverPic : defaultHeader"
              fit="cover"
            ></el-image> -->
          </div>
          <div class="vmp-sign-up-form__content">
            <!--表单名称-->
            <div class="vmp-sign-up-form__title">
              <pre>{{ formInfo.title }}</pre>
            </div>
            <!--表单简介-->
            <div
              class="vmp-sign-up-form__introduction"
              v-if="formInfo.intro"
              ref="intro"
              :class="[
                overflowStatus
                  ? 'vmp-sign-up-form__introduction-fold'
                  : 'vmp-sign-up-form__introduction-padding'
              ]"
            >
              <pre>{{ formInfo.intro }}</pre>
              <span
                v-show="overflowStatus && showToggle"
                class="vmp-sign-up-form__introduction__detail"
                @click="changeFoldStatus(false)"
              >
                <span class="is-ellipsis">...</span>
                {{ $t('form.form_1011') }}
              </span>
              <span
                v-show="!overflowStatus && showToggle"
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
                    <pre>{{ tab.text }}</pre>
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
                  :validate-on-rule-change="false"
                  label-position="top"
                  @submit.native.prevent
                >
                  <el-form-item
                    v-for="(question, quesIndex) in list"
                    v-show="question.type != 6"
                    :ref="`formItem_${question.id}`"
                    :key="question.id"
                    :prop="question.id + ''"
                    :label="
                      question.subject === '隐私声明'
                        ? ''
                        : `${quesIndex < 9 ? `0${quesIndex + 1}` : quesIndex + 1}.${convertLanguage(
                            question.subject,
                            question
                          )}`
                    "
                  >
                    <template slot="label">
                      <span v-if="question.subject === '隐私声明'"></span>
                      <pre v-else-if="quesIndex < 9">{{
                        `0${quesIndex + 1}.${convertLanguage(question.subject, question)}`
                      }}</pre>
                      <pre v-else>{{
                        `${quesIndex + 1}.${convertLanguage(question.subject, question)}`
                      }}</pre>
                    </template>
                    <!-- 输入框 -->
                    <template
                      v-if="
                        (question.type === 0 && question.default_type !== 4) || question.type === 1
                      "
                    >
                      <el-input
                        v-if="
                          question.type == 0 && question.default_type == 2 && !isAbroadPhoneValide
                        "
                        v-model.number="form[question.id]"
                        :maxlength="question.default_type == 2 ? 15 : question.type == 0 ? '' : 60"
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
                            : question.type == 0 && question.default_type !== 3
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
                              <pre>{{ radioItem.subject }}</pre>
                            </el-radio>
                            <template v-if="radioItem.type === 1">
                              <el-input
                                v-show="form[question.id] == radioItem.id"
                                v-model="form[`${question.id}${radioItem.id}`]"
                                maxlength="60"
                                autocomplete="off"
                                show-word-limit
                                :placeholder="$t('form.form_1017')"
                                style="margin-top: 10px"
                                class="radio-input"
                              ></el-input>
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
                            <pre>{{ checkItem.subject }}</pre>
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
                        popper-class="vmp-sign-up-form__entry-form-select"
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
                  <el-form-item
                    v-if="privacy"
                    class="privacy-item"
                    :prop="privacy.id + ''"
                    :ref="`formItem_${privacy.id}`"
                  >
                    <template>
                      <el-checkbox v-model="form[privacy.id]" class="privacy-checkbox">
                        <pre v-html="privacyText"></pre>
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
                  <!-- 隐私合规（嵌入不支持） -->
                  <vmp-privacy-compliance
                    v-if="!privacy"
                    scene="signForm"
                    clientType="pc"
                    compType="2"
                  ></vmp-privacy-compliance>
                </el-form>
              </template>
            </div>
            <!--验证码表单-->
            <div class="vmp-sign-up-form__verify-form" v-show="activeTab === 2">
              <!-- 验证 -->
              <template>
                <el-form
                  ref="verifyForm"
                  class="entryForm"
                  :model="verifyForm"
                  :rules="verifyRules"
                  @submit.native.prevent
                >
                  <el-form-item :label="$t('form.form_1022')" prop="phone">
                    <el-input
                      v-if="!isAbroadPhoneValide"
                      v-model.number.trim="verifyForm.phone"
                      maxlength="15"
                      auto-complete="off"
                      :placeholder="$t('account.account_1025')"
                    ></el-input>
                    <el-input
                      v-else
                      v-model.trim="verifyForm.phone"
                      maxlength="15"
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
                          :class="
                            showCaptchaVerify && isValidPhoneVerify ? 'isLoginActive' : 'no-border'
                          "
                          size="mini"
                          class="send-code-btn"
                          @click="verifyTime === 60 && getDyCode(false)"
                        >
                          {{ verifyTime === 60 ? $t('form.form_1021') : `${verifyTime}s` }}
                        </el-button>
                      </el-col>
                    </el-row>
                  </el-form-item>
                  <!-- 隐私声明 -->
                  <el-form-item v-if="privacy" class="privacy-item" :prop="privacy.id + ''">
                    <template>
                      <el-checkbox v-model="form[privacy.id]" class="privacy-checkbox">
                        <pre v-html="privacyText"></pre>
                      </el-checkbox>
                    </template>
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
                  <!-- 隐私合规（嵌入不支持） -->
                  <vmp-privacy-compliance
                    v-if="!privacy"
                    scene="signForm"
                    clientType="pc"
                    compType="2"
                  ></vmp-privacy-compliance>
                </el-form>
              </template>
            </div>
          </div>
        </div>
      </el-dialog>
    </template>
    <template v-else>
      <div class="vmp-sign-up-form__wrap">
        <!--顶部banner图-->
        <div class="vmp-sign-up-form__banner">
          <img :class="`form_img form_bg_${imageCropperMode}`" :src="coverPic" alt="" />
          <!-- <el-image
            v-if="formInfo && formInfo.cover != 1"
            :src="formInfo.cover ? coverPic : defaultHeader"
            fit="cover"
          ></el-image> -->
        </div>
        <div class="vmp-sign-up-form__content">
          <!--表单名称-->
          <div class="vmp-sign-up-form__title">
            <pre>{{ formInfo.title }}</pre>
          </div>
          <!--表单简介-->
          <div
            class="vmp-sign-up-form__introduction"
            v-if="formInfo.intro"
            ref="intro"
            :class="[
              overflowStatus
                ? 'vmp-sign-up-form__introduction-fold'
                : 'vmp-sign-up-form__introduction-padding'
            ]"
          >
            <pre>{{ formInfo.intro }}</pre>
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
                :validate-on-rule-change="false"
                label-position="top"
                @submit.native.prevent
              >
                <el-form-item
                  v-for="(question, quesIndex) in list"
                  v-show="question.type != 6"
                  :key="question.id"
                  :prop="question.id + ''"
                  :label="
                    question.subject === '隐私声明'
                      ? ''
                      : `${quesIndex < 9 ? `0${quesIndex + 1}` : quesIndex + 1}.${convertLanguage(
                          question.subject,
                          question
                        )}`
                  "
                >
                  <template slot="label">
                    <span v-if="question.subject === '隐私声明'"></span>
                    <pre v-else-if="quesIndex < 9">{{
                      `0${quesIndex + 1}.${convertLanguage(question.subject, question)}`
                    }}</pre>
                    <pre v-else>{{
                      `${quesIndex + 1}.${convertLanguage(question.subject, question)}`
                    }}</pre>
                  </template>
                  <!-- 输入框 -->
                  <template
                    v-if="
                      (question.type === 0 && question.default_type !== 4) || question.type === 1
                    "
                  >
                    <el-input
                      v-if="
                        question.type == 0 && question.default_type == 2 && !isAbroadPhoneValide
                      "
                      v-model.number="form[question.id]"
                      :maxlength="question.default_type == 2 ? 15 : question.type == 0 ? '' : 60"
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
                            <pre>{{ radioItem.subject }}</pre>
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
                          <pre>{{ checkItem.subject }}</pre>
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
                      >
                        <pre>{{ option.subject }}</pre>
                      </el-option>
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
                      <pre v-html="privacyText"></pre>
                    </el-checkbox>
                  </template>
                </el-form-item>
                <div class="btn-box" v-show="loadingEnd">
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
                <!-- 隐私合规（嵌入不支持） -->
                <vmp-privacy-compliance
                  v-if="!privacy"
                  scene="signForm"
                  clientType="pc"
                  compType="2"
                ></vmp-privacy-compliance>
              </el-form>
            </template>
          </div>
          <!--验证码表单-->
          <div class="vmp-sign-up-form__verify-form" v-show="activeTab === 2">
            <!-- 验证 -->
            <template>
              <el-form
                ref="verifyForm"
                class="entryForm"
                :model="verifyForm"
                :rules="verifyRules"
                @submit.native.prevent
              >
                <el-form-item :label="$t('form.form_1022')" prop="phone">
                  <el-input
                    v-if="!isAbroadPhoneValide"
                    v-model.number.trim="verifyForm.phone"
                    maxlength="15"
                    auto-complete="off"
                    :placeholder="$t('account.account_1025')"
                  ></el-input>
                  <el-input
                    v-else
                    v-model.trim="verifyForm.phone"
                    maxlength="15"
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
                        :class="
                          showCaptchaVerify && isValidPhoneVerify ? 'isLoginActive' : 'no-border'
                        "
                        size="mini"
                        class="send-code-btn"
                        @click="verifyTime === 60 && getDyCode(false)"
                      >
                        {{ verifyTime === 60 ? $t('form.form_1021') : `${verifyTime}s` }}
                      </el-button>
                    </el-col>
                  </el-row>
                </el-form-item>
                <!-- 隐私声明 -->
                <el-form-item v-if="privacy" class="privacy-item" :prop="privacy.id + ''">
                  <template>
                    <el-checkbox v-model="form[privacy.id]" class="privacy-checkbox">
                      <pre v-html="privacyText"></pre>
                    </el-checkbox>
                  </template>
                </el-form-item>
                <div class="btn-box" v-show="loadingEnd">
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
                <!-- 隐私合规（嵌入不支持） -->
                <vmp-privacy-compliance
                  v-if="!privacy"
                  scene="signForm"
                  clientType="pc"
                  compType="2"
                ></vmp-privacy-compliance>
              </el-form>
            </template>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
  // import defaultHeader from './img/formHeader.png';
  import { useRoomBaseServer, useSignUpFormServer, useSubjectServer } from 'middle-domain';
  import { boxEventOpitons, parseImgOssQueryString } from '@/app-shared/utils/tool.js';
  import { debounce } from 'lodash';
  import { cropperImage } from '@/app-shared/utils/common';
  export default {
    name: 'VmpSignUpForm',
    data() {
      return {
        imageCropperMode: 1,
        //默认的兜底的banner图
        defaultHeader:
          'https://cnstatic01.e.vhall.com/common-static/middle/images/platform-common/form_up.png',
        //上传的基础地址
        baseUrl: `https:${process.env.VUE_APP_PUBLIC_PATH}/upload/`,
        // 是否是独立表单
        isEntryForm: this.$route.path.indexOf('/entryform') !== -1,
        //是否是预览
        isPreview: this.$route.path.indexOf('/live/signup') !== -1,
        // 活动ID 或者 专题ID
        webinarOrSubjectId: '',
        //表单信息
        formInfo: {
          cover: 1 // 默认蓝色底图 闪动问题做区分
        },
        //简介内容是否超长
        overflowStatus: false,
        //简介内容是否超长
        showToggle: false,
        //模态窗是否可见
        visible: false,
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
        //初始化的活动类型
        isSubscribe: 1,
        //当前激活的tab
        activeTab: 1,
        //报名表单验证
        rules: {},
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
        //是否支持国外手机号
        isAbroadPhoneValide: false,
        // 云盾key
        captchaKey: 'b7982ef659d64141b7120a6af27e19a0',
        // 云盾值 - 用户报名
        mobileKey: '',
        // 云盾值 - 我已报名
        mobileKeyVerify: '',
        // 云盾实例
        captcha1: null,
        // 云盾实例
        captcha2: null,
        //报名表单的倒计时
        time: 60,
        //验证表单的倒计时
        verifyTime: 60,
        // 专门用于 校验登录次数 接口返回 需要显示图形验证码时使用 - 用户报名
        showCaptcha: false,
        // 专门用于 校验登录次数 接口返回 需要显示图形验证码时使用 - 用户报名
        showCaptchaVerify: false,
        //是否是校验手机(表单1)
        isValidPhone: false,
        // 是否是校验手机（表单2）
        isValidPhoneVerify: false,
        //联动选项是第几题
        colNum: '',
        //区域选项
        regionalId: '',
        //是否是短信验证码错误
        isVerifyCodeErr: false,
        //地域验证是否通过
        isValidRegional: true,
        isSubject: false, // 是否从专题入口打开
        ajaxInfoEnd: false,
        ajaxListEnd: false,
        interfaceType:
          window.location.href.indexOf('/special/entryform') != -1 ? 'subject' : 'webinar', // 依据界面路由，确认当前报名表单接口调用类型：subject-专题相应；webinar-活动相应
        isResetForm: false, // 是否重置表单，停止倒计时
        isResetFormVerify: false
      };
    },
    watch: {
      //省份
      province(newVal, oldVal) {
        if (newVal != oldVal) {
          this.city = '';
          this.county = '';
        }
      },
      //城市
      city(newVal, oldVal) {
        if (newVal != oldVal) {
          this.county = '';
        }
      },
      isPhoneValidate: {
        immediate: true,
        handler(newVal) {
          const _this = this;
          // 根据是否开启短信验证，生成相应的手机号验证规则
          if (newVal) {
            _this.verifyRules.phone = {
              required: true,
              validator: _this.validPhone,
              trigger: 'blur'
            };
          } else {
            _this.verifyRules.phone = {
              type: 'number',
              required: true,
              message: _this.$t('account.account_1069'),
              trigger: 'blur'
            };
          }
          // 云盾实例
          if (newVal) {
            _this.$nextTick(() => {
              _this.callCaptcha('#setCaptcha');
              _this.callCaptcha('#setCaptcha1');
            });
          }
        }
      },
      isAbroadPhoneValide: {
        // immediate: true,
        handler(newVal) {
          const _this = this;
          // 是否支持国外手机号
          if (newVal) {
            _this.verifyRules.phone = {
              required: true,
              validator: _this.checkAbroadPhone,
              trigger: 'blur'
            };
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
                }
                // 是否支持国外手机号
                else if (this.isAbroadPhoneValide) {
                  rules[item.id] = {
                    required: !!item.is_must,
                    validator: this.checkAbroadPhone,
                    trigger: 'blur'
                  };
                } else {
                  // TODO待翻译
                  rules[item.id] = {
                    required: !!item.is_must,
                    validator: this.checkNum,
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
              } else if (item.type === 5 && item.is_must) {
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
      // 报名表单是否加载完毕
      loadingEnd() {
        return this.ajaxInfoEnd && this.ajaxListEnd;
      },
      // 与网易易盾图片插件语言匹配
      // langNECaptcha() {
      //   const locale = window.$globalConfig.currentLang;
      //   let lang = 'zh-CN';
      //   switch (locale) {
      //     case 'zh':
      //       lang = 'zh-CN';
      //       break;
      //     case 'spain':
      //       lang = 'es';
      //       break;
      //     default:
      //       lang = locale;
      //   }
      //   return lang;
      // },
      // 广告头图
      coverPic() {
        if (this.formInfo.cover) {
          let cover = `${this.baseUrl}${this.formInfo.cover}`;
          if (cropperImage(cover)) {
            this.handlerImageInfo(cover);
            return cover;
          } else {
            return cover + '?x-oss-process=image/resize,m_fill,w_750,h_125,limit_0';
          }
        } else {
          return this.defaultHeader;
        }
      },
      //输入提示的多语言转换
      findPlaceHolder() {
        const _this = this;
        return function (type) {
          return _this.placeholderMap[type] || _this.$t('form.form_1014');
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
      //已报名的表单
      verifyRules() {
        return {
          phone: {
            type: 'number',
            required: true,
            validator: this.checkNum,
            message: this.$t('account.account_1069'),
            trigger: 'blur'
          },
          code: {
            required: true,
            validator: this.validCode,
            trigger: 'blur'
          }
        };
      },
      isEmbed() {
        // 是不是音视频嵌入
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.signUpFormServer = useSignUpFormServer();
      if (window.location.href.indexOf('/special/entryform/') != -1) {
        // 专题下独立报名表单
        this.subjectServer = useSubjectServer();
      }
    },
    created() {
      // TODO 待确认此处是否需要如此设置。
      if (
        this.interfaceType === 'subject' ||
        window.location.href.indexOf('/special/detail') != -1
      ) {
        this.$i18n.locale = 'zh-CN';
      }
    },
    mounted() {
      //因为这个组件也会在独立报名表单页使用，所以增加一下判断
      if (this.isEntryForm) {
        this.init();
      }
    },
    methods: {
      // 设置接口入参，是活动维度 还是 专题维度
      setParamsIdByRoute(params) {
        if (this.interfaceType === 'webinar') {
          params.webinar_id = this.webinarOrSubjectId;
        } else if (this.interfaceType === 'subject') {
          params.subject_id = this.webinarOrSubjectId;
        }
        return params;
      },
      // 解析图片地址
      handlerImageInfo(url) {
        let obj = parseImgOssQueryString(url);
        this.imageCropperMode = Number(obj.mode);
        console.log(this.imageCropperMode, '???mode');
      },
      //打开模态窗
      async openModal(webinarId = null) {
        this.isResetForm = false;
        this.isResetFormVerify = false;
        if (webinarId) {
          // 专题下 点击活动，若有专题报名表单，传递活动ID给本函数。之后本页面中逻辑执行：后端通过活动ID获取是专题报名表单内容 还是 活动的报名表单内容
          this.webinarOrSubjectId = webinarId;
          this.isSubject = true;
        } else {
          this.isSubject = false;
          this.initViewData();
          await this.getWebinarInfo(); // 活动下调用活动类型接口
        }
        this.visible = true;
        this.getBaseInfo();
        this.getQuestionList();
      },
      //独立报名表单的初始化逻辑
      async init() {
        //因为是独立页面，活动id/专题id只能从路由取
        this.webinarOrSubjectId =
          this.$route.params.id || this.$route.params.str || this.$route.params.il_id;
        if (this.interfaceType === 'subject') {
          // 专题-默认 活动报名在前
          this.isSubscribe = 1;
          this.activeTab = 1;
          if (this.subjectServer) {
            // 初始化专题
            this.initSubjectAuth();
          } else {
            console.log('没有专题subjectServer');
          }
        } else {
          await this.getWebinarInfo();
        }
        this.getBaseInfo();
        this.getQuestionList();
      },
      // 初始化专题信息，获取专题访客ID
      async initSubjectAuth() {
        const visitorId = localStorage.getItem('visitorId');
        let params = {
          subject_id: this.webinarOrSubjectId,
          visitor_id: !['', null, void 0].includes(visitorId) ? visitorId : undefined,
          ...this.$route.query
        };
        // 如果已经鉴权过，就直接进入观看端，否则走鉴权
        await this.subjectServer.initSubjectInfo(params);
      },
      // 获取活动信息
      getWebinarInfo() {
        return this.roomBaseServer
          .getWebinarInfo({
            webinar_id: this.webinarOrSubjectId,
            is_no_check: 1
          })
          .then(res => {
            // /v3/webinars/webinar/info 接口判断 res.data.webinar_state:  2 预告 1 直播 3 结束 5 回放 4 点播
            // webinar_type: 1.音频 2 视频 3 互动  5 定时直播
            this.isSubscribe = res.data.webinar_state == 2 ? 1 : 2;
            this.activeTab = res.data.webinar_state == 2 ? 1 : 2;
          })
          .catch(error => {
            if (error.code == 512503 || error.code == 512502) {
              // 老活动没有test4环境，无论哪个测试环境一律跳到t-webinar.e.vhall.com环境
              let origin =
                process.env.NODE_ENV === 'production'
                  ? window.location.origin
                  : 'https://t-webinar.e.vhall.com';
              window.location.href = `${origin}/${this.webinarOrSubjectId}`;
            }
          });
      },
      initViewData() {
        const { watchInitData = {} } = this.roomBaseServer.state;
        const { webinar = {} } = watchInitData;
        // 活动id
        this.webinarOrSubjectId = webinar.id || '';
      },
      // 手机号验证
      validPhone(rule, value, callback) {
        const reg = /^1[3|4|5|6|7|8|9]\d{9}$/;
        if (!value) {
          this.activeTab == 2 ? (this.isValidPhoneVerify = false) : (this.isValidPhone = false);
          return callback ? callback(new Error(this.$t('account.account_1025'))) : false;
        } else if (!reg.test(value)) {
          this.activeTab == 2 ? (this.isValidPhoneVerify = false) : (this.isValidPhone = false);
          return callback ? callback(new Error(this.$t('account.account_1069'))) : false;
        } else {
          this.activeTab == 2 ? (this.isValidPhoneVerify = true) : (this.isValidPhone = true);
          if (callback) {
            callback();
          } else {
            return true;
          }
        }
      },
      // 校验国外手机号
      checkAbroadPhone(rule, value, callback) {
        let reg = /^\d{1,15}$/;
        if (!value) {
          return callback(this.$t('account.account_1025'));
        } else if (value == 0 || !reg.test(value)) {
          return callback(this.$t('account.account_1069'));
        } else {
          callback();
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
      //邮件验证
      validEmail(rule, value, callback) {
        const reg = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/;
        if (!value && rule.required) {
          return callback ? callback(new Error(this.$t('form.form_1007'))) : false;
        } else if (value.length > 80) {
          return callback ? callback(new Error(this.$t('form.form_1009'))) : false;
        } else if (value && !reg.test(value)) {
          return callback ? callback(new Error(this.$t('form.form_1010'))) : false;
        } else {
          if (callback) {
            callback();
          } else {
            return true;
          }
        }
      },
      //校验验证码
      validCode(rule, value, callback) {
        console.log(rule, value, callback);
        if (this.isVerifyCodeErr) {
          return callback ? callback(new Error(this.$t('511057'))) : false;
        } else {
          callback();
        }
      },
      //地域验证
      validRegional(rule, value, callback) {
        console.log(rule, value, callback);
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
      //初始化活动信息
      getBaseInfo() {
        this.ajaxInfoEnd = false;
        this.signUpFormServer
          .getFormBaseInfo(this.setParamsIdByRoute({}))
          .then(res => {
            this.ajaxInfoEnd = true;
            const { code = '', data = {} } = res || {};
            if ([200, '200'].includes(code)) {
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
              this.formInfo = data;
              this.$nextTick(() => {
                this.calculateText();
              });
            } else {
              this.$message.error(this.$t('form.form_1031'));
            }
          })
          .catch(e => {
            this.ajaxInfoEnd = true;
          });
      },
      //计算简介是否太长
      calculateText() {
        const txtDom = this.$refs.intro;
        if (!txtDom) {
          return;
        }
        const twoHeight = 40;
        const curHeight = txtDom.offsetHeight;
        if (curHeight > twoHeight) {
          this.showToggle = true;
        }
      },
      //初始化表单问题信息
      getQuestionList() {
        const _this = this;
        this.ajaxListEnd = false;
        this.signUpFormServer
          .getQuestionsList(this.setParamsIdByRoute({}))
          .then(res => {
            this.ajaxListEnd = true;
            // 按照 order_num 从小到大排序
            const list = res.data.ques_list.sort(this.compare('order_num'));
            !this.isPreview && res.data.phone && (this.currentPhone = Number(res.data.phone));
            // 手机号验证开启状态
            const phoneItem = list.find(item => item.type == 0 && item.default_type == 2);
            this.isPhoneValidate =
              phoneItem.options && JSON.parse(phoneItem.options).open_verify == 1;
            // 是否支持国外手机号
            this.isAbroadPhoneValide =
              phoneItem.options && JSON.parse(phoneItem.options).support_foreign_phone == 1;
            // 默认填写手机号
            !this.isPreview && res.data.phone && (this.verifyForm.phone = Number(res.data.phone));
            if (!_this.isPreview) {
              _this.$refs.verifyForm.validateField('phone', err => {
                console.log('触发Verify....');
                if (!err) {
                  _this.isValidPhoneVerify = true;
                } else {
                  _this.isValidPhoneVerify = false;
                }
              });
            }
            // 数据获取完成后，先清空错误提示。
            this.$refs.verifyForm && this.$refs.verifyForm.clearValidate();
            this.list = list;
            //地域 options 格式化处理
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
              console.log(this.privacy, 'this.privacy');
              this.privacy && this.privacyFormatter();
            }
            list.some(item => item.type === 5) && this.getAreaList();

            // 数据获取完成后，先清空错误提示。
            this.$refs.form && this.$refs.form.clearValidate();
            this.$nextTick(() => {
              this.list.forEach(item => {
                // 初始化的时候，清空单选题验证
                this.$refs[`formItem_${item.id}`] &&
                  this.$refs[`formItem_${item.id}`][0] &&
                  this.$refs[`formItem_${item.id}`][0].clearValidate();
              });
            });
          })
          .catch(error => {
            this.ajaxListEnd = true;
            console.log(error);
          });
      },
      //生成表单提交参数
      generateFormParams() {
        const answer = {};
        (this.list || []).forEach(item => {
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
            const provinec = (this.provinces &&
              this.provinces.find(ele => ele.value == this.province)) || {
              label: '',
              value: ''
            };
            const city = (this.cityList && this.cityList.find(ele => ele.value == this.city)) || {
              label: '',
              value: ''
            };
            const county = (this.countyList &&
              this.countyList.find(ele => ele.value == this.form[item.id])) || {
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
        return answer;
      },
      //获取区域列表
      getAreaList() {
        this.signUpFormServer
          .getAreaList()
          .then(res => {
            this.provinces = res.provinces;
            this.cities = res.cities;
            this.counties = res.counties;
          })
          .catch(error => {
            console.log(error);
          });
      },
      //切换tab
      switchTab(type) {
        if (type === this.activeTab) {
          return;
        }
        this.activeTab = type;
        if (this.activeTab == 2) {
          if (this.verifyTime == 60 && !this.mobileKeyVerify) {
            //重置下云盾
            this.showCaptchaVerify = false;
            this.mobileKeyVerify = '';
            if (this.isPhoneValidate) {
              this.callCaptcha('#setCaptcha1');
            }
          }
        } else {
          if (this.time == 60 && !this.mobileKey) {
            //重置下云盾
            this.showCaptcha = false;
            this.mobileKey = '';
            if (this.isPhoneValidate) {
              this.callCaptcha('#setCaptcha1');
            }
          }
        }
      },
      //关闭模态窗
      handleClose() {
        this.resetSignUpForm();
        this.visible = false;
      },
      resetSignUpForm() {
        // 重置地区选择
        this.province = '';
        this.city = '';
        this.county = '';
        // 重置表单验证 & 图形码
        if (this.$refs.form) {
          this.$refs.form.resetFields();
          this.$refs.form.clearValidate();
          this.resetCaptcha('time');
        }
        if (this.$refs.verifyForm) {
          this.$refs.verifyForm.resetFields();
          this.$refs.verifyForm.clearValidate();
          this.resetCaptcha('verifyTime');
        }
      },
      // 停止计时器
      stopTime(timeKey) {
        this[timeKey] = 60;
      },
      // 重置图形验证码
      resetCaptcha(timeKey) {
        if (timeKey == 'verifyTime') {
          this.isResetFormVerify = true;
        } else {
          this.isResetForm = true;
        }
        this[timeKey] = 60;
        this.showCaptcha = false;
        this.showCaptchaVerify = false;
        this.mobileKey = '';
        this.mobileKeyVerify = '';
        if (this.isPhoneValidate) {
          this.$refs.form && this.callCaptcha('#setCaptcha');
          this.$refs.verifyForm && this.callCaptcha('#setCaptcha1');
        }
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
            isPhoneValid = !err;
          });
        } else {
          phone = this.verifyForm.phone;
          this.$refs.verifyForm.validateField('phone', err => {
            console.log('验证当前表单...', err);
            isPhoneValid = !err;
          });
        }
        if (!isPhoneValid) {
          return false;
        } else {
          // 验证通过，重置计时器状态，让其可以执行倒计时
          isForm ? (this.isResetForm = false) : (this.isResetFormVerify = false);
        }

        //获取短信验证码
        let params = {
          ...this.setParamsIdByRoute({}),
          phone: phone
        };
        if (isForm && this.mobileKey) {
          // 用户报名，验证码
          params.captcha = this.mobileKey;
        } else if (!isForm && this.mobileKeyVerify) {
          // 我已报名，验证码
          params.captcha = this.mobileKeyVerify;
        } else {
          // 不符合条件，中断流程
          return;
        }
        this.signUpFormServer.sendVerifyCode(params).then(() => {
          this.countDown(isForm);
        });
      },
      //多语言翻译
      convertLanguage(title, vo) {
        if (
          (vo.default_type == 0 && [1, 4, 5, 2, 3].includes(vo.type)) ||
          (vo.type == 0 && [1, 4, 3, 2].includes(vo.default_type))
        ) {
          // 地域 & 公司 & 职务 +  姓名 & 性别 & 邮箱 翻译标题
          return this.langDefaultZH.indexOf(title) > -1
            ? this.$t(this.langDefaultCode[this.langDefaultZH.indexOf(title)])
            : title;
        } else {
          // 不翻译
          return title;
        }
      },
      // 倒计时函数
      countDown(isForm) {
        const key = isForm ? 'time' : 'verifyTime';
        if (
          (this.isResetForm && key == 'time') ||
          (this.isResetFormVerify && key == 'verifyTime')
        ) {
          // 中断之前计时器，重置发送验证码按钮
          this[key] = 60;
          return;
        }
        if (this[key]) {
          this[key]--;
          setTimeout(() => {
            console.log(`${key}自己调用自己...`);
            this.countDown(isForm);
          }, 1000);
        } else {
          this[key] = 60;
          if (isForm) {
            this.showCaptcha = false;
            this.mobileKey = '';
            this.callCaptcha('#setCaptcha');
          } else {
            this.showCaptchaVerify = false;
            this.mobileKeyVerify = '';
            this.callCaptcha('#setCaptcha1');
          }
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
          captchaId: that.captchaKey,
          element: id,
          lang:
            this.interfaceType === 'subject' ||
            window.location.href.indexOf('/special/detail') != -1
              ? 'zh-CN'
              : (localStorage.getItem('lang') == '1' ? 'zh-CN' : 'en') || 'zh-CN',
          mode: 'float',
          onReady() {},
          onVerify(err, data) {
            if (data) {
              if (captcha === 'captcha1') {
                // 用户报名
                that.mobileKey = data.validate;
                that.showCaptcha = true;
              } else if (captcha === 'captcha2') {
                // 我已报名
                that.mobileKeyVerify = data.validate;
                that.showCaptchaVerify = true;
              }
              that.errorMsgShow = '';
            } else {
              that[captcha] = '';
              that.errorMsgShow = true;
            }
          },
          onload(instance) {
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
      //提交报名表单
      submitForm: debounce(function () {
        this.reportForWatch();
        this.$refs.form.validate((valid, object) => {
          console.log(object);
          if (valid) {
            let form = this.generateFormParams();
            let params = {
              ...this.setParamsIdByRoute({}),
              form: JSON.stringify(form)
            };
            this.isPhoneValidate && (params.verify_code = this.form.code);
            if (this.isEmbed) {
              params = {
                ...params,
                ...this.$route.query
              };
            } else {
              this.$route.query.refer && (params.refer = this.$route.query.refer);
            }
            const visitorId = localStorage.getItem('visitorId');
            if (visitorId) {
              params.visit_id = visitorId;
            }
            this.signUpFormServer.submitSignUpForm(params).then(res => {
              if (res.code == 200) {
                res.data.visit_id && localStorage.setItem('visitorId', res.data.visit_id);
                if (this.isSubject) {
                  // 若是从专题点击，触发的报名表单弹窗，提交答案后（报名 或者 我已报名，通知专题页修改状态）
                  window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitChangePass'));
                }
                // 报名成功的操作，跳转到直播间
                if (this.interfaceType === 'subject') {
                  // 情况一：独立报名表单
                  this.goToSubjectDetailOrReload('submit');
                } else {
                  // 情况二：专题下 or 活动下点击报名表单，判断当前直播状态，进行相应的跳转
                  this.getWebinarStatus(true);
                }
              } else if (res.code == 512809 || res.code == 512570) {
                // 短信验证码验证失败，触发表单验证失败
                // 现在的表单验证码逻辑完全由后端返回结果决定，前端不验证格式
                this.isVerifyCodeErr = true;
                this.$refs.form.validateField('code', res => {
                  console.log(res);
                  // 还原状态
                  this.isVerifyCodeErr = false;
                });
              } else if (res.code == 512814 || res.code == 512815) {
                // 报名成功的操作，跳转到直播间
                this.closePreview();
                // 判断当前直播状态，进行相应的跳转
                this.$message.success(this.$t('form.form_1033'));
                if (this.isSubject) {
                  // 若是从专题点击，触发的报名表单弹窗，提交答案后（报名 或者 我已报名，通知专题页修改状态）
                  window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitChangePass'));
                }
                if (this.interfaceType === 'subject') {
                  this.goToSubjectDetailOrReload();
                } else {
                  // 判断当前直播状态，进行相应的跳转
                  this.getWebinarStatus();
                }
              } else {
                this.$message.error(this.$tec(res.code) || res.msg);
              }
            });
          } else {
            return false;
          }
        });
      }, 1000),
      // 我已报名--验证
      submitVerify: debounce(function () {
        if (!this.form[this.privacy.id] && this.privacy && this.privacy.is_must) {
          this.$message.warning(this.$t('form.form_1030'));
          return;
        }
        this.$refs.verifyForm.validate(valid => {
          if (valid) {
            const params = {
              ...this.setParamsIdByRoute({}),
              phone: this.verifyForm.phone,
              verify_code: this.verifyForm.code,
              ...this.$route.query
            };
            const visitorId = localStorage.getItem('visitorId');
            if (visitorId) {
              params.visit_id = visitorId;
            }
            this.signUpFormServer.checkIsRegistered(params).then(res => {
              if (res.code == 200) {
                // 如果已经报名
                if (res.data.has_registed == 1) {
                  // 已报名，跳转到直播间
                  this.closePreview();
                  // sessionStorage.setItem('visitor_id', res.data.visit_id);
                  localStorage.setItem('visitorId', res.data.visit_id);
                  this.$message.success(this.$t('form.form_1033'));
                  if (this.isSubject) {
                    // 若是从专题点击，触发的报名表单弹窗，提交答案后（报名 或者 我已报名，通知专题页修改状态）
                    window.$middleEventSdk?.event?.send(
                      boxEventOpitons(this.cuid, 'emitChangePass')
                    );
                  }
                  if (this.interfaceType === 'subject') {
                    this.goToSubjectDetailOrReload();
                  } else {
                    // 判断当前直播状态，进行相应的跳转
                    this.getWebinarStatus();
                  }
                } else {
                  this.$message.warning(this.$t('form.form_1034'));
                  this.activeTab = 1;
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
                this.$message.error(this.$tec(res.code) || res.msg);
              }
            });
          } else {
            return false;
          }
        });
      }, 1000),
      // 获取当前活动状态，如果直播中，跳转到直播间
      getWebinarStatus(isSubmitForm) {
        // 当前是正常活动点开
        this.roomBaseServer
          .getWebinarInfo({
            webinar_id: this.webinarOrSubjectId,
            is_no_check: 1
          })
          .then(res => {
            if (this.isSubject) {
              // 当前是点击专题下的活动进入的时候，直接跳转/lives/watch（由该页面自行判断页面跳转)
              const queryString = this.$route.query.refer
                ? `?refer=${this.$route.query.refer}`
                : '';
              const href =
                window.location.origin +
                process.env.VUE_APP_WEB_KEY +
                `/lives/watch/${this.webinarOrSubjectId}${queryString}`;
              // init接口中 webinar.type: 1-直播中，2-预约，3-结束，4-点播，5-回放
              if (res.data.webinar_state == 2 && isSubmitForm) {
                // 如果是预约状态，显示开播时间提醒
                this.$alert(
                  this.$t('form.form_1032', { n: res.data.start_time.substring(0, 16) }),
                  this.$t('account.account_1061'),
                  {
                    confirmButtonText: this.$t('common.common_1033'),
                    customClass: 'zdy-alert-box',
                    callback: action => {
                      console.log(action);
                      this.closePreview();
                      window.open(href, '_blank');
                    }
                  }
                );
              } else {
                this.closePreview();
                window.open(href, '_blank');
              }
            } else {
              // /v3/webinars/webinar/info 接口判断 res.data.webinar_state:  2 预告 1 直播 3 结束 5 回放 4 点播
              // webinar_type: 1.音频 2 视频 3 互动  5 定时直播
              if (res.code == 512503 || res.code == 512502) {
                // 跳转老活动
                window.location.href = `${window.location.origin}/${this.webinarOrSubjectId}`;
                return false;
              }
              // 如果是独立链接，判断状态进行跳转
              if (this.isEntryForm) {
                this.gotoWebinarPage(res, isSubmitForm);
              } else {
                // init接口中 webinar.type: 1-直播中，2-预约，3-结束，4-点播，5-回放
                if (res.data.webinar_state == 2 && isSubmitForm) {
                  // 如果是预约状态，显示开播时间提醒
                  this.$alert(
                    this.$t('form.form_1032', { n: res.data.start_time.substring(0, 16) }),
                    this.$t('account.account_1061'),
                    {
                      confirmButtonText: this.$t('common.common_1033'),
                      customClass: 'zdy-alert-box',
                      callback: action => {
                        console.log(action);
                        this.closePreview();
                        location.reload();
                      }
                    }
                  );
                } else {
                  this.closePreview();
                  location.reload();
                }
              }
            }
          });
      },
      // 跳转活动页
      gotoWebinarPage(res, isSubmitForm) {
        const queryString = this.$route.query.refer ? `?refer=${this.$route.query.refer}` : '';
        if (res.data.status == 'live') {
          window.location.href =
            window.location.origin +
            process.env.VUE_APP_WEB_KEY +
            `/lives/watch/${this.webinarOrSubjectId}${window.location.search}`;
        } else {
          // 如果预约或结束，跳转到预约页
          if (res.data.webinar_state == 2 && isSubmitForm) {
            // 如果是预约状态，显示开播时间提醒
            this.$alert(
              this.$t('form.form_1032', { n: res.data.start_time.substring(0, 16) }),
              this.$t('account.account_1061'),
              {
                confirmButtonText: this.$t('common.common_1033'),
                customClass: 'zdy-alert-box',
                callback: action => {
                  console.log(action);
                  this.closePreview();
                  window.location.href =
                    window.location.origin +
                    process.env.VUE_APP_WEB_KEY +
                    `/lives/subscribe/${this.webinarOrSubjectId}${window.location.search}`;
                }
              }
            );
          } else {
            window.location.href =
              window.location.origin +
              process.env.VUE_APP_WEB_KEY +
              `/lives/subscribe/${this.webinarOrSubjectId}${window.location.search}`;
          }
        }
      },
      // 提交报名表单结束，跳转专题详情页（独立报名表单），或者刷新（专题详情页弹出报名表单）
      async goToSubjectDetailOrReload(type) {
        // 如果是独立链接，判断状态进行跳转
        if (this.isEntryForm) {
          window.location.href =
            window.location.origin +
            process.env.VUE_APP_WEB_KEY +
            `/special/detail?id=${this.webinarOrSubjectId}&refer=${
              this.$route.query.refer ? this.$route.query.refer : ''
            }`;
        } else {
          this.closePreview();
          //验证成功,刷新页面
          window.location.href =
            window.location.origin +
            process.env.VUE_APP_WEB_KEY +
            `/lives/subscribe/${this.webinarOrSubjectId}`;
        }
      },
      //关闭当前视图
      closePreview() {
        this.handleClose();
      },
      // 校验非0开头11位数字
      checkNum(rule, val, callback) {
        if (!val) {
          return callback(this.$t('account.account_1025'));
        } else if (!/^[1-9]\d{10}$/.test(val)) {
          return callback(this.$t('account.account_1069'));
        } else {
          return callback();
        }
      },
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
            address.province = this.province || '';
            address.city = this.city || '';
            address.county = this.city || '';
            params.address = address;
            paramMap.delete('address');
          }
          // 3. 是否有手机, 组织数据
          if (paramMap.has('phone_number')) {
            const id = paramMap.get('phone_number');
            params.phone_number = this.form[`${id}`];
            paramMap.delete('phone_number');
          }
          // 其余key值组织参数
          paramMap.forEach((item, key) => {
            const value = this.form[`${item}`];
            const param = value ? encodeURIComponent(value) : '';
            params[key] = param;
          });
          window.vhallReportForWatch?.report(170018, params);
        } catch (e) {
          console.warn('报名表单:', e);
        }
      }
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
    .el-button.el-button--primary {
      background-color: var(--theme-color);
      border: 1px solid var(--theme-color);
      &:hover {
        background-color: var(--theme-color);
        border: 1px solid var(--theme-color);
      }
    }
    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .privacy-checkbox {
      .el-checkbox__label {
        padding-left: 22px;
      }
      .el-checkbox__input {
        position: absolute;
        top: 2px;
      }
    }
    .el-dialog {
      margin-top: 0 !important;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      overflow: hidden;
    }
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
      z-index: 10;
      .el-dialog__close {
        color: #fff;
      }
    }
    /** 全局重置的未起作用,这里在组件里调整下 */
    .el-form-item.is-success .el-input__inner,
    .el-form-item.is-success .el-input__inner:focus,
    .el-form-item.is-success .el-textarea__inner,
    .el-form-item.is-success .el-textarea__inner:focus {
      border-color: #ccc;
    }
    .el-select .el-input.is-focus .el-input__inner {
      border-color: #999;
    }
    .el-checkbox__input.is-checked + .el-checkbox__label {
      color: #666;
    }
    .el-dialog__body {
      padding: 0;
    }
    .el-radio {
      white-space: normal;
      font-weight: normal;
      display: flex;
      align-items: center;
      .el-radio__label {
        line-height: 19px;
      }
    }
    .el-checkbox {
      white-space: normal;
      font-weight: normal;
      display: flex;
      align-items: center;
    }
    &__banner {
      width: 100%;
      height: 120px;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      .form_img {
        width: 100%;
        height: 100%;
        object-fit: fill;
        &.form_bg_2 {
          object-fit: cover;
          object-position: left top;
        }
        &.form_bg_3 {
          object-fit: contain;
          object-position: center;
        }
      }
    }
    &__content {
      padding: 0 75px 87px;
      max-height: 58vh;
      overflow-y: auto;
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
        right: 0;
        cursor: pointer;
        background-color: #fff;
        color: #3562fa;
        .isEllipsis {
          color: #666;
        }
      }
    }
    &__introduction-fold {
      white-space: nowrap;
      word-break: break-all;
      text-overflow: ellipsis;
      display: -webkit-box;
      /* autoprefixer: ignore next */
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }
    &__introduction-padding {
      padding-bottom: 20px;
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
        color: var(--theme-component-sign-up-tab-font);
        background-color: var(--theme-component-sign-up-tab-bg);
        &:nth-child(1) {
          border-right: 0 none;
          border-radius: 4px 0 0 4px;
        }
        &:nth-child(2) {
          border-left: 0 none;
          border-radius: 0 4px 4px 0;
        }
        &.active {
          border: 1px solid var(--theme-color);
          background: var(--theme-color-sub);
          color: var(--theme-color);
          width: calc(50% - 2px);
        }
      }
      // &.red1 {
      //   .active {
      //     border: 1px solid @red;
      //     background: @redBg;
      //     color: @red;
      //   }
      // }
      // &.blue1 {
      //   .active {
      //     border: 1px solid @blue;
      //     background: @blueBg;
      //     color: @blue;
      //   }
      // }
      // &.purple1 {
      //   .active {
      //     border: 1px solid @purple;
      //     background: @purpleBg;
      //     color: @purple;
      //   }
      // }
    }
    &__main-form {
      .el-radio-group {
        width: 100%;
        padding-left: 0;
        > div {
          padding-bottom: 10px;
          &:last-child {
            padding-bottom: 0;
          }
        }
      }
      .el-checkbox-group {
        width: 100%;
        padding-left: 0;
        > div {
          padding-bottom: 10px;
          &:last-child {
            padding-bottom: 0;
          }
        }
      }
      .el-input__inner[maxlength='50'] {
        padding-right: 60px !important;
      }
      .el-input__inner[maxlength='60'] {
        padding-right: 60px !important;
      }
      .el-form-item__error {
        color: #fb3a32;
      }
    }
    &__verify-form {
      .el-form-item__error {
        color: #fb3a32;
      }
    }
    .verify-code-box {
      .no-border {
        background: #dedede;
        color: #666;
        cursor: not-allowed;
        &.is-disabled:hover {
          background: #dedede;
          color: #666;
          cursor: not-allowed;
        }
        &:hover {
          border: 0;
        }
        &:focus {
          border: 0;
        }
      }
      .isLoginActive {
        background-color: var(--theme-color);
        color: #fff;
        cursor: pointer;
        &.is-disabled:hover {
          background-color: var(--theme-color);
          color: #fff;
          cursor: not-allowed;
        }
      }
      // 云盾样式重置,注释部分为设计稿样式，暂时不删除，有备无患
      .captcha {
        ::v-deep .yidun_tips {
          color: #999 !important;
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
      .el-form-item__error {
        left: 50%;
        padding-left: 10px;
        color: #fb3a32;
      }
    }
    .btn-box {
      text-align: center;
    }
  }
  .vmp-sign-up-form--entry-from {
    position: fixed;
    top: 0;
    width: 100%;
    height: 100%;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.8);
    z-index: 101;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #1a1a1a;
    .vmp-sign-up-form__wrap {
      overflow-y: hidden;
      height: 85%;
      border-radius: 4px;
      background: #fff;
      position: relative;
      z-index: 101;
      max-width: 720px;
      margin: 0 auto;
      // padding-bottom: 87px;
    }
  }
  .vmp-sign-up-form__entry-form-select {
    max-width: 564px;
  }
  .entryForm {
    .el-form-item__label {
      pre {
        display: inline;
        white-space: pre-wrap;
        word-wrap: break-word;
      }
    }
  }
</style>
