<template>
  <div class="lg:flex">
    <div class="lg:flex-1">
      <!-- Title Card -->
      <div class="rounded-lg bg-black bg-opacity-5 p-4">
        <o-field>
          <o-input
            ref="textInput"
            :modelValue="title.name"
            @update:modelValue="updateTitle"
            @blur="blur"
            :placeholder="$t('editTitle.enterCategory')"
          ></o-input>
        </o-field>
      </div>
    </div>

    <div class="mt-2 text-right lg:mt-0 lg:ml-4 lg:flex-shrink-0">
      <!-- Card Actions -->
      <div class="inline-flex space-x-2">
        <!-- Up -->
        <o-button
          v-if="position !== 'first'"
          @click="positionUp"
          class="b-reset-tw"
        >
          <div
            class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
          >
            <i class="material-icons text-lg text-op-teal">arrow_upward</i>
          </div>
        </o-button>
        <o-button v-else disabled class="b-reset-tw">
          <div
            class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
          >
            <i class="material-icons text-lg text-op-teal">arrow_upward</i>
          </div>
        </o-button>

        <!-- Down -->
        <o-button
          v-if="position !== 'last'"
          @click="positionDown"
          class="b-reset-tw"
        >
          <div
            class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
          >
            <i class="material-icons text-lg text-op-teal">arrow_downward</i>
          </div>
        </o-button>
        <o-button v-else disabled class="b-reset-tw">
          <div
            class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
          >
            <i class="material-icons text-lg text-op-teal">arrow_downward</i>
          </div>
        </o-button>

        <!-- Duplicate -->
        <o-button @click="forkItem" class="b-reset-tw">
          <div
            class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
          >
            <i class="material-icons text-lg text-op-teal">queue</i>
          </div>
        </o-button>

        <!-- Delete -->
        <o-button disabled class="b-reset-tw">
          <div
            class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
          >
            <i class="material-icons text-lg text-red-700">delete</i>
          </div>
        </o-button>
      </div>
    </div>
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
    position: {
      type: String,
      required: true,
    },
  },
  setup(props, ctx) {
    const textInput = ref();
    onMounted(() => {
      textInput.value.focus();
    });
    const title = ref(props.title.name);
    const blur = () => {
      // save and update this.
      ctx.emit("updateTitle", { id: props.title.id, name: title.value });
    };
    const updateTitle = (e: string) => {
      title.value = e;
    };
    const positionUp = () => {
      ctx.emit("positionUp", props.title.id);
    };
    const positionDown = () => {
      ctx.emit("positionDown", props.title.id);
    };
    const forkItem = () => {
      ctx.emit("forkItem", props.title.id);
    };
    return {
      textInput,
      blur,
      positionUp,
      positionDown,
      forkItem,
      updateTitle,
    };
  },
});
</script>
