<template>
  <div v-if="$store.getters.uidAdmin">
    <!-- Partnets -->
    <Partners :shopOwner="shopOwner" v-if="shopOwner" />
    
    <!-- Welcome and Link -->
    <WelcomeAndLinks />

    <!-- News -->
    <News />

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
    <div
      class="mt-6 mx-6 grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12"
      v-if="messages.length > 0"
    >
      <div>
        <div class="pb-2">
          <span class="text-xl font-bold text-black text-opacity-40 mb-2">
            {{ $t("admin.messages.title") }}
          </span>
        </div>
        <div
          v-for="(message, k) in messages"
          :key="k"
          class="border-2 border-solid border-op-teal rounded-lg p-6"
        >
          <MessageCard :message="message" />
        </div>
      </div>
    </div>

    <!-- Restaurants and Right Settin Section -->
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
            <!-- All Orders -->
            <div v-if="isOwner && restaurantLists.length > 1" class="mb-2">
              <router-link :to="'/admin/orders/'">
                <div
                  class="bg-black bg-opacity-5 rounded-lg px-4 py-3 text-center"
                >
                  <span class="text-sm font-bold">{{
                    $t("admin.viewAllOrders")
                  }}</span>
                </div>
              </router-link>
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
                                  (groupMasterRestaurant ?  groupMasterRestaurant : restaurantItems[restaurantId]).numberOfMenus || 0
                  "
                  :numberOfOrders="
                                   numberOfOrderObj[restaurantId] || 0
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

      <!-- Right Section -->
      <div class="mt-6 lg:mt-0" v-if="isOwner">
        <!-- Payment -->
        <payment-section @updateUnsetWarning="updateUnsetWarning($event)" />

        <!-- SubAccounts -->
        <div class="mt-6">
          <div class="text-xl font-bold text-black text-opacity-40 mb-2">
            {{ $t("admin.subAccounts.title") }}
          </div>

          <div class="bg-white shadow rounded-lg p-4">
            <div class="text-center mt-2">
              {{ $t("admin.subAccounts.description") }}
            </div>
            <div class="text-center mt-2">
              <router-link
                to="/admin/subaccounts"
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

        <!-- Note -->
        <Note />

        <!-- Mail Magazine-->
        <MailMagazine />

        <!-- Smaregi-->
        <Smaregi />
      </div>
      <!-- End of Right Section -->
    </div>
    <div class="bg-op-yellow p-4 mt-6">
      <!-- Footer -->
      <Footer />
    </div>
  </div>
</template>

<script>
import {
  defineComponent,
  ref,
  computed,
  watch,
  onUnmounted,
  onMounted,
} from "@vue/composition-api";

import { db } from "@/lib/firebase/firebase9";
import { doc, getDoc, collection, where, query, orderBy, onSnapshot } from "firebase/firestore";


import { db as dbOld, firestore } from "@/plugins/firebase";

import { order_status } from "@/config/constant";
import { midNight } from "@/utils/dateUtils";

import RestaurantEditCard from "@/app/admin/Restaurant/RestaurantEditCard.vue";
import PaymentSection from "@/app/admin/Payment/PaymentSection.vue";
import MessageCard from "./Messages/MessageCard.vue";

import WelcomeAndLinks from "@/app/admin/Index/WelcomeAndLinks.vue";
import News from "@/app/admin/Index/News.vue";
import Note from "@/app/admin/Index/Note.vue";
import MailMagazine from "@/app/admin/Index/MailMagazine.vue";
import Smaregi from "@/app/admin/Index/Smaregi.vue";
import Footer from "@/app/admin/Index/Footer.vue";
import Partners from "@/app/admin/Index/Partners.vue";

import { getShopOwner, doc2data, arrayChunk } from "@/utils/utils";
import { checkAdminPermission } from "@/utils/userPermission/";

