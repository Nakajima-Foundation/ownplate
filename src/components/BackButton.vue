<template>
  <b-button
    style="margin-right:auto"
    type="is-primary"
    class="counter-button"
    icon-left="arrow-left"
    tag="nuxt-link"
    :to="localePath(url)"
    rounded
    outlined
  >
    {{ $t('button.back') }}
  </b-button>
</template>

<script>
export default {
  props: {
    url: {
      type: String,
      required: true
    }
  },
}
</script>
