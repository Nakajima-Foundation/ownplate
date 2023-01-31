<template>
  <div>
    <div>
      <ShareNetwork
        network="facebook"
        class="facebook"
        :url="targetURL"
        :title="title"
        :hashtags="hashtag"
      >
        <a
          class="inline-flex items-center justify-center"
          style="color: #3b5998"
        >
          <i class="fab fa-facebook mr-2"></i>
          <div class="text-sm font-bold">Facebook</div>
        </a>
      </ShareNetwork>
    </div>

    <div class="mt-2">
      <ShareNetwork
        network="twitter"
        class="twitter"
        :url="targetURL"
        :title="title"
        :hashtags="hashtag"
      >
        <a
          class="inline-flex items-center justify-center"
          style="color: #00acee"
        >
          <i class="fab fa-twitter mr-2"></i>
          <div class="text-sm font-bold">Twitter</div>
        </a>
      </ShareNetwork>
    </div>
  </div>
</template>

<script>
import {
  defineComponent,
} from "vue";
import { regionalSetting } from "@/utils/utils";

export default defineComponent({
  props: {
    title: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: false,
    },
  },
  setup(props) {
    const targetURL = props.url || window.location.href;
    const hashtag = regionalSetting.hashTag;

    return {
      targetURL,
      hashtag,
    };
  },
});
</script>
