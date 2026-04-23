import React, { useState, useEffect } from 'react';
import { Frame, Choice, Chapter } from '../types';

interface ReactBookRendererProps {
  onChoiceSelect: (choiceId: string) => void;
  onShare: () => void;
  onBack: () => void;
  chapters?: any[];
  currentChapterId?: string;
}

const ChapterList: React.FC<{ chapters: any[]; onSelectChapter: (chapterId: string) => void; currentChapterId?: string }> = ({ chapters, onSelectChapter, currentChapterId }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center', marginBottom: '2rem' }}>
      {chapters.map((chapter: any) => {
        const chapterTitle = typeof chapter === 'string' ? chapter : (chapter.title || chapter.id);
        const chapterId = typeof chapter === 'string' ? chapter : chapter.id;
        const isCurrent = currentChapterId === chapterId;
        return (
          <button
            key={chapterId}
            onClick={() => {
              console.log('[ChapterList] Chapter selected:', chapterId);
              onSelectChapter(chapterId);
            }}
            style={{
              backgroundColor: isCurrent ? '#4a9eff' : '#2a2a4e',
              border: isCurrent ? '2px solid #4a9eff' : '1px solid #4a9eff',
              color: isCurrent ? '#1a1a2e' : '#e0e0e0',
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: isCurrent ? 'bold' : 'normal',
              minWidth: '300px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              if (!isCurrent) {
                e.currentTarget.style.backgroundColor = '#4a9eff';
                e.currentTarget.style.color = '#1a1a2e';
              }
            }}
            onMouseOut={(e) => {
              if (!isCurrent) {
                e.currentTarget.style.backgroundColor = '#2a2a4e';
                e.currentTarget.style.color = '#e0e0e0';
              }
            }}
          >
            {isCurrent && '▸ '}{chapterTitle}
          </button>
        );
      })}
    </div>
  );
};

