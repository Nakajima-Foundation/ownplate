<template>
  <div>
    <div class="pb-2 text-sm font-bold">
      {{ $t(this.state_key) }}
      <span class="text-red-700">*</span>
    </div>
    <o-field
      :type="errors['state'].length > 0 ? 'is-danger' : 'is-success'"
      v-if="Array.isArray(states)"
    >
      <o-select :value="value" placeholder="select" @input="input">
        <option v-for="stateItem in states" :key="stateItem">
          {{ stateItem }}
        </option>
      </o-select>
    </o-field>
    <o-field
      :type="errors['state'].length > 0 ? 'is-danger' : 'is-success'"
      v-else
    >
      <o-input
        :value="value"
        type="text"
        :placeholder="$t('editRestaurant.enterCity')"
        maxlength="15"
      ></o-input>
    </o-field>
  </div>
</template>

<script>
export default {
  name: "State",
  props: {
    errors: {
      type: Object,
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
  data() {
    return {
      states: [],
      state_key: "",
    };
  },
  created() {
    this.states = this.regionalSetting.AddressStates;
    this.state_key = this.regionalSetting.StateKey || "shopInfo.state";
  },
};
</script>
