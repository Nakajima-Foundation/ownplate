<template>
  <b-button
    class="b-reset op-button-pill h-9 rounded-full bg-form"
    tag="nuxt-link"
    :to="url"
  >
    <i class="material-icons c-primary s-18 ml-2">arrow_back</i>
    <span class="c-primary t-button">{{ $t("button.back") }}</span>
  </b-button>
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
