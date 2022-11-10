<template>
  <div>
    <div class="pb-2 text-sm font-bold">
      {{ $t(titleKey) }}
      <span class="text-red-700" v-if="required === true">*</span>
    </div>
    <o-field :variant="error.length > 0 ? 'danger' : 'success'">
      <o-input
        :value="value"
        :type="type"
        :placeholder="$t(placeholder)"
        @input="input"
        :maxlength="maxlength"
      ></o-input>
    </o-field>
  </div>
</template>

<script>
export default {
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
    value: {
      type: String,
      required: true,
    },
  },
  methods: {
    input(e) {
      this.$emit("input", e);
    },
  },
};
</script>
