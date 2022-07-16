import { defineComponent, computed } from "@vue/composition-api";
import { useBasePath } from "@/utils/utils";

export default (name: string) => {
  return defineComponent({
    name,
    props: {
      categoryData: {
        type: Array,
        required: true,
      },
    },
    emits: ["closeGroupCategory"],
    setup(props, ctx) {
      const basePath = useBasePath(ctx.root);

      const closeCategory = () => {
        ctx.emit("closeGroupCategory");
      };
      return {
        basePath,
        closeCategory,
      };
    },
  });
};
