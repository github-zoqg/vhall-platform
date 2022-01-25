import Alert from './src/alert.vue';
import Dialog from './src/dialog.vue';

const VmpAlert = {
  install(Vue) {
    Vue.Component(Alert.name, Alert);
    Vue.Component(Dialog.name, Dialog);
  }
};

export default VmpAlert;
