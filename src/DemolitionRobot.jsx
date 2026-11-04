import {useEffect, useRef} from 'react';

// Pivots of the post, boom, stick and breaker, in drawing coordinates.
const JOINTS = [[224, 292], [273, 180], [520, 57], [670, 55]];
// Arm poses across the scroll, as joint angles in degrees: nearly straight, bending down, scooped inward.
const POSES = [[0, 0, -16, -4], [0, 6, 44, 46], [2, 8, 62, 70]];
// Hydraulic cylinders: [[point, joint it moves with], [point, joint it moves with]]; -1 is the fixed chassis.
const CYLINDERS = [
 [[[190, 272], -1], [[256, 210], 0]],
 [[[256, 214], 0], [[470, 112], 1]],
 [[[535, 30], 2], [[672, 28], 3]],
];

const rotate = ([x, y], degrees, [cx, cy]) => {
 const a = degrees * Math.PI / 180;
 return [cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a), cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a)];
};

// Where a point on a given arm link ends up once every joint up the chain has turned.
const toWorld = (point, joint, angles) => {
 for (let i = joint; i >= 0; i--) point = rotate(point, angles[i], JOINTS[i]);
 return point;
};

const poseAt = phase => {
 const position = phase * (POSES.length - 1);
 const from = Math.min(Math.floor(position), POSES.length - 2);
 return POSES[from].map((angle, i) => angle + (POSES[from + 1][i] - angle) * (position - from));
};

const setLine = (line, [x1, y1], [x2, y2]) => {
 line.setAttribute('x1', x1);
 line.setAttribute('y1', y1);
 line.setAttribute('x2', x2);
 line.setAttribute('y2', y2);
};

// Rear outrigger, planted so the wheels hang clear of the ground; the front one mirrors it.
const Outrigger = props => <g stroke="#fff" strokeLinejoin="round" {...props}>
 <path d="M64 376 L72 388 L46 414 L42 421 H8 L30 398 Z" fill="#f5f5f5" strokeWidth="2"/>
 <path d="M4 421 H44 V425 H4 Z" fill="#fff"/>
 <path d="M66 288 H80 L86 340 L82 380 H66 Z" fill="#050505" strokeWidth="2.5"/>
 <path d="M54 290 V344" fill="none" strokeWidth="8" strokeLinecap="round"/>
 <path d="M54 344 L58 378" fill="none" strokeWidth="2.5"/>
 <circle cx="60" cy="380" r="4" fill="#050505" strokeWidth="2"/>
</g>;

const Wheel = ({x}) => <g stroke="#fff">
 <circle cx={x} cy="362" r="38" fill="#050505" strokeWidth="3"/>
 <circle cx={x} cy="362" r="24" fill="none" strokeWidth="1.5"/>
 <circle cx={x} cy="362" r="12" fill="none" strokeWidth="1.5"/>
 <circle cx={x} cy="362" r="3" fill="#fff" stroke="none"/>
</g>;

const Pin = ({x, y}) => <circle cx={x} cy={y} r="5" fill="#050505" stroke="#fff" strokeWidth="1.5"/>;

