<template>
  <b-container fluid="sm">
    <b-row
      cols="1"
      align-v="center"
      :class="classObject"
    >
      <b-card class="col">
        <b-card-body class="text-center">
          <b-container fluid>
            <b-row
              cols="1"
              class="text-center"
            >
              <b-col>
                <b-img
                  fluid
                  :src="image"
                  :alt="alt"
                />
              </b-col>
              <b-col v-if="!asset">
                <router-link
                  :to="{name: 'homepage'}"
                  replace
                >
                  <b-button
                    class="go-home p-3"
                    variant="primary"
                  >
                    Vai alla HomePage
                  </b-button>
                </router-link>
              </b-col>
            </b-row>
          </b-container>
        </b-card-body>
      </b-card>
    </b-row>
  </b-container>
</template>

<script>

export default {
    name: "NotFound",
    props: {
        asset: {
            type: String,
            default: "page"
        }
    },
    computed: {
        alt() {
            switch (this.asset) {
                case "recipe":
                    return "Recipe Not Found"
                case "user":
                    return "User Not Found"
                case "chat":
                    return "Chat Not Found"
                default:
                    return "Page Not Found"
            }
        },
        image() {
            switch (this.asset) {
                case "recipe":
                    return require("@assets/images/404-recipe.png")
                case "user":
                    return require("@assets/images/404-user.png")
                case "chat":
                    return require("@assets/images/404-chat.png")
                default:
                    this.$bus.$emit("hide:navigation-bar")
                    this.$bus.$emit("hide:footer")
                    return require("@assets/images/404-page.png")
            }
        },
        classObject() {
            return {
                "vh-100": !this.asset
            }
        }
    }
}
</script>

<style scoped>
img{
  object-fit: contain;
}
.go-home {
  font-size: 16pt;
  border-radius: 1.25rem;
}
</style>
