<template>
  <div class="h-screen overflow-y-scroll">
    <div class="m-4 mt-6 rounded-lg bg-red-300 p-6 sm:max-w-7xl xl:mx-auto">
      <div class="mx-auto mb-8 max-w-md">
        <img
          src="https://mo-data-dev.omochikaeri.com/images/assets/logo_vertical.png"
          class="object-cover"
        />
      </div>

      <div v-for="(menu, k) in setMenus" :key="k">
        <div v-for="(m, j) in menu.menus" :key="j">
          <template v-if="menuObj[m.id]">
            <MoPageMenu
              :isSet="false"
              :menu="menuObj[m.id]"
              :mData="m"
              :orders="orders"
              @pushQuantities="pushQuantities"
              @pullQuantities="pullQuantities"
            />
            <hr />
          </template>
        </div>
      </div>
    </div>

    <!--ToDo 戻る遷移先をモーダルの商品カテゴリ一覧に-->
    <div class="m-4 mt-6 mb-12 sm:max-w-7xl xl:mx-auto">
      <router-link :to="pageBase"
        ><div
          class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
        >
          <i class="material-icons text-op-teal">list</i>
          <span class="ml-1 text-sm font-bold text-op-teal">
            {{ $t("shopInfo.productCategory") }}
          </span>
        </div></router-link
      >
    </div>
  </div>
</template>

<script lang="ts">
import { moPage } from "./MoPageCommon";

import MoPageMenu from "./MoPageMenu.vue";

const setMenus = [
  {
    id: "",
    setName: "",
    menus: [
      {
        id: "68dc4c052eb0b02bdd34258fbd21b86e46b44437",
        count: 2,
      },
      {
        id: "58b5197d27a96743a6405c5029fbce6d721d3beb",
        count: 3,
      },
      {
        id: "9a714af83e3aee2d5b779d9de5b9eb9c4361847d",
        count: 1,
      },
    ],
  },
];
export default moPage(setMenus);
</script>
