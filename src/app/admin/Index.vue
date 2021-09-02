<template>
  <div v-if="$store.getters.uidAdmin">
    <!-- Welcome -->
    <!-- {{(shopOwner||{}).partners}} -->
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
      v-if="unsetWarning && isOwner"
      class="mx-6 mt-6 bg-red-700 bg-opacity-10 rounded-lg p-4"
    >
      <span class="text-red-700 text-sm">{{
        $t("admin.payments.unsetWarning")
      }}</span>
    </div>

    <!-- Messages -->
    <div class="mt-6 mx-6 grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12" v-if="messages.length > 0">
      <div>
        <div class="pb-2">
          <span class="text-xl font-bold text-black text-opacity-40 mb-2">
            {{ $t("admin.messages.title") }}
          </span>
        </div>
        <div v-for="(message, k) in messages" :key="k" class="border-2 border-solid border-op-teal rounded-lg p-6">
          <MessageCard :message="message"/>
        </div>
      </div>
    </div>

    <!-- Restaurants and Payment Setup -->
    <div class="mt-6 mx-6 grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12">
      <!-- Restaurants -->
      <div>
        <div class="pb-2">
          <span class="text-xl font-bold text-black text-opacity-40 mb-2">
            {{ $t("admin.restaurant") }}
          </span>
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
            <div v-if="restaurantLists.length > 1" class="mb-2">
              <nuxt-link :to="'/admin/orders/'">
                <div
                  class="bg-black bg-opacity-5 rounded-lg px-4 py-3 text-center"
                >
                  <span class="text-sm font-bold">{{
                    $t("admin.viewAllOrders")
                  }}</span>
                </div>
              </nuxt-link>
            </div>

            <div class="grid grid-cols-1 space-y-2">
              <div
                v-for="(restaurantId, index) in restaurantLists"
                :key="restaurantId"
              >
                <restaurant-edit-card
                  v-if="restaurantItems[restaurantId]"
                  :shopInfo="restaurantItems[restaurantId]"
                  :restaurantid="restaurantId"
                  :numberOfMenus="
                    restaurantItems[restaurantId].numberOfMenus || 0
                  "
                  :numberOfOrders="
                    restaurantItems[restaurantId].numberOfOrders || 0
                  "
                  :lineEnable="lines[restaurantId] || false"
                  :shopOwner="shopOwner"
                  :position="
                    index == 0
                      ? 'first'
                      : restaurantLists.length - 1 === index
                      ? 'last'
                      : ''
                  "
                  @positionUp="positionUp($event)"
                  @positionDown="positionDown($event)"
                  @deleteFromRestaurantLists="deleteFromRestaurantLists($event)"
                  :isOwner="isOwner"
                ></restaurant-edit-card>
              </div>
            </div>

            <!-- Add Restaurant -->
            <div v-if="existsRestaurant && isOwner" class="text-center mt-4">
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
      <div class="mt-6 lg:mt-0" v-if="isOwner">
        <!-- Payment -->
        <payment-section @updateUnsetWarning="updateUnsetWarning($event)" />

        <!-- Notes -->
        <div class="mt-6">
          <div class="text-xl font-bold text-black text-opacity-40 mb-2">
            {{ $t("admin.subAccounts.title") }}
          </div>

          <div
            class="bg-white shadow rounded-lg p-4"
            >
            <div class="text-center mt-2">
              {{ $t("admin.subAccounts.description") }}
            </div>
            <div class="text-center mt-2">
              <router-link to="/admin/subaccounts"
                target="stripe"
                class="h-12 rounded-full inline-flex items-center px-6 border-2 border-op-teal"
                           >
                <span class="text-op-teal text-base font-bold">{{
                  $t("admin.subAccounts.openDashboard")
                  }}</span>
                </router-link>
            </div>
            <div class="mt-4 text-center">
              <a
                href="https://docs.omochikaeri.com/manuals/aboutsubaccount.pdf"
                target="_blank"
                class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
                >
                <span class="text-sm font-bold text-op-teal">
                  {{ $t("admin.subAccounts.manualLink") }}</span
                                                           >
              </a>
            </div>
          </div>
        </div>

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
import MessageCard from "./Messages/MessageCard";

