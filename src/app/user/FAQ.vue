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

export default defineComponent({
  setup() {
    const faqList = [
      {
        q: "ご利用の流れについて",
        answers: ["ほげほげ"],
      },
    ];

    return {
      faqList,
    };
  },
});
</script>
