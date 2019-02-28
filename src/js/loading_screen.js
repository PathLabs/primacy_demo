function move() {
    var progress = document.getElementById("current_progress");
    var width = 1;
    var id = setInterval(frame, 700);
    function frame() {
        if (width >= 100) {
            clearInterval(id);
        }
        else {
            width++;
            progress.style.width = width + '%';
        }
    }
}

move();
