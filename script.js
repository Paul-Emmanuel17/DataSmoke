// === Données ===
const annees=[2017,2018,2019,2020,2021,2022,2023];
const tabac=[26.9,25.5,24.0,25.5,25.3,24.5,23.1];
const ecig=[ 2.7, 3.8, 4.4, 4.3, 5.0, 5.5, 6.1];
const ages=['18–24','25–34','35–44','45–54','55–64','65–75'];
const tabacQ=[23.4,29.3,29.5,24.8,21.2,11.1];
const ecigQ =[ 7.1, 8.7, 7.6, 7.0, 4.7, 2.0];

// === Thème ===
const css=getComputedStyle(document.documentElement);
const cRouge=css.getPropertyValue('--rouge').trim()||'#9B2C2C';
const cOr=css.getPropertyValue('--or').trim()||'#C88C3B';
const cViolet=css.getPropertyValue('--violet').trim()||'#7A77FF';
const config={responsive:true,displaylogo:false,toImageButtonOptions:{format:'png',filename:'data_smoke'}};

// === Graphiques ===
(function(){
  const t1={name:'Tabagisme quotidien',x:annees,y:tabac,type:'scatter',mode:'lines+markers',
    line:{color:cOr,width:3,shape:'spline',smoothing:0.6},marker:{color:cOr,size:8},
    fill:'tozeroy',fillcolor:'rgba(200,140,59,0.16)',hovertemplate:'Tabac: %{y:.1f}%<extra></extra>'};
  const t2={name:'E-cigarette – usage quotidien',x:annees,y:ecig,type:'scatter',mode:'lines+markers',
    line:{color:cViolet,width:3,shape:'spline',smoothing:0.6},marker:{color:cViolet,size:8},
    fill:'tozeroy',fillcolor:'rgba(122,119,255,0.16)',hovertemplate:'E-cig: %{y:.1f}%<extra></extra>'};
  const layout={paper_bgcolor:'#fff',plot_bgcolor:'#fff',margin:{l:60,r:20,t:10,b:50},
    font:{family:'Lora,Georgia,serif',color:'#161616',size:14},
    xaxis:{showgrid:false,showline:true,linecolor:cRouge,zeroline:false},
    yaxis:{title:'Part (%)',range:[0,30],tickformat:',.0f',showgrid:false,showline:true,linecolor:cRouge,zeroline:false},
    legend:{orientation:'h',x:0.5,xanchor:'center',y:-0.18}};
  Plotly.newPlot('chart-evolution',[t1,t2],layout,config);
})();

(function(){
  const b1={name:'Tabac – quotidien 2023',x:ages,y:tabacQ,type:'bar',marker:{color:cOr}};
  const b2={name:'E-cig – quotidien 2023',x:ages,y:ecigQ,type:'bar',marker:{color:cViolet}};
  const layout2={paper_bgcolor:'#fff',plot_bgcolor:'#fff',barmode:'group',margin:{l:60,r:20,t:10,b:50},
    font:{family:'Lora,Georgia,serif',color:'#161616',size:14},
    xaxis:{showgrid:false,showline:true,linecolor:cRouge},
    yaxis:{title:'Part (%)',range:[0,35],tickformat:',.0f',showgrid:false,showline:true,linecolor:cRouge},
    legend:{orientation:'h',x:0.5,xanchor:'center',y:-0.18}};
  Plotly.newPlot('chart-age',[b1,b2],layout2,config);
})();

// === Mentions : toggle du contenu ===
const btn=document.getElementById('toggle-mentions');
const content=document.getElementById('mentions-content');

btn.addEventListener('click',()=>{
  const open=!content.classList.contains('is-open');
  content.classList.toggle('is-open',open);
  btn.setAttribute('aria-expanded',open);
  btn.textContent=open ? '▲ Masquer les mentions' : '🔽 Afficher les mentions';
});