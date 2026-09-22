import React from "react";

export const PARENT = {
  kingdoms: "home",
  kingdom: "kingdoms",
  musters: "home",
  muster: "musters",
  collection: "home",
  reference: "home",
};

const HOME = "home";
const hashOf = (id) => (id === HOME ? "#/" : `#/${id}`);
const fromHash = () => {
  const id = location.hash.replace(/^#\/?/, "");
  return id in PARENT ? id : HOME;
};

// History holds at most two entries: home, plus one for whatever section is
// open. Back therefore always lands on the section's parent, never off-site.
export default function useSection() {
  const [section, setSection] = React.useState(fromHash);
  const current = React.useRef(section);
  const goingHome = React.useRef(false);

  const show = (id) => { current.current = id; setSection(id); };

  React.useEffect(() => {
    const start = current.current;
    history.replaceState(null, "", hashOf(HOME));
    if (start !== HOME) history.pushState(null, "", hashOf(start));

    const onPop = () => {
      if (goingHome.current) { goingHome.current = false; show(HOME); return; }
      const typed = fromHash();
      if (typed !== HOME) { show(typed); return; }
      const up = PARENT[current.current] ?? HOME;
      show(up);
      if (up !== HOME) history.pushState(null, "", hashOf(up));
    };
    addEventListener("popstate", onPop);
    return () => removeEventListener("popstate", onPop);
  }, []);

  const go = React.useCallback((id) => {
    const from = current.current;
    if (id === from) return;
    if (id === HOME) { goingHome.current = true; history.back(); return; }
    if (from === HOME) history.pushState(null, "", hashOf(id));
    else history.replaceState(null, "", hashOf(id));
    show(id);
  }, []);

  return [section, go];
}
