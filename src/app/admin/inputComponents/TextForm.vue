<template>
<div>
  <div class="field is-horizontal">
    <div class="field-body">
      <h4>
        {{$t(titleKey)}}
        <span class="p-font bold" style="color:#CB4B4B" v-if="required === true">*</span>
      </h4>
    </div>
  </div>
  <b-field :type="error.length > 0 ? 'is-danger' : 'is-success'">
    <b-input
      :value="value"
      :type="type"
      :placeholder="$t(placeHolder)"
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
      'default': () => (true)
    },
    type: {
      type: String,
      required: false,
      'default': () => ("text")
    },
    titleKey: {
      type: String,
      required: true
    },
    placeHolder: {
      type: String,
      required: true
    },
    maxlength: {
      type: Number,
      required: true
    },
    error : {
      type: Array,
      required: true
    },
    value : {
      type: String,
      required: true
    },
  },
  methods: {
    input(e) {
      this.$emit('input', e)
    },
  }
}
</script>
