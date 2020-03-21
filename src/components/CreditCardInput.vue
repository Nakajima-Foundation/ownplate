<template>
  <span>
    <section class="is-centered">
      <div class="field is-horizontal pc_postcode">
        <div class="field-label is-normal">
          <label class="label bold">
            Card Number
          </label>
        </div>
        <input
          id="cc-number"
          class="input sp"
          type="number"
          max="12"
          pattern="^[0-9]+$"
          placeholder="0000000000000000"
          name="cardNumber"
        />
      </div>

      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label bold">
            Expiration date
          </label>
        </div>
        <div class="field-body">
          <div class="field has-addons">
            <div style="display:inline-flex">
              <b-select v-model="month" placeholder="01">
                <option v-for="monthItem of monthList" :key="monthItem">
                  {{ monthItem }}
                </option>
              </b-select>
              <span
                style="margin-top: auto;margin-bottom: auto;margin-left:0.4rem;margin-right:0.4rem;"
              >
                /
              </span>
              <b-select v-model="year" placeholder="24">
                <option v-for="yearItem of yearList" :key="yearItem">
                  {{ yearItem }}
                </option>
              </b-select>
            </div>
          </div>
        </div>
      </div>

      <div class="field is-horizontal pc_postcode">
        <div class="field-label is-normal card_input-secure">
          <label class="label card_input-secure bold">
            Security code
          </label>
        </div>
        <div class="field-body">
          <div class="field has-addons">
            <div style="display:inline-flex">
              <input
                class="input card_input card_input-secure"
                type="number"
                max="4"
                placeholder="000"
              />
              <img
                class="secure_sample-image"
                src="/card-image/secure_number.png"
              />
            </div>
          </div>
        </div>
      </div>

      <credit-card></credit-card>

      <div class="hr" style="margin-top:1.5rem;"></div>
    </section>
  </span>
</template>

<script>
import CreditCard from "~/components/CreditCard";
import store from "~/store/index.js";

export default {
  name: "HomePage",

  components: {
    CreditCard
  },
  data() {
    return {
      // datetime: new Date(),
      // yearList:[],
      // year:'20',
      monthList: [
        "01",
        "02",
        "03",
        "04",
        "05",
        "06",
        "07",
        "08",
        "09",
        "10",
        "11",
        "12"
      ],
      month: "01",
      yearList: [
        "2020",
        "2021",
        "2022",
        "2023",
        "2024",
        "2025",
        "2026",
        "2027",
        "2028",
        "2029",
        "2030",
        "2031"
      ],
      year: "2023",
      radio: "credit"
    };
  },

  mounted() {},

  methods: {}
};
</script>
<style lang="scss" scoped>
.card_input-secure {
  margin-top: auto;
  width: 120px;
  max-width: 100%;
  margin-bottom: auto;
}

.secure_sample-image {
  max-width: 100%;
  height: 40px;
  width: auto;
  margin-left: 0.4rem;
  margin-top: -0.6rem;
}

.postcode_second {
  width: 120px;
  max-width: 100%;
}

.cation-message {
  margin-top: 1.4rem;
}

input {
  // border-radius: 0.4;
  border-radius: 0.4;
  background-color: #f3f6f8;
}

.postcode_input {
  width: 150px;
  max-width: 100%;
}
</style>

<style lang="scss">
.inline-block {
  display: inline-block;
  padding-top: 20px; /* 余白指定 */
}

select {
  border-radius: 0.4rem !important;
}

select {
  background-color: #f3f6f8 !important;
}

.input_month {
  padding: 0 1rem 1rem 0rem;
}

.input_card {
  padding: 0 1rem 0rem 0rem;
}
</style>
