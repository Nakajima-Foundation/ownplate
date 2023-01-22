<template>
  <div class="lg:flex">
    <div class="lg:flex-1">
      <!-- Title Card -->
      <div class="rounded-lg bg-black bg-opacity-5 p-4" @click="toEdit()">
        <div
          class="text-xl font-bold text-black text-opacity-30"
          if
          v-if="title.name == ''"
        >
          {{ $t("editTitle.empty") }}
        </div>
        <div class="text-xl font-bold text-black text-opacity-30" if v-else>
          {{ title.name }}
        </div>
      </div>
    </div>

    <div
      class="mt-2 text-right lg:mt-0 lg:ml-4 lg:flex-shrink-0"
      v-if="isOwner"
    >
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
        <o-button @click="deleteItem" class="b-reset-tw">
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

<script>
import { defineComponent, computed } from "vue";
import { useAdminUids } from "@/utils/utils";

export default defineComponent({
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
  emit: ["toEditMode", "positionUp", "positionDown", "forkItem", "deleteItem"],
  setup(props, ctx) {
    const { isOwner } = useAdminUids();
    const toEdit = () => {
      ctx.emit("toEditMode", props.title.id);
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
    const deleteItem = () => {
      ctx.root.$store.commit("setAlert", {
        code: "editMenu.reallyDelete",
        callback: () => {
          ctx.emit("deleteItem", props.title.id);
        },
      });
    };
    return {
      isOwner,
      toEdit,
      positionUp,
      positionDown,
      forkItem,
      deleteItem,
    };
  },
});
</script>
