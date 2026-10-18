

let songs = [];
try {
    const response = await fetch('./songs.json');
    if (!response.ok) {
        throw new Error(`Failed to load songs.json: ${response.status} ${response.statusText}`);
    }
    const songFile = await response.json();
    songs = songFile.songs;
} catch (error) {
    console.error('Error loading songs json file.', error);
    throw error;
}

const randomBtn = document.getElementById('random');
const prevBtn = document.getElementById('prevButton');
const playPauseBtn = document.getElementById('playPauseButton');
const nextBtn = document.getElementById('nextButton');
const repeatBtn = document.getElementById('repeat');
const volumeSlider = document.getElementById('volumeSlider');

randomBtn.addEventListener('click', toggleRandom);
prevBtn.addEventListener('click', playPreviousSong);
playPauseBtn.addEventListener('click', togglePlayPause);
nextBtn.addEventListener('click', playNextSong);
repeatBtn.addEventListener('click', toggleRepeat);
volumeSlider.addEventListener('input', volumeSliderChange);

//window.onload(() => buildSongList()); //TODO look for a nicer way
buildSongList(); // Module

let isRandom = false;
let isRepeat = false;
let isPlaying = false;
let isMuted = false;

songs
const howl = new Howl({
    src: songs[0].file,
    html5: true,
});

howl.on("load", howlerLoaded);


function toggleRandom() {
    isRandom = !isRandom;
}

function toggleRepeat() {
    isRepeat = !isRepeat;
    howl.loop(isRepeat);
}

function toggleMute() {
    isMuted = !isMuted;
    howl.mute(isMuted);
}

function togglePlayPause() {
    isPlaying = !isPlaying;
    if (isPlaying)
        howl.play();
    else howl.pause();
}

//Gets Previous or Next song on the list based on the parameter given
//@beforeOrAfter has to be either "Before" for previous song or "After" for the next song
// A song must be active
function getSongAt(beforeOrAfter = "Before") {
    if (beforeOrAfter.trim().toLowerCase() === "before") {

    } else if (beforeOrAfter.trim().toLowerCase() === "after") {

    } else throw new Error("Invalid parameter");

    let activeSongIndex = songs.findIndex(song => song.file === howl._src);
    let nextSongIndex = activeSongIndex - 1;
    if (nextSongIndex < 0) {
        nextSongIndex = songs.length;
    }


}

function playNextSong() {

}

function playPreviousSong() {
    let previousSong = getSongAt("before");
    howl.stop();
    //howl.src = songs[nextSongIndex].file;
    howl = new Howl()
    {
        src = previousSong;
    }
    howl.play();

}

function howlerLoaded() {
    playPauseBtn.classList.remove('disabled');
    playPauseBtn.removeAttribute('disabled');

    howl.play();
}

function volumeSliderChange() {
    const volumeSpan = document.getElementById('volumeValue');
    const volume = volumeSlider.value;

    howl.volume(volume);
    volumeSpan.textContent = volume;
}

function progressBarChange() {
    const progressBar = document.getElementById('progressSlider');
    howl.pos //https://goldfirestudios.com/howler-js-modern-web-audio-javascript-library
}


function buildSongList() {
    const songListElement = document.querySelector(".cards-container");
    songs.forEach(song => {
        let cardStr = `                
                <div class="card">
                    <img class="coverArt" src="${song.picture}" alt="Cover Art">
                    <span class="songName">${song.name}</span>
                    <span class="author">${song.author}</span>
                </div>`;

        songListElement.insertAdjacentHTML('beforeend', cardStr);
    });
}

function playSong() {

}
