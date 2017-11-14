[...document.querySelectorAll('.playerskin')].forEach((player) => {
    console.clear();
    const skin = new MediaSkin.MediaPlayer(player);

    skin.init();

    console.log(skin);
});