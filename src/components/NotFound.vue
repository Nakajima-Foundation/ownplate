<template>
  <div>
    <div
      style="position: absolute; left: 50%; top: 50%; width: 320px; height: 192px; margin-left: -160px;  margin-top: -96px;"
    >
      <div class="align-center">
        <img src="@/assets/404_logo.svg" />
      </div>
      <div class="align-center t-subtitle2 c-text-black-disabled m-t-24">
        <div>{{ $t("errorPage.notFound.message1") }}</div>
        <div>{{ $t("errorPage.notFound.message2") }}</div>
      </div>
    </div>
  </div>
</template>
