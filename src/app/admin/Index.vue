<template>
  <div v-if="$store.getters.uidAdmin">
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
              <div class="t-h6 c-ownplate-white">{{ $t("admin.welcomeMessage") }}</div>
              <div>
                <!-- User Manuals -->
                <div v-if="isJapan" class="is-inline-block m-l-8 m-r-8 m-t-24">
                  <a
                    href="https://gluepass.jp/g/ownplatejp/pg/Zy8VserQdTxFVKLaFcOK"
                    target="_blank"
                  >
                    <div class="op-button-small bg-text-white-high">
                      <i class="material-icons c-primary s-18 m-r-8">help_outline</i>
                      <span class="c-primary t-button">
                        {{
                        $t("admin.userManual")
                        }}
                      </span>
                    </div>
                  </a>
                </div>

                <!-- Support -->
                <div v-if="isJapan" class="is-inline-block m-l-8 m-r-8 m-t-24">
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSfGR4kk65ynfkCRGJsvJz01HZf7AU1nGLL9Rn9i4G9-qiW6MQ/viewform"
                    target="_blank"
                  >
                    <div class="op-button-small bg-text-white-high">
                      <i class="material-icons c-primary s-18 m-r-8">mail_outline</i>
                      <span class="c-primary t-button">
                        {{
                        $t("admin.suportPage")
                        }}
                      </span>
                    </div>
                  </a>
                </div>

                <!-- Facebook User Group -->
                <div v-if="isJapan" class="is-inline-block m-l-8 m-r-8 m-t-24">
                  <a href="https://www.facebook.com/groups/278028420106364/" target="_blank">
                    <div class="op-button-small bg-text-white-high">
                      <i class="fab fa-facebook c-primary m-r-8" style="font-size:18px" />
                      <span class="c-primary t-button">
                        {{
                        $t("admin.facebookUserGroup")
                        }}
                      </span>
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

    <!-- News -->
    <div class="columns is-gapless" v-if="region === 'JP'">
      <!-- Left Gap -->
      <div class="column is-narrow w-24"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="m-l-24 m-r-24">
          <div
            class="r-8 p-l-16 p-r-16 p-t-8 p-b-8 m-t-24"
            style="border: 2px solid rgba(0,0,0,0.1); "
          >
            <div class="cols">
              <div class="t-subtitle2 c-text-black-disabled">{{ news.date.replace(/\-/g, ".") }}</div>
              <div class="t-subtitle2 c-primary flex-1 align-right">
                <nuxt-link :to="'/admin/news/'">
                  {{
                  $t("admin.news.newsTop")
                  }}
                </nuxt-link>
              </div>
            </div>
            <!-- News Item -->
            <div class="t-subtitle1 c-primary m-t-4">
              <nuxt-link :to="'/admin/news/' + news.date">
                {{
                news.title
                }}
              </nuxt-link>
            </div>
          </div>
        </div>
      </div>
      <!-- Right Gap -->
      <div class="column is-narrow w-24"></div>
    </div>

    <!-- Unset Warning -->
    <div class="columns is-gapless" v-if="unsetWarning">
      <!-- Left Gap -->
      <div class="column is-narrow w-24"></div>
      <!-- Center Column -->
      <div class="column">
        <div class="m-l-24 m-r-24">
          <div class="bg-status-red-bg r-8 p-l-16 p-r-16 p-t-16 p-b-16 l m-b-8 m-t-24">
            <span class="t-body2 c-status-red">{{ $t("admin.payments.unsetWarning") }}</span>
          </div>
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
          <!-- Restaurants -->
          <div class="m-t-24">
            <div class="t-h6 c-text-black-disabled m-b-8">{{ $t("admin.restaurant") }}</div>
            <div v-if="readyToDisplay">
              <!-- No Restaurant -->
              <div v-if="existsRestaurant === null"></div>
              <div v-else-if="!existsRestaurant">
                <div class="border-primary r-8 p-l-24 p-r-24 p-t-24 p-b-24">
                  <div
                    class="align-center t-subtitle1 c-primary"
                  >{{ $t("admin.addYourRestaurant") }}</div>
                  <div class="align-center m-t-16">
                    <b-button
                      class="b-reset op-button-pill h-36 bg-form"
                      style="min-width: 128px;"
                      @click="handleNew"
                      :loading="isCreating"
                    >
                      <i class="material-icons c-primary m-l-8">add</i>
                      <span class="c-primary t-button">
                        {{
                        $t("admin.addNewRestaurant")
                        }}
                      </span>
                    </b-button>
                  </div>
                </div>
              </div>

              <!-- Existing Restaurant -->
              <div v-if="existsRestaurant">
                <div v-for="restaurantItem in restaurantItems" :key="restaurantItem.id">
                  <restaurant-edit-card
                    :shopInfo="restaurantItem"
                    :restaurantid="restaurantItem.restaurantid"
                    :numberOfMenus="restaurantItem.numberOfMenus || 0"
                    :numberOfOrders="restaurantItem.numberOfOrders || 0"
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
                    <span class="c-primary t-button">
                      {{
                      $t("admin.addNewRestaurant")
                      }}
                    </span>
                  </b-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="column">
        <div class="m-l-24 m-r-24">
          <!-- Payment -->
          <payment-section @updateUnsetWarning="updateUnsetWarning($event)" />

          <!-- Notes -->
          <div class="m-t-24">
            <div class="t-h6 c-text-black-disabled">{{$t("admin.notes.title")}}</div>
            <div
              class="r-8 p-l-24 p-r-24 p-t-24 p-b-24 m-t-8"
              style="border: 2px solid rgba(0,0,0,0.1); "
            >
              <div
                class="t-subtitle1 c-text-black-medium"
              >{{$t("admin.notes.userRestaurantsTitle")}}</div>
              <div
                class="t-body1 c-text-black-medium m-t-8"
              >{{$t("admin.notes.userRestaurantsBody")}}</div>
              <hr />
              <div
                class="t-subtitle1 c-text-black-medium"
              >{{$t("admin.notes.notificationSoundTitle")}}</div>
              <div
                class="t-body1 c-text-black-medium m-t-8"
              >{{$t("admin.notes.notificationSoundBody")}}</div>
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
import { midNight } from "~/plugins/dateUtils.js";
import { ownPlateConfig } from "@/config/project";
import PaymentSection from "~/app/admin/Payment/PaymentSection";
import newsList from "./News/data";

