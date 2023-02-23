import {
  defineComponent,
} from "@vue/composition-api";

export const moPage = () => {
  return defineComponent({
    props: {
      pageId: {
        type: String,
        required: true,
      },
      pageBase: {
        type: String,
        required: true,
      },
    },
  });
};
