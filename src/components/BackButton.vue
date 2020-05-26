<template>
  <b-button class="b-reset h-36 r-36 bg-form" tag="nuxt-link" :to="url">
    <span class="p-l-16 p-r-16">
      <i class="material-icons c-primary s-18 m-r-8">arrow_back</i>
      <span class="c-primary t-button">{{ $t('button.back') }}</span>
    </span>
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
