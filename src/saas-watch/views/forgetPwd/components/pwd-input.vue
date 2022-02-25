<template>
  <div
    :class="[
      type === 'textarea' ? 'el-textarea' : 'el-input',
      inputSize ? 'el-input--' + inputSize : '',
      {
        'is-disabled': inputDisabled,
        'is-exceed': inputExceed,
        'el-input-group': $slots.prepend || $slots.append,
        'el-input-group--append': $slots.append,
        'el-input-group--prepend': $slots.prepend,
        'el-input--prefix': $slots.prefix || prefixIcon,
        'el-input--suffix': $slots.suffix || suffixIcon || clearable || showPassword
      }
    ]"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
  >
    <template v-if="type !== 'textarea'">
      <!-- 前置元素 -->
      <div v-if="$slots.prepend" class="el-input-group__prepend">
        <slot name="prepend"></slot>
      </div>
      <input
        v-if="type !== 'textarea'"
        ref="input"
        v-bind="$attrs"
        :tabindex="tabindex"
        class="el-input__inner"
        :disabled="inputDisabled"
        :readonly="readonly"
        :autocomplete="autoComplete || autocomplete"
        :aria-label="label"
        :style="textStyle"
        @compositionstart="handleCompositionStart"
        @compositionend="handleCompositionEnd"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @change="handleChange"
      />
      <!-- 前置内容 -->
      <span v-if="$slots.prefix || prefixIcon" class="el-input__prefix">
        <slot name="prefix"></slot>
        <i v-if="prefixIcon" class="el-input__icon" :class="prefixIcon"></i>
      </span>
      <!-- 后置内容 -->
      <span v-if="getSuffixVisible()" class="el-input__suffix">
        <span class="el-input__suffix-inner">
          <i
            v-if="showClear"
            class="el-input__icon el-icon-circle-close el-input__clear"
            @mousedown.prevent
            @click="clear"
          ></i>
          <i
            v-if="showPwdVisible"
            class="el-input__icon el-icon-view el-input__clear"
            @click="handlePasswordVisible"
          ></i>
          <template v-if="!showClear || !showPwdVisible || !isWordLimitVisible">
            <slot name="suffix"></slot>
            <i v-if="suffixIcon" class="el-input__icon" :class="suffixIcon"></i>
          </template>
          <span v-if="isWordLimitVisible" ref="limit_count" class="el-input__count">
            <span class="el-input__count-inner">
              <span
                :class="[
                  'el-input__count-inner__numerator',
                  `${value}`.length && `${value}`.length != $attrs.maxlength
                    ? 'el-input__count-inner__numerator-hasnum'
                    : '',
                  `${value}`.length && `${value}`.length == $attrs.maxlength
                    ? 'el-input__count-inner__numerator-maxnum'
                    : ''
                ]"
              >
                {{ textLength }}
              </span>
              <span class="el-input__count-inner__denominator">
                <span ref="separator">/</span>
                <span ref="limit_total">{{ upperLimit }}</span>
              </span>
            </span>
          </span>
        </span>
        <i
          v-if="validateState"
          class="el-input__icon"
          :class="['el-input__validateIcon', validateIcon]"
        ></i>
      </span>
      <!-- 后置元素 -->
      <div v-if="$slots.append" class="el-input-group__append">
        <slot name="append"></slot>
      </div>
    </template>
  </div>
