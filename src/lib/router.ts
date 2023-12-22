import { createRouter, createWebHistory } from "vue-router";

const getUserPages = (prefix: string) => {
  return [
    {
      path: "",
      component: import("@/app/user/RestaurantPage.vue"),
      children: [
        {
          name: "r-restaurant-Page_" + prefix,
          path: "",
          component: import("@/app/user/Blank.vue"),
        },
        {
          name: "r-restaurant-Menu_" + prefix,
          path: "menus/:menuId",
          component: import("@/app/user/Blank.vue"),
        },
        {
          path: "transactions-act",
          component: import("@/app/user/Blank.vue"),
          meta: {
            isTransactionsAct: true,
          },
        },
      ],
    },
    {
      name: "r-restaurantId-order_" + prefix,
      path: "order/:orderId",
      component: import("@/app/user/OrderPage.vue"),
    },
  ];
};

interface CustomRoute {
  name?: string;
  path: string;
  component: Promise<any>;
  children?: CustomRoute[];
  meta?: any;
}

export const customRoutes: CustomRoute[] = [
  {
    name: "home",
    path: "/home",
    component: import("@/app/home/User.vue"),
  },
  {
    name: "top",
    path: "/",
    component: import("@/app/top.vue"),
  },
  {
    name: "r",
    path: "/r",
    component: import("@/app/user/RootPage.vue"),
  },
  {
    name: "news",
    path: "/news",
    component: import("@/app/user/News.vue"),
  },
  {
    name: "faq",
    path: "/faq",
    component: import("@/app/user/FAQ.vue"),
  },
  {
    name: "RestaurantsAll",
    path: "/r/area/all",
    component: import("@/app/user/Restaurants/All.vue"),
  },
  {
    name: "RestaurantsArea",
    path: "/r/area/:areaId",
    component: import("@/app/user/Restaurants/Area.vue"),
  },
  {
    name: "favorites",
    path: "/r/favorites",
    component: import("@/app/user/Restaurants/Favorites.vue"),
  },
  {
    name: "history",
    path: "/u/history",
    component: import("@/app/user/OrderHistory.vue"),
  },
  {
    name: "profile",
    path: "/u/profile",
    component: import("@/app/user/Profile.vue"),
  },
  {
    path: "/u/discounthistory",
    component: import("@/app/user/DiscountHistory.vue"),
  },
  {
    name: "address",
    path: "/u/address",
    component: import("@/app/user/Address.vue"),
  },
  {
    name: "terms-admin",
    path: "/terms/admin",
    component: import("@/app/common/TermsAdmin.vue"),
  },
  {
    name: "terms-user",
    path: "/terms/user",
    component: import("@/app/common/TermsUser.vue"),
  },
  {
    name: "privacy",
    path: "/privacy",
    component: import("@/app/common/Privacy.vue"),
  },
  {
    path: "/op",
    component: import("@/app/operator/Index.vue"),
  },
  {
    path: "/op/orders",
    component: import("@/app/super/AllOrders.vue"),
  },
  {
    path: "/op/restaurants",
    component: import("@/app/super/AllRestaurants.vue"),
  },
  {
    name: "ownerPage",
    path: "/o/:ownerUid",
    component: import("@/app/user/RestaurantIndex.vue"),
  },
  {
    path: "/r/:restaurantId",
    component: import("@/app/user/RestaurantWrapper.vue"),
    children: getUserPages("normal"),
  },
  {
    path: "/liff/:liffIndexId/pc",
    component: import("@/app/liff/PC.vue"),
  },
  {
    path: "/liff/:liffIndexId",
    component: import("@/app/liff/LiffWrapper.vue"),
    children: [
      {
        path: "",
        component: import("@/app/liff/Index.vue"),
      },
      {
        path: "r/:restaurantId",
        component: import("@/app/user/RestaurantWrapper.vue"),
        children: getUserPages("liff"),
      },
      {
        name: "liffHistory",
        path: "u/history",
        component: import("@/app/user/OrderHistory.vue"),
      },
      {
        name: "liffProfile",
        path: "u/profile",
        component: import("@/app/user/Profile.vue"),
      },
      {
        path: "u/discounthistory",
        component: import("@/app/user/DiscountHistory.vue"),
      },
      {
        name: "liff-terms-user",
        path: "terms/user",
        component: import("@/app/common/TermsUser.vue"),
      },
      {
        name: "liff-privacy",
        path: "privacy",
        component: import("@/app/common/Privacy.vue"),
      },
    ],
  },
  {
    component: import("@/app/admin/Wrapper.vue"),
    path: "/admin",
    children: [
      {
        path: "restaurants",
        component: import("@/app/admin/Index.vue"),
      },
      {
        path: "restaurants/:restaurantId",
        component: import("@/app/admin/Restaurants/Wrapper.vue"),
        children: [
          {
            path: "",
            component: import("@/app/admin/Restaurants/Index.vue"),
          },
          {
            name: "admin-pdf",
            path: "pdf",
            component: import("@/app/admin/Restaurants/Pdf.vue"),
          },
          {
            name: "admin-menus",
            path: "menus",
            component: import("@/app/admin/Restaurants/MenuListPage.vue"),
          },
          {
            name: "admin-menus-item",
            path: "menus/:menuId",
            component: import("@/app/admin/Restaurants/MenuItemPage.vue"),
          },
          {
            name: "admin-orders",
            path: "orders",
            component: import("@/app/admin/Restaurants/OrderListPage.vue"),
          },
          {
            path: "history",
            component: import("@/app/admin/Restaurants/OrderHistory.vue"),
          },
          {
            name: "admin-suspend",
            path: "suspend",
            component: import("@/app/admin/Restaurants/OrderSuspendPage.vue"),
          },
          {
            name: "admin-order-info",
            path: "orders/:orderId",
            component: import("@/app/admin/Restaurants/OrderInfoPage.vue"),
          },
          {
            name: "user-histories",
            path: "userhistory/:userId",
            component: import("@/app/admin/Restaurants/UserHistory.vue"),
          },
          {
            path: "analytics/index",
            component: import("@/app/admin/Restaurants/Analytics/Index.vue"),
          },
          {
            path: "linelist",
            component: import("@/app/admin/Restaurants/ManageLine.vue"),
          },
          {
            path: "line",
            component: import("@/app/admin/Restaurants/Line/Index.vue"),
          },
          {
            path: "lineusers",
            component: import("@/app/admin/Restaurants/Line/users.vue"),
          },
          {
            path: "postage",
            component: import("@/app/admin/Restaurants/Postage.vue"),
          },
          {
            path: "delivery",
            component: import("@/app/admin/Restaurants/Delivery.vue"),
          },
          {
            path: "discounthistory",
            component: import("@/app/admin/Restaurants/Discount/DiscountHistory.vue"),
          },
          {
            path: "discounts",
            component: import("@/app/admin/Restaurants/Discount/Discounts.vue"),
          },
          {
            path: "discounts/:discountId",
            component: import("@/app/admin/Restaurants/Discount/Discount.vue"),
          },
          {
            path: "discounts/:discountId/history",
            component: import("@/app/admin/Restaurants/Discount/DiscountHistory.vue"),
          },
          {
            path: "printer",
            component: import("@/app/admin/Restaurants/Printer.vue"),
          },
          {
            path: "report",
            component: import("@/app/admin/Restaurants/ReportPage.vue"),
          },
        ],
      },
      {
        name: "admin-orders-allorders",
        path: "orders",
        component: import("@/app/admin/AllOrders.vue"),
      },
      {
        name: "admin-subaccounts-accounts",
        path: "subaccounts",
        component: import("@/app/admin/SubAccounts/Accounts.vue"),
      },
      {
        name: "admin-subaccounts-account",
        path: "subaccounts/accounts/:subAccountId",
        component: import("@/app/admin/SubAccounts/Account.vue"),
      },
      {
        name: "admin-smaregi-index",
        path: "smaregi/index",
        component: import("@/app/admin/Smaregi/Index.vue"),
      },
      {
        name: "admin-smaregi-callback",
        path: "smaregi/callback",
        component: import("@/app/admin/Smaregi/Callback.vue"),
      },
      {
        name: "admin-smaregi-store",
        path: "smaregi/store/:storeId",
        component: import("@/app/admin/Smaregi/Store.vue"),
      },
    ],
  },
  {
    name: "admin-news-list",
    path: "/admin/news",
    component: import("@/app/admin/News/List.vue"),
  },
  {
    name: "admin-faq",
    path: "/admin/faq",
    component: import("@/app/admin/FAQ.vue"),
  },
  {
    name: "admin-docs",
    path: "/admin/docs",
    component: import("@/app/admin/Docs/Index.vue"),
  },
  {
    name: "admin-articles",
    path: "/admin/docs/articles/:articleId",
    component: import("@/app/admin/Docs/Article.vue"),
  },
  {
    name: "admin-featureList",
    path: "/admin/docs/features",
    component: import("@/app/admin/Docs/features.vue"),
  },
  {
    name: "admin-news-article",
    path: "/admin/news/:newsId",
    component: import("@/app/admin/News/Article.vue"),
  },
  {
    name: "admin-signin",
    path: "/admin/user/signin",
    component: import("@/app/auth/SignInPage.vue"),
  },
  {
    name: "admin-signup",
    path: "/admin/user/signup",
    component: import("@/app/auth/SignUpPage.vue"),
  },
  {
    name: "admin-signup-partner",
    path: "/admin/user/signup/:partner",
    component: import("@/app/auth/SignUpPage.vue"),
  },
  {
    name: "admin-reset",
    path: "/admin/user/reset",
    component: import("@/app/auth/ResetPasswordPage.vue"),
  },
  {
    name: "admin-email-action",
    path: "/admin/user/action",
    component: import("@/app/auth/Action.vue"),
  },
  {
    path: "/s",
    component: import("@/app/super/Index.vue"),
  },
  {
    path: "/s/orders",
    component: import("@/app/super/AllOrders.vue"),
  },
  {
    path: "/s/restaurants",
    component: import("@/app/super/AllRestaurants.vue"),
  },
  {
    path: "/s/restaurants/:restaurantId",
    component: import("@/app/super/Restaurants.vue"),
  },
  {
    path: "/s/admins",
    component: import("@/app/super/AllAdmins.vue"),
  },
  {
    path: "/s/logs",
    component: import("@/app/super/AllLogs.vue"),
  },
  {
    path: "/s/phonelogs",
    component: import("@/app/super/AllPhoneLogs.vue"),
  },
  {
    path: "/s/profiles",
    component: import("@/app/super/Profiles.vue"),
  },
  {
    path: "/s/admins/:adminId",
    component: import("@/app/super/AdminInfo.vue"),
  },
  {
    path: "/s/requests",
    component: import("@/app/super/AllRequests.vue"),
  },
  {
    path: "/s/callbacks",
    component: import("@/app/super/AllStripeCallback.vue"),
  },
  {
    path: "/s/favorites",
    component: import("@/app/super/AllFavorites.vue"),
  },
  {
    path: "/s/callbacks/:uid/:logId",
    component: import("@/app/super/StripeCallback.vue"),
  },
  {
    path: "/s/partners",
    component: import("@/app/super/Partner.vue"),
  },
  {
    path: "/callback/line",
    component: import("@/app/auth/LineCallback.vue"),
  },
  {
    path: "/callback/:restaurantId/line",
    component: import("@/app/auth/LineCallback.vue"),
  },
  {
    path: "/l/:urlKey",
    component: import("@/app/docs/link.vue"),
  },
  {
    path: "/:page(.*)",
    component: import("@/app/common/404.vue"),
  },
];

const loadComponent = (data: CustomRoute): any => {
  if (data.children) {
    return {
      path: data.path,
      component: data.component,
      children: data.children.map((child: CustomRoute) => {
        return loadComponent(child);
      }),
    };
  }

  return {
    path: data.path,
    name: data.name,
    component: data.component,
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