export default {
  name: "Restaurant",
  components: {
    PaymentSection,
    RestaurantEditCard
  },
  data() {
    return {
      region: ownPlateConfig.region,
      readyToDisplay: false,
      isCreating: false,
      restaurantItems: null,
      detachers: [],
      restaurant_detacher: null,
      news: newsList[0],
      unsetWarning: true
    };
  },
  created() {
    this.checkAdminPermission();
  },
  async mounted() {
    try {
      this.restaurant_detacher = db
        .collection("restaurants")
        .where("uid", "==", this.uid)
        .where("deletedFlag", "==", false)
        .onSnapshot(async result => {
          try {
            if (result.empty) {
              this.restaurantItems = []; // so that we present "No restaurant"
              return;
            }
            this.restaurantItems = (result.docs || [])
              .map(doc => {
                const restaurantId = doc.id;

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
                  // IDEALLY: .where("status", "<", order_status.ready_to_pickup)
                  .onSnapshot(result => {
                    this.restaurantItems = this.restaurantItems.map(
                      (r2, i2) => {
                        if (index === i2) {
                          r2.numberOfOrders = result.docs
                            .map(doc => doc.data())
                            .filter(data => {
                              // We need this filter here because Firebase does not allow us to do
                              return data.status < order_status.ready_to_pickup;
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
    updateUnsetWarning(value) {
      this.unsetWarning = value;
    }
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
      if (this.restaurantItems === null) {
        return null;
      }
      if (this.restaurantItems.length > 0) {
        return true;
      }
      return false;
    }
  }
};
</script>
