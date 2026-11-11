import { useCallback, useMemo, useState } from 'react';
import { BrainStage } from './brain/BrainStage';
import { neurons } from './lib/brain';
import type { Cluster } from './lib/types';
import { AskMyBrain, NO_FOCUS, type BrainFocus } from './sections/AskMyBrain';
import { Approach, Contact, Header, Hero, Lab, Projects, QuickView } from './sections/Sections';

export default function App() {
  const [selected, setSelected] = useState<number | null>(null);
  const [focus, setFocus] = useState<BrainFocus>(NO_FOCUS);
  const [cluster, setCluster] = useState<Cluster | null>(null);
  const [quickView, setQuickView] = useState(false);

  const onFocus = useCallback((next: BrainFocus) => {
    setFocus(next);
    if (next.query) setCluster(null);
  }, []);

  const clusterLit = useMemo(
    () => (cluster ? neurons.filter((n) => n.node.cluster === cluster).map((n) => n.index) : []),
    [cluster],
  );
  const querying = focus.query !== null;

  return (
    <>
      <Header onQuickView={() => setQuickView(true)} />
      <main>
        <div className="stage">
          <div className="stage-copy">
            <Hero cluster={querying ? null : cluster} onCluster={setCluster} />
            <AskMyBrain onFocus={onFocus} onSelect={setSelected} />
          </div>
          <div className="stage-brain">
            <BrainStage
              lit={querying ? focus.lit : clusterLit}
              sources={focus.sources}
              query={focus.query}
              selected={selected}
              onSelect={setSelected}
            />
          </div>
        </div>
        <Lab />
        <Projects onShowNeuron={setSelected} />
        <Approach />
        <Contact />
      </main>
      <QuickView open={quickView} onClose={() => setQuickView(false)} />
    </>
  );
}
