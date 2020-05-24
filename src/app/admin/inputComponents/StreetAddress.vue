<template>
<div>

  <div class="field is-horizontal">
    <div class="field-body">
      <h4>
        {{$t('shopInfo.streetAddress')}}
        <span class="p-font bold" style="color:#CB4B4B">*</span>
      </h4>
    </div>
  </div>

  <b-field :type="errors['streetAddress'].length > 0 ? 'is-danger' : 'is-success'">
    <b-input
      :value="value"
      type="text"
      :placeholder="$t('editRestaurant.enterStreetAddress')"
      @input="input"
      maxlength="30"
      ></b-input>
  </b-field>
</div>
</template>

<script>

export default {
  name: "StreetAddress",
  props: {
    errors : {
      type: Object,
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
