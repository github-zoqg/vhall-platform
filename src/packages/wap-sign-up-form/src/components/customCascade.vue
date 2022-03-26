<template>
  <div class="vmp-custom-select-picker">
    <div class="select-xl">
      <input
        v-model="resultLabel"
        v-bind="$attrs"
        :placeholder="placeholder"
        @focus="handleFocus"
        readonly
        is-link
        @click="togglePopup"
      />
      <label class="select-arrow"></label>
    </div>
    <van-popup v-model="show" position="bottom">
      <van-cascader
        v-bind="$attrs"
        :title="placeholder"
        :options="options"
        @close="show = false"
        v-model="currentSelect"
        active-color="#0A7FF5"
        :field-names="{ text: 'label' }"
        @finish="onConfirm"
      />
    </van-popup>
  </div>
</template>

<script>
  export default {
    name: 'customCascade',
    model: {
      prop: 'selectValue'
    },
    props: {
      //选项数据
      options: {
        type: Array,
        default: function () {
          return [];
        }
      },
      //选中的值
      selectValue: {
        type: [Array, String, Number],
        default: ''
      },
      //自定义的取值key
      option: {
        type: Object,
        default: function () {
          return { label: 'label', value: 'value' };
        }
      },
      //默认的提示文字
      placeholder: {
        type: String,
        default: ''
      }
    },
    computed: {
      resultLabel: {
        //双向绑定的数据做修改需要用get/set
        get() {
          return Array.isArray(this.resultValue) && this.resultValue.length
            ? this.resultValue.map(option => option.label).join('/')
            : '';
        },
        set() {}
      }
    },
    watch: {
      //监听变化初始赋值
      selectValue: function (newVal) {
        this.resultValue = newVal;
      },
      //当所选数据变化，组件model的双向绑定
      resultValue(val) {
        this.$emit('input', val);
      }
    },
    data() {
      return {
        //Popup是否弹出
        show: false,
        //初始选中数据
        resultValue: this.selectValue,
        //当前的级联选择器选中的值
        currentSelect: ''
      };
    },
    mounted() {
      window.test = this;
    },
    methods: {
      //打开/关闭弹出窗
      togglePopup() {
        this.show = !this.show;
        console.log(this.selectValue);
      },
      //阻止输入框聚焦唤起自带的输入框
      handleFocus() {
        document.activeElement.blur();
      },
      //确认选择
      onConfirm({ selectedOptions }) {
        this.resultValue = selectedOptions;
        this.$emit('input', this.resultValue);
        this.$emit('change', this.resultValue);
        this.show = !this.show;
      },
      //当数据改变
      change(val, index) {
        console.log(val, index, '当前选中待确认的选项');
        // this.$emit('change', val, index, this.resultValue);
      },
      //取消选择
      cancel(val, index) {
        //取消
        this.show = !this.show;
        this.$emit('cancel', val, index, this.resultValue);
      }
    }
  };
</script>

<style lang="less">
  .vmp-custom-select-picker {
  }
</style>
