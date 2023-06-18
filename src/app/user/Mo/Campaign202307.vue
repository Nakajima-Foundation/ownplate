<template>
  <!--Campaign202307-->
  <div>
    <div class="mx-6 rounded-lg bg-white p-4 text-center sm:max-w-7xl xl:mx-auto">
      <div class="font-bold text-base text-[#009936] sm:text-lg">
        {{ $t("mobileOrder.campaign.onlyMo") }}
      </div>
			<div class="mt-2 font-bold text-base sm:text-lg">
        {{ $t("mobileOrder.campaign.topJuly1") }}
			</div>
			<div class="mt-2 text-sm md:text-base">
				{{ $t("mobileOrder.campaign.topJuly2") }}
			</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "@vue/composition-api";
import { moBaseUrl } from "@/config/project";
export default defineComponent({
  props: {
    moBasePath: {
      type: String,
      required: true,
    },
  },
  
  setup() {
    return {
      moBaseUrl,
    }
  }
});
</script>
