const annees=[2017,2018,2019,2020,2021,2022,2023];
const tabac=[26.9,25.5,24.0,25.5,25.3,24.5,23.1];
const ecig=[2.7,3.8,4.4,4.3,5.0,5.5,6.1];

const css = getComputedStyle(document.documentElement);
const cRouge = css.getPropertyValue('--rouge').trim() || '#9B2C2C';
const cOr    = css.getPropertyValue('--or').trim()    || '#C88C3B';
const cViolet= css.getPropertyValue('--violet').trim()|| '#7A77FF';

const traceTabac={
  name:'Tabagisme quotidien',x:annees,y:tabac,type:'scatter',mode:'lines+markers',
  line:{color:cOr,width:3,shape:'spline',smoothing:0.6},marker:{color:cOr,size:8}
};

const traceEcig={
  name:'E‑cigarette – usage quotidien',x:annees,y:ecig,type:'scatter',mode:'lines+markers',
  line:{color:cViolet,width:3,shape:'spline',smoothing:0.6},marker:{color:cViolet,size:8}
};

const layout={
  paper_bgcolor:'#ffffff',plot_bgcolor:'#ffffff',
  margin:{l:60,r:20,t:10,b:50},
  font:{family:'Lora, Georgia, serif',color:'#161616',size:14},
  xaxis:{title:'',tickfont:{color:'#2b2f36'},showgrid:false,showline:true,linecolor:cRouge,zeroline:false},
  yaxis:{title:'Part (%)',range:[0,30],tickformat:',.0f',tickfont:{color:'#2b2f36'},showgrid:false,showline:true,linecolor:cRouge,zeroline:false},
  legend:{orientation:'h',x:0.5,xanchor:'center',y:-0.18,font:{size:13}}
};

const config={responsive:true,displaylogo:false,toImageButtonOptions:{format:'png',filename:'data_smoke_tabac_ecig_2017_2023'}};

Plotly.newPlot('chart',[traceTabac,traceEcig],layout,config);
