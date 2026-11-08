<template>
  <div>
    <div class="mx-6 mt-4 lg:mx-auto lg:max-w-2xl">
      <!-- Title -->
      <div class="mt-4 text-xl font-bold text-black/30">
        <a name="top">おもちかえり.com ご利用について</a>
      </div>
      <div v-for="(faq, k) in faqList" :key="k">
        <div class="text-op-teal mt-2 text-sm font-bold">
          <a :name="`index_` + k"></a>
          <a :href="`#faq_` + k"> ・ {{ faq.q }} </a>
        </div>
      </div>

      <div class="mt-2 rounded-lg bg-white px-4 py-2 shadow-sm" ref="faq_box">
        <div v-for="(faq, k) in faqList" :key="'base_' + k" class="mb-6">
          <div class="my-1 inline-flex font-bold">
            <a :href="`#index_` + k">
              <i class="material-icons text-op-teal text-lg">arrow_upward</i>
            </a>
            <a :name="`faq_` + k">
              {{ faq.q }}
            </a>
          </div>
          <div
            v-for="(answer, k) in faq.answers"
            :key="'answer_' + k"
            class="mt-3 text-sm leading-relaxed"
          >
            {{ answer }}
          </div>
          <div
            v-for="(type1, i) in faq.type1"
            :key="'type1_' + i"
            class="mt-3 -ml-2 text-sm leading-relaxed"
          >
            {{ type1 }}
          </div>
          <ul class="mt-3 ml-4 list-outside list-disc text-sm leading-relaxed">
            <li v-for="(answer1, h) in faq.answers1" :key="'answer_' + h">
              {{ answer1 }}
            </li>
          </ul>
          <div
            v-for="(type2, g) in faq.type2"
            :key="'type2_' + g"
            class="mt-3 -ml-2 text-sm leading-relaxed"
          >
            {{ type2 }}
          </div>
          <ul class="mt-3 ml-4 list-outside list-disc text-sm leading-relaxed">
            <li v-for="(answer2, f) in faq.answers2" :key="'answer2_' + f">
              {{ answer2 }}
            </li>
          </ul>
          <div class="mt-3">
            <div
              v-for="(note, e) in faq.notes"
              :key="'note2_' + e"
              class="mt-3 text-xs leading-relaxed text-black/50"
            >
              {{ note }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

// テンプレは導入文・箇条書き・注記も読む。いまの一覧は q と answers だけを埋めている。
type FaqItem = {
  q: string;
  answers: string[];
  type1?: string[];
  answers1?: string[];
  type2?: string[];
  answers2?: string[];
  notes?: string[];
};

export default defineComponent({
  setup() {
    const faqList: FaqItem[] = [
      {
        q: "注文できているか、受け取り時間はいつかを確認したい",
        answers: [
          "メニュー（三本線のアイコン）の「注文履歴」で、注文の状況と受け取り予定の時間を確認できます。ログインしていない場合は、メニューの「ログイン」から、注文したときの電話番号でログインしてください。",
        ],
      },
      {
        q: "注文を取り消したい・変更したい",
        answers: [
          "お店が注文を受付する前であれば、メニューの「注文履歴」から注文を開いて取り消せます。",
          "お店が受付した後は、お店へ直接お電話でご連絡ください。",
          "おもちかえり.com の問い合わせフォームでは、注文の取り消しや変更には対応できません。こちらへはお問い合わせにならず、必ずお店へ直接ご連絡ください。",
        ],
      },
    ];

    return {
      faqList,
    };
  },
});
</script>
