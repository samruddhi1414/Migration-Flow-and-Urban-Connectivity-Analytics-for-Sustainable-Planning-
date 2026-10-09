import React, {useEffect, useMemo, useRef, useState} from 'react';
import './styles.css';
import 'leaflet/dist/leaflet.css';

const PAGES=['Overview','How People Commute','How Far','When & Where','Accessibility','Planning Insights'];
const modeColors={"On foot":"#2d79b9","Train":"#173f5f","Bus":"#4e9a86","Car / Jeep / Van":"#e6a23c","Two-wheeler":"#7b6b8f","Auto / Taxi":"#9f4d5c","Bicycle":"#8aa33c","Water transport":"#6f9fb5","Other":"#8d8d8d"};
const distLabels=['0ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“1 km','2ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“5 km','6ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“10 km','11ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“20 km','21ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“30 km','31ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“50 km','51+ km'];

function fmt(n){return new Intl.NumberFormat('en-IN').format(n)}
function pct(n){return `${Number(n).toFixed(1)}%`}

function Header({page,setPage}){return <>
  <header className="hero"><div><div className="eyebrow light">CEP Ãƒâ€šÃ‚Â· DATA ANALYTICS Ãƒâ€šÃ‚Â· MUMBAI</div><h1>Mumbai Commuting & Urban Mobility</h1><div className="tagline">Evidence ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Insight ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Planning</div></div><div className="source-pill">B-28 Ãƒâ€šÃ‚Â· CMP Ãƒâ€šÃ‚Â· BEST Ãƒâ€šÃ‚Â· SUBURBAN RAIL</div></header>
  <nav className="tabs">{PAGES.map(p=><button key={p} className={page===p?'active':''} onClick={()=>setPage(p)}>{p}</button>)}</nav>
</>}
function Card({children,className=''}){return <section className={`card ${className}`}>{children}</section>}
function Insight({title='Insight',children}){return <div className="insight"><strong>{title}</strong><div>{children}</div></div>}
function KPI({value,label,note}){return <div className="kpi"><strong>{value}</strong><span>{label}</span><small>{note}</small></div>}

function ModeChart({data,noTravel}){
  const max=Math.max(...data.map(x=>x.share));
  const shownShare=data.reduce((a,x)=>a+x.share,0);
  return <div className="mode-grid">
    <div className="donut-wrap">
      <div className="donut" style={{background:`conic-gradient(${data.map((d,i)=>`${modeColors[d.mode]||'#888'} ${data.slice(0,i).reduce((a,x)=>a+x.share,0)}% ${data.slice(0,i+1).reduce((a,x)=>a+x.share,0)}%`).join(',')}, #8d8d8d ${shownShare}% 100%)`}}>
        <div className="donut-hole"><b>{pct(shownShare)}</b><span>recorded travel modes</span></div>
      </div>
    </div>
    <div className="bars">
      {data.map(d=><div className="bar-row" key={d.mode}><label>{d.mode}</label><div className="track"><div className="fill" style={{width:`${(d.share/max)*100}%`}}/></div><b>{pct(d.share)}</b></div>)}
      <div className="no-travel-note"><span><i/> No travel</span><b>{pct(noTravel?.share||0)}</b></div>
    </div>
  </div>
}
function DistanceBars({distances}){return <div className="distance-bars">{distances.map(d=><div className="bar-row" key={d.distance}><label>{d.distance}</label><div className="track"><div className="fill" style={{width:`${d.share_stated}%`}}/></div><b>{pct(d.share_stated)}</b></div>)}</div>}

