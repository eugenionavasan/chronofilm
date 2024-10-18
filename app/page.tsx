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
    <div className="video-container">
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
  const [availableMovies, setAvailableMovies] = useState<Movie[]>(movies.slice(1));  // Movies not yet placed (excluding the first one)
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

  const renderPlacementOptions = () => {
    if (!timeline.length) {
      return (
        <>
          <button onClick={() => handlePlacement('before')}>Place Before</button>
          <button onClick={() => handlePlacement('after')}>Place After</button>
        </>
      );
    }

    return (
      <>
        <button onClick={() => handlePlacement('before')}>Place Before ({timeline[0].year})</button>
        {timeline.map((movie, index) => {
          if (index < timeline.length - 1) {
            const nextMovie = timeline[index + 1];
            return (
              <button
                key={index}
                onClick={() => handlePlacement('between', [index, index + 1])}
              >
                Place Between {movie.year} and {nextMovie.year}
              </button>
            );
          }
          return null;
        })}
        <button onClick={() => handlePlacement('after')}>Place After ({timeline[timeline.length - 1].year})</button>
      </>
    );
  };

  return (
    <div>
      <h1>Movie Chronology Game</h1>
      <p>Round: {round}/20</p>
      <p>Build a timeline with 10 movies in the correct order!</p>

      {currentMovie && (
        <>
          <YouTubeTrailer trailerUrl={currentMovie.trailerUrl} onEnd={handleTrailerEnd} />
          <div>{renderPlacementOptions()}</div>
        </>
      )}

      <h2>Your Timeline</h2>
      <ul>
        {timeline.map((movie, index) => (
          <li key={index}>
            {movie.name} ({movie.year})
          </li>
        ))}
      </ul>

      <p>Score: {score}</p>
    </div>
  );
};

export default Game;
