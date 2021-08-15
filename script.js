let win = { w: 0, h: 0 }, meter, svg, path, path_back;
let padding, w;
let controller, knob, pointer;
let vol_max = 100, vol_current = 100;
let vol = { small: { e: 0, vol: 0 }, big: { e: 0, vol: 0 } };
let value = { old: 0, new: 0 };
let button_parent, button, button_path;
let range_color = {
    r: {
        max: 255,
        // min: 120
        min: 0
    },
    g: {
        max: 10,
        // min: 50
        min: 90
    },
    b: {
        max: 90,
        // min: 255
        min: 150
    },
    from: 25,
    to: 75
};
let state = { dec: false, inc: false };
let rootcss;

function init() {
    win.w = window.innerWidth; win.h = window.innerHeight; meter = document.getElementById('meter');
    svg = meter.getElementsByTagName('svg')[0];
    svg.innerHTML = '<defs><clipPath id="clippath"></clipPath></defs>';
    svg.innerHTML += '<path id="leveloff" clip-path="url(#clippath)"/>';
    svg.innerHTML += '<path id="level" clip-path="url(#clippath)"/>';
    rootcss = document.querySelector(':root');

    if (win.w < 600) {
        padding = 12.5;
        w = (200) + (2 * padding);
    }
    else {
        padding = 25;
        w = (400) + (2 * padding);
    }
    meter.style.width = String(w) + 'px';
    meter.style.height = String(w) + 'px';
    svg.setAttribute('width', String(w));
    svg.setAttribute('height', String(w));
    svg.setAttribute('stroke-width', String(padding));

    path = svg.getElementById('level');
    path_back = svg.getElementById('leveloff');
    path.setAttribute('d', 'M ' + String(padding) + ' ' + String(svg.clientWidth / 2) + ' A ' + String(svg.clientWidth / 2 - padding) + ' ' + String(svg.clientWidth / 2 - padding) + ' 0 0 1 ' + String(svg.clientWidth / 2) + ' ' + String(padding) + ' ' + String(svg.clientWidth / 2 - padding) + ' ' + String(svg.clientWidth / 2 - padding) + ' 0 0 1 ' + String(svg.clientWidth - padding) + ' ' + String(svg.clientWidth / 2) + ' ' + String(svg.clientWidth / 2 - padding) + ' ' + String(svg.clientWidth / 2 - padding) + ' 0 0 1 ' + String(svg.clientWidth / 2) + ' ' + String(svg.clientWidth - padding));
    path.setAttribute('stroke', 'rgb(' + String(range_color.r.max) + ', ' + String(range_color.g.max) + ', ' + String(range_color.b.max) + ')');
    path_back.setAttribute('d', 'M ' + String(padding) + ' ' + String(svg.clientWidth / 2) + ' A ' + String(svg.clientWidth / 2 - padding) + ' ' + String(svg.clientWidth / 2 - padding) + ' 0 0 1 ' + String(svg.clientWidth / 2) + ' ' + String(padding) + ' ' + String(svg.clientWidth / 2 - padding) + ' ' + String(svg.clientWidth / 2 - padding) + ' 0 0 1 ' + String(svg.clientWidth - padding) + ' ' + String(svg.clientWidth / 2) + ' ' + String(svg.clientWidth / 2 - padding) + ' ' + String(svg.clientWidth / 2 - padding) + ' 0 0 1 ' + String(svg.clientWidth / 2) + ' ' + String(svg.clientWidth - padding));
    path_back.setAttribute('stroke', '#ddd');
    // path.setAttribute('stroke', '#FFEA82');
    drawMarkings();
    drawControllerBox();
    placeButtons();
    checkVolumeAndSetButtons();
    setTouchButtons();
    // setVolume(0);
}

function drawMarkings() {
    for (let angle = 0; angle < 270; angle += 5) {
        let p1, p2, p3, p4;
        p1 = getCirclePoints(angle, (((svg.clientWidth) - (padding * 2)) / 2), svg.clientHeight / 2, svg.clientHeight / 2);
        p2 = getCirclePoints(angle, (((svg.clientWidth) - (padding * 1)) / 2), svg.clientHeight / 2, svg.clientHeight / 2);
        p3 = getCirclePoints(angle + 2, (((svg.clientWidth) - (padding * 1)) / 2), svg.clientHeight / 2, svg.clientHeight / 2);
        p4 = getCirclePoints(angle + 2, (((svg.clientWidth) - (padding * 2)) / 2), svg.clientHeight / 2, svg.clientHeight / 2);
        svg.getElementById('clippath').innerHTML += '<polygon points="' +
            String(p1.x) + ' ' + String(p1.y) + ' ' +
            String(p2.x) + ' ' + String(p2.y) + ' ' +
            String(p3.x) + ' ' + String(p3.y) + ' ' +
            String(p4.x) + ' ' + String(p4.y) + '"/>';
    }
}

