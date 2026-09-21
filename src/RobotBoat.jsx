import {useEffect, useRef} from 'react';

export default function RobotBoat() {
 const sectionRef = useRef(null);
 const sceneRef = useRef(null);
 const boatRef = useRef(null);

 useEffect(() => {
  const section = sectionRef.current;
  const scene = sceneRef.current;
  const boat = boatRef.current;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  const update = () => {
   frame = 0;
   const bounds = section.getBoundingClientRect();
   // Traverse while the section passes through the viewport, without pinning it.
   const viewportHeight = window.innerHeight;
   const progress = reducedMotion.matches ? 0.5 : Math.max(0, Math.min(1, (viewportHeight - bounds.top) / Math.max(1, viewportHeight + bounds.height)));
   const travel = Math.max(0, scene.clientWidth - boat.clientWidth - 48);
   boat.style.transform = `translate3d(${24 + travel * progress}px, -80%, 0)`;
   scene.style.setProperty('--voyage', `${progress * 100}%`);
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
   observer.disconnect();
   window.removeEventListener('scroll', schedule);
   window.removeEventListener('resize', schedule);
   reducedMotion.removeEventListener('change', schedule);
  };
 }, []);

 return <section className="robot-voyage" ref={sectionRef} aria-label="Autonomous surface vehicle">
  <div className="voyage-scene" ref={sceneRef}>
   <div className="voyage-water" aria-hidden="true"><span/><span/><span/></div>
   <div className="voyage-boat" ref={boatRef}>
    <svg viewBox="0 0 440 200" role="img" aria-label="Side-view illustration inspired by Jalavahana ASV, with an electronics enclosure, a frame-mounted Intel RealSense-style camera in side profile, a lower frame-mounted LiDAR ahead of the mast, wind sensor and underwater thrusters">
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
   <div className="voyage-progress" aria-hidden="true"/>
  </div>
 </section>;
}
