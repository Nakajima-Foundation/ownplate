<template>
  <div class="lg:flex">
    <div class="lg:flex-1">
      <!-- Title Card -->
      <div class="bg-black bg-opacity-5 rounded-lg p-4">
        <b-field>
          <b-input
            ref="textInput"
            v-model="title.name"
            @blur="blur"
            :placeholder="$t('editTitle.enterCategory')"
          ></b-input>
        </b-field>
      </div>
    </div>

    <div class="mt-2 text-right lg:mt-0 lg:ml-4 lg:flex-shrink-0">
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
        <b-button disabled class="b-reset-tw">
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
import Vue from "vue";

export default {
  name: "TitleInput",
  props: {
    title: {
      type: Object,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
  },
  created() {
    this.checkAdminPermission();
  },
  mounted() {
    this.$refs.textInput.focus();
  },
  methods: {
    blur() {
      // save and update this.
      this.$emit("updateTitle", this.title);
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
  },
};
</script>
