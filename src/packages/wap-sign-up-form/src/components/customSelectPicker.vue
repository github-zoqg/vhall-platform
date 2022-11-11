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
      <van-picker
        v-bind="$attrs"
        :columns="columns"
        :title="placeholder"
        show-toolbar
        @cancel="cancel"
        @confirm="onConfirm"
        @change="change"
        :value-key="this.option.label"
      >
        <template #option="item">
          <pre>{{ item.subject }}</pre>
        </template>
      </van-picker>
    </van-popup>
  </div>
</template>

<script>
  export default {
    name: 'customSelectPicker',
    model: {
      prop: 'selectValue'
    },
    props: {
      //选项数据
      columns: {
        type: Array,
        default: function () {
          return [];
        }
      },
      //选中的值
      selectValue: {
        type: [String, Number],
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
          const res = this.columns.filter(item => {
            return item[this.option.value] === this.resultValue;
          });
          return res.length ? res[0][this.option.label] : '';
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
        resultValue: this.selectValue
      };
    },
    methods: {
      //打开/关闭弹出窗
      togglePopup() {
        this.show = !this.show;
      },
      //阻止输入框聚焦唤起自带的输入框
      handleFocus() {
        document.activeElement.blur();
      },
      //确认选择
      onConfirm(value, index) {
        this.resultValue = value[this.option.value];
        this.$emit('input', this.resultValue);
        this.show = !this.show;
        this.$emit('change', value, index, this.resultValue);
      },
      //当数据改变
      change(val, index) {
        console.log(val, index, '当前选中待确认的选项');
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
