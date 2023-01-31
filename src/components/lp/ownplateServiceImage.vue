<template>
  <div>
    <div class="bg-ownplate-yellow">
      <!-- Faces and Foods -->
      <div>
        <img :src="coverMobile" class="w-full lg:hidden" />
        <img
          src="/LP-Cover-Tablet-1.jpg"
          class="hidden w-full lg:inline-block"
        />
      </div>

      <!-- Tagline -->
      <div class="py-8 text-center text-2xl font-bold text-white lg:text-4xl">
        {{ $t("lp.enjoyOmochilaeri") }}
      </div>

      <div class="m-auto block h-1 w-72 bg-white"></div>

      <!-- Features -->
      <div>
        <img
          style="height: 752px"
          class="object-cover lg:hidden"
          :src="`/${featureHeroMobile}`"
        />
        <img
          style="height: 416px"
          class="hidden object-cover lg:inline-block"
          :src="`/${featureHeroTablet}`"
        />
      </div>
    </div>
  </div>
</template>

<script>
import {
  defineComponent,
} from "vue";
import { useFeatureHeroMobile, useFeatureHeroTablet } from "@/utils/utils";

export default defineComponent({
  setup() {
    const coverMobile = (() => {
      const seed = (Math.floor(Math.random() * 2) % 2) + 1;
      return `/LP-Cover-Mobile-1-${seed}.jpg`;
    })();
    const featureHeroTablet = useFeatureHeroTablet();
    const featureHeroMobile = useFeatureHeroMobile();

    return {
      coverMobile,
      featureHeroTablet,
      featureHeroMobile,
    }
  },
});
</script>
