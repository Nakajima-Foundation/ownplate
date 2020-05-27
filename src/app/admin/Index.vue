<template>
  <div>
    <!-- Welcome Instructions -->
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-24"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="columns is-gapless">
          <div class="column is-narrow w-24"></div>
          <div class="column">
            <div class="is-hidden-mobile h-24"></div>
            <div class="bg-ownplate-yellow r-8 align-center">
              <div class="h-24 bg-ownplate-yellow is-invisible-tablet"></div>
              <div class="t-h6 c-ownplate-white p-b-24">{{$t("admin.welcomeMessage")}}</div>
              <div class="is-inline-flex">
                <div class="m-r-24">
                  <a href="ttps://gluepass.jp/g/ownplatejp/pg/Zy8VserQdTxFVKLaFcOK" target="_blank">
                    <div class="op-button-small w-160 bg-text-white-high">
                      <i class="material-icons c-primary s-18 m-r-8">help_outline</i>
                      <span class="c-primary t-button">{{$t("admin.userManual")}}</span>
                    </div>
                  </a>
                </div>
                <div>
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSfGR4kk65ynfkCRGJsvJz01HZf7AU1nGLL9Rn9i4G9-qiW6MQ/viewform"
                    target="_blank"
                  >
                    <div class="op-button-small w-160 bg-text-white-high">
                      <i class="material-icons c-primary s-18 m-r-8">mail_outline</i>
                      <span class="c-primary t-button">{{$t("admin.suportPage")}}</span>
                    </div>
                  </a>
                </div>
              </div>
              <div class="h-24 bg-ownplate-yellow is-invisible-tablet"></div>
            </div>
          </div>
          <div class="column is-narrow w-24"></div>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-24"></div>
    </div>

    <!-- Payment Setup and Restaurants -->
    <div class="columns is-gapless">
      <!-- Left Gap -->
      <div class="column is-narrow w-24"></div>

      <!-- Left Column -->
      <div class="column">
        <div class="m-l-24 m-r-24">
          <!-- Payment -->
          <div class="m-t-24">
            <div class="t-h6 c-text-black-disabled m-b-8">{{$t('admin.payment')}}</div>

            <!-- Payment Feature Disabled -->
            <div v-if="hidePayment" style="text-align: center;">
              <div class="bg-surface r-8 d-low p-t-24 p-b-24">
                <div class="p-l-24 p-r-24 t-body1 c-text-black-medium">{{ $t('admin.hidePayment') }}</div>
              </div>
            </div>

            <!-- Payment Feature Enabled -->
            <div v-else>
              <div class="bg-surface r-8 d-low p-t-24 p-b-24">
                <!-- Stripe Not Connected -->
                <div v-if="!hasStripe">
                  <div class="align-center">
                    <div
                      class="op-status c-status-red bg-status-red-bg"
                    >{{$t('admin.payments.statusNotConnected')}}</div>
                  </div>
                  <div
                    class="p-l-24 p-r-24 m-t-24 t-body1 c-text-black-medium"
                  >{{$t('admin.payments.pleaseConnect')}}</div>
                  <div class="align-center m-t-24">
                    <a :href="stripeLink">
                      <div class="op-button-medium primary" style="min-width: 288px;">
                        <span class="p-l-16 p-r-16">{{$t('admin.payments.connectStripe')}}</span>
                      </div>
                    </a>
                  </div>
                </div>

                <!-- Stripe Connected -->
                <div v-if="hasStripe">
                  <div class="align-center">
                    <div
                      class="op-status c-status-green bg-status-green-bg"
                    >{{$t('admin.payments.statusConnected')}}</div>
                  </div>
                  <div class="align-center m-t-24">
                    <a href="https://dashboard.stripe.com/dashboard" target="_blank">
                      <div class="op-button-small secondary" style="min-width: 256px;">
                        <span class="c-primary p-l-16 p-r-16">{{$t('admin.payments.openDashboard')}}</span>
                      </div>
                    </a>
                  </div>
                  <div class="align-center m-t-16">
                    <b-button
                      @click="handlePaymentAccountDisconnect"
                      class="b-reset op-button-text"
                      :loading="isDisconnecting"
                    >
                      <i class="material-icons c-status-red">link_off</i>
                      <span class="c-status-red">{{$t('admin.payments.disconnectStripe')}}</span>
                    </b-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="column">
        <div class="m-l-24 m-r-24">
          <!-- Restaurants -->
          <div class="m-t-24">
            <div class="t-h6 c-text-black-disabled m-b-8">{{$t('admin.restaurant')}}</div>
            <div v-if="readyToDisplay">
              <!-- No Restaurant -->
              <div v-if="existsRestaurant === null"></div>
              <div v-else-if="!existsRestaurant">
                <div class="border-primary r-8 p-l-24 p-r-24 p-t-24 p-b-24">
                  <div class="align-center t-subtitle1 c-primary">{{$t('admin.addYourRestaurant')}}</div>
                  <div class="align-center m-t-16">
                    <b-button
                      class="b-reset op-button-pill h-36 bg-form"
                      style="min-width: 128px;"
                      @click="handleNew"
                      :loading="isCreating"
                    >
                      <i class="material-icons c-primary m-l-8">add</i>
                      <span class="c-primary t-button">{{$t('admin.addNewRestaurant')}}</span>
                    </b-button>
                  </div>
                </div>
              </div>

              <!-- Existing Restaurant -->
              <div v-if="existsRestaurant">
                <div v-for="restaurantItem in restaurantItems" :key="restaurantItem.id">
                  <restaurant-edit-card
                    :restprofilephoto="restaurantItem.restProfilePhoto||''"
                    :restaurantid="restaurantItem.restaurantid"
                    :restaurantname="restaurantItem.restaurantName||''"
                    :streetaddress="restaurantItem.streetAddress||''"
                    :city="restaurantItem.city||''"
                    :state="restaurantItem.state||''"
                    :zip="restaurantItem.zip||''"
                    :phonenumber="restaurantItem.phoneNumber||''"
                    :url="restaurantItem.url"
                    :tags="restaurantItem.tags||[]"
                    :uid="restaurantItem.uid"
                    :publicflag="restaurantItem.publicFlag||false"
                    :numberOfMenus="restaurantItem.numberOfMenus||0"
                    :numberOfOrders="restaurantItem.numberOfOrders||0"
                  ></restaurant-edit-card>
                </div>

                <!-- Add Restaurant -->
                <div class="align-center m-t-16">
                  <b-button
                    class="b-reset op-button-pill h-36 bg-form"
                    style="min-width: 128px;"
                    @click="handleNew"
                    :loading="isCreating"
                  >
                    <i class="material-icons c-primary m-l-8">add</i>
                    <span class="c-primary t-button">{{$t('admin.addNewRestaurant')}}</span>
                  </b-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-24"></div>
    </div>
  </div>
