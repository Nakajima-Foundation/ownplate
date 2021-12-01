import { createRouter, createWebHistory } from "vue-router";

const customRoutes = [
  {
    name: "lp",
    path: "/",
    component: "home/Lp.vue"
  },
  {
    name: "r",
    path: "/r",
    component: "user/RootPage.vue"
  },
  {
    name: "news",
    path: "/news",
    component: "user/News.vue"
  },
  {
    name: "RestaurantsAll",
    path: "/r/area/all",
    component: "user/Restaurants/All.vue"
  },
  {
    name: "RestaurantsArea",
    path: "/r/area/:areaId",
    component: "user/Restaurants/Area.vue"
  },
  {
    name: "favorites",
    path: "/r/favorites",
    component: "user/Restaurants/Favorites.vue"
  },
  {
    name: "history",
    path: "/u/history",
    component: "user/OrderHistory.vue"
  },
  {
    name: "profile",
    path: "/u/profile",
    component: "user/Profile.vue"
  },
  {
    name: "terms-admin",
    path: "/terms/admin",
    component: "common/TermsAdmin.vue"
  },
  {
    name: "terms-user",
    path: "/terms/user",
    component: "common/TermsUser.vue"
  },
  {
    name: "privacy",
    path: "/privacy",
    component: "common/Privacy.vue"
  },
  {
    path: "/op",
    component: "operator/Index.vue"
  },
  {
    path: "/op/orders",
    component: "super/AllOrders.vue"
  },
  {
    path: "/op/restaurants",
    component: "super/AllRestaurants.vue"
  },
  {
    name: "ownerPage",
    path: "/o/:ownerUid",
    component: "user/RestaurantIndex.vue"
  },
  {
    path: "/r/:restaurantId",
    component: "user/RestaurantPage.vue",
    children: [
      {
        name: "r-restaurant-Page",
        path: "",
        component: "user/Blank.vue",
      },
      {
        name: "r-restaurant-Menu",
        path: "menus/:menuId",
        component: "user/Blank.vue",
      }
    ]
  },
  {
    name: "r-restaurantId-order",
    path: "/r/:restaurantId/order/:orderId",
    component: "user/OrderPage.vue"
  },
  {
    name: "r-restaurantId-transactionsAct",
    path: "/r/:restaurantId/transactionsAct",
    component: "user/TransactionsAct.vue"
  },
  {
    name: "adminOwner",
    path: "/admin/owner",
    component: "admin/Owner.vue"
  },
  {
    name: "admin",
    path: "/admin/restaurants",
    component: "admin/Index.vue"
  },
  {
    path: "/admin/restaurants/:restaurantId",
    component: "admin/Layout.vue",
    children: [
      {
        name: "admin-about",
        path: "",
        component: "admin/RestaurantPage.vue"
      },
      {
        name: "admin-pdf",
        path: "pdf",
        component: "admin/Pdf.vue"
      },
      {
        name: "admin-menus",
        path: "menus",
        component: "admin/MenuListPage.vue"
      },
      {
        name: "admin-menus-item",
        path: "menus/:menuId",
        component: "admin/MenuItemPage.vue"
      },
      {
        name: "admin-orders",
        path: "orders",
        component: "admin/OrderListPage.vue"
      },
      {
        path: "history",
        component: "admin/OrderHistory.vue"
      },
      {
        name: "user-histories",
        path: "userhistory/:userId",
        component: "admin/UserHistory.vue"
      },
      {
        name: "admin-suspend",
        path: "suspend",
        component: "admin/OrderSuspendPage.vue"
      },
      {
        path: "line",
        component: "admin/ManageLine.vue"
      },
      {
        path: "traces",
        component: "admin/TraceList.vue"
      },
      {
        path: "qrcode",
        component: "admin/QRCodePage.vue"
      },
      {
        path: "report",
        component: "admin/ReportPage.vue"
      },
      {
        name: "admin-order-info",
        path: "orders/:orderId",
        component: "admin/OrderInfoPage.vue"
      }
    ]
  },
  {
    name: "admin-orders-allorders",
    path: "/admin/orders",
    component: "admin/AllOrders.vue"
  },
  {
    name: "admin-subaccounts-accounts",
    path: "/admin/subaccounts",
    component: "admin/SubAccounts/Accounts.vue"
  },
  {
    name: "admin-subaccounts-accounts-account",
    path: "/admin/subaccounts/accounts/:subAccountId",
    component: "admin/SubAccounts/Account.vue"
  },
  {
    name: "admin-smaregi-index",
    path: "/admin/smaregi/index",
    component: "admin/Smaregi/Index.vue"
  },
  {
    name: "admin-smaregi-callback",
    path: "/admin/smaregi/callback",
    component: "admin/Smaregi/Callback.vue"
  },
  {
    name: "admin-smaregi-store",
    path: "/admin/smaregi/store/:storeId",
    component: "admin/Smaregi/Store.vue"
  },
  {
    name: "admin-news-list",
    path: "/admin/news",
    component: "admin/News/List.vue"
  },
  {
    name: "admin-news-article",
    path: "/admin/news/:newsId",
    component: "admin/News/Article.vue"
  },
  {
    name: "admin-signin",
    path: "/admin/user/signin",
    component: "auth/SignInPage.vue"
  },
  {
    name: "admin-signup",
    path: "/admin/user/signup",
    component: "auth/SignUpPage.vue"
  },
  {
    name: "admin-signup-partner",
    path: "/admin/user/signup/:partner",
    component: "auth/SignUpPage.vue"
  },
  {
    name: "admin-reset",
    path: "/admin/user/reset",
    component: "auth/ResetPasswordPage.vue"
  },
  {
    path: "/s",
    component: "super/Index.vue"
  },
  {
    path: "/s/orders",
    component: "super/AllOrders.vue"
  },
  {
    path: "/s/restaurants",
    component: "super/AllRestaurants.vue"
  },
  {
    path: "/s/restaurants/:restaurantId",
    component: "super/Restaurants.vue"
  },
  {
    path: "/s/admins",
    component: "super/AllAdmins.vue"
  },
  {
    path: "/s/logs",
    component: "super/AllLogs.vue"
  },
  {
    path: "/s/phonelogs",
    component: "super/AllPhoneLogs.vue"
  },
  {
    path: "/s/profiles",
    component: "super/Profiles.vue"
  },
  {
    path: "/s/admins/:adminId",
    component: "super/AdminInfo.vue"
  },
  {
    path: '/s/requests',
    component: 'super/AllRequests.vue'
  },
  {
    path: "/s/callbacks",
    component: "super/AllStripeCallback.vue"
  },
  {
    path: "/s/favorites",
    component: "super/AllFavorites.vue"
  },
  {
    path: "/s/callbacks/:uid/:logId",
    component: "super/StripeCallback.vue"
  },
  {
    path: "/s/partners",
    component: "super/Partner.vue"
  },
  {
    path: "/callback/line",
    component: "auth/LineCallback.vue"
  },
  {
    path: "/callback/track",
    component: "auth/TrackCallback.vue"
  },
  {
    path: "/t/:traceId",
    component: "trace/Record.vue"
  },
  {
    path: "/t",
    component: "trace/Record.vue"
  },
  {
    path: "/l/:urlKey",
    component: "docs/link.vue"
  },
  {
    path: "/:page(.*)",
    component: "common/404.vue"
  }
];

const loadComponent = (data) => {
  const component = () => import("@/app/" + data.component);
  // 
  if (data.children) {
    return {
      path: data.path,
      component,
      children: data.children.map((child) => {
        return loadComponent(child);
      }),
    };
  }

  return {
    path: data.path,
    name: data.name,
    component,
  };
}
const routes = customRoutes.map(loadComponent);

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
//  base: process.env.BASE_URL,
  routes,
});

export default router;
