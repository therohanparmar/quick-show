import axios from "axios";
import Movie from '../models/Movie.js';
import Show from '../models/Show.js';

// API to get now playing movies from TMDB API
export const getNowPlayingMovies = async (req, res) => {

    try {

        const {data} = await axios.get(
            'https://api.themoviedb.org/3/movie/now_playing',
            {
                headers: {Authorization: `Bearer ${process.env.TMDB_API_KEY}`}
            }
        );

        const movies = data.results;

        res.json({success: true, movies: movies});

    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }

}

// API to add a new show to the database
export const addShow = async (req, res) => {

    try {

        const {movieId, showsInput, showPrice} = req.body;

        let movie = await Movie.findById(movieId);

        if (!movie) {
            // Fetch movie details and credits from TMDB databse
            const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
                axios.get(
                    `https://api.themoviedb.org/3/movie/${movieId}`,
                    {
                        headers: {Authorization: `Bearer ${process.env.TMDB_API_KEY}`}
                    }
                ),
                axios.get(
                    `https://api.themoviedb.org/3/movie/${movieId}/credits`,
                    {
                        headers: {Authorization: `Bearer ${process.env.TMDB_API_KEY}`}
                    }
                )
            ])

            const movieApiData = movieDetailsResponse.data;
            const movieCreditData = movieCreditsResponse.data;

            const movieDetails = {
                _id: movieId,
                title: movieApiData.title,
                overview: movieApiData.overview,
                poster_path: movieApiData.poster_path,
                backdrop_path: movieApiData.backdrop_path,
                genres: movieApiData.genres,
                casts: movieCreditData  .cast,
                release_date: movieApiData.release_date,
                original_language: movieApiData.original_language,
                tagline: movieApiData.tagline || '',
                runtime: movieApiData.runtime,
                vote_average: movieApiData.vote_average
            }

            // Add movie to the database
            movie = await Movie.create(movieDetails);

        }

        const showsToCreate = [];
        showsInput.forEach(show => {
            const showDate = show.date;
            show.time.forEach((time) => {
                const dateTimeString = `${showDate}T${time}`;
                showsToCreate.push({
                    movie: movieId,
                    showDateTime: new Date(dateTimeString),
                    showPrice: showPrice,
                    occupiedSeats: {},
                })
            })
        });

        if (showsToCreate.length > 0){
            await Show.insertMany(showsToCreate);
        }

        res.json({success: true, message: "Show added successfully"});


    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message});
    }
}