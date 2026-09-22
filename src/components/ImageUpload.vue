<template>
  <div>
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
        accept="image/jpeg"
        class="absolute z-100 h-full w-full opacity-0"
      />
    </div>
    <div
      v-if="rejection === 'tooLarge'"
      class="mt-1 text-sm font-bold text-red-700"
    >
      {{ $t("editCommon.imageTooLarge", { size: maxImageUploadMegaBytes }) }}
    </div>
    <div
      v-else-if="rejection === 'notImage'"
      class="mt-1 text-sm font-bold text-red-700"
    >
      {{ $t("editCommon.imageNotImage") }}
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
import {
  ImageUploadRejection,
  imageUploadRejection,
  maxImageUploadMegaBytes,
} from "../utils/imageUpload";
export default defineComponent({
  props: {
    preview: {
      type: String,
      required: false,
    },
    // 親は文字列（style="width: 128px"）でも渡す。Object だけにすると
    // このページを開くたびに Vue の警告が出る。
    style: {
      type: [Object, String],
      required: false,
    },
  },
  emits: ["handler"],
  setup(props, context) {
    const rejection = ref<ImageUploadRejection | null>(null);

    // 受け付けない画像は親に渡さない。渡すと保存時に Storage が 403 を返し、
    // 「保存に失敗しました」としか出ないまま、原因が画像だと分からなくなる。
    const accept = (file: File | undefined) => {
      if (!file) {
        return;
      }
      rejection.value = imageUploadRejection(file);
      if (rejection.value === null) {
        context.emit("handler", file);
      }
    };

    const handler = (e: DragEvent | Event) => {
      if (e instanceof DragEvent && e.dataTransfer) {
        accept(e.dataTransfer.files[0]); // drag
      } else if (e.target instanceof HTMLInputElement && e.target.files) {
        accept(e.target.files[0]); // input
      }
    };
    return {
      handler,
      rejection,
      maxImageUploadMegaBytes,
    };
  },
});
</script>
