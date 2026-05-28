import Phaser from "phaser";

export interface ArcadeMachinePlacement {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface NightshadeArcadeSceneCallbacks {
  onFocusMachineChange?: (machineId: string | null) => void;
  onInteractMachine?: (machineId: string) => void;
}

export const ARCADE_MACHINES_REGISTRY_KEY = "nightshadeArcadeMachines";
export const ARCADE_TOUCH_VECTOR_REGISTRY_KEY = "nightshadeArcadeTouchVector";
export const ARCADE_CALLBACKS_REGISTRY_KEY = "nightshadeArcadeCallbacks";

const WORLD_WIDTH = 1280;
const WORLD_HEIGHT = 760;
const PLAYER_SPEED = 170;
const INTERACTION_RADIUS = 96;

export class NightshadeArcadeScene extends Phaser.Scene {
  private player?: Phaser.Physics.Arcade.Sprite;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyW?: Phaser.Input.Keyboard.Key;
  private keyA?: Phaser.Input.Keyboard.Key;
  private keyS?: Phaser.Input.Keyboard.Key;
  private keyD?: Phaser.Input.Keyboard.Key;
  private keyE?: Phaser.Input.Keyboard.Key;
  private focusedMachineId: string | null = null;
  private machineNodes: Array<
    Phaser.GameObjects.Rectangle & { machine: ArcadeMachinePlacement }
  > = [];

  constructor() {
    super("NightshadeArcadeScene");
  }

  preload() {
    const base = import.meta.env.BASE_URL;
    this.load.spritesheet("silhouette", `${base}game/silhouette.webp`, {
      frameWidth: 14,
      frameHeight: 18,
    });
  }

  create() {
    const placements = (this.game.registry.get(
      ARCADE_MACHINES_REGISTRY_KEY,
    ) ?? []) as ArcadeMachinePlacement[];

    this.cameras.main.setBackgroundColor("#130b1f");
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setZoom(1.6);
    this.cameras.main.setRoundPixels(true);

    this.add.rectangle(
      WORLD_WIDTH / 2,
      WORLD_HEIGHT / 2,
      WORLD_WIDTH,
      WORLD_HEIGHT,
      0x20142f,
    );
    this.add
      .rectangle(WORLD_WIDTH / 2, 80, WORLD_WIDTH - 140, 84, 0x311a49, 0.9)
      .setStrokeStyle(4, 0xb65389, 0.95);
    this.add
      .text(WORLD_WIDTH / 2, 80, "NIGHTSHADE ARCADE", {
        fontFamily: "monospace",
        fontSize: "24px",
        color: "#fce7ff",
      })
      .setOrigin(0.5);
    this.add
      .text(WORLD_WIDTH / 2, 114, "Walk around and use a machine to play", {
        fontFamily: "monospace",
        fontSize: "12px",
        color: "#f5b4d5",
      })
      .setOrigin(0.5);

    const walls = this.physics.add.staticGroup();
    const addWall = (x: number, y: number, width: number, height: number) => {
      const wall = this.add.rectangle(x, y, width, height, 0x000000, 0);
      this.physics.add.existing(wall, true);
      walls.add(wall);
    };
    addWall(WORLD_WIDTH / 2, 0, WORLD_WIDTH, 26);
    addWall(WORLD_WIDTH / 2, WORLD_HEIGHT, WORLD_WIDTH, 26);
    addWall(0, WORLD_HEIGHT / 2, 26, WORLD_HEIGHT);
    addWall(WORLD_WIDTH, WORLD_HEIGHT / 2, 26, WORLD_HEIGHT);

    const machineObstacles = this.physics.add.staticGroup();

    placements.forEach((machine, index) => {
      const body = this.add.rectangle(
        machine.x,
        machine.y,
        machine.width,
        machine.height,
        0x4f2e66,
      ) as Phaser.GameObjects.Rectangle & { machine: ArcadeMachinePlacement };
      body.machine = machine;
      body.setStrokeStyle(2, 0xd37aa8, 0.95);
      body.setInteractive({ cursor: "pointer" });

      const label = this.add.text(machine.x, machine.y + machine.height * 0.95, machine.name, {
        fontFamily: "monospace",
        fontSize: "11px",
        color: "#f8f1ff",
        align: "center",
        wordWrap: { width: 110, useAdvancedWrap: true },
      });
      label.setOrigin(0.5, 0);

      this.physics.add.existing(body, true);
      machineObstacles.add(body);
      this.machineNodes.push(body);

      body.on("pointerdown", () => {
        if (!this.player) return;
        const distance = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          machine.x,
          machine.y,
        );
        if (distance <= INTERACTION_RADIUS) {
          this.interact(machine.id);
        } else {
          this.setFocused(machine.id);
        }
      });

      // aisle spacer in the middle rows
      if ((index + 1) % 4 === 0) {
        this.add.rectangle(640, machine.y, 8, 120, 0x4a2e61, 0.35);
      }
    });

