import React, { useEffect, useRef } from 'react';
import './AIComparison.scss';

const AIComparison = ({ comparison, isStreaming = false, user1, user2, onRoast, disabledButtons = [] }) => {
  const contentRef = useRef(null);

  // Auto-scroll to bottom when new content arrives during streaming
  useEffect(() => {
    if (isStreaming && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [comparison, isStreaming]);

  // Split comparison text into paragraphs for better formatting
  const paragraphs = comparison ? comparison.split('\n').filter(p => p.trim().length > 0) : [];

  const handleRoastClick = (roastType) => {
    // Call the roast function
    onRoast(roastType);
  };

  // Show buttons after comparison is done (has comparison text)
  // Buttons are always visible but disabled while streaming or if already clicked
  const showButtons = user1 && user2 && comparison;
  const isUser1Disabled = disabledButtons.includes('user1') || isStreaming;
  const isUser2Disabled = disabledButtons.includes('user2') || isStreaming;
  const isBothDisabled = disabledButtons.includes('both') || isStreaming;

  return (
    <div className="ai-comparison">
      <div className="comparison-header">
        <span className="ai-icon">🤖</span>
        <h3>AI-Powered Analysis</h3>
        {isStreaming && comparison && (
          <span className="streaming-indicator">
            <span className="pulse-dot"></span>
            Generating...
          </span>
        )}
        {showButtons && (
          <div className="roast-buttons">
            <button 
              className={`roast-button roast-user1 ${isUser1Disabled ? 'disabled' : ''}`}
              onClick={() => !isUser1Disabled && handleRoastClick('user1')}
              disabled={isUser1Disabled}
            >
              🔥 Roast {user1?.username}
            </button>
            <button 
              className={`roast-button roast-user2 ${isUser2Disabled ? 'disabled' : ''}`}
              onClick={() => !isUser2Disabled && handleRoastClick('user2')}
              disabled={isUser2Disabled}
            >
              🔥 Roast {user2?.username}
            </button>
            <button 
              className={`roast-button roast-both ${isBothDisabled ? 'disabled' : ''}`}
              onClick={() => !isBothDisabled && handleRoastClick('both')}
              disabled={isBothDisabled}
            >
              🔥 Roast Both
            </button>
          </div>
        )}
      </div>
      <div className="comparison-content" ref={contentRef}>
        {paragraphs.length > 0 ? (
          paragraphs.map((paragraph, index) => (
            <p key={index} className="comparison-paragraph">
              {paragraph.trim()}
            </p>
          ))
        ) : (
          <p className="comparison-paragraph placeholder">
            {isStreaming ? 'Waiting for analysis...' : 'No comparison available'}
          </p>
        )}
        {isStreaming && comparison && (
          <span className="typing-cursor">|</span>
        )}
      </div>
    </div>
  );
};

export default AIComparison;
