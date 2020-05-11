<template>
<div>
  <div class="notFoundPage">
    <p>
      <img src="@/assets/404_logo.svg" class="image" />
    </p>
  </div>
  <div class="notFoundPageText">
      {{$t('errorPage.notFound.message1')}}<br />
      {{$t('errorPage.notFound.message2')}}<br />

  </div>
</div>
</template>

<style lang="scss" scoped>
.notFoundPageText {
  text-align: center;
  margin-bottom: 80px;
  font-size: 1.5rem;
}
.image {
  width: 50%;
  margin: auto;
  margin-top: 150px;
  margin-bottom: 80px;
}
.notFoundPage {
  margin: auto;
}
</style>
