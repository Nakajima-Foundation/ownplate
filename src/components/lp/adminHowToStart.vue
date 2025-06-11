<template>
  <div class="pt-10 px-6">
    <div class="text-black text-center text-op-90 text-2xl font-bold">
      {{ $t("lp.howToStart") }}
    </div>

    <div class="mt-2 bg-white rounded-lg p-6 sm:px-5 py-7">
      <div class="grid sm:grid-cols-4 gap-y-4 sm:gap-8">
        <div class="sm:text-center flex sm:block items-center">
          <div>
            <img
              class="object-cover w-14 sm:w-1/3"
              src="/images/top/step1.png"
            />
          </div>
          <div
            class="text-black text-op-90 sm:text-lg font-bold sm:mt-5 ml-4 sm:ml-0 flex-1"
          >
            {{ $t("lp.step1") }}
          </div>
        </div>

        <div class="sm:text-center flex sm:block items-center">
          <div>
            <img
              class="object-cover w-14 sm:w-1/3"
              src="/images/top/step2.png"
            />
          </div>
          <div
            class="text-black text-op-90 sm:text-lg font-bold sm:mt-5 ml-4 sm:ml-0 flex-1"
          >
            {{ $t("lp.step2") }}
          </div>
        </div>

        <div class="sm:text-center flex sm:block items-center">
          <div>
            <img
              class="object-cover w-14 sm:w-1/3"
              src="/images/top/step3.png"
            />
          </div>
          <div
            class="text-black text-op-90 sm:text-lg font-bold sm:mt-5 ml-4 sm:ml-0 flex-1"
          >
            {{ $t("lp.step3") }}
          </div>
        </div>

        <div class="sm:text-center flex sm:block items-center">
          <div>
            <img
              class="object-cover w-14 sm:w-1/3"
              src="/images/top/step4.png"
            />
          </div>
          <div
            class="text-black text-op-90 sm:text-lg font-bold sm:mt-5 ml-4 sm:ml-0 flex-1"
          >
            {{ $t("lp.step4") }}
          </div>
        </div>
      </div>

      <div class="text-center sm:mt-12 mt-10">
        <router-link to="/admin/docs">
          <div class="inline-flex items-center justify-center">
            <span class="text-op-teal text-lg font-bold lg:text-xl">
              {{ $t("lp.clickHereForDetails") }}
            </span>
            <i class="material-icons ml-0.5 text-lg text-op-teal">launch</i>
          </div>
        </router-link>

        <div class="mt-8 sm:mb-6 mb-4">
          <router-link
            :to="isAdmin ? `/admin/restaurants` : `/admin/user/signup`"
          >
            <div
              class="inline-flex h-16 items-center rounded-full bg-ownplate-yellow px-8 shadow-sm hover:bg-ownplate-yellow/80"
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
              class="inline-flex h-10 items-center rounded-full bg-ownplate-yellow px-4 hover:bg-ownplate-yellow/80"
            >
              <span class="text-sm font-bold text-black opacity-90">{{
                $t("lp.izakaya")
              }}</span>
            </a>
            <a
              href="https://omochikaeri.com/r/wwCgtIEZQo6QnXRyxYYS"
              class="inline-flex h-10 items-center rounded-full b bg-ownplate-yellow px-4 hover:bg-ownplate-yellow/80"
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