</template>
<script>
  import { Input } from 'element-ui';
  // 自定义密码输入框
  // input元素光标操作
  class CursorPosition {
    constructor(_inputEl) {
      this._inputEl = _inputEl;
    }

    // 获取光标的位置 前，后，以及中间字符
    get() {
      var rangeData = { text: '', start: 0, end: 0 };
      if (this._inputEl.setSelectionRange) {
        // W3C
        // this._inputEl.focus()
        rangeData.start = this._inputEl.selectionStart;
        rangeData.end = this._inputEl.selectionEnd;
        rangeData.text =
          rangeData.start != rangeData.end
            ? this._inputEl.value.substring(rangeData.start, rangeData.end)
            : '';
      } else if (document.selection) {
        // IE
        // this._inputEl.focus()
        var i;
        var oS = document.selection.createRange();
        var oR = document.body.createTextRange();
        oR.moveToElementText(this._inputEl);

        rangeData.text = oS.text;
        rangeData.bookmark = oS.getBookmark();
        for (
          i = 0;
          oR.compareEndPoints('StartToStart', oS) < 0 && oS.moveStart('character', -1) !== 0;
          i++
        ) {
          if (this._inputEl.value.charAt(i) == '\r') {
            i++;
          }
        }
        rangeData.start = i;
        rangeData.end = rangeData.text.length + rangeData.start;
      }
      console.log('当前光标位置', rangeData);
      return rangeData;
    }

    // 写入光标的位置
    set(rangeData) {
      var oR;
      if (!rangeData) {
        alert('You must get cursor position first.');
      }
      // this._inputEl.focus()
      if (this._inputEl.setSelectionRange) {
        // W3C
        this._inputEl.setSelectionRange(rangeData.start, rangeData.end);
      } else if (this._inputEl.createTextRange) {
        // IE
        oR = this._inputEl.createTextRange();
        if (this._inputEl.value.length === rangeData.start) {
          oR.collapse(false);
          oR.select();
        } else {
          oR.moveToBookmark(rangeData.bookmark);
          oR.select();
        }
      }
      console.log('当前光标位置', rangeData);
    }
  }
  export default {
    name: 'PwInputCp',
    extends: Input,
    props: {
      isPasswordVisible: Boolean
    },
    data() {
      return {
        symbol: '●', // 自定义的密码符号
        pwd: '', // 密码明文数据
        calcWidth: '',
        isComposing: false
      };
    },
    computed: {
      textStyle() {
        return {
          paddingRight: this.calcWidth
        };
      }
    },
    watch: {
      value() {
        this.pwd = this.value;
        !this.isPasswordVisible &&
          this.$nextTick(() => {
            this.inputDataConversion(this.pwd);
          });
      },
      isPasswordVisible(newVal) {
        if (newVal) {
          this.$refs.input.value = this.pwd;
        } else {
          this.inputDataConversion(this.pwd);
        }
      }
    },
    mounted() {
      this.$nextTick(() => {
        if (this.$refs.input) {
          this.$refs.input.blur();
        }
      });
      this.calcWidth =
        this.$refs.limit_total && this.$refs.limit_total.offsetWidth
          ? this.$refs.limit_total.offsetWidth * 2 + this.$refs.separator.offsetWidth + 15 + 'px'
          : '12px';
    },
    methods: {
      inputDataConversion(value) {
        // 输入框里的数据转换，将123转为***
        if (!value) {
          this.$refs.input.value = '';
          return;
        }
        let data = '';
        for (let i = 0; i < value.length; i++) {
          data += this.symbol;
        }
        this.$refs.input.value = data;
      },
      pwdSetData(positionIndex, value) {
        // 写入原始数据
        const _pwd = value.split(this.symbol).join('');
        if (_pwd) {
          const index = this.pwd.length - (value.length - positionIndex.end);
          this.pwd =
            this.pwd.slice(0, positionIndex.end - _pwd.length) + _pwd + this.pwd.slice(index);
        } else {
          this.pwd =
            this.pwd.slice(0, positionIndex.end) +
            this.pwd.slice(positionIndex.end + this.pwd.length - value.length);
        }
      },
      handleInput(e) {
        window.event ? (window.event.cancelBubble = true) : e.stopPropagation();
        if (e.preventDefault) {
          e.preventDefault();
        } else {
          // eslint-disable-next-line
          window.event.returnValue = false;
        }
        if (this.isComposing) return;
        const cursorPosition = new CursorPosition(this.$refs.input);
        const positionIndex = cursorPosition.get();
        let value = e.target.value; // 整个输入框的值
        e.target.value = value = this.checkValue(value);
        this.pwdSetData(positionIndex, value);
        this.inputDataConversion(value);
        // cursorPosition.set(positionIndex, this.$refs.input)
        this.$emit('input', this.pwd);
      },
      checkValue(str) {
        let temp = '';
        for (let i = 0; i < str.length; i++) {
          if (str.charCodeAt(i) > 0 && str.charCodeAt(i) < 255) {
            temp += str.charAt(i);
          }
        }
        return temp;
      },
      handleCompositionStart() {
        // 表示正在写
        this.isComposing = true;
      },
      handleCompositionEnd(e) {
        if (this.isComposing) {
          this.isComposing = false;
          // handleCompositionEnd比handleInput后执行，避免isComposing还为true时handleInput无法执行正确逻辑
          this.handleInput(e);
        }
      }
    }
  };
</script>
<style lang="less">
  .el-input__count-inner__numerator {
    color: #999999;
    &.el-input__count-inner__numerator-hasnum {
      color: #3562fa;
    }
    &.el-input__count-inner__numerator-maxnum {
      color: #fb3a32;
    }
  }
  .el-input__count-inner__denominator {
    color: #999999;
  }
  // 输入框样式重置
  .el-form-item.is-error .el-input__inner {
    border-color: #fb3a32;
  }
  .el-input__inner,
  .el-textarea__inner {
    border-color: #ccc;
    color: #1a1a1a;
    &:hover {
      border-color: #999;
    }
    &:focus {
      border-color: #999;
    }
    &::-webkit-input-placeholder {
      /* WebKit, Blink, Edge */
      color: #999999;
    }
    &:-moz-placeholder {
      /* Mozilla Firefox 4 to 18 */
      color: #999999;
    }
    &::-moz-placeholder {
      /* Mozilla Firefox 19+ */
      color: #999999;
    }
    &:-ms-input-placeholder {
      /* Internet Explorer 10-11 */
      color: #999999;
    }
  }
  .el-input.is-disabled .el-input__inner {
    background-color: #ffffff;
    border-color: #e6e6e6;
    color: #999999;
    cursor: not-allowed;
    &::-webkit-input-placeholder {
      /* WebKit, Blink, Edge */
      color: #b3b3b3;
    }
    &:-moz-placeholder {
      /* Mozilla Firefox 4 to 18 */
      color: #b3b3b3;
    }
    &::-moz-placeholder {
      /* Mozilla Firefox 19+ */
      color: #b3b3b3;
    }
    &:-ms-input-placeholder {
      /* Internet Explorer 10-11 */
      color: #b3b3b3;
    }
  }
</style>
