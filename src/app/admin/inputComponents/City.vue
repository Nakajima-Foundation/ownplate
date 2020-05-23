<template>
  <div>
    <div class="column">
      <div class="field is-horizontal">
        <div class="field-body">
          <h4>
            {{$t('shopInfo.city')}}
            <span class="p-font bold" style="color:#CB4B4B">*</span>
          </h4>
        </div>
      </div>
      <b-field :type="errors['city'].length > 0 ? 'is-danger' : 'is-success'">
        <b-input
          :value="value"
          type="text"
          :placeholder="$t('editRestaurant.enterCity')"
          @input="input"
          maxlength="15"
          ></b-input>
      </b-field>
    </div>
  </div>
</template>

<script>

export default {
  name: "City",
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
