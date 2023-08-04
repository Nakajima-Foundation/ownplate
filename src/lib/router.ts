import { createRouter, createWebHistory } from "vue-router";

import { mo_prefixes } from "@/config/project";

const getUserPages = (prefix: string) => {
  return [
    {
      path: "",
      component: "user/RestaurantPage.vue",
      children: [
        {
          name: "r-restaurant-Page_" + prefix,
          path: "",
          component: "user/Blank.vue",
        },
        {
          name: "r-restaurant-Menu_" + prefix,
          path: "menus/:menuId",
          component: "user/Blank.vue",
        },
        {
          path: "transactions-act",
          component: "user/Blank.vue",
          meta: {
            isTransactionsAct: true,
          },
        },
      ],
    },
    {
      name: "r-restaurantId-order_" + prefix,
      path: "order/:orderId",
      component: "user/OrderPage.vue",
    },
  ];
};

const getUserPagesWithCat = (prefix: string) => {
  return [
    {
      path: "",
      component: "user/RestaurantPage.vue",
      children: [
        {
          name: "r-restaurant-Page_" + prefix,
          path: "",
          component: "user/Blank.vue",
        },
        {
          name: "r-restaurant-Cats_" + prefix,
          path: ":list(categories)/:state(takeout|pickup)",
          component: "user/Blank.vue",
        },
        {
          name: "r-restaurant-SubCats_" + prefix,
          path: ":list(category)/:category/:state(takeout|pickup)",
          component: "user/Blank.vue",
        },
        {
          name: "r-restaurant-SubCats2_" + prefix,
          path: ":list(category)/:category/:selectedSubCategory/:state(takeout|pickup)",
          component: "user/Blank.vue",
        },
        {
          name: "r-restaurant-Cat_" + prefix,
          path: "cat/:category/:subCategory/:state(takeout|pickup)?",
          component: "user/Blank.vue",
        },
        {
          name: "r-restaurant-Menu_" + prefix,
          path: "cat/:category/:subCategory/menus/:menuId",
          component: "user/Blank.vue",
        },
        {
          path: "transactions-act",
          component: "user/Blank.vue",
          meta: {
            isTransactionsAct: true,
          },
        },
      ],
    },
    {
      name: "r-restaurantId-order_" + prefix,
      path: "order/:orderId",
      component: "user/OrderPage.vue",
    },
  ];
};

interface CustomRoute {
  name?: string;
  path: string;
  component: string;
  children?: CustomRoute[];
  meta?: any;
}

const mopath2 =  mo_prefixes
  .map((prefix) => {
    const prePath = "/" + prefix;
    return [
      {
        path: prePath,
        component: "user/MoWrapper.vue",
        children: [
          {
            path: prePath + "/*",
            component: "user/Mo/MoClosed.vue",
          }
        ]
      }
    ]
  }).flat();

const mopath = mo_prefixes
  .map((prefix) => {
    const prePath = "/" + prefix;
    return [
      {
        path: prePath,
        component: "user/MoWrapper.vue",
        children: [
          {
            path: prePath,
            component: "user/MoIndex.vue",
          },
          {
            path: prePath + "/outage",
            component: "user/Outage.vue",
          },
          {
            path: prePath + "/closed",
            component: "user/Mo/MoClosed.vue",
          },
          {
            path: prePath + "/r/:restaurantId",
            component: "user/RestaurantWrapper.vue",
            children: getUserPagesWithCat(prefix),
          },
          {
            path: prePath + "/u/discounthistory",
            component: "user/DiscountHistory.vue",
          },
          {
            path: prePath + "/terms",
            component: "common/TermsUser.vue",
          },
          {
            path: prePath + "/privacy",
            component: "common/Privacy.vue",
          },
          {
            path: prePath + "/faq",
            component: "common/FAQMo.vue",
          },
        ],
      },
    ];
  })
  .flat();

