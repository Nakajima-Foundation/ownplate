<template>
  <div class="bg-[#616161] h-52 mt-12">
    <!-- Footer -->
    <div>
      <div class="mt-4 mx-4 text-right">
        <a
          class="inline-flex justify-center items-center rounded-full h-10 bg-white bg-opacity-10 pl-4 pr-2"
          @click="openLang()"
        >
          <i class="material-icons text-lg text-white text-opacity-50 mr-2"
            >language</i
          >
          <span class="text-white text-sm font-bold text-opacity-80 mr-2">{{
            languages[language]
          }}</span>

          <i class="material-icons text-lg text-white text-opacity-50"
            >arrow_drop_down</i
          >
        </a>
      </div>
      <div class="mt-2 mx-6 text-right">
        <FooterPoweredBy />
      </div>
    </div>
    <!-- Language Popup-->
    <o-modal :active.sync="langPopup" :width="488" scroll="keep">
      <div class="bg-white rounded-lg my-6 mx-2 shadow-lg p-6">
        <div class="text-xl font-bold text-black text-opacity-40">
          {{ $t("menu.selectLanguage") }}
        </div>

        <!-- Languages -->
        <div class="mt-4" v-for="(lang, lang_key) in languages" :key="lang_key">
          <a
            class="inline-flex justify-center items-center rounded-full h-9 bg-black bg-opacity-5 px-4"
            @click="changeLangAndClose(lang_key)"
            ><i
              class="material-icons text-lg text-black text-opacity-60 mr-2"
              v-if="lang_key == language"
              >check</i
            ><span class="text-sm font-bold text-op-teal">{{ lang }}</span></a
          >
        </div>

        <!-- Close -->
        <div class="mt-6 text-center">
          <a
            class="inline-flex justify-center items-center rounded-full h-12 bg-black bg-opacity-5"
            style="min-width: 10rem"
            @click="closeLang()"
            ><span class="font-bold text-black text-opacity-60 px-4"
              >{{ $t("menu.close") }}
            </span></a
          >
        </div>
      </div>
    </o-modal>
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch } from "@vue/composition-api";

import {
  useUser,
  useUid,
  useIsAdmin,
  isJapan,
  regionalSetting,
  isNull,
} from "@/utils/utils";

import { db, auth } from "@/lib/firebase/firebase9";
import { doc, getDoc, setDoc } from "firebase/firestore";

import FooterPoweredBy from "@/components/App/FooterPoweredBy.vue";

export default defineComponent({
  components: {
    FooterPoweredBy,
  },
  setup(_, ctx) {
    const language = ref(regionalSetting.defaultLanguage);
    const languages = regionalSetting.languages;
    const langPopup = ref(false);

    const user = useUser(ctx);
    const isAdmin = useIsAdmin(ctx);
    const uid = useUid(ctx);

    const profile_path = computed(() => {
      const path_prefix = isAdmin.value ? "admins" : "users";
      return `${path_prefix}/${uid.value}/private/profile`;
    });

    const setLang = (lang) => {
      language.value = lang;
      ctx.root.$i18n.locale = lang;
      auth.languageCode = lang;
    };
    const saveLang = (lang) => {
      if (!isNull(uid.value)) {
        setDoc(doc(db, profile_path.value), { lang }, { merge: true });
      } else {
        // save into store
        ctx.root.$store.commit("setLang", lang);
      }
    };
    const changeLang = (lang) => {
      setLang(lang);
      saveLang(lang);
    };

    // lang: query, bot, browser
    // setting (is not here / after user load). TODO: hold on storage
    (() => {
      if (ctx.root.$route.query.lang) {
        changeLang(ctx.root.$route.query.lang);
      } else if (navigator.userAgent.toLowerCase().indexOf("googlebot") > -1) {
        if (isJapan) {
          changeLang("ja");
        } else {
          changeLang("en");
        }
      } else {
        const language =
          (window.navigator.languages && window.navigator.languages[0]) ||
          window.navigator.language ||
          window.navigator.userLanguage ||
          window.navigator.browserLanguage;
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
    const changeLangAndClose = (lang) => {
      changeLang(lang);
      closeLang();
    };

    const langQuery = computed(() => {
      return ctx.root.$route.query.lang;
    });
    watch(langQuery, async (lang) => {
      if (lang) {
        await changeLang(lang);
      }
    });
    watch(user, async () => {
      if (user.value) {
        // lang
        if (ctx.root.$store.state.lang) {
          changeLang(ctx.root.$store.state.lang);
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
