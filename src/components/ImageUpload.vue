<template>
  <div class="w-full h-full bg-gray-200 text-gray-500 relative"
       @dragover.prevent @drop.prevent @drop="dragFile">
    <template
      v-if="preview"
      >
      <img
        class="w-full h-full object-cover absolute"
        :src="preview"
        />
      <span
        class="absolute bg-white inline-bloack opacity-50"
        @click="clearImage"
        >☓</span>
    </template>
    <template v-else>
      <span class="inline-block absolute top-1/2 left-1/2 w-full text-center"
            style="transform:translate(-50%,-50%);"
            >
        {{ $t('editCommon.clickAndUpload') }}
      </span>
      <input type="file" class="w-full h-full opacity-0"
             :accept="'image/jpeg'"
             @change="uploadFile" 
             />
    </template>
  </div>
</template>

<script>
import { defineComponent, ref, watch } from "vue";

export default defineComponent({
  name: "ImageUpload",
  emits: ["setImage"],

  setup(props, context) {
    const file = ref();
    const preview = ref();
    
    const uploadFile = (e) => {
      if (e.target.files && e.target.files.length > 0) {
        file.value = e.target.files[0];
      }
    };
    const clearImage = () => {
      file.value = null;
      preview.value = null;
    };
    const dragFile = (e) => {
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        file.value = e.dataTransfer.files[0];
      }
    };
    watch(file, () => {
      preview.value = file.value ? URL.createObjectURL(file.value) : null;
      context.emit("setImage", file.value);
    });
    return {
      uploadFile,
      dragFile,

      clearImage,

      preview,

    };
  }
});
</script>
