import { getRandomInt, formatTime } from "./helper.js";

let songs;
try {
    const response = await fetch('./songs.json');
    if (!response.ok) {
        throw new Error(`Failed to load songs.json: ${response.status} ${response.statusText}`);
    }
    const songFile = await response.json();
    songs = songFile.songs;
} catch (error) {
    console.error('Error loading songs json file.', error);
    //throw error;
    songs = [];
}

const randomBtn = document.getElementById('random');
const prevBtn = document.getElementById('prevButton');
const playPauseBtn = document.getElementById('playPauseButton');
const nextBtn = document.getElementById('nextButton');
const repeatBtn = document.getElementById('repeat');
const volumeSlider = document.getElementById('volumeSlider');
const muteLabel = document.getElementById('muteVolume');
const progressSlider = document.getElementById('progressSlider');


randomBtn.addEventListener('click', toggleRandom);
prevBtn.addEventListener('click', playPreviousSong);
playPauseBtn.addEventListener('click', togglePlayPause);
nextBtn.addEventListener('click', playNextSong);
repeatBtn.addEventListener('click', toggleRepeat);
volumeSlider.addEventListener('input', volumeSliderChange);
muteLabel.addEventListener('click', toggleMute);
progressSlider.addEventListener('input', progressBarChange);

const REFRESH_INTERVAL_MS = 250;
setInterval(updateCurrentProgressSongInterval, REFRESH_INTERVAL_MS);


//window.onload(() => buildSongList()); //TODO look for a nicer way
buildSongList(); // Module
setTotalSongNumber();

let isRandom = false;
let isRepeat = false;
let isMuted = false;
let howl; //Howl type
let currentSongIndex = 0;


function toggleRandom() {
    isRandom = !isRandom;
}

function toggleRepeat() {
    isRepeat = !isRepeat;

    if (howl)
        howl.loop(isRepeat);
}

function toggleMute() {
    isMuted = !isMuted;
    muteLabel.setAttribute('aria-pressed', isMuted);
    muteLabel.textContent = isMuted ? '🔇' : '🔈';

    if (howl)
        howl.mute(isMuted);

}

function togglePlayPause() {
    if (!howl) {
        playSong(currentSongIndex);
        return;
    }

    if (!howl.playing())
        howl.play();
    else howl.pause();

    updatePlayPauseButton();
}

function updatePlayPauseButton() {
    playPauseBtn.textContent = howl.playing() ? '⏸️' : '▶️';
}

//Gets Previous or Next song index on the list based on the parameter given
//If @random is true, returns a random index from the list 
//@beforeOrAfter has to be either "Before" for previous song or "After" for the next song
// A song must be active otherwise returns the first song
function getSongIndexFor(beforeOrAfter = "Before", random) {
    let nextSongIndex;

    if (random)
        return getRandomInt(0, songs.length);

    if (beforeOrAfter.trim().toLowerCase() === "before") {
        //nextSongIndex = activeSongIndex - 1;
        nextSongIndex = Number(currentSongIndex) - 1;

    } else if (beforeOrAfter.trim().toLowerCase() === "after") {
        //nextSongIndex = activeSongIndex + 1;
        nextSongIndex = Number(currentSongIndex) + 1;
    } else throw new Error("Invalid parameter");

    if (nextSongIndex < 0) {
        nextSongIndex = songs.length - 1;
    }
    if (nextSongIndex >= songs.length) {
        nextSongIndex = 0;
    }

    return nextSongIndex ?? 0;
}

function playNextSong() {
    let nextSongIndex = getSongIndexFor("after", isRandom);
    playSong(nextSongIndex);
}

function playPreviousSong() {
    let previousSongIndex = getSongIndexFor("before", isRandom);
    playSong(previousSongIndex);
}

function howlerLoaded() {
    //playPauseBtn.classList.remove('disabled');
    //playPauseBtn.removeAttribute('disabled');
    setTotalDuration();
}

