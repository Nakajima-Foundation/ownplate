<template>
  <div class="mx-6 mt-6 text-center lg:grid lg:grid-cols-3 lg:gap-4">
    <!-- For Restaurants -->
    <div class="bg-op-teal rounded-lg pt-6 lg:col-span-2">
      <i class="material-icons text-7xl opacity-60">store</i>
      <div class="text-white text-sm font-bold">
        飲食店の方はこちら
      </div>
      <div class="pb-4 lg:inline-flex lg:space-x-8">
        <!-- Go to Restaurant Admin Page -->
        <div class="mt-4">
          <router-link to="/admin/restaurants">
            <div
              class="h-16 rounded-full bg-white inline-flex items-center px-8 shadow"
            >
              <span class="text-black opacity-60 text-xl font-bold"
                >ご利用を開始</span
              >
            </div>
          </router-link>
        </div>
        <!-- Go to Contact Page -->
        <div class="mt-4">
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSfGR4kk65ynfkCRGJsvJz01HZf7AU1nGLL9Rn9i4G9-qiW6MQ/viewform"
            target="_blank"
          >
            <div
              class="h-16 rounded-full bg-op-yellow inline-flex items-center px-8 shadow"
            >
              <span class="text-black opacity-60 text-xl font-bold"
                >お問い合わせ</span
              >
            </div>
          </a>
        </div>
      </div>
      <!-- Go to Samples -->
      <div class="bg-black bg-opacity-10 rounded-b-lg py-4">
        <div class="lg:inline-flex lg:items-center lg:space-x-4">
          <div class="text-white text-sm font-bold mb-2 lg:mb-0">
            サンプルの店舗を見る
          </div>
          <div class="inline-flex items-center space-x-4">
            <a
              href="https://omochikaeri.com/r/bYArBMUJBe4KdVzZijLH"
              class="inline-flex items-center h-10 rounded-full bg-white bg-opacity-20 px-4 hover:bg-opacity-30"
            >
              <span class="text-white text-sm font-bold">居酒屋</span>
            </a>
            <a
              href="https://omochikaeri.com/r/wwCgtIEZQo6QnXRyxYYS"
              class="inline-flex items-center h-10 rounded-full bg-white bg-opacity-20 px-4 hover:bg-opacity-30"
            >
              <span class="text-white text-sm font-bold">パティスリー</span>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- For Food Lovers -->
    <div class="bg-white rounded-lg p-6 mt-4 lg:mt-0">
      <i class="material-icons text-7xl opacity-60">local_mall</i>
      <div class="text-black opacity-60 text-sm font-bold">
        テイクアウトご利用のお客様はこちら
      </div>
      <!-- Go to Restaurants List -->
      <div class="mt-4">
        <router-link to="/r">
          <div
            class="h-12 rounded-full bg-op-teal inline-flex items-center px-8 shadow"
          >
            <span class="text-white text-base font-bold"
              >テイクアウトのお店を探す</span
            >
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {};
</script>