function drawControllerBox() {
    controller = document.getElementById('controller');
    knob = document.querySelector('#controller #knob');
    pointer = knob.querySelector('#controller #knob #pointer');
    pointer.style.backgroundColor = 'rgb(' + String(range_color.r.max) + ', ' + String(range_color.g.max) + ', ' + String(range_color.b.max) + ')';
    knob.style.transform = 'rotate(135deg)';
    setVolumeLabels();
    controller.style.width = String(w - (padding * 4)) + 'px';
    controller.style.height = String(w - (padding * 4)) + 'px';
    pointer.style.width = String(80 / 100 * padding) + 'px';
    pointer.style.height = String(80 / 100 * padding) + 'px';
    pointer.style.top = String(padding) + 'px';
}

function setVolumeLabels() {
    vol.small.e = document.getElementById('vol-small');
    vol.small.e.style.fontSize = String(padding * 1.25) + 'px';
    vol.small.e.style.height = String(w - (8 * padding)) + 'px';
    vol.small.e.style.width = String(w - (8 * padding)) + 'px';
    vol.small.e.innerHTML = '';
    vol.small.vol = vol.small.e.getElementsByClassName('vol');
    vol.big.e = document.getElementById('vol-big');
    vol.big.e.style.fontSize = String(padding * 2.5) + 'px';
    vol.big.e.style.height = String(w - (13 * padding)) + 'px';
    vol.big.e.style.width = String(w - (10 * padding)) + 'px';
    vol.big.e.innerHTML = '';
    for (let i = 0; i <= vol_max; i++) {
        vol.small.e.innerHTML += '<div class="vol">' + String(i) + '</div>';
        vol.big.e.innerHTML += '<div class="vol">' + String(i) + '</div>';
    }
    vol.big.vol = vol.big.e.getElementsByClassName('vol');
    for (let i = 0; i <= vol_max; i++) {
        vol.small.vol[i].style.top = String((vol.small.e.clientHeight / 2) - (vol.small.vol[i].clientHeight / 2) + ((padding * 4) * i)) + 'px';
        vol.big.vol[i].style.top = String((vol.big.e.clientHeight / 2) - (vol.big.vol[i].clientHeight / 2) + ((padding * 4) * i)) + 'px';
    }
    let num = 100;
    for (let i = 0; i <= vol_max; i++) {
        vol.small.vol[i].style.top = String((vol.small.e.clientHeight / 2) - (vol.small.vol[i].clientHeight / 2) + ((padding * 4) * (i - num))) + 'px';
        vol.big.vol[i].style.top = String((vol.big.e.clientHeight / 2) - (vol.big.vol[i].clientHeight / 2) + ((padding * 4) * (i - num))) + 'px';
    }
    for (let i = 0; i <= vol_max; i++) {
        vol.small.vol[i].style.transition = '0.5s';
        vol.big.vol[i].style.transition = '0.5s';
    }
    value.old = num;
}

function placeButtons() {
    button_parent = document.getElementById('buttons');
    button = button_parent.getElementsByClassName('button');
    button_path = [document.querySelector('#decrease #path'), document.querySelector('#increase #path')];
    button_parent.style.top = String(meter.offsetTop + (meter.clientHeight / 2) + (padding * 1.5)) + 'px';

    for (let i = 0; i < button.length; i++) {
        let num = padding * 3;
        button[i].style.height = String(num) + 'px';
        button[i].style.width = String(num) + 'px';
        button[i].style.borderWidth = String(padding / 10) + 'px';
        button[i].getElementsByTagName('svg')[0].setAttribute('height', String(button[i].clientHeight));
        button[i].getElementsByTagName('svg')[0].setAttribute('width', String(button[i].clientHeight));

        button_path[i].setAttribute('stroke-width', String(padding / 10 * 2));
    }
    button[0].style.left = String((win.w / 2) - (padding * 4)) + 'px';
    button[1].style.left = String((win.w / 2) + (padding * 4)) + 'px';
    button_path[0].setAttribute('d', 'M ' + String((button[0].clientHeight / 2) - (padding / 1.5)) + ' ' + String(button[0].clientHeight / 2) + ' L ' + String((button[0].clientHeight / 2) + (padding / 1.5)) + ' ' + String(button[0].clientHeight / 2));
    button_path[1].setAttribute('d', 'M ' + String((button[0].clientHeight / 2) - (padding / 1.5)) + ' ' + String(button[0].clientHeight / 2) + ' L ' + String((button[0].clientHeight / 2) + (padding / 1.5)) + ' ' + String(button[0].clientHeight / 2) + ' M ' + String(button[0].clientHeight / 2) + ' ' + String((button[0].clientHeight / 2) - (padding / 1.5)) + ' L ' + String(button[0].clientHeight / 2) + ' ' + String((button[0].clientHeight / 2) + (padding / 1.5)));

}
function setVolumeButton(num) {
    setVolume(num);
}

