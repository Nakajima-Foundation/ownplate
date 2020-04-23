<template>
  <div class="card block">
    <div class="card-content">
      <div class="media">
        <div class="media-content" @click="linkEdit">
          <!-- <h4 class="bold">Kushikatsu Special Platter</h4> -->
          <p class="item-name">
              {{ menuitem.itemName }}
            </router-link>
          </p>
          <p class="item-price">
            {{ $n(menuitem.price, "currency") }}
          </p>
          <p>{{ menuitem.itemDescription }}</p>
        </div>
        <div class="media-right">
          <figure class="image is-100x100">
            <img
              class="is-square"
              :src="menuitem.itemPhoto"
              alt=""
              style="border-radius: 4px;"
            />
          </figure>
        </div>
      </div>
    </div>
    <div class="card-footer">
      <a @click.prevent href="#" class="card-footer-item" @click="positionUp" v-if="position!=='first'">
        <b-icon icon="arrow-up" size="is-midium"></b-icon>
      </a>
      <a @click.prevent href="#" class="card-footer-item" v-else>
      </a>
      <a @click.prevent href="#" class="card-footer-item" @click="positionDown" v-if="position!=='last'">
        <b-icon icon="arrow-down" size="is-midium"></b-icon>
      </a>
      <a @click.prevent href="#" class="card-footer-item" v-else>
      </a>
      <a @click.prevent href="#" class="card-footer-item" @click="forkItem">
        <b-icon icon="plus" size="is-midium"></b-icon>
      </a>
      <a @click.prevent href="#" class="card-footer-item" @click="deleteItem">
        <b-icon icon="delete" size="is-midium"></b-icon>
      </a>
    </div>
  </div>
</template>

<script>
import store from "~/store/index.js";

export default {
  props: {
    menuitem: {
      type: Object,
      required: true
    },
    position: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      counter: 0
    };
  },
  methods: {
    linkEdit() {
      this.$router.push({
        path: `/admin/restaurants/${this.restaurantId()}/menus/${this.menuitem.id}`
      });
    },
    positionUp() {
      this.$emit("positionUp", this.menuitem.id);
    },
    positionDown() {
      this.$emit("positionDown", this.menuitem.id);
    },
    forkItem() {
      this.$emit("forkItem", this.menuitem.id);
    },
    deleteItem() {
      this.$emit("deleteItem", this.menuitem.id);
    },
  }
};
</script>
<style lang="scss" scoped>
.card {
  margin-bottom: 0.6rem;
}

.payment {
  margin-top: 0.4rem;
  margin-bottom: 0.4rem;
}

.count-class {
  margin-top: 1rem;
}

.counter {
  margin-top: 1rem;
}

.notification {
  margin-top: 1rem;
}
.order_now {
  background-color: #e0f7fa;
}
</style>
