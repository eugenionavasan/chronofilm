'use client';

import React, { useState, useEffect, useRef } from 'react';
import { movies, Movie } from '@/data/movieData'; // Import the movie data

const getRandomMovie = (availableMovies: Movie[]): Movie => {
  const randomIndex = Math.floor(Math.random() * availableMovies.length);
  return availableMovies[randomIndex];
};

// Define the YT interface for YouTube player
interface YT {
  Player: {
    new (elementId: string, options: {
      videoId: string | undefined;
      playerVars: {
        autoplay: 1;
        modestbranding: 1;
        controls: 0;
        rel: 0;
        mute: 1 | 0; // Expecting either 1 (muted) or 0 (unmuted)
      };
      events: {
        onReady: (event: { target: { playVideo: () => void } }) => void;
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

const YouTubeTrailer: React.FC<{ trailerUrl: string; unmuteVideo: boolean; onEnd: () => void }> = ({ trailerUrl, unmuteVideo, onEnd }) => {
  const [isMuted, setIsMuted] = useState(unmuteVideo); // Track mute state

  useEffect(() => {
    const videoId = new URLSearchParams(new URL(trailerUrl).search).get('v') || undefined;

    const iframeUrl = `https://www.youtube.com/embed/${videoId}?controls=0&showinfo=0&rel=0&autoplay=1&mute=${isMuted ? 1 : 0}`;

    const iframe = document.getElementById('player-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframeUrl;
    }

    // Simulate video end after 30 seconds
    const timeout = setTimeout(() => {
      onEnd();
    }, 40000);

    return () => clearTimeout(timeout);
  }, [trailerUrl, isMuted, onEnd]);

  const toggleMute = () => {
    setIsMuted((prevState) => !prevState); // Toggle between mute and unmute
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0">
        <iframe
          id="player-iframe"
          src=""
          frameBorder="0"
          allow="autoplay"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <button
          onClick={toggleMute}
          className={`${isMuted ? "unmute-button" : "mute-button"} text-sm`}
        >
          {isMuted ? "Unmute 🔊" : "Mute 🔇"}
        </button>
      </div>
    </div>
  );
};

const Game: React.FC = () => {
  const [timeline, setTimeline] = useState<Movie[]>([]);  // Start empty, will add reference on game start
  const [round, setRound] = useState(0);  // Start at 0 to indicate game hasn't started
  const [availableMovies, setAvailableMovies] = useState<Movie[]>(movies);  // All movies available initially
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null);  // Current movie trailer playing
  const [score, setScore] = useState(0);  // Player score
  const [gameStatus, setGameStatus] = useState<"playing" | "win" | "lose">("playing");  // Game status
  const timelineRef = useRef<HTMLDivElement>(null);

  // Function to scroll to the start of the timeline if the first movie is out of view
  const scrollToVisible = () => {
    const timelineEl = timelineRef.current;
    if (timelineEl) {
      const firstButton = timelineEl.querySelector('button'); // Get the first button (Insert here)
      if (firstButton) {
        const buttonRect = firstButton.getBoundingClientRect();
        const timelineRect = timelineEl.getBoundingClientRect();

        if (buttonRect.left < timelineRect.left) {
          timelineEl.scrollTo({ left: 0, behavior: 'smooth' }); // Scroll to the beginning if the first button is hidden
        }
      }
    }
  };

  // Function to start the game
  const startGame = () => {
    const firstMovie = getRandomMovie(movies);
    setTimeline([firstMovie]);  // Add the random first movie as reference in the timeline
    setAvailableMovies(movies.filter(movie => movie.name !== firstMovie.name));  // Remove reference movie from available movies
    setRound(1);  // Start at round 1
    setScore(0);  // Reset score
    setGameStatus("playing");  // Reset game status
    const nextMovie = getRandomMovie(movies.filter(movie => movie.name !== firstMovie.name));
    setCurrentMovie(nextMovie);  // Set the next movie to play
  };

  useEffect(() => {
    if (round > 0 && availableMovies.length > 0 && gameStatus === "playing") {
      const nextMovie = getRandomMovie(availableMovies);
      setCurrentMovie(nextMovie);  // Set the next movie to play
    }

    // Win condition: score of 10
    if (score >= 10) {
      setGameStatus("win");
    }

    // Game over condition: reached 20 rounds without winning
    if (round >= 21 && score < 10) {
      setGameStatus("lose");
    }
  }, [round, availableMovies, score, gameStatus]);

  useEffect(() => {
    // Scroll to make sure the first item is visible
    scrollToVisible();
  }, [timeline]); // Run every time the timeline updates

  // Function to handle placement logic
  const handlePlacement = (position: 'before' | 'after' | 'between', betweenIndexes?: [number, number]) => {
    if (!currentMovie || gameStatus !== "playing") return;

    let newTimeline = [...timeline];
    let isCorrectPlacement = true;

    if (position === 'before') {
      isCorrectPlacement = currentMovie.year <= timeline[0].year;
      if (isCorrectPlacement) {
        newTimeline = [currentMovie, ...timeline];
      }
    } else if (position === 'after') {
      isCorrectPlacement = currentMovie.year >= timeline[timeline.length - 1].year;
      if (isCorrectPlacement) {
        newTimeline = [...timeline, currentMovie];
      }
    } else if (position === 'between' && betweenIndexes) {
      const [beforeIndex, afterIndex] = betweenIndexes;
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

      const nextMovie = getRandomMovie(availableMovies.filter(movie => movie.name !== currentMovie.name));
      setAvailableMovies(availableMovies.filter(movie => movie.name !== currentMovie.name));
      setCurrentMovie(nextMovie);
    }

    setRound(round + 1);
  };

  const handleTrailerEnd = () => {
    if (availableMovies.length > 0 && gameStatus === "playing") {
      const nextMovie = getRandomMovie(availableMovies.filter(movie => movie.name !== currentMovie?.name));
      setCurrentMovie(nextMovie);
      setRound(round + 1);
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
    // Check if the timeline has fewer than 5 movies, and center the content if true
    const isCentered = timeline.length < 5;
  
    return (
      <div
        className={`flex items-center space-x-4 overflow-x-visible py-2 w-full ${
          isCentered ? 'justify-center' : 'justify-start'
        }`}
      >
        <button
          onClick={() => handlePlacement('before')}
          className="bg-purple-500 text-white px-4 py-1 rounded-lg text-xs font-bold shadow-lg hover:bg-purple-600 transition flex-shrink-0"
        >
          Insert here
        </button>
        {timeline.map((movie, index) => (
          <React.Fragment key={index}>
            <div
              className={`bg-gradient-to-br ${colorClasses[index % colorClasses.length]} rounded text-white shadow-lg text-center w-32 h-32 flex items-center justify-center p-2`}
            >
              <span className="text-xs">{movie.name} ({movie.year})</span>
            </div>
            {index < timeline.length - 1 && (
              <button
                onClick={() => handlePlacement('between', [index, index + 1])}
                className="bg-purple-500 text-white px-4 py-1 rounded-lg text-xs font-bold shadow-lg hover:bg-purple-600 transition flex-shrink-0"
              >
                Insert here
              </button>
            )}
          </React.Fragment>
        ))}
        <button
          onClick={() => handlePlacement('after')}
          className="bg-purple-500 text-white px-4 py-1 rounded-lg text-xs font-bold shadow-lg hover:bg-purple-600 transition flex-shrink-0"
        >
          Insert here
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen p-4 text-white overflow-visible">
      <h1 className="text-4xl md:text-6xl font-bold mb-2 text-center absolute top-0 z-10 bg-opacity-100 bg-black py-2 w-full">
        Chronofilm 🎬
      </h1>

      {round === 0 ? (
        <div className="flex-grow flex justify-center items-center">
          <button onClick={startGame} className="bg-green-500 text-white px-8 py-4 text-3xl rounded-lg shadow-lg hover:bg-green-700 transition duration-300">
            Start Game! 😁
          </button>
        </div>
      ) : gameStatus === "win" ? (
        <div className="flex-grow flex flex-col justify-center items-center">
          <h2 className="text-4xl font-bold text-green-500 text-center">Move over, Scorsese! 🎥 There’s a new movie expert in town! 🍿✨</h2>
          <button onClick={startGame} className="bg-blue-500 text-white px-8 py-4 text-3xl rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 mt-6">
            Play Again
          </button>
        </div>
      ) : gameStatus === "lose" ? (
        <div className="flex-grow flex flex-col justify-center items-center">
          <h2 className="text-4xl font-bold text-red-500 text-center">Game Over! 🎬 Looks like it’s time for a movie marathon! 🍿 Better start brushing up! 📽️</h2>
          <button onClick={startGame} className="bg-blue-500 text-white px-8 py-4 text-3xl rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 mt-6">
            Play Again
          </button>
        </div>
      ) : (
        <div className="flex-grow flex flex-col">
          <div className="flex-grow relative" style={{ marginTop: '-50px', height: 'calc(80vh + 60px)', overflow: 'hidden' }}>
            {currentMovie && (
              <div style={{ pointerEvents: 'none', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                <YouTubeTrailer trailerUrl={currentMovie.trailerUrl} unmuteVideo={true} onEnd={handleTrailerEnd} />
              </div>
            )}
          </div>
          
          <div className="min-h-[20vh] flex flex-col justify-end mt-4" ref={timelineRef}>
            <h2 className="text-2xl font-bold">Your Timeline⏳</h2>
            <p className="mb-2 text-lg">Build a timeline with 10 movies in the correct order!</p>

            <div className="overflow-x-visible py-2">
              <div className="flex items-center space-x-4 justify-center">
                {renderPlacementOptions()}
              </div>
            </div>

            <div className="flex justify-between items-center mt-2">
              <p className="text-lg">Round: {round}/20</p>
              <p className="text-xl">Score: {score}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
