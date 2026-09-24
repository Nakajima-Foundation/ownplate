<template>
  <div>
    <div v-if="partners.length > 0" class="mt-2 mb-1">
      <template v-for="(partner, k) in partners" :key="k">
        <!-- 提携先が消されたあとも店舗側には id が残る。getPartner はその穴を
             undefined のまま残すので、ここで飛ばす。 -->
        <div v-if="partner" class="flex">
          <div class="ml-4 flex-1">
            <img :src="`/partners/${partner.logo}`" alt="" class="w-12" />
            <span class="font-bold">
              {{ partner.name }}
            </span>
          </div>
          <div
            class="mr-4 cursor-pointer text-right font-bold"
            v-if="partner.ask"
          >
            <a href="#" @click="openContact()">サポート問い合わせ</a>
          </div>
        </div>
      </template>
    </div>
    <t-modal :active="isOpen" width="488" @dismissed="close">
      <PartnersContact :id="(partners[0] || {}).id" />
    </t-modal>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import PartnersContact from "@/app/admin/Partners/Contact.vue";
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
  setup(props) {
    const isOpen = ref(false);
    const partners = computed(() => {
      return getPartner(props.shopOwner as ShopOwnerData);
    });

    const openContact = () => {
      isOpen.value = true;
    };
    const close = () => {
      isOpen.value = false;
    };
    return {
      isOpen,
      openContact,
      close,
      partners,
    };
  },
});
</script>
