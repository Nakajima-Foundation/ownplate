<template>
<div>
  <!-- zip -->
  <div class="text-sm font-bold pb-2">
    {{ $t("order.ec.zip") }}
    <span class="text-red-700">*</span>
  </div>
  <div>
    <b-field
      :type="
             ecErrors['zip'].length > 0 ? 'is-danger' : 'is-success'
             "
      >
      <b-input
        class="w-full"
        type="text"
        :placeholder="$t('order.ec.zip')"
        v-model="customerInfo.zip"
        :error="ecErrors['zip']"
        maxlength="10"
        />
    </b-field>
  </div>
  <div
    v-if="ecErrors['zip'].length > 0"
    class="mb-2 text-red-700 font-bold"
    >
    <div v-for="(error, key) in ecErrors['zip']">
      {{ $t(error) }}
    </div>
  </div>
  
  <!-- conv zip to address -->
  <div class="mb-2">
    <button @click="getAddress()" class="">
      <div
        class="inline-flex justify-center items-center h-9 px-4 rounded-full bg-op-teal"
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
    class="font-bold flex mb-2"
    >
    <button @click="updateAddress(address)" class="flex-item mr-2">
      <div
        class="inline-flex justify-center items-center h-9 px-4 rounded-full bg-op-teal"
        >
        <div class="text-sm font-bold text-white">
          {{ $t("order.ec.select") }}
        </div>
      </div>
    </button>
    <span class="flex-item mt-auto mb-auto inline-block">
      {{ address.address1 }}{{ address.address2
      }}{{ address.address3 }}
    </span>
  </div>
  
  <!-- prefecture -->
  <div class="text-sm font-bold pb-2">
    {{ $t("shopInfo.prefecture") }}
    <span class="text-red-700">*</span>
  </div>
  <b-field
    :type="
           ecErrors['prefectureId'].length > 0
           ? 'is-danger'
           : 'is-success'
           "
    >
    <b-select
      v-model="customerInfo.prefectureId"
      placeholder="select"
      @input="updatePrefecture"
      >
      <option
        v-for="(stateItem, key) in regionalSetting.AddressStates"
        :value="key + 1"
        :key="stateItem"
        >
        {{ stateItem }}
      </option>
    </b-select>
  </b-field>
  
  <!-- address -->
  <div class="text-sm font-bold pb-2">
    {{ $t("order.ec.address") }}
    <span class="text-red-700"
          >*{{ $t("order.ec.addressNotice") }}</span
                                                >
  </div>
  <div>
    <b-field
      :type="
             ecErrors['address'].length > 0 ? 'is-danger' : 'is-success'
             "
      >
      <b-input
        class="w-full"
        type="text"
        :placeholder="$t('order.ec.address')"
        v-model="customerInfo.address"
        maxlength="100"
        />
    </b-field>
  </div>
  <div
    v-if="ecErrors['address'].length > 0"
    class="mb-2 text-red-700 font-bold"
    >
    <div v-for="(error, key) in ecErrors['address']">
      {{ $t(error) }}
    </div>
  </div>
  
  <!-- name -->
  <div class="text-sm font-bold pb-2">
    {{ $t("order.ec.name") }}
    <span class="text-red-700">*</span>
  </div>
  <div>
    <b-field
      :type="
             ecErrors['name'].length > 0 ? 'is-danger' : 'is-success'
             "
      >
      <b-input
        class="w-full"
        type="text"
        :placeholder="$t('order.ec.name')"
        v-model="customerInfo.name"
        maxlength="30"
        />
    </b-field>
  </div>
  <div
    v-if="ecErrors['name'].length > 0"
    class="mb-2 text-red-700 font-bold"
    >
    <div v-for="(error, key) in ecErrors['name']">
      {{ $t(error) }}
    </div>
  </div>
  <!-- email -->
  <template v-if="shopInfo.isEC">
    <div class="text-sm font-bold pb-2">
      {{ $t("order.ec.email") }}
      <span class="text-red-700">*</span>
    </div>
    <div>
      <b-field
        :type="
               ecErrors['email'].length > 0 ? 'is-danger' : 'is-success'
               "
        >
        <b-input
          class="w-full"
          type="text"
          :placeholder="$t('order.ec.email')"
          v-model="customerInfo.email"
          maxlength="30"
          />
      </b-field>
    </div>
    <div
      v-if="ecErrors['email'].length > 0"
      class="mb-2 text-red-700 font-bold"
      >
      <div v-for="(error, key) in ecErrors['email']">
        {{ $t(error) }}
      </div>
    </div>
  </template>
  
  <div>
    <b-checkbox v-model="isSaveAddress">
      <div class="text-sm font-bold">
        {{ $t("order.saveAddress") }}
      </div>
    </b-checkbox>
  </div>
  
</div>
</template>

<script>
import {
  defineComponent, ref, computed
} from "@vue/composition-api";

import { db } from "@/plugins/firebase";
import { regionalSetting, countObj } from "@/utils/utils";

export default defineComponent({
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
    orderInfo: {
      type: Object,
      required: true,
    },
  },
  emits: ["updateLocation"],
  setup(props, ctx) {
    const isSaveAddress = ref(true);
    const customerInfo = ref({});
    const addressList = ref([]);
    
    const updateAddress = (address) => {
      const { address1, address2, address3, prefectureId, prefecture } =
        address;

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
      const uid = ctx.root.user.uid;
      console.log(customerInfo.value);
      await db.doc(`/users/${uid}/address/data`).set(customerInfo.value);
    };
    const loadAddress = async () => {
      const uid = ctx.root.user.uid;
      return (await db.doc(`/users/${uid}/address/data`).get()).data();
    };
    const ecErrors = computed(() => {
      const err = {};
      const attrs = ["zip", "address", "name", "prefectureId"];
      if (props.shopInfo.isEC) {
        attrs.push("email");
      }
      attrs.forEach((name) => {
        err[name] = [];
        if (
          customerInfo.value[name] === undefined ||
          customerInfo.value[name] === ""
        ) {
          err[name].push("validationError." + name + ".empty");
        }
      });
      if (
        customerInfo.value["zip"] &&
        !customerInfo.value["zip"].match(
          /^((\d|[０-９]){3}(-|ー)(\d|[０-９]){4})|(\d|[０-９]){7}$/
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
      const validZip = zip.replace(/-|ー/g, "").replace(/[！-～]/g, (s) => {
        return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
      });
      
      const zipDoc = await db.doc(`/zipcode/${validZip}`).get();
      const data = zipDoc.data();
      if (zipDoc.exists) {
        addressList.value = data.addresses;
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
      customerInfo.value = await loadAddress();
      if ( customerInfo.value &&  customerInfo.value.location) {
        ctx.emit("updateLocation", customerInfo.value.location);
      }
    })();
    

    const updateHome = (pos) => {
      const customer = { ...customerInfo.value };
      customer.location = pos;
      customerInfo.value = customer;
    };
    return {
      customerInfo,
      addressList,
      isSaveAddress,

      ecErrors,
      hasEcError,
      fullAddress,

      getAddress,
      loadAddress,
      updateAddress,
      updatePrefecture,

      updateHome,
    };
  }
});
</script>
