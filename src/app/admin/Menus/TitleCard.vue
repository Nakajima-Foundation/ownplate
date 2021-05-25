<template>
  <div class="lg:flex">
    <div class="lg:flex-1">
      <!-- Title Card -->
      <div class="bg-black bg-opacity-5 rounded-lg p-4" @click="toEdit()">
        <div
          class="text-xl font-bold text-black text-opacity-30"
          if
          v-if="title.name == ''"
        >
          {{ $t("editTitle.empty") }}
        </div>
        <div class="text-xl font-bold text-black text-opacity-30" if v-else>
          {{ title.name }}
        </div>
      </div>
    </div>

    <div class="mt-2 text-right lg:mt-0 lg:ml-4 lg:flex-shrink-0"
         v-if="isOwner"
         >
      <!-- Card Actions -->
      <div class="inline-flex space-x-2">
        <!-- Up -->
        <b-button
          v-if="position !== 'first'"
          @click="positionUp"
          class="b-reset-tw"
        >
          <div
            class="inline-flex justify-center items-center px-4 h-9 rounded-full bg-black bg-opacity-5"
          >
            <i class="material-icons text-lg text-op-teal">arrow_upward</i>
          </div>
        </b-button>
        <b-button v-else disabled class="b-reset-tw">
          <div
            class="inline-flex justify-center items-center px-4 h-9 rounded-full bg-black bg-opacity-5"
          >
            <i class="material-icons text-lg text-op-teal">arrow_upward</i>
          </div>
        </b-button>

        <!-- Down -->
        <b-button
          v-if="position !== 'last'"
          @click="positionDown"
          class="b-reset-tw"
        >
          <div
            class="inline-flex justify-center items-center px-4 h-9 rounded-full bg-black bg-opacity-5"
          >
            <i class="material-icons text-lg text-op-teal">arrow_downward</i>
          </div>
        </b-button>
        <b-button v-else disabled class="b-reset-tw">
          <div
            class="inline-flex justify-center items-center px-4 h-9 rounded-full bg-black bg-opacity-5"
          >
            <i class="material-icons text-lg text-op-teal">arrow_downward</i>
          </div>
        </b-button>

        <!-- Duplicate -->
        <b-button @click="forkItem" class="b-reset-tw">
          <div
            class="inline-flex justify-center items-center px-4 h-9 rounded-full bg-black bg-opacity-5"
          >
            <i class="material-icons text-lg text-op-teal">queue</i>
          </div>
        </b-button>

        <!-- Delete -->
        <b-button @click="deleteItem" class="b-reset-tw">
          <div
            class="inline-flex justify-center items-center px-4 h-9 rounded-full bg-black bg-opacity-5"
          >
            <i class="material-icons text-lg text-red-700">delete</i>
          </div>
        </b-button>
      </div>
    </div>
  </div>
</template>

<script>
import store from "~/store/index.js";

export default {
  props: {
    title: {
      type: Object,
      required: true
    },
    position: {
      type: String,
      required: true
    }
  },
  data() {
    return {};
  },
  computed: {
    isOwner() {
      return !this.$store.getters.isSubAccount;
    },
  },
  methods: {
    toEdit() {
      this.$emit("toEditMode", this.title.id);
    },
    positionUp() {
      this.$emit("positionUp", this.title.id);
    },
    positionDown() {
      this.$emit("positionDown", this.title.id);
    },
    forkItem() {
      this.$emit("forkItem", this.title.id);
    },
    deleteItem() {
      // this.$emit("deleteItem", this.title.id);
      this.$store.commit("setAlert", {
        code: "editMenu.reallyDelete",
        callback: () => {
          this.$emit("deleteItem", this.title.id);
        }
      });
    }
  }
};
</script>