export default function DemolitionRobot() {
 const robotRef = useRef(null);
 const armRefs = useRef([]);
 const cylinderRefs = useRef([]);

 useEffect(() => {
  const section = robotRef.current.closest('.robot-voyage');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let angles = null;
  const draw = () => {
   armRefs.current.forEach((link, i) => link.setAttribute('transform', `rotate(${angles[i]} ${JOINTS[i][0]} ${JOINTS[i][1]})`));
   CYLINDERS.forEach(([[startPoint, startJoint], [endPoint, endJoint]], i) => {
    const start = toWorld(startPoint, startJoint, angles);
    const end = toWorld(endPoint, endJoint, angles);
    // The barrel keeps its length and the rod slides out of it as the arm moves.
    const share = Math.min(1, (60 + i * 30) / Math.hypot(end[0] - start[0], end[1] - start[1]));
    const barrelEnd = [start[0] + (end[0] - start[0]) * share, start[1] + (end[1] - start[1]) * share];
    const [rod, outline, barrel] = cylinderRefs.current[i].children;
    setLine(rod, start, end);
    setLine(outline, start, barrelEnd);
    setLine(barrel, start, barrelEnd);
   });
  };
  const update = () => {
   frame = 0;
   const bounds = section.getBoundingClientRect();
   const progress = (window.innerHeight - bounds.top) / Math.max(1, window.innerHeight + bounds.height);
   // The robot is on screen for this part of the scroll, so finish the scoop within it.
   const target = poseAt(reducedMotion.matches ? .5 : Math.max(0, Math.min(1, (progress - .25) / .3)));
   // Ease toward the target so wheel-scroll steps read as hydraulic motion, not jumps.
   const ease = angles && !reducedMotion.matches ? .12 : 1;
   angles = (angles || target).map((angle, i) => angle + (target[i] - angle) * ease);
   draw();
   if (angles.some((angle, i) => Math.abs(target[i] - angle) > .02)) schedule();
  };
  const schedule = () => {if (!frame) frame = requestAnimationFrame(update);};
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', schedule);
  reducedMotion.addEventListener('change', schedule);
  schedule();
  return () => {
   cancelAnimationFrame(frame);
   window.removeEventListener('scroll', schedule);
   window.removeEventListener('resize', schedule);
   reducedMotion.removeEventListener('change', schedule);
  };
 }, []);

 return (
   <svg className="demolition-robot" ref={robotRef} viewBox="0 0 880 425" role="img" aria-label="Side-view illustration of a generic demolition robot parked on its outriggers, its arm bending down to scoop inward">
    <Outrigger/>
    <Outrigger transform="matrix(-1 0 0 1 364 0)"/>
    <path d="M80 322 H284 V380 H80 Z" fill="#050505" stroke="#fff" strokeWidth="2.5"/>
    <Wheel x={122}/>
    <Wheel x={242}/>
    <g stroke="#fff" strokeLinejoin="round">
     <path d="M84 304 H238 V322 H84 Z" fill="#f5f5f5" strokeWidth="2"/>
     <path d="M92 218 H142 L156 303 H92 Z" fill="#f5f5f5" strokeWidth="2"/>
     <path d="M146 252 L190 262 L238 303 H156 Z" fill="#050505" strokeWidth="2.5"/>
    </g>
    {/* Each link nests in the one before it, so a joint carries everything beyond it. */}
    <g ref={el => {armRefs.current[0] = el;}} stroke="#fff" strokeLinejoin="round">
     <path d="M216 296 L262 176 L284 182 L232 300 Z" fill="#f5f5f5" strokeWidth="2"/>
     <g ref={el => {armRefs.current[1] = el;}}>
      <path d="M268 170 L515 45 L530 68 L283 192 Z" fill="#f5f5f5" strokeWidth="2"/>
      {/* Lug the boom cylinder pushes against. */}
      <path d="M440 104 L490 78 L484 116 L464 124 Z" fill="#f5f5f5" strokeWidth="2"/>
      <g ref={el => {armRefs.current[2] = el;}}>
       <path d="M512 42 L556 30 L596 68 L556 86 L512 66 Z" fill="#f5f5f5" strokeWidth="2"/>
       <path d="M560 42 L664 42 L680 70 L560 72 Z" fill="#f5f5f5" strokeWidth="2"/>
       <g ref={el => {armRefs.current[3] = el;}}>
        {/* Breaker body and chisel. */}
        <path d="M664 24 L694 18 L704 78 L674 84 Z" fill="#050505" strokeWidth="2.5"/>
        <path d="M694 24 L826 8 L830 34 L770 50 L764 62 L702 70 Z" fill="#f5f5f5" strokeWidth="2"/>
        <path d="M826 6 L833 4 L837 38 L830 40 Z" fill="#050505" strokeWidth="2"/>
        <path d="M835 14 H850 L860 20 L850 25 L836 27 Z" fill="#fff"/>
        <path d="M716 42 L746 38" fill="none" stroke="#050505" strokeWidth="3" strokeLinecap="round"/>
        <Pin x={670} y={55}/>
       </g>
       <Pin x={520} y={57}/>
      </g>
      <Pin x={273} y={180}/>
     </g>
     <Pin x={224} y={292}/>
    </g>
    {CYLINDERS.map((_, i) => <g key={i} ref={el => {cylinderRefs.current[i] = el;}} strokeLinecap="round">
     <line stroke="#fff" strokeWidth="2.5"/>
     <line stroke="#050505" strokeWidth="12"/>
     <line stroke="#fff" strokeWidth="7"/>
    </g>)}
   </svg>
 );
}
