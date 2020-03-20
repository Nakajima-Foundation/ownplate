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
          class="input sp"
          type="number"
          max="12"
          pattern="^[0-9]+$"
          placeholder="0000000000000000"
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
                src="/dist/assets/image/secure_number.png"
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
        "01月",
        "02月",
        "03月",
        "04月",
        "05月",
        "06月",
        "07月",
        "08月",
        "09月",
        "10月",
        "11月",
        "12月"
      ],
      month: "01月",
      yearList: [
        "2020年",
        "2021年",
        "2022年",
        "2023年",
        "2024年",
        "2025年",
        "2026年",
        "2027年",
        "2028年",
        "2029年",
        "2030年",
        "2031年"
      ],
      year: "2023年",
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
  height: 60px;
  width: auto;
  margin-left: 1rem;
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
