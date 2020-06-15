<template>
  <div>
    <div class="cols" style="align-items: center;">
      <div>
        <b-field :type="type">
          <b-select v-model="value.start" :disabled="disabled" @input="updateValue">
            <option
              v-for="(timeItem, index) of timeList"
              :key="timeItem"
              :value="index === 0 ? null : (index - 1) * 30"
            >{{ timeItem }}</option>
          </b-select>
        </b-field>
      </div>
      <div class="p-l-8 p-r-8">-</div>
      <div>
        <b-field :type="type">
          <b-select v-model="value.end" :disabled="disabled" @input="updateValue">
            <option
              v-for="(timeItem, index) of timeList"
              :key="timeItem"
              :value="index === 0 ? null : (index - 1) * 30"
            >{{ timeItem }}</option>
          </b-select>
        </b-field>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "HoursInput",
  props: {
    disabled: {
      type: Boolean,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    value: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },
  methods: {
    updateValue() {
      this.$emit("input", this.value);
    }
  },
  data() {
    return {
      timeList: [
        null,
        "00:00 AM",
        "00:30 AM",
        "01:00 AM",
        "01:30 AM",
        "02:00 AM",
        "02:30 AM",
        "03:00 AM",
        "03:30 AM",
        "04:00 AM",
        "04:30 AM",
        "05:00 AM",
        "05:30 AM",
        "06:00 AM",
        "06:30 AM",
        "07:00 AM",
        "07:30 AM",
        "08:00 AM",
        "08:30 AM",
        "09:00 AM",
        "09:30 AM",
        "10:00 AM",
        "10:30 AM",
        "11:00 AM",
        "11:30 AM",
        "12:00 PM",
        "12:30 PM",
        "01:00 PM",
        "01:30 PM",
        "02:00 PM",
        "02:30 PM",
        "03:00 PM",
        "03:30 PM",
        "04:00 PM",
        "04:30 PM",
        "05:00 PM",
        "05:30 PM",
        "06:00 PM",
        "06:30 PM",
        "07:00 PM",
        "07:30 PM",
        "08:00 PM",
        "08:30 PM",
        "09:00 PM",
        "09:30 PM",
        "10:00 PM",
        "10:30 PM",
        "11:00 PM",
        "11:30 PM",
        "12:00 AM"
      ]
    };
  }
};
</script>
