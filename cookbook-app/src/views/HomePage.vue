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
          <b-button variant="info" class="details-recipes" disabled><b-icon-info-circle/></b-button>
          <template #footer>
            <b-row align-h="between">
              <b-col><b-skeleton-icon  icon="heart" :icon-props="{ variant: 'light' }"></b-skeleton-icon></b-col>
              <b-col align="end"><b-skeleton-icon icon="chat" :icon-props="{ variant: 'light' }"></b-skeleton-icon></b-col>
            </b-row>
          </template>
        </b-card>
      </template>

     <b-container fluid class="recipe-post-container px-0">
      <b-row cols="1">
        <b-col v-for="(doc, ind) in docs" :key="doc._id" class="mx-auto px-1 mb-3" cols="12" sm="10" md="9" lg="7">
          <b-card  class="recipe-post">
            <!-- Author and date -->
            <template #header>
              <b-row align-h="between" align-v="center">
                <b-col>
                  <b-row cols="1" cols-sm="1" cols-md="2">
                    <b-col md="3"> <avatar v-model="doc.owner.img" :user="doc.owner._id"  variant="light" :size=30 /> </b-col>
                    <b-col md="9">
                      <router-link :to="{name: 'single-user', params: {id: doc.owner._id }}">
                        <strong> <em> {{ doc.owner.userID }}</em></strong>
                      </router-link>
                    </b-col>
                  </b-row>
                </b-col>
                <b-col align="end">
                  <elapsed-time v-model="doc.createdAt" :language="language" />
                </b-col>
              </b-row>
            </template>

            <!-- Image / Tutorial -->
            <preview-recipe-tutorial class="recipes-tutorial" v-model="doc.tutorial" :poster="doc.img" with-image/>

            <!-- Description: name, country, category -->
            <b-row :class="{'description-post': true, 'py-2': !doc.country}" align-h="between">
              <b-col class="d-flex align-items-center pl-2">
                <router-link :to="redirectToRecipe(doc)" class="recipe-post-link">
                  {{doc.name}}
                </router-link>
              </b-col>
              <b-col class="d-flex justify-content-end pr-1" >
                <span class="d-flex align-items-center justify-content-center pr-2">  {{doc.category.text}} </span>
                <country-image v-model="doc.country" :id="doc._id"/>
              </b-col>
            </b-row>

            <!-- Details -->
            <recipe-details :recipe="doc" class="details-recipes" />

            <!-- Likes and Comments -->
            <template #footer>
              <b-row align-h="between">
                <b-col>
                  <!-- Like of a RECIPE -->
                  <like v-model="doc.likes" :recipe="{id: doc._id, ownerID: doc.owner._id}" :no-like="youNotMakeLike(ind)"/>
                </b-col>
                <b-col align="end">
                  <b-icon-chat class="icon" v-b-toggle="commentsId(doc._id)" :class="{'no-clickable': !showCollapse(doc)}"/>
                </b-col>
              </b-row>
              <b-collapse :id="commentsId(doc._id)" class="mt-2" v-if="showCollapse(doc)">
                <!-- LIST COMMENT for a RECIPE -->
                <comments v-model="doc.comments" :recipe="{id: doc._id, ownerID: doc.owner._id}" :language="language" />
              </b-collapse>
            </template>

          </b-card>
        </b-col>
      </b-row>
      <b-row class="mt-3" align-h="center" v-if="areOthers">
        <b-button variant="link" @click="others">Altri ...</b-button>
      </b-row>
     </b-container>
    </b-skeleton-wrapper>

  </b-container>
</template>

<script>
import {RecipeCategories} from "@services/app";
import api from '@api'
import {mapGetters} from "vuex";

export default {
  name: "HomePage",
  data: function (){
    return {
      skeletons: 5,

      language: 'it',

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

    ...mapGetters(['userIdentifier', 'accessToken', 'isAdmin'])
  },
  methods: {
    redirectToRecipe(rec){
      return { name: 'single-recipe', params: { id: rec.owner._id, recipe_id: rec._id } }
    },

    commentsId(id){
      return 'comments-'+ id
    },

    showCollapse(doc){
      return !(this.isAdmin && doc.comments.length === 0)
    },

    youNotMakeLike(index){
      return this.isAdmin || this.docs[index].owner._id === this.userIdentifier
    },
    /* -- REQUEST --*/

    updateDocs(){
      this.docs.forEach(p => {
        let category = RecipeCategories.find(p.category)
        if(category) p.category = category
      })
    },

    getPost(currentPage){
      this.optionsPagination.page = currentPage || 1
      api.recipes.allSharedRecipes(this.accessToken, this.optionsPagination)
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

.description-post {
  position: absolute;
  background-color: $overlay;
  color: white;
  top:10%;
  left: 15px;
  width: 100%;
}
.details-recipes{
  position: absolute;
  right: 5px;
  bottom: 185px
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

  & .recipe-post-link{
    color: white;
  }

  & .recipes-tutorial{
    height: 300px;
  }
}

</style>