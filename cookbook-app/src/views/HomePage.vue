<template>
  <b-container fluid>
    <b-skeleton-wrapper :loading="isNotLoaded">
      <template #loading>
        <b-card v-for="i in skeletons" :key="i" class="recipe-post p-0 mt-3 mx-auto col-lg-8">
          <template #header>
            <b-row align-h="between">
              <b-col><b-skeleton width="30%"></b-skeleton></b-col>
              <b-col class="d-flex justify-content-end"><b-skeleton width="20%"></b-skeleton></b-col>
            </b-row>
          </template>
          <b-skeleton-img aspect="4:1"></b-skeleton-img>
          <b-row  class="description-post" align-h="between">
            <b-col class="d-flex align-items-center pl-2"> <b-skeleton width="50%"></b-skeleton> </b-col>
            <b-col class="d-flex justify-content-end pr-1">
              <b-skeleton width="25%"></b-skeleton>
            </b-col>
          </b-row>
          <b-button class="details-recipes"  variant="link">Dettagli</b-button>
          <template #footer>
            <b-row align-h="between">
              <b-col><b-skeleton-icon  icon="heart" :icon-props="{ variant: 'light' }"></b-skeleton-icon></b-col>
              <b-col align="end"><b-skeleton-icon icon="chat" :icon-props="{ variant: 'light' }"></b-skeleton-icon></b-col>
            </b-row>
          </template>
        </b-card>
      </template>

     <div>
      <b-row >
        <b-card v-for="doc in docs" :key="doc.recipe._id" class="recipe-post p-0 mt-3 mx-auto col-lg-7">
          <template #header>
            <b-row align-h="between">
              <b-col>
                <router-link :to="{name: 'single-user', params: {id: doc.owner._id }}">
                  <strong><em>{{doc.owner.userID }}</em></strong>
                </router-link>
              </b-col>
              <b-col align="end">
                <elapsed-time v-model="doc.recipe.timestamp" :language="language" />
              </b-col>
            </b-row>
          </template>
          <router-link to=""> <!-- TODO: add link to page of one specific recipe -->
            <b-img fluid class="recipes-image" :src="doc.recipe.img" @error="imgNotFound"/>
          </router-link>
          <b-row :class="{'description-post': true, 'py-2': !doc.recipe.nationality}" align-h="between">
            <b-col class="d-flex align-items-center pl-2">  {{doc.recipe.name}} </b-col>
            <b-col class="d-flex justify-content-end pr-1" >
              <span class="d-flex align-items-center justify-content-center pr-2">  {{doc.recipe.category.text}} </span>
              <country-image v-model="doc.recipe.nationality" :id="imageId(doc.recipe._id)"/>
            </b-col>
          </b-row>

          <recipe-details :recipeId="doc.recipe._id" class="details-recipes"/>

          <template #footer>
            <b-row align-h="between">
              <b-col>
                <!-- Like of a RECIPE -->
                <like v-model="doc.recipe.likes" @like="like(doc.recipe)" @unlike="unlike(doc.recipe)"/>
              </b-col>
              <b-col align="end">
                <b-icon-chat class="icon" v-b-toggle="commentsId(doc.recipe._id)"/>
              </b-col>
            </b-row>
            <b-collapse :id="commentsId(doc.recipe._id)" class="mt-2">
              <!-- LIST COMMENT for a RECIPE -->
              <comments v-model="doc.recipe.comments" :recipeId="doc.recipe._id" :language="language"  :isOwner="isOwner(doc.owner)" />
            </b-collapse>
          </template>

        </b-card>
      </b-row>
      <b-row class="mt-3" align-h="center" v-if="!$data._others">
        <b-button variant="link" @click="others">Altri ...</b-button>
      </b-row>
     </div>
    </b-skeleton-wrapper>

  </b-container>
</template>

<script>
import {Session} from "@services/session";
import {RecipeCategories} from "@services/app";

export default {
  name: "HomePage",
  data: function (){
    return {
      skeletons: 5,

      language: 'it',
      defaultImageRecipes: require('@assets/images/recipe-image.jpg'),

      showDetails: false,

      docs: [],

      _others: false,

      _newPostInd: 0,
    }
  },
  computed: {
    isNotLoaded(){
      return this.docs.length === 0
    }
  },
  methods: {
    imageId(id){
      return 'country-image-'+ id
    },
    commentsId(id){
      return 'comments-'+ id
    },
    imgNotFound(e){
      console.error('image recipes not found...')
      e.target.src = this.defaultImageRecipes
    },

    isOwner(owner_recipe){
      let session = Session.userInfo()
      return session && owner_recipe._id === session._id && owner_recipe.userID === session.userID
    },
    /* -- REQUEST --*/

    like(recipe){
      //TODO: REQUEST ADD LIKE FROM RECIPE
      console.debug("Like ", recipe)
    },
    unlike(recipe){
      //TODO: REQUEST REMOVE LIKE FROM RECIPE
      console.debug("UNLike ",recipe)
    },

    updateDocs(){
      this.docs.forEach(p => {
        p.recipe.img = p.recipe.img || this.defaultImageRecipes

        let category = RecipeCategories.find(p.recipe.category)
        if(category) p.recipe.category = category
      })
    },

    getPost(){
      // TODO: REQUEST POST RECIPES
      this.docs = require('@assets/examples/home-page.js')

      this.updateDocs()
    },



    newPost(){
      setInterval(function (){
        this.docs.unshift({
          owner: {
            _id: '612bce9f8710a153e80ca4cf',
            userID: 'hannah_smith'
          },
          recipe : {
            _id: '12345'+this.$data._newPostInd,
            timestamp: Date.now(),
            name: 'Funghi in padella - '+this.$data._newPostInd,
            category: 'Contorni',
            nationality: 'IT',
            likes: 0,
            comments: [],
          }
        })
        this.$data._newPostInd++
        this.updateDocs()
      }.bind(this), 10000)
    },

    others(){
      //TODO: REQUEST OTHER 10 POST RECIPE
      console.debug("Altri 10 post ..")
      if(!this.$data._others){
        require('@assets/examples/others-home-page.js').forEach(r => this.docs.push(r))

        this.updateDocs()
        this.$data._others = true
      }
    }
  },
  mounted() {
    this.getPost()
    // setTimeout(this.getPost.bind(this), 1000)
    // this.newPost()
  },
}
</script>

<style scoped lang="scss">

.recipes-image{
  position: relative;
  width: 100%;
  height: 300px;
}

.description-post, .details-recipes {
  position: absolute;
  background-color: $overlay;
  color: white;
}

.description-post{
  top:10%;
  left: 15px;
  width: 100%;
}
.details-recipes{
  left: 0;
  bottom: 0;
  border-radius: 0;
}

.recipe-post {
  & >.card-header, .card-footer{
    color: white;
    background-color: $component-color;
    & a {
      color: white;
    }
  }
  & >.card-body{
    position: relative;
    padding: 0;
  }

  & .country-image{
    width: 50px;
    height: 40px
  }
}

</style>