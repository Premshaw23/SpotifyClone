console.log("lets start javascript");
let currentSong = new Audio();
const play = document.querySelector("#play");
const previous = document.querySelector("#previous");
const next = document.querySelector("#next");
let AlbumName = document.querySelector(".album");
let songlist = document.querySelector(".songList");
let songUl = songlist.getElementsByTagName("ul")[0];
 let seekbar = document.querySelector(".seekbar");
  let volumeimg=document.querySelector(".volume>img");

 let circle = document.querySelector(".circle");

let cardContainer = document.querySelector(".cardContainer");
let songs;
let folders = [];
let colored = true;
let currFolder;
let currentSongLi = null;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`/${folder}/`);
  let response = await a.text();
  // console.log(response);
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.querySelectorAll("a");
  songs = [];
  for (let i = 0; i < as.length; i++) {
    let element = as[i];
    // console.log(element);
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
      // console.log(element.href.split(`/${folder}/`)[1]);
    }
  }

  songUl.innerHTML = "";
  for (const song of songs) {
    songUl.innerHTML += `<li>
                <img class="invert" src="img/music.svg" alt="music">
                <div class="info">
                    <div>${song.replaceAll("%20", " ")}</div>
                    <div>Prem Shaw</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="img/playsong.svg" alt="play">
                </div>
              </li>
        </li>`;
  }
  AlbumName.innerHTML = "<p>Album:</p>";
  let a1 = await fetch(`/${folder}/info.json`);
  let response2 = await a1.json();
  // console.log(AlbumName.innerHTML);
  AlbumName.innerHTML += `${response2.title}`;

  let allSongs = Array.from(songlist.getElementsByTagName("li"));
  allSongs.forEach((e) => {
    e.addEventListener("click", (element) => {
      colored=true;
      playSong(e.querySelector(".info").firstElementChild.innerHTML.trim(),false,colored);

      //  console.log(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  return songs;
}

function playSong(track, pause = false,colored) {
  currentSong.src = `/${currFolder}/` + track;
  let allSongs = Array.from(songlist.getElementsByTagName("li"));
  // console.log(allSongs[0].style);
  
  if(!colored){
    allSongs[0].style.backgroundColor = "rgba(128, 120, 120, 0.33)";
  }else{
    allSongs[0].style.backgroundColor = "";
  }

  if (currentSongLi) {
    currentSongLi.style.backgroundColor = "";
  }

  currentSongLi = allSongs.find(
    (li) =>
      li.querySelector(".info").firstElementChild.innerHTML.trim() === track
  );
  if (currentSongLi) {
    currentSongLi.style.backgroundColor = " rgba(128, 120, 120, 0.33)";
    colored=true;
  }

  // Check if song is already playing, if not, start it
  if (!pause && currentSong.paused) {
    currentSong.play();
    // console.log("play");
    play.src = "img/pause.svg";
  }
  // Display song info
  document.querySelector(".songInfo").innerHTML = decodeURI(track);
  document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
}

async function displayAlbum() {
  let a = await fetch(`/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.querySelectorAll("a");
  //    console.log(anchors);
  //    folders=[];
  folders = Array.from(anchors);
  // console.log(folders);
  for (let i = 0; i < folders.length; i++) {
    let element = folders[i];
    if (element.href.includes("/songs/")&& !element.href.includes(".htaccess")) {
      let folder = element.href.split(`/songs/`)[1];
      let a = await fetch(`/songs/${folder}/info.json`);
      let response = await a.json();
      //  console.log(decodeURI(folder));
      cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
              <div class="play">
                <svg
                  width="50"
                  height="50"
                  viewBox="0 0 100 100"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="50" cy="50" r="50" fill="#00C853" />
                  <polygon points="40,30 70,50 40,70" fill="#000000" />
                </svg>
              </div>
              <img
                src="/songs/${folder}/cover.jpg"
                alt="img"
              />
              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>`;
    }
  }

  let card = document.getElementsByClassName("card");
  Array.from(card).forEach((e) => {
    // console.log(e);

    e.addEventListener("click", async (item) => {
      item.preventDefault();
      //  console.log(item.currentTarget.dataset.folder);
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      colored = false;
      playSong(songs[0],false,colored);
    });
  });
}

async function main() {
  //display any folder songs
  await getSongs("songs/sad");
  playSong(songs[0], true);

  //display albums
  displayAlbum();
  //play the song on click
  play.addEventListener("click", (e) => {
    if (currentSong.paused) {
      currentSong.play();
      // console.log('p1');
      play.src = "img/pause.svg";
    } else {
      // console.log('p2');
      currentSong.pause();
      play.src = "img/playsong.svg";
    }
  });

  //keyboards event
    document.addEventListener("keydown",(e)=>{
      e.preventDefault();
      if (e.code === "Space") {
        if (!currentSong.paused) {
          // console.log("Paused");
          currentSong.pause();
          play.src="img/playsong.svg";
        } else {
          // console.log("Resumed");
          currentSong.play();
          play.src = "img/pause.svg";
        }
      }

      if (e.code === "ArrowRight") {
       let index = songs.indexOf(currentSong.src.split(`/${currFolder}/`)[1]);
       colored = true;
       let allSongs = Array.from(songlist.getElementsByTagName("li"));

       if (songs.length > index + 1) {
         playSong(songs[index + 1], false, colored);

         if (currentSongLi) {
           currentSongLi.style.backgroundColor = "";
         }

         currentSongLi = allSongs[index + 1];
         currentSongLi.style.backgroundColor = "rgba(128, 120, 120, 0.33)";
       } else if (songs.length > 1) {
         // console.log(index,songs.length);
         playSong(songs[0], false, false);
         allSongs[songs.length - 1].style.backgroundColor = "";
       }
      }

      if (e.code === "ArrowLeft") {
        let index = songs.indexOf(currentSong.src.split(`/${currFolder}/`)[1]);
        colored = true;
        let allSongs = Array.from(songlist.getElementsByTagName("li"));

        if (0 <= index - 1) {
          allSongs[songs.length - 1].style.backgroundColor = "";
          playSong(songs[index - 1], false, colored);

          if (currentSongLi) {
            currentSongLi.style.backgroundColor = "";
          }

          currentSongLi = allSongs[index - 1];
          currentSongLi.style.backgroundColor = "rgba(128, 120, 120, 0.33)";
        } else {
          // console.log(index,songs.length);
          playSong(songs[songs.length - 1], false, colored);
          allSongs[songs.length - 1].style.backgroundColor =
            "rgba(128, 120, 120, 0.33)";
        }
      }

     if (e.code === "ArrowUp") {
         
       if (currentSong.volume<1) {
         currentSong.volume += 0.1; // Increase the volume
         range.value = currentSong.volume * 100; // Update the range input value
        // console.log(currentSong.volume);
        // console.log(range.value);
       }
     }

     if (e.code === "ArrowDown") {
       if (range.value > 0) {
         currentSong.volume -= 0.1; // Decrease the volume
         range.value = currentSong.volume * 100; // Update the range input value
        // console.log(currentSong.volume);
        // console.log(range.value);
       }
     }
      if (range.value == 0) {
        volumeimg.src = "img/mute.svg";
        // console.log("hello");
      }else{
        volumeimg.src = "img/volume.svg";
      }

    });
      //keyboard events close

      // console.log(volumeimg.src.includes("/img/volume.svg"));

  // songs button action
  previous.addEventListener("click", (e) => {
    let index = songs.indexOf(currentSong.src.split(`/${currFolder}/`)[1]);
    colored=true;
      let allSongs = Array.from(songlist.getElementsByTagName("li"));
    
    if (0 <= index - 1) {
      allSongs[songs.length - 1].style.backgroundColor = "";
      playSong(songs[index - 1], false, colored);

      
      if (currentSongLi) {
        currentSongLi.style.backgroundColor = "";
      }

      currentSongLi = allSongs[index - 1];
      currentSongLi.style.backgroundColor = "rgba(128, 120, 120, 0.33)";
    } else {
      // console.log(index,songs.length);
      playSong(songs[songs.length-1], false,colored);
      allSongs[songs.length - 1].style.backgroundColor =
        "rgba(128, 120, 120, 0.33)";
    }
  });



  next.addEventListener("click", (e) => {
    let index = songs.indexOf(currentSong.src.split(`/${currFolder}/`)[1]);
    colored = true;
      let allSongs = Array.from(songlist.getElementsByTagName("li"));
    

    if (songs.length > index + 1) {
      playSong(songs[index + 1],false,colored);
      

      if (currentSongLi) {
        currentSongLi.style.backgroundColor = "";
      }

      currentSongLi = allSongs[index + 1];
      currentSongLi.style.backgroundColor = "rgba(128, 120, 120, 0.33)";
    }else if(songs.length>1){
      // console.log(index,songs.length);
      playSong(songs[0], false, false);
      allSongs[songs.length - 1].style.backgroundColor ="";
    }
  });



  // time Update
  currentSong.addEventListener("timeupdate", (a) => {
    document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    let circleLoad = (currentSong.currentTime / currentSong.duration) * 100;
    circle.style.left = circleLoad-1 + "%";
    if (currentSong.currentTime === currentSong.duration) {
      if (loopimg.src.includes("repeatone.svg")) {
        currentSong.currentTime = 0;
        currentSong.play();
        loopimg.src = "img/repeatno.svg"; // Stop after one extra play
      } else if (loopimg.src.includes("repeat.svg")) {
        currentSong.currentTime = 0;
        currentSong.play(); // Continue looping indefinitely
      } else {
        circle.style.left = -1 + "%";
        play.src = "img/playsong.svg";
      }
    }
  });

  //sekbar action start
  let loop=document.querySelector(".loop");
  let loopimg=document.querySelector(".loop>img");;
  loop.addEventListener("click",(e)=>{

      if (loopimg.src.includes("repeatno.svg")) {
        loopimg.src = "img/repeatone.svg";
        currentSong.loop = false; // Disable built-in loop for one-time replay logic
      } else if (loopimg.src.includes("repeatone.svg")) {
        loopimg.src = "img/repeat.svg";
        currentSong.loop = true; // Enable infinite looping
      } else {
        loopimg.src = "img/repeatno.svg";
        currentSong.loop = false; // No looping
      }
  })
 

  let isDragging = false;
  let seekbarRect;

  const updateCirclePosition = (mouseX) => {
    const relativeX = mouseX - seekbarRect.left;
    const clampedX = Math.min(Math.max(relativeX, 0), seekbarRect.width);
    const percentage = (clampedX / seekbarRect.width) * 100;
    circle.style.left = `${percentage-1}%`;
    return percentage;
  };

  circle.addEventListener("mousedown", (e) => {
    e.preventDefault();
    isDragging = true;
    seekbarRect = seekbar.getBoundingClientRect();
    document.body.style.cursor = "grabbing";
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      e.preventDefault();
      seekbarRect = seekbar.getBoundingClientRect();
      const percentage = updateCirclePosition(e.clientX);
      const audioTime = ((percentage) / 100) * currentSong.duration;
      currentSong.currentTime = audioTime;
      currentSong.pause();
      // console.log("h");
    }
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      document.body.style.cursor = "default";
      currentSong.play(); // Play the song only once, after releasing the mouse
      play.src = "img/pause.svg";
    }
  });

  // Clicking on the seekbar
  seekbar.addEventListener("click", (e) => {
    seekbarRect = seekbar.getBoundingClientRect();
    const percentage = updateCirclePosition(e.clientX);
    const audioTime = ((percentage) / 100) * currentSong.duration;
    currentSong.currentTime = audioTime;
    currentSong.play(); // Start playing when clicking on the seekbar
    play.src = "img/pause.svg";
  });

  // Prevent text selection
  seekbar.addEventListener("selectstart", (e) => e.preventDefault());
  circle.addEventListener("selectstart", (e) => e.preventDefault());

  // seekbar action complete


  // sidebar action
  let hamberger = document.querySelector(".hamberger");
  let leftBar = document.querySelector(".left");
  let closeBar = document.querySelector(".close");

  hamberger.addEventListener("click", (e) => {
    leftBar.style.left = "0";
  });

  closeBar.addEventListener("click", (e) => {
    leftBar.style.left = "-115%";
  });

  //volume range
  let range = document.querySelector(".range").getElementsByTagName("input")[0];
  range.addEventListener("change", (e) => {
    // console.log(typeof (e.target.value));
    currentSong.volume = parseInt(e.target.value) / 100;
    
  });

 
  range.value = currentSong.volume * 100;

  //volume img update
   volumeimg.addEventListener("click", (e) => {
    // console.log(e.target.src);
    if (e.target.src.includes("img/volume.svg")) {
      e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg");
      currentSong.volume = 0;
      range.value = 0;
    } else {
      currentSong.volume = 0.2;
      e.target.src = "img/volume.svg";
      range.value = 20;
    }
  });
}
main();
