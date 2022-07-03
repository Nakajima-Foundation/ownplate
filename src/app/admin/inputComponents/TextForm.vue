<template>
  <div>
    <div class="text-sm font-bold pb-2">
      {{ $t(titleKey) }}
      <span class="text-red-700" v-if="required === true">*</span>
    </div>
    <b-field :type="error.length > 0 ? 'is-danger' : 'is-success'">
      <b-input
        :value="value"
        :type="type"
        :placeholder="$t(placeholder)"
        @input="input"
        :maxlength="maxlength"
      ></b-input>
    </b-field>
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
