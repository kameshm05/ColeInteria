import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { escape } from '@microsoft/sp-lodash-subset';
import "../../ExternalRef/Css/style.css";
import styles from './ColeProjectWebPart.module.scss';
import * as strings from 'ColeProjectWebPartStrings';
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/fields";
import { getGUID } from "@pnp/common";
import { UrlFieldFormatType } from "@pnp/sp/fields/types";
import { List } from "@pnp/sp/lists";
import "chart.js";
import Chart from 'chart.js';
import * as google from 'google';
import {GoogleCharts} from 'google-charts';
import * as jQuery from "jquery";
import * as moment from "moment";
import * as bootstrap from "bootstrap";
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel';
import "../../ExternalRef/css/style.css";

import "../../ExternalRef/css/bootstrap-datepicker.min.css";
import "../../ExternalRef/js/bootstrap-datepicker.min.js";
import "../../ExternalRef/js/bootstrap.min.js";
import * as carousel from "bootstrap"


require('../../../node_modules/bootstrap/dist/css/bootstrap.css');
require('../../../node_modules/bootstrap/dist/css/bootstrap.min.css');
// require('../../../node_modules/bootstrap/dist/css/bootstrap-theme.css');
// require('../../../node_modules/bootstrap/dist/css/bootstrap-theme.min.css');
// require('../../../node_modules/font-awesome/css/font-awesome.css');
// require('../../../node_modules/font-awesome/css/font-awesome.min.css');

export interface IColeProjectWebPartProps {
  description: string;
}
let elementMCI;
let elementLeads;
let htppurl;
let Madtarget;
let listUrl="";
var timeNow = moment(new Date().toLocaleDateString()).format("D/M/YYYY");
let users = [];

export default class ColeProjectWebPart extends BaseClientSideWebPart<IColeProjectWebPartProps> {
  
  // constructor(props){}

  public onInit(): Promise<void> {
 
    return super.onInit().then((_) => {
      google.charts.load("current", { packages: ["corechart","bar"] });
      google.charts.setOnLoadCallback(getData);
      // google.charts.setOnLoadCallback(weekData);
      sp.setup({
        spfxContext: this.context,
      });
      htppurl = this.context.httpClient;
    });
    
  } 
  
  public render(): void {
    this.domElement.innerHTML = `
    <div class="caro">
    <div class="item">
    <div class="header">
    <div class="date-section"><input type="type" id="datePicker"><button class="btn btn-primary" id="submitBtn">Submit</button>
    </div>
    <div class="legend-section">
    <div class="grey" ><span></span>Target</div>
    <div class="green"><span></span>Actual</div>
    </div></div>
    <div class="carousel theme">
    <div class="dateWise">
    <div class="container-sec-1">

   </div>

   </div>  
   </div>
   </div>  

  
  </div>
  <div>
  
   `; 
  (<any>$("#datePicker")).datepicker({ format: "d/m/yyyy"}).datepicker("setDate",new Date());
  
  

  //  weekData();
   window.addEventListener("DOMContentLoader",()=>{ getData();});


      const btn = document.querySelector("#submitBtn");
      btn.addEventListener("click",()=>{
        
        let cont = document.querySelector(".container-sec-1");
        cont.innerHTML = '';
        let pickerDate = (<HTMLInputElement>document.querySelector("#datePicker")).value;
        console.log(pickerDate);
        
        // console.log(new Date(pickerDate).toLocaleDateString());
        timeNow=pickerDate;
        console.log(`Timenow${timeNow}`);
        
        getData();
      })
        }
     
  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }



  
}