export const customRoutes: CustomRoute[] = [
  {
    name: "top",
    path: "/",
    component: "top.vue",
  },
  {
    name: "r",
    path: "/r",
    component: "user/RootPage.vue",
  },
  {
    name: "news",
    path: "/news",
    component: "user/News.vue",
  },
  {
    name: "faq",
    path: "/faq",
    component: "user/FAQ.vue",
  },
  {
    name: "RestaurantsAll",
    path: "/r/area/all",
    component: "user/Restaurants/All.vue",
  },
  {
    name: "RestaurantsArea",
    path: "/r/area/:areaId",
    component: "user/Restaurants/Area.vue",
  },
  {
    name: "favorites",
    path: "/r/favorites",
    component: "user/Restaurants/Favorites.vue",
  },
  {
    name: "history",
    path: "/u/history",
    component: "user/OrderHistory.vue",
  },
  {
    name: "profile",
    path: "/u/profile",
    component: "user/Profile.vue",
  },
  {
    path: "/u/discounthistory",
    component: "user/DiscountHistory.vue",
  },
  {
    name: "address",
    path: "/u/address",
    component: "user/Address.vue",
  },
  {
    name: "terms-admin",
    path: "/terms/admin",
    component: "common/TermsAdmin.vue",
  },
  {
    name: "terms-user",
    path: "/terms/user",
    component: "common/TermsUser.vue",
  },
  {
    name: "privacy",
    path: "/privacy",
    component: "common/Privacy.vue",
  },
  {
    path: "/op",
    component: "operator/Index.vue",
  },
  {
    path: "/op/orders",
    component: "super/AllOrders.vue",
  },
  {
    path: "/op/restaurants",
    component: "super/AllRestaurants.vue",
  },
  {
    name: "ownerPage",
    path: "/o/:ownerUid",
    component: "user/RestaurantIndex.vue",
  },
  {
    path: "/r/:restaurantId",
    component: "user/RestaurantWrapper.vue",
    children: getUserPages("normal"),
  },
  ...mopath,
  {
    path: "/liff/:liffIndexId/pc",
    component: "liff/PC.vue",
  },
  {
    path: "/liff/:liffIndexId",
    component: "liff/LiffWrapper.vue",
    children: [
      {
        path: "",
        component: "liff/Index.vue",
      },
      {
        path: "r/:restaurantId",
        component: "user/RestaurantWrapper.vue",
        children: getUserPages("liff"),
      },
      {
        name: "liffHistory",
        path: "u/history",
        component: "user/OrderHistory.vue",
      },
      {
        name: "liffProfile",
        path: "u/profile",
        component: "user/Profile.vue",
      },
      {
        path: "u/discounthistory",
        component: "user/DiscountHistory.vue",
      },
      {
        name: "liff-terms-user",
        path: "terms/user",
        component: "common/TermsUser.vue",
      },
      {
        name: "liff-privacy",
        path: "privacy",
        component: "common/Privacy.vue",
      },
    ],
  },
  {
    component: "admin/Wrapper.vue",
    path: "/admin",
    children: [
      {
        path: "restaurants",
        component: "admin/Index.vue",
      },
      {
        path: "restaurants/:restaurantId",
        component: "admin/Layout.vue",
        children: [
          {
            path: "",
            component: "admin/RestaurantPage.vue",
          },
          {
            name: "admin-pdf",
            path: "pdf",
            component: "admin/Pdf.vue",
          },
          {
            name: "admin-menus",
            path: "menus",
            component: "admin/MenuListPage.vue",
          },
          {
            name: "admin-menus-cat",
            path: "menus/cat/:category/:subCategory",
            component: "admin/MenuListPage.vue",
          },
          {
            name: "admin-menus-item",
            path: "menus/:menuId",
            component: "admin/MenuItemPage.vue",
          },
          {
            name: "admin-orders",
            path: "orders",
            component: "admin/OrderListPage.vue",
          },
          {
            path: "history",
            component: "admin/OrderHistory.vue",
          },
          {
            name: "user-histories",
            path: "userhistory/:userId",
            component: "admin/UserHistory.vue",
          },
          {
            path: "analytics/index",
            component: "admin/Analytics/Index.vue",
          },
          {
            name: "admin-suspend",
            path: "suspend",
            component: "admin/OrderSuspendPage.vue",
          },
          {
            path: "postage",
            component: "admin/Postage.vue",
          },
          {
            path: "delivery",
            component: "admin/Delivery.vue",
          },
          {
            path: "line",
            component: "admin/ManageLine.vue",
          },
          {
            path: "discounthistory",
            component: "admin/Discount/DiscountHistory.vue",
          },
          {
            path: "discounts",
            component: "admin/Discount/Discounts.vue",
          },
          {
            path: "discounts/:discountId",
            component: "admin/Discount/Discount.vue",
          },
          {
            path: "discounts/:discountId/history",
            component: "admin/Discount/DiscountHistory.vue",
          },
          {
            path: "qrcode",
            component: "admin/QRCodePage.vue",
          },
          {
            path: "printer",
            component: "admin/Printer.vue",
          },
          {
            path: "report",
            component: "admin/ReportPage.vue",
          },
          {
            name: "admin-order-info",
            path: "orders/:orderId",
            component: "admin/OrderInfoPage.vue",
          },
        ],
      },
      {
        name: "admin-orders-allorders",
        path: "orders",
        component: "admin/AllOrders.vue",
      },
      {
        path: "discounthistory",
        component: "admin/Discount/DiscountHistory.vue",
      },
      {
        path: "discounts",
        component: "admin/Discount/Discounts.vue",
      },
      {
        path: "discounts/:discountId",
        component: "admin/Discount/Discount.vue",
      },
      {
        path: "discounts/:discountId/history",
        component: "admin/Discount/DiscountHistory.vue",
      },
      {
        path: "report",
        component: "admin/ReportAllPage.vue",
      },
      {
        name: "admin-subaccounts-accounts",
        path: "subaccounts",
        component: "admin/SubAccounts/Accounts.vue",
      },
      {
        name: "admin-subaccounts-account",
        path: "subaccounts/accounts/:subAccountId",
        component: "admin/SubAccounts/Account.vue",
      },
      {
        name: "admin-smaregi-index",
        path: "smaregi/index",
        component: "admin/Smaregi/Index.vue",
      },
      {
        name: "admin-smaregi-callback",
        path: "smaregi/callback",
        component: "admin/Smaregi/Callback.vue",
      },
      {
        name: "admin-smaregi-store",
        path: "smaregi/store/:storeId",
        component: "admin/Smaregi/Store.vue",
      },
    ],
  },
  {
    name: "admin-news-list",
    path: "/admin/news",
    component: "admin/News/List.vue",
  },
  {
    name: "admin-faq",
    path: "/admin/faq",
    component: "admin/FAQ.vue",
  },
  {
    name: "admin-news-article",
    path: "/admin/news/:newsId",
    component: "admin/News/Article.vue",
  },
  {
    name: "admin-signin",
    path: "/admin/user/signin",
    component: "auth/SignInPage.vue",
  },
  {
    name: "admin-signup",
    path: "/admin/user/signup",
    component: "auth/SignUpPage.vue",
  },
  {
    name: "admin-signup-partner",
    path: "/admin/user/signup/:partner",
    component: "auth/SignUpPage.vue",
  },
  {
    name: "admin-reset",
    path: "/admin/user/reset",
    component: "auth/ResetPasswordPage.vue",
  },
  {
    name: "admin-email-action",
    path: "/admin/user/action",
    component: "auth/Action.vue",
  },
  {
    path: "/s",
    component: "super/Index.vue",
  },
  {
    path: "/s/orders",
    component: "super/AllOrders.vue",
  },
  {
    path: "/s/restaurants",
    component: "super/AllRestaurants.vue",
  },
  {
    path: "/s/restaurants/:restaurantId",
    component: "super/Restaurants.vue",
  },
  {
    path: "/s/admins",
    component: "super/AllAdmins.vue",
  },
  {
    path: "/s/logs",
    component: "super/AllLogs.vue",
  },
  {
    path: "/s/phonelogs",
    component: "super/AllPhoneLogs.vue",
  },
  {
    path: "/s/profiles",
    component: "super/Profiles.vue",
  },
  {
    path: "/s/admins/:adminId",
    component: "super/AdminInfo.vue",
  },
  {
    path: "/s/requests",
    component: "super/AllRequests.vue",
  },
  {
    path: "/s/callbacks",
    component: "super/AllStripeCallback.vue",
  },
  {
    path: "/s/favorites",
    component: "super/AllFavorites.vue",
  },
  {
    path: "/s/callbacks/:uid/:logId",
    component: "super/StripeCallback.vue",
  },
  {
    path: "/s/partners",
    component: "super/Partner.vue",
  },
  {
    path: "/callback/line",
    component: "auth/LineCallback.vue",
  },
  {
    path: "/l/:urlKey",
    component: "docs/link.vue",
  },
  {
    path: "/:page(.*)",
    component: "common/404.vue",
  },
];

//const loadComponent = (data: CustomRoute): RouteConfig => {
const loadComponent = (data: CustomRoute): any  => {
  const component = () => import("@/app/" + data.component);
  //
  if (data.children) {
    return {
      path: data.path,
      component,
      children: data.children.map((child: CustomRoute) => {
        return loadComponent(child);
      }),
    };
  }

  return {
    path: data.path,
    name: data.name,
    component,
    meta: data.meta,
  };
};

const routes = customRoutes.map(loadComponent);

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  // base: "/",
  routes,
});

export default router;
