<template>
  <div>
    <template v-if="!isUser && !isLiffUser">
      <RequireLogin :loginVisible="loginVisible" @dismissed="handleDismissed" />
    </template>
    <template v-else-if="notFound">
      <not-found />
    </template>
    <template v-else-if="orderError">
      <div class="mt-4 mx-6">
        <div class="text-xl font-bold text-center">
          {{ $t("order.orderErrorMessage") }}
        </div>
      </div>
    </template>
    <template v-else>
      <!-- Back Button (Edit Order) -->
      <div v-if="just_validated" class="mt-6 mx-6">
        <b-button
          :loading="isDeleting"
          @click="handleEditItems"
          class="b-reset-tw"
        >
          <div
            class="inline-flex justify-center items-center h-9 px-4 rounded-full bg-black bg-opacity-5"
          >
            <i class="material-icons text-lg text-op-teal mr-2">arrow_back</i>
            <div class="text-sm font-bold text-op-teal">
              {{ $t("button.back") }}
            </div>
          </div>
        </b-button>
      </div>

      <!-- Restaurant Profile Photo and Name -->
      <div class="mt-4">
        <shop-header :shopInfo="shopInfo"></shop-header>
      </div>

      <!-- After Paid -->
      <div v-if="paid">
        <!-- Thank you Message -->
        <div class="mt-4 mx-6">
          <div class="text-xl font-bold text-op-teal text-center">
            {{ $t("order.thankyou") }}
          </div>
          <div class="text-xl font-bold text-op-teal text-center mt-2">
            {{ $t("order.pleaseStay") }}
          </div>
        </div>

        <!-- Line Button -->
        <div v-if="showAddLine" class="mt-6 text-center">
          <b-button @click="handleLineAuth" class="b-reset-tw">
            <div
              class="inline-flex justify-center items-center h-12 px-6 rounded-full"
              style="background: #18b900"
            >
              <i class="fab fa-line text-2xl text-white mr-2" />
              <div class="text-base font-bold text-white">
                {{ $t("line.notifyMe") }}
              </div>
            </div>
          </b-button>
        </div>

        <!-- Order Status -->
        <div class="mt-6 text-center">
          <div class="inline-flex space-x-4">
            <div>
              <div class="text-sm font-bold text-black text-opacity-60">
                {{ $t("order.orderStatus") }}
              </div>
              <div
                class="inline-block px-4 py-1 rounded-full mt-2"
                :class="orderStatusKey"
              >
                <div class="text-sm font-bold">
                  {{
                    $t(
                      "order.status." +
                        convOrderStateForText(orderStatusKey, orderInfo)
                    )
                  }}
                </div>
              </div>
            </div>
            <div>
              <div class="text-sm font-bold text-black text-opacity-60">
                {{ $t("order.orderId") }}
              </div>
              <div class="mt-1">
                <div class="text-2xl">{{ orderName }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Time to Pickup -->
        <div v-if="waiting && !shopInfo.isEC" class="mt-4 text-sm text-center">
          <div>
            {{ $t("order.timeRequested") + ": " + timeRequested }}
          </div>
          <div v-if="timeEstimated">
            {{ $t("order.timeToPickup") + ": " + timeEstimated }}
          </div>
        </div>

        <div
          v-if="hasStripe"
          class="mt-6 mx-6 bg-black bg-opacity-5 rounded-lg p-4 text-center"
        >
          <div class="font-bold">
            {{ $t("order.onlinePaymentStatus") }}
          </div>
          <div :class="'stripe_' + orderInfo.payment.stripe">
            {{ $t("order.status.stripe_user_" + orderInfo.payment.stripe)
            }}<br />
            {{
              $t(
                "order.status.stripe_user_message_" + orderInfo.payment.stripe
              )
            }}<br />
          </div>
          <div v-if="isJustCancelPayment">
            {{ $t("order.status.stripe_user_message_just_payment_canceled") }}
          </div>
        </div>

        <!-- Cancel Button -->
        <div class="mt-6 text-center">
          <b-button
            v-if="just_paid"
            @click="handleCancelPayment"
            class="b-reset-tw"
          >
            <div class="inline-flex justify-center items-center">
              <i class="material-icons text-lg mr-2 text-red-700"
                >highlight_off</i
              >
              <div class="text-base font-bold text-red-700">
                {{ $t("order.cancelOrder") }}
              </div>
            </div>
          </b-button>
        </div>

        <!-- Canceled Message -->
        <div
          v-if="canceled"
          class="mt-6 mx-6 bg-red-700 bg-opacity-10 rounded-lg p-4 text-center"
        >
          <span class="text-base font-bold text-red-700">{{
            $t("order.cancelOrderComplete")
          }}</span>
        </div>

        <!-- Special Thank you Message from the Restaurant -->
        <div
          class="mt-4 mx-6 bg-white rounded-lg p-4 shadow"
          v-if="
            shopInfo &&
            shopInfo.orderThanks &&
            shopInfo.orderThanks.length > 0 &&
            !canceled
          "
        >
          <div class="text-xs font-bold text-black text-opacity-60">
            {{ $t("order.thanksMessage") }}
          </div>
          <div
            class="mt-2 text-base"
            :class="shopInfo.enablePreline ? 'whitespace-pre-line' : ''"
          >
            {{ shopInfo.orderThanks }}
          </div>
        </div>

        <!-- Favorite Button -->
        <div class="mt-4 mx-6 bg-black bg-opacity-5 rounded-lg p-4 text-center">
          <div>
            <favorite-button
              :shopInfo="shopInfo"
              :keepLike="false"
            ></favorite-button>
          </div>
        </div>

        <!-- Restaurant LINE -->
        <div
          v-if="hasLineUrl"
          class="mt-6 mx-6 bg-black bg-opacity-5 rounded-lg p-4 text-center"
        >
          <a target="_blank" :href="this.shopInfo.lineUrl">
            <div
              class="inline-flex justify-center items-center h-12 px-6 rounded-full"
              style="background: #18b900"
            >
              <i class="fab fa-line text-2xl text-white mr-2" />
              <div class="text-base font-bold text-white">
                {{ $t("order.lineLink") }}
              </div>
            </div>
          </a>

          <div class="text-sm mt-2">
            {{ $t("order.lineMessage") }}
          </div>
        </div>
      </div>
      <!-- end of Thanks -->

      <!-- Before Paid -->
      <div v-else class="mt-4 mx-6">
        <div class="bg-red-700 bg-opacity-10 rounded-lg p-4 text-center">
          <div class="text-base font-bold text-red-700">
            {{ $t("order.orderNotPlacedYet") }}
          </div>
        </div>
        <div
          class="bg-red-700 bg-opacity-10 rounded-lg p-4 text-center mt-4"
          v-if="shopInfo.enableDelivery"
        >
          <div class="text-base font-bold text-red-700">
            <span v-if="orderInfo.isDelivery">
              {{ $t("order.thisIsDeliveryOrder") }}
            </span>
            <span v-else>
              {{ $t("order.thisIsTakeoutOrder") }}
            </span>
          </div>
        </div>
      </div>

      <div
        v-if="orderInfo.phoneNumber && !shopInfo.isEC"
        class="mt-4 text-center"
      >
        <div class="text-base font-bold">
          {{ $t("order.customerInfo") }}
        </div>
        <div class="text-xs font-bold">
          {{ $t("sms.phonenumber") }}
        </div>
        <div class="text-base mt-1">
          <div>
            <a :href="nationalPhoneURI" class="text-base font-bold">{{
              nationalPhoneNumber
            }}</a>
          </div>
          <div class="text-base">{{ orderInfo.name }}</div>
        </div>
      </div>

      <!-- Order Body -->
      <div class="mt-6 mx-6 grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12">
        <!-- Left -->
        <div>
          <!-- Title -->
          <div class="text-xl font-bold text-black text-opacity-30">
            <div v-if="paid">
              {{ $t("order.yourOrder") + ": " + orderName }}
            </div>
            <div v-else>
              {{ $t("order.confirmOrder") }}
            </div>
          </div>

          <!-- Details -->
          <div class="mt-2">
            <order-info
              :shopInfo="shopInfo || {}"
              :orderItems="this.orderItems"
              :orderInfo="this.orderInfo || {}"
              :shippingCost="shippingCost"
              @change="handleTipChange"
            ></order-info>
          </div>

          <!-- Customer info -->
          <div
            class="mt-2"
            v-if="
              shopInfo &&
              (shopInfo.isEC || orderInfo.isDelivery) &&
              hasCustomerInfo
            "
          >
            <CustomerInfo
              :shopInfo="shopInfo"
              :customer="customer"
              :phoneNumber="nationalPhoneNumber"
            />
          </div>

          <!-- Your Message to the Restaurant -->
          <template v-if="paid && hasMemo">
            <div class="bg-white rounded-lg p-4 shadow mt-4">
              <div class="text-xs font-bold text-black text-opacity-60">
                {{ $t("order.orderMessage") }}
              </div>
              <div class="mt-1 text-base">{{ orderInfo.memo }}</div>
            </div>
          </template>

          <!-- Canceled Message -->
          <div
            v-if="canceled"
            class="mt-6 bg-red-700 bg-opacity-10 rounded-lg p-4 text-center"
          >
            <span class="text-base font-bold text-red-700">{{
              $t("order.cancelOrderComplete")
            }}</span>
          </div>

          <!-- Receipt -->
          <template v-if="order_accepted && hasStripe">
            <div class="bg-white rounded-lg shadow p-4 mt-4">
              <!-- Details -->
              <div class="mt-2 text-xl font-bold text-black">
                {{ $t("order.receipt.receipt") }}
              </div>
              <div class="mt-2">
                <span @click="receipt()" class="cursor-pointer">{{
                  $t(
                    isLoadingReceipt
                      ? "order.receipt.loading"
                      : "order.receipt.getReceipt"
                  )
                }}</span>
              </div>
              <div class="mt-2 text-xs font-bold">
                {{ $t("order.receipt.explain1") }}
              </div>
              <div class="text-xs font-bold">
                {{ $t("order.receipt.explain2") }}
              </div>
            </div>
          </template>

          <!-- View Menu Page Button -->
          <div v-if="paid" class="mt-6 text-center">
            <b-button class="b-reset-tw" @click="handleOpenMenu">
              <div
                class="inline-flex justify-center items-center h-12 px-6 rounded-full border-2 border-op-teal"
              >
                <div class="text-base font-bold text-op-teal">
                  {{ $t("order.menu") }}
                </div>
              </div>
            </b-button>
          </div>

          <!-- Validating -->
          <b-notification :closable="false" v-if="newOrder">
            {{ $t("order.validating") }}
            <b-loading
              :is-full-page="false"
              :active.sync="newOrder"
              :can-cancel="true"
            ></b-loading>
          </b-notification>
        </div>

        <!-- Right -->
        <div class="mt-4 lg:mt-0">
          <!-- (Before Paid) Order Details -->
          <div v-if="just_validated">
            <!-- For EC and Delivery -->
            <div
              v-if="shopInfo.isEC || orderInfo.isDelivery"
              class="text-xl font-bold text-black text-opacity-30"
            >
              {{ $t("order.ec.formtitle") }}
            </div>

            <!-- For EC and Delivery -->
            <div
              v-if="shopInfo.isEC || orderInfo.isDelivery"
              class="bg-white rounded-lg shadow p-4 mb-4 mt-2"
            >
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
                <b-button @click="getAddress()">{{
                  $t("order.ec.searchAddressFromZip")
                }}</b-button>
              </div>
              <div
                v-for="(address, key) in addressList"
                :key="key"
                class="font-bold flex mb-2"
              >
                <b-button
                  @click="updateAddress(address)"
                  class="flex-item mr-2"
                  >{{ $t("order.ec.select") }}</b-button
                >
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
            <!-- End of EC and Delivery -->

            <!-- map for delivery -->
            <div class="mt-4" v-if="orderInfo.isDelivery">
              <div class="text-xl font-bold text-black text-opacity-30">
                {{ $t("order.ec.formtitle") }}
              </div>
              <span
                v-if="ecErrors['location'].length > 0"
                class="text-red-700 font-bold"
              >
                <div v-for="(error, key) in ecErrors['location']">
                  {{ $t(error) }}
                </div>
              </span>
              <OrderPageMap
                @updateHome="updateHome"
                :shopInfo="shopInfo"
                :fullAddress="fullAddress"
                :deliveryInfo="deliveryData"
              />
            </div>

            <!-- Time to Pickup -->
            <div v-if="!shopInfo.isEC">
              <div class="text-xl font-bold text-black text-opacity-30">
                <span v-if="orderInfo.isDelivery">
                  {{ $t("order.deliveryTimeRequested") }}
                </span>
                <span v-else>
                  {{ $t("order.timeRequested") }}
                </span>
              </div>

              <div class="mt-2">
                <time-to-pickup
                  v-if="shopInfo.businessDay"
                  :shopInfo="shopInfo"
                  :isDelivery="orderInfo.isDelivery || false"
                  ref="time"
                  @notAvailable="handleNotAvailable"
                />
              </div>
            </div>

            <!-- Order Notice -->
            <template
              v-if="
                shopInfo &&
                shopInfo.orderNotice &&
                shopInfo.orderNotice.length > 0
              "
            >
              <div class="mt-6">
                <div class="text-xl font-bold text-black text-opacity-30">
                  {{ $t("order.orderNotice") }}
                </div>

                <div class="bg-white rounded-lg shadow p-4 mt-2">
                  <div class="flex">
                    <div class="mr-2">
                      <i class="material-icons text-2xl text-red-700">error</i>
                    </div>
                    <div
                      class="flex-1 text-base text-red-700"
                      :class="
                        shopInfo.enablePreline ? 'whitespace-pre-line' : ''
                      "
                    >
                      {{ shopInfo.orderNotice }}
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- Message -->
            <template v-if="shopInfo && shopInfo.acceptUserMessage">
              <div class="mt-6">
                <div class="text-xl font-bold text-black text-opacity-30">
                  {{ $t("order.orderMessage") }}
                </div>

                <div class="bg-white rounded-lg shadow p-4 mt-2">
                  <b-input
                    v-model="memo"
                    type="textarea"
                    :placeholder="$t('order.enterMessage')"
                    class="w-full"
                  ></b-input>
                </div>
              </div>
            </template>

            <!-- Payment -->
            <div class="mt-6">
              <div class="text-xl font-bold text-black text-opacity-30">
                {{ $t("order.yourPayment") }}
              </div>

              <!-- Pay Online -->
              <div v-if="showPayment" class="mt-2">
                <stripe-card
                  @change="handleCardStateChange"
                  ref="stripe"
                  :stripeJCB="stripeJCB"
                ></stripe-card>

                <div class="mt-6 text-center">
                  <b-button
                    :loading="isPaying"
                    :disabled="
                      !cardState.complete || notAvailable || notSubmitAddress
                    "
                    @click="handlePayment"
                    class="b-reset-tw"
                  >
                    <div
                      class="inline-flex justify-center items-center h-16 px-6 rounded-full bg-op-teal shadow"
                      style="min-width: 288px"
                    >
                      <div class="text-xl font-bold text-white">
                        {{ $t("order.placeOrder") }}
                        <!-- {{ $n(orderInfo.total + tip, "currency") }} -->
                      </div>
                    </div>
                  </b-button>
                </div>
              </div>

              <!-- Pay at Restaurant -->
              <div v-else class="mt-2">
                <div class="bg-black bg-opacity-5 rounded-lg p-4">
                  <div class="text-sm">
                    {{ $t("order.pleasePayAtRestaurant") }}
                  </div>
                </div>
              </div>

              <!-- Pay Button -->
              <div v-if="inStorePayment" class="mt-4 text-center">
                <div class="text-sm font-bold text-black text-opacity-60">
                  {{ $t("order.or") }}
                </div>

                <div class="mt-4">
                  <b-button
                    :loading="isPlacing"
                    :disabled="notAvailable || notSubmitAddress"
                    @click="handleNoPayment"
                    class="b-reset-tw"
                  >
                    <div
                      class="inline-flex justify-center items-center h-16 px-6 rounded-full bg-op-teal shadow"
                      style="min-width: 288px"
                    >
                      <div class="text-xl font-bold text-white">
                        {{ $t("order.placeOrderNoPayment") }}
                      </div>
                    </div>
                  </b-button>
                </div>

                <div class="mt-2 text-sm font-bold text-black text-opacity-60">
                  {{ $t("order.placeOrderNoPaymentNote") }}
                </div>
              </div>

              <!-- Error message for ec and delivery -->
              <div
                v-if="requireAddress && hasEcError"
                class="text-center text-red-700 font-bold mt-2"
              >
                {{ $t("order.alertReqireAddress") }}
              </div>

              <!-- Send SMS Checkbox -->
              <div v-if="!isLineEnabled" class="mt-6">
                <div class="bg-black bg-opacity-5 rounded-lg p-4">
                  <b-checkbox v-model="sendSMS">
                    <div class="text-sm font-bold">
                      {{ $t("order.sendSMS") }}
                    </div>
                  </b-checkbox>
                </div>
              </div>
            </div>
          </div>
          <!-- end of just_validated >

          <!-- (After Paid) Restaurant Details -->
          <div v-if="paid">
            <!-- Restaurant Info -->
            <div>
              <div class="text-xl font-bold text-black text-opacity-30">
                {{
                  shopInfo.isEC
                    ? $t("shopInfo.ecShopDetails")
                    : $t("shopInfo.restaurantDetails")
                }}
              </div>

              <div class="mt-2">
                <shop-info
                  :compact="true"
                  :shopInfo="shopInfo"
                  :isDelivery="orderInfo.isDelivery"
                  :paymentInfo="paymentInfo"
                />
              </div>
            </div>

            <!-- QR Code -->
            <div class="mt-6" v-if="!shopInfo.isEC">
              <div class="text-xl font-bold text-black text-opacity-30">
                {{ $t("order.adminQRCode") }}
              </div>

              <div class="bg-white rounded-lg shadow p-4 mt-2 text-center">
                <qrcode
                  :value="urlAdminOrderPage"
                  :options="{ width: 160 }"
                ></qrcode>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import firebase from "firebase/compat/app";
import ShopHeader from "~/app/user/Restaurant/ShopHeader";
import OrderInfo from "~/app/user/Order/OrderInfo";
import ShopInfo from "~/app/user/Restaurant/ShopInfo";
import StripeCard from "~/app/user/Order/StripeCard";
import TimeToPickup from "~/app/user/Order/TimeToPickup";
import PhoneLogin from "~/app/auth/PhoneLogin";
import NotFound from "~/components/NotFound";
import RequireLogin from "~/components/RequireLogin";
import FavoriteButton from "~/app/user/Restaurant/FavoriteButton";
import CustomerInfo from "~/components/CustomerInfo";

import OrderPageMap from "./OrderPageMap";

import { db, firestore } from "~/plugins/firebase";
import { functionsJP } from "@/lib/firebase/firebase9";
import { httpsCallable } from "firebase/functions";
import { order_status, order_status_keys } from "~/config/constant";
import { nameOfOrder } from "~/utils/strings";
import {
  stripeCreateIntent,
  stripeCancelIntent,
  stripeReceipt,
} from "~/lib/stripe/stripe";
import { lineAuthURL } from "~/lib/line/line";

import { costCal } from "~/utils/commonUtils";

import * as analyticsUtil from "~/lib/firebase/analytics";

import isEmail from "validator/lib/isEmail";

import { parsePhoneNumber, formatNational, formatURL } from "~/utils/phoneutil";

export default {
  name: "Order",
  metaInfo() {
    return {
      title:
        this.shopInfo?.restaurantName && this.statusKey
          ? [
              this.defaultTitle,
              this.shopInfo ? this.shopInfo?.restaurantName : "--",
              "Order Page",
              this.$t("order.status." + this.statusKey),
            ].join(" / ")
          : [this.defaultTitle, "Order Page"].join(" / "),
    };
  },
  components: {
    ShopHeader,
    OrderInfo,
    PhoneLogin,
    ShopInfo,
    StripeCard,
    TimeToPickup,
    NotFound,
    RequireLogin,
    CustomerInfo,
    OrderPageMap,
    FavoriteButton,
  },
  props: {
    shopInfo: {
      type: Object,
      required: true,
    },
    paymentInfo: {
      type: Object,
      required: true,
    },
    deliveryData: {
      type: Object,
      required: true,
    },
    notFound: {
      type: Boolean,
      required: false,
    },
    mode: {
      type: String,
      required: false,
    },
  },
  data() {
    return {
      notAvailable: false,
      loginVisible: false,
      isPaying: false,
      restaurantsId: this.restaurantId(),
      addressList: [],
      cardState: {},
      orderInfo: {},
      customer: {},
      menuObj: null,
      detacher: [],
      isDeleting: false,
      isPlacing: false,
      tip: 0,
      sendSMS: true,
      isSaveAddress: true,
      isLoadingReceipt: false,
      postageInfo: {},
      memo: "",
      customerInfo: {},
    };
  },
  created() {
    if (this.isUser || this.isLiffUser) {
      this.loadUserData();
    } else if (!this.isUser) {
      this.loginVisible = true;
    }
  },
  destroyed() {
    if (this.detacher) {
      this.detacher.map((detacher) => {
        detacher();
      });
    }
  },
  beforeRouteLeave(to, from, next) {
    if (to.name === "r-restaurantId") {
      this.deleteOrderInfo();
    }
    next();
  },
  computed: {
    isJustCancelPayment() {
      return (
        this.hasStripe &&
        this.orderInfo.payment.stripe === "canceled" &&
        this.orderInfo.status !== order_status.order_canceled
      );
    },
    statusKey() {
      return this.orderInfo ? order_status_keys[this.orderInfo.status] : null;
    },
    hasStripe() {
      return this.orderInfo.payment && this.orderInfo.payment.stripe;
    },
    hasLineUrl() {
      return this.shopInfo.lineUrl;
    },
    urlAdminOrderPage() {
      return `${
        location.origin
      }/admin/restaurants/${this.restaurantId()}/orders/${this.orderId}`;
    },
    showAddLine() {
      return (
        this.isLineEnabled &&
        this.$store.state.claims &&
        !this.$store.state.claims.line
      );
    },
    timeRequested() {
      const date = this.orderInfo.timePlaced.toDate();
      return this.$d(date, "long");
    },
    timeEstimated() {
      if (this.orderInfo.timeEstimated) {
        const date = this.orderInfo.timeEstimated.toDate();
        return this.$d(date, "long");
      }
      return undefined; // backward compatibility
    },
    showPayment() {
      return this.stripeAccount;
    },
    stripeAccount() {
      return this.paymentInfo.stripe;
    },
    stripeJCB() {
      return this.paymentInfo.stripeJCB === true;
    },
    inStorePayment() {
      return this.paymentInfo.inStore;
    },
    orderName() {
      return nameOfOrder(this.orderInfo);
    },
    orderStatusKey() {
      return Object.keys(order_status).reduce((result, key) => {
        return order_status[key] === this.orderInfo.status ? key : result;
      }, "unexpected");
    },
    orderError() {
      return this.orderInfo.status === order_status.error;
    },
    newOrder() {
      return this.orderInfo.status === order_status.new_order;
    },
    just_validated() {
      return this.orderInfo.status === order_status.validation_ok;
    },
    just_paid() {
      return this.orderInfo.status === order_status.order_placed;
    },
    canceled() {
      return this.orderInfo.status === order_status.order_canceled;
    },
    paid() {
      return this.orderInfo.status >= order_status.order_placed;
    },
    order_accepted() {
      return this.orderInfo.status >= order_status.order_accepted;
    },
    waiting() {
      return this.orderInfo.status < order_status.cooking_completed;
    },
    hasCustomerInfo() {
      return this.orderInfo.status > order_status.validation_ok;
    },
    orderItems() {
      return this.getOrderItems(this.orderInfo, this.menuObj);
    },
    orderId() {
      return this.$route.params.orderId;
    },
    hasMemo() {
      return this.orderInfo && !this.isEmpty(this.orderInfo.memo);
    },
    phoneNumber() {
      return (
        this.orderInfo &&
        this.orderInfo.phoneNumber &&
        parsePhoneNumber(this.orderInfo.phoneNumber)
      );
    },
    nationalPhoneNumber() {
      return this.phoneNumber ? formatNational(this.phoneNumber) : "";
    },
    nationalPhoneURI() {
      return formatURL(this.phoneNumber);
    },
    // for EC
    fullAddress() {
      return this.customerInfo
        ? [this.customerInfo.prefecture, this.customerInfo.address].join("")
        : "";
    },
    ecErrors() {
      const err = {};
      const attrs = ["zip", "address", "name", "prefectureId"];
      if (this.shopInfo.isEC) {
        attrs.push("email");
      }
      attrs.forEach((name) => {
        err[name] = [];
        if (
          this.customerInfo[name] === undefined ||
          this.customerInfo[name] === ""
        ) {
          err[name].push("validationError." + name + ".empty");
        }
      });
      if (
        this.customerInfo["zip"] &&
        !this.customerInfo["zip"].match(
          /^((\d|[０-９]){3}(-|ー)(\d|[０-９]){4})|(\d|[０-９]){7}$/
        )
      ) {
        err["zip"].push("validationError.zip.invalidZip");
      }
      if (this.shopInfo.isEC) {
        if (
          this.customerInfo["email"] &&
          !isEmail(this.customerInfo["email"])
        ) {
          err["email"].push("validationError.email.invalidEmail");
        }
      }
      if (this.orderInfo.isDelivery) {
        err["location"] = [];
        if (!this.customerInfo.location || !this.customerInfo.location.lat) {
          err["location"].push("validationError.location.noLocation");
        }
      }
      return err;
    },
    hasEcError() {
      const num = this.countObj(this.ecErrors);
      return num > 0;
    },

    shippingCost() {
      return costCal(
        this.postageInfo,
        this.customerInfo?.prefectureId,
        this.orderInfo.total
      );
    },
    requireAddress() {
      return this.shopInfo.isEC || this.orderInfo.isDelivery;
    },
    notSubmitAddress() {
      return this.requireAddress && this.hasEcError;
    },
  },
  // end of computed
  watch: {
    shopInfo(newValue) {
      if (this.shopInfo.isEC) {
        db.doc(`restaurants/${this.restaurantId()}/ec/postage`)
          .get()
          .then((snapshot) => {
            this.postageInfo = snapshot.data() || {};
          });
      }
    },
    isUser() {
      if (this.isUser) {
        this.loadUserData();
      }
    },
    isLiffUser() {
      if (this.isLiffUser) {
        this.loadUserData();
      }
    },
  },
  methods: {
    updateHome(pos) {
      const cust = { ...this.customerInfo };
      cust.location = pos;
      this.customerInfo = cust;
    },
    sendPurchase() {
      analyticsUtil.sendPurchase(
        this.orderInfo,
        this.orderId,
        this.orderItems.map((or) => {
          return { ...or.item, id: or.id, quantity: or.count };
        }),
        this.shopInfo,
        this.restaurantId()
      );
    },
    sendRedunded() {
      analyticsUtil.sendRedunded(
        this.orderInfo,
        this.orderId,
        this.shopInfo,
        this.restaurantId()
      );
    },
    handleLineAuth() {
      const url = lineAuthURL("/callback/line", {
        pathname: location.pathname,
      });
      location.href = url;
    },
    loadUserData() {
      const order_detacher = db
        .doc(`restaurants/${this.restaurantId()}/orders/${this.orderId}`)
        .onSnapshot(
          async (order) => {
            const order_data = order.exists ? order.data() : {};
            this.orderInfo = order_data;
            // console.log("*** O", this.orderInfo);
            if (this.orderInfo.menuItems) {
              this.menuObj = this.orderInfo.menuItems;
            } else {
              // Backward compatibility
              if (!this.menuObj) {
                const menu = await db
                  .collection(`restaurants/${this.restaurantId()}/menus`)
                  .get();
                if (!menu.empty) {
                  const menus = menu.docs.map(this.doc2data("menu"));
                  this.menuObj = this.array2obj(menus);
                }
              }
            }
            if (this.just_validated) {
              analyticsUtil.sendViewCart(
                this.orderInfo,
                this.orderId,
                this.orderItems.map((or) => {
                  return { ...or.item, id: or.id, quantity: or.count };
                }),
                this.shopInfo,
                this.restaurantId()
              );
            }

            if (this.orderInfo.isDelivery || this.shopInfo.isEC) {
              if (this.just_validated) {
                this.customerInfo = { ...((await this.loadAddress()) || {}) };
              }
              if (this.hasCustomerInfo) {
                this.customer =
                  (
                    await db
                      .doc(
                        `restaurants/${this.restaurantId()}/orders/${
                          this.orderId
                        }/customer/data`
                      )
                      .get()
                  ).data() ||
                  this.orderInfo?.customerInfo ||
                  {};
              }
            }
            // console.log(`/users/${uid}/address/data`);
          },
          (error) => {
            this.notFound = true;
          }
        );
      this.detacher = [order_detacher];
    },

    handleOpenMenu() {
      if (this.inLiff) {
        this.$router.push(this.liff_base_path + "/r/" + this.restaurantId());
      } else {
        this.$router.push(`/r/${this.restaurantId()}`);
      }
    },
    handleNotAvailable(flag) {
      console.log("handleNotAvailable", flag);
      this.notAvailable = flag;
    },
    handleTipChange(tip) {
      //console.log("handleTipChange", tip);
      this.tip = tip;
    },
    handleCardStateChange(state) {
      this.cardState = state;
    },
    handleDismissed(params) {
      console.log("handleDismissed", params);
      // The user has dismissed the login dialog (including the successful login)
      this.loginVisible = false;
    },
    async deleteOrderInfo() {
      try {
        this.isDeleting = true;
        await db
          .doc(`restaurants/${this.restaurantId()}/orders/${this.orderId}`)
          .delete();
        console.log("suceeded");
      } catch (error) {
        this.isDeleting = false;
        console.log("failed");
      }
    },
    async handleEditItems() {
      this.$router.push({
        path: `/r/${this.restaurantId()}`,
      });
    },
    async saveLiffCustomer() {
      const uid = this.user.uid;
      const data = {
        uid,
        restaurantId: this.restaurantId(),
        name: this.orderInfo.name || "",
        orderId: this.orderId, //  (this is last)
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };
    },
    async handlePayment() {
      if (this.requireAddres) {
        if (this.hasEcError) {
          return;
        }
        if (this.isSaveAddress) {
          await this.saveAddress();
        }
      }

      const timeToPickup = this.shopInfo.isEC
        ? firebase.firestore.Timestamp.now()
        : this.$refs.time.timeToPickup();

      this.isPaying = true;
      try {
        await this.$refs.stripe.createToken();
        const { data } = await stripeCreateIntent({
          timeToPickup,
          restaurantId: this.restaurantId() + this.forcedError("intent"),
          orderId: this.orderId,
          description: `${this.orderName} ${this.shopInfo.restaurantName} ${this.shopInfo.phoneNumber}`,
          sendSMS: this.sendSMS,
          tip: this.tip || 0,
          memo: this.memo || "",
          customerInfo: this.customerInfo || {},
        });
        if (this.isLiffUser) {
          await this.saveLiffCustomer();
        }
        this.sendPurchase();
        this.$store.commit("resetCart", this.restaurantId());
        console.log("createIntent", data);
        window.scrollTo(0, 0);
      } catch (error) {
        // alert(JSON.stringify(error));
        console.error(error.message, error.details);
        let error_code = "stripe.intent";
        if (
          error.details &&
          error.details.code === "card_declined" &&
          error.details.decline_code === "card_not_supported" &&
          !this.stripeJCB
        ) {
          console.log("JCB");
          error_code = "stripe.NoJCB";
        }
        this.$store.commit("setErrorMessage", {
          code: error_code,
          error,
        });
      } finally {
        this.isPaying = false;
      }
    },
    async handleNoPayment() {
      console.log(this.requireAddress, this.isSaveAddress);
      if (this.requireAddress) {
        if (this.hasEcError) {
          return;
        }
        if (this.isSaveAddress) {
          await this.saveAddress();
        }
      }
      const timeToPickup = this.shopInfo.isEC
        ? firebase.firestore.Timestamp.now()
        : this.$refs.time.timeToPickup();
      const orderPlace = httpsCallable(functionsJP, "orderPlaceJp");
      try {
        this.isPlacing = true;
        const { data } = await orderPlace({
          restaurantId: this.restaurantId() + this.forcedError("place"),
          timeToPickup,
          orderId: this.orderId,
          sendSMS: this.sendSMS,
          tip: this.tip || 0,
          memo: this.memo || "",
          customerInfo: this.customerInfo || {},
        });
        if (this.isLiffUser) {
          await this.saveLiffCustomer();
        }
        console.log("place", data);
        this.sendPurchase();
        this.$store.commit("resetCart", this.restaurantId());
        window.scrollTo(0, 0);
      } catch (error) {
        // alert(JSON.stringify(error));
        console.error(error.message, error.details);
        this.$store.commit("setErrorMessage", {
          code: "order.place",
          error,
        });
      } finally {
        this.isPlacing = false;
      }
    },
    async handleCancelPayment() {
      this.$store.commit("setAlert", {
        code: "order.cancelOrderConfirm",
        callback: async () => {
          try {
            this.$store.commit("setLoading", true);
            const { data } = await stripeCancelIntent({
              restaurantId: this.restaurantId() + this.forcedError("cancel"),
              orderId: this.orderId,
            });
            this.sendRedunded();
            console.log("cancel", data);
          } catch (error) {
            // BUGBUG: Implement the error handling code here
            console.error(error.message, error.details);
            this.$store.commit("setErrorMessage", {
              code: "order.cancel",
              error,
            });
          } finally {
            this.$store.commit("setLoading", false);
          }
        },
      });
    },
    async receipt() {
      if (this.isLoadingReceipt) {
        return;
      }
      this.isLoadingReceipt = true;
      try {
        const res = await stripeReceipt({
          restaurantId: this.restaurantId(),
          orderId: this.orderId,
        });
        if (res.data && res.data.receipt_url) {
          window.open(res.data.receipt_url);
        }
      } catch (e) {
        console.log("error");
      }
      this.isLoadingReceipt = false;
    },
    updateAddress(address) {
      const { address1, address2, address3, prefectureId, prefecture } =
        address;

      const data = {
        address: [address2, address3].join(""),
        prefectureId,
        prefecture,
      };

      this.customerInfo = Object.assign({}, this.customerInfo, data);
      this.addressList = [];
    },
    updatePrefecture() {
      const prefecture = this.getPrefecture();
      if (prefecture) {
        this.customerInfo = Object.assign({}, this.customerInfo, {
          prefecture,
        });
      }
    },
    getPrefecture() {
      if (this.customerInfo?.prefectureId) {
        return this.regionalSetting.AddressStates[
          this.customerInfo?.prefectureId - 1
        ];
      }
      return null;
    },
    async saveAddress() {
      const uid = this.user.uid;
      console.log(this.customerInfo);
      await db.doc(`/users/${uid}/address/data`).set(this.customerInfo);
    },
    async loadAddress() {
      const uid = this.user.uid;
      return (await db.doc(`/users/${uid}/address/data`).get()).data();
    },
    async getAddress() {
      const zip = this.customerInfo["zip"];
      if (this.ecErrors["zip"].length > 0) {
        return;
      }
      const validZip = zip.replace(/-|ー/g, "").replace(/[！-～]/g, (s) => {
        return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
      });

      const zipDoc = await db.doc(`/zipcode/${validZip}`).get();
      const data = zipDoc.data();
      // console.log(data);
      if (zipDoc.exists) {
        this.addressList = data.addresses;
      } else {
        this.addressList = [];
      }
      // console.log(zip, data);
    },
  },
};
</script>
