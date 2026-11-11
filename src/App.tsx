import { useCallback, useMemo, useState } from 'react';
import { BrainStage } from './brain/BrainStage';
import { useI18n } from './i18n';
import { CLUSTER_COLORS, PALETTE, type Tab } from './i18n/strings';
import { neighbours, neurons } from './lib/brain';
import type { Cluster } from './lib/types';
import { Dialogue, Hud, MapInfo, Menu, Toasts, type Line } from './ui/Hud';
import { NO_FOCUS, Oracle, type BrainFocus, type OracleLine } from './ui/Oracle';
import { CvDialog, HeroSheet, Quests, Trials } from './ui/Panels';
import { useGame } from './ui/progress';

export default function App() {
  const { t, lang } = useI18n();
  const { progress, gain } = useGame();
  const [tab, setTab] = useState<Tab>('map');
  const [selected, setSelected] = useState<number | null>(null);
  const [focus, setFocus] = useState<BrainFocus>(NO_FOCUS);
  const [oracle, setOracle] = useState<OracleLine | null>(null);
  const [region, setRegion] = useState<Cluster | null>(null);
  const [cv, setCv] = useState(false);

  const discovered = useMemo(() => {
    const ids = new Set(progress.discovered);
    return new Set(neurons.filter((n) => ids.has(n.node.id)).map((n) => n.index));
  }, [progress.discovered]);

  const select = useCallback(
    (index: number | null) => {
      setSelected(index);
      if (index !== null) gain({ type: 'discover', ids: [neurons[index]!.node.id] });
    },
    [gain],
  );

  const openTab = (next: Tab) => {
    setTab(next);
    setSelected(null);
  };

  const locate = (index: number) => {
    setTab('map');
    select(index);
  };

  const querying = focus.query !== null;
  const regionLit = useMemo(
    () => (region ? neurons.filter((n) => n.node.cluster === region).map((n) => n.index) : []),
    [region],
  );

  const chips = (items: typeof neurons) => (
    <div className="chips">
      {items.map((n) => (
        <button type="button" key={n.node.id} onClick={() => select(n.index)}>
          <i style={{ background: CLUSTER_COLORS[n.node.cluster] }} />
          {discovered.has(n.index) ? n.node.title[lang] : t.map.unknown}
        </button>
      ))}
    </div>
  );

  let line: Line;
  if (selected !== null) {
    const neuron = neurons[selected]!;
    line = {
      key: `${neuron.node.id}-${lang}`,
      speaker: t.clusters[neuron.node.cluster],
      color: CLUSTER_COLORS[neuron.node.cluster],
      title: neuron.node.title[lang],
      text: neuron.node.text[lang],
      extra: (
        <>
          <span className="label">{t.map.paths}</span>
          {chips(neighbours(neuron, 3).map((s) => s.item))}
        </>
      ),
    };
  } else if (oracle) {
    line = {
      key: `oracle-${oracle.text}`,
      speaker: oracle.grounded ? t.oracle.speaker : t.oracle.liar,
      color: oracle.grounded ? PALETTE.lime : PALETTE.red,
      text: oracle.text,
      extra: oracle.sources.length > 0 && (
        <>
          <span className="label">{t.oracle.sources}</span>
          {chips(oracle.sources)}
        </>
      ),
    };
  } else {
    line = {
      key: `${tab}-${lang}`,
      speaker: t.hero.name,
      color: PALETTE.yellow,
      text: t.hints[tab],
    };
  }

  return (
    <div className={`screen tab-${tab}`}>
      <Hud onSkip={() => setCv(true)} />
      <aside className="side">
        <Menu tab={tab} onTab={openTab} />
        <MapInfo region={querying ? null : region} onRegion={setRegion} />
      </aside>
      <main className="world">
        <BrainStage
          lit={querying ? focus.lit : regionLit}
          sources={focus.sources}
          query={focus.query}
          selected={selected}
          discovered={discovered}
          onSelect={select}
        />
        {tab !== 'map' && (
          <div className="panel win">
            {tab === 'oracle' && <Oracle onFocus={setFocus} onLine={setOracle} />}
            {tab === 'trials' && <Trials />}
            {tab === 'quests' && <Quests onLocate={locate} />}
            {tab === 'hero' && <HeroSheet />}
          </div>
        )}
      </main>
      <Dialogue line={line} />
      <Toasts />
      <CvDialog open={cv} onClose={() => setCv(false)} />
    </div>
  );
}