function Heatmap({matrix}){
  const [metric,setMetric]=useState('count');
  const columnTotals=distLabels.map((_,i)=>matrix.reduce((sum,row)=>sum+(row.distances[i]?.count||0),0));
  const maxCount=Math.max(...matrix.flatMap(r=>r.distances.map(d=>d.count||0)));
  const maxBandShare=Math.max(...matrix.flatMap(r=>r.distances.map((d,i)=>columnTotals[i]?(d.count||0)/columnTotals[i]*100:0)));
  const getValue=(row,i)=>{
    const d=row.distances[i]||{};
    if(metric==='withinMode') return d.share_within_mode||0;
    if(metric==='bandShare') return columnTotals[i] ? ((d.count||0)/columnTotals[i])*100 : 0;
    return d.count||0;
  };
  const display=(v)=>metric==='count'?fmt(v):pct(v);
  const cellTitle=(row,i)=>{
    const d=row.distances[i]||{};
    const bandShare=columnTotals[i] ? ((d.count||0)/columnTotals[i])*100 : 0;
    return `${row.mode} Ãƒâ€šÃ‚Â· ${d.distance}\n${fmt(d.count||0)} people\n${pct(d.share_within_mode||0)} of stated-distance ${row.mode.toLowerCase()} commuters\n${pct(bandShare)} of all stated-distance commuters in this band`;
  };
  return <div>
    <div className="heat-controls">
      <span>Measure:</span>
      <button className={metric==='count'?'active':''} onClick={()=>setMetric('count')}>People (count)</button>
      <button className={metric==='withinMode'?'active':''} onClick={()=>setMetric('withinMode')}>% within mode</button>
      <button className={metric==='bandShare'?'active':''} onClick={()=>setMetric('bandShare')}>% within distance</button>
    </div>
    <div className="heat-explain">
      {metric==='count' && <>Primary view: actual number of workers in each mode ÃƒÆ’Ã¢â‚¬â€ distance cell. This avoids making rare long-distance bands look larger than they are.</>}
      {metric==='withinMode' && <>Each row totals 100% across stated-distance bands. This answers: <b>within this mode, how far do its users travel?</b></>}
      {metric==='bandShare' && <>Each distance column totals 100%. This answers: <b>which modes dominate each distance band?</b></>}
    </div>
    <div className="heat-wrap"><div className="heat-grid" style={{gridTemplateColumns:`180px repeat(${distLabels.length}, minmax(82px,1fr))`}}>
      <div className="heat-head">Mode</div>{distLabels.map(d=><div className="heat-head" key={d}>{d}</div>)}
      {matrix.map(row=><React.Fragment key={row.mode}>
        <div className="heat-mode">{row.mode}</div>
        {row.distances.map((d,i)=>{
          const v=getValue(row,i);
          const norm=metric==='count' ? Math.sqrt((v||0)/maxCount) : (v||0)/(metric==='bandShare'?maxBandShare:100);
          return <div className="heat-cell" key={d.distance} title={cellTitle(row,i)} style={{opacity:.12+.80*Math.max(0,Math.min(1,norm))}}><span>{display(v)}</span></div>;
        })}
      </React.Fragment>)}
    </div></div>
    <div className="heat-footnote">Hover a cell for count plus both percentage denominators. Source: Census of India B-28 (2011), ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œOther workersÃƒÂ¢Ã¢â€šÂ¬Ã‚Â; stated-distance records only.</div>
  </div>;
}

