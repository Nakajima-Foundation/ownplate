<template>
  <div>
    <!-- zip -->
    <div class="pb-2 text-sm font-bold">
      {{ $t("order.ec.zip") }}
      <span class="text-red-700">*</span>
    </div>
    <div>
      <o-field :variant="ecErrors['zip'].length > 0 ? 'danger' : 'success'">
        <input
          class="w-full rounded border border-gray-300 px-3 py-2"
          :class="
            ecErrors['zip'].length > 0 ? 'border-red-500' : 'border-green-500'
          "
          type="text"
          :placeholder="$t('order.ec.zip')"
          v-model="customerInfo.zip"
          maxlength="10"
        />
      </o-field>
    </div>
    <div v-if="ecErrors['zip'].length > 0" class="mb-2 font-bold text-red-700">
      <div v-for="(error, key) in ecErrors['zip']" :key="key">
        {{ $t(error) }}
      </div>
    </div>

    <!-- conv zip to address -->
    <div class="mt-2 mb-2">
      <button @click="getAddress()" class="">
        <div
          class="bg-op-teal inline-flex h-9 items-center justify-center rounded-full px-4"
        >
          <div class="text-sm font-bold text-white">
            {{ $t("order.ec.searchAddressFromZip") }}
          </div>
        </div>
      </button>
    </div>
    <div
      v-for="(address, key) in addressList"
      :key="key"
      class="mb-2 flex font-bold"
    >
      <button @click="updateAddress(address)" class="flex-item mr-2">
        <div
          class="bg-op-teal inline-flex h-9 items-center justify-center rounded-full px-4"
        >
          <div class="text-sm font-bold text-white">
            {{ $t("order.ec.select") }}
          </div>
        </div>
      </button>
      <span class="flex-item mt-auto mb-auto inline-block">
        {{ address.address1 }}{{ address.address2 }}{{ address.address3 }}
      </span>
    </div>

    <!-- prefecture -->
    <div class="pb-2 text-sm font-bold">
      {{ $t("shopInfo.prefecture") }}
      <span class="text-red-700">*</span>
    </div>
    <o-field
      :variant="ecErrors['prefectureId'].length > 0 ? 'danger' : 'success'"
    >
      <o-select
        v-model="customerInfo.prefectureId"
        placeholder="select"
        @update:modelValue="updatePrefecture"
      >
        <option
          v-for="(stateItem, key) in regionalSetting.AddressStates"
          :value="key + 1"
          :key="stateItem"
        >
          {{ stateItem }}
        </option>
      </o-select>
    </o-field>

    <!-- address -->
    <div class="pb-2 text-sm font-bold">
      {{ $t("order.ec.address") }}
      <span class="text-red-700">*{{ $t("order.ec.addressNotice") }}</span>
    </div>
    <div>
      <o-field :variant="ecErrors['address'].length > 0 ? 'danger' : 'success'">
        <input
          class="w-full rounded border border-gray-300 px-3 py-2"
          :class="
            ecErrors['address'].length > 0
              ? 'border-red-500'
              : 'border-green-500'
          "
          type="text"
          :placeholder="$t('order.ec.address')"
          v-model="customerInfo.address"
          maxlength="150"
        />
      </o-field>
    </div>
    <div
      v-if="ecErrors['address'].length > 0"
      class="mb-2 font-bold text-red-700"
    >
      <div v-for="(error, key) in ecErrors['address']" :key="key">
        {{ $t(error) }}
      </div>
    </div>

    <!-- name -->
    <div class="pb-2 text-sm font-bold">
      {{ $t("order.ec.name") }}
      <span class="text-red-700">*</span>
    </div>
    <div>
      <o-field :variant="ecErrors['name'].length > 0 ? 'danger' : 'success'">
        <input
          class="w-full rounded border border-gray-300 px-3 py-2"
          :class="
            ecErrors['name'].length > 0 ? 'border-red-500' : 'border-green-500'
          "
          type="text"
          :placeholder="$t('order.ec.name')"
          v-model="customerInfo.name"
          maxlength="50"
        />
      </o-field>
    </div>
    <div v-if="ecErrors['name'].length > 0" class="mb-2 font-bold text-red-700">
      <div v-for="(error, key) in ecErrors['name']" :key="key">
        {{ $t(error) }}
      </div>
    </div>
    <!-- email -->
    <template v-if="shopInfo.isEC">
      <div class="pb-2 text-sm font-bold">
        {{ $t("order.ec.email") }}
        <span class="text-red-700">*</span>
      </div>
      <div>
        <o-field :variant="ecErrors['email'].length > 0 ? 'danger' : 'success'">
          <input
            class="w-full rounded border border-gray-300 px-3 py-2"
            :class="
              ecErrors['email'].length > 0
                ? 'border-red-500'
                : 'border-green-500'
            "
            type="text"
            :placeholder="$t('order.ec.email')"
            v-model="customerInfo.email"
            maxlength="100"
          />
        </o-field>
      </div>
      <div
        v-if="ecErrors['email'].length > 0"
        class="mb-2 font-bold text-red-700"
      >
        <div v-for="(error, key) in ecErrors['email']" :key="key">
          {{ $t(error) }}
        </div>
      </div>
    </template>

    <div class="mt-2">
      <o-checkbox v-model="isSaveAddress">
        <div class="text-sm font-bold">
          {{ $t("order.saveAddress") }}
        </div>
      </o-checkbox>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType } from "vue";

