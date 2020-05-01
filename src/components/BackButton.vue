<template>
  <b-button
    style="margin-right:auto"
    type="is-primary"
    class="counter-button"
    icon-left="arrow-left"
    tag="nuxt-link"
    :to="url"
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
