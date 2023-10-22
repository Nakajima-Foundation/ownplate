<template>
  <div class="lg:flex">
    <div class="lg:flex-1">
      <!-- Title Card -->
      <div class="rounded-lg bg-black bg-opacity-5 p-4" v-if="isEdit">
        <TitleInput :title="title" @saveTitle="saveTitle" />
      </div>
      <div
        class="rounded-lg bg-black bg-opacity-5 p-4"
        @click="toEdit()"
        v-else
      >
        <div
          class="text-xl font-bold text-black text-opacity-30"
          if
          v-if="title.name == ''"
        >
          {{ $t("editTitle.empty") }}
        </div>
        <div
          class="text-sm font-bold text-black text-opacity-30 flex w-full"
          v-else
        >
          {{ title.name }}
          <div class="text-right flex-1">
            <o-checkbox
              @click="(e) => updateTitleLunchDinner(e, 'lunch')"
              v-model="title.availableLunch"
            >
              {{ $t("editMenu.lunch") }}
            </o-checkbox>
            <o-checkbox
              @click="(e) => updateTitleLunchDinner(e, 'dinner')"
              v-model="title.availableDinner"
            >
              {{ $t("editMenu.dinner") }}
            </o-checkbox>
          </div>
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
          :disabled="position === 'first' || isEdit"
          @click="positionUp"
          class="b-reset-tw"
        >
          <div
            class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
          >
            <i class="material-icons text-lg text-op-teal">arrow_upward</i>
          </div>
        </o-button>

        <!-- Down -->
        <o-button
          :disabled="position === 'last' || isEdit"
          @click="positionDown"
          class="b-reset-tw"
        >
          <div
            class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
          >
            <i class="material-icons text-lg text-op-teal">arrow_downward</i>
          </div>
        </o-button>

        <!-- Duplicate -->
        <o-button @click="forkItem" class="b-reset-tw" :disabled="isEdit">
          <div
            class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
          >
            <i class="material-icons text-lg text-op-teal">queue</i>
          </div>
        </o-button>

        <!-- Delete -->
        <o-button @click="deleteItem" class="b-reset-tw" :disabled="isEdit">
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
import { defineComponent } from "vue";
import { useAdminUids } from "@/utils/utils";

import { useStore } from "vuex";
import TitleInput from "@/app/admin/Restaurants/MenuListPage/TitleInput.vue";

export default defineComponent({
  components: {
    TitleInput,
  },
  props: {
    isEdit: {
      type: Boolean,
      required: true,
    },
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
    const store = useStore();

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
      store.commit("setAlert", {
        code: "editMenu.reallyDelete",
        callback: () => {
          ctx.emit("deleteItem", props.title.id);
        },
      });
    };
    const saveTitle = (name: string) => {
      // save and update this.
      ctx.emit("updateTitle", { id: props.title.id, name: name });
    };
    const updateTitleLunchDinner = (e: any, target: string) => {
      const l =
        target === "lunch"
          ? !props.title.availableLunch
          : !!props.title.availableLunch;
      const d =
        target === "dinner"
          ? !props.title.availableDinner
          : !!props.title.availableDinner;

      ctx.emit("updateTitleLunchDinner", {
        id: props.title.id,
        lunch: l,
        dinner: d,
      });
      e.stopPropagation();
      return false;
    };

    return {
      isOwner,
      toEdit,
      positionUp,
      positionDown,
      forkItem,
      deleteItem,
      saveTitle,
      updateTitleLunchDinner,
    };
  },
});
</script>
