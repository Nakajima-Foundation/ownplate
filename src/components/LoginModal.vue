<template>
  <b-modal :active.sync="openFlag" :width="640" scroll="keep">
    <div class="card">
      <div class="card-content">
        <h3 class="bold">
          Sign in with SMS
        </h3>

        <div v-if="phoneForm" class="content" style="margin-top:1rem;">
          <b-field class="p-font-middle" label="Your phone Number">
            <b-input
              v-model="phone"
              type="number"
              placeholder="+1 000-000-0000"
              value=""
            ></b-input>
          </b-field>
        </div>

        <div v-if="numberForm" class="content" style="margin-top:1rem;">
          <b-field class="p-font-middle" label="Verification code">
            <b-input v-model="number" placeholder="0000" value=""></b-input>
          </b-field>
        </div>

        <a class="buttons is-centered">Send code again</a>

        <div class="buttons is-right">
          <b-button rounded @click="openFlag = false">
            Cancel
          </b-button>
          <b-button v-if="!conrfim" type="is-info" rounded @click="goNext">
            Next
          </b-button>
          <b-button v-if="conrfim" type="is-info" rounded @click="goCheckout">
            Checkout
          </b-button>
        </div>
      </div>
    </div>
  </b-modal>
</template>

<script>
export default {
  props: {},
  data() {
    return {
      openFlag: false,
      phoneForm: true,
      numberForm: false,
      phone: "",
      number: "",
      conrfim: false,
      restaurantsId: this.$route.params.id
    };
  },
  methods: {
    open() {
      this.phoneForm = true;
      this.numberForm = false;
      this.openFlag = true;
      this.conrfim = false;
    },
    close() {
      this.openFlag = false;
    },
    goNext() {
      this.$buefy.toast.open({
        duration: 5000,
        message: `Send your number！`,
        position: "is-bottom",
        type: "is-success"
      });
      this.phoneForm = false;
      this.numberForm = true;
      this.conrfim = true;
    },
    goCheckout() {
      if (this.restaurantsId) {
        this.$router.push({
          path: `/restaurants/order/${this.restaurantsId}/`
        });
      } else {
        this.$router.push({ path: "/restaurants/order/" });
      }
    }
  }
};
</script>
<style lang="scss" scoped></style>
