<template>
  <div
    @dragover.prevent
    class="relative border-2 border-black/10"
    @drop.prevent="handler"
    :style="style"
  >
    <div class="absolute h-full w-full" :style="style">
      <img
        :src="preview"
        v-if="preview"
        :style="style"
        class="relative m-auto object-cover"
      />
      <div class="relative h-full w-full" v-else>
        {{ $t("editCommon.clickAndUpload") }}
      </div>
    </div>
    <input
      type="file"
      :style="style"
      multiple
      @change="handler"
      :accept="'image/jpeg'"
      class="absolute z-100 h-full w-full opacity-0"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  props: {
    preview: {
      type: String,
      required: false,
    },
    style: {
      type: Object,
      required: false,
    },
  },
  emits: ["handler"],
  setup(props, context) {
    const handler = (e: any) => {
      if (e.dataTransfer) {
        context.emit("handler", e.dataTransfer.files[0]); // drag
      } else if (e.target) {
        context.emit("handler", e.target.files[0]); // input
      }
    };
    return {
      handler,
    };
  },
});
</script>
