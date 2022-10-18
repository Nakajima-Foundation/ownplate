<template>
<div>
  <div>
    FAQ
  </div>
  <div v-for="(faq, k) in faqList" :key="k">
    <div>
      Q: {{faq.q}}
    </div>
    <div>
      A: {{faq.a}}
    </div>
  </div>
</div>
  
</template>

<script>
import {
  defineComponent,
} from "@vue/composition-api";

export default defineComponent({
  setup() {

    const faqList = [
      {
        q: "question1",
        a: "answer1",
      },
      {
        q: "question2",
        a: "answer2",
      }
    ];
    return {
      faqList
    };
  },
});

</script>
