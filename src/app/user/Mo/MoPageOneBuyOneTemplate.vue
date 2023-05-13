<template>
  <div>
    <div class="bg-blue-300">
      買うと
      <slot name="header"></slot>
    </div>
    <slot name="menu"></slot>
    <div class="bg-red-300">
      もらえる
      <slot name="footer"></slot>
    </div>
  </div>
</template>
