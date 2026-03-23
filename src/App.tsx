import React, { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { PhaserGame } from "components/PhaserGame";
import { Panel } from "components/ui/Panel";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { Input } from "components/ui/Input";
import { Icon } from "components/ui/Icon";
import { ResourceImage } from "components/ui/ResourceImage";
import { usePopup } from "components/popups/PopupProvider";
import { loadPlayerProfile } from "lib/api";
import { hydrateGameState, $gameState } from "lib/gameStore";
import { playSfx } from "lib/audio";

export const App: React.FC = () => {
  const { coins, anonymous } = useStore($gameState);
  const { open } = usePopup();
  const [draft, setDraft] = useState("");

  useEffect(() => {
    let cancelled = false;
    loadPlayerProfile().then((profile) => {
      if (!cancelled) hydrateGameState(profile);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-full w-full bg-[#303443] text-[#181425] flex flex-col items-center justify-start gap-4 p-4 pb-8">
      <Label type="chill" className="mt-2">
        Sunflower Land mini-game template
      </Label>

      {anonymous && (
        <Label type="warning" className="max-w-md text-center">
          Playing anonymously — progress may not save. (Stub flag from API)
        </Label>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Icon name="disc" pixelSize={20} />
        <Label type="default">{coins} coins</Label>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 max-w-md">
        <Label type="formula" className="w-full justify-center">
          Example resources
        </Label>
        {(
          [
            "wood",
            "stone",
            "iron",
            "gold",
            "diamond",
            "fish",
            "plot",
            "mushroom",
            "acorn",
            "beeHive",
          ] as const
        ).map((r) => (
          <ResourceImage key={r} name={r} pixelSize={28} />
        ))}
      </div>

      <PhaserGame />

      <div className="w-full max-w-md flex flex-col gap-2">
        <Button
          type="button"
          onClick={() => {
            playSfx("button");
            open("welcome");
          }}
        >
          Open welcome popup
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            playSfx("button");
            open("hint", { message: draft || "Try the arrow keys to move." });
          }}
        >
          Open hint popup
        </Button>
      </div>

      <div className="w-full max-w-md">
        <Panel className="w-full">
          <div className="flex flex-col gap-3 p-1">
            <Label type="default">UI kit</Label>
            <Input
              placeholder="Hint message (optional)…"
              value={draft}
              onValueChange={setDraft}
            />
            <Button type="button" onClick={() => setDraft("")}>
              Clear
            </Button>
          </div>
        </Panel>
      </div>

      <p className="text-xs text-[#c0cbdc] max-w-md text-center opacity-90">
        Guidelines: <code className="text-[#e4a672]">docs/</code> · Arrow keys
        move the bumpkin · Env:{" "}
        <code className="text-[#e4a672]">.env.sample</code>
      </p>
    </div>
  );
};
