let currentSong = new Audio;
let songs;
let currFolder;
let folders;

async function getSongs(folder) {
    currFolder = folder
    // let a = await fetch(`http://127.0.0.1:3000/albums/${folder}`)
    let a = await fetch(`./albums/${folder}`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")

    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}`)[1])
        }
    }
    return songs
}
async function displayAlbums() {
    
    // let a = await fetch(`http://127.0.0.1:3000/albums`)
    let a = await fetch(`./albums`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")

    folders = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.includes("/albums/")) {
            folders.push(element.href.split(`/albums/`)[1])
        }
    }

    folders.forEach(async folder => {
        // let a = await fetch(`http://127.0.0.1:3000/albums/${folder}/info.json`)
        let a = await fetch(`./albums/${folder}/info.json`)
        let response = await a.json()

        let coverImg='svgs/music.svg'

        
        // let cover = await fetch(`http://127.0.0.1:3000/albums/${folder}/cover.png`)
        let cover = await fetch(`./albums/${folder}/cover.png`)
        
        if (cover.ok){
            // coverImg=`http://127.0.0.1:3000/albums/${folder}/cover.png`
            coverImg=`./albums/${folder}/cover.png`
        }
        
        document.querySelector(".cardContainer").insertAdjacentHTML("beforeend", `
        <div data-album="${folder}" class="card">
                        <svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%" class="play-button">
                            <path d="M 12,26 18.5,22 18.5,14 12,10 z M 18.5,22 25,18 25,18 18.5,14 z"></path>
                        </svg>
                        <img src="${coverImg}" alt="thumbnail">
                        <h3>${response.title}</h3>
                        <p>${response.description}</p>
                    </div>
        `)
    });

    return folders
}



const playMusic = (track, pause = false) => {
    currentSong.src = `albums/${currFolder}/` + track.trim()
    currentSong.play()
    document.getElementById("playbar-play").src = "svgs/pause.svg"
    document.querySelector(".playbar").querySelector(".info").querySelector(".songinfo").innerHTML = track
    if (pause) {
        currentSong.pause()
        document.getElementById("playbar-play").src = "svgs/play.svg"
    }
}

async function main() {
    await displayAlbums()
    await getSongs(folders[0])

    Array.from(document.querySelectorAll(".card")).forEach(element => {
        element.addEventListener("click", async (item) => {
            console.log(folders.indexOf(item.currentTarget.dataset.album));
            currFolder = item.currentTarget.dataset.album;
            songs = await getSongs(item.currentTarget.dataset.album);
            playMusic(songs[0].replaceAll("%20", " "))
            // Update the song list and any other necessary UI components
            let songUl = document.querySelector(".songlist").getElementsByTagName("ul")[0];
            songUl.innerHTML = ""; // Clear the existing list
            for (const song of songs) {
                songUl.innerHTML = songUl.innerHTML +`<li>
                <div class="songCard">
                    <div class="songCard-left">
                        <img src="svgs/music.svg" alt="play" class="invert">
                        <div>${song.replaceAll("%20"," ")}</div>
                    </div>
                    <div class="songCard-right" >Play Now
                        <img src="svgs/play.svg" alt="play" class="">
                    </div>

                </div>
            </li>`;
            }

            // Attach event listeners to each song
            Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach((e) => {
                e.addEventListener("click", (element) => {
                    playMusic(e.getElementsByTagName("div")[1].getElementsByTagName("div")[0].innerHTML)
                });
            });
        });
    });


    playMusic(songs[0].replaceAll("%20", " "), true)
    let songUl = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li>
        <div class="songCard">
            <div class="songCard-left">
                <img src="svgs/music.svg" alt="play" class="invert">
                <div>${song.replaceAll("%20"," ")}</div>
            </div>
            <div class="songCard-right" >Play Now
                <img src="svgs/play.svg" alt="play" class="">
            </div>

        </div>
    </li>`
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach((e) => {
        e.addEventListener("click", (element) => {
            playMusic(e.getElementsByTagName("div")[1].getElementsByTagName("div")[0].innerHTML)
        })
    })

    // Attach an event listner to play,next and previous
    // document.querySelector(".playbar").querySelector(".options").children
    document.getElementById("playbar-play").addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            document.getElementById("playbar-play").src = "svgs/pause.svg"
        }
        else {
            currentSong.pause()
            document.getElementById("playbar-play").src = "svgs/play.svg"
        }
    })


    // Listen for time update event

    currentSong.addEventListener("timeupdate", () => {
        let currentTime = currentSong.currentTime
        let trackDuration = currentSong.duration
        let currentTimeMinute = Math.floor(currentTime / 60)
        let currentTimeseconds = Math.floor(currentTime % 60)
        let trackdurationMinute = Math.floor(trackDuration / 60)
        let trackDurationseconds = Math.floor(trackDuration % 60)

        if (currentTimeMinute < 10) {
            currentTimeMinute = "0" + `${currentTimeMinute}`
        }
        if (currentTimeseconds < 10) {
            currentTimeseconds = "0" + `${currentTimeseconds}`
        }

        if (trackdurationMinute < 10) {
            trackdurationMinute = "0" + `${trackdurationMinute}`
        }
        if (trackDurationseconds < 10) {
            trackDurationseconds = "0" + `${trackDurationseconds}`
        }

        document.querySelector(".seekbar .circle").style.left = `${(currentTime / trackDuration) * 100}%`
        document.querySelector(".duration-info").innerHTML = `${currentTimeMinute}:${currentTimeseconds} / ${trackdurationMinute}:${trackDurationseconds}`
    })


    document.querySelector(".seekbar").addEventListener("click", (e) => {
        document.querySelector(".seekbar .circle").style.left = `${(e.offsetX / e.target.getBoundingClientRect().width) * 100}%`
        currentSong.currentTime = (e.offsetX / e.target.getBoundingClientRect().width) * currentSong.duration

    })


    // Add event listner to hamburger
    document.querySelector(".threebars").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
        document.querySelector(".left").style.width = "75vw"
    })
    document.querySelector(".home-threebars").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
        document.querySelector(".left").style.width = "25vw"
    })


    // Add an event listener to next
    document.getElementById("playbar-next").addEventListener("click", () => {

        let index = songs.indexOf((currentSong.src.split("/").slice(-1)[0]));
        if ((index + 1) <= songs.length) {
            playMusic(songs[index + 1].replaceAll("%20", " "))
        }
    })

    // Add an event listener to previous
    document.getElementById("playbar-previous").addEventListener("click", () => {

        let index = songs.indexOf((currentSong.src.split("/").slice(-1)[0]));
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1].replaceAll("%20", " "))
        }
    })

    document.querySelector(".volume-info").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        if (e.target.value == 0) {
            document.querySelector(".volume-info").getElementsByTagName("img")[0].src = "svgs/mute.svg"
        }
        else if (e.target.value != 0) {
            document.querySelector(".volume-info").getElementsByTagName("img")[0].src = "svgs/sound.svg"
        }

        currentSong.volume = e.target.value / 100
    })

    document.querySelector(".volume-info").getElementsByTagName("img")[0].addEventListener("click", (e) => {
        if (currentSong.volume == 0) {
            currentSong.volume = 1
            document.querySelector(".volume-info").getElementsByTagName("input")[0].value = 100
            e.target.src = "svgs/sound.svg"
        } else {
            e.target.src = "svgs/mute.svg"
            currentSong.volume = 0
            document.querySelector(".volume-info").getElementsByTagName("input")[0].value = "0"
        }

    })


}

main()