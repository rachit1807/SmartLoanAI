import { useState } from 'react';
import { BookOpen, GraduationCap, TrendingUp, IndianRupee } from 'lucide-react';
import './ReactorBackdrop.css';

export default function ReactorBackdrop() {
  const [paused, setPaused] = useState(() => {
    try { return localStorage.getItem('smartloan:motion') === 'paused'; }
    catch { return false; }
  });
  const toggle = () => {
    setPaused(current => {
      try { localStorage.setItem('smartloan:motion', current ? 'on' : 'paused'); } catch { /* Optional preference only. */ }
      return !current;
    });
  };
  return <>
    <aside className={`reactor-backdrop${paused ? ' is-paused' : ''}`} aria-hidden="true">
      <div className="reactor-core"><span /><span /><i /></div>
      <svg className="reactor-market" viewBox="0 0 1200 300" preserveAspectRatio="none">
        <path d="M0 240H120L190 185H290L360 220L460 130H560L650 170L740 80H850L930 120L1050 35H1200" />
        <path d="M0 270H230L310 240H440L530 200H730L820 150H1000L1120 90H1200" />
      </svg>
      <IndianRupee className="reactor-symbol symbol-one" />
      <GraduationCap className="reactor-symbol symbol-two" />
      <TrendingUp className="reactor-symbol symbol-three" />
      <BookOpen className="reactor-symbol symbol-four" />
    </aside>
    <div className="reactor-toolbar">
      <span><i /> SMARTLOAN · BLUE REACTOR</span>
      <button type="button" aria-pressed={paused} onClick={toggle}>{paused ? 'Resume background motion' : 'Pause background motion'}</button>
    </div>
  </>;
}
