// PR Notification Component - Professional Gym-style PR alerts
import { TrendingUp, X, ArrowUp } from 'lucide-react';
import React, { useState, useEffect } from "react";

const prNotificationStyles = `
  @keyframes prSlideIn {
    from {
      opacity: 0;
      transform: translateX(100%) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateX(0) scale(1);
    }
  }
  @keyframes prFadeOut {
    from {
      opacity: 1;
      transform: translateX(0) scale(1);
    }
    to {
      opacity: 0;
      transform: translateX(100%) scale(0.95);
    }
  }
  @keyframes prAccentPulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
  .pr-notification-enter {
    animation: prSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .pr-notification-exit {
    animation: prFadeOut 0.3s ease-in forwards;
  }
  .pr-accent-pulse {
    animation: prAccentPulse 2s ease-in-out infinite;
  }
`;

export default function PRNotification() {
  const [prAlert, setPrAlert] = useState(null);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const handleNewPR = (event) => {
      const { exerciseName, newPRs } = event.detail;
      setIsExiting(false);
      setPrAlert({
        exerciseName,
        newPRs,
      });

      // Auto-hide after 8 seconds
      setTimeout(() => {
        dismissPR();
      }, 8000);
    };
    window.addEventListener("newPRRecord", handleNewPR);
    return () => window.removeEventListener("newPRRecord", handleNewPR);
  }, []);

  const dismissPR = () => {
    setIsExiting(true);
    setTimeout(() => {
      setPrAlert(null);
      setIsExiting(false);
    }, 300);
  };

  if (!prAlert) return null;

  const formatMetricLabel = (type) => {
    const labels = {
      'Max Weight': 'MAX WEIGHT',
      'Total Volume': 'TOTAL VOLUME', 
      'Max Reps': 'MAX REPS',
      'Total Reps': 'TOTAL REPS',
    };
    return labels[type] || type.toUpperCase();
  };

  return (
    <>
      <style>{prNotificationStyles}</style>
      <div
        className={`fixed top-4 right-4 z-50 max-w-sm w-full ${isExiting ? 'pr-notification-exit' : 'pr-notification-enter'}`}
        style={{
          background: 'linear-gradient(145deg, #1a1a1a 0%, #111111 100%)',
          border: '1px solid rgba(220, 38, 38, 0.3)',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 30px rgba(220, 38, 38, 0.1)',
          overflow: 'hidden',
        }}
      >
        {/* Subtle top accent line */}
        <div 
          className="pr-accent-pulse"
          style={{
            height: '3px',
            background: 'linear-gradient(90deg, #dc2626, #ef4444, #dc2626)',
          }}
        />
        
        <div style={{ padding: '16px 20px' }}>
          {/* Header */}
          <div style={{ display: 'flex', itemsAlign: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #dc2626, #991b1b)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
              }}>
                <TrendingUp style={{ width: '18px', height: '18px', color: '#fff' }} />
              </div>
              <div>
                <div style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  letterSpacing: '1.5px',
                  color: '#ef4444',
                  textTransform: 'uppercase',
                }}>
                  PERSONAL RECORD
                </div>
                <div style={{
                  fontSize: '15px',
                  fontWeight: '700',
                  color: '#ffffff',
                  marginTop: '1px',
                }}>
                  {prAlert.exerciseName}
                </div>
              </div>
            </div>
            <button
              onClick={dismissPR}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                color: '#666',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.color = '#999';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.color = '#666';
              }}
            >
              <X style={{ width: '14px', height: '14px' }} />
            </button>
          </div>

          {/* PR Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: prAlert.newPRs.length <= 2 ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)',
            gap: '8px',
          }}>
            {prAlert.newPRs.map((pr, index) => (
              <div
                key={index}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  gridColumn: prAlert.newPRs.length === 3 && index === 2 ? 'span 2' : 'auto',
                }}
              >
                <div style={{
                  fontSize: '10px',
                  fontWeight: '600',
                  letterSpacing: '0.8px',
                  color: '#737373',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                }}>
                  {formatMetricLabel(pr.type)}
                </div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: '800',
                  color: '#ffffff',
                  lineHeight: '1.1',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {pr.value}<span style={{ fontSize: '12px', fontWeight: '600', color: '#a3a3a3', marginLeft: '2px' }}>{pr.unit}</span>
                </div>
                {pr.improvement > 0 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    marginTop: '4px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#22c55e',
                  }}>
                    <ArrowUp style={{ width: '12px', height: '12px' }} />
                    +{pr.improvement}{pr.unit}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
