<template>
  <div v-if="notFound">Not Found</div>
  <div v-else>
    <!-- Header -->
    <div class="mx-6 mt-4 lg:flex lg:items-center">
      <!-- Back and Preview -->
      <div class="flex space-x-4">
        <back-button url="/admin/docs/" backText="button.backToDocument" />
      </div>
    </div>

    <div class="m-6">
      <linenews v-if="articleId === 'article230930_line_official_account'" />
      <soldout v-if="articleId === 'article231007_out_of_stock'" />
      <lunch_n_dinner v-if="articleId === 'article231019_lunch_n_dinner'" />
      <lead_time v-if="articleId === 'article240725_lead_time_management'" />
      <configurations_of_dishes
        v-if="articleId === 'article240727_configurations_of_dishes'"
      />
      <stripe_payouts v-if="articleId === 'article240817_stripe_payouts'" />
      <discounts v-if="articleId === 'article250315_discounts'" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BackButton from "@/components/BackButton.vue";

import { useRoute } from "vue-router";

import linenews from "../../../../docs/article230930_line_official_account/line_official_account.md";
import soldout from "../../../../docs/article231007_out_of_stock/out_of_stock.md";
import lunch_n_dinner from "../../../../docs/article231019_lunch_n_dinner/lunch_n_dinner.md";

import lead_time from "../../../../docs/article240725_lead_time_management/lead_time_management.md";
import configurations_of_dishes from "../../../../docs/article240727_configurations_of_dishes/configurations_of_dishes.md";

import stripe_payouts from "../../../../docs/article240817_stripe_payouts/stripe_payouts.md";

import discounts from "../../../../docs/article250315_discounts/discounts.md";

const articles: { [key: string]: string } = {
  article230930_line_official_account: linenews,
  article231007_out_of_stock: soldout,
  article231019_lunch_n_dinner: lunch_n_dinner,
  article240725_lead_time_management: lead_time,
  article240727_configurations_of_dishes: configurations_of_dishes,
	article240817_stripe_payouts: stripe_payouts,
	article250315_discounts: discounts,	
};

export default defineComponent({
  components: {
    BackButton,
    linenews,
    soldout,
    lunch_n_dinner,
    lead_time,
    configurations_of_dishes,
    discounts,
  },
  setup() {
    const route = useRoute();
    const articleId = route.params.articleId as string;
    const article = articles[articleId];
    const notFound = !article;

    return {
      notFound,
      articleId,
    };
  },
});
</script>

<style lang="css" scoped>
::v-deep(h1) {
  @apply my-4 text-xl font-bold text-black text-opacity-60;
}
::v-deep(h2) {
  @apply my-4 text-base font-bold text-black text-opacity-60;
}
::v-deep(h3) {
  @apply my-4 text-base font-bold text-black text-opacity-60;
}
::v-deep(h4) {
  @apply my-4 text-base font-bold text-black text-opacity-60;
}
::v-deep(p) {
  @apply my-2 text-sm text-black text-opacity-60;
}
::v-deep(a) {
  @apply underline;
}
::v-deep(img) {
  @apply my-4;
}
::v-deep(ul) {
  @apply my-1 text-sm text-black text-opacity-60 list-disc;
}
::v-deep(ol) {
  @apply my-2 text-sm text-black text-opacity-60;
}
::v-deep(ul) > li {
  @apply mx-4;
}

::v-deep(table) {
  @apply my-2 text-base font-bold text-black text-opacity-60;
}
</style>
