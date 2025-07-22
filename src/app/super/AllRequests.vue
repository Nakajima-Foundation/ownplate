<template>
  <section class="mx-auto max-w-full px-6 pb-12 pt-4">
    <back-button url="/s" />
    <h2>All Requests</h2>
    <table>
      <tr>
        <td>Name</td>
        <td>List</td>
        <td>Pub</td>
        <td>Delete</td>
        <td>Status</td>
      </tr>

      <tr v-for="request in requests" :key="request.id">
        <td style="width: 50%">
          <router-link
            :to="`/r/${request.id}`"
            class="text-sm font-bold text-op-teal"
          >
            {{ (restaurantsObj[request.id] || {}).restaurantName }}
          </router-link>
        </td>
        <td>
          {{ (restaurantsObj[request.id] || {}).onTheList ? "o" : "-" }}
        </td>
        <td>
          {{ (restaurantsObj[request.id] || {}).publicFlag ? "o" : "-" }}
        </td>
        <td>
          {{ (restaurantsObj[request.id] || {}).deletedFlag ? "o" : "-" }}
        </td>
        <td>
          <span>
            {{ request.status == 1 ? "request" : "" }}
          </span>
        </td>
        <td>
          <span
            v-if="
              !restaurantsObj[request.id] ||
              !restaurantsObj[request.id].onTheList
            "
          >
            <button @click="enableList(restaurantsObj[request.id].id)"
              >Enable</button
            >
          </span>
          <span v-else> On the list </span>
        </td>
      </tr>
    </table>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import {
  doc2data,
  array2obj,
  arrayChunk,
  defaultTitle,
  useSuper,
} from "@/utils/utils";

import BackButton from "@/components/BackButton.vue";
import { useHead } from "@unhead/vue";

import { db } from "@/lib/firebase/firebase9";
import {
  updateDoc,
  doc,
  collection,
  where,
  query,
  limit,
  orderBy,
  getDocs,
  documentId,
} from "firebase/firestore";

export default defineComponent({
  components: {
    BackButton,
  },
  setup() {
    useSuper();

    useHead(() => ({
      title: [defaultTitle, "Super All Requests"].join(" / "),
    }));

    const requests = ref<any[]>([]);
    const restaurantsObj = ref({});

    getDocs(
      query(
        collection(db, "requestList"),
        limit(500),
        orderBy("created", "desc"),
      ),
    ).then(async (snapshot) => {
      requests.value = snapshot.docs.map(doc2data("request"));
      const ids = requests.value.map((a) => a.id);
      for (const arr of arrayChunk(ids, 10)) {
        const resCols = await getDocs(
          query(collection(db, "restaurants"), where(documentId(), "in", arr)),
        );
        if (!resCols.empty) {
          restaurantsObj.value = Object.assign(
            {},
            restaurantsObj.value,
            array2obj(resCols.docs.map(doc2data("restaurant"))),
          );
        }
      }
    });

    const enableList = (id: string) => {
      updateDoc(doc(db, `restaurants/${id}`), { onTheList: true });
      const tmp = Object.assign({}, restaurantsObj.value) as any;
      tmp[id].onTheList = true;
      restaurantsObj.value = tmp;
    };
    return {
      requests,
      restaurantsObj,
      enableList,
    };
  },
});
</script>
