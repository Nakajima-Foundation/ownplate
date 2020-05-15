<template>
  <section class="section">
    <h1>Line Test</h1>
    <a :href="lineAuth">Line Login</a>
  </section>
</template>

<script>
export default {
  computed: {
    lineAuth() {
      const query = {
        response_type: "code",
        client_id: "1654216149",
        redirect_uri: "http://localhost:3000/test/line",
        scope: "profile openid",
        state: "s" + Math.random()
        //nonce: "u" + Math.random()
      };
      const queryString = Object.keys(query)
        .map(key => {
          return key + "=" + encodeURIComponent(query[key]);
        })
        .join("&");
      console.log(queryString);
      return `https://access.line.me/oauth2/v2.1/authorize?${queryString}`;
    }
  }
};
</script>
