<template>
  <div>
    <div class="pb-2 text-sm font-bold">
      <span @click="open(tipsKey)" v-if="tipsKey">{{ $t(titleKey) }}</span>
      <span v-else>{{ $t(titleKey) }}</span>
      <span class="text-red-700" v-if="required === true">*</span>
    </div>
    <o-field :variant="error.length > 0 ? 'danger' : 'success'">
      <o-input
        :modelValue="modelValue"
        :type="type"
        :placeholder="$t(placeholder)"
        @update:modelValue="input"
        :maxlength="maxlength"
      ></o-input>
    </o-field>
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
    const input = (e: any) => {
      context.emit("update:modelValue", e);
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
