
# Chronofilm 🎬

Chronofilm is an interactive web game where users must place movies in chronological order based on their release year. Players are shown a trailer for a movie and must decide if the next movie’s trailer belongs before, after, or in between the movies already placed on the timeline. The game involves building a timeline with 10 movies in the correct order across 20 rounds.

## Features

- Interactive movie chronology game using trailers from YouTube.
- Randomly selected movie trailers with 30 seconds of playtime.
- Players can place movies before, after, or between other movies based on their release year.
- Mute/Unmute button for trailer sound control.
- Beautifully styled timeline with colored cards representing each movie.
- Auto transitions to the next round after correct placement or after 30 seconds.
- Tracks player score based on correct placements.
- Game starts with a reference movie already placed in the timeline.

## Technology Stack

- **Next.js**: Used as the primary framework for server-side rendering and routing.
- **React.js**: For building the interactive user interface.
- **Tailwind CSS**: For efficient and responsive styling.
- **TypeScript**: For type safety and better development experience.
- **YouTube IFrame API**: For embedding and controlling YouTube trailers.

## How to Run Locally

Follow these steps to set up the project on your local machine:

### Prerequisites
- Node.js (v14.x or higher) and npm (v6.x or higher) must be installed on your machine.
- Git to clone the repository.

### Steps to run the project

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/chronofilm.git
   cd chronofilm
   ```

2. **Install dependencies:**
   Run the following command to install all the necessary dependencies:
   ```bash
   npm install
   ```

3. **Run the development server:**
   Start the local development server by running the following command:
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Once the development server is running, open your browser and go to:
   ```
   http://localhost:3000
   ```

   You should now be able to see the Chronofilm game in action!

### Important Files
- **`app/page.tsx`**: Main game logic, trailer rendering, and movie placement functionality.
- **`data/movieData.ts`**: Contains the list of movies used in the game.
- **`global.css`**: Custom Tailwind CSS configurations and global styles.
- **`tailwind.config.js`**: Tailwind configuration, including custom colors for movie cards.

### Customization
If you want to add more movies to the game or change the list of movies, you can modify the `movieData.ts` file in the `data` directory by adding your movies in the following format:

```ts
export const movies = [
  {
    name: 'Movie Title',
    year: 2000,
    trailerUrl: 'https://www.youtube.com/watch?v=example',
  },
  // Add more movies here...
];
```

## License

This project is licensed under the MIT License.
