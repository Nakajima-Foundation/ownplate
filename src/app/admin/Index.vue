<template>
  <div v-if="$store.getters.uidAdmin">
    <!-- Partnets -->
    <Partners :shopOwner="shopOwner" v-if="shopOwner" />

    <!-- Welcome and Link -->
    <WelcomeAndLinks />

    <EmailVerify v-if="!emailVerified && !isInMo" />

    <!-- News -->
    <News />

    <!-- Unset Warning -->
    <div v-if="false" class="mx-6 mt-6 rounded-lg bg-red-700 bg-opacity-10 p-4">
      <span class="text-sm text-red-700">{{
        $t("admin.payments.unsetWarning")
      }}</span>
    </div>

    <!-- 5 steps warning -->
    <div
      v-if="isOwner && showFiveSteps"
      class="mx-6 mt-6 rounded-lg bg-red-700 bg-opacity-10 p-4"
    >
      <div>
        <span class="text-sm font-bold text-red-700">
          店舗を公開するまでの５ステップ
        </span>
      </div>
      <ul class="list-decimal">
        <ol>
          1.お支払い方法を選択してください。
          <a href="#paymentSection" v-if="unsetPaymentWarning" class="underline"
            >支払い方法の設定はこちら。</a
          >
          <img src="@/assets/images/sumi-1.svg" class="w-6" v-else />
        </ol>
        <ol>
          2.飲食店を追加して、店舗の情報を入力してください。
          <a href="#addRestaurant" v-if="!existsRestaurant" class="underline"
            >飲食店の追加はこちら。</a
          >
          <img src="@/assets/images/sumi-1.svg" class="w-6" v-else />
        </ol>
        <ol>
          3.メニューを２つ以上登録してください。
          <a href="#addMenu" v-if="!existMenu" class="underline"
            >メニュー追加はこちらの「メニュー」から。</a
          >
          <img src="@/assets/images/sumi-1.svg" class="w-6" v-else />
        </ol>
        <ol>
          4.店舗を「公開」にしてください。
          <a href="#addMenu" v-if="!existPublicRestaurant" class="underline"
            >公開への設定変更は「店情報の変更」から。</a
          >
          <img src="@/assets/images/sumi-1.svg" class="w-6" v-else />
        </ol>
        <ol>
          5.リストの掲載の申請をしてください。(オプション)
        </ol>
      </ul>
    </div>

    <!-- Messages -->
    <div
      class="mx-6 mt-6 grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12"
      v-if="messages.length > 0"
    >
      <div>
        <div class="pb-2">
          <span class="mb-2 text-xl font-bold text-black text-opacity-40">
            {{ $t("admin.messages.title") }}
          </span>
        </div>
        <div
          v-for="(message, k) in messages"
          :key="k"
          class="rounded-lg border-2 border-solid border-op-teal p-6"
        >
          <MessageCard :message="message" />
        </div>
      </div>
    </div>

    <div class="mx-6 mt-2 lg:text-center">
      <ToggleSwitch
        :toggleState="simpleMode"
        @toggleFunction="switchSimpleMode()"
        onName="admin.index.showSimple"
        offName="admin.index.showAll"
      />
    </div>

    <!-- Restaurants and Right Settin Section -->
    <div class="mx-6 mt-2 grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12">
      <!-- Restaurants -->
      <div>
        <div class="pb-2">
          <span class="mb-2 text-xl font-bold text-black text-opacity-40">
            {{
              $t(isInMo ? "mobileOrder.restaurantLists" : "admin.restaurant")
            }}
          </span>
        </div>

        <div v-if="readyToDisplay">
          <!-- No Restaurant -->
          <div v-if="existsRestaurant === null"></div>
          <div v-else-if="!existsRestaurant">
            <div
              class="rounded-lg border-2 border-solid border-red-700 bg-white p-6"
            >
              <a name="addRestaurant" />
              <div class="text-center text-base font-bold text-op-teal">
                {{ $t("admin.addYourRestaurant") }}
              </div>

              <div class="mt-4 text-center">
                <o-button @click="handleNew" class="b-reset-tw">
                  <div
                    class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
                  >
                    <i class="material-icons mr-2 text-lg text-op-teal">add</i>
                    <span class="text-sm font-bold text-op-teal">{{
                      $t(
                        isInMo
                          ? "mobileOrder.addNewRestaurant"
                          : "admin.addNewRestaurant"
                      )
                    }}</span>
                  </div>
                </o-button>
              </div>
            </div>
          </div>

          <!-- Existing Restaurant -->
          <div v-if="existsRestaurant">
            <!-- All Orders -->
            <div v-if="isOwner && restaurantLists.length > 1" class="mb-2">
              <router-link to="/admin/orders">
                <div
                  class="flex h-14 items-center justify-center rounded-full bg-black bg-opacity-5 px-4 text-op-teal"
                >
                  <span class="text-base font-bold">{{
                    $t(
                      isInMo
                        ? "mobileOrder.viewAllOrders"
                        : "admin.viewAllOrders"
                    )
                  }}</span>
                </div>
              </router-link>
            </div>

            <div class="grid grid-cols-2 space-x-2">
              <!-- All Report -->
              <div v-if="isOwner && isInMo" class="mb-2">
                <router-link to="/admin/report">
                  <div
                    class="flex h-14 items-center justify-center rounded-full bg-black bg-opacity-5 px-4 text-op-teal"
                  >
                    <i class="material-icons mr-2 text-lg">description</i>
                    <div class="text-sm font-bold">
                      {{ $t("mobileOrder.viewAllReport") }}
                    </div>
                  </div>
                </router-link>
              </div>

              <div v-if="isOwner && isInMo" class="mb-2">
                <ExportProd
                  :restaurantLists="restaurantLists"
                  :restaurantItems="restaurantItems"
                />
              </div>
            </div>

            <div v-if="isOwner && isInMo" class="mb-2">
              <IndexSuspend />
            </div>

            <a name="addMenu" />
            <div
              v-for="(restaurantId, index) in restaurantLists"
              :key="restaurantId"
            >
              <restaurant
                v-if="restaurantItems[restaurantId]"
                :simpleMode="simpleMode"
                :shopInfo="restaurantItems[restaurantId]"
                :restaurantid="restaurantId"
                :numberOfMenus="
                  (!groupMasterRestaurant.empty
                    ? groupMasterRestaurant
                    : restaurantItems[restaurantId]
                  ).numberOfMenus || 0
                "
                :numberOfOrders="numberOfOrderObj[restaurantId] || 0"
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
                :moPrefix="moPrefix"
                :isInMo="isInMo"
              />
            </div>

            <!-- Add Restaurant -->
            <div v-if="existsRestaurant && isOwner" class="mt-4 text-center">
              <o-button @click="handleNew" class="b-reset-tw">
                <div
                  class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
                >
                  <i class="material-icons mr-2 text-lg text-op-teal">add</i>
                  <span class="text-sm font-bold text-op-teal">{{
                    $t("admin.addNewRestaurant")
                  }}</span>
                </div>
              </o-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Section -->
      <div class="mt-6 lg:mt-0" v-if="isOwner">
        <a name="paymentSection" />
        <!-- Payment -->
        <payment-section @updateUnsetWarning="updateUnsetWarning($event)" />

        <!-- SubAccounts -->
        <div class="mt-6">
          <SubAccount />
        </div>

        <!-- Note -->
        <Note :isInMo="isInMo" />

        <!-- Mail Magazine-->
        <MailMagazine />

        <!-- Smaregi-->
        <Smaregi />
      </div>
      <!-- End of Right Section -->
    </div>
    <div class="mt-6 bg-ownplate-yellow p-4">
      <!-- Footer -->
      <Footer />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  watch,
  onUnmounted,
  onMounted,
} from "vue";

