<template>
  <div>
    <div class="t-subtitle2 c-text-black-medium p-b-8">
      {{$t(titleKey)}}
      <span class="c-status-red" v-if="required === true">*</span>
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
      default: () => true
    },
    type: {
      type: String,
      required: false,
      default: () => "text"
    },
    titleKey: {
      type: String,
      required: true
    },
    placeholder: {
      type: String,
      required: false
    },
    maxlength: {
      type: Number,
      required: true
    },
    error: {
      type: Array,
      required: true
    },
    value: {
      type: String,
      required: true
    }
  },
  methods: {
    input(e) {
      this.$emit("input", e);
    }
  }
};
</script>
