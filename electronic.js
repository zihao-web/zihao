const bgm=document.querySelector('#bgm');
const musicButton=document.querySelector('#music-toggle');
const film=document.querySelector('#film-viewer');
const filmVideo=document.querySelector('#memory-film');
const filmButton=document.querySelector('#open-film');
const closeFilmButton=document.querySelector('#close-film');
let musicWanted=false;
let resumeMusicAfterFilm=false;
bgm.volume=.28;
function syncMusicButton(){
  musicButton.setAttribute('aria-pressed',musicWanted?'true':'false');
  musicButton.textContent=musicWanted?'音乐已开启 ♫':'开启音乐 ♫';
}
musicButton.addEventListener('click',async()=>{
  musicWanted=!musicWanted;
  if(musicWanted){
    try{await bgm.play();}catch(_){musicWanted=false;}
  }else{bgm.pause();}
  syncMusicButton();
});
filmButton.addEventListener('click',async()=>{
  resumeMusicAfterFilm=musicWanted&&!bgm.paused;
  bgm.pause();
  film.showModal();
  try{await filmVideo.play();}catch(_){}
});
closeFilmButton.addEventListener('click',()=>film.close());
film.addEventListener('click',event=>{if(event.target===film)film.close();});
film.addEventListener('close',async()=>{
  filmVideo.pause();
  if(resumeMusicAfterFilm&&musicWanted){try{await bgm.play();}catch(_){}}
  resumeMusicAfterFilm=false;
});
film.addEventListener('keydown',event=>{
  if(['ArrowLeft','ArrowRight',' '].includes(event.key))event.stopPropagation();
});
filmVideo.addEventListener('ended',async()=>{
  if(resumeMusicAfterFilm&&musicWanted){try{await bgm.play();}catch(_){}}
  resumeMusicAfterFilm=false;
});
syncMusicButton();