function checkVolumeAndSetButtons() {
    if (vol_current == 0) {
        
        if (!state.dec) {
            rootcss.style.setProperty('--btn-dec-stroke', 'white');
            rootcss.style.setProperty('--btn-dec-stroke-active', 'white');
            rootcss.style.setProperty('--btn-dec-border-color', '#f9f9f9');
            rootcss.style.setProperty('--btn-dec-border-color-active', '#f9f9f9');
            rootcss.style.setProperty('--btn-dec-background-color', '#f9f9f9');
            rootcss.style.setProperty('--btn-dec-background-color-active', '#f9f9f9');

            rootcss.style.setProperty('--btn-inc-stroke', '#000');
            rootcss.style.setProperty('--btn-inc-stroke-active', 'white');
            rootcss.style.setProperty('--btn-inc-border-color', '#ddd');
            rootcss.style.setProperty('--btn-inc-border-color-active', '#ddd');
            rootcss.style.setProperty('--btn-inc-background-color', 'white');
            rootcss.style.setProperty('--btn-inc-background-color-active', 'crimson');
            state.dec = true;
            state.inc = false;
        }
    }
    else if (vol_current == 100) {
        if (!state.inc) {
            rootcss.style.setProperty('--btn-inc-stroke', 'white');
            rootcss.style.setProperty('--btn-inc-stroke-active', 'white');
            rootcss.style.setProperty('--btn-inc-border-color', '#f9f9f9');
            rootcss.style.setProperty('--btn-inc-border-color-active', '#f9f9f9');
            rootcss.style.setProperty('--btn-inc-background-color', '#f9f9f9');
            rootcss.style.setProperty('--btn-inc-background-color-active', '#f9f9f9');

            rootcss.style.setProperty('--btn-dec-stroke', '#000');
            rootcss.style.setProperty('--btn-dec-stroke-active', 'white');
            rootcss.style.setProperty('--btn-dec-border-color', '#ddd');
            rootcss.style.setProperty('--btn-dec-border-color-active', '#ddd');
            rootcss.style.setProperty('--btn-dec-background-color', 'white');
            rootcss.style.setProperty('--btn-dec-background-color-active', 'crimson');
            state.dec = false;
            state.inc = true;
        }
    }
    else {
        if (state.dec == true) {
            rootcss.style.setProperty('--btn-dec-stroke', '#000');
            rootcss.style.setProperty('--btn-dec-stroke-active', 'white');
            rootcss.style.setProperty('--btn-dec-border-color', '#ddd');
            rootcss.style.setProperty('--btn-dec-border-color-active', '#ddd');
            rootcss.style.setProperty('--btn-dec-background-color', 'white');
            rootcss.style.setProperty('--btn-dec-background-color-active', 'crimson');
            state.dec = false;
        }
        if (state.inc == true) {
            rootcss.style.setProperty('--btn-inc-stroke', '#000');
            rootcss.style.setProperty('--btn-inc-stroke-active', 'white');
            rootcss.style.setProperty('--btn-inc-border-color', '#ddd');
            rootcss.style.setProperty('--btn-inc-border-color-active', '#ddd');
            rootcss.style.setProperty('--btn-inc-background-color', 'white');
            rootcss.style.setProperty('--btn-inc-background-color-active', 'crimson');
            state.inc = false;
        }
    }
}

