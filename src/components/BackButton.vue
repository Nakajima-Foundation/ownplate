<template>
  <div>
    <nuxt-link :to="url">
      <div
        class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
      >
        <i class="material-icons text-lg text-op-teal mr-2">arrow_back</i>
        <span class="text-sm font-bold text-op-teal">{{
          $t("button.back")
        }}</span>
      </div>
    </nuxt-link>
  </div>
</template>

<script>
export default {
  props: {
    url: {
      type: String,
      required: true
    }
  }
};
</script>
