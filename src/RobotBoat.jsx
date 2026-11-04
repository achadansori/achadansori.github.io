import {useEffect, useRef} from 'react';
import DemolitionRobot from './DemolitionRobot';

// Where the land ends, as a fraction of the world width; keep in step with .voyage-land in style.css.
const SHORE = .42;

export default function RobotBoat() {
 const sectionRef = useRef(null);
 const sceneRef = useRef(null);
 const worldRef = useRef(null);
 const boatRef = useRef(null);
 const hudRef = useRef(null);

 useEffect(() => {
  const section = sectionRef.current;
  const scene = sceneRef.current;
  const world = worldRef.current;
  const boat = boatRef.current;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let lastProgress = null;
  let stopTimer = 0;
  const setStatus = moving => {
   hudRef.current.textContent = moving ? 'UNDERWAY' : 'STATION KEEPING';
  };
  const update = () => {
   frame = 0;
   const bounds = section.getBoundingClientRect();
   // Traverse while the section passes through the viewport, without pinning it.
   const viewportHeight = window.innerHeight;
   // The section is only on screen for the middle of the scroll, so finish the voyage within that range.
   const progress = reducedMotion.matches ? 0.5 : Math.max(0, Math.min(1, ((viewportHeight - bounds.top) / Math.max(1, viewportHeight + bounds.height) - .15) / .65));
   const start = world.clientWidth * SHORE;
   const travel = Math.max(0, world.clientWidth - start - boat.clientWidth - 24);
   // On screens narrower than the world, the view pans from the land to the sea once the arm has finished its scoop.
   world.style.transform = `translate3d(${(scene.clientWidth - world.clientWidth) * Math.max(0, Math.min(1, (progress - .54) / .31))}px, 0, 0)`;
   boat.style.transform = `translate3d(${start + travel * progress}px, -80%, 0)`;
   scene.style.setProperty('--voyage', `${progress * 100}%`);
   scene.style.setProperty('--progress', progress);
   if (lastProgress !== null && progress !== lastProgress) {
    boat.classList.add('moving');
    boat.classList.toggle('astern', progress < lastProgress);
    clearTimeout(stopTimer);
    stopTimer = setTimeout(() => {
     boat.classList.remove('moving');
     setStatus(false);
    }, 220);
    setStatus(true);
   } else if (lastProgress === null) setStatus(false);
   lastProgress = progress;
  };
  const schedule = () => {if (!frame) frame = requestAnimationFrame(update);};
  const observer = new ResizeObserver(schedule);
  observer.observe(section);
  observer.observe(scene);
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', schedule);
  reducedMotion.addEventListener('change', schedule);
  schedule();
  return () => {
   cancelAnimationFrame(frame);
   clearTimeout(stopTimer);
   observer.disconnect();
   window.removeEventListener('scroll', schedule);
   window.removeEventListener('resize', schedule);
   reducedMotion.removeEventListener('change', schedule);
  };
 }, []);

 return <section className="robot-voyage" ref={sectionRef} aria-label="Autonomous surface vehicle, underwater ROV and demolition robot">
  <div className="voyage-scene" ref={sceneRef}>
   <div className="voyage-hud" aria-hidden="true"><b>JALAVAHANA ASV</b><span ref={hudRef}/></div>
   <div className="voyage-world" ref={worldRef}>
   <div className="voyage-water" aria-hidden="true"><span/><span/><span/><span/><span/></div>
   <div className="voyage-boat" ref={boatRef}>
    <div className="voyage-wake" aria-hidden="true"/>
    {/* Same coordinates as the boat drawing; the tether starts behind the hull so bobbing never opens a gap. */}
    <svg className="voyage-rov" viewBox="0 0 440 200" role="img" aria-label="BlueROV-style underwater ROV connected to the boat by a tether">
     <defs><linearGradient id="rov-light" gradientUnits="userSpaceOnUse" x1="247" x2="380" y1="0" y2="0"><stop offset="0" stopColor="#fff" stopOpacity=".3"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></linearGradient></defs>
     <path d="M176 170 C130 240 230 310 130 385 C112 398 110 420 131 427" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".75"/>
     <g className="voyage-rov-body" stroke="#fff" strokeLinejoin="round">
      <path d="M247 429 L380 398 V460 Z" fill="url(#rov-light)" stroke="none"/>
      {/* BlueROV-style side profile: foam block on top, vertical thruster ducts, open side plate. */}
      <path d="M152 398 V392 H170 V398 M214 398 V392 H232 V398" fill="#050505" strokeWidth="2"/>
      <rect x="146" y="398" width="92" height="12" rx="3" fill="#f5f5f5" strokeWidth="1.5"/>
      <rect x="136" y="410" width="104" height="44" rx="6" fill="#050505" strokeWidth="3"/>
      {/* Main electronics tube with rear end cap and clear front dome holding the camera. */}
      <rect x="130" y="420" width="9" height="18" rx="2" fill="#050505" strokeWidth="2"/>
      <rect x="139" y="420" width="99" height="18" fill="#f5f5f5" strokeWidth="1.5"/>
      <path d="M238 420 A9 9 0 0 1 238 438 Z" fill="#050505" strokeWidth="2"/>
      <circle cx="240" cy="429" r="2.5" fill="#fff" stroke="none"/>
      {/* Battery tube, horizontal thrusters and front light. */}
      <rect x="158" y="442" width="58" height="8" rx="4" fill="#050505" strokeWidth="1.5"/>
      <rect x="140" y="441" width="13" height="10" rx="2" fill="#f5f5f5" strokeWidth="1"/>
      <rect x="222" y="441" width="13" height="10" rx="2" fill="#f5f5f5" strokeWidth="1"/>
      <circle cx="233" cy="415" r="2.5" fill="#fff" stroke="none"/>
      <path d="M150 454 V459 M226 454 V459" fill="none" strokeWidth="3" strokeLinecap="round"/>
     </g>
    </svg>
    <svg viewBox="0 0 440 200" role="img" aria-label="Side-view illustration inspired by Jalavahana ASV, with an electronics enclosure, a frame-mounted Intel RealSense-style camera in side profile, a lower frame-mounted LiDAR ahead of the mast, wind sensor and underwater thrusters">
     {/* LiDAR scan fan; the SVG overflows so it can reach past the bow. */}
     <defs><linearGradient id="lidar-fade" gradientUnits="userSpaceOnUse" x1="263" x2="560" y1="0" y2="0"><stop offset="0" stopColor="#fff" stopOpacity=".32"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></linearGradient></defs>
     <path className="voyage-scan" d="M263 68 L560 22 V108 Z" fill="url(#lidar-fade)"/>
     {/* Side profile based on the Jalavahana drawing in the project assets; bow faces right. */}
     <g stroke="#fff" strokeLinejoin="round">
      <path d="M91 131 H393 Q352 164 292 166 H91 Z" fill="#050505" opacity=".4"/>
      {/* Open aluminium frame above the hull. */}
      <path d="M108 133 V88 H276 V133 M116 133 V96 H268 V133" fill="none" strokeWidth="3"/>
      <path d="M108 91 H276 M112 98 V132 M272 98 V132" fill="none" strokeWidth="1" opacity=".5"/>
      <path d="M98 133 L108 120 V133 M276 120 L288 133 H276" fill="#fff"/>
      {/* Shift the enclosure aft so all equipment fits the original upper rail. */}
      <g transform="translate(-26 3)">
      <path d="M142 85 V76 H160 V85 M241 85 V76 H257 V85" fill="#fff"/>
      <rect x="148" y="53" width="102" height="30" rx="2" fill="#f5f5f5"/>
      <path d="M146 53 H252 V49 H146 Z" fill="#050505" strokeWidth="1.5"/>
      <path d="M154 58 H244" stroke="#050505" opacity=".45"/>
      <circle cx="155" cy="76" r="1.5" fill="#050505" stroke="none"/>
      <circle cx="243" cy="76" r="1.5" fill="#050505" stroke="none"/>
      {/* Angled GPS mount on the electronics enclosure. */}
      <path d="M227 49 L217 22" fill="none" strokeWidth="5"/>
      <rect x="205" y="18" width="25" height="5" rx="2" fill="#fff"/>
      </g>
      {/* Camera mast sits on the existing upper rail, ahead of the enclosure. */}
      <g transform="translate(-32 1)">
      <path d="M272 87 V40" fill="none" strokeWidth="4"/>
      <path d="M264 87 L272 79 L280 87 Z" fill="#fff"/>
      <path d="M268 40 H277" strokeWidth="3"/>
      {/* RealSense-style side profile: rounded casing and a flush forward face. */}
      <rect x="263" y="26" width="18" height="13" rx="3" fill="#f5f5f5" strokeWidth="1"/>
      <path d="M278 28 V37" stroke="#050505" strokeWidth="3"/>
      <path d="M266 30 V35" stroke="#050505" strokeWidth="1.5"/>
      <circle cx="272" cy="33" r="1.2" fill="#050505" stroke="none"/>
      </g>
      {/* LiDAR fits at the front end of the original rail, below the camera. */}
      <g transform="translate(-44 1)">
      <path d="M301 87 V81 H313 V87" fill="#fff"/>
      <path d="M295 66 H319 V79 Q307 85 295 79 Z" fill="#f5f5f5"/>
      <ellipse cx="307" cy="66" rx="12" ry="4" fill="#050505" strokeWidth="1.5"/>
      <path d="M296 72 Q307 76 318 72" fill="none" stroke="#050505" strokeWidth="3"/>
      </g>
      {/* Tall aft mast with cup anemometer. */}
      <path d="M113 132 V14" fill="none" strokeWidth="4"/>
      <path d="M97 16 H129" fill="none" strokeWidth="2"/>
      <ellipse cx="95" cy="16" rx="6" ry="8" fill="#050505" strokeWidth="2"/>
      <ellipse cx="131" cy="16" rx="5" ry="8" fill="#fff"/>
      <rect x="108" y="19" width="10" height="6" fill="#fff"/>
      <rect x="108" y="91" width="10" height="5" fill="#050505"/>
      {/* Deck hatch and long, curved pontoon profile. */}
      <path d="M158 134 V124 H229 V134" fill="#050505" strokeWidth="2"/>
      <path d="M84 134 H407 Q360 181 288 181 H84 Z" fill="#f5f5f5" strokeWidth="2"/>
      <path d="M85 159 H292 Q353 159 401 137" fill="none" stroke="#050505" strokeWidth="2"/>
      {/* Submerged electric thrusters. */}
      <path d="M106 182 V187 M254 182 V187" strokeWidth="4" opacity=".7"/>
      <g fill="#050505" strokeWidth="1.5" opacity=".7">
       <rect x="96" y="185" width="23" height="12" rx="6"/>
       <rect x="244" y="185" width="23" height="12" rx="6"/>
       <path d="M108 188 V194 M103 191 H113 M256 188 V194 M251 191 H261"/>
      </g>
     </g>
     <g fill="none" stroke="#fff" strokeLinecap="round">
      <path d="M3 160 Q19 155 35 160 T67 160 H88 M377 160 Q390 155 403 160 T433 160" strokeWidth="1.5" opacity=".7"/>
      <path d="M21 172 H68 M43 182 H77 M373 174 H412" opacity=".3"/>
     </g>
    </svg>
   </div>
   {/* After the boat, so the land covers the wake trailing behind it. */}
   <svg className="voyage-land" viewBox="0 0 1000 400" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0 H860 C910 60 960 250 1000 400 H0 Z" fill="#101010" stroke="#ffffff60" vectorEffect="non-scaling-stroke"/></svg>
   <DemolitionRobot/>
   </div>
   <div className="voyage-progress" aria-hidden="true"/>
  </div>
 </section>;
}