function setTouchButtons() {
    let touch_parent = document.getElementById('touch');
    let touches = touch_parent.getElementsByClassName('touches');
    touch_parent.style.width = String(w) + 'px';
    touch_parent.style.height = String(w) + 'px';
    for (let i = 0; i < touches.length; i++) {
        let rat = 5;
        touches[i].style.width = String(padding * rat) + 'px';
        touches[i].style.height = String(padding * rat) + 'px';
    }
    let angle = 315;
    for (let i = 0; i < touches.length; i++) {
        let r = getCirclePoints(angle, (w / 2) - 5, (w / 2), (w / 2));
        touches[i].style.left = String(r.x) + 'px';
        touches[i].style.top = String(r.y) + 'px';
        angle += 45;
        if(angle == 360) { angle = 0;}
    }
}

function setVolume(num) {
    if ((num >= 0) && (num <= 100)) {
        let color;
        value.new = num;
        if (value.old != value.new) {
            var bar = new ProgressBar.Path('#level', {
                easing: 'easeInOut',
                duration: 500,
                step: (state, bar) => {
                    let v = Math.round(bar.value() * 100);
                    if (v < range_color.from) {
                        color = 'rgb(' + String(range_color.r.min) + ', ' + String(range_color.g.min) + ', ' + String(range_color.b.min) + ')';
                    }
                    else if (v > range_color.to) {
                        color = 'rgb(' + String(range_color.r.max) + ', ' + String(range_color.g.max) + ', ' + String(range_color.b.max) + ')';
                    }
                    else {
                        color = 'rgb( ' +
                            String(map(v, 25, 75, range_color.r.min, range_color.r.max)) + ', ' +
                            String(map(v, 25, 75, range_color.g.min, range_color.g.max)) + ', ' +
                            String(map(v, 25, 75, range_color.b.min, range_color.b.max)) + ')';
                    }
                    path.setAttribute('stroke', color);
                    pointer.style.backgroundColor = color;
                }
            });
            bar.set(value.old / 100);
            knob.style.transform = 'rotate(' + String((map(num, 0, 100, 0, 270) - 135)) + 'deg)';
            bar.animate(num / 100);
            for (let i = 0; i <= vol_max; i++) {
                vol.small.vol[i].style.top = String((vol.small.e.clientHeight / 2) - (vol.small.vol[i].clientHeight / 2) + ((padding * 4) * (i - num))) + 'px';
                vol.big.vol[i].style.top = String((vol.big.e.clientHeight / 2) - (vol.big.vol[i].clientHeight / 2) + ((padding * 4) * (i - num))) + 'px';
            }
            value.old = value.new;
        }
        vol_current = num;
        checkVolumeAndSetButtons();
    }
}
function getCirclePoints(deg, rad, circle_x, circle_y) {
    let result = { x: 0, y: 0 };
    if (deg == 0) {
        // console.log('0');
        result.x = circle_x - rad;
        result.y = circle_y;
        return result;
    }
    else if (deg < 90) {
        // console.log('less than 90');
        deg = 90 - deg;
        result.x = circle_x - (Math.sin((deg * (Math.PI / 180))) * rad);
        result.y = circle_y - (Math.cos((deg * (Math.PI / 180))) * rad);
        return result;
    }
    else if (deg == 90) {
        // console.log('90');
        result.x = circle_x;
        result.y = circle_y - rad;
        return result;
    }
    else if (deg < 180) {
        // console.log('less than 180');
        deg = 90 - (180 - deg);
        result.x = circle_x + (Math.sin((deg * (Math.PI / 180))) * rad);
        result.y = circle_y - (Math.cos((deg * (Math.PI / 180))) * rad);
        return result;
    }
    else if (deg == 180) {
        // console.log('180');
        result.x = circle_x + rad;
        result.y = circle_y;
        return result;
    }
    else if (deg < 270) {
        // console.log('less than 270');
        deg = 270 - deg;
        result.x = circle_x + (Math.sin((deg * (Math.PI / 180))) * rad);
        result.y = circle_y + (Math.cos((deg * (Math.PI / 180))) * rad);
        return result;
    }
    else if (deg == 270) {
        // console.log('270');
        result.x = circle_x;
        result.y = circle_y + rad;
        return result;
    }
    else if (deg < 360) {
        // console.log('less than 360');
        deg = deg - 270;
        result.x = circle_x - (Math.sin((deg * (Math.PI / 180))) * rad);
        result.y = circle_y + (Math.cos((deg * (Math.PI / 180))) * rad);
        return result;
    }
    else if (deg == 360) {
        // console.log('360');
        result.x = circle_x - rad;
        result.y = circle_y;
        return result;
    }
    else {
        console.log('More than 360 Error');
    }
}

window.addEventListener('resize', init);

function map(x, in_min, in_max, out_min, out_max) {
    return Math.round((x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min);
}