</template>

<script>
import { db, firestore, functions } from "~/plugins/firebase.js";
import RestaurantEditCard from "~/app/admin/Restaurant/RestaurantEditCard";
import { order_status } from "~/plugins/constant.js";
import { releaseConfig } from "~/plugins/config.js";
import { midNight } from "~/plugins/dateUtils.js";
import { stripeConnect, stripeDisconnect } from "~/plugins/stripe.js";
import { ownPlateConfig } from "@/config/project";

export default {
  name: "Restaurant",
  components: {
    RestaurantEditCard
  },
  data() {
    return {
      region: ownPlateConfig.region,
      readyToDisplay: false,
      isCreating: false,
      isDisconnecting: false,
      restProfilePhoto: null,
      restProfilePhotoImageUrl: "",
      restCoverPhoto: null,
      restCoverPhotoImageUrl: "",
      restaurantName: "",
      streetAddress: "",
      city: "",
      state: "",
      zip: "",
      phoneNumber: "",
      url: "",
      tags: "",
      restaurantItems: null,
      paymentItems: {}, // { stripe:true, ... }
      detachers: [],
      restaurant_detacher: null,
      stripe_connnect_detacher: null
    };
  },
  created() {
    this.checkAdminPermission();
  },
  async mounted() {
    const code = this.$route.query.code;
    if (code) {
      console.log("**** found code");
      try {
        const response = await stripeConnect({ code });
        console.log(response);
        // TODO: show connected view
      } catch (error) {
        // TODO: show error modal
        console.log(error);
      }
    }

    this.stripe_connnect_detacher = db
      .doc(`/admins/${this.uid}/public/stripe`)
      .onSnapshot({
        next: snapshot => {
          console.log("public/stripe", snapshot.data());
          if (snapshot.exists) {
            const stripe = snapshot.data()["isConnected"];
            this.paymentItems = Object.assign({}, this.paymentItems, {
              stripe
            });
            console.log("paymentItems", this.paymentItems);
          }
        }
      });

    try {
      this.restaurant_detacher = db
        .collection("restaurants")
        .where("uid", "==", this.uid)
        // todo add Condition .where("deletedFlag", "==", false)
        .onSnapshot(async result => {
          try {
            if (result.empty) {
              this.restaurantItems = []; // so that we present "No restaurant"
              return;
            }
            this.restaurantItems = (result.docs || [])
              .map(doc => {
                const restaurantId = doc.id;

                if (doc.data().deletedFlag === undefined) {
                  doc.ref.update("deletedFlag", false); // for Backward compatible
                }

                const data = doc.data();
                data.restaurantid = doc.id;
                data.id = doc.id;
                return data;
              })
              .filter(res => {
                return !res.deletedFlag;
              });

            this.restaurantItems = await Promise.all(
              this.restaurantItems.map(async restaurant => {
                const menus = await db
                  .collection(`restaurants/${restaurant.id}/menus`)
                  .where("deletedFlag", "==", false)
                  .get();
                restaurant.numberOfMenus = menus.size;
                return restaurant;
              })
            );

            this.destroy_detacher();
            this.detachers = this.restaurantItems.map((restaurant, index) => {
              return (
                db
                  .collection(`restaurants/${restaurant.id}/orders`)
                  .where("timePlaced", ">=", midNight())
                  // IDEALLY: .where("status", "<", order_status.customer_picked_up)
                  .onSnapshot(result => {
                    this.restaurantItems = this.restaurantItems.map(
                      (r2, i2) => {
                        if (index === i2) {
                          r2.numberOfOrders = result.docs
                            .map(doc => doc.data())
                            .filter(data => {
                              // We need this filter here because Firebase does not allow us to do
                              return (
                                data.status < order_status.customer_picked_up
                              );
                            }).length;
                        }
                        return r2;
                      }
                    );
                  })
              );
            });
          } catch (error) {
            console.log("Error fetch doc,", error);
          } finally {
            this.readyToDisplay = true;
          }
        });
    } catch (error) {
      console.log("Error fetch doc,", error);
    } finally {
      this.readyToDisplay = true;
    }
  },
  methods: {
    destroy_detacher() {
      this.detachers.map(detacher => {
        detacher();
      });
      this.detachers = [];
    },
    async handleNew() {
      console.log("handleNew");
      try {
        this.isCreating = true;
        const doc = await db.collection("restaurants").add({
          uid: this.uid,
          publicFlag: false,
          deletedFlag: false,
          createdAt: firestore.FieldValue.serverTimestamp()
        });
        this.$router.push(`/admin/restaurants/${doc.id}`);
      } catch (error) {
        console.log(error);
      } finally {
        this.isCreating = false;
      }
    },
    async handlePaymentAccountDisconnect() {
      this.$store.commit("setAlert", {
        code: "admin.payments.reallyDisconnectStripe",
        callback: async () => {
          try {
            this.isDisconnecting = true;
            const response = await stripeDisconnect({
              STRIPE_CLIENT_ID: process.env.STRIPE_CLIENT_ID
            });
            console.log(response);
            // TODO: show connected view
          } catch (error) {
            // TODO: show error modal
            console.error(error, error.details);
          } finally {
            this.isDisconnecting = false;
          }
        }
      });
    }
  },
  destroyed() {
    this.destroy_detacher();
    if (this.restaurant_detacher) {
      this.restaurant_detacher();
    }
    if (this.stripe_connnect_detacher) {
      this.stripe_connnect_detacher();
    }
  },
  computed: {
    stripeLink() {
      const redirectURI = `${location.protocol}//${location.host}${location.pathname}`;
      return `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${
        process.env.STRIPE_CLIENT_ID
      }&scope=read_write&redirect_uri=${encodeURI(redirectURI)}`;
    },
    hidePayment() {
      return releaseConfig.hidePayment;
    },
    uid() {
      return this.$store.getters.uidAdmin;
    },
    existsRestaurant() {
      if (this.restaurantItems === null) {
        return null;
      }
      if (this.restaurantItems.length > 0) {
        return true;
      }
      return false;
    },
    hasStripe() {
      console.log("paymentItems", this.paymentItems);
      return this.paymentItems["stripe"];
    }
  }
};
</script>
