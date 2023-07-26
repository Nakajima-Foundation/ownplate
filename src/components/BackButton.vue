<template>
  <div>
    <router-link :to="url">
      <div
        class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
      >
        <i class="material-icons mr-2 text-lg text-op-teal">{{ iconText ? iconText : 'home' }} </i>
        <span class="text-sm font-bold text-op-teal">{{
          $t(backText ? backText : "button.adminTop")
        }}</span>
      </div>
    </router-link>
  </div>
</template>

<script>
export default {
  props: {
    url: {
      type: String,
      required: true,
    },
    iconText: {
      type: String,
      required: false,
    },
    backText: {
      type: String,
      required: false,
    },
  },
};
</script>
