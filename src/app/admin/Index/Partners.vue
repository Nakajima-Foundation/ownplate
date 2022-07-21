<template>
  <div>
    <div v-if="partners.length > 0" class="mt-2 mb-1">
      <div v-for="(partner, k) in partners" :key="k" class="flex">
        <div class="flex-1 ml-4">
          <img :src="`/partners/${partner.logo}`" class="w-12" />
          <span class="font-bold">
            {{ partner.name }}
          </span>
        </div>
        <div class="text-right font-bold mr-4" v-if="partner.ask">
          <a href="#" @click="openContact()">サポート問い合わせ</a>
        </div>
      </div>
    </div>
    <b-modal :active.sync="isOpen" :width="488">
      <PartnersContact :id="(partners[0] || {}).id" />
    </b-modal>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
} from "@vue/composition-api";
import PartnersContact from "../Partners/Contact.vue";
import { getPartner } from "@/utils/utils";
import { ShopOwnerData } from "@/models/ShopOwner";

export default defineComponent({
  components: {
    PartnersContact,
  },
  props: {
    shopOwner: {
      type: Object,
      required: true,
    },
  },
  setup(props, ctx) {
    const isOpen = ref(false);
    const partners = computed(() => {
      return getPartner(props.shopOwner as ShopOwnerData);
    });

    const openContact = () => {
      isOpen.value = true;
    };
    return {
      isOpen,
      openContact,
      partners,
    };

  },
});
</script>
