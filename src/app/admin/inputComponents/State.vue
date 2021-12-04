<template>
  <div>
    <div class="text-sm font-bold pb-2">
      {{ $t(this.state_key) }}
      <span class="text-red-700">*</span>
    </div>
    <b-field
      :type="errors['state'].length > 0 ? 'is-danger' : 'is-success'"
      v-if="Array.isArray(states)"
    >
      <b-select :value="modelValue" placeholder="select" @input="input">
        <option v-for="stateItem in states" :key="stateItem">{{
          stateItem
        }}</option>
      </b-select>
    </b-field>
    <b-field
      :type="errors['state'].length > 0 ? 'is-danger' : 'is-success'"
      v-else
    >
      <b-input
        :value="modelValue"
        type="text"
        :placeholder="$t('editRestaurant.enterCity')"
        maxlength="15"
      ></b-input>
    </b-field>
  </div>
</template>

<script>
export default {
  name: "State",
  props: {
    errors: {
      type: Object,
      required: true
    },
    modelValue: {
      type: String,
      required: true
    }
  },
  methods: {
    input(e) {
      this.$emit("update:modelValue", e);
    }
  },
  data() {
    return {
      states: [],
      state_key: ""
    };
  },
  created() {
    this.states = this.regionalSetting.AddressStates;
    this.state_key = this.regionalSetting.StateKey || "shopInfo.state";
  }
};
</script>
