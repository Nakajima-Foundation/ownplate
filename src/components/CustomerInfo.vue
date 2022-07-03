<template>
  <div>
    <div class="text-xl font-bold text-green-600 text-center">
      {{ $t("order.ec.customerInfo") }}
    </div>
    <div class="bg-white rounded-lg shadow p-4 mt-2">
      <div class="text-base font-bold">{{ $t("order.ec.zip") }}</div>
      <div class="mb-2">
        {{ customer.zip }}
      </div>
      <div class="text-base font-bold">{{ $t("order.ec.address") }}</div>
      <div class="mb-2">{{ customer.prefecture }}{{ customer.address }}</div>
      <div class="text-base font-bold">{{ $t("order.ec.name") }}</div>
      <div class="mb-2">
        {{ customer.name }}
      </div>
      <template v-if="customer.email">
        <div class="text-base font-bold">{{ $t("order.ec.email") }}</div>
        <div class="mb-2">
          {{ customer.email }}
        </div>
      </template>
      <template v-if="customer.location && shopInfo.location">
        <div class="text-base font-bold">
          {{ $t("delivery.deliveryLocation") }}
        </div>
        <div class="mb-2">
          <GMap
            :center="shopInfo.location"
            :options="{ fullscreenControl: false }"
            :zoom="15"
            style="height: 500px"
          >
            <GMapMarker
              :position="customer.location"
              :options="{
                icon: {
                  url: 'http://maps.google.co.jp/mapfiles/ms/icons/blue-dot.png',
                },
              }"
            />
            <GMapMarker
              :position="shopInfo.location"
              :options="{
                icon: {
                  url: 'http://maps.google.co.jp/mapfiles/ms/icons/restaurant.png',
                },
              }"
            />
          </GMap>
        </div>
      </template>
      <div class="text-base font-bold">{{ $t("order.ec.phone") }}</div>
      <div class="mb-2">
        {{ phoneNumber }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
    customer: {
      type: Object,
      required: false,
      default: {},
    },
    phoneNumber: {
      type: String,
      required: false,
    },
  },
};
</script>
