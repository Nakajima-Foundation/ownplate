<template>
  <div v-if="notFound">
    <not-found />
  </div>
</template>
<script>
import { db } from "~/plugins/firebase.js";
import NotFound from "~/components/NotFound";

export default {
  name: "Link",
  components: {
    NotFound,
  },
  data() {
    return {
      notFound: false
    };
  },

  async created() {
    const key = this.$route.params.urlKey;

    const admin = await db.doc(`/link/${key}`).get();
    if (admin && admin.data()) {
      // TODO: record access log.
      window.location.href = admin.data().url;
      return ;
    } else {
      this.notFound = true;
    }
  },
}
</script>
