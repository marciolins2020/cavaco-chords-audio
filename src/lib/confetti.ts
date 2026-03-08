import confetti from "canvas-confetti";

export function fireChallengeConfetti() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#f59e0b", "#10b981", "#6366f1", "#ec4899"],
  });
}

export function fireLevelUpConfetti() {
  // Two bursts from sides
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 200 };
  confetti({ ...defaults, particleCount: 50, origin: { x: 0.2, y: 0.5 } });
  confetti({ ...defaults, particleCount: 50, origin: { x: 0.8, y: 0.5 } });
  setTimeout(() => {
    confetti({ ...defaults, particleCount: 40, origin: { x: 0.5, y: 0.3 } });
  }, 200);
}
