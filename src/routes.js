export const customRoutes = [
  {
    name: 'r',
    path: '/r',
    component: 'user/RootPage.vue',
  },
  {
    name: 'history',
    path: '/u/history',
    component: 'user/OrderHistory.vue',
  },
  {
    name: 'r-restaurantId',
    path: '/r/:restaurantId',
    component: 'user/RestaurantPage.vue',
  },
  {
    name: 'r-restaurantId-order',
    path: '/r/:restaurantId/order/:orderId',
    component: 'user/OrderPage.vue',
  },
  {
    name: 'admin',
    path: '/admin/restaurants',
    component: 'admin/OwnerPage.vue',
  },
  {
    name: 'admin-about',
    path: '/admin/restaurants/:restaurantId',
    component: 'admin/AboutPage.vue',
  },
  {
    name: 'admin-menus',
    path: '/admin/restaurants/:restaurantId/menus',
    component: 'admin/MenusPage.vue',
  },
  {
    name: 'admin-menus-item',
    path: '/admin/restaurants/:restaurantId/menus/:menuId',
    component: 'admin/MenuItemPage.vue',
  },
  {
    name: 'admin-orders',
    path: '/admin/restaurants/:restaurantId/orders',
    component: 'admin/OrderListPage.vue',
  },
  {
    name: 'admin-order-info',
    path: '/admin/restaurants/:restaurantId/orders/:orderId',
    component: 'admin/OrderInfoPage.vue',
  },
  {
    name: 'admin-signin',
    path: '/admin/user/signin',
    component: 'auth/SignInPage.vue',
  },
  {
    name: 'admin-signup',
    path: '/admin/user/signup',
    component: 'auth/SignUpPage.vue',
  },
  {
    name: 'admin-reset',
    path: '/admin/user/reset',
    component: 'auth/ResetPasswordPage.vue',
  },
  {
    path: '/s',
    component: 'super/SuperHome.vue'
  },
  {
    path: '/s/orders',
    component: 'super/AllOrders.vue'
  },
  {
    path: '/callback/line',
    component: 'auth/LineCallback.vue'
  },
  {
    path: '/callback/track',
    component: 'auth/TrackCallback.vue'
  },
  {
    path: '/t/record',
    component: 'auth/Record.vue'
  },
  {
    path: '*',
    component: 'common/404.vue'
  }
];
