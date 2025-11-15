const DATA_URL = './data.json';
let DATA = null;

async function loadData(){
  const res = await fetch(`${DATA_URL}?v=${Date.now()}`,{cache:'no-store'});
  if(!res.ok) throw new Error('Erreur chargement data.json');
  DATA = await res.json();
  return DATA;
}

const css=getComputedStyle(document.documentElement);
const cBlanc  = css.getPropertyValue('--blanc').trim()  || '#FFFFFF';
const cRouge     = css.getPropertyValue('--rouge').trim()     || '#C1121F';
const cBleu = css.getPropertyValue('--bleu').trim() || '#006875';

const config={ responsive:false, displaylogo:false };

function targetSizeFor(id){
  const el=document.getElementById(id);
  const panel=el?.closest('.panel') ?? document.body;
  const h=420;
  const w=Math.min(700, Math.max(400, panel.clientWidth * 0.95));
  return {width:w,height:h};
}

function baseLayout({width,height}){
  return{
    paper_bgcolor:'#000',
    plot_bgcolor:'#000',
    margin:{l:60,r:60,t:10,b:50},
    width,height,
    font:{family:'Lora,Georgia,serif',color:'#FFFFFF',size:14},
    legend:{orientation:'h',x:0.5,xanchor:'center',y:-0.18},
    xaxis:{automargin:true,showgrid:false,showline:true,linecolor:cBlanc},
    yaxis:{automargin:true,showgrid:false,showline:true,linecolor:cBlanc}
  };
}

function centerPlot(id){
  const el=document.getElementById(id);
  const plot=el.querySelector('.js-plotly-plot');
  if(!plot)return;
  plot.style.margin='0 auto';
}

function drawEvolution(d){
  const {width,height}=targetSizeFor('chart-evolution');
  const t1={name:'Tabac',x:d.annees,y:d.tabac,type:'scatter',mode:'lines+markers',
    line:{color:cRouge,width:3,shape:'spline',smoothing:0.6},marker:{color:cRouge,size:8}};
  const t2={name:'E-cigarette',x:d.annees,y:d.ecig,type:'scatter',mode:'lines+markers',
    line:{color:cBleu,width:3,shape:'spline',smoothing:0.6},marker:{color:cBleu,size:8}};
  const layout=baseLayout({width,height});
  layout.yaxis={...layout.yaxis,title:'Part (%)',range:[0,30]};
  Plotly.newPlot('chart-evolution',[t1,t2],layout,config).then(()=>centerPlot('chart-evolution'));
}

function drawAge(d){
  const {width,height}=targetSizeFor('chart-age');
  const b1={name:'Tabac',x:d.ages,y:d.tabacQ,type:'bar',marker:{color:cRouge}};
  const b2={name:'E-cigarette',x:d.ages,y:d.ecigQ,type:'bar',marker:{color:cBleu}};
  const layout=baseLayout({width,height});
  layout.barmode='group';
  layout.yaxis={...layout.yaxis,title:'Part (%)',range:[0,35]};
  Plotly.newPlot('chart-age',[b1,b2],layout,config).then(()=>centerPlot('chart-age'));
}

async function init(){
  await loadData();
  drawEvolution(DATA);
  drawAge(DATA);
}
init();

let raf;
window.addEventListener('resize',()=>{
  cancelAnimationFrame(raf);
  raf=requestAnimationFrame(()=>{
    const e=targetSizeFor('chart-evolution');
    const a=targetSizeFor('chart-age');
    Promise.all([
      Plotly.relayout('chart-evolution',{width:e.width,height:e.height}),
      Plotly.relayout('chart-age',{width:a.width,height:a.height})
    ]);
  });
});

document.addEventListener('DOMContentLoaded',()=>{
  const faders=document.querySelectorAll('.fade-in');
  const observer=new IntersectionObserver((entries,obs)=>{
    entries.forEach(e=>{
      if(!e.isIntersecting)return;
      e.target.classList.add('visible');
      obs.unobserve(e.target);
    });
  },{threshold:0.2});
  faders.forEach(f=>observer.observe(f));

  const btn=document.getElementById('toggle-mentions');
  const box=document.getElementById('mentions-content');
  if(!btn||!box)return;
  btn.setAttribute('aria-expanded','false');
  btn.addEventListener('click',()=>{
    const open=btn.getAttribute('aria-expanded')==='true';
    btn.setAttribute('aria-expanded',open?'false':'true');
    box.hidden=open;
  });
});