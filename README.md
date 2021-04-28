# CS5331-Project-2: SONG GENRE VISUALIZATION

## Video
[Video Link Here](https://www.youtube.com/watch?v=N_5CfvvKGwg&feature=youtu.be)

![Alt text](https://github.com/Nhatmusic/CS5331-Project-2/blob/master/Dataset/p2.Le.Nguyen.Sokolov.gif)
Link: https://nhatmusic.github.io/CS5331-Project-2/

## Dataset:
- The FMA provides audio from 106,574 tracks from 16,341 artists and 14,854 albums, arranged in a hierarchical taxonomy of 161 genres. It provides full-length and high-quality audio, pre-computed features, together with track- and user-level metadata, tags, and free-form text such as biographies.

- In our project, We mostly focus on the audio features, these audio features are contained in echonest.csv with 13127 songs. We will discuss about the meaning of the audio features we use in our project as following:

- Note: the value of all the features (except tempo) is in the range 0.0 -1.0.
1. Instrumentalness: This value represents the amount of vocals (or lack thereof) in the song. The closer it is to 1.0, the more instrumental the song is.
2. Acousticness: This value describes how acoustic a song is. A score of 1.0 means the song is most likely to be an acoustic one.
3. Liveness: This value describes the probability that the song was recorded with a live audience. According to the official documentation “a value above 0.8 provides strong likelihood that the track is live”.
4. Speechiness: “Speechiness detects the presence of spoken words in a track”. If the speechiness of a song is above 0.66, it is probably made of spoken words, a score between 0.33 and 0.66 is a song that may contain both music and words, and a score below 0.33 means the song does not have any speech.
5. Energy: “(energy) represents a perceptual measure of intensity and activity. Typically, energetic tracks feel fast, loud, and noisy”.
6. Danceability: “Danceability describes how suitable a track is for dancing based on a combination of musical elements including tempo, rhythm stability, beat strength, and overall regularity. A value of 0.0 is least danceable and 1.0 is most danceable”.
7. Valence: “A measure from 0.0 to 1.0 describing the musical positiveness conveyed by a track. Tracks with high valence sound more positive (e.g. happy, cheerful, euphoric), while tracks with low valence sound more negative (e.g. sad, depressed, angry)”.
8. Tempo: The tempo determines the performance speed of the music. So when you count how many beats are in one minute of a song played at a specific tempo, you can quickly determine the Beats Per Minute or BPM.
Source of audio features collected in Spotify (https://towardsdatascience.com/is-my-spotify-music-boring-an-analysis-involving-music-data-and-machine-learning-47550ae931de)

# Data-processing:
- Echonest.csv does not have all the information we need like song title, genre, duration, etc. Therefore, we merge the data from tracks.csv to get those information using Excel's function and combine into one dataset in csv file to use for the project.

# Apply T-SNE:
- We are so excited to learn about T-SNE, t-Distributed Stochastic Neighbor Embedding is a (prize-winning) technique for dimensionality reduction that is particularly well suited for the visualization of high-dimensional datasets.
- We decided to use the T-Sne library in Javascript (https://github.com/karpathy/tsnejs)
- However, we are unable to process all 13,127 datapoints (songs) (each has 8-dimensions) in web browser, we tried process the wholde dataset in Node.js also. Finally, we decided to use the first 8000 songs in our dataset and we think it preserved much information needed for our visualization.
![Alt text](https://github.com/Nhatmusic/CS5331-Project-2/blob/348a1575b55b4dbbd9da1c4d4489ec7ddd20a666/Dataset/tsne.gif)
- The above image is the test example of processing 500 datapoints using T-SNE. However, with 8000 datapoints, it takes about 30 minutes (we used webworker) to complete so we chose to pre-computed the output of tsne.

# Functionality:
1. Filter and Brush in Parallel Coordinate Graph: User can choose the filter by year or genre to display the data. Brush to the specific range in each dimension to observe the trend.


2. Link between two graphs via mouseover event.

3. No refresh since we apply enter, exit and update in our svg elements.

4. Zoom function applied in ScatterPlot.

5. Display specific genre when mouseover in colorlegend element.

# Limitation and Future Work:
1. Currently, we are unable to visualize the whole 13,127 songs, however, we will find the way to reduce the cost when working with t-sne.

2. We want to visualize each iteration when computing the t-sne so it may provide more visible information how t-sne works.

3. In the future, we will implement sample song when users click to color legend represented for each genre. It's really useful since users will get more sense about how genre is defined.


# Team work and member contribution:
This is the first time we have worked together as a team. The great thing is that all the team members were responsible for their tasks as well as active in communication.
The task completed by each member is described as following:
- Data cleaning & pre-processing - Nhat, Hao, Darien
- Design & planning - Nhat, Hao, Darien
- t-SNE Computation - Nhat, Darien
- Parallel Coordinate Graph; initial features - Hao
- t-SNE Scatterplot; initial features - Nhat
- Parallel Coordinate Graph; mouseover and context info - Hao, Darien
- Parallel Coordinate Graph; filter by genre & year - Hao
- Page Layout - Nhat
- Scatterplot; zoom - Nhat
- Parallel Coordinate Graph; axes dragging and brush filter features - Hao
- Graph linking; filter by genre & year - Hao, Darien
- Graph linking: mouseover events and context info - Hao, Darien
- Top Genre coloring - Nhat, Hao, Darien
- Legend for Genre coloring - Nhat, Hao, Darien
- Legend for Genre coloring; mouseover events - Hao
- Scatterplot; context info on mouseover - Nhat
- Report on readme: Nhat, Darien


# Interesting Findings and Observation:

We are still confused about how genres are defined in each dataset. Depending on the variance of the value of each audio features, it's hard to define the genres close to each other like Rock, Electronic, Hip-Hop. However, looking the graph below, it's clearly that Rock (Green) has the significant higher value of energy and valence comparing with the Folk (Orange)

![Alt text](https://github.com/Nhatmusic/CS5331-Project-2/blob/master/Dataset/rock-folk.JPG)

When observe Electronic genre, we see that instrumentalness, liveness, and speechiness seem not to be changed variously. For instrumentalness, they focuses around 0.8 and 1, which mean fully instrumental. For speechiness, they are aournd 0 to 0.2 to show that not much words in this genre. Finally, the liveness is in [0,0.4] means almost songs are not recorded live.  
![Electronic](https://github.com/Nhatmusic/CS5331-Project-2/blob/master/Dataset/Electronic.png)



