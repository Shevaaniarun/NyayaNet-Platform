import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import './BadgeCelebration.css';

interface BadgeCelebrationProps {
  badge: {
    title: string;
    description: string;
    icon: React.ReactNode;
    rarity?: string;
  };
  onClose: () => void;
}

const BadgeCelebration: React.FC<BadgeCelebrationProps> = ({ badge, onClose }) => {

  // Trigger confetti on mount
  useEffect(() => {
    // Trigger confetti based on badge rarity
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    // Different confetti styles based on rarity
    const rarityColors = {
      common: ['#6b7280', '#9ca3af', '#d1d5db'],
      rare: ['#3b82f6', '#60a5fa', '#93c5fd'],
      epic: ['#8b5cf6', '#a78bfa', '#c4b5fd'],
      legendary: ['#f59e0b', '#fbbf24', '#fcd34d', '#D2B382', '#c4a571']
    };

    const colors = rarityColors[badge.rarity as keyof typeof rarityColors] || rarityColors.legendary;

    const frame = () => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) return;

      // Launch confetti from both sides
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.5 },
        colors: colors,
        startVelocity: 30,
        ticks: 200
      });

      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.5 },
        colors: colors,
        startVelocity: 30,
        ticks: 200
      });

      // For legendary badges, add extra sparkles
      if (badge.rarity === 'legendary') {
        confetti({
          particleCount: 5,
          spread: 100,
          origin: { y: 0.6 },
          colors: colors,
          shapes: ['star']
        });
      }

      requestAnimationFrame(frame);
    };

    frame();

    // Fire initial big burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: colors,
      shapes: ['circle', 'square']
    });

  }, [badge.rarity]);

  return (
    <div className="celebration-overlay-modern" onClick={onClose}>
      <div className="celebration-modal-modern" onClick={(e) => e.stopPropagation()}>
        {/* Animated background elements */}
        <div className="celebration-bg">
          <div className="celebration-bg-circle circle1"></div>
          <div className="celebration-bg-circle circle2"></div>
          <div className="celebration-bg-circle circle3"></div>
        </div>

        {/* Sparkle effects */}
        <div className="sparkles">
          <div className="sparkle s1">✨</div>
          <div className="sparkle s2">✨</div>
          <div className="sparkle s3">✨</div>
          <div className="sparkle s4">✨</div>
          <div className="sparkle s5">✨</div>
        </div>

        <div className="celebration-content-modern">
          {/* Trophy/Medal icon */}
          <div className="celebration-trophy">
            <div className="trophy-shine"></div>
            <div className="trophy-icon">
              {badge.icon}
            </div>
          </div>

          {/* Achievement text */}
          <div className="achievement-text">
            <span className="achievement-badge">ACHIEVEMENT UNLOCKED</span>
            <h2 className="achievement-title">{badge.title}</h2>
            <p className="achievement-desc">{badge.description}</p>
          </div>

          {/* Rarity badge */}
          {badge.rarity && (
            <div className={`rarity-badge-modern ${badge.rarity}`}>
              <span className="rarity-star">⭐</span>
              <span className="rarity-text">{badge.rarity.toUpperCase()}</span>
              <span className="rarity-star">⭐</span>
            </div>
          )}

          {/* Stats animation */}
          <div className="achievement-stats">
            <div className="stat-item">
              <span className="stat-label">+100</span>
              <span className="stat-desc">Reputation</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-label">+50</span>
              <span className="stat-desc">XP Points</span>
            </div>
          </div>

          {/* Continue button */}
          <button className="celebration-continue-btn" onClick={onClose}>
            <span>Continue Journey</span>
            <span className="btn-shine"></span>
          </button>
        </div>

        {/* Floating particles */}
        <div className="particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`
            }} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Make sure to export default
export default BadgeCelebration;