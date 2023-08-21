<template>
  <div class="mt-12 h-52 bg-[#616161]">
    <!-- Footer -->
    <div class="mt-6 mx-4 inline-flex text-center">
      <!-- Facebook User Group -->
      <div class="inline-block px-1 pb-2" v-if="false">
        <a
          href="https://www.facebook.com/groups/278028420106364/"
          target="_blank"
        >
          <div
            class="inline-flex h-10 items-center justify-center rounded-full bg-white bg-opacity-10 px-4"
          >
            <i
              class="fab fa-facebook mr-2 text-lg text-white text-opacity-50"
            ></i>
            <span class="text-sm font-bold text-white text-opacity-80">{{
              $t("admin.facebookUserGroup")
            }}</span>
          </div>
        </a>
      </div>

      <!-- Twitter -->
      <div class="inline-block px-1 pb-2">
        <a href="https://twitter.com/omochikaericom" target="_blank">
          <div
            class="inline-flex h-10 items-center justify-center rounded-full bg-white bg-opacity-10 px-4"
          >
            <i
              class="fab fa-twitter mr-2 text-lg text-white text-opacity-50"
            ></i>
            <span class="text-sm font-bold text-white text-opacity-80">
              Twitter
            </span>
          </div>
        </a>
      </div>

      <!-- Note -->
      <div class="inline-block px-1 pb-2">
        <a href="https://note.com/singsoc/m/m19dd935e84e4" target="_blank">
          <div
            class="inline-flex h-10 items-center justify-center rounded-full bg-white bg-opacity-10 px-4"
          >
            <i class="material-icons mr-2 text-lg text-white text-opacity-50"
              >mail_outline</i
            >
            <span class="text-sm font-bold text-white text-opacity-80">
              Note
            </span>
          </div>
        </a>
      </div>
    </div>

    <div class="mt-4 px-6">
      <div class="text-right">
        <a
          class="inline-flex h-10 items-center justify-center rounded-full bg-white bg-opacity-10 pl-4 pr-2"
          @click="openLang()"
        >
          <i class="material-icons mr-2 text-lg text-white text-opacity-50"
            >language</i
          >
          <span class="mr-2 text-sm font-bold text-white text-opacity-80">{{
            languages[language]
          }}</span>

          <i class="material-icons text-lg text-white text-opacity-50"
            >arrow_drop_down</i
          >
        </a>
      </div>
      <div class="mt-2 text-right">
        <FooterPoweredBy />
      </div>
    </div>
    <!-- Language Popup-->
    <o-modal v-model:active="langPopup" :width="488" scroll="keep">
      <div class="my-6 mx-2 rounded-lg bg-white p-6 shadow-lg">
        <div class="text-xl font-bold text-black text-opacity-40">
          {{ $t("menu.selectLanguage") }}
        </div>

        <!-- Languages -->
        <div class="mt-4" v-for="(lang, lang_key) in languages" :key="lang_key">
          <a
            class="inline-flex h-9 items-center justify-center rounded-full bg-black bg-opacity-5 px-4"
            @click="changeLangAndClose(lang_key)"
            ><i
              class="material-icons mr-2 text-lg text-black text-opacity-60"
              v-if="lang_key == language"
              >check</i
            ><span class="text-sm font-bold text-op-teal">{{ lang }}</span></a
          >
        </div>

        <!-- Close -->
        <div class="mt-6 text-center">
          <a
            class="inline-flex h-12 items-center justify-center rounded-full bg-black bg-opacity-5"
            style="min-width: 10rem"
            @click="closeLang()"
            ><span class="px-4 font-bold text-black text-opacity-60"
              >{{ $t("menu.close") }}
            </span></a
          >
        </div>
      </div>
    </o-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue";

import { useUserData, isJapan, regionalSetting, isNull } from "@/utils/utils";

import { db, auth } from "@/lib/firebase/firebase9";
import { doc, getDoc, setDoc } from "firebase/firestore";

import FooterPoweredBy from "@/components/App/FooterPoweredBy.vue";

import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

export default defineComponent({
  components: {
    FooterPoweredBy,
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    const { locale } = useI18n({ useScope: "global" });

    const language = ref(regionalSetting.defaultLanguage);
    const languages = regionalSetting.languages;
    const langPopup = ref(false);

    const { user, uid, isAdmin } = useUserData();

    const profile_path = computed(() => {
      const path_prefix = isAdmin.value ? "admins" : "users";
      return `${path_prefix}/${uid.value}/private/profile`;
    });

    const setLang = (lang: string) => {
      language.value = lang;
      locale.value = lang;
      auth.languageCode = lang;
    };
    const saveLang = (lang: string) => {
      if (!isNull(uid.value)) {
        setDoc(doc(db, profile_path.value), { lang }, { merge: true });
      } else {
        // save into store
        store.commit("setLang", lang);
      }
    };
    const changeLang = (lang: string) => {
      setLang(lang);
      saveLang(lang);
    };

    // lang: query, bot, browser
    // setting (is not here / after user load). TODO: hold on storage
    (() => {
      if (route.query.lang) {
        changeLang(route.query.lang as string);
      } else if (navigator.userAgent.toLowerCase().indexOf("googlebot") > -1) {
        if (isJapan) {
          changeLang("ja");
        } else {
          changeLang("en");
        }
      } else {
        const language =
          (window.navigator.languages && window.navigator.languages[0]) ||
          window.navigator.language;
        // window.navigator?.userLanguage ||  ie 11
        // window.navigator.browserLanguage;  || ie
        console.log("browserlang:" + language);
        const lang = (language || "").substr(0, 2);
        if (lang.length === 2) {
          setLang(lang);
        }
      }
    })();

    const openLang = () => {
      langPopup.value = true;
    };
    const closeLang = () => {
      langPopup.value = false;
    };
    const changeLangAndClose = (lang: string) => {
      changeLang(lang);
      closeLang();
    };

    const langQuery = computed(() => {
      return route.query.lang as string;
    });
    watch(langQuery, async (lang) => {
      if (lang) {
        await changeLang(lang);
      }
    });
    watch(user, async () => {
      if (user.value) {
        // lang
        if (store.state.lang) {
          changeLang(store.state.lang);
        } else {
          const profileSnapshot = await getDoc(doc(db, profile_path.value));
          if (profileSnapshot.exists()) {
            if (profileSnapshot.data().lang) {
              setLang(profileSnapshot.data().lang);
            }
          }
        }
      }
    });

    return {
      language,
      languages,

      langPopup,

      openLang,
      closeLang,

      changeLangAndClose,
    };
  },
});
</script>
