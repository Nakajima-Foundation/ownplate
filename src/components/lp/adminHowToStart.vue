<template>
  <div class="px-6 pt-10">
    <div class="text-op-90 text-center text-2xl font-bold text-black">
      {{ $t("lp.howToStart") }}
    </div>

    <div class="mt-2 rounded-lg bg-white p-6 py-7 sm:px-5">
      <div class="grid gap-y-4 sm:grid-cols-4 sm:gap-8">
        <div class="flex items-center sm:block sm:text-center">
          <div>
            <img
              class="w-14 object-cover sm:w-1/3"
              src="/images/top/step1.png"
            />
          </div>
          <div
            class="text-op-90 ml-4 flex-1 font-bold text-black sm:mt-5 sm:ml-0 sm:text-lg"
          >
            {{ $t("lp.step1") }}
          </div>
        </div>

        <div class="flex items-center sm:block sm:text-center">
          <div>
            <img
              class="w-14 object-cover sm:w-1/3"
              src="/images/top/step2.png"
            />
          </div>
          <div
            class="text-op-90 ml-4 flex-1 font-bold text-black sm:mt-5 sm:ml-0 sm:text-lg"
          >
            {{ $t("lp.step2") }}
          </div>
        </div>

        <div class="flex items-center sm:block sm:text-center">
          <div>
            <img
              class="w-14 object-cover sm:w-1/3"
              src="/images/top/step3.png"
            />
          </div>
          <div
            class="text-op-90 ml-4 flex-1 font-bold text-black sm:mt-5 sm:ml-0 sm:text-lg"
          >
            {{ $t("lp.step3") }}
          </div>
        </div>

        <div class="flex items-center sm:block sm:text-center">
          <div>
            <img
              class="w-14 object-cover sm:w-1/3"
              src="/images/top/step4.png"
            />
          </div>
          <div
            class="text-op-90 ml-4 flex-1 font-bold text-black sm:mt-5 sm:ml-0 sm:text-lg"
          >
            {{ $t("lp.step4") }}
          </div>
        </div>
      </div>

      <div class="mt-10 text-center sm:mt-12">
        <router-link to="/admin/docs">
          <div class="inline-flex items-center justify-center">
            <span class="text-op-teal text-lg font-bold lg:text-xl">
              {{ $t("lp.clickHereForDetails") }}
            </span>
            <i class="material-icons text-op-teal ml-0.5 text-lg">launch</i>
          </div>
        </router-link>

        <div class="mt-8 mb-4 sm:mb-6">
          <router-link
            :to="isAdmin ? `/admin/restaurants` : `/admin/user/signup`"
          >
            <div
              class="bg-ownplate-yellow hover:bg-ownplate-yellow/80 inline-flex h-16 items-center rounded-full px-8 shadow-sm"
            >
              <span class="text-xl font-bold text-black opacity-90">
                {{ $t(isAdmin ? "admin.news.adminTop" : "lp.signUpForFree") }}
              </span>
            </div>
          </router-link>
        </div>

        <!-- Go to Samples -->
        <div class="lg:inline-flex lg:items-center lg:space-x-4">
          <div class="mb-2 text-sm font-bold text-black opacity-90 lg:mb-0">
            {{ $t("lp.goToSampleRestaurant") }}
          </div>
          <div class="inline-flex items-center space-x-4">
            <a
              href="https://omochikaeri.com/r/bYArBMUJBe4KdVzZijLH"
              class="bg-ownplate-yellow hover:bg-ownplate-yellow/80 inline-flex h-10 items-center rounded-full px-4"
            >
              <span class="text-sm font-bold text-black opacity-90">{{
                $t("lp.izakaya")
              }}</span>
            </a>
            <a
              href="https://omochikaeri.com/r/wwCgtIEZQo6QnXRyxYYS"
              class="b bg-ownplate-yellow hover:bg-ownplate-yellow/80 inline-flex h-10 items-center rounded-full px-4"
            >
              <span class="text-sm font-bold text-black opacity-90">{{
                $t("lp.patisserie")
              }}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    isAdmin: {
      type: Boolean,
      require: true,
      default: false,
    },
  },
});
</script>
