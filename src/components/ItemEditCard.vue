<template>
  <div class="card block">
    <div class="card-content">
      <div class="media">
        <div class="media-content">
          <!-- <h4 class="bold">Kushikatsu Special Platter</h4> -->
          <h3 class="bold">
            {{ menuitem.itemName }}
          </h3>
          <h2 class="bold payment">
            {{ $n(menuitem.price, "currency") }}
          </h2>
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
      <a href="#" class="card-footer-item">
        <b-icon icon="arrow-up" size="is-midium"></b-icon>
      </a>
      <a href="#" class="card-footer-item">
        <b-icon icon="arrow-down" size="is-midium"></b-icon>
      </a>
      <a href="#" class="card-footer-item">
        <b-icon icon="plus" size="is-midium"></b-icon>
      </a>
      <a href="#" class="card-footer-item">
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
    }
  },
  data() {
    return {
      counter: 0
    };
  },
  methods: {}
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
