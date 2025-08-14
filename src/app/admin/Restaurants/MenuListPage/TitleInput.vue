<template>
  <div>
    <input
      ref="textInput"
      v-model="name"
      @blur="saveTitle"
      :placeholder="$t('editTitle.enterCategory')"
      class="w-full rounded-md bg-white px-2 py-1 whitespace-nowrap"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";

export default defineComponent({
  name: "TitleInput",
  props: {
    title: {
      type: Object,
      required: true,
    },
  },
  emits: ["saveTitle"],
  setup(props, ctx) {
    const name = ref(props.title.name);
    const textInput = ref();
    onMounted(() => {
      textInput.value.focus();
    });
    const saveTitle = () => {
      ctx.emit("saveTitle", name.value);
    };

    return {
      textInput,
      saveTitle,
      name,
    };
  },
});
</script>
