<template>
  <div>
    <t-modal :active="!!dialog?.tips" @update:active="close">
      <div
        class="op-dialog mx-2 my-6 rounded-lg bg-white pt-6 pr-6 pb-6 pl-6 shadow-lg"
      >
        <div class="mt-4 text-center">
          <div class="text-xl font-bold text-black opacity-60">
            {{ $t("dialogTips." + dialog?.tips?.key + ".title") }}
          </div>
        </div>
        <div class="mt-2">
          <div
            v-for="(line, k) in $t(
              'dialogTips.' + dialog?.tips?.key + '.body',
            ).split('\n')"
            :key="k"
          >
            {{ line }}
          </div>
        </div>
        <div>
          <div class="mt-4 text-center">
            <div
              class="inline-flex h-12 min-h-[36px] min-w-[128px] cursor-pointer items-center justify-center rounded-full bg-black/5 px-6 text-base font-bold text-black opacity-60"
              @click="close"
            >
              {{ $t("menu.close") }}
            </div>
          </div>
        </div>
      </div>
    </t-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  setup() {
    const store = useStore();
    const dialog = computed(() => {
      return store.state.dialog;
    });
    return {
      dialog,
      close: () => {
        store.commit("resetDialog");
      },
    };
  },
});
</script>