import { db } from "@/lib/firebase/firebase9";
import {
  doc,
  getDoc,
  collection,
  where,
  query,
  orderBy,
  onSnapshot,
  setDoc,
  collectionGroup,
  serverTimestamp,
  Unsubscribe,
  DocumentData,
  DocumentSnapshot,
} from "firebase/firestore";

import { order_status } from "@/config/constant";
import { midNight } from "@/utils/dateUtils";

import ToggleSwitch from "@/components/ToggleSwitch.vue";

import Restaurant from "@/app/admin/Index/Restaurant.vue";
import PaymentSection from "@/app/admin/Index/PaymentSection.vue";
import MessageCard from "@/app/admin/Messages/MessageCard.vue";

import EmailVerify from "@/app/admin/Index/EmailVerify.vue";
import WelcomeAndLinks from "@/app/admin/Index/WelcomeAndLinks.vue";
import News from "@/app/admin/Index/News.vue";
import Note from "@/app/admin/Index/Note.vue";
import MailMagazine from "@/app/admin/Index/MailMagazine.vue";
import Smaregi from "@/app/admin/Index/Smaregi.vue";
import Footer from "@/app/admin/Index/Footer.vue";
import Partners from "@/app/admin/Index/Partners.vue";
import SubAccount from "@/app/admin/Index/SubAccount.vue";
import ExportProd from "@/app/admin/Index/ExportProd.vue";
import IndexSuspend from "@/app/admin/IndexSuspend.vue";