export const ReactBookRenderer: React.FC<ReactBookRendererProps> = ({
  onChoiceSelect,
  onShare,
  onBack,
  chapters = [],
  currentChapterId
}) => {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [chapterTitle, setChapterTitle] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showHomeScreen, setShowHomeScreen] = React.useState(true);
  const [localCurrentChapterId, setLocalCurrentChapterId] = useState<string>(currentChapterId || '');

  // Update local current chapter ID when prop changes
  useEffect(() => {
    if (currentChapterId) {
      setLocalCurrentChapterId(currentChapterId);
    }
  }, [currentChapterId]);

  // Also check URL state on mount for chapter highlighting
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      try {
        const state = JSON.parse(atob(hash));
        if (state.chapter && state.chapter.id) {
          setLocalCurrentChapterId(state.chapter.id);
        }
      } catch (e) {
        console.error('Failed to parse URL state:', e);
      }
    }
  }, []);

  // Auto-scroll to bottom when frames change
  useEffect(() => {
    const contentElement = document.getElementById('app-content');
    if (contentElement) {
      contentElement.scrollTop = contentElement.scrollHeight;
    }
  }, [frames]);

  console.log('[ReactBookRenderer] Render called', { frames: frames.length, choices: choices.length, chapterTitle, loading, error });

  const addFrame = (frame: Frame) => {
    console.log('[ReactBookRenderer] addFrame called:', frame);
    setFrames(prev => {
      console.log('[ReactBookRenderer] Adding frame, current count:', prev.length);
      return [...prev, frame];
    });
  };

  useEffect(() => {
    // Auto-scroll to bottom when frames change
    if (frames.length > 0) {
      const contentElement = document.getElementById('app-content');
      if (contentElement) {
        contentElement.scrollTop = contentElement.scrollHeight;
      }
    }
  }, [frames]);

  const setChoicesHandler = (newChoices: Choice[]) => {
    console.log('[ReactBookRenderer] setChoices called:', newChoices);
    setChoices(newChoices);
  };

  const showChapterTitleHandler = (chapter: Chapter) => {
    console.log('[ReactBookRenderer] showChapterTitle called:', chapter.title);
    setChapterTitle(chapter.title);
  };

  const clearContent = () => {
    console.log('[ReactBookRenderer] clearContent called, current chapterTitle:', chapterTitle);
    setFrames([]);
    setChoices([]);
    // Don't clear chapter title when navigating within a chapter
    // setChapterTitle('');
    // setError('');
  };

  const showHomeScreenHandler = () => {
    console.log('[ReactBookRenderer] showHomeScreen called');
    setShowHomeScreen(true);
    setFrames([]);
    setChoices([]);
    setChapterTitle('');
  };

  // Expose methods via window object for app to call
  useEffect(() => {
    console.log('[ReactBookRenderer] Setting up rendererAPI');
    const api = {
      setLoading,
      showError: setError,
      showChapterTitle: showChapterTitleHandler,
      addFrame,
      setChoices: setChoicesHandler,
      clearContent,
      showHomeScreen: showHomeScreenHandler
    };
    (window as any).rendererAPI = api;
    console.log('[ReactBookRenderer] rendererAPI set:', api);
  }, []);

  const renderFrame = (frame: Frame, index: number) => {
    console.log('[ReactBookRenderer] renderFrame:', frame, index);
    switch (frame.type) {
      case 'text':
        return <p key={index} className="text-frame" style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#e0e0e0', marginBottom: '0' }}>{(frame as any).value}</p>;
      case 'image':
        const imageSrc = (frame as any).src.startsWith('/') ? (frame as any).src : `/content/${(frame as any).src}`;
        return <img key={index} src={imageSrc} alt="" className="image-frame" style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', margin: '0.25rem 0', display: 'block' }} />;
      case 'pause':
        // Pause frames are invisible, they only delay content generation
        return null;
      default:
        return null;
    }
  };

  if (loading) {
    console.log('[ReactBookRenderer] Rendering loading state');
    return (
      <div className="loading">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    console.log('[ReactBookRenderer] Rendering error state:', error);
    return (
      <div className="error-message">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (showHomeScreen) {
    console.log('[ReactBookRenderer] Rendering home screen');
    // Check URL state dynamically
    const hash = window.location.hash.slice(1);
    const hasUrlStateDynamic = hash.length > 0;
    console.log('[ReactBookRenderer] hasUrlState dynamic:', hasUrlStateDynamic, 'hash:', hash);
    
    return (
      <div className="home-screen" style={{ textAlign: 'center', padding: '3rem 1rem', backgroundColor: '#1a1a2e', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem', color: '#4a9eff' }}>Echoes of the Last Compiler</h1>
        <p style={{ fontSize: '1.2rem', color: '#e0e0e0', marginBottom: '3rem', maxWidth: '600px' }}>
          An interactive narrative exploring identity, consciousness, and the boundaries between human and artificial intelligence.
        </p>
        
        {/* Start/Continue Reading Button */}
        <button
          onClick={() => {
            console.log('[ReactBookRenderer] Start/Continue Reading clicked, hasUrlState:', hasUrlStateDynamic);
            setShowHomeScreen(false);
            if (hasUrlStateDynamic) {
              // Load state from URL and continue
              // Try to get current chapter from URL state
              const hash = window.location.hash.slice(1);
              if (hash) {
                try {
                  const state = JSON.parse(atob(hash));
                  if (state.chapter && state.chapter.id) {
                    setLocalCurrentChapterId(state.chapter.id);
                  }
                } catch (e) {
                  console.error('Failed to parse URL state:', e);
                }
              }
              window.dispatchEvent(new CustomEvent('continueReading'));
            } else {
              // Trigger first chapter load via window event
              const firstChapterId = chapters.length > 0 ? (typeof chapters[0] === 'string' ? chapters[0] : chapters[0].id) : 'chapter_1';
              setLocalCurrentChapterId(firstChapterId);
              window.dispatchEvent(new CustomEvent('selectChapter', { detail: { chapterId: firstChapterId } }));
            }
          }}
          style={{
            backgroundColor: '#4a9eff',
            border: 'none',
            color: '#1a1a2e',
            padding: '1rem 2.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1.3rem',
            fontWeight: 'bold',
            minWidth: '300px',
            marginBottom: '2rem'
          }}
        >
          {hasUrlStateDynamic ? 'Continue Reading' : 'Start Reading'}
        </button>
        
        {/* Chapter List */}
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#e0e0e0', marginBottom: '1.5rem' }}>Chapters</h2>
        </div>
        
        <ChapterList 
          chapters={chapters} 
          currentChapterId={localCurrentChapterId}
          onSelectChapter={(chapterId) => {
            console.log('[ReactBookRenderer] Chapter selected:', chapterId);
            setLocalCurrentChapterId(chapterId);
            setShowHomeScreen(false);
            window.dispatchEvent(new CustomEvent('selectChapter', { detail: { chapterId } }));
          }}
        />
      </div>
    );
  }

  return (
    <div className="book-container" style={{ display: 'block', padding: '2rem', backgroundColor: '#1a1a2e', minHeight: '100vh' }}>
      {/* Navigation Menu */}
      <div style={{ position: 'fixed', top: '1rem', left: '1rem', zIndex: 1000 }}>
        <button 
          onClick={onBack} 
          style={{
            backgroundColor: '#4a9eff',
            border: 'none',
            color: '#1a1a2e',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 'bold'
          }}
        >
          ← Back
        </button>
      </div>

      {/* Content */}
      <div id="app-content" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
        {/* Chapter Title */}
        {chapterTitle && (
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#4a9eff' }}>
            {chapterTitle}
          </h1>
        )}

        {/* Frames */}
        {frames.map((frame, index) => renderFrame(frame, index))}

        {/* Choices */}
        {choices.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            {choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => onChoiceSelect(choice.goto)}
                style={{
                  backgroundColor: '#2a2a4e',
                  border: '1px solid #4a9eff',
                  color: '#e0e0e0',
                  padding: '1rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'normal',
                  width: '100%',
                  marginBottom: '0.75rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#4a9eff';
                  e.currentTarget.style.color = '#1a1a2e';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#2a2a4e';
                  e.currentTarget.style.color = '#e0e0e0';
                }}
              >
                {choice.text}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Share Button */}
      <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', zIndex: 1000 }}>
        <button 
          onClick={onShare}
          style={{
            backgroundColor: '#2a2a4e',
            border: '1px solid #4a9eff',
            color: '#e0e0e0',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 'bold'
          }}
        >
          Share
        </button>
      </div>
    </div>
  );
};
