export const customRoutes = [
  {
    name: "r",
    path: "/r",
    component: "user/RootPage.vue"
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
    name: "r-restaurantId",
    path: "/r/:restaurantId",
    component: "user/RestaurantPage.vue"
  },
  {
    name: "r-restaurant-menu",
    path: "/r/:restaurantId/menus/:menuId",
    component: "user/RestaurantPage.vue"
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
        path: "/",
        component: "admin/RestaurantPage.vue"
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
    path: "/s/callbacks/:uid/:logId",
    component: "super/StripeCallback.vue"
  },
  {
    path: "/o",
    component: "operator/Index.vue"
  },
  {
    path: "/o/orders",
    component: "super/AllOrders.vue"
  },
  {
    path: "/o/restaurants",
    component: "super/AllRestaurants.vue"
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
    path: "*",
    component: "common/404.vue"
  }
];
