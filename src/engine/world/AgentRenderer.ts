/**
 * AgentRenderer — creates and animates blocky agent characters.
 *
 * Agents persist in the world. They walk between zones,
 * carry data packets, and play work animations.
 *
 * Visual: simple 2D blocky character (body + head + eyes).
 */

import { Container, Graphics, Text } from "pixi.js";
import type { AgentDefinition, Vec2, PathDefinition, AgentAnimState } from "../core/types";

export interface AgentRuntime {
  def: AgentDefinition;
  container: Container;
  bodyGraphics: Graphics;
  headGraphics: Graphics;
  carryIndicator: Container;
  position: Vec2;        // current position in stage pixels
  animState: AgentAnimState;
  // Path following
  targetPath: Vec2[] | null;  // waypoints in stage pixels
  currentSegment: number;
  pathProgress: number;
  speed: number;         // pixels per second
  facingRight: boolean;
  // Carry state
  carryCount: number;
  // Animation timer
  animTimer: number;
  // Work timer
  workTimer: number;
  workDuration: number;
}

const AGENT_BODY_W = 14;
const AGENT_BODY_H = 18;
const AGENT_HEAD_W = 12;
const AGENT_HEAD_H = 10;
const WALK_SPEED = 120; // pixels per second

export class AgentRenderer {
  private agents = new Map<string, AgentRuntime>();
  private stageW: number;
  private stageH: number;
  public container: Container;

  constructor(
    agentDefs: AgentDefinition[],
    stageW: number,
    stageH: number,
    fontFamily: string
  ) {
    this.stageW = stageW;
    this.stageH = stageH;
    this.container = new Container();

    for (const def of agentDefs) {
      const agent = this.createAgent(def, fontFamily);
      this.agents.set(def.id, agent);
      this.container.addChild(agent.container);
    }
  }

  private createAgent(def: AgentDefinition, fontFamily: string): AgentRuntime {
    const c = new Container();
    const colorNum = parseInt(def.color.replace("#", ""), 16);

    // Shadow
    const shadow = new Graphics();
    shadow.ellipse(0, AGENT_BODY_H / 2 + 2, 8, 3);
    shadow.fill({ color: 0x000000, alpha: 0.08 });
    c.addChild(shadow);

    // Body (rounded rect)
    const body = new Graphics();
    body.roundRect(-AGENT_BODY_W / 2, -AGENT_BODY_H / 2, AGENT_BODY_W, AGENT_BODY_H, 4);
    body.fill({ color: colorNum, alpha: 0.85 });
    body.roundRect(-AGENT_BODY_W / 2, -AGENT_BODY_H / 2, AGENT_BODY_W, AGENT_BODY_H, 4);
    body.stroke({ color: 0xffffff, width: 1, alpha: 0.3 });
    c.addChild(body);

    // Head (on top of body)
    const head = new Graphics();
    head.roundRect(-AGENT_HEAD_W / 2, -AGENT_HEAD_H - AGENT_BODY_H / 2 + 2, AGENT_HEAD_W, AGENT_HEAD_H, 3);
    head.fill({ color: colorNum, alpha: 0.95 });
    head.roundRect(-AGENT_HEAD_W / 2, -AGENT_HEAD_H - AGENT_BODY_H / 2 + 2, AGENT_HEAD_W, AGENT_HEAD_H, 3);
    head.stroke({ color: 0xffffff, width: 0.8, alpha: 0.3 });
    // Eyes
    const eyeY = -AGENT_HEAD_H / 2 - AGENT_BODY_H / 2 + 4;
    head.circle(-2.5, eyeY, 1.5);
    head.fill({ color: 0xffffff, alpha: 0.9 });
    head.circle(2.5, eyeY, 1.5);
    head.fill({ color: 0xffffff, alpha: 0.9 });
    c.addChild(head);

    // Name tag
    const nameTag = new Text({
      text: def.name,
      style: { fontFamily, fontSize: 7, fontWeight: "600", fill: def.color },
    });
    nameTag.anchor.set(0.5, 0);
    nameTag.y = AGENT_BODY_H / 2 + 6;
    nameTag.alpha = 0.5;
    c.addChild(nameTag);

    // Carry indicator (floating box above head)
    const carryIndicator = new Container();
    carryIndicator.visible = false;
    carryIndicator.y = -AGENT_HEAD_H - AGENT_BODY_H / 2 - 8;
    const carryBox = new Graphics();
    carryBox.roundRect(-5, -5, 10, 10, 2);
    carryBox.fill({ color: colorNum, alpha: 0.7 });
    carryBox.roundRect(-5, -5, 10, 10, 2);
    carryBox.stroke({ color: 0xffffff, width: 0.5, alpha: 0.5 });
    carryIndicator.addChild(carryBox);
    c.addChild(carryIndicator);

    // Set initial position
    const startX = def.startPosition.x * this.stageW;
    const startY = def.startPosition.y * this.stageH;
    c.x = startX;
    c.y = startY;

    return {
      def,
      container: c,
      bodyGraphics: body,
      headGraphics: head,
      carryIndicator,
      position: { x: startX, y: startY },
      animState: "idle",
      targetPath: null,
      currentSegment: 0,
      pathProgress: 0,
      speed: WALK_SPEED,
      facingRight: true,
      carryCount: 0,
      animTimer: 0,
      workTimer: 0,
      workDuration: 0,
    };
  }

