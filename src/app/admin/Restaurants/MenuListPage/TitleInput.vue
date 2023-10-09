<template>
  <div>
    <o-field>
      <o-input
        ref="textInput"
        :modelValue="name"
        @update:modelValue="updateTitle"
        @blur="saveTitle"
        :placeholder="$t('editTitle.enterCategory')"
      ></o-input>
    </o-field>
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
    const updateTitle = (e: string) => {
      name.value = e;
    };
    const saveTitle = () => {
      ctx.emit("saveTitle", name.value);
    };

    return {
      updateTitle,
      textInput,
      saveTitle,
      name,
    };
  },
});
</script>
