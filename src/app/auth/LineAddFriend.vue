<template>
  <b-modal :width="320" :active.sync="isModalActive">
    <section class="section">
      <div class="card">
        <div class="card-content">
          <p>{{$t('line.addFriendDescription')}}</p>
          <div class="m-t-16" style="text-align:center">
            <b-button class="p-r-16 p-l-16 friend" tag="a" :href="friend_url">
              <i class="fab fa-line" style="font-size:1.2em" />
              {{$t('line.addFriend')}}
            </b-button>
          </div>
        </div>
      </div>
    </section>
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

<style scoped>
.friend {
  background: #18b900;
  color: white;
}
</style>