function MapView({height=560}){
  const mapRef=useRef(null);
  const mapInstance=useRef(null);
  const layersRef=useRef({});
  const [geo,setGeo]=useState(null);
  const [access,setAccess]=useState([]);
  const [error,setError]=useState('');
  const [showRail,setShowRail]=useState(true);
  const [showStations,setShowStations]=useState(true);
  const [showBest,setShowBest]=useState(false);
  const [showRings,setShowRings]=useState(true);

  useEffect(()=>{
    Promise.all([
      '/Commuting_data/data/railway_network.geojson',
      '/Commuting_data/data/stations.geojson',
      '/Commuting_data/data/best_points.geojson',
      '/Commuting_data/data/station_accessibility.json'
    ].map(u=>fetch(u).then(r=>{if(!r.ok) throw new Error(`${u} (${r.status})`); return r.json();})))
      .then(([rail,stations,best,aa])=>{
        setGeo({rail,stations,best});
        setAccess(aa);
      })
      .catch(e=>setError(`Spatial data could not be loaded: ${e.message}`));
  },[]);

  useEffect(()=>{
    if(!geo || !mapRef.current || mapInstance.current) return;
    let cancelled=false;
    import('leaflet').then(({default:L})=>{
      if(cancelled || !mapRef.current) return;
      const map=L.map(mapRef.current,{zoomControl:true,preferCanvas:true});
      mapInstance.current=map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
        maxZoom:19,
        attribution:'&copy; OpenStreetMap contributors'
      }).addTo(map);

      const railStyle=(feature)=>{
        const name=(feature?.properties?.name||'').toUpperCase();
        if(name.includes('WESTERN')) return {color:'#c54b4b',weight:5,opacity:.95};
        if(name.includes('CENTRAL')) return {color:'#2767a0',weight:5,opacity:.95};
        if(name.includes('HARBOUR')) return {color:'#6f55a8',weight:4,opacity:.95};
        return {color:'#315d78',weight:4,opacity:.95};
      };

      const railLayer=L.geoJSON(geo.rail,{style:railStyle});
      const stationLayer=L.layerGroup();
      const ringLayer=L.layerGroup();
      const bestLayer=L.layerGroup();

      const byKey=new Map(access.map(a=>[`${a.name}|${Number(a.lon).toFixed(6)}|${Number(a.lat).toFixed(6)}`,a]));
      const accessFor=(f)=>{
        const [lon,lat]=f.geometry.coordinates;
        return byKey.get(`${f.properties?.name||''}|${Number(lon).toFixed(6)}|${Number(lat).toFixed(6)}`)
          || access.find(a=>Math.abs(a.lon-lon)<1e-5 && Math.abs(a.lat-lat)<1e-5);
      };
      const colorFor=(count)=>count<=5?'#d96c5f':count<=15?'#e3a43a':'#4e9a86';

      geo.stations.features.forEach((f)=>{
        const [lon,lat]=f.geometry.coordinates;
        const a=accessFor(f);
        const count=a?.best_points_500m ?? 0;
        const nearest=a?.nearest_best_m ?? null;
        const marker=L.circleMarker([lat,lon],{
          radius:Math.max(6,Math.min(12,5+Math.sqrt(Math.max(count,0))*.7)),
          color:'#173f5f',weight:1.6,fillColor:colorFor(count),fillOpacity:.94
        });
        marker.bindTooltip(`<strong>${f.properties?.name||'Rail station'}</strong><br/>${count} mapped BEST points within 500 m${nearest!==null?`<br/>Nearest mapped BEST point: ${Math.round(nearest)} m`:''}`,{sticky:true});
        marker.addTo(stationLayer);
        if(a){
          L.circle([lat,lon],{radius:500,color:'#e3a43a',weight:1,dashArray:'5 6',fillColor:'#e3a43a',fillOpacity:.045,interactive:false}).addTo(ringLayer);
        }
      });

      geo.best.features.forEach((f)=>{
        const [lon,lat]=f.geometry.coordinates;
        L.circleMarker([lat,lon],{radius:2.2,color:'#6f8fa5',weight:0,fillColor:'#6f8fa5',fillOpacity:.38,interactive:false}).addTo(bestLayer);
      });

      railLayer.addTo(map);
      stationLayer.addTo(map);
      ringLayer.addTo(map);
      layersRef.current={railLayer,stationLayer,ringLayer,bestLayer,map};
      const bounds=railLayer.getBounds();
      if(bounds.isValid()) map.fitBounds(bounds.pad(.06));
      else map.setView([19.08,72.88],11);
      setTimeout(()=>map.invalidateSize(),100);
    }).catch(e=>setError(`Map library could not load: ${e.message}`));

    return ()=>{
      cancelled=true;
      if(mapInstance.current){mapInstance.current.remove();mapInstance.current=null;}
    };
  },[geo,access]);

  useEffect(()=>{
    const l=layersRef.current;
    if(!l.map) return;
    showRail ? l.railLayer.addTo(l.map) : l.map.removeLayer(l.railLayer);
    showStations ? l.stationLayer.addTo(l.map) : l.map.removeLayer(l.stationLayer);
    showRings ? l.ringLayer.addTo(l.map) : l.map.removeLayer(l.ringLayer);
    showBest ? l.bestLayer.addTo(l.map) : l.map.removeLayer(l.bestLayer);
  },[showRail,showStations,showRings,showBest]);

  if(error)return <div className="map-loading error">{error}<br/><small>Run the dashboard through Vite using <b>npm run dev</b>.</small></div>;
  if(!geo||!access.length)return <div className="map-loading">Loading Mumbai mapÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦</div>;

  return <div className="map-card actual-map-card">
    <div className="map-controls">
      <label><input type="checkbox" checked={showRail} onChange={e=>setShowRail(e.target.checked)}/> Railway network</label>
      <label><input type="checkbox" checked={showStations} onChange={e=>setShowStations(e.target.checked)}/> Station screening</label>
      <label><input type="checkbox" checked={showRings} onChange={e=>setShowRings(e.target.checked)}/> 500 m rings</label>
      <label><input type="checkbox" checked={showBest} onChange={e=>setShowBest(e.target.checked)}/> BEST mapped points</label>
    </div>
    <div className="map-helper">
      <span><b>What the map shows:</b> actual Mumbai basemap with continuous suburban rail corridors and station-level BEST screening.</span>
      <span>Bubble size = mapped BEST points within 500 m</span>
    </div>
    <div ref={mapRef} className="leaflet-map" style={{height}} aria-label="Mumbai map showing suburban railway lines, railway stations and BEST mapped infrastructure" />
    <div className="map-legend rail-legend">
      <span><i className="rail-key western"/> Western Railway</span>
      <span><i className="rail-key central"/> Central Railway</span>
      <span><i className="rail-key harbour"/> Harbour Railway</span>
      <span><i className="lg-ring"/> 500 m screening</span>
      <span><i className="lg-station low"/> 0ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“5 BEST points</span>
      <span><i className="lg-station mid"/> 6ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“15</span>
      <span><i className="lg-station high"/> 16+</span>
    </div>
    <div className="map-note">The basemap provides geographic context (roads, coast and neighbourhoods). Railway lines come from the uploaded suburban railway KML. BEST points are mapped infrastructure features; proximity does not measure bus frequency, capacity, reliability, walking time or passenger demand.</div>
  </div>
}
function Overview({d,access}){
  const [district,setDistrict]=useState('Mumbai');
  const x=d[district];
  const uniqueStationNames=new Set(access.map(r=>r.name)).size;
  return <>
   <div className="kpi-grid">
    <KPI value={`${(x.workers_total/1e6).toFixed(2)}M`} label="Other workers analysed" note={`${district} Ãƒâ€šÃ‚Â· Census B-28 Ãƒâ€šÃ‚Â· 2011`}/>
    <KPI value={pct(x.modes.find(m=>m.mode==='Train')?.share||0)} label="Train share" note={`${district} Ãƒâ€šÃ‚Â· recorded mode`}/>
    <KPI value="61.2%" label="Public transport share of daily motorised trips" note="Greater Mumbai Ãƒâ€šÃ‚Â· CMP Ãƒâ€šÃ‚Â· 2014"/>
    <KPI value={`${access.filter(x=>x.best_points_500m>0).length}/${access.length}`} label="Station records with BEST ÃƒÂ¢Ã¢â‚¬Â°Ã‚Â¤500m" note={`${uniqueStationNames} unique station names Ãƒâ€šÃ‚Â· mapped proximity`}/>
   </div>
   <div className="two-col">
    <Card><div className="card-head"><div><div className="eyebrow">EVIDENCE 01</div><h2>How people commute</h2></div><select value={district} onChange={e=>setDistrict(e.target.value)}><option>Mumbai</option><option>Mumbai Suburban</option></select></div><ModeChart data={x.modes} noTravel={x.no_travel}/><Insight>Among B-28 ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œOther workersÃƒÂ¢Ã¢â€šÂ¬Ã‚Â, walking is the largest recorded mode in {district}, while rail is also a major component of commuting.</Insight></Card>
    <Card><div className="eyebrow">EVIDENCE 02</div><h2>Mobility pressure</h2><div className="big-stat">20 <small>km/h</small></div><p>Average journey speed during peak periods in the CMP base-year analysis, compared with 27 km/h off-peak.</p><div className="mini-grid"><KPI value="55s/km" label="Morning delay" note="CMP"/><KPI value="46s/km" label="Evening delay" note="CMP"/></div><Insight title="Planning signal">Peak-period demand and slower road movement strengthen the case for public-transport priority and multimodal access.</Insight></Card>
   </div>
   <Card><div className="eyebrow">EVIDENCE 03</div><h2>Rail + BEST integration</h2><div className="mini-grid four"><KPI value={`${access.filter(x=>x.best_points_250m>0).length}/${access.length}`} label="BEST ÃƒÂ¢Ã¢â‚¬Â°Ã‚Â¤250m" note="Station records"/><KPI value={`${access.filter(x=>x.best_points_500m>0).length}/${access.length}`} label="BEST ÃƒÂ¢Ã¢â‚¬Â°Ã‚Â¤500m" note="Station records"/><KPI value={`${access.filter(x=>x.best_points_1000m>0).length}/${access.length}`} label="BEST ÃƒÂ¢Ã¢â‚¬Â°Ã‚Â¤1km" note="Station records"/><KPI value={`${Math.round(access.reduce((a,x)=>a+x.nearest_best_m,0)/access.length)}m`} label="Mean nearest BEST" note="Straight-line proximity"/></div><Insight title="Key commuting finding">Mumbai's commuting system is strongly dependent on public transport and walking. Longer-distance commuting is especially associated with suburban rail, making rail capacity, busÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“rail interchange and pedestrian/last-mile access important planning priorities.</Insight></Card>
  </>
}
function Modes({d}){const [district,setDistrict]=useState('Mumbai'); const x=d[district]; return <Card><div className="card-head"><div><div className="eyebrow">CENSUS B-28 Ãƒâ€šÃ‚Â· 2011</div><h2>Mode choice by district</h2></div><select value={district} onChange={e=>setDistrict(e.target.value)}><option>Mumbai</option><option>Mumbai Suburban</option></select></div><ModeChart data={x.modes} noTravel={x.no_travel}/><div className="answer-box"><b>What this answers:</b> Which recorded travel modes dominate among ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œOther workersÃƒÂ¢Ã¢â€šÂ¬Ã‚Â?<br/><b>Planning relevance:</b> Rail, bus and walking infrastructure should be planned as an interconnected commuting system.</div><div className="source-note">Universe: ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œOther workersÃƒÂ¢Ã¢â€šÂ¬Ã‚Â in Census B-28. This is not an all-commuter dataset. ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œNo travelÃƒÂ¢Ã¢â€šÂ¬Ã‚Â is retained as a separate B-28 category and is not shown as a travel mode.</div></Card>}

