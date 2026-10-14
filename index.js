import { Howl, Howler } from 'howler';

const songs = JSON.parse('songs.json').songs;

const randomBtn = document.getElementById('random');
const prevBtn = document.getElementById('prevButton');
const playPauseBtn = document.getElementById('playPauseButton');
const nextBtn = document.getElementById('nextButton');
const repeatBtn = document.getElementById('repeat');

randomBtn.addEventListener('click', toggleRandom);
prevBtn.addEventListener('click', playPreviousSong);
playPauseBtn.addEventListener('click', togglePlayPause);
nextBtn.addEventListener('click', playNextSong);
repeatBtn.addEventListener('click', toggleRepeat);


let isRandom = false;
let isPlaying = false;

let howl = new Howl({
    src: ['songs/Pufino - Fantasy (freetouse.com).mp3'],
    html5: true,
});

function toggleRandom() {
    isRandom = !isRandom;
}

function playPreviousSong() {
    let activeSongIndex = songs.findIndex(song => song.file === howl._src);
    if (songs[activeSongIndex - 1])
        
}
