var console = require('console');
var i2c = require('i2c');


console.log("Hello I2C world!");

let led = i2c.openSync({ bus: 0, address: 0x68 });

/*
led.writeSync([0x02, 0x80]);
led.writeSync([0x00]);
let res = led.readSync(3);
console.log(res);
*/

//#################################################
//# Configuration #################################
//#################################################

//# RGB maximum current settings per LED Temperature Derating, Ipulse(max) & per good color balance
//let rmax = 96; // # red max = 12mA
//let gmax = 120; // # grn max = 15mA
//let bmax = 128; // # blu max = 16mA

let rmax = 40; // # red max = 5mA
let gmax = 40; // # grn max = 5mA
let bmax = 40; // # blu max = 5mA

//# i2c Addresses Configuration
let SID_list = [0x68]; //   # list of all KTD2061/58/59/60 7-bit slave addresses on i2c bus
let SID = 0x68;
//# RGB Color Selection Register Configuration Map
let sREG_qty = 6; // # this is total quantity of selection registers in use across all chips
let sSID_list = [0x68, 0x68, 0x68, 0x68, 0x68, 0x68]; // # this is list of i2c chip addresses for the selection registers in use
let sREG_list = [0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E]; // # this is list of register addresses for the selection registers in use
//# Control Mode Configuration
let en_mode = 2; // # EnableMode:   1=night, 2=normal(day)
let be_en = 1; // # BrightExtend: 0=disabled, 1=enabled
let ce_temp = 2; // # CoolExtend:   0=135C, 1=120C, 2=105C, 3=90C


// Calculations and Useful Lists
let on = en_mode * 64 + be_en * 32 + ce_temp * 8; //  # calculate global on
let off = be_en * 32 + ce_temp * 8; //  # calculate global off
let fade_list = [0.032, 0.063, 0.125, 0.25, 0.5, 1, 2, 4]; //  # fade-rate exponential time-constant list
let gain_list = [90, 64, 45, 32, 22, 16, 11, 8, 5.6, 4, 2.8, 2, 1.4, 1]; //  # gain- or attenuation-factor in half-octaves
let full = sREG_qty;
let half = Math.round(sREG_qty / 2);


function i2c_write(addr, reg, data) {
    led.writeSync([reg, data]);
};

function sleep(milliseconds) {
    /*    let ms = 1000 * milliseconds;
        const date = Date.now();
        let currentDate = null;
        do {
            currentDate = Date.now();
        } while (currentDate - date < ms);
    */
    //console.log(Data.now());
    let i = 0;
    while (i < 1000) { i++; }

}

//  #################################################
//  # Core Functions ################################
//  #################################################

//  # Control Register Core Functions
function global_on(fade) {
    i2c_write(SID, 0x02, on + fade);
};

function global_off(fade) {
    i2c_write(SID, 0x02, off + fade);
};

function slow_off() {
    i2c_write(SID, 0x02, off + 7);
};

function global_reset() {
    i2c_write(SID, 0x02, 0xC0);
};

// # Color Palette Setting Registers Core Functions
function set_color0(ired0, igrn0, iblu0) {
    //for SID in SID_list:
    i2c_write(SID, 0x03, Math.round(ired0));
    i2c_write(SID, 0x04, Math.round(igrn0));
    i2c_write(SID, 0x05, Math.round(iblu0));
};

function set_color1(ired1, igrn1, iblu1) {
    //for SID in SID_list:
    i2c_write(SID, 0x06, Math.round(ired1));
    i2c_write(SID, 0x07, Math.round(igrn1));
    i2c_write(SID, 0x08, Math.round(iblu1));
};

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
};

function set_random_palette() {
    let ired0 = rmax / gain_list[getRandomInt(13)];
    let igrn0 = gmax / gain_list[getRandomInt(13)];
    let iblu0 = bmax / gain_list[getRandomInt(13)];
    let ired1 = rmax / gain_list[getRandomInt(13)];
    let igrn1 = gmax / gain_list[getRandomInt(13)];
    let iblu1 = bmax / gain_list[getRandomInt(13)];
    set_color0(ired0, igrn0, iblu0);
    set_color1(ired1, igrn1, iblu1);
};


