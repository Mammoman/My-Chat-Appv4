import React from 'react';
import { Cancel01Icon, AtIcon } from 'hugeicons-react';
import '../../styles/chat/MentionsOverlay.css';

const MentionsOverlay = ({ mentions, onMessageClick, onClose }) => {
    const sortedMentions = [...mentions].sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return a.createdAt.seconds - b.createdAt.seconds; // Oldest to newest
    });

    return (
        <div className="mentions-overlay-container">
            <div className="mentions-header">
                <div className="mentions-title">
                    <AtIcon size={20} className="mentions-title-icon" />
                    <span>Mentions & Replies ({mentions.length})</span>
                </div>
                <button className="close-mentions-btn" onClick={onClose}>
                    <Cancel01Icon size={24} />
                </button>
            </div>

            <div className="mentions-content">
                {sortedMentions.length > 0 ? (
                    sortedMentions.map((msg) => (
                        <div
                            key={msg.id}
                            className="mention-item"
                            onClick={() => {
                                onMessageClick(msg.id);
                                onClose();
                            }}
                        >
                            <div className="mention-header">
                                <span className="mention-by">{msg.user}</span>
                                <span className="mention-type">replied to you</span>
                            </div>
                            <div className="mention-text-preview">
                                {msg.text}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-mentions">
                        <p>No one has replied to you yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MentionsOverlay;
