import React, { useRef, useEffect } from 'react';
import './FieldMap.css';

const FIELD_DEFS = [
  {x:0.05,y:0.08,w:0.28,h:0.30,yield:5.2},{x:0.35,y:0.05,w:0.22,h:0.28,yield:7.1},
  {x:0.60,y:0.06,w:0.18,h:0.32,yield:4.1},{x:0.80,y:0.08,w:0.17,h:0.25,yield:8.2},
  {x:0.05,y:0.42,w:0.20,h:0.28,yield:6.0},{x:0.28,y:0.40,w:0.25,h:0.30,yield:3.5},
  {x:0.55,y:0.42,w:0.20,h:0.28,yield:5.8},{x:0.78,y:0.38,w:0.19,h:0.30,yield:6.9},
  {x:0.06,y:0.74,w:0.32,h:0.22,yield:5.5},{x:0.42,y:0.74,w:0.22,h:0.22,yield:7.4},
  {x:0.67,y:0.72,w:0.15,h:0.24,yield:4.8},{x:0.84,y:0.72,w:0.13,h:0.24,yield:6.3},
];

function drawMap(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#04100a'; ctx.fillRect(0,0,W,H);
  FIELD_DEFS.forEach(f => {
    const fx=f.x*W, fy=f.y*H, fw=f.w*W, fh=f.h*H;
    const imgData=ctx.createImageData(Math.round(fw),Math.round(fh));
    for(let py=0;py<Math.round(fh);py++){
      for(let px=0;px<Math.round(fw);px++){
        const noise=(Math.random()-0.5)*1.8;
        const lY=Math.max(1,Math.min(9,f.yield+noise));
        const t=(lY-1)/8;
        let r,g,b;
        if(t<0.25){r=10+t*80;g=50+t*200;b=40+t*60;}
        else if(t<0.5){r=20+t*60;g=100+t*180;b=30;}
        else if(t<0.75){r=60+t*120;g=170+t*60;b=20+t*20;}
        else{r=180+t*60;g=200+t*30;b=50+t*60;}
        const idx=(py*Math.round(fw)+px)*4;
        imgData.data[idx]=Math.round(r);imgData.data[idx+1]=Math.round(g);imgData.data[idx+2]=Math.round(b);imgData.data[idx+3]=230;
      }
    }
    ctx.putImageData(imgData,Math.round(fx),Math.round(fy));
    ctx.strokeStyle='rgba(8,15,10,0.9)';ctx.lineWidth=2;ctx.strokeRect(fx,fy,fw,fh);
    ctx.fillStyle='rgba(0,0,0,0.65)';ctx.fillRect(fx+fw/2-20,fy+fh/2-10,40,18);
    ctx.fillStyle='#fff';ctx.font=`bold ${Math.max(10,Math.min(13,fw*0.12))}px Syne,sans-serif`;
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(f.yield.toFixed(1),fx+fw/2,fy+fh/2);
  });
  ctx.strokeStyle='rgba(8,15,10,0.8)';ctx.lineWidth=5;
  [[0,0.38,1,0.38],[0,0.70,1,0.70]].forEach(([x1,y1,x2,y2])=>{
    ctx.beginPath();ctx.moveTo(x1*W,y1*H);ctx.lineTo(x2*W,y2*H);ctx.stroke();
  });
  [[0.33,0,0.33,1],[0.58,0,0.58,1],[0.79,0,0.79,1]].forEach(([x1,y1,x2,y2])=>{
    ctx.beginPath();ctx.moveTo(x1*W,y1*H);ctx.lineTo(x2*W,y2*H);ctx.stroke();
  });
  ctx.fillStyle='rgba(200,240,176,0.5)';ctx.font='10px DM Mono,monospace';ctx.textAlign='left';
  ctx.fillText('0      500m',W-140,H-14);
}

export default function FieldMap() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.parentElement.offsetWidth || 700;
    canvas.height = 420;
    drawMap(canvas);
    const onResize = () => { canvas.width=canvas.parentElement.offsetWidth||700; canvas.height=420; drawMap(canvas); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <section id="field-map" className="section-fieldmap">
      <div className="section-tag">Spatial Analysis</div>
      <h2 className="section-title">Farm-Level Yield Map</h2>
      <p className="section-desc">Per-pixel yield predictions aggregated to field polygons showing within-field spatial variability.</p>
      <div className="map-layout reveal">
        <div className="map-canvas-wrap">
          <canvas ref={canvasRef} />
          <div className="map-overlay-tag">🛰 Synthetic VHR — 0.5m Resolution</div>
        </div>
        <div className="map-legend">
          <div className="legend-title">Yield Prediction Legend</div>
          <div className="legend-gradient" />
          <div className="legend-labels"><span>0 t/ha</span><span>3 t/ha</span><span>6 t/ha</span><span>9 t/ha</span></div>
          <div className="map-stats">
            {[['Mean Yield','5.8 t/ha'],['Std Deviation','±0.7 t/ha'],['Max Zone','8.2 t/ha'],['Stress Area','12.3%'],['Fields Mapped','24'],['Total Area','142 ha']].map(([l,v])=>(
              <div className="map-stat" key={l}>
                <span className="map-stat-label">{l}</span>
                <span className="map-stat-val">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