async function getData(){
  const appendSection= document.querySelector(".container-sec-1");
  let list = await sp.web.lists.getByTitle("MsiFormsList").items.select("Title","Date","CustomerName","Company","ProjectName","TypeOfInteraction","Notes","NewLead","TargetValue","TargetTypes/ID","TargetTypes/Title","SalesRep/Title").expand("TargetTypes","SalesRep").getAll(); 
  console.log(list);
  let getAllUsers=await sp.web.lists.getByTitle("Types").items.getAll().then((users)=>{
    users=users.map((item)=>{
      return item.Title.split('-')[0]
    });
    users = users.filter((item,i)=>users.indexOf(item)==i);
    console.log(users);

    users.forEach((Datas,k)=>{
      elementMCI = document.createElement("div");
      elementMCI.setAttribute("id",`MCI${k}`);
      elementMCI.setAttribute("class",`Chart`);
      appendSection.appendChild(elementMCI);
      elementLeads = document.createElement("div");
      elementLeads.setAttribute("id",`Leads${k}`);
      elementLeads.setAttribute("class",`Chart`);
      appendSection.appendChild(elementLeads);
  
      console.log(timeNow);
      
      let MCITargetTypes = [];
      let LeadsTargetTypes =[];
      let MCITargetValue=[];
      let LeadsTargetValue=[];
        let listData=[];
        listData = list.filter((list)=>{return list.Date==timeNow && list.SalesRep.Title==Datas && list.TargetTypes.length >=0});
        if(listData.length>0){
          for(let i=0;i<listData.length;i++){
            MCITargetValue.push(parseInt(listData[i].TargetValue.split('-')[0]));
          }
        }
         MCITargetValue=MCITargetValue.pop();
        let listData2=[];
        listData2 = list.filter((list)=>{return list.Date==timeNow && list.SalesRep.Title==Datas && list.TargetTypes.length == 2});
        if(listData2.length>0){
          for(let j=0;j<listData2.length;j++){
            LeadsTargetValue.push(parseInt(listData2[j].TargetValue.split('-')[1]));
          }
        } 
        LeadsTargetValue=LeadsTargetValue.pop();
        let MCIAchieved= (list.filter((list)=>{return list.SalesRep.Title == Datas && list.TargetTypes.length >= 0  && list.Date == timeNow}));
        let LeadsAchieved= (list.filter((list)=>{return list.SalesRep.Title == Datas && list.TargetTypes.length == 2  && list.Date == timeNow}));
        
        //MCI 
    const data =new google.visualization.DataTable();
        data.addColumn('string', '');
        data.addColumn('number', 'MCI Target');
        data.addColumn({type: 'number', role: 'annotation'});
        data.addColumn('number', 'MCI Actual');
        data.addColumn({type: 'number', role: 'annotation'});
        data.addRows([
          ["MCI", MCITargetValue, MCITargetValue, MCIAchieved.length, MCIAchieved.length],
        ]);
         
        var options = {
          annotations: {
            alwaysOutside: true,
            textStyle: {
              fontSize: 14,
              color: '#000',
              auraColor: 'none'
            }
          },
          width:180,
          height:400,
          colors:["#9a9b9d","#becc1f"],
          title: Datas,
          legend: {position: 'none'},
          hAxis: {
            title: "",
          },
        };
    var materialChart = new google.visualization.ColumnChart(document.getElementById(`MCI${k}`));
    materialChart.draw(data, options);
    
        //Leads
    const data2 =new google.visualization.DataTable();
    data2.addColumn('string', '');
    data2.addColumn('number', 'Leads Target');
    data2.addColumn({type: 'number', role: 'annotation'});
    data2.addColumn('number', 'Leads Actual');
    data2.addColumn({type: 'number', role: 'annotation'});
    data2.addRows([
      ["Leads", LeadsTargetValue,LeadsTargetValue, LeadsAchieved.length, LeadsAchieved.length],
      ]); 
    var options2 = {
      annotations: {
        alwaysOutside: true,
        textStyle: {
          fontSize: 14,
          color: '#000',
          auraColor: 'none'
        }
      },
      width:180,
      height:400,
      colors:["#9a9b9d","#becc1f"],
      title: Datas,
      legend: {position: 'none'},
      hAxis: {
        title: "",
      }, 
    };
  var materialChart2 = new google.visualization.ColumnChart(document.getElementById(`Leads${k}`));
  materialChart2.draw(data2, options2);
    });
    setTimeout(()=>{
      window.location.reload();
    },180000);
  })
  // list.forEach((list=>{users.push(list.SalesRep.Title)}));
  //users = users.filter((item,i)=>users.indexOf(item)==i);
  // console.log(users);
  

  
}