  /** Send agent walking along a path (waypoints in normalized coords) */
  walkPath(agentId: string, waypoints: Vec2[]) {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    // Convert normalized waypoints to stage pixels
    agent.targetPath = waypoints.map(wp => ({
      x: wp.x * this.stageW,
      y: wp.y * this.stageH,
    }));
    // Prepend current position as first waypoint
    agent.targetPath.unshift({ x: agent.position.x, y: agent.position.y });
    agent.currentSegment = 0;
    agent.pathProgress = 0;
    agent.animState = agent.carryCount > 0 ? "carrying" : "walking";
  }

  /** Send agent to a zone center */
  walkToZone(agentId: string, zoneCenter: Vec2) {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    const targetX = zoneCenter.x;
    const targetY = zoneCenter.y;
    agent.targetPath = [
      { x: agent.position.x, y: agent.position.y },
      { x: targetX, y: targetY },
    ];
    agent.currentSegment = 0;
    agent.pathProgress = 0;
    agent.animState = agent.carryCount > 0 ? "carrying" : "walking";
  }

  /** Start work animation */
  startWork(agentId: string, duration: number) {
    const agent = this.agents.get(agentId);
    if (!agent) return;
    agent.animState = "working";
    agent.workTimer = 0;
    agent.workDuration = duration;
  }

  /** Agent picks up items */
  pickup(agentId: string, count: number) {
    const agent = this.agents.get(agentId);
    if (!agent) return;
    agent.carryCount = count;
    agent.carryIndicator.visible = count > 0;
    if (agent.animState === "walking") {
      agent.animState = "carrying";
    }
  }

  /** Agent drops items */
  drop(agentId: string) {
    const agent = this.agents.get(agentId);
    if (!agent) return;
    agent.carryCount = 0;
    agent.carryIndicator.visible = false;
    if (agent.animState === "carrying") {
      agent.animState = "idle";
    }
  }

  getPosition(agentId: string): Vec2 | null {
    const agent = this.agents.get(agentId);
    return agent ? { ...agent.position } : null;
  }

  /** Per-frame update */
  tick(deltaSec: number) {
    for (const agent of this.agents.values()) {
      agent.animTimer += deltaSec;

      if (agent.targetPath) {
        this.tickMovement(agent, deltaSec);
      } else if (agent.animState === "working") {
        this.tickWork(agent, deltaSec);
      }

      this.tickAnimation(agent);
    }
  }

  private tickMovement(agent: AgentRuntime, deltaSec: number) {
    if (!agent.targetPath) return;

    const from = agent.targetPath[agent.currentSegment];
    const to = agent.targetPath[agent.currentSegment + 1];
    if (!from || !to) {
      // Path complete
      agent.targetPath = null;
      agent.animState = agent.carryCount > 0 ? "carrying" : "idle";
      return;
    }

    // Calculate segment length
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const segLen = Math.sqrt(dx * dx + dy * dy);
    if (segLen < 1) {
      agent.currentSegment++;
      agent.pathProgress = 0;
      return;
    }

    // Advance
    agent.pathProgress += (agent.speed * deltaSec) / segLen;

    // Facing direction
    if (dx > 5) agent.facingRight = true;
    else if (dx < -5) agent.facingRight = false;

    if (agent.pathProgress >= 1) {
      agent.pathProgress = 0;
      agent.currentSegment++;
      agent.position.x = to.x;
      agent.position.y = to.y;
    } else {
      agent.position.x = from.x + dx * agent.pathProgress;
      agent.position.y = from.y + dy * agent.pathProgress;
    }

    agent.container.x = agent.position.x;
    agent.container.y = agent.position.y;
  }

  private tickWork(agent: AgentRuntime, deltaSec: number) {
    agent.workTimer += deltaSec;
    if (agent.workTimer >= agent.workDuration) {
      agent.animState = agent.carryCount > 0 ? "carrying" : "idle";
    }
  }

  private tickAnimation(agent: AgentRuntime) {
    const t = agent.animTimer;

    switch (agent.animState) {
      case "idle": {
        // Gentle breathing bob
        agent.container.y = agent.position.y + Math.sin(t * 2) * 1;
        agent.container.scale.set(1);
        agent.container.rotation = 0;
        break;
      }
      case "walking":
      case "carrying": {
        // Walk bob
        agent.container.y = agent.position.y + Math.abs(Math.sin(t * 8)) * -3;
        // Slight lean
        agent.container.rotation = Math.sin(t * 8) * 0.05;
        // Face direction
        agent.container.scale.x = agent.facingRight ? 1 : -1;
        // Carry indicator bobs
        if (agent.carryIndicator.visible) {
          agent.carryIndicator.y = -AGENT_HEAD_H - AGENT_BODY_H / 2 - 8 + Math.sin(t * 4) * 2;
        }
        break;
      }
      case "working": {
        // Pulse / bounce
        const pulse = 1 + Math.sin(t * 6) * 0.05;
        agent.container.scale.set(pulse);
        agent.container.rotation = Math.sin(t * 4) * 0.03;
        break;
      }
    }
  }

  /** Reset all agents to start positions */
  resetAll() {
    for (const agent of this.agents.values()) {
      agent.position.x = agent.def.startPosition.x * this.stageW;
      agent.position.y = agent.def.startPosition.y * this.stageH;
      agent.container.x = agent.position.x;
      agent.container.y = agent.position.y;
      agent.targetPath = null;
      agent.animState = "idle";
      agent.carryCount = 0;
      agent.carryIndicator.visible = false;
      agent.animTimer = 0;
    }
  }
}
