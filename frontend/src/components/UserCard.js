import React from 'react';
import './UserCard.scss';

const UserCard = ({ user, position }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={`user-card ${position}`}>
      <div className="user-header">
        <img src={user.avatar} alt={user.username} className="user-avatar" />
        <div className="user-info">
          <h3 className="user-name">{user.name}</h3>
          <a 
            href={`https://github.com/${user.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="user-username-link"
          >
            <p className="user-username">@{user.username}</p>
          </a>
        </div>
        <a 
          href={`https://github.com/${user.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="github-link-button"
          title="View GitHub Profile"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </a>
      </div>

      {user.bio && user.bio !== 'No bio available' && (
        <p className="user-bio">{user.bio}</p>
      )}

      <div className="user-stats">
        <div className="stat-item">
          <span className="stat-value">{user.followers.toLocaleString()}</span>
          <span className="stat-label">Followers</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{user.following.toLocaleString()}</span>
          <span className="stat-label">Following</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{user.publicRepos}</span>
          <span className="stat-label">Repos</span>
        </div>
      </div>

      <div className="user-details">
        <div className="detail-row">
          <span className="detail-label">⭐ Total Stars:</span>
          <span className="detail-value">{user.totalStars.toLocaleString()}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">🍴 Total Forks:</span>
          <span className="detail-value">{user.totalForks.toLocaleString()}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">👀 Watchers:</span>
          <span className="detail-value">{user.totalWatchers.toLocaleString()}</span>
        </div>
        {user.location && user.location !== 'Not specified' && (
          <div className="detail-row">
            <span className="detail-label">📍 Location:</span>
            <span className="detail-value">{user.location}</span>
          </div>
        )}
        {user.company && user.company !== 'Not specified' && (
          <div className="detail-row">
            <span className="detail-label">🏢 Company:</span>
            <span className="detail-value">{user.company}</span>
          </div>
        )}
        <div className="detail-row">
          <span className="detail-label">📅 Joined:</span>
          <span className="detail-value">{formatDate(user.accountCreated)}</span>
        </div>
      </div>

      {user.topLanguages && user.topLanguages.length > 0 && (
        <div className="user-languages">
          <h4 className="languages-title">Top Languages</h4>
          <div className="languages-list">
            {user.topLanguages.slice(0, 5).map((lang, index) => (
              <span key={index} className="language-tag">
                {lang.language}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCard;