function HowFar({d}){const [district,setDistrict]=useState('Mumbai');const x=d[district]; const within=x.distances.filter(z=>['0ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“1 km','2ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“5 km','6ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“10 km'].includes(z.distance)).reduce((a,z)=>a+z.share_stated,0);return <><Card><div className="card-head"><div><div className="eyebrow">CENSUS B-28 Ãƒâ€šÃ‚Â· 2011</div><h2>Commuting distance distribution</h2><p className="sub">Share of workers with a stated commuting distance. Distance is not travel time.</p></div><select value={district} onChange={e=>setDistrict(e.target.value)}><option>Mumbai</option><option>Mumbai Suburban</option></select></div><DistanceBars distances={x.distances}/><Insight>Among workers with a stated distance, about <b>{within.toFixed(1)}%</b> are within 10 km.</Insight><div className="source-note">Distance categories exclude ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œNo travelÃƒÂ¢Ã¢â€šÂ¬Ã‚Â and ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œDistance not statedÃƒÂ¢Ã¢â€šÂ¬Ã‚Â from the denominator.</div></Card>
 <Card><div className="eyebrow">MODE ÃƒÆ’Ã¢â‚¬â€ DISTANCE</div><h2>Commuters by mode and distance</h2><p className="sub">The primary view uses actual people counts. Alternate views expose the denominator so the 51+ km band is not misread.</p><Heatmap matrix={x.mode_distance}/><Insight title="Analytical finding">In the 51+ km band, train accounts for the majority of stated-distance commuters. For Mumbai, train represents about <b>59.3%</b> of the 51+ km band; for Mumbai Suburban, the corresponding share is about <b>59.0%</b>. The important distinction is that 51+ km is a small share of train's own users, but train is still the dominant mode among people who travel that far.</Insight></Card></>}

function WhenWhere(){return <><div className="two-col"><Card><div className="eyebrow">CMP Ãƒâ€šÃ‚Â· BASE YEAR 2014</div><h2>Peak commuting windows</h2><div className="peak">06:00ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“11:00</div><div className="peak">17:00ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“22:00</div><p>These are the CMP study's peak periods used in transport analysis.</p></Card><Card><div className="eyebrow">ROAD PERFORMANCE</div><h2>Peak vs off-peak speed</h2><div className="speed-row"><b>Peak</b><span>20 km/h</span><div className="speed-fill" style={{width:'74%'}}/></div><div className="speed-row"><b>Off-peak</b><span>27 km/h</span><div className="speed-fill" style={{width:'100%'}}/></div><p className="source-note">CMP reports 57% of the road network at ÃƒÂ¢Ã¢â‚¬Â°Ã‚Â¤20 km/h in the morning and 67% in the evening.</p></Card></div><Card><div className="eyebrow">SPATIAL INFRASTRUCTURE</div><h2>Where rail and BEST infrastructure connect</h2><p className="sub">Rail stations are overlaid with mapped BEST infrastructure to screen station-area connectivity.</p><MapView height={430}/><Insight title="Planning interpretation">The map is a spatial screening tool: it shows where infrastructure is located, not whether services are frequent, reliable, accessible to all users or well matched to demand.</Insight></Card></>}

function Accessibility({access}){const [sort,setSort]=useState('sparse'); const list=useMemo(()=>[...access].sort((a,b)=>sort==='sparse'?(a.best_points_500m-b.best_points_500m)||(b.nearest_best_m-a.nearest_best_m):a.nearest_best_m-b.nearest_best_m).slice(0,12),[access,sort]); return <><Card><div className="eyebrow">PHASE 1 SPATIAL ANALYSIS</div><h2>RailÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“bus proximity</h2><p className="sub">Straight-line proximity between railway station coordinates and cleaned BEST point locations. The analysis contains 52 station records representing 51 unique station names; these are screening metrics, not walking-network measures.</p><div className="mini-grid four"><KPI value={`${access.filter(x=>x.best_points_250m>0).length}/${access.length}`} label="BEST ÃƒÂ¢Ã¢â‚¬Â°Ã‚Â¤250m" note="Station records"/><KPI value={`${access.filter(x=>x.best_points_500m>0).length}/${access.length}`} label="BEST ÃƒÂ¢Ã¢â‚¬Â°Ã‚Â¤500m" note="Station records"/><KPI value={`${access.filter(x=>x.best_points_1000m>0).length}/${access.length}`} label="BEST ÃƒÂ¢Ã¢â‚¬Â°Ã‚Â¤1km" note="Station records"/><KPI value={`${Math.round(access.reduce((a,x)=>a+x.nearest_best_m,0)/access.length)}m`} label="Mean nearest BEST" note="Straight-line"/></div><MapView height={400}/></Card><Card><div className="card-head"><div><div className="eyebrow">STATION SCREENING</div><h2>Locations for further investigation</h2><p className="sub">Low mapped BEST-point counts or larger nearest-point distances flag locations for field verification, not confirmed service gaps.</p></div><select value={sort} onChange={e=>setSort(e.target.value)}><option value="sparse">Fewest BEST points ÃƒÂ¢Ã¢â‚¬Â°Ã‚Â¤500m</option><option value="distance">Largest nearest BEST distance</option></select></div><div className="table-wrap"><table><thead><tr><th>Station</th><th>Nearest BEST</th><th>BEST ÃƒÂ¢Ã¢â‚¬Â°Ã‚Â¤250m</th><th>BEST ÃƒÂ¢Ã¢â‚¬Â°Ã‚Â¤500m</th><th>BEST ÃƒÂ¢Ã¢â‚¬Â°Ã‚Â¤1km</th><th>Screening signal</th></tr></thead><tbody>{list.map(r=><tr key={r.station_id}><td><b>{r.name}</b></td><td>{Math.round(r.nearest_best_m)} m</td><td>{r.best_points_250m}</td><td>{r.best_points_500m}</td><td>{r.best_points_1000m}</td><td>{r.best_points_250m===0||r.best_points_500m<=10?'Field verify':'Context only'}</td></tr>)}</tbody></table></div></Card></>}

function Planning(){return <><Card><div className="eyebrow">EVIDENCE ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ INSIGHT ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ ACTION</div><h2>Planning recommendations</h2><div className="rec"><div className="num">01</div><div><h3>Strengthen railÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“bus interchange</h3><p><b>Evidence:</b> Rail is a major commuting mode and mapped BEST infrastructure is spatially close to every analysed station record within 500m.</p><p><b>Recommendation:</b> Prioritise coordinated interchange areas, bus bays, pedestrian links and wayfinding at major rail nodes.</p></div></div><div className="rec"><div className="num">02</div><div><h3>Improve pedestrian-first/last-mile access</h3><p><b>Evidence:</b> The CMP reports walking as a major part of travel and notes that 60% of public-transport journeys start or end with walking.</p><p><b>Recommendation:</b> Focus on continuous footpaths, safe crossings and station-area pedestrian connections.</p></div></div><div className="rec"><div className="num">03</div><div><h3>Target station-area investigations</h3><p><b>Evidence:</b> Two station records have no mapped BEST point within 250m; several others have comparatively low mapped counts within 500m.</p><p><b>Recommendation:</b> Use these locations for field verification rather than declaring a service gap from KML proximity alone.</p></div></div><div className="rec"><div className="num">04</div><div><h3>Prioritise peak-period public transport</h3><p><b>Evidence:</b> CMP peak periods coincide with lower road speeds and measurable delay.</p><p><b>Recommendation:</b> Support public-transport priority, integrated operations and peak-period traffic management.</p></div></div></Card><Card><h2>Data & limitations</h2><ul className="limits"><li>B-28 is 2011 and covers ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œOther workersÃƒÂ¢Ã¢â€šÂ¬Ã‚Â; it is not an all-commuter dataset.</li><li>CMP analysis uses a 2014 base-year transport database.</li><li>BEST and railway KMLs are used as current/recent infrastructure context.</li><li>KML proximity does not measure service frequency, capacity, reliability, accessibility, walking time or passenger demand.</li><li>Current infrastructure should not be treated as proof of historical conditions.</li><li>Distance categories describe commuting distance, not travel time.</li></ul></Card></>}

function App(){const [page,setPage]=useState('Overview'); const [d,setD]=useState(null); const [access,setAccess]=useState([]); const [error,setError]=useState(''); useEffect(()=>{Promise.all(['/Commuting_data/data/dashboard.json','/Commuting_data/data/station_accessibility.json'].map(u=>fetch(u).then(r=>{if(!r.ok) throw new Error(`${u} (${r.status})`); return r.json();}))).then(([dd,aa])=>{setD(dd);setAccess(aa);}).catch(e=>setError(`Dashboard data could not be loaded: ${e.message}`));},[]); if(error)return <div className="loading error"><h2>Dashboard could not load</h2><p>{error}</p><p>Run this project with <b>npm run dev</b> from the project folder.</p></div>; if(!d)return <div className="loading">Loading dashboardÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦</div>; return <div><Header page={page} setPage={setPage}/><main>{page==='Overview'&&<Overview d={d.districts} access={access} setPage={setPage}/>} {page==='How People Commute'&&<Modes d={d.districts}/>} {page==='How Far'&&<HowFar d={d.districts}/>} {page==='When & Where'&&<WhenWhere/>} {page==='Accessibility'&&<Accessibility access={access}/>} {page==='Planning Insights'&&<Planning/>}</main><footer>B-28 (2011) Ãƒâ€šÃ‚Â· CMP base year 2014 Ãƒâ€šÃ‚Â· BEST / suburban railway spatial context Ãƒâ€šÃ‚Â· Evidence ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Insight ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Planning</footer></div>}

export default App;
