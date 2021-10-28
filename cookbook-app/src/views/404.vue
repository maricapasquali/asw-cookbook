<template>
  <b-container fluid="sm">
    <b-row cols="1" align-v="center" class="vh-100">
        <b-card>
          <b-card-body class="text-center">
           <b-container fluid>
             <b-row cols="1" class="text-center">
               <img width="150" height="150" src="@assets/images/404-page.png" alt="Page Not Found" />
               <router-link :to="{name: 'homepage'}" replace><b-button>Vai alla HomePage</b-button></router-link>
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
}
</script>

<style scoped>
img{
  object-fit: contain;
}
</style>