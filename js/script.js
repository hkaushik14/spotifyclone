console.log("harsh");
let songs;
let currentIndex = new Audio;
let currFolder;
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return (
        String(mins).padStart(2, "0") +
        ":" +
        String(secs).padStart(2, "0")
    );
}

let currentSong = new Audio();
async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = []
    for(let index = 0; index < as.length; index++){
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
    songs.push(decodeURIComponent(element.href.split(`${folder}/`).pop()));
}
    }
    return songs
}
    

const playMusic = (track, pause=false) =>{
    currentSong.src = `/songs/${currFolder}/` + track
    if(!pause){
        currentSong.play();
        play.src = "img/play.svg"
    }
    document.querySelector(".songinfo").innerHTML = track
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

    // show all the songs in the playlist
    let songul =document.querySelector(".songsList").getElementsByTagName("ul")[0]
    songul.innerHTML= ""
    for (const song of songs ) {
        songul.innerHTML = songul.innerHTML + `<li> <img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20"," ")}</div>
                                <div>Harsh</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div>
                            </li>`;
        

    }
    //Attach
    Array.from(document.querySelector(".songsList").getElementsByTagName("li")).forEach(e=> {
        e.addEventListener("click",element=>{
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
        })
        
    });
}

async function displayAlbums() {
    let a = await fetch("http://127.0.0.1:5500/songs/");
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;

    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

    for (let e of anchors) {
        let parts = e.href.split("/").filter(Boolean);

        if (parts[parts.length - 2] === "songs") {
            let folder = parts[parts.length - 1];

            try {
                let res = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
                let data = await res.json();

                cardContainer.innerHTML += `
                <div class="card" data-folder="${folder}">
                <div class="play">
                            <div>
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="#000" stroke="black"
                                    stroke-width="1.5">
                                    <path
                                        d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" />
                                </svg>
                                </div>
                                </div>
                    <img src="/songs/${folder}/cover.jpg">
                    <h2>${data.title}</h2>
                    <p>${data.description}</p>
                </div>`;
            } catch (err) {
                console.log("❌ info.json missing for:", folder);
            }
        }
    }
}


document.querySelector(".cardContainer").addEventListener("click", async (e) => {
    let card = e.target.closest(".card");
    if (!card) return;

    let folder = card.dataset.folder;

    await getSongs(folder);
    playMusic(songs[0], false);
});

async function main() {
    await getSongs("cs")
    playMusic(songs[0], true)


    
    // Display all the albums on the page
    displayAlbums()


   

    //Attack next previous
    play.addEventListener("click", ()=>{
        if(currentSong.paused){
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else{
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    // time upadated
    currentSong.addEventListener("timeupdate", ()=>{
        document.querySelector(".songtime").innerHTML= `${secondsToMinutesSeconds(currentSong.currentTime)}/
        ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime/ currentSong.duration)*100 + "%";
    })

    // add an event listener to seekbaar
    document.querySelector(".seekbar").addEventListener("click", e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width)*100;
        document.querySelector(".circle").style.left = percent+ "%";
        currentSong.currentTime = ((currentSong.duration)*percent)/100 
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left ="0"
    })


        // Add an event listener for hamburger
        document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })



    // Add an event listener to previous
    previous.addEventListener("click", () => {
    currentSong.pause();

    let currentFile = decodeURIComponent(
        currentSong.src.split("/").pop()
    );

    let index = songs.indexOf(currentFile);

    if (index > 0) {
        playMusic(songs[index - 1]);
    }
});


    // Add an event listener to next
    next.addEventListener("click", () => {
    currentSong.pause();

    let currentFile = decodeURIComponent(
        currentSong.src.split("/").pop()
    );

    let index = songs.indexOf(currentFile);

    if (index < songs.length - 1) {
        playMusic(songs[index + 1]);
    }
});

  // add a event volume 
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
    console.log("Setting Volume to",e.target.value,"/100")
    currentSong.volume = parseInt(e.target.value)/100

  })


   // album click
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getSongs(`${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        })
    })


    // Add event listner to mute the track
    document.querySelector(".volume>img").addEventListener("click", e=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg","mute.svg")
            currentSong.volume =0;
             document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg","volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })






}

main()