// async function weekData(){
//   let list = await sp.web.lists.getByTitle("MsiFormsList").items.select("Title","Date","CustomerName","Company","ProjectName","TypeOfInteraction","Notes","NewLead","TargetValue","TargetTypes/ID","TargetTypes/Title","SalesRep/Title").expand("TargetTypes","SalesRep").getAll(); 
//   console.log(list);
//   let listDates = [];
//   list.forEach(list=>{listDates.push(list.Date)});
//   let uArray = listDates.filter(function(item, pos) {
//     return listDates.indexOf(item) == pos;
// })
  

// //   let weekDates = uArray.sort().slice(Math.max(uArray.length - 7, 0));
// // console.log(weekDates);
// let weekDates=["11/30/2020","12/1/2020","12/2/2020","12/3/2020","12/4/2020"];



//     //Target
//     let LeadsList = list.filter(list=>list.Date == timeNow && list.TargetValue.split("-").length == 2);
//     console.log(LeadsList);
//     let LeadsTarget = LeadsList.map(list=>list.TargetValue.split("-")[1]).pop();
//     console.log(LeadsTarget);
//     let MCIList = list.filter(list=>list.Date == timeNow && list.TargetValue.split("-").length == 1);
//     console.log(MCIList);
//     let MCITarget = MCIList.map(list=>list.TargetValue.split("-")[0]).pop();
//     console.log(MCITarget);


    
//    var LeadsTotalTarget=0;
//     //Madhesh Acheive
//     weekDates.map((days)=>{
//       var litdata=[];
//       litdata= list.filter((listdata)=>{
//     return listdata.Date==days&& listdata.SalesRep.Title == "Madhesh Maasi" && listdata.TargetTypes.length >= 0

//       });
//       if(litdata.length>0)
//       {
//         LeadsTotalTarget=LeadsTotalTarget+parseInt(litdata[0].TargetValue.split('-')[1])
//       }
//     });
//     console.log(LeadsTotalTarget);

//     var MCITotalTarget=0;
//     //Madhesh Acheive
//     weekDates.map((days)=>{
//       var litdata=[];
//       litdata= list.filter((listdata)=>{
//     return listdata.Date==days&& listdata.SalesRep.Title == "Madhesh Maasi" && listdata.TargetTypes.length >= 0

//       });
//       if(litdata.length>0)
//       {
//         MCITotalTarget=MCITotalTarget+parseInt(litdata[0].TargetValue.split('-')[0])
//       }
//     });
//     console.log(MCITotalTarget);
// // let oneMCI  = list.filter((e) => {

// //    if(weekDates.indexOf(e.Date) > -1 && e.SalesRep.Title == "Madhesh Maasi" && e.TargetTypes.length >= 0)
// //    var frstday=e.TargetValue;
// //    else if(weekDates.indexOf(e.Date) > -1 && e.SalesRep.Title == "Madhesh Maasi" && e.TargetTypes.length >= 0)
// //    var frstday=e.TargetValue;
// // });





  
// let oneMCI  = list.filter((e) => {return weekDates.indexOf(e.Date) > -1 && e.SalesRep.Title == "Madhesh Maasi" && e.TargetTypes.length >= 0;});

// let oneLeads = list.filter((e) => {return weekDates.indexOf(e.Date) > -1 && e.SalesRep.Title == "Madhesh Maasi" && e.TargetTypes.length == 2;});
  
// let twoMCI  = list.filter((e) => {return weekDates.indexOf(e.Date) > -1 && e.SalesRep.Title == "Kamesh M" && e.TargetTypes.length >= 0;});
// let twoLeads = list.filter((e) => {return weekDates.indexOf(e.Date) > -1 && e.SalesRep.Title == "Kamesh M" && e.TargetTypes.length == 2;});

// let threeMCI  = list.filter((e) => {return weekDates.indexOf(e.Date) > -1 && e.SalesRep.Title == "kali muthu" && e.TargetTypes.length >= 0;});
// let threeLeads = list.filter((e) => {return weekDates.indexOf(e.Date) > -1 && e.SalesRep.Title == "kali muthu" && e.TargetTypes.length == 2;});

// let fourMCI  = list.filter((e) => {return weekDates.indexOf(e.Date) > -1 && e.SalesRep.Title == "Chandru D" && e.TargetTypes.length >= 0;});
// let fourLeads = list.filter((e) => {return weekDates.indexOf(e.Date) > -1 && e.SalesRep.Title == "Chandru D" && e.TargetTypes.length == 2;});

