<template>
  <div>
    <div class="mt-4 text-center">
      <div class="text-xl font-bold text-black opacity-60">
        
        {{ $t("dialogTips." + tipsKey + ".title") }}
      </div>
    </div>
    <div class="mt-2">
      {{ $t("dialogTips." + tipsKey + ".body") }}
    </div>
    <div>
      <div class="mt-6 text-center">
        <div
          class="inline-flex h-12 min-h-[36px] min-w-[128px] cursor-pointer items-center justify-center rounded-full bg-black bg-opacity-5 px-6 text-base font-bold text-black opacity-60"
          @click="close"
          >
          {{ $t("menu.close") }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  defineComponent,
} from "@vue/composition-api";
export default defineComponent({
  props: {
    tipsKey: {
      type: String,
      required: true,
    },
  },
  emits: ["close"],
  setup(_, ctx) {
    return {
      close: () => {
         ctx.emit("close");
      },
    };
  },
});

</script>
