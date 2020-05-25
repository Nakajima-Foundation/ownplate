<template>
  <div>
    <div class="field is-horizontal">
      <div class="field-body">
        <h4>
          {{$t(this.state_key)}}
          <span class="p-font bold" style="color:#CB4B4B">*</span>
        </h4>
      </div>
    </div>
    <b-field
      :type="errors['state'].length > 0 ? 'is-danger' : 'is-success'"
      v-if="Array.isArray(states)"
      >
      <b-select :value="value" placeholder="select" @input="input">
        <option v-for="stateItem in states" :key="stateItem">{{ stateItem }}</option>
      </b-select>
    </b-field>
    <b-field :type="errors['state'].length > 0 ? 'is-danger' : 'is-success'" v-else>
      <b-input
        :value="value"
        type="text"
        :placeholder="$t('editRestaurant.enterCity')"
        maxlength="15"
        ></b-input>
    </b-field>
  </div>
</template>

<script>
import { ownPlateConfig } from "@/config/project";
import { regionalSettings } from "~/plugins/constant.js";

export default {
  name: "State",
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
  },
  data() {
    const regionalSetting = regionalSettings[ownPlateConfig.region || "US"];
    return {
      states: regionalSetting.AddressStates,
      state_key: regionalSetting.StateKey || "shopInfo.state",
    }
  }
}
</script>
