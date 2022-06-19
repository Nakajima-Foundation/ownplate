<template>
  <!-- Notes -->
  <div class="mt-6">
    <div class="text-xl font-bold text-black text-opacity-40 mb-2">
      {{ $t("admin.notes.title") }}
    </div>

    <div
      class="border-2 border-solid border-black border-opacity-10 rounded-lg p-4"
    >
      <div>
        <div class="text-base font-bold text-black text-opacity-60 pb-2">
          {{ $t("admin.notes.userRestaurantsTitle") }}
        </div>
        <div class="text-base text-black text-opacity-60">
          {{ $t("admin.notes.userRestaurantsBody") }}
        </div>
      </div>

      <div
        class="border-t-2 border-solid border-black border-opacity-10 mt-4 pt-4"
      >
        <div class="text-base font-bold text-black text-opacity-60 pb-2">
          {{ $t("admin.notes.notificationSoundTitle") }}
        </div>
        <div class="text-base text-black text-opacity-60">
          {{ $t("admin.notes.notificationSoundBody") }}
        </div>
      </div>
    </div>
  </div>
</template>