import { db } from "@/lib/firebase/firebase9";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { regionalSetting, countObj, useUserData } from "@/utils/utils";
import { CustomerInfo } from "@/models/customer";
import isEmail from "validator/lib/isEmail";

import { RestaurantInfoData } from "@/models/RestaurantInfo";
import { OrderInfoData } from "@/models/orderInfo";

export default defineComponent({
  props: {
    shopInfo: {
      type: Object as PropType<RestaurantInfoData>,
      required: true,
    },
    orderInfo: {
      type: Object as PropType<OrderInfoData>,
      required: true,
    },
  },
  emits: ["updateLocation"],
  setup(props, ctx) {
    const isSaveAddress = ref(true);
    const customerInfo = ref<CustomerInfo>({});
    const addressList = ref([]);

    const { uid } = useUserData();

    const updateAddress = (address: any) => {
      const { address2, address3, prefectureId, prefecture } = address;

      const data = {
        address: [address2, address3].join(""),
        prefectureId,
        prefecture,
      };

      customerInfo.value = Object.assign({}, customerInfo.value, data);
      addressList.value = [];
    };
    const getPrefecture = () => {
      if (customerInfo.value?.prefectureId) {
        return regionalSetting.AddressStates[
          customerInfo.value?.prefectureId - 1
        ];
      }
      return null;
    };
    const updatePrefecture = () => {
      const prefecture = getPrefecture();
      if (prefecture) {
        customerInfo.value = Object.assign({}, customerInfo.value, {
          prefecture,
        });
      }
    };
    const saveAddress = async () => {
      await setDoc(
        doc(db, `/users/${uid.value}/address/data`),
        customerInfo.value,
      );
    };
    const loadAddress = async () => {
      return (
        (await getDoc(doc(db, `/users/${uid.value}/address/data`))).data() || {}
      );
    };
    const ecErrors = computed(() => {
      const err: { [key: string]: string[] } = {};
      const attrs = ["zip", "address", "name", "prefectureId"];
      if (props.shopInfo.isEC) {
        attrs.push("email");
      }
      attrs.forEach((name) => {
        err[name] = [];
        if (
          customerInfo.value[name as keyof CustomerInfo] === undefined ||
          customerInfo.value[name as keyof CustomerInfo] === ""
        ) {
          err[name].push("validationError." + name + ".empty");
        }
      });
      if (
        customerInfo.value["zip"] &&
        !customerInfo.value["zip"].match(
          /^((\d|[０-９]){3}(-|ー)(\d|[０-９]){4})|(\d|[０-９]){7}$/,
        )
      ) {
        err["zip"].push("validationError.zip.invalidZip");
      }
      if (props.shopInfo.isEC) {
        if (
          customerInfo.value["email"] &&
          !isEmail(customerInfo.value["email"])
        ) {
          err["email"].push("validationError.email.invalidEmail");
        }
      }
      if (props.orderInfo.isDelivery) {
        err["location"] = [];
        if (!customerInfo.value.location || !customerInfo.value.location.lat) {
          err["location"].push("validationError.location.noLocation");
        }
      }
      return err;
    });
    const hasEcError = computed(() => {
      const num = countObj(ecErrors.value);
      return num > 0;
    });
    const getAddress = async () => {
      const zip = customerInfo.value["zip"];
      if (ecErrors.value["zip"].length > 0) {
        return;
      }
      const validZip = zip?.replace(/-|ー/g, "").replace(/[！-～]/g, (s) => {
        return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
      });

      const zipDoc = await getDoc(doc(db, `/zipcode/${validZip}`));
      const data = zipDoc.data();
      if (zipDoc.exists()) {
        addressList.value = data?.addresses;
      } else {
        addressList.value = [];
      }
    };

    const fullAddress = computed(() => {
      return customerInfo.value
        ? [customerInfo.value.prefecture, customerInfo.value.address].join("")
        : "";
    });

    (async () => {
      customerInfo.value = (await loadAddress()) || {};
      if (customerInfo.value && customerInfo.value.location) {
        ctx.emit("updateLocation", customerInfo.value.location);
      }
    })();

    const updateHome = (pos: any) => {
      const customer = { ...customerInfo.value };
      customer.location = pos;
      customerInfo.value = customer;
    };
    return {
      customerInfo,
      addressList,
      isSaveAddress,
      saveAddress,

      regionalSetting,

      ecErrors,
      hasEcError,
      fullAddress,

      getAddress,
      loadAddress,
      updateAddress,
      updatePrefecture,

      updateHome,
    };
  },
});
</script>
