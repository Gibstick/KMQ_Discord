import * as ytdl from "ytdl-core";
import * as fs from "fs";
import * as _config from "../../config/app_config.json";
import * as mysql from "promise-mysql";
import { QueriedSong } from "types";
import * as path from "path";
let config: any = _config;

export async function clearPartiallyCachedSongs() {
    console.log("Clearing partially cached songs");
    if (!fs.existsSync(config.songCacheDir)) {
        return console.error("Song cache directory doesn't exist.");
    }
    let files: Array<string>;
    try {
        files = await fs.promises.readdir(config.songCacheDir);
    }
    catch (err) {
        return console.error(err);
    }

    const endingWithPartRegex = new RegExp("\\.part$");
    const partFiles = files.filter((file) => file.match(endingWithPartRegex));
    partFiles.forEach(async (partFile) => {
        try {
            await fs.promises.unlink(`${config.songCacheDir}/${partFile}`);
        }
        catch (err) {
            console.error(err);
        }
    })
    if (partFiles.length) {
        console.log(`${partFiles.length} stale cached songs deleted.`);
    }

}

const downloadSong = (id: string) => {
    let cachedSongLocation = path.join(config.songCacheDir, `${id}.mp3`);
    const tempLocation = `${cachedSongLocation}.part`;
    let cacheStream = fs.createWriteStream(tempLocation);
    const ytdlOptions = {
        filter: "audioonly" as const,
        quality: "highest"
    };

    return new Promise(async (resolve, reject) => {
        console.log(`Downloading ${id}`)
        try {
            //check to see if the video is downloadable
            await ytdl.getBasicInfo(`https://www.youtube.com/watch?v=${id}`);
        } catch (e) {
            resolve(`Failed to retrieve video metadata. error = ${e}`);
            return;
        }

        ytdl(`https://www.youtube.com/watch?v=${id}`, ytdlOptions)
            .pipe(cacheStream);
        cacheStream.on('finish', async () => {
            try {
                await fs.promises.rename(tempLocation, cachedSongLocation);
                console.log(`Downloaded ${id} successfully`);
                resolve();
            }
            catch (err) {
                reject(`Error renaming temp song file from ${tempLocation} to ${cachedSongLocation}. err = ${err}`);
            }
        })
        cacheStream.on("error", (e) => reject(e));
    })
}

(async () => {
    const db = await mysql.createPool({
        connectionLimit: 10,
        host: "localhost",
        user: config.dbUser,
        password: config.dbPassword
    });
    clearPartiallyCachedSongs();
    let query = `SELECT nome as name, name as artist, vlink as youtubeLink FROM kpop_videos.app_kpop INNER JOIN kpop_videos.app_kpop_group ON kpop_videos.app_kpop.id_artist = kpop_videos.app_kpop_group.id
    WHERE dead = "n" AND vtype = "main";`;
    let songs: Array<QueriedSong> = await db.query(query);
    let downloadCount = 0;
    console.log("total songs: " + songs.length);
    for (let song of songs) {
        if (!fs.existsSync(path.join(config.songCacheDir, `${song.youtubeLink}.mp3`))) {
            console.log(`Downloading song: '${song.name}' by ${song.artist} | ${song.youtubeLink}`);
            try {
                await downloadSong(song.youtubeLink);
                downloadCount++;
            }
            catch (e) {
                console.log("error downloading song: " + e);
            }
        }
    }
    console.log(`Total songs downloaded: ${downloadCount}`);
})();