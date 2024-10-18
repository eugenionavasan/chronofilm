'use client';

import React, { useState, useEffect } from 'react';
import { movies, Movie } from '@/data/movieData'; // Import the movie data

const getRandomMovie = (availableMovies: Movie[]): Movie => {
  const randomIndex = Math.floor(Math.random() * availableMovies.length);
  return availableMovies[randomIndex];
};

// Define the YT interface
interface YT {
  Player: {
    new (elementId: string, options: {
      videoId: string | undefined;
      playerVars: {
        autoplay: 1;
        modestbranding: 1;
        controls: 1;
        rel: 0;
      };
      events: {
        onReady: (event: { target: { playVideo: () => void; stopVideo: () => void } }) => void;
      };
    }): void;
  };
}

// Extend the Window interface
declare global {
  interface Window {
    YT: YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

const YouTubeTrailer: React.FC<{ trailerUrl: string; onEnd: () => void }> = ({ trailerUrl, onEnd }) => {
  useEffect(() => {
    const videoId = new URLSearchParams(new URL(trailerUrl).search).get('v') || undefined;

    const iframeUrl = `https://www.youtube.com/embed/${videoId}?controls=0&showinfo=0&rel=0&autoplay=1&loop=1&playlist=${videoId}&mute=1`;

    const iframe = document.getElementById('player-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframeUrl;
    }

    // Simulate video end after 30 seconds (as YouTube's autoplay does not stop automatically)
    const timeout = setTimeout(() => {
      onEnd();
    }, 30000);

    return () => clearTimeout(timeout); // Clean up the timeout when component unmounts
  }, [trailerUrl, onEnd]);

  return (
    <div className="video-container mb-4">
      <div className="video-foreground">
        <iframe
          id="player-iframe"
          src=""
          frameBorder="0"
          allow="autoplay"
          allowFullScreen
        />
      </div>
    </div>
  );
};

const Game: React.FC = () => {
  const [timeline, setTimeline] = useState<Movie[]>([movies[0]]);  // Start with one movie as reference
  const [round, setRound] = useState(1);  // Current round
  const [availableMovies, setAvailableMovies] = useState<Movie[]>(movies.slice(1));  // Movies not yet placed
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null);  // Current movie trailer playing
  const [score, setScore] = useState(0);  // Player score

  useEffect(() => {
    // Randomly pick a movie at the start of each round
    if (availableMovies.length > 0) {
      const nextMovie = getRandomMovie(availableMovies);
      setCurrentMovie(nextMovie);
    }
  }, [round, availableMovies]);

  const handlePlacement = (position: 'before' | 'after' | 'between', betweenIndexes?: [number, number]) => {
    if (!currentMovie) return;

    let newTimeline = [...timeline];
    let isCorrectPlacement = true;

    if (position === 'before') {
      // Check if placing the current movie before the first movie is correct
      isCorrectPlacement = currentMovie.year <= timeline[0].year;
      if (isCorrectPlacement) {
        newTimeline = [currentMovie, ...timeline];
      }
    } else if (position === 'after') {
      // Check if placing the current movie after the last movie is correct
      isCorrectPlacement = currentMovie.year >= timeline[timeline.length - 1].year;
      if (isCorrectPlacement) {
        newTimeline = [...timeline, currentMovie];
      }
    } else if (position === 'between' && betweenIndexes) {
      const [beforeIndex, afterIndex] = betweenIndexes;
      // Check if placing the current movie between two specific movies is correct
      isCorrectPlacement =
        currentMovie.year >= timeline[beforeIndex].year &&
        currentMovie.year <= timeline[afterIndex].year;
      if (isCorrectPlacement) {
        newTimeline = [
          ...timeline.slice(0, beforeIndex + 1),
          currentMovie,
          ...timeline.slice(afterIndex),
        ];
      }
    }

    if (isCorrectPlacement) {
      setTimeline(newTimeline);
      updateScore(newTimeline);
    }

    // Move to the next round regardless of correctness
    setAvailableMovies(availableMovies.filter(movie => movie.name !== currentMovie.name));
    setRound(round + 1);
  };

  const handleTrailerEnd = () => {
    // Automatically trigger the next trailer
    if (availableMovies.length > 0) {
      const nextMovie = getRandomMovie(availableMovies);
      setCurrentMovie(nextMovie);
    }
  };

  const updateScore = (newTimeline: Movie[]) => {
    let newScore = 0;
    for (let i = 1; i < newTimeline.length; i++) {
      if (newTimeline[i].year >= newTimeline[i - 1].year) {
        newScore++;
      }
    }
    setScore(newScore);
  };

  const colorClasses = [
    'from-1-color-400 to-1-color-600',
    'from-2-color-400 to-2-color-600',
    'from-3-color-400 to-3-color-600',
    'from-4-color-400 to-4-color-600',
    'from-5-color-400 to-5-color-600',
    'from-6-color-400 to-6-color-600',
    'from-7-color-400 to-7-color-600',
    'from-8-color-400 to-8-color-600',
    'from-9-color-400 to-9-color-600',
    'from-10-color-400 to-10-color-600',
  ];

  const renderPlacementOptions = () => {
    return (
      <div className="flex justify-center items-center space-x-4 mt-6">
        <button
          onClick={() => handlePlacement('before')}
          className="bg-gray-500 text-white p-2 rounded text-sm font-bold shadow-lg hover:bg-gray-700 transition"
        >
          Place it here
        </button>
        {timeline.map((movie, index) => (
          <React.Fragment key={index}>
            <div className={`bg-gradient-to-br ${colorClasses[index % colorClasses.length]} p-2 rounded text-white shadow-lg text-center w-32`}>
              {movie.name} ({movie.year})
            </div>
            {index < timeline.length - 1 && (
              <button
                onClick={() => handlePlacement('between', [index, index + 1])}
                className="bg-gray-500 text-white p-2 rounded text-sm font-bold shadow-lg hover:bg-gray-700 transition"
              >
                Place it here
              </button>
            )}
          </React.Fragment>
        ))}
        <button
          onClick={() => handlePlacement('after')}
          className="bg-gray-500 text-white p-2 rounded text-sm font-bold shadow-lg hover:bg-gray-700 transition"
        >
          Place it here
        </button>
      </div>
    );
  };

  return (
    <div className="p-4 text-white">
      <h1 className="text-6xl font-bold mb-4">Chronofilm 🎬</h1>

      {currentMovie && (
        <div className="mb-6">
          <YouTubeTrailer trailerUrl={currentMovie.trailerUrl} onEnd={handleTrailerEnd} />
        </div>
      )}
      <p className="mb-2 text-lg">Round: {round}/20</p>
      <p className="mb-4 text-lg">Build a timeline with 10 movies in the correct order!</p>
      <h2 className="mt-8 text-2xl font-bold">Your Timeline</h2>

      {renderPlacementOptions()}

      <p className="mt-4 text-xl">Score: {score}</p>
    </div>
  );
};

export default Game;
