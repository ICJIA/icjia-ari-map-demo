<template>
  <section id="Illinois">


    <div style="background: #fff;">
      <div class="container-fluid" style="padding: 50px 30px 50px 30px">
        <div class="row">
          <div class="col-md-6 hidden-xs hidden-sm">

            <div id="chart-container">Loading Adult Redeploy Illinois...
              <img src='/static/img/spinner.svg' />
            </div>
          </div>
          <div class="col-md-6">
            <div class="text-center" v-if="visibility" style="margin-top: 20px">
              <select v-model="selected" @change="getSelection($event)" style="width: 100%" class="select-style">
                <option disabled>Select your option</option>
                <option v-for="data in selectData" :value="data.id">{{ data.title }}</option>
              </select>
            </div>

            <!-- <display-about-redeploy v-if="!visibility"></display-about-redeploy> -->
            <display-about-redeploy v-if="!visibility"></display-about-redeploy>
            <!-- <div id="debug"></div> -->
            <div v-if="visibility" style="margin-top: 30px">
              <h2 class="h3" style="font-weight: 700; text-transform: none; padding-bottom: 10px; border-bottom: 1px solid #ccc;">{{countyMetaData.title}} Factsheet</h2>

              <div v-html='countyMetaData.factSheet'>

              </div>
              <hr>
            </div>





            <div class="about-toggle" v-if="visibility">
              <a v-on:click='toggleViz' class="sub-link">About Adult Redeploy Illinois&nbsp;&raquo;</a>
            </div>

            <div class="about-toggle" v-if="!visibility">
              <a v-on:click='getFirstFactSheet' class="sub-link">Display Fact Sheets&nbsp;&raquo;</a>
            </div>

          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  const loremIpsum = require('lorem-ipsum')
  import DisplayAboutRedeploy from './DisplayAboutRedeploy.vue'
  // Polyfill for IE
  require('es6-promise').polyfill();
  import axios from 'axios'
  // import {
  //     EventBus
  // } from '../../event-bus.js';

  export default {
    name: 'IllinoisMap',
    components: {
      DisplayAboutRedeploy,


    },
    mounted() {
      this.initializeChart()
      this.initializeCountySelect();

    },
    methods: {
      stringToKebabCase: function (string) {
        return string.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\s+/g, '-').toLowerCase()
      },
      consoleCallback(val) {
        console.dir(JSON.stringify(val))
      },
      toggleViz() {
        this.visibility = !this.visibility
      },
      initializeCountySelect() {

        // Grab all unique titles
        let data = _.uniqBy(this.fm.data, function (elem) {

          return JSON.stringify(_.pick(elem, ['title']));
        });

        // Remove unncessary keys
        data = _.map(data, o => _.omit(o, ['toolText', 'value', 'displayValue']));

        // Alphabetize
        data = _.orderBy(data, ['title'], ['asc']);

        // Finally, remove any elements that don't contain 'title' keys
        data = _.filter(data, (o) => (typeof o.title !== 'undefined'))

        // for (let [key, val] of Object.entries(data))
        //     val.label = val.title

        //console.log(data.length)

        this.selectData = data;

        return


      },
      initializeChart() {
        this.renderChart(this, this.setChartEvents(this));
      },
      getSelection(e) {
        this.selected = `${e.target.value}`
        this.countyMetaData = this.getCountyMetaData('id', this.selected)
        this.loadFactSheet(this.countyMetaData.title)
      },

      // },

      getFirstFactSheet: function () {
        this.selected = this.fm.data[0].id
        this.countyMetaData = this.getCountyMetaData('id', this.selected)
        this.loadFactSheet(this.countyMetaData.title)
      },

      getFillerContent: function (count, units, format) {
        let filler = loremIpsum({
          count: count // Number of words, sentences, or paragraphs to generate.
            ,
          units: units // Generate words, sentences, or paragraphs.
            ,
          sentenceLowerBound: 5 // Minimum words per sentence.
            ,
          sentenceUpperBound: 15 // Maximum words per sentence.
            ,
          paragraphLowerBound: 6 // Minimum sentences per paragraph.
            ,
          paragraphUpperBound: 8 // Maximum sentences per paragraph.
            ,
          format: format // Plain text or html
        })
        return filler
      },
      getCountyMetaData: function (key, value) {
        var myObj
        if (key === 'title') {
          myObj = _.find(this.fm.data, {
            'title': value
          });
        }
        if (key === 'id') {
          myObj = _.find(this.fm.data, {
            'id': value
          });
        }
        return myObj

      },
      loadFactSheet: function (t) {
        // Generate lorem ipsum filler
        //this.countyMetaData.factSheet = this.getFillerContent(3, 'paragraphs', 'html');
        this.visibility = true;
        //var siteUrl = `https://adultredeployil.us/sites/` + this.stringToKebabCase(this.countyMetaData.title)
        var siteUrl = `https://adultredeployil.us/sites/site-001`
        console.log('Site url for factsheet: ', siteUrl)
        this.countyMetaData.factSheet =
          `<div class="text-center" style="margin-top: 30px"></div>`
        axios.get(siteUrl)
          .then(response => {
            // this.renderFactSheet(response.data)
            //$('.panel-text').html(response.data)
            this.countyMetaData.factSheet = response.data
            this.$forceUpdate();
            //console.log(response.data)
          })
          .catch(e => {
            console.log('Error: ', e)
          })

      },
      renderFactSheet: function (str) {
        this.countyMetaData.factSheet = str
        $('.panel-text').html(str)
        this.$forceUpdate();
      },

      setChartEvents: function (vm) {
        const fusionEventsObj = {
          "entityClick": function (evt, data) {
            vm.countyId = data.id

            let metaData = vm.getCountyMetaData('id', vm.countyId)
            //console.log(metaData.displayValue)

            if (metaData.displayValue != '') {
              vm.countyMetaData = metaData
              vm.visibility = true;
              //console.log('click')
              vm.loadFactSheet(vm.countyMetaData.title)
              vm.selected = vm.countyMetaData.id


            }
          },
        }
        return fusionEventsObj

      },

      renderChart: function (vm, fusionEventsObj) {
        FusionCharts.ready(function () {

          this.ariMap = new FusionCharts({
            type: 'illinois',
            renderAt: 'chart-container',
            width: '600',
            height: '700',
            "events": fusionEventsObj,
            dataSource: {
              "chart": vm.fm.chart,
              "colorrange": vm.fm.colorrange,
              "data": vm.fm.data,
            }
          }).render();
        })

      }
    },
    data() {
      return {
        selected: '',
        selected2: '',
        countyId: '',
        visibility: false,
        countyMetaData: {},
        vm: this,
        selectData: [],
        testData: [{
          "id": "001",
          "displayValue": "AD",
          "value": "500",
          "toolText": "Adams",
          "title": "Adams County"
        }, {
          "id": "003",
          "displayValue": "",
          "title": "Adams County"
        }, {
          "id": "005",
          "displayValue": "",
          "title": "Boone County"
        }, {
          "id": "007",
          "displayValue": "BO",
          "value": "10",
          "toolText": "Boone",
          "title": "Boone County"
        }],
        fm: {
          "chart": {
            "caption": "Adult Redeploy Illinois SFY 2017",
            "subCaption": "Click county to display fact sheet",
            "captionFontSize": "18",
            "captionFontColor": "#222222",
            "subcaptionFontSize": "14",
            "subcaptionFontColor": "#888888",
            "animation": "0",
            "showBevel": "0",
            "showCanvasBorder": "0",
            "includeValueInLabels": "1",
            "baseFontSize": "9",
            "showToolTip": "1",
            "showLabels": "0",
            "includeNameInLabels": "0",
            "showMarkerLabels": "1",
            "fontBold": "1",
            "hoverColor": "#eeeeee",
            "exportenabled": "0",
            "showexportdatamenuitem": "0",
            "showprintmenuitem": "0",
            "useHoverColor": "1",
            "hoverOnEmpty": "1",
            "borderColor": "#777777",
            "legendPosition": "BOTTOM",
            "legendItemFontSize": "12",
            "legendItemFontColor": "#333333",
            "connectorColor": "#aaaaaa",
            "fillColor": "#ffffff",
            "showLegend": "1",
            "legendPosition": "bottom",
            "baseFontColor": "#aaaaaa"
          },
          "colorrange": {
            "color": [{
                "minValue": "0",
                "maxValue": "500",
                "displayValue": "ARI SFY17 sites",
                "color": "#2e2a7a"

              }, {
                "minValue": "500",
                "maxValue": "1000",
                "displayValue": "ARI planning grant counties",
                "color": "#5a53f2"

              },

            ]
          },
          "data": [{
            "id": "001",
            "displayValue": "AD",
            "value": "500",
            "toolText": "Adams",
            "title": "Adams County"
          }, {
            "id": "003",
            "displayValue": ""
          }, {
            "id": "005",
            "displayValue": ""
          }, {
            "id": "007",
            "displayValue": "BO",
            "value": "10",
            "toolText": "Boone",
            "title": "Boone County"
          }, {
            "id": "009",
            "displayValue": ""
          }, {
            "id": "011",
            "displayValue": ""
          }, {
            "id": "013",
            "displayValue": ""
          }, {
            "id": "015",
            "displayValue": ""
          }, {
            "id": "017",
            "displayValue": ""
          }, {
            "id": "019",
            "displayValue": ""
          }, {
            "id": "021",
            "displayValue": "CI",
            "value": "10",
            "toolText": "Christian",
            "title": "Christian County"
          }, {
            "id": "023",
            "displayValue": ""
          }, {
            "id": "025",
            "displayValue": "CY",
            "value": "500",
            "toolText": "Clay",
            "title": "Clay County"
          }, {
            "id": "027",
            "displayValue": ""
          }, {
            "id": "029",
            "displayValue": ""
          }, {
            "id": "031",
            "displayValue": "CK",
            "value": "10",
            "toolText": "Cook",
            "title": "Cook County"
          }, {
            "id": "033",
            "displayValue": "CF",
            "value": "10",
            "toolText": "Crawford",
            "title": "Crawford County"
          }, {
            "id": "035",
            "displayValue": ""
          }, {
            "id": "037",
            "displayValue": "DE",
            "value": "10",
            "toolText": "DeKalb",
            "title": "DeKalb County"
          }, {
            "id": "039",
            "displayValue": ""
          }, {
            "id": "041",
            "displayValue": ""
          }, {
            "id": "043",
            "displayValue": "DP",
            "value": "10",
            "toolText": "DuPage",
            "title": "DuPage County"
          }, {
            "id": "045",
            "displayValue": ""
          }, {
            "id": "047",
            "displayValue": "EW",
            "value": "10",
            "toolText": "Edwards",
            "title": "Edwards County"
          }, {
            "id": "049",
            "displayValue": "EF",
            "value": "10",
            "toolText": "Effingham",
            "title": "Effingham County"
          }, {
            "id": "051",
            "displayValue": "FA",
            "value": "500",
            "toolText": "Fayette",
            "title": "Fayette County"
          }, {
            "id": "053",
            "displayValue": ""
          }, {
            "id": "055",
            "displayValue": "FR",
            "value": "10",
            "toolText": "Franklin",
            "title": "Franklin County"
          }, {
            "id": "057",
            "displayValue": "FU",
            "value": "10",
            "toolText": "Fulton",
            "title": "Fulton County"
          }, {
            "id": "059",
            "displayValue": "GA",
            "value": "10",
            "toolText": "Gallatin",
            "title": "Gallatin County"
          }, {
            "id": "061",
            "displayValue": "GR",
            "value": "500",
            "toolText": "Greene",
            "title": "Greene County"
          }, {
            "id": "063",
            "displayValue": "GU",
            "value": "10",
            "toolText": "Grundy",
            "title": "Grundy County"
          }, {
            "id": "065",
            "displayValue": "HA",
            "value": "10",
            "toolText": "Hamilton",
            "title": "Hamilton County"
          }, {
            "id": "067",
            "displayValue": "HC",
            "value": "10",
            "toolText": "Hancock",
            "title": "Hancock County"
          }, {
            "id": "069",
            "displayValue": "HR",
            "value": "10",
            "toolText": "Hardin",
            "title": "Hardin County"
          }, {
            "id": "071",
            "displayValue": "HE",
            "value": "10",
            "toolText": "Henderson",
            "title": "Henderson County"
          }, {
            "id": "073",
            "displayValue": ""
          }, {
            "id": "075",
            "displayValue": ""
          }, {
            "id": "077",
            "displayValue": ""
          }, {
            "id": "079",
            "displayValue": "JS",
            "value": "500",
            "toolText": "Jasper",
            "title": "Jasper County"
          }, {
            "id": "081",
            "displayValue": "JE",
            "value": "10",
            "toolText": "Jefferson",
            "title": "Jefferson County"
          }, {
            "id": "083",
            "displayValue": "JR",
            "value": "10",
            "toolText": "Jersey",
            "title": "Jersey County"
          }, {
            "id": "085",
            "displayValue": ""
          }, {
            "id": "087",
            "displayValue": ""
          }, {
            "id": "089",
            "displayValue": ""
          }, {
            "id": "091",
            "displayValue": ""
          }, {
            "id": "093",
            "displayValue": "KD",
            "value": "10",
            "toolText": "Kendall",
            "title": "Kendall County"
          }, {
            "id": "095",
            "displayValue": "KO",
            "value": "10",
            "toolText": "Knox",
            "title": "Knox County"
          }, {
            "id": "097",
            "displayValue": "LA",
            "value": "10",
            "toolText": "Lake",
            "title": "Lake County"
          }, {
            "id": "099",
            "displayValue": "LS",
            "value": "10",
            "toolText": "LaSalle",
            "title": "LaSalle County"
          }, {
            "id": "101",
            "displayValue": "LW",
            "value": "10",
            "toolText": "Lawrence",
            "title": "Lawrence County"
          }, {
            "id": "103",
            "displayValue": ""
          }, {
            "id": "105",
            "displayValue": ""
          }, {
            "id": "107",
            "displayValue": ""
          }, {
            "id": "109",
            "displayValue": "MD",
            "value": "10",
            "toolText": "McDonough",
            "title": "McDonough County"
          }, {
            "id": "111",
            "displayValue": ""
          }, {
            "id": "113",
            "displayValue": "ML",
            "value": "10",
            "toolText": "McLean",
            "title": "McLean County"
          }, {
            "id": "115",
            "displayValue": "MA",
            "value": "10",
            "toolText": "Macon",
            "title": "Macon County"
          }, {
            "id": "117",
            "displayValue": "MP",
            "value": "500",
            "toolText": "Macoupin",
            "title": "Macoupin County"
          }, {
            "id": "119",
            "displayValue": "MI",
            "value": "10",
            "toolText": "Madison",
            "title": "Madison County"
          }, {
            "id": "121",
            "displayValue": ""
          }, {
            "id": "123",
            "displayValue": ""
          }, {
            "id": "125",
            "displayValue": ""
          }, {
            "id": "127",
            "displayValue": ""
          }, {
            "id": "129",
            "displayValue": ""
          }, {
            "id": "131",
            "displayValue": ""
          }, {
            "id": "133",
            "displayValue": "ME",
            "value": "10",
            "toolText": "Monroe",
            "title": "Monroe County"
          }, {
            "id": "135",
            "displayValue": ""
          }, {
            "id": "137",
            "displayValue": "MG",
            "value": "500",
            "toolText": "Morgan",
            "title": "Morgan County"
          }, {
            "id": "139",
            "displayValue": ""
          }, {
            "id": "141",
            "displayValue": ""
          }, {
            "id": "143",
            "displayValue": "PE",
            "value": "10",
            "toolText": "Peoria",
            "title": "Peoria County"
          }, {
            "id": "145",
            "displayValue": "PR",
            "value": "500",
            "toolText": "Perry",
            "title": "Perry County"
          }, {
            "id": "147",
            "displayValue": ""
          }, {
            "id": "149",
            "displayValue": ""
          }, {
            "id": "151",
            "displayValue": ""
          }, {
            "id": "153",
            "displayValue": ""
          }, {
            "id": "155",
            "displayValue": ""
          }, {
            "id": "157",
            "displayValue": "RA",
            "value": "10",
            "toolText": "Randolph",
            "title": "Randolph County"
          }, {
            "id": "159",
            "displayValue": "RI",
            "value": "10",
            "toolText": "Richland",
            "title": "Richland County"
          }, {
            "id": "161",
            "displayValue": ""
          }, {
            "id": "163",
            "displayValue": "SC",
            "value": "10",
            "toolText": "St. Clair",
            "title": "St. Clair County"
          }, {
            "id": "165",
            "displayValue": ""
          }, {
            "id": "167",
            "displayValue": "SN",
            "value": "10",
            "toolText": "Sangamon",
            "title": "Sangamon County"
          }, {
            "id": "169",
            "displayValue": ""
          }, {
            "id": "171",
            "displayValue": "ST",
            "value": "500",
            "toolText": "Scott",
            "title": "Scott County"
          }, {
            "id": "173",
            "displayValue": ""
          }, {
            "id": "175",
            "displayValue": ""
          }, {
            "id": "177",
            "displayValue": ""
          }, {
            "id": "179",
            "displayValue": ""
          }, {
            "id": "181",
            "displayValue": ""
          }, {
            "id": "183",
            "displayValue": ""
          }, {
            "id": "185",
            "displayValue": "WA",
            "value": "10",
            "toolText": "Wabash",
            "title": "Wabash County"
          }, {
            "id": "187",
            "displayValue": "WR",
            "value": "10",
            "toolText": "Warren",
            "title": "Warren County"
          }, {
            "id": "189",
            "displayValue": "WS",
            "value": "500",
            "toolText": "Washington",
            "title": "Washington County"
          }, {
            "id": "191",
            "displayValue": "WY",
            "value": "10",
            "toolText": "Wayne",
            "title": "Wayne County"
          }, {
            "id": "193",
            "displayValue": "WH",
            "value": "10",
            "toolText": "White",
            "title": "White County"
          }, {
            "id": "195",
            "displayValue": ""
          }, {
            "id": "197",
            "displayValue": "WI",
            "value": "10",
            "toolText": "Will",
            "title": "Will County"
          }, {
            "id": "199",
            "displayValue": ""
          }, {
            "id": "201",
            "displayValue": "WB",
            "value": "10",
            "toolText": "Winnebago",
            "title": "Winnebago County"
          }, {
            "id": "203",
            "displayValue": ""
          }]
        }
      }
    }
  }

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .about-toggle {
    float: right;
    margin-top: -10px;
    text-transform: uppercase;
    font-weight: 900;
    font-size: 14px;
    font-family: 'Lato', sans-serif;
  }

  .about-toggle:hover {
    cursor: pointer;
  }

  .loader {
    color: #bbb
  }

</style>