    this.player = this.physics.add.sprite(
      WORLD_WIDTH / 2,
      WORLD_HEIGHT - 100,
      "silhouette",
      0,
    );
    this.player.setScale(2.6);
    this.player.setDepth(100);
    this.player.setCollideWorldBounds(true);
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    playerBody.setSize(10, 14);
    playerBody.setOffset(2, 4);

    this.physics.add.collider(this.player, walls);
    this.physics.add.collider(this.player, machineObstacles);

    this.cameras.main.startFollow(this.player, true, 1, 1);

    this.cursors = this.input.keyboard?.createCursorKeys();
    this.keyW = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyE = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  }

  update() {
    if (!this.player) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const touchVector = (this.game.registry.get(
      ARCADE_TOUCH_VECTOR_REGISTRY_KEY,
    ) ?? { x: 0, y: 0 }) as { x: number; y: number };

    const keyboardX =
      (this.cursors?.left.isDown || this.keyA?.isDown ? -1 : 0) +
      (this.cursors?.right.isDown || this.keyD?.isDown ? 1 : 0);
    const keyboardY =
      (this.cursors?.up.isDown || this.keyW?.isDown ? -1 : 0) +
      (this.cursors?.down.isDown || this.keyS?.isDown ? 1 : 0);

    let moveX = keyboardX;
    let moveY = keyboardY;
    if (Math.abs(touchVector.x) > 0.08 || Math.abs(touchVector.y) > 0.08) {
      moveX = touchVector.x;
      moveY = touchVector.y;
    }

    if (moveX !== 0 || moveY !== 0) {
      const v = new Phaser.Math.Vector2(moveX, moveY).normalize();
      body.setVelocity(v.x * PLAYER_SPEED, v.y * PLAYER_SPEED);
      if (v.x < -0.06) this.player.setFlipX(false);
      if (v.x > 0.06) this.player.setFlipX(true);
    } else {
      body.setVelocity(0, 0);
    }

    const nearest = this.findNearestMachineId();
    this.setFocused(nearest);

    if (nearest && this.keyE && Phaser.Input.Keyboard.JustDown(this.keyE)) {
      this.interact(nearest);
    }
  }

  private findNearestMachineId(): string | null {
    if (!this.player) return null;
    let bestId: string | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (const node of this.machineNodes) {
      const d = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        node.machine.x,
        node.machine.y,
      );
      if (d <= INTERACTION_RADIUS && d < bestDistance) {
        bestDistance = d;
        bestId = node.machine.id;
      }
    }
    return bestId;
  }

  private setFocused(machineId: string | null) {
    if (this.focusedMachineId === machineId) return;
    this.focusedMachineId = machineId;
    const callbacks = (this.game.registry.get(ARCADE_CALLBACKS_REGISTRY_KEY) ??
      {}) as NightshadeArcadeSceneCallbacks;
    callbacks.onFocusMachineChange?.(machineId);
  }

  private interact(machineId: string) {
    const callbacks = (this.game.registry.get(ARCADE_CALLBACKS_REGISTRY_KEY) ??
      {}) as NightshadeArcadeSceneCallbacks;
    callbacks.onInteractMachine?.(machineId);
  }
}