export default defineComponent({
  name: "Restaurant",
  components: {
    PaymentSection,
    RestaurantEditCard,
    MessageCard,
    WelcomeAndLinks,
    News,
    Partners,
    Smaregi,
    MailMagazine,
    Note,
    Footer,
  },
  props: {
    groupMasterRestaurant: {
      type: Object,
      required: false,
    },
  },
  metaInfo() {
    return {
      title: ["Admin Index", this.defaultTitle].join(" / "),
    };
  },
  setup(props, ctx) {
    const readyToDisplay = ref(false);
    const isCreating = ref(false);
    const restaurantItems = ref(null);
    const orderDetachers = ref([]);
    const restaurant_detacher = ref(null);
    const message_detacher = ref(null);
    const unsetWarning = ref(true);
    const lines = ref({});
    const shopOwner = ref(null);
    const restaurantLists = ref([]);
    const numberOfOrderObj = ref({});
    const messages = ref([]);
    if (!checkAdminPermission(ctx)) {
      return;
    }
    
    const detachOrders = () => {
      orderDetachers.value.map((detacher) => {
        detacher();
      });
      orderDetachers.value = [];
    };
    
    const isOwner = computed(() => {
      return !ctx.root.$store.getters.isSubAccount;
    });
    const uid = computed (() => {
      return ctx.root.$store.getters.uidAdmin;
    });
    const ownerUid = computed(() => {
      return ctx.root.$store.getters.isSubAccount
        ? ctx.root.$store.getters.parentId
        : ctx.root.$store.getters.uidAdmin;
    });

    const watchOrder = () => {
      detachOrders();
      orderDetachers.value = Object.keys(restaurantItems.value).map(
        (restaurantId) => {
          return (
            onSnapshot(
              query(
                collection(db, `restaurants/${restaurantId}/orders`),
                where("timePlaced", ">=", midNight())
              ),
              // IDEALLY: .where("status", "<", order_status.ready_to_pickup)
              (result) => {
                const newObj = {...numberOfOrderObj.value};
                newObj[restaurantId] = result.docs
                      .map((doc) => doc.data())
                      .filter((data) => {
                        // We need this filter here because Firebase does not allow us to do
                        return data.status < order_status.ready_to_pickup;
                      }).length;
                numberOfOrderObj.value = newObj;
              },
            )
          );
        }
      );
    };
    onMounted(async () => {
      try {
        shopOwner.value = isOwner.value ? await getShopOwner(ownerUid.value) : {};

        restaurantLists.value = await (async () => {
          if (isOwner.value) {
            const restaurantListsDoc = await getDoc(
              doc(db, `/admins/${uid.value}/public/RestaurantLists`)
            );
            return restaurantListsDoc.exists() ? restaurantListsDoc.data().lists || [] : [];
          } else {
            const restaurantListsDoc = await getDoc(
              doc(db, `/admins/${ownerUid.value}/children/${uid.value}`)
            );
            return restaurantListsDoc.exists() ? restaurantListsDoc.data().restaurantLists || [] : [];
          }
        })();
        
        if (isOwner.value) {
          restaurant_detacher.value = onSnapshot(
            query(
              collection(db, "restaurants"),
              where("uid", "==", ownerUid.value),
              where("deletedFlag", "==", false),
              orderBy("createdAt", "asc")
            ),
            async (result) => {
              try {
                if (result.empty) {
                  restaurantItems.value = {}; // so that we present "No restaurant"
                  return;
                }
                restaurantItems.value = (result.docs || []).reduce((tmp, doc) => {
                  tmp[doc.id] = doc2data("restaurant")(doc);
                  if (!restaurantLists.value.includes(doc.id)) {
                    restaurantLists.value.push(doc.id);
                  }
                  return tmp;
                }, {});
                watchOrder();
              } catch (error) {
                console.log("Error fetch doc,", error);
              } finally {
                readyToDisplay.value = true;
              }
            }
          );
        }
        if (!isOwner.value && restaurantLists.value.length > 0) {
          // sub account
          arrayChunk(restaurantLists.value, 10).map((restaurantIds) => {
            restaurant_detacher.value = onSnapshot(
              query(
                collection(db, "restaurants"),
                where("uid", "==", ownerUid.value),
                where("restaurantId", "in", restaurantIds),
                where("deletedFlag", "==", false),
                orderBy("createdAt", "asc")
              ),
              async (result) => {
                try {
                  if (result.empty &&  restaurantItems.value === null) {
                    restaurantItems.value = {}; // so that we present "No restaurant"
                    return;
                  }
                  
                  restaurantItems.value = (result.docs || []).reduce((tmp, doc) => {
                    tmp[doc.id] = doc2data("restaurant")(doc);
                    return tmp;
                  }, {});
                  // if subAccounts has more than 11 restaurant, this will call multiple. TODO: optimize.
                  watchOrder();
                } catch (error) {
                  console.log("Error fetch doc,", error);
                } finally {
                  readyToDisplay.value = true;
                }
              }
            );
          });
        }
      } catch (error) {
        console.log("Error fetch doc,", error);
      } finally {
        readyToDisplay.value = true;
      }
      if (isOwner.value) {
        dbOld.collectionGroup("lines")
          .where("uid", "==", uid.value)
          .onSnapshot((result) => {
            result.docs.map(async (res) => {
              const restaurantId = res.data().restaurantId;
              lines.value[restaurantId] = true;
            });
          });
      }
      
      message_detacher.value = dbOld
        .collection(`/admins/${uid.value}/messages`)
        .orderBy("createdAt", "desc")
        .onSnapshot((messageCollection) => {
          messages.value = messageCollection.docs
            .map(doc2data("message"))
            .filter((a) => a.toDisplay);
        });
    });

    const saveRestaurantLists = async () => {
      if (isOwner.value) {
        await dbOld
          .doc(`/admins/${uid.value}/public/RestaurantLists`)
          .set({ lists: restaurantLists.value }, { merge: true });
      }
    };
    const handleNew = async () => {
      console.log("handleNew");
      if (isOwner.value) {
        try {
          isCreating.value = true;
          const doc = await dbOld.collection("restaurants").doc();
          // update Lists
          restaurantLists.value.push(doc.id);
          saveRestaurantLists();

          doc.set({
            uid: uid.value,
            restaurantId: doc.id,
            menuLists: [],
            publicFlag: false,
            numberOfMenus: 0,
            deletedFlag: false,
            createdAt: firestore.FieldValue.serverTimestamp(),
          });

          ctx.root.$router.push(`/admin/restaurants/${doc.id}`);
        } catch (error) {
          console.log(error);
        } finally {
          isCreating.value = false;
        }
      }
    };
    const updateUnsetWarning = (value) => {
      unsetWarning.value = value;
    };
    const positionUp = async (itemKey) => {
      if (isOwner.value) {
        const pos = restaurantLists.value.indexOf(itemKey);
        if (pos !== 0 && pos !== -1) {
          const newRestaurantLists = [...restaurantLists.value];
          const tmp = newRestaurantLists[pos - 1];
          newRestaurantLists[pos - 1] = newRestaurantLists[pos];
          newRestaurantLists[pos] = tmp;

          restaurantLists.value = newRestaurantLists;
          await saveRestaurantLists();
        }
      }
    };
    const positionDown = async (itemKey) => {
      if (isOwner.value) {
        const pos = restaurantLists.value.indexOf(itemKey);
        if (pos < restaurantLists.value.length - 1 && pos !== -1) {
          const newRestaurantLists = [...restaurantLists.value];
          const tmp = newRestaurantLists[pos + 1];
          newRestaurantLists[pos + 1] = newRestaurantLists[pos];
          newRestaurantLists[pos] = tmp;

          restaurantLists.value = newRestaurantLists;

          await saveRestaurantLists();
        }
      }
    }
    const deleteFromRestaurantLists = async (restaurantId) => {
      if (isOwner.value) {
        // push list
        const newRestaurantLists = [...restaurantLists.value];
        const pos = newRestaurantLists.indexOf(restaurantId);
        newRestaurantLists.splice(pos, 1);
        restaurantLists.value = newRestaurantLists;

        const path = `/admins/${uid.value}/public/RestaurantLists`;
        await dbOld.doc(path).set({ lists: newRestaurantLists }, { merge: true });
        // end of list
      }
    };
    onUnmounted(() => {
      detachOrders();
      if (restaurant_detacher.value) {
        restaurant_detacher.value();
      }
      if (message_detacher.value) {
        message_detacher.value();
      }
    });

    const existsRestaurant = computed(() => {
      if (restaurantItems.value === null) {
        return null;
      }
      if (Object.keys(restaurantItems.value).length > 0) {
        return true;
      }
      return false;
    });
    return {
      // ref
      readyToDisplay,
      isCreating,
      restaurantItems,
      unsetWarning,
      lines,
      shopOwner,
      restaurantLists,
      messages,
      numberOfOrderObj,
      
      // computed
      isOwner,
      existsRestaurant,

      // methods
      handleNew,
      updateUnsetWarning,
      positionUp,
      positionDown,
      deleteFromRestaurantLists,
      saveRestaurantLists,

      
    };
  },
});
</script>