//# RGB Color Selection Registers Core Functions
function select_all(isel) {
    for (let i = 0; i < full; i++) {
        i2c_write(sSID_list[i], sREG_list[i], isel);
    }
};

function select_off() {
    select_all(0x00);
};

function select_color0() {
    select_all(0x88);
};

function select_color1() {
    select_all(0xFF);
};

function select_one(i, isel, delay) {
    i2c_write(sSID_list[i], sREG_list[i], isel);
    sleep(1000 * delay);
};

function select_one_clear(i, isel, delay) {
    select_one(i, isel, delay);
    select_one(i, 0x00, 0);
};

function select_colors(isela12, isela34, iselb12, iselb34, iselc12, iselc34, delay) {
    // #This function serves as a map for the RGB modules in use.
    // #Modify this function to accommodate fewer RGBs or more RGBs with multiple ICs.
    // #Patterns calling this function will also need to be modified.

    // for SID in SID_list: 
    // #KTD2061 i2c address
    i2c_write(SID, 0x09, isela12);
    i2c_write(SID, 0x0A, isela34);
    i2c_write(SID, 0x0B, iselb12);
    i2c_write(SID, 0x0C, iselb34);
    i2c_write(SID, 0x0D, iselc12);
    i2c_write(SID, 0x0E, iselc34);
    sleep(delay);
};

// # Utility Library Functions
function util_quick_test(fade, delay) {
    //Quick Test Library Function# Checks that all LEDs are working.Displays 5 mA / LED white.
    global_reset();
    select_color0();
    global_on(fade);
    sleep(delay);
};


//# Breathing Library Functions
function breathe(cycles, fadeOn, timeOn, fadeOff, timeOff) {
    //  # Breathe Library Function
    //  # Uses global_on and global_off for simplest form of breathing
    //  # Breathes any combination of color pre-settings and pre-selections
    for (let i = 0; i < cycles; i++) {
        global_on(fadeOn);
        sleep(timeOn);
        global_off(fadeOff);
        sleep(timeOff);
    }
};

function chase_1down(cycles, fade, delay) {
    //# Chase One Down Library Function
    //# 1xRGB chases in downward direction of registers
    //# Color0 is chasing foreground; color1 is background
    global_on(fade);
    for (let i = 0; i < cycles; i++) {
        for (let j = (full - 1); j > -1; j--) {
            //for j in range(full - 1, -1, -1):
            select_one(j, 0x08, delay);
            select_one(j, 0x8F, delay);
            select_one(j, 0xFF, 0);
        }

    }
}


function amazin_boot(cycles) {
    //mimic smart - speaker boot, cycles = 11 on actual smart speaker
    slow_off();
    sleep(1.7); //# startup 1.7 s delay(3.7 s on some Dots)
    let delay = 1.32 / 2 / full; //# delay calc for 1.32 s per cycle# fade up to a dim blue
    set_color0(0, gmax, bmax); //# color0 = cyan
    set_color1(0, 0, bmax / 8); //# color1 = dim blue
    select_color1();
    global_on(7);
    sleep(3); //# chase cyan over dim blue
    chase_1down(cycles, 3, delay); //# fade = 3, delay
    slow_off(); //# chase amber over black
    set_color0(rmax, gmax / 4, 0); //# color0 = amber
    set_color1(0, 0, 0); //# color1 = black(off)
    chase_1down(cycles, 3, delay); //# fade = 3, delay
    global_off(3);
    sleep(1.25); //# delay of 1.25 s
};


//util_quick_test(7, 10);
//global_off(7);
//sleep(2);
//console.log("breathe");
//breathe(3, 7, 1.7, 3, 1.3);

amazin_boot(3);


led.closeSync();