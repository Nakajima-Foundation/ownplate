import { App } from 'vue';
import OButton from '@/components/oruga/OButton.vue';
import OCheckbox from '@/components/oruga/OCheckbox.vue';
import OInput from '@/components/oruga/OInput.vue';
import OSelect from '@/components/oruga/OSelect.vue';
import ORadio from '@/components/oruga/ORadio.vue';
import OIcon from '@/components/oruga/OIcon.vue';
import OLoading from '@/components/oruga/OLoading.vue';
import OModal from '@/components/oruga/OModal.vue';
import OSidebar from '@/components/oruga/OSidebar.vue';
import OField from '@/components/oruga/OField.vue';
import ODatepicker from '@/components/oruga/ODatepicker.vue';
import ODatetimepicker from '@/components/oruga/ODatetimepicker.vue';

export default {
  install(app: App) {
    app.component('o-button', OButton);
    app.component('o-checkbox', OCheckbox);
    app.component('o-input', OInput);
    app.component('o-select', OSelect);
    app.component('o-radio', ORadio);
    app.component('o-icon', OIcon);
    app.component('o-loading', OLoading);
    app.component('o-modal', OModal);
    app.component('o-sidebar', OSidebar);
    app.component('o-field', OField);
    app.component('o-datepicker', ODatepicker);
    app.component('o-datetimepicker', ODatetimepicker);
  },
};
