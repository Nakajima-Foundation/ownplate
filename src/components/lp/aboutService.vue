<template>
  <div>
    <!-- About Service -->
    <div
      class="mt-8 text-center text-xl font-bold text-black opacity-40 lg:text-3xl"
    >
      {{ $t("aboutService.title") }}
    </div>

    <!-- About -->
    <div class="mx-auto max-w-(--breakpoint-md) px-6 text-base">
      <div class="mt-4">
        {{ $t("aboutService.paragraph1") }}
      </div>
      <div class="mt-4">
        {{
          $t("aboutService.paragraph2", {
            serviceName: $t("serviceName.omochikaeri"),
          })
        }}
      </div>
      <div class="mt-4">
        {{ $t("aboutService.paragraph3") }}
      </div>
      <div v-if="$t('aboutService.sincerely')" class="mt-4">
        {{ $t("aboutService.sincerely") }}
      </div>

      <!-- Profile -->
      <div class="mt-4 inline-flex items-center">
        <img src="/Profile-SNakajima.jpg" alt="" class="w-16 rounded-full" />
        <div class="ml-4">
          {{ $t("aboutService.profileName") }}<br />{{
            $t("aboutService.profileTitle")
          }}
        </div>
      </div>
    </div>
  </div>
</template>
