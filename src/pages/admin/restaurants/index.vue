<template>
  <section class="section">
    <h2 class="p-big bold">
      {{ $t('admin.yourRestaurants') }}
    </h2>

    <b-tabs size="is-medium" class="block" expanded>
      <b-tab-item :label="$t('admin.restaurant')">
        <div class="card block" v-if="readyToDisplay">
          <div class="card-content">
            <div
              v-if="!existsRestaurant"
              class="container content has-text-centered"
            >
              <b-icon icon="silverware" size="is-large"></b-icon>
              <h3>{{$t('admin.noRestaurant')}}</h3>
                {{$t('admin.addYourRestaurant')}}
            </div>
          </div>
          <div v-if="existsRestaurant">
            <div
              v-for="restaurantItem in restaurantItems"
              :key="restaurantItem.id"
            >
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
                :createdat="restaurantItem.createdAt"
                :numberOfMenus="restaurantItem.numberOfMenus||0"
                :numberOfOrders="restaurantItem.numberOfOrders||0"
              ></restaurant-edit-card>
            </div>
          </div>
          <a href="/admin/restaurants/create">
            <b-button
              style="margin-right:auto"
              type="is-primary"
              class="counter-button"
              expanded
              rounded
            >
              {{$t('admin.addNewRestaurant')}}
            </b-button>
          </a>
        </div>
      </b-tab-item>
      <b-tab-item :label="$t('admin.payment')">
        <div class="card block">
          <div class="card-content">
            <div
              v-if="!existsPayment"
              class="container content has-text-centered"
            >
              <b-icon icon="credit-card" size="is-large"></b-icon>
              <h3>{{$t('admin.addNewRestaurant')}}</h3>
                {{$t('admin.pleaseConnectPayment')}}
            </div>
          </div>
        </div>
        <a href="/admin/restaurants/new">
          <b-button
            style="margin-right:auto"
            type="is-primary"
            class="counter-button"
            expanded
            rounded
          >
            {{$t('admin.connectPaymentAccount')}}
          </b-button>
        </a>
      </b-tab-item>
    </b-tabs>
  </section>
</template>

<script>
import { db } from "~/plugins/firebase.js";
import RestaurantEditCard from "~/components/RestaurantEditCard";
import { order_status } from "~/plugins/constant.js";

export default {
  name: "Restaurant",
  components: {
    RestaurantEditCard
  },
  data() {
    return {
      readyToDisplay: false,
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
      restaurantItems: [],
      paymentItems: [],
      detachers: [],
      restaurant_detacher: null,
    };
  },
  created() {
    this.checkAdminPermission();
  },
  async mounted() {
    try {
      this.restaurant_detacher = db.collection("restaurants")
        .where("uid", "==", this.uid)
      // todo add Condition .where("deletedFlag", "==", false)
        .onSnapshot(async (result) => {
          try {
            if (result.empty) {
              return
            }
            this.restaurantItems = (result.docs || []).map(doc => {
              const restaurantId = doc.id;

              if (doc.deletedFlag === undefined) {
                doc.ref.update("deletedFlag", false); // for Backward compatible
              };

              const data = doc.data();
              data.restaurantid = doc.id;
              data.id = doc.id;
              return data;
            }).filter((res) => {
              return !res.deletedFlag;
            });

            this.restaurantItems = await Promise.all(this.restaurantItems.map(async (restaurant) => {
              const menus = await db.collection(`restaurants/${restaurant.id}/menus`).where("deletedFlag", "==", false).get();
              restaurant.numberOfMenus = menus.size;
              return restaurant;
            }));

            this.destroy_detacher();
            this.detachers = this.restaurantItems.map((restaurant, index)=>{
              return db.collection(`restaurants/${restaurant.id}/orders`)
                .where("status", "<", order_status.customer_picked_up)
                .where("status", ">=", order_status.customer_paid).onSnapshot((result) => {
                  this.restaurantItems = this.restaurantItems.map((r2, i2) => {
                    if (index === i2) {
                      r2.numberOfOrders = result.size;
                    }
                    return r2;
                  });
                });
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
      this.detachers.map((detacher) => {
        detacher();
      });
      this.detachers = [];
    },
  },
  destroyed() {
    this.destroy_detacher();
    if (this.restaurant_detacher) {
      this.restaurant_detacher();
    }
  },
  computed: {
    uid() {
      return this.$store.getters.uidAdmin;
    },
    existsRestaurant() {
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
  },
};
</script>
<style lang="scss" scoped>
.tax {
  margin-top: -2rem !important;
}
</style>
