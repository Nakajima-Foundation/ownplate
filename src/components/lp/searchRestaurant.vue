<template>
  <div class="pt-10 px-6">
	<div class="bg-op-teal rounded-lg px-5 sm:py-6 pb-12 pt-6 px-auto sm:flex items-center justify-center text-center">
		<div>
			<img
        class="object-cover w-40 sm:w-56"
        src="/images/top/takeout_icon.png">
		</div>

		<div class="mt-8 sm:mt-0 md:ml-16 sm:ml-8">
			<router-link to="/r">
				<div class="inline-flex h-16 items-center rounded-full bg-white px-12 sm:px-16 shadow hover:bg-opacity-90">
           <span class="text-xl font-bold text-op-teal">
						{{ $t("lp.searchRestaurant") }}
					</span>
       	</div>
			</router-link>

      <div class="mt-4">
        <div class="inline-flex items-center space-x-4">
          <router-link
            to="/r/area/12"
            class="inline-flex h-16 items-center rounded-full bg-ownplate-yellow px-10 sm:px-12 hover:bg-opacity-80"
          >
            <span class="text-xl font-bold text-black text-op-90">{{
              $t("lp.tokyo")
            }}</span>
          </router-link>
          <router-link
            to="/r/area/26"
            class="inline-flex h-16 items-center rounded-full bg-ownplate-yellow px-10 sm:px-12 hover:bg-opacity-80"
          >
            <span class="text-xl font-bold text-black text-op-90">{{
              $t("lp.osaka")
            }}</span>
          </router-link>
        </div>
      </div>
		</div>
	</div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
} from "vue";

export default defineComponent({
});
</script>