import { ping } from "@/lib/firebase/functions";

import {
  getShopOwner,
  doc2data,
  arrayChunk,
  useAdminUids,
} from "@/utils/utils";
import { checkAdminPermission } from "@/utils/userPermission";

import { useAdminConfigToggle } from "@/utils/admin/Toggle";

import { useStore } from "vuex";
import { useRouter } from "vue-router";

import { RestaurantInfoData } from "@/models/RestaurantInfo";
import { ShopOwnerData } from "@/models/ShopOwner";

export default defineComponent({
  name: "RestaurantIndex",
  components: {
    PaymentSection,
    Restaurant,
    MessageCard,
    WelcomeAndLinks,
    News,
    Partners,
    EmailVerify,
    Smaregi,
    SubAccount,
    MailMagazine,
    Note,
    Footer,
    ToggleSwitch,
    ExportProd,
    IndexSuspend,
  },
  props: {
    groupMasterRestaurant: {
      type: Object,
      required: false,
    },
    groupData: {
      type: Object,
      required: false,
    },
    isInMo: {
      type: Boolean,
      required: true,
    },
    moPrefix: {
      type: String,
      required: false,
    },
  },
  metaInfo() {
    return {
      title: ["Admin Index", this.defaultTitle].join(" / "),
    };
  },
  setup(props) {
    const store = useStore();
    const router = useRouter();

    const readyToDisplay = ref(false);
    const restaurantItems = ref<{[key: string]: RestaurantInfoData} | null>(null);
    const orderDetachers = ref<Unsubscribe[]>([]);
    const restaurant_detacher = ref<Unsubscribe|null>(null);
    const message_detacher = ref<Unsubscribe|null>(null);
    const unsetPaymentWarning = ref(false);
    const lines = ref<{[key: string]: boolean}>({});
    const shopOwner = ref<ShopOwnerData | {} | null>(null);
    const restaurantLists = ref<string[]>([]);
    const numberOfOrderObj = ref<{[key: string]: number}>({});
    const messages = ref<DocumentData[]>([]);
    if (!checkAdminPermission()) {
      return;
    }
    ping({
      restaurantId: "index",
      operationType: "index",
      pathName: location.pathname,
    });

    const detachOrders = () => {
      orderDetachers.value.map((detacher) => {
        detacher();
      });
      orderDetachers.value = [];
    };
    const { isOwner, uid, ownerUid, emailVerified } = useAdminUids();
    const { toggle: simpleMode, switchToggle: switchSimpleMode } =
      useAdminConfigToggle("simpleMode", uid.value, false);

    const watchOrder = () => {
      detachOrders();
      orderDetachers.value = Object.keys(restaurantItems.value||{}).map(
        (restaurantId) => {
          return onSnapshot(
            query(
              collection(db, `restaurants/${restaurantId}/orders`),
              where("timePlaced", ">=", midNight())
            ),
            // IDEALLY: .where("status", "<", order_status.ready_to_pickup)
            (result) => {
              const newObj = { ...numberOfOrderObj.value };
              newObj[restaurantId] = result.docs
                .map((doc) => doc.data())
                .filter((data) => {
                  // We need this filter here because Firebase does not allow us to do
                  return data.status < order_status.ready_to_pickup;
                }).length;
              numberOfOrderObj.value = newObj;
            }
          );
        }
      );
    };
    onMounted(async () => {
      try {
        shopOwner.value = isOwner.value
          ? await getShopOwner(ownerUid.value)
          : {};

        restaurantLists.value = await (async () => {
          if (isOwner.value) {
            const restaurantListsDoc = await getDoc(
              doc(db, `/admins/${uid.value}/public/RestaurantLists`)
            );
            return restaurantListsDoc.exists()
              ? restaurantListsDoc.data().lists || []
              : [];
          } else {
            const restaurantListsDoc = await getDoc(
              doc(db, `/admins/${ownerUid.value}/children/${uid.value}`)
            );
            return restaurantListsDoc.exists()
              ? restaurantListsDoc.data().restaurantLists || []
              : [];
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
                restaurantItems.value = (result.docs || []).reduce(
                  (tmp: {[key: string]: RestaurantInfoData},
                   doc: DocumentSnapshot<DocumentData>) => {
                    tmp[doc.id] = doc2data("restaurant")(doc) as RestaurantInfoData;
                    if (!restaurantLists.value.includes(doc.id)) {
                      restaurantLists.value.push(doc.id);
                    }
                    return tmp;
                  },
                  {}
                );
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
                  if (result.empty && restaurantItems.value === null) {
                    restaurantItems.value = {}; // so that we present "No restaurant"
                    return;
                  }

                  restaurantItems.value = (result.docs || []).reduce(
                    (tmp: {[key: string]: RestaurantInfoData},
                     doc: DocumentSnapshot<DocumentData>) => {
                      tmp[doc.id] = doc2data("restaurant")(doc) as RestaurantInfoData;
                      return tmp;
                    },
                    {}
                  );
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
        onSnapshot(
          query(collectionGroup(db, "lines"), where("uid", "==", uid.value)),
          (result) => {
            result.docs.map(async (res) => {
              const restaurantId = res.data().restaurantId;
              lines.value[restaurantId] = true;
            });
          }
        );
      }

      message_detacher.value = onSnapshot(
        query(collection(db, `/admins/${uid.value}/messages`), orderBy("createdAt", "desc")),
        (messageCollection) => {
          messages.value = messageCollection.docs
            .map(doc2data("message"))
            .filter((a: DocumentData) => a.toDisplay);
        }
      );
    });

    const saveRestaurantLists = async () => {
      if (isOwner.value) {
        await setDoc(
          doc(db, `/admins/${uid.value}/public/RestaurantLists`),
          { lists: restaurantLists.value },
          { merge: true }
        );
      }
    };
    const handleNew = async () => {
      console.log("handleNew");
      if (isOwner.value) {
        try {
          const newDoc = doc(collection(db, "restaurants"));
          // update Lists
          restaurantLists.value.push(newDoc.id);
          saveRestaurantLists();

          await setDoc(newDoc, {
            uid: uid.value,
            restaurantId: newDoc.id,
            menuLists: [],
            publicFlag: false,
            numberOfMenus: 0,
            deletedFlag: false,
            createdAt: serverTimestamp(),
          });

          router.push(`/admin/restaurants/${newDoc.id}`);
        } catch (error) {
          store.commit("setErrorMessage", {});
          console.log(error);
        }
      }
    };
    const updateUnsetWarning = (value: boolean) => {
      unsetPaymentWarning.value = value;
    };
    const positionUp = async (itemKey: string) => {
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
    const positionDown = async (itemKey: string) => {
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
    };
    const deleteFromRestaurantLists = async (restaurantId: string) => {
      if (isOwner.value) {
        // push list
        const newRestaurantLists = [...restaurantLists.value];
        const pos = newRestaurantLists.indexOf(restaurantId);
        newRestaurantLists.splice(pos, 1);
        restaurantLists.value = newRestaurantLists;

        const path = `/admins/${uid.value}/public/RestaurantLists`;
        await setDoc(
          doc(db, path),
          { lists: newRestaurantLists },
          { merge: true }
        );
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

    const existMenu = computed(() => {
      if (!props?.groupMasterRestaurant?.empty) {
        return props?.groupMasterRestaurant?.numberOfMenus > 1;
      } else {
        return Object.values(restaurantItems.value || []).find((r) => {
          return (r || {}).numberOfMenus > 1;
        });
      }
    });
    const existPublicRestaurant = computed(() => {
      return Object.values(restaurantItems.value || []).find((r) => {
        return (r || {}).publicFlag;
      });
    });
    const showFiveSteps = computed(() => {
      if (restaurantItems.value === null) {
        return false;
      }
      return (
        unsetPaymentWarning.value ||
        !existsRestaurant.value ||
        !existMenu.value ||
        !existPublicRestaurant.value
      );
    });

    return {
      // ref
      readyToDisplay,
      restaurantItems,
      unsetPaymentWarning,
      lines,
      shopOwner,
      restaurantLists,
      messages,
      numberOfOrderObj,

      // computed
      isOwner,
      existsRestaurant,

      simpleMode,
      switchSimpleMode,

      // methods
      handleNew,
      updateUnsetWarning,
      positionUp,
      positionDown,
      deleteFromRestaurantLists,
      saveRestaurantLists,

      emailVerified,

      existMenu,
      existPublicRestaurant,
      showFiveSteps,
    };
  },
});
</script>