// let fiveMCI  = list.filter((e) => {return weekDates.indexOf(e.Date) > -1 && e.SalesRep.Title == "Vinoth C" && e.TargetTypes.length >= 0;});
// let fiveLeads = list.filter((e) => {return weekDates.indexOf(e.Date) > -1 && e.SalesRep.Title == "Vinoth C" && e.TargetTypes.length == 2;});


//   let MTarget = list
 

  

//     {
//       const data11 =new google.visualization.DataTable();
//           data11.addColumn('string', '');
//           data11.addColumn('number', 'MCI Target');
//           data11.addColumn({type: 'number', role: 'annotation'});
//           data11.addColumn('number', 'MCI Madhesh');
//           data11.addColumn({type: 'number', role: 'annotation'});
//           data11.addColumn('number', 'MCI Kamesh');
//           data11.addColumn({type: 'number', role: 'annotation'});
//           data11.addColumn('number', 'MCI kali');
//           data11.addColumn({type: 'number', role: 'annotation'});
//           data11.addColumn('number', 'MCI Chandru');
//           data11.addColumn({type: 'number', role: 'annotation'});
//           data11.addColumn('number', 'MCI Vinoth');
//           data11.addColumn({type: 'number', role: 'annotation'});
//           data11.addRows([
//             ["MCI", MCITotalTarget, MCITotalTarget, oneMCI.length, oneMCI.length,twoMCI.length , twoMCI.length , threeMCI.length , threeMCI.length,fourMCI.length,fourMCI.length,fiveMCI.length,fiveMCI.length],
//           ]);
          
//           var options11 = {
//             annotations: {
//               alwaysOutside: true,
              
//               textStyle: {
//                 fontSize: 14,
//                 color: '#000',
//                 auraColor: 'none'
//               }
//             },bar: {gap: '20%'},
//             width:500,
//             height:500,
//             colors:["#9a9b9d","#00b8b5","#00d962","#ff3333","#fcc41c","#ed1cfc"],
//             title: '',
//             legend: {position: 'none'},
           
//             // hAxis: {
//             //   title: 'Madhesh Maasi',
//             // },
            
//           };    
//       var materialChart = new google.visualization.ColumnChart(document.getElementById('weekChart1'));
//       materialChart.draw(data11, options11);

//       const data12 =new google.visualization.DataTable();
//       data12.addColumn('string', '');
//       data12.addColumn('number', 'Leads Target');
//       data12.addColumn({type: 'number', role: 'annotation'});
//       data12.addColumn('number', 'Leads Madhesh');
//       data12.addColumn({type: 'number', role: 'annotation'});
//       data12.addColumn('number', 'Leads Kamesh');
//       data12.addColumn({type: 'number', role: 'annotation'});
//       data12.addColumn('number', 'Leads kali');
//       data12.addColumn({type: 'number', role: 'annotation'});
//       data12.addColumn('number', 'Leads Chandru');
//       data12.addColumn({type: 'number', role: 'annotation'});
//       data12.addColumn('number', 'Leads Vinoth');
//       data12.addColumn({type: 'number', role: 'annotation'});
//       data12.addRows([
//         ["Leads", LeadsTotalTarget, LeadsTotalTarget, oneLeads.length, oneLeads.length,twoLeads.length , twoLeads.length , threeLeads.length , threeLeads.length,fourLeads.length,fourLeads.length,fiveLeads.length,fiveLeads.length],
//       ]);
      
//       var options12 = {
//         annotations: {
//           alwaysOutside: true,
//           textStyle: {
//             fontSize: 14,
//             color: '#000',
//             auraColor: 'none'
//           }
//         },
//         bar: {gap: '20%'},
//         width:500,
//         height:500,
//         colors:["#9a9b9d","#00b8b5","#00d962","#ff3333","#fcc41c","#ed1cfc"], 
//         title: '',
//         legend: {position: 'none'},
       
//         // hAxis: {
//         //   title: 'Madhesh Maasi',
//         // },
        
//       };
//   var materialChart2 = new google.visualization.ColumnChart(document.getElementById('weekChart2'));
//   materialChart2.draw(data12, options12);
//     }
    
  
  
    

  

// }


