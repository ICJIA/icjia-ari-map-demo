<template>
  <div id="factSheetDisplay">
    <div class="text-center">

      <div class="panel panel-default factsheet" style="margin-top: 30px">
        <div class="panel-heading">
          <div class="panel-title" style="font-weight: 900; text-transform: uppercase">{{countyMetaData.title}} Fact Sheet</div>
        </div>
        <div class="panel-body" style="text-align: left">
          <div class="panel-text" v-html="countyMetaData.factSheet"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
    // import {
    //     EventBus
    // } from '../../event-bus.js';
    export default {
        props: ['countyMetaData'],
        name: 'DisplayFactSheet',
        mounted() {



        },
    }
</script>


<style>

</style>