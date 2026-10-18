import { initPlayer } from "./player.js";
import { initPlaylist } from "./playlist.js";
import { initEqualizerControls } from "./equalizer.js";

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
    songs = [];
}

initPlayer(songs);
initPlaylist(songs);
initEqualizerControls();
