<template>
  <div
       class="fixed top-0 left-0 z-50 flex h-screen w-screen items-center justify-center bg-black bg-opacity-50"
       >
    <div
      class="max-h-full overflow-y-scroll rounded-xl bg-white text-left shadow sm:max-w-lg"
      @click.stop
      >
      <slot />
    </div>
  </div>
</template>
