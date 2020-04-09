<template>
<div>
  <div class="notFoundPage">
    <p>
      <img src="@/assets/404_logo.svg" class="image" />
    </p>
  </div>
  <div class="notFoundPageText">
      The page you're looking for can't be found.<br />
      Try contacting the restaurant in other way
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
