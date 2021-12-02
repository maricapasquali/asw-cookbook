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
        <b-card v-for="(doc, ind) in docs" :key="doc._id" class="recipe-post p-0 mt-3 mx-auto col-lg-7">
          <template #header>
            <b-row align-h="between">
              <b-col>
                <router-link :to="{name: 'single-user', params: {id: doc.owner._id }}">
                  <strong><em>{{doc.owner.userID }}</em></strong>
                </router-link>
              </b-col>
              <b-col align="end">
                <elapsed-time v-model="doc.createdAt" :language="language" />
              </b-col>
            </b-row>
          </template>
          <router-link :to="{name: 'single-recipe', params: {id: doc.owner._id, recipe_id: doc._id}}">
            <b-img fluid class="recipes-image" :src="doc.img" @error="imgNotFound"/>
          </router-link>
          <b-row :class="{'description-post': true, 'py-2': !doc.country}" align-h="between">
            <b-col class="d-flex align-items-center pl-2">  {{doc.name}} </b-col>
            <b-col class="d-flex justify-content-end pr-1" >
              <span class="d-flex align-items-center justify-content-center pr-2">  {{doc.category.text}} </span>
              <country-image v-model="doc.country" :id="imageId(doc._id)"/>
            </b-col>
          </b-row>

          <recipe-details :recipe="doc" class="details-recipes"/>

          <template #footer>
            <b-row align-h="between">
              <b-col>
                <!-- Like of a RECIPE -->
                <like v-model="doc.likes" :recipe="{id: doc._id, ownerID: doc.owner._id}" :no-like="isOwnerRecipe(ind)"/>
              </b-col>
              <b-col align="end">
                <b-icon-chat class="icon" v-b-toggle="commentsId(doc._id)"/>
              </b-col>
            </b-row>
            <b-collapse :id="commentsId(doc._id)" class="mt-2">
              <!-- LIST COMMENT for a RECIPE -->
              <comments v-model="doc.comments" :recipe="{id: doc._id, ownerID: doc.owner._id}" :language="language" />
            </b-collapse>
          </template>

        </b-card>
      </b-row>
      <b-row class="mt-3" align-h="center" v-if="areOthers">
        <b-button variant="link" @click="others">Altri ...</b-button>
      </b-row>
     </div>
    </b-skeleton-wrapper>

  </b-container>
</template>

<script>
import {RecipeCategories} from "@services/app";
import {Session} from "@services/session";
import api from '@api'

export default {
  name: "HomePage",
  data: function (){
    return {
      skeletons: 5,

      language: 'it',
      defaultImageRecipes: require('@assets/images/recipe-image.jpg'),

      showDetails: false,

      docs: [],
      total: 0,
      optionsPagination: {
        page: 1,
        limit: 2
      },

      _newPostInd: 0,
    }
  },
  computed: {
    isNotLoaded(){
      return this.docs.length === 0
    },
    areOthers(){
      return this.docs.length >0 && this.docs.length < this.total
    },
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

    isOwnerRecipe(index){
      let userInfo = Session.userInfo()
      return userInfo && this.docs[index].owner._id === userInfo._id
    },
    /* -- REQUEST --*/

    updateDocs(){
      this.docs.forEach(p => {
        p.img = p.img || this.defaultImageRecipes

        let category = RecipeCategories.find(p.category)
        if(category) p.category = category
      })
    },

    getPost(currentPage){
      this.optionsPagination.page = currentPage || 1
      api.recipes.allSharedRecipes(this.optionsPagination)
      .then(({data}) => {

        console.log(data)

        if(currentPage) this.docs.push(...data.items)
        else this.docs = data.items

        this.total = data.total
        this.updateDocs()
      })
      .catch(err => {
      //TODO: HANDLER ERROR HOME-PAGE
        console.error(err)
      })
    },
    others(){
      console.debug("Altri "+this.optionsPagination.limit+" post ..")
      this.getPost(this.optionsPagination.page + 1)
    },


    newPost(){
      setInterval(function (){
        this.docs.unshift({
          _id: '12345'+this.$data._newPostInd,
          owner: {
            _id: '612bce9f8710a153e80ca4cf',
            userID: 'hannah_smith'
          },
          createdAt: Date.now(),
          name: 'Funghi in padella - '+this.$data._newPostInd,
          category: 'Contorni',
          country: 'IT',
          likes: [],
          comments: [],
        })
        this.$data._newPostInd++
        this.updateDocs()
      }.bind(this), 10000)
    },
  },
  mounted() {
    this.getPost()
    //this.newPost()
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