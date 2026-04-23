import React, { useState, useEffect } from 'react';
import { Frame, Choice, Chapter } from '../types';

interface ReactBookRendererProps {
  onChoiceSelect: (choiceId: string) => void;
  onShare: () => void;
  onBack: () => void;
  chapters?: Chapter[];
  currentChapterId?: string;
}

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
  const [showHomeScreen, setShowHomeScreen] = React.useState(false);

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

  const showErrorHandler = (message: string) => {
    console.log('[ReactBookRenderer] showError called:', message);
    setError(message);
  };

  const setLoadingHandler = (isLoading: boolean) => {
    console.log('[ReactBookRenderer] setLoading called:', isLoading);
    setLoading(isLoading);
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
        return <p key={index} className="text-frame" style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#e0e0e0', marginBottom: '0.1rem' }}>{(frame as any).value}</p>;
      case 'image':
        const imageSrc = (frame as any).src.startsWith('/') ? (frame as any).src : `/content/${(frame as any).src}`;
        return <img key={index} src={imageSrc} alt="" className="image-frame" style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', margin: '0.25rem 0', display: 'block' }} />;
      case 'pause':
        return <div key={index} className="pause-frame" style={{ height: (frame as any).duration + 'px' }} />;
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
    return (
      <div className="home-screen" style={{ textAlign: 'center', padding: '3rem 1rem', backgroundColor: '#1a1a2e', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem', color: '#4a9eff' }}>Echoes of the Last Compiler</h1>
        <p style={{ fontSize: '1.2rem', color: '#e0e0e0', marginBottom: '3rem', maxWidth: '600px' }}>
          An interactive narrative exploring identity, consciousness, and the boundaries between human and artificial intelligence.
        </p>
        
        {/* Start Reading Button */}
        <button
          onClick={() => {
            console.log('[ReactBookRenderer] Start Reading clicked');
            setShowHomeScreen(false);
            // Trigger first chapter load via window event
            const firstChapterId = chapters.length > 0 ? (typeof chapters[0] === 'string' ? chapters[0] : chapters[0].id) : 'chapter_1';
            window.dispatchEvent(new CustomEvent('selectChapter', { detail: { chapterId: firstChapterId } }));
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
          Start Reading
        </button>
        
        {/* Chapter List */}
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#e0e0e0', marginBottom: '1.5rem' }}>Chapters</h2>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center', marginBottom: '2rem' }}>
          {chapters.map((chapter: any) => (
            <button
              key={typeof chapter === 'string' ? chapter : chapter.id}
              onClick={() => {
                console.log('[ReactBookRenderer] Chapter selected:', typeof chapter === 'string' ? chapter : chapter.id);
                setShowHomeScreen(false);
                // Trigger chapter load via window event
                window.dispatchEvent(new CustomEvent('selectChapter', { detail: { chapterId: typeof chapter === 'string' ? chapter : chapter.id } }));
              }}
              style={{
                backgroundColor: '#2a2a4e',
                border: '1px solid #4a9eff',
                color: '#e0e0e0',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'normal',
                minWidth: '300px',
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
              {typeof chapter === 'string' ? `Chapter ${chapter}` : chapter.title || chapter.id}
            </button>
          ))}
        </div>
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
            borderRadius: '8px', 
            cursor: 'pointer', 
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          ← Back to Menu
        </button>
        {chapters.length > 0 && (
          <div style={{ marginTop: '0.5rem', backgroundColor: '#2d2d44', padding: '1rem', borderRadius: '8px', maxWidth: '200px' }}>
            <h3 style={{ color: '#4a9eff', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Chapters</h3>
            {chapters.map((chapter, index) => (
              <div 
                key={chapter.id} 
                style={{ 
                  padding: '0.25rem 0.5rem', 
                  cursor: 'pointer',
                  color: currentChapterId === chapter.id ? '#4a9eff' : '#e0e0e0',
                  fontWeight: currentChapterId === chapter.id ? 'bold' : 'normal',
                  fontSize: '0.85rem'
                }}
              >
                {index + 1}. {chapter.title}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="content-area" style={{ marginBottom: '2rem', backgroundColor: '#2d2d44', padding: '1rem' }}>
        {chapterTitle && <h1 className="chapter-title" style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem', color: '#4a9eff' }}>{chapterTitle}</h1>}
        {frames.length === 0 && <p style={{ color: '#e0e0e0' }}>No frames loaded yet</p>}
        {frames.map((frame, index) => renderFrame(frame, index))}
      </div>
      {choices.length > 0 && (
        <div className="choices-area" style={{ marginTop: '2rem', backgroundColor: '#2d2d44', padding: '1rem', position: 'relative', zIndex: 10 }}>
          <h3 style={{ color: '#4a9eff', marginBottom: '1rem', fontSize: '1.2rem' }}>What do you do?</h3>
          {choices.map((choice, index) => (
            <button
              key={index}
              className="choice-button"
              onClick={() => onChoiceSelect(choice.text)}
              style={{ 
                display: 'block', 
                marginBottom: '0.75rem', 
                padding: '1.25rem', 
                backgroundColor: '#4a9eff', 
                border: '2px solid #4a9eff', 
                color: '#1a1a2e', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontSize: '1.1rem',
                fontWeight: 'bold',
                width: '100%',
                textAlign: 'left'
              }}
            >
              {choice.text}
            </button>
          ))}
        </div>
      )}
      <button className="share-button" onClick={onShare} style={{ position: 'fixed', bottom: '1rem', right: '1rem', backgroundColor: '#4a9eff', border: 'none', color: '#1a1a2e', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', zIndex: 1000, fontSize: '1rem' }}>
        📤 Share
      </button>
    </div>
  );
};
