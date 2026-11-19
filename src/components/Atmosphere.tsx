import { useMemo } from "react";
import type { CSSProperties } from "react";

const FLOATERS = ["💊","🧬","🩺","🧠","🦠","🩸","🧪","🔬","🦴","🫀","🧫","🌡️","🩹","🧤","🫁","🧷","🧴","🦷"];

export default function Atmosphere() {
  const items = useMemo(() => FLOATERS.map((symbol, index) => ({
    symbol,
    style: {
      "--travel-x": (((index % 2 ? 1 : -1) * (45 + (index * 13) % 37))) + "vw",
      "--travel-y": (((index % 3 ? -1 : 1) * (32 + (index * 19) % 42))) + "vh",
      "--size": (20 + (index * 7) % 20) + "px",
      "--duration": (17 + (index * 5) % 15) + "s",
      "--delay": (-((index * 2.3) % 27)) + "s",
      "--origin-x": (44 + (index * 7 % 13)) + "%",
      "--origin-y": (42 + (index * 11 % 17)) + "%"
    } as CSSProperties
  })), []);
  return <div className="ambient-scene" aria-hidden="true">
    <div className="ambient-grid"/>
    <div className="ambient-glow ambient-glow-a"/>
    <div className="ambient-glow ambient-glow-b"/>
    <div className="ambient-glow ambient-glow-c"/>
    <div className="ambient-orbit ambient-orbit-a"/>
    <div className="ambient-orbit ambient-orbit-b"/>
    <div className="ambient-stars">{Array.from({length:34},(_,i)=><i key={i} style={{left:((i*37)%97)+"%",top:((i*61)%93)+"%",animationDelay:-(i%7)+"s"}}/>)}</div>
    <div className="ambient-flyers">{items.map((item,i)=><span className={"ambient-flyer flyer-"+(i%4)} key={i} style={item.style}>{item.symbol}</span>)}</div>
    <div className="ambient-vignette"/>
  </div>;
}