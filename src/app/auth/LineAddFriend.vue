<template>
  <b-modal :width="640" :active.sync="isModalActive">
    <div class="card">
      <div class="card-content">
        <p>Please add xxx as a friend to receive notification.</p>
        <div class="m-t-8" style="text-align:center">
          <b-button class="p-r-16 p-l-16" type="is-primary" tag="a" :href="friend_url">Add Friend</b-button>
        </div>
      </div>
    </div>
  </b-modal>
</template>

<script>
import { ownPlateConfig } from "@/config/project";

export default {
  data() {
    return {
      isModalActive: true
    };
  },
  computed: {
    friend_url() {
      return ownPlateConfig.line.ADD_FRIEND_URL;
    }
  }
};
</script>
