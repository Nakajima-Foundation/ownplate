<template>
  <div v-if="$store.getters.uidAdmin">
    <!-- Welcome -->
    <div class="bg-op-yellow p-4">
      <div class="text-center text-2xl font-bold text-white pb-4">
        {{ $t("admin.welcomeMessage") }}
      </div>

      <div class="text-center">
        <!-- User Manuals -->
        <div class="inline-block px-1 pb-2" v-if="isJapan">
          <a
            href="https://docs.omochikaeri.com/manuals/manual.pdf"
            target="_blank"
          >
            <div
              class="inline-flex justify-center items-center rounded-full h-9 bg-white bg-opacity-80 px-4"
            >
              <i class="material-icons text-lg text-op-teal mr-2"
                >help_outline</i
              >
              <span class="text-sm font-bold text-op-teal">{{
                $t("admin.userManual")
              }}</span>
            </div>
          </a>
        </div>

        <!-- Support -->
        <div class="inline-block px-1 pb-2" v-if="isJapan">
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSfGR4kk65ynfkCRGJsvJz01HZf7AU1nGLL9Rn9i4G9-qiW6MQ/viewform"
            target="_blank"
          >
            <div
              class="inline-flex justify-center items-center rounded-full h-9 bg-white bg-opacity-80 px-4"
            >
              <i class="material-icons text-lg text-op-teal mr-2"
                >mail_outline</i
              >
              <span class="text-sm font-bold text-op-teal">{{
                $t("admin.suportPage")
              }}</span>
            </div>
          </a>
        </div>

        <!-- Facebook User Group -->
        <div class="inline-block px-1 pb-2" v-if="isJapan">
          <a
            href="https://www.facebook.com/groups/278028420106364/"
            target="_blank"
          >
            <div
              class="inline-flex justify-center items-center rounded-full h-9 bg-white bg-opacity-80 px-4"
            >
              <i class="fab fa-facebook text-lg text-op-teal mr-2"></i>
              <span class="text-sm font-bold text-op-teal">{{
                $t("admin.facebookUserGroup")
              }}</span>
            </div>
          </a>
        </div>
      </div>
    </div>

    <!-- News -->
    <div
      v-if="region === 'JP'"
      class="mx-6 mt-6 border-solid border-black border-opacity-10 border-2 rounded-lg px-4 py-2"
    >
      <div class="flex">
        <div class="flex-1">
          <span class="text-sm font-bold text-black text-opacity-40">{{
            news.date.replace(/\-/g, ".")
          }}</span>
        </div>

        <div>
          <nuxt-link :to="'/admin/news/'">
            <span class="text-sm font-bold">{{
              $t("admin.news.newsTop")
            }}</span>
          </nuxt-link>
        </div>
      </div>

      <div class="mt-2">
        <nuxt-link :to="'/admin/news/' + news.date">
          <span class="text-base font-bold">{{ news.title }}</span>
        </nuxt-link>
      </div>
    </div>

    <!-- Unset Warning -->
    <div
      v-if="unsetWarning"
      class="mx-6 mt-6 bg-red-700 bg-opacity-10 rounded-lg p-4"
    >
      <span class="text-red-700 text-sm">{{
        $t("admin.payments.unsetWarning")
      }}</span>
    </div>

    <!-- Restaurants and Payment Setup -->
    <div class="mt-6 mx-6 grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12">
      <!-- Restaurants -->
      <div>
        <div class="text-xl font-bold text-black text-opacity-40 mb-2">
          {{ $t("admin.restaurant") }}
        </div>

        <div v-if="readyToDisplay">
          <!-- No Restaurant -->
          <div v-if="existsRestaurant === null"></div>
          <div v-else-if="!existsRestaurant">
            <div class="border-2 border-solid border-op-teal rounded-lg p-6">
              <div class="text-center text-base font-bold text-op-teal">
                {{ $t("admin.addYourRestaurant") }}
              </div>
              <div class="text-center mt-4">
                <b-button
                  @click="handleNew"
                  :loading="isCreating"
                  class="b-reset-tw"
                >
                  <div
                    class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
                  >
                    <i class="material-icons text-lg text-op-teal mr-2">add</i>
                    <span class="text-sm font-bold text-op-teal">{{
                      $t("admin.addNewRestaurant")
                    }}</span>
                  </div>
                </b-button>
              </div>
            </div>
          </div>

          <!-- Existing Restaurant -->
          <div v-if="existsRestaurant">
            <div class="grid grid-cols-1 space-y-2">
              <div
                v-for="restaurantItem in restaurantItems"
                :key="restaurantItem.id"
              >
                <restaurant-edit-card
                  :shopInfo="restaurantItem"
                  :restaurantid="restaurantItem.restaurantid"
                  :numberOfMenus="restaurantItem.numberOfMenus || 0"
                  :numberOfOrders="restaurantItem.numberOfOrders || 0"
                  :lineEnable="lines[restaurantItem.id] || false"
                  :shopOwner="shopOwner"
                ></restaurant-edit-card>
              </div>
            </div>

            <!-- Add Restaurant -->
            <div v-if="existsRestaurant" class="text-center mt-4">
              <b-button
                @click="handleNew"
                :loading="isCreating"
                class="b-reset-tw"
              >
                <div
                  class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
                >
                  <i class="material-icons text-lg text-op-teal mr-2">add</i>
                  <span class="text-sm font-bold text-op-teal">{{
                    $t("admin.addNewRestaurant")
                  }}</span>
                </div>
              </b-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Setup -->
      <div class="mt-6 lg:mt-0">
        <!-- Payment -->
        <payment-section @updateUnsetWarning="updateUnsetWarning($event)" />

        <!-- Notes -->
        <div class="mt-6">
          <div class="text-xl font-bold text-black text-opacity-40 mb-2">
            {{ $t("admin.notes.title") }}
          </div>

          <div
            class="border-2 border-solid border-black border-opacity-10 rounded-lg p-4"
          >
            <div>
              <div class="text-base font-bold text-black text-opacity-60 pb-2">
                {{ $t("admin.notes.userRestaurantsTitle") }}
              </div>
              <div class="text-base text-black text-opacity-60">
                {{ $t("admin.notes.userRestaurantsBody") }}
              </div>
            </div>

            <div
              class="border-t-2 border-solid border-black border-opacity-10 mt-4 pt-4"
            >
              <div class="text-base font-bold text-black text-opacity-60 pb-2">
                {{ $t("admin.notes.notificationSoundTitle") }}
              </div>
              <div class="text-base text-black text-opacity-60">
                {{ $t("admin.notes.notificationSoundBody") }}
              </div>
            </div>
          </div>
        </div>

        <!-- Mail Magazine -->
        <div class="mt-6">
          <div class="text-xl font-bold text-black text-opacity-40 mb-2">
            {{ $t("admin.mail.magazine.title") }}
          </div>

          <div class="bg-white shadow rounded-lg p-4">
            <div class="text-base text-black text-opacity-60">
              {{ $t("admin.mail.magazine.body") }}
            </div>

            <div class="text-center mt-4">
              <b-checkbox v-model="opt_out">
                {{ $t("admin.mail.magazine.optout") }}
              </b-checkbox>
            </div>
          </div>
        </div>
      </div>
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
      unsetWarning: true,
      lines: {},
      shopOwner: null,
      opt_out: null
    };
  },
  created() {
    this.checkAdminPermission();
  },
  async mounted() {
    try {
      this.shopOwner = await this.getShopOwner(this.$store.getters.uidAdmin);
      const adminConfig = await db
        .doc(`/adminConfigs/${this.$store.getters.uidAdmin}`)
        .get();
      this.adminConfig = adminConfig.exists ? adminConfig.data() : {};
      this.opt_out = this.adminConfig.opt_out || false;
      this.restaurant_detacher = db
        .collection("restaurants")
        .where("uid", "==", this.uid)
        .where("deletedFlag", "==", false)
        .orderBy("createdAt", "asc")
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
    db.collectionGroup("lines")
      .where("uid", "==", this.uid)
      .onSnapshot(result => {
        result.docs.map(async res => {
          const restaurantId = res.data().restaurantId;
          this.lines[restaurantId] = true;
        });
      });
  },
  watch: {
    async opt_out() {
      if (this.adminConfig.opt_out !== this.opt_out) {
        const config = { ...this.adminConfig };
        config["opt_out"] = this.opt_out;
        await db
          .doc(`/adminConfigs/${this.$store.getters.uidAdmin}`)
          .set(config);
      }
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