function howlerLoadError() {
    console.error("Error loading howler"); // TODO get err message from howler
}

function howlerPlayError() {
    console.error("Error playing howler."); // TODO get err message from howler
}

function volumeSliderChange() {
    const volumeSpan = document.getElementById('volumeValue');
    const volume = Number(volumeSlider.value);

    if (howl)
        howl.volume(volume);

    volumeSpan.textContent = Math.round(volume * 100) + '%';
    volumeSlider.style.setProperty('--progress', (volumeSlider.value / volumeSlider.max * 100) + '%');
}

function buildSongList() {
    const songListElement = document.querySelector(".cards-container");
    songs.forEach((song, index) => {
        let cardStr = `                
                <div class="card" data-index="${index}" >
                    <img class="coverArt" src="${song.picture}" alt="Cover Art">
                    <span class="songName">${song.name}</span>
                    <span class="author">${song.author}</span>
                </div>`;

        //<span class="duration">${formatTime(song.duration)}</span>
        songListElement.insertAdjacentHTML('beforeend', cardStr);
    });

    songListElement.addEventListener('click', (event) => {
        const card = event.target.closest('.card');
        if (card) {
            let index = Number(card.dataset.index);
            playSong(index);
        }
    })
}



function playSong(songIndex) {
    let song = songs[songIndex];

    if (!song)
        return;

    if (howl)
        howl.unload();

    howl = new Howl(
        {
            src: song.file,
            volume: Number(volumeSlider.value),
            loop: isRepeat,
            mute: isMuted,
            onend: playNextSong,
            onload: howlerLoaded,
            onloaderror: howlerLoadError,
            onplayerror: howlerPlayError
        });

    howl.play();
    currentSongIndex = songIndex;
    resetProgressBar();
    updateNowPlaying(song);
    updateNowPlayingCard(currentSongIndex);
    updatePlayPauseButton();
    //setTotalDuration(); is called after song is loaded
}

function updateNowPlaying(song) {
    document.querySelectorAll('.currentCover').forEach(element => element.src = song.picture);
    document.querySelectorAll('.currentSong').forEach(element => element.textContent = song.name);
    document.querySelectorAll('.currentAuthor').forEach(element => element.textContent = song.author);
    document.querySelectorAll('.currentSongInfo').forEach(element => element.classList.add('.active'));

    document.getElementById('currentlyPlaying').hidden = false;
}

function updateNowPlayingCard(index) {
    document.querySelectorAll(".playing")
        .forEach(elem => elem.classList.remove("playing"));

    const card = document.querySelectorAll(".card")[index];
    card.classList.add("playing");
}


function setTotalDuration() {
    const progressSlider = document.getElementById('progressSlider');
    const durationSpan = document.getElementById("totalTime");
    let currentSongDuration = howl.duration();

    durationSpan.textContent = formatTime(currentSongDuration);
    progressSlider.max = currentSongDuration;
}

function setTotalSongNumber() {
    let totalSongNumberLabel = document.getElementById('totalSongNumber');
    totalSongNumberLabel.textContent = `${songs.length} canciones`;
}

function updateCurrentProgressSongInterval() {
    const currentTimeSpan = document.getElementById('currentTime');

    if (!howl || !howl.playing())
        return;

    const currentPosition = howl.seek();
    progressSlider.value = currentPosition;
    progressSlider.style.setProperty('--progress', (progressSlider.value / progressSlider.max * 100) + '%');

    currentTimeSpan.textContent = formatTime(currentPosition);
}

function progressBarChange() {
    const currentTimeSpan = document.getElementById('currentTime');

    if (!howl || !howl.playing()) {
        resetProgressBar();
        return;
    }

    const currentPosition = Number(progressSlider.value);
    howl.seek(currentPosition);
    currentTimeSpan.textContent = formatTime(currentPosition);

}

function resetProgressBar() {
    const currentTimeSpan = document.getElementById('currentTime');

    progressSlider.value = 0;
    currentTimeSpan.textContent = formatTime(0);
}