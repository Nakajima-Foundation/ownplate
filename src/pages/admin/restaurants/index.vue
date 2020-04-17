<template>
  <section class="section">
    <h2 class="p-big bold">{{ $t('admin.yourRestaurants') }}</h2>

    <b-tabs size="is-medium" class="block" expanded>
      <b-tab-item :label="$t('admin.restaurant')">
        <div class="card block" v-if="readyToDisplay">
          <div class="card-content">
            <div v-if="existsRestaurant === null"></div>
            <div v-else-if="!existsRestaurant" class="container content has-text-centered">
              <b-icon icon="silverware" size="is-large"></b-icon>
              <h3>{{$t('admin.noRestaurant')}}</h3>
              {{$t('admin.addYourRestaurant')}}
            </div>
          </div>
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
                :defaulttaxrate="restaurantItem.defauleTaxRate"
                :publicflag="restaurantItem.publicFlag||false"
                :numberOfMenus="restaurantItem.numberOfMenus||0"
                :numberOfOrders="restaurantItem.numberOfOrders||0"
              ></restaurant-edit-card>
            </div>
          </div>
          <b-button
            style="margin-right:auto"
            type="is-primary"
            class="counter-button"
            expanded
            rounded
            @click="handleNew"
            :loading="isCreating"
          >{{$t('admin.addNewRestaurant')}}</b-button>
        </div>
      </b-tab-item>
      <b-tab-item :label="$t('admin.payment')">
        <div v-if="hidePayment" style="text-align: center;">
          <div>
            <i class="fas fa-wrench" style="font-size:7em;margin:2rem"></i>
          </div>
          <h3>{{ $t('admin.hidePayment') }}</h3>
        </div>
        <div v-else>
          <div class="card block">
            <div class="card-content">
              <div v-if="!existsPayment" class="container content has-text-centered">
                <b-icon icon="credit-card" size="is-large"></b-icon>
                <h3>{{$t('admin.addNewRestaurant')}}</h3>
                {{$t('admin.pleaseConnectPayment')}}
              </div>
              <div v-if="existsPayment" class="container content has-text-centered">
                <b-button
                  @click="handlePaymentAccountDisconnect"
                  style="margin-right:auto"
                  type="is-primary"
                  class="counter-button"
                  expanded
                  rounded
                >{{$t('admin.disconnectPaymentAccount')}}</b-button>
              </div>
            </div>
          </div>
          <a :href="stripeLink">
            <b-button
              style="margin-right:auto"
              type="is-primary"
              class="counter-button"
              expanded
              rounded
            >{{$t('admin.connectPaymentAccount')}}</b-button>
          </a>
        </div>
      </b-tab-item>
    </b-tabs>
  </section>
</template>

<script>
import { db, firestore, functions } from "~/plugins/firebase.js";
import RestaurantEditCard from "~/components/RestaurantEditCard";
import { order_status } from "~/plugins/constant.js";
import { releaseConfig } from "~/plugins/config.js";
import { midNight } from "~/plugins/dateUtils.js";
import firebase from "firebase";
import "firebase/auth";
import "firebase/firestore";

export default {
  name: "Restaurant",
  components: {
    RestaurantEditCard
  },
  data() {
    return {
      readyToDisplay: false,
      isCreating: false,
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
      paymentItems: [],
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
      const stripeConnect = firebase
        .app()
        .functions("us-central1")
        .httpsCallable("stripe-connect");
      try {
        const response = await stripeConnect({ code });
        console.log(response);
        // TODO: show connected view
      } catch (error) {
        // TODO: show error modal
        console.log(error);
      }
    }

    this.stripe_connnect_detacher = firebase
      .firestore()
      .doc(`/admins/${this.uid}/public/stripe`)
      .onSnapshot({
        next: snapshot => {
          console.log(snapshot.data());
          if (snapshot.exists) {
            const isConected = snapshot.data()["isConnected"];
            this.paymentItems.push(isConected);
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
                  .where("timePaid", ">=", midNight())
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
      const stripeDisconnect = firebase
        .app()
        .functions("us-central1")
        .httpsCallable("stripe-disconnect");
      try {
        const response = await stripeDisconnect();
        console.log(response);
        // TODO: show connected view
      } catch (error) {
        // TODO: show error modal
        console.log(error);
      }
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
      const redirectURI = `${location.protocol}//${location.host}${process.env.STRIPE_AUTH_REDIRECT_URI}`;
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
    existsPayment() {
      if (this.paymentItems.length > 0) {
        return true;
      }
      return false;
    }
  }
};
</script>
<style lang="scss" scoped>
.tax {
  margin-top: -2rem !important;
}
</style>
