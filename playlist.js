import { formatTime } from "./helper.js";
import { playSong } from "./player.js";

const SORT_MODE =
{
    NAME: "name",
    AUTHOR: "author",
    DURATION: "duration"
};

let songs = [];

const songListElement = document.querySelector(".cards-container");

export function initPlaylist(songList) {
    songs = songList;

    songListElement.addEventListener('click', handleSongListClick);

    document.querySelectorAll('.sortBar button').forEach(btn => {
        btn.addEventListener('click', () => {
            const asc = btn.dataset.order !== 'asc';           // flip direction on each click
            document.querySelectorAll('.sortBar button').forEach(b => {
                b.classList.remove('toggled');
                delete b.dataset.order;
            });
            btn.classList.add('toggled');
            btn.dataset.order = asc ? 'asc' : 'desc';

            renderSongList(btn.dataset.sort, btn.dataset.order);
        });
    });

    renderSongList();
}

function buildSongList() {
    songListElement.innerHTML = "";

    songs.forEach((song, index) => {
        let cardStr = `                
                <div class="card" data-index="${index}" >
                    <img class="coverArt" src="${song.picture}" alt="Cover Art">
                    <span class="songName">${song.name}</span>
                    <span class="author">${song.author}</span>
                    <span class="duration">${formatTime(song.duration)}</span>
                </div>`;

        songListElement.insertAdjacentHTML('beforeend', cardStr);
    });
}

function handleSongListClick(event) {
    const card = event.target.closest('.card');
    if (card) {
        let index = Number(card.dataset.index);
        playSong(index);
    }
}

function setTotalSongNumber() {
    let totalSongNumberLabel = document.getElementById('totalSongNumber');
    totalSongNumberLabel.textContent = `${songs.length} canciones`;
}

// sortMode : SORT_MODE
function sortSongList(sortMode, sortOrder) {
    switch (sortMode) {
        case 'name':
            songs.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'author':
            songs.sort((a, b) => a.author.localeCompare(b.author));
            break;
        case 'duration':
            songs.sort((a, b) => (a.duration - b.duration));
            break;
    }

    if (sortOrder !== 'desc')
        songs.reverse();
}

function renderSongList(sortMode = SORT_MODE.NAME, sortOrder = 'desc') {
    sortSongList(sortMode, sortOrder);
    buildSongList();
    setTotalSongNumber();
}
