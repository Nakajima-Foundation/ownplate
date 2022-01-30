<template>
<div>
  <div class="text-xl font-bold text-green-600 text-center">
    {{  $t("order.ec.customerInfo") }}
  </div>
  <div class="bg-white rounded-lg shadow p-4 mt-2">
    <div class="text-base font-bold">{{ $t("order.ec.zip") }}</div>
    <div class="mb-2">
      {{customer.zip}}
    </div>
    <div class="text-base font-bold">{{ $t("order.ec.address") }}</div>
    <div class="mb-2">
      {{customer.address}}
    </div>
    <div class="text-base font-bold">{{ $t("order.ec.name") }}</div>
    <div class="mb-2">
      {{customer.name}}
    </div>
    <div class="text-base font-bold">{{ $t("order.ec.email") }}</div>
    <div class="mb-2">
      {{customer.email}}
    </div>
    <div class="text-base font-bold">{{ $t("order.ec.phone") }}</div>
    <div class="mb-2">
      {{phoneNumber}}
    </div>
  </div>
</div>
</template>

<script>
export default {
  props: {
    customer: {
      type: Object,
      required: false,
      default: {},
    },
    phoneNumber: {
      type: String,
      required: false,
    }
  }
}
</script>