export default {
  name: "Restaurant",
  components: {
    PaymentSection,
    RestaurantEditCard,
    MessageCard
  },
  head() {
    return {
      title: ["Admin Index", this.defaultTitle].join(" / ")
    }
  },
  data() {
    return {
      region: ownPlateConfig.region,
      readyToDisplay: false,
      isCreating: false,
      restaurantItems: null,
      detachers: [],
      restaurant_detacher: null,
      message_detacher: null,
      news: newsList[0],
      unsetWarning: true,
      lines: {},
      shopOwner: null,
      opt_out: null,
      restaurantLists: [],
      messages: []
    };
  },
  created() {
    this.checkAdminPermission();
  },
  async mounted() {
    try {
      if (this.isOwner) {
        this.shopOwner = await this.getShopOwner(this.ownerUid);
        const adminConfig = await db
              .doc(`/adminConfigs/${this.ownerUid}`)
              .get();
        this.adminConfig = adminConfig.exists ? adminConfig.data() : {};
        this.opt_out = this.adminConfig.opt_out || false;

        const restaurantLists = await db
              .doc(`/admins/${this.$store.getters.uidAdmin}/public/RestaurantLists`)
              .get();
        this.restaurantLists =
          (restaurantLists.exists ? restaurantLists.data() : {}).lists || [];

      } else {
        const restaurantLists = await db
              .doc(`/admins/${this.ownerUid}/children/${this.$store.getters.uidAdmin}`)
              .get();
        this.restaurantLists =
          (restaurantLists.exists ? restaurantLists.data() : {}).restaurantLists || [];
        this.shopOwner = {};
      }

      this.restaurant_detacher = db
        .collection("restaurants")
        .where("uid", "==", this.ownerUid)
        .where("deletedFlag", "==", false)
        .orderBy("createdAt", "asc")
        .onSnapshot(async result => {
          try {
            if (result.empty) {
              this.restaurantItems = {}; // so that we present "No restaurant"
              return;
            }
            this.restaurantItems = (result.docs || []).reduce((tmp, doc) => {
              const restaurantId = doc.id;

              const data = doc.data();
              data.restaurantid = doc.id;
              data.id = doc.id;
              tmp[doc.id] = data;
              return tmp;
            }, {});

            if (this.isOwner && Object.keys(this.restaurantLists).length === 0) {
              this.restaurantLists = Object.keys(this.restaurantItems);
            }

            await Promise.all(
              Object.keys(this.restaurantItems).map(async restaurantId => {
                const menus = await db
                  .collection(`restaurants/${restaurantId}/menus`)
                  .where("deletedFlag", "==", false)
                  .get();
                const obj = { ...this.restaurantItems };
                obj[restaurantId].numberOfMenus = menus.size;
                this.restaurantItems = obj;
              })
            );

            this.destroy_detacher();
            this.detachers = Object.keys(this.restaurantItems).map(
              restaurantId => {
                return (
                  db
                    .collection(`restaurants/${restaurantId}/orders`)
                    .where("timePlaced", ">=", midNight())
                    // IDEALLY: .where("status", "<", order_status.ready_to_pickup)
                    .onSnapshot(result => {
                      const obj = { ...this.restaurantItems[restaurantId] };
                      obj.numberOfOrders = result.docs
                        .map(doc => doc.data())
                        .filter(data => {
                          // We need this filter here because Firebase does not allow us to do
                          return data.status < order_status.ready_to_pickup;
                        }).length;
                      this.restaurantItems[restaurantId] = obj;
                    })
                );
              }
            );
          } catch (error) {
            console.log("Error fetch doc,", error);
          } finally {
            this.readyToDisplay = true;
          }
          console.log(this.restaurantItems);
        });
    } catch (error) {
      console.log("Error fetch doc,", error);
    } finally {
      this.readyToDisplay = true;
    }
    if (this.isOwner) {
      db.collectionGroup("lines")
        .where("uid", "==", this.uid)
        .onSnapshot(result => {
          result.docs.map(async res => {
            const restaurantId = res.data().restaurantId;
            this.lines[restaurantId] = true;
          });
        });
    }

    this.message_detacher = db.collection(`/admins/${this.uid}/messages`)
          .orderBy("createdAt", "desc")
          .onSnapshot((messageCollection) => {
            this.messages = messageCollection.docs.map(this.doc2data("message")).filter(a => a.toDisplay);
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
      if (this.isOwner) {
        try {
          this.isCreating = true;
          const doc = await db.collection("restaurants").doc();
          // update Lists
          this.restaurantLists.push(doc.id);
          this.saveRestaurantLists();

          doc.set({
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
      }
    },
    updateUnsetWarning(value) {
      this.unsetWarning = value;
    },
    async positionUp(itemKey) {
      if (this.isOwner) {
        const pos = this.restaurantLists.indexOf(itemKey);
        if (pos !== 0 && pos !== -1) {
          const newRestaurantLists = [...this.restaurantLists];
          const tmp = newRestaurantLists[pos - 1];
          newRestaurantLists[pos - 1] = newRestaurantLists[pos];
          newRestaurantLists[pos] = tmp;

          this.restaurantLists = newRestaurantLists;
          await this.saveRestaurantLists();
        }
      }
    },
    async positionDown(itemKey) {
      if (this.isOwner) {
        const pos = this.restaurantLists.indexOf(itemKey);
        if (pos < this.restaurantLists.length - 1 && pos !== -1) {
          const newRestaurantLists = [...this.restaurantLists];
          const tmp = newRestaurantLists[pos + 1];
          newRestaurantLists[pos + 1] = newRestaurantLists[pos];
          newRestaurantLists[pos] = tmp;

          this.restaurantLists = newRestaurantLists;

          await this.saveRestaurantLists();
        }
      }
    },
    async deleteFromRestaurantLists(restaurantId) {
      if (this.isOwner) {
        // push list
        const newRestaurantLists = [...this.restaurantLists];
        const pos = newRestaurantLists.indexOf(restaurantId);
        newRestaurantLists.splice(pos, 1);
        this.restaurantLists = newRestaurantLists;

        const path = `/admins/${this.$store.getters.uidAdmin}/public/RestaurantLists`;
        await db.doc(path).set({ lists: newRestaurantLists }, { merge: true });
        // end of list
      }
    },
    async saveRestaurantLists() {
      if (this.isOwner) {
        await db
          .doc(`/admins/${this.$store.getters.uidAdmin}/public/RestaurantLists`)
          .set({ lists: this.restaurantLists }, { merge: true });
      }
    }
  },
  destroyed() {
    this.destroy_detacher();
    if (this.restaurant_detacher) {
      this.restaurant_detacher();
    }
    if (this.message_detacher) {
      this.message_detacher();
    }
  },
  computed: {
    ownerUid() {
      return this.$store.getters.isSubAccount ? this.$store.getters.parentId : this.uid;
    },
    isOwner() {
      return !this.$store.getters.isSubAccount;
    },
    restaurantLength() {
      return this.menuLists.length;
    },
    uid() {
      return this.$store.getters.uidAdmin;
    },
    existsRestaurant() {
      if (this.restaurantItems === null) {
        return null;
      }
      if (Object.keys(this.restaurantItems).length > 0) {
        return true;
      }
      return false;
    }
  }
};
</script>
