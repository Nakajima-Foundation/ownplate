import { defineComponent, computed } from "@vue/composition-api";
import { useBasePath, smallImageErrorHandler } from "@/utils/utils";
import { moBaseUrl } from "@/config/project";

export default (name: string) => {
  return defineComponent({
    name,
    props: {
      categoryData: {
        type: Array,
        required: true,
      },
    },
    setup(props, ctx) {
      const basePath = useBasePath(ctx.root);

      return {
        basePath,
        moBaseUrl,
        smallImageErrorHandler,
      };
    },
  });
};
