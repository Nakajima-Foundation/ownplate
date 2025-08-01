<template>
  <div>
    <div class="pb-2 text-sm font-bold">
      <span @click="open(tipsKey)" v-if="tipsKey">{{ $t(titleKey) }}</span>
      <span v-else>{{ $t(titleKey) }}</span>
      <span class="text-red-700" v-if="required === true">*</span>
    </div>
    <div class="field" :class="error.length > 0 ? 'has-error' : 'has-success'">
      <input
        :value="modelValue"
        :type="type"
        :placeholder="$t(placeholder)"
        @update:modelValue="input"
        @input="input($event.target.value)"
        :maxlength="maxlength"
        class="input border rounded px-3 py-2 w-full"
        :class="error.length > 0 ? 'border-red-500' : 'border-gray-300'"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  name: "TextForm",
  props: {
    required: {
      type: Boolean,
      required: false,
      default: () => true,
    },
    type: {
      type: String,
      required: false,
      default: () => "text",
    },
    titleKey: {
      type: String,
      required: true,
    },
    tipsKey: {
      type: String,
      required: false,
    },
    placeholder: {
      type: String,
      required: false,
    },
    maxlength: {
      type: Number,
      required: true,
    },
    error: {
      type: Array,
      required: true,
    },
    modelValue: {
      type: String,
      required: true,
    },
  },
  emits: ["update:modelValue"],
  setup(_, context) {
    const store = useStore();
    const input = (value: string) => {
      context.emit("update:modelValue", value);
    };
    const open = (key: string) => {
      store.commit("setTips", {
        key,
      });
    };
    return {
      input,
      open,
    };
  },
});
</script>
