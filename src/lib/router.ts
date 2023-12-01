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

interface CustomRoute {
  name?: string;
  path: string;
  component: string;
  children?: CustomRoute[];
  meta?: any;
}

const mopath = mo_prefixes
  .map((prefix) => {
    const prePath = "/" + prefix;
    return [
      {
        path: prePath,
        component: "user/Mo/MoClosed.vue",
      },
      {
        path: prePath + "/:page(.*)",
        component: "user/Mo/MoClosed.vue",
      },
    ];
  })
  .flat();

export const customRoutes: CustomRoute[] = [
  {
    name: "home",
    path: "/home",
    component: "home/User.vue",
  },
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
  // ...mopath,
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
        component: "admin/Restaurants/Wrapper.vue",
        children: [
          {
            path: "",
            component: "admin/Restaurants/Index.vue",
          },
          {
            name: "admin-pdf",
            path: "pdf",
            component: "admin/Restaurants/Pdf.vue",
          },
          {
            name: "admin-menus",
            path: "menus",
            component: "admin/Restaurants/MenuListPage.vue",
          },
          {
            name: "admin-menus-item",
            path: "menus/:menuId",
            component: "admin/Restaurants/MenuItemPage.vue",
          },
          {
            name: "admin-orders",
            path: "orders",
            component: "admin/Restaurants/OrderListPage.vue",
          },
          {
            path: "history",
            component: "admin/Restaurants/OrderHistory.vue",
          },
          {
            name: "admin-suspend",
            path: "suspend",
            component: "admin/Restaurants/OrderSuspendPage.vue",
          },
          {
            name: "admin-order-info",
            path: "orders/:orderId",
            component: "admin/Restaurants/OrderInfoPage.vue",
          },
          {
            name: "user-histories",
            path: "userhistory/:userId",
            component: "admin/Restaurants/UserHistory.vue",
          },
          {
            path: "analytics/index",
            component: "admin/Restaurants/Analytics/Index.vue",
          },
          {
            path: "linelist",
            component: "admin/Restaurants/ManageLine.vue",
          },
          {
            path: "line",
            component: "admin/Restaurants/Line/Index.vue",
          },
          {
            path: "lineusers",
            component: "admin/Restaurants/Line/users.vue",
          },
          {
            path: "postage",
            component: "admin/Restaurants/Postage.vue",
          },
          {
            path: "delivery",
            component: "admin/Restaurants/Delivery.vue",
          },
          {
            path: "discounthistory",
            component: "admin/Restaurants/Discount/DiscountHistory.vue",
          },
          {
            path: "discounts",
            component: "admin/Restaurants/Discount/Discounts.vue",
          },
          {
            path: "discounts/:discountId",
            component: "admin/Restaurants/Discount/Discount.vue",
          },
          {
            path: "discounts/:discountId/history",
            component: "admin/Restaurants/Discount/DiscountHistory.vue",
          },
          {
            path: "printer",
            component: "admin/Restaurants/Printer.vue",
          },
          {
            path: "report",
            component: "admin/Restaurants/ReportPage.vue",
          },
        ],
      },
      {
        name: "admin-orders-allorders",
        path: "orders",
        component: "admin/AllOrders.vue",
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
    name: "admin-docs",
    path: "/admin/docs",
    component: "admin/Docs/Index.vue",
  },
  {
    name: "admin-articles",
    path: "/admin/docs/articles/:articleId",
    component: "admin/Docs/Article.vue",
  },
  {
    name: "admin-featureList",
    path: "/admin/docs/features",
    component: "admin/Docs/features.vue",
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
    path: "/callback/:restaurantId/line",
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
const loadComponent = (data: CustomRoute): any => {
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
