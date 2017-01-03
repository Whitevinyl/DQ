
var Pad = [];

var Params = {
    rate: 0.80,
    depth: 0.80
};

var MasterIn, Playing, Limiter, Reverb, Delay, NoiseBuffer, NoiseBuffer2, VelocityEnabled, PitchBend, pluckPlayer, clapPlayer, dronePlayer, bassPlayer, sinePlayer;
var Reverbs = [0,0,0,0,0,0,0,0,0];

var pluckScale = [
    146.83, // d
    174.61, // f
    196,    // g // root
    220,    // a
    261.63, // c
    293.66, // d
    349.23, // f
    392     // g // root
];

var pluckWeight = [
    1,
    1,
    2,
    1,
    1,
    1,
    1,
    2
];


function setupAudio() {
    var i;
    Tone.Master.volume.value = 0;
    Limiter = new Tone.Limiter(-1);
    Limiter.toMaster();

    MasterIn = Limiter;


    Reverb = new Tone.Freeverb(0.4,3000);
    Reverb.connect(MasterIn);
    Reverb.receive("reverb");


    // NOISE//
    var bufferSize = Tone.context.sampleRate * 1;
    var roar = new Roar();

    NoiseBuffer = Tone.context.createBuffer(1, bufferSize, Tone.context.sampleRate);
    var output = NoiseBuffer.getChannelData(0);
    NoiseBuffer2 = Tone.context.createBuffer(1, bufferSize, Tone.context.sampleRate);
    var output2 = NoiseBuffer2.getChannelData(0);

    for (i=0; i<bufferSize; i++) {
        output[i] = (Math.random()*2) - 1;
        output2[i] = roar.process();
    }

    Pad[0] = new Tine();

    pluckPlayer = new PluckPlayer();
    clapPlayer = new ClapPlayer();
    dronePlayer = new DronePlayer();
    bassPlayer = new BassPlayer();
    sinePlayer = new SinePlayer();

    playAudio();




    /*for (i=0; i<Pad.length; i++) {
        Reverbs[i] = 0.1;
        var channel = Pad[i].Channel;
        channel.send("reverb",channel.gainToDb(Reverbs[i]));
    }*/

    VelocityEnabled = true;
    PitchBend = 1;
}

function pauseAudio() {
    playing = false;
    pluckPlayer.stop();
    clapPlayer.stop();
    dronePlayer.stop();
    bassPlayer.stop();
    sinePlayer.stop();
}

function playAudio() {
    playing = true;
    pluckPlayer.start();
    clapPlayer.start();
    dronePlayer.start();
    bassPlayer.start();
    sinePlayer.start();
}

//-------------------------------------------------------------------------------------------
//  ROAR
//-------------------------------------------------------------------------------------------


function Roar(threshold) {
    this.gain = 1;
    this.memory = 0;
    this.threshold = threshold || 0.8;
}

Roar.prototype.process = function() {
    var white = (Math.random() * 2 - 1);
    if (white>(-this.threshold) && white<this.threshold) {
        white = this.memory;
    }
    this.memory = white;
    return white * this.gain;
};


//-------------------------------------------------------------------------------------------
//  ENVELOPE
//-------------------------------------------------------------------------------------------

function Envelope() {
    this.Ctx = Tone.context;
    this.ADSR = this.Ctx.createGain();
    this.ADSR.gain.value = 0.001;
}
Envelope.prototype.trigger = function(time,g,a,d,s,r) {
    this.ADSR.gain.setValueAtTime(0.001, time);
    this.ADSR.gain.linearRampToValueAtTime(g, time + a);
    this.ADSR.gain.linearRampToValueAtTime(s*g, time + a + d);
    this.ADSR.gain.exponentialRampToValueAtTime(0.001, time + a + d + r);
};
Envelope.prototype.connect = function(dest) {
    this.ADSR.connect(dest);
};



//-------------------------------------------------------------------------------------------
//  TINE
//-------------------------------------------------------------------------------------------


function Tine() {
    this.Channel = new Tone.Volume(-18);
    this.Channel.connect(MasterIn);
    this.Ctx = Tone.context;
    this.Light = 0;
    this.Channel.send("reverb",-50);
}

Tine.prototype.setup = function() {

    this.Attack = 0.01 + (Math.random()*0.01);
    this.Decay = 0.05 + (Math.random()*0.05);
    this.Sustain = 0.05 + (Math.random()*0.15);
    this.Release = 0.2 + (Math.random()*0.6);
    this.Freq = (650 + Math.round(Math.random()*10)) * PitchBend; // 650

    // construct //
    this.Osc = this.Ctx.createOscillator();
    this.Osc.frequency.value = this.Freq;
    this.Envelope = new Envelope();
    var partials = TinePartials(10 + (Math.round(Math.random()*20)));
    SetPeriodicWave(this.Osc,partials,0);

    // connect //
    this.Osc.connect(this.Envelope.ADSR);
    this.Envelope.connect(this.Channel);
};

Tine.prototype.trigger = function(v) {
    this.setup();
    v = v || 128;
    var velocity = v/128;
    var now = this.Ctx.currentTime;
    this.Osc.start();
    this.Osc.stop(now + (this.Attack + this.Decay + this.Release));
    this.Envelope.trigger(now,velocity,this.Attack,this.Decay,this.Sustain,this.Release);
    Illuminate(this,velocity,this.Attack+this.Decay+this.Release);
};

//-------------------------------------------------------------------------------------------
//  KICK
//-------------------------------------------------------------------------------------------


function Kick() {
    this.Attack = 0.005;
    this.Channel = new Tone.Volume(-2);
    this.Channel.connect(MasterIn);
    this.Ctx = Tone.context;
    this.Light = 0;
    this.Channel.send("reverb",-50);
}

Kick.prototype.setup = function() {

    this.Attack = tombola.rangeFloat(1,3);
    this.Decay = 0.1;
    this.Sustain = 1;
    this.Release = tombola.rangeFloat(3,6);
    this.Freq = tombola.weightedItem([49,55,58.27],[1,0.4,0.5]);


    this.Osc = this.Ctx.createOscillator();
    this.Osc.type = "triangle";
    this.Osc.frequency.value = this.Freq*2;

    this.Osc2 = this.Ctx.createOscillator();
    this.Osc2.type = "sine";
    this.Osc2.frequency.value = this.Freq;

    this.Envelope = new Envelope();



    this.Osc.connect(this.Envelope.ADSR);
    this.Osc2.connect(this.Envelope.ADSR);
    this.Envelope.connect(this.Channel);

};

Kick.prototype.trigger = function(v) {
    this.setup();
    v = v || 90;
    var velocity = v/128;
    var now = this.Ctx.currentTime;
    this.Osc.start();
    this.Osc.stop(now + (this.Attack + this.Decay + this.Release));
    this.Osc2.start();
    this.Osc2.stop(now + (this.Attack + this.Decay + this.Release));

    this.Envelope.trigger(now,velocity,this.Attack,this.Decay,this.Sustain,this.Release);
};

//-------------------------------------------------------------------------------------------
//  SINE
//-------------------------------------------------------------------------------------------


function Sine() {
    this.Channel = new Tone.Volume(-8);
    this.Channel.connect(MasterIn);
    this.Ctx = Tone.context;
    this.Light = 0;
    this.Channel.send("reverb",-50);
}

Sine.prototype.setup = function() {

    if (this.Osc) {
        var now = this.Ctx.currentTime;
        this.GainWrapper.gain.setValueAtTime(1, now);
        this.GainWrapper.gain.linearRampToValueAtTime(0, now + 0.1);
    }

    this.Freq = tombola.range(70,130);
    this.Attack = 0.01 + (Math.random()*0.06);
    this.Decay = 2.6 + (Math.random()*0.8);
    this.Sustain = 0.15 + (Math.random()*0.1);
    this.Release = 0.4 + (Math.random()*0.2);

    /*this.Osc = new Tone.Oscillator(this.Freq,"triangle");
     this.Osc.volume.value = -10;
     this.Osc2 = new Tone.Oscillator(this.Freq,"sine");
     */


    this.Osc = this.Ctx.createOscillator();
    this.Osc.type = "triangle";
    this.Osc.frequency.value = this.Freq;

    this.Osc2 = this.Ctx.createOscillator();
    this.Osc2.type = "sine";
    this.Osc2.frequency.value = this.Freq;

    this.OscVol = new Tone.Volume(-10);
    this.Envelope = new Envelope();
    this.GainWrapper = this.Ctx.createGain();


    this.Osc.connect(this.OscVol);
    this.OscVol.connect(this.Envelope.ADSR);
    this.Osc2.connect(this.Envelope.ADSR);
    this.Envelope.connect(this.GainWrapper);
    this.GainWrapper.connect(this.Channel);

};

Sine.prototype.trigger = function(v) {
    this.setup();
    v = v || 75;
    var velocity = v/128;
    var now = this.Ctx.currentTime;
    this.Osc.start();
    this.Osc.frequency.setValueAtTime(this.Freq, now);
    this.Osc.frequency.exponentialRampToValueAtTime(20,now + this.Decay);
    this.Osc.stop(now + (this.Attack + this.Decay + this.Release));
    this.Osc2.start();
    this.Osc2.frequency.setValueAtTime(this.Freq, now);
    this.Osc2.frequency.exponentialRampToValueAtTime(20,now + this.Decay);
    this.Osc2.stop(now + (this.Attack + this.Decay + this.Release));

    /*this.Osc.start();
     this.Osc.frequency.exponentialRampToValue(20,this.Decay);
     this.Osc.stop("+" + (this.Attack + this.Decay + this.Release));
     this.Osc2.start();
     this.Osc2.frequency.exponentialRampToValue(20,this.Decay);
     this.Osc2.stop("+" + (this.Attack + this.Decay + this.Release));*/

    this.Envelope.trigger(now,velocity,this.Attack,this.Decay,this.Sustain,this.Release);
};

//-------------------------------------------------------------------------------------------
//  TIME 2
//-------------------------------------------------------------------------------------------


function Tine2() {
    this.Channel = new Tone.Volume(-8);
    this.Channel.connect(MasterIn);
    this.Ctx = Tone.context;
    this.Light = 0;
    this.Channel.send("reverb",-50);
}

Tine2.prototype.setup = function() {

    this.Attack = 0.005 + (Math.random()*0.005);
    this.Decay = 0.01 + (Math.random()*0.02);
    this.Sustain = 0.05 + (Math.random()*0.15);
    this.Release = 0.1 + (Math.random()*0.1);
    this.Freq = (900 + Math.round(Math.random()*6)) * PitchBend;

    // construct //
    this.Osc = this.Ctx.createOscillator();
    this.Osc.frequency.value = this.Freq;
    this.Envelope = new Envelope();
    var partials = HatPartials(15 + (Math.round(Math.random()*20)),1);
    SetPeriodicWave(this.Osc,partials,0);

    this.BandPass = this.Ctx.createBiquadFilter();
    this.BandPass.type = "bandpass";
    this.BandPass.frequency.value = 10000;
    this.HighPass = this.Ctx.createBiquadFilter();
    this.HighPass.type = "highpass";
    this.HighPass.frequency.value = 7000;

    // connect //
    this.Osc.connect(this.BandPass);
    this.BandPass.connect(this.HighPass);
    this.HighPass.connect(this.Envelope.ADSR);
    this.Envelope.connect(this.Channel);
};

Tine2.prototype.trigger = function(v) {
    this.setup();
    v = v || 128;
    var velocity = v/128;
    var now = this.Ctx.currentTime;
    this.Osc.start();
    this.Osc.stop(now + (this.Attack + this.Decay + this.Release));
    this.Envelope.trigger(now,velocity,this.Attack,this.Decay,this.Sustain,this.Release);
};

//-------------------------------------------------------------------------------------------
//  HAT
//-------------------------------------------------------------------------------------------


function Hat() {
    this.Channel = new Tone.Volume(-8);
    this.Channel.connect(MasterIn);
    this.Ctx = Tone.context;
    this.Light = 0;
    this.Channel.send("reverb",-50);
}

Hat.prototype.setup = function() {

    this.Attack = 0.005 + (Math.random()*0.005);
    this.Decay = 0.01 + (Math.random()*0.02);
    this.Sustain = 0.05 + (Math.random()*0.15);
    this.Release = 0.1 + (Math.random()*0.1);
    this.Freq = (500 + Math.round(Math.random()*6)) * PitchBend;

    // construct //
    this.Osc = this.Ctx.createOscillator();
    this.Osc.frequency.value = this.Freq;
    this.Envelope = new Envelope();
    var partials = HatPartials(15 + (Math.round(Math.random()*20)),1);
    SetPeriodicWave(this.Osc,partials,0);

    this.BandPass = this.Ctx.createBiquadFilter();
    this.BandPass.type = "bandpass";
    this.BandPass.frequency.value = 10000;
    this.HighPass = this.Ctx.createBiquadFilter();
    this.HighPass.type = "highpass";
    this.HighPass.frequency.value = 7000;

    // connect //
    this.Osc.connect(this.BandPass);
    this.BandPass.connect(this.HighPass);
    this.HighPass.connect(this.Envelope.ADSR);
    this.Envelope.connect(this.Channel);
};

Hat.prototype.trigger = function(v) {
    this.setup();
    v = v || 128;
    var velocity = v/128;
    var now = this.Ctx.currentTime;
    this.Osc.start();
    this.Osc.stop(now + (this.Attack + this.Decay + this.Release));
    this.Envelope.trigger(now,velocity,this.Attack,this.Decay,this.Sustain,this.Release);
};

//-------------------------------------------------------------------------------------------
//  HAT2
//-------------------------------------------------------------------------------------------


function Hat2() {
    this.Channel = new Tone.Volume(-2);
    this.Channel.connect(MasterIn);
    this.Ctx = Tone.context;
    this.Light = 0;
    this.Channel.send("reverb",-50);
}

Hat2.prototype.setup = function() {

    this.Attack = 0.005 + (Math.random()*0.005);
    this.Decay = 0.01 + (Math.random()*0.01);
    this.Sustain = 0.05 + (Math.random()*0.15);
    this.Release = 0.05 + (Math.random()*0.05);
    this.Freq = (40 + Math.round(Math.random()*6)) * PitchBend;

    // construct //
    this.Osc = this.Ctx.createOscillator();
    this.Osc.frequency.value = this.Freq;
    this.Envelope = new Envelope();
    var partials = HatPartials(80 + (Math.round(Math.random()*10)),2);
    SetPeriodicWave(this.Osc,partials,0);

    this.BandPass = this.Ctx.createBiquadFilter();
    this.BandPass.type = "bandpass";
    this.BandPass.frequency.value = 10000;
    this.HighPass = this.Ctx.createBiquadFilter();
    this.HighPass.type = "highpass";
    this.HighPass.frequency.value = 3000;

    // connect //
    this.Osc.connect(this.BandPass);
    this.BandPass.connect(this.HighPass);
    this.HighPass.connect(this.Envelope.ADSR);
    this.Envelope.connect(this.Channel);
};

Hat2.prototype.trigger = function(v) {
    this.setup();
    v = v || 128;
    var velocity = v/128;
    var now = this.Ctx.currentTime;
    this.Osc.start();
    this.Osc.stop(now + (this.Attack + this.Decay + this.Release));
    this.Envelope.trigger(now,velocity,this.Attack,this.Decay,this.Sustain,this.Release);
};

//-------------------------------------------------------------------------------------------
//  CLAP
//-------------------------------------------------------------------------------------------


function Clap() {
    this.Tremolo = new Tone.Tremolo(25,0.3);
    this.Tremolo.type = "sawtooth";
    this.Tremolo.spread = 5;
    this.Tremolo.start();
    this.Channel = new Tone.Volume(10);
    this.Input = new Tone.Mono();
    this.Input.connect(this.Tremolo);
    this.Tremolo.connect(this.Channel);
    this.Channel.connect(MasterIn);
    this.Ctx = Tone.context;
    this.Light = 0;
    this.Channel.send("reverb",-50);
}

Clap.prototype.setup = function() {

    // randomisation //
    this.Attack = tombola.rangeFloat(0.2,0.9);
    this.Decay = 0.05 + (Math.random()*0.05);
    this.Sustain = 1;
    this.Release = tombola.rangeFloat(1,5);
    this.Freq = tombola.range(100,800);
    this.Freq2 = tombola.range(1000,2500);
    this.Tremolo.frequency.value = tombola.rangeFloat(2,33);
    this.Tremolo.depth.value = tombola.weightedItem([0,tombola.rangeFloat(0.2,0.85)],[1,2]);

    // construct //
    this.Noise = this.Ctx.createBufferSource();
    this.Noise.buffer = NoiseBuffer2;
    this.Noise.loop = true;
    this.Envelope = new Envelope();

    this.BandPass = this.Ctx.createBiquadFilter();
    this.BandPass.type = "bandpass";
    this.BandPass.frequency.value = this.Freq2;
    this.HighPass = this.Ctx.createBiquadFilter();
    this.HighPass.type = "highpass";
    this.HighPass.frequency.value = 850;

    // connect //
    this.Noise.connect(this.BandPass);
    this.BandPass.connect(this.HighPass);
    this.HighPass.connect(this.Envelope.ADSR);
    this.Envelope.connect(this.Input);

};

Clap.prototype.trigger = function(v) {
    this.setup();
    v = v || 50;
    var velocity = v/128;
    var now = this.Ctx.currentTime;
    this.Noise.start();
    this.Noise.stop(now + (this.Attack + this.Decay + this.Release));
    this.BandPass.frequency.setValueAtTime(this.Freq2, now);
    this.BandPass.frequency.exponentialRampToValueAtTime(this.Freq2 - 50,now + this.Decay);
    this.BandPass.frequency.exponentialRampToValueAtTime(this.Freq,now + this.Decay + this.Release);
    this.Envelope.trigger(now,velocity,this.Attack,this.Decay,this.Sustain,this.Release);
};

//-------------------------------------------------------------------------------------------
//  SNARE
//-------------------------------------------------------------------------------------------


function Snare() {
    this.Channel = new Tone.Volume(-8);
    this.Channel.connect(MasterIn);
    this.Ctx = Tone.context;
    this.Light = 0;
    this.Channel.send("reverb",-50);
}

Snare.prototype.setup = function() {

    // randomisation //
    this.Attack = 0.005 + (Math.random()*0.005);
    this.Decay = 0.04 + (Math.random()*0.02);
    this.Sustain = 0.05 + (Math.random()*0.05);
    this.Release = 0.2 + (Math.random()*0.2);
    this.Freq = (4000 - Math.round(Math.random()*400)) * PitchBend;
    this.Freq2 = (3600 - Math.round(Math.random()*100)) * PitchBend;

    // construct //
    this.Noise = this.Ctx.createBufferSource();
    this.Noise.buffer = NoiseBuffer;
    this.Envelope = new Envelope();

    this.Osc = this.Ctx.createOscillator();
    this.Osc.frequency.value = 100;
    this.Osc.type = "triangle";
    this.Envelope2 = new Envelope();
    /*var partials = SnarePartials(15 + (Math.round(Math.random()*20)));
     SetPeriodicWave(this.Osc,partials,0);*/

    this.BandPass = this.Ctx.createBiquadFilter();
    this.BandPass.type = "bandpass";
    this.BandPass.frequency.value = this.Freq2;
    this.HighPass = this.Ctx.createBiquadFilter();
    this.HighPass.type = "highpass";
    this.HighPass.frequency.value = 1100;

    // connect //
    this.Noise.connect(this.HighPass);
    //this.BandPass.connect(this.HighPass);
    this.HighPass.connect(this.Envelope.ADSR);
    this.Envelope.connect(this.Channel);
    this.Osc.connect(this.Envelope2.ADSR);
    this.Envelope2.connect(this.Channel);

};

Snare.prototype.trigger = function(v) {
    this.setup();
    v = v || 128;
    var velocity = v/128;
    var now = this.Ctx.currentTime;
    this.Noise.start();
    this.Noise.stop(now + (this.Attack + this.Decay + this.Release));
    this.Osc.start();
    this.Osc.stop(now + (this.Attack + this.Decay + this.Release));
    this.HighPass.frequency.setValueAtTime(1100, now);
    this.HighPass.frequency.exponentialRampToValueAtTime(1100,now + this.Decay);
    this.HighPass.frequency.exponentialRampToValueAtTime(500,now + this.Decay + this.Release);
    /*this.BandPass.frequency.setValueAtTime(this.Freq2, now);
     this.BandPass.frequency.exponentialRampToValueAtTime(this.Freq2 - 50,now + this.Decay);
     this.BandPass.frequency.exponentialRampToValueAtTime(this.Freq,now + this.Decay + this.Release);*/
    this.Envelope.trigger(now,velocity,this.Attack,this.Decay,this.Sustain,this.Release);
    this.Envelope2.trigger(now,velocity*0.7,this.Attack,this.Decay*0.25,this.Sustain,this.Release*0.25);
};



function Snare2() {
    this.Channel = new Tone.Volume(-5);
    this.Channel.connect(MasterIn);
    this.Ctx = Tone.context;
    this.Light = 0;
    this.Channel.send("reverb",-50);
}

Snare2.prototype.setup = function() {

    // randomisation //
    this.Attack = 0.005 + (Math.random()*0.005);
    this.Decay = 0.04 + (Math.random()*0.02);
    this.Sustain = 0.05 + (Math.random()*0.05);
    this.Release = 0.2 + (Math.random()*0.2);
    this.Freq = (3000 - Math.round(Math.random()*200)) * PitchBend;
    this.Freq2 = (4400 - Math.round(Math.random()*200)) * PitchBend;

    // construct //
    this.Noise = this.Ctx.createBufferSource();
    this.Noise.buffer = NoiseBuffer;
    this.Envelope = new Envelope();

    this.Osc = this.Ctx.createOscillator();
    this.Osc.frequency.value = 100;
    this.Osc.type = "triangle";
    this.Envelope2 = new Envelope();
    /*var partials = SnarePartials(15 + (Math.round(Math.random()*20)));
     SetPeriodicWave(this.Osc,partials,0);*/

    this.BandPass = this.Ctx.createBiquadFilter();
    this.BandPass.type = "bandpass";
    this.BandPass.frequency.value = this.Freq2;
    this.HighPass = this.Ctx.createBiquadFilter();
    this.HighPass.type = "highpass";
    this.HighPass.frequency.value = 500;

    // connect //
    this.Noise.connect(this.BandPass);
    this.BandPass.connect(this.HighPass);
    this.HighPass.connect(this.Envelope.ADSR);
    this.Envelope.connect(this.Channel);
    this.Osc.connect(this.Envelope2.ADSR);
    this.Envelope2.connect(this.Channel);

};

Snare2.prototype.trigger = function(v) {
    this.setup();
    v = v || 128;
    var velocity = v/128;
    var now = this.Ctx.currentTime;
    this.Noise.start();
    this.Noise.stop(now + (this.Attack + this.Decay + this.Release));
    this.Osc.start();
    this.Osc.stop(now + (this.Attack + this.Decay + this.Release));
    this.BandPass.frequency.setValueAtTime(this.Freq2, now);
    this.BandPass.frequency.exponentialRampToValueAtTime(this.Freq - 50,now + this.Decay);
    this.BandPass.frequency.exponentialRampToValueAtTime(this.Freq2,now + this.Decay + this.Release);
    this.Envelope.trigger(now,velocity,this.Attack,this.Decay,this.Sustain,this.Release);
    this.Envelope2.trigger(now,velocity*0.7,this.Attack,this.Decay*0.25,this.Sustain,this.Release*0.25);
};


//-------------------------------------------------------------------------------------------
//  PIPE
//-------------------------------------------------------------------------------------------


function Pipe(mode) {
    this.Channel = new Tone.Volume(-8);
    this.Channel.connect(MasterIn);
    this.Ctx = Tone.context;
    this.Mode = mode || 1;
    this.Light = 0;
    this.Channel.send("reverb",-50);
}

Pipe.prototype.setup = function() {

    // randomisation //
    this.Attack = tombola.rangeFloat(0.15,0.4);
    this.Decay = 0.04 + (Math.random()*0.02);
    this.Sustain = 0.1;
    this.Release = tombola.rangeFloat(0.15,4);
    this.Freq = (500 - Math.round(Math.random()*100)) * PitchBend;
    this.Freq2 = (1800 - Math.round(Math.random()*100)) * PitchBend;
    this.Freq3 = 98;
    this.Freq3 = 82.02;

    // construct //
    this.Noise = this.Ctx.createBufferSource();
    this.Noise.loop = true;
    this.Noise.buffer = NoiseBuffer;
    this.Envelope = new Envelope();

    this.Osc = this.Ctx.createOscillator();
    this.Osc.frequency.value = this.Freq3;
    this.Envelope2 = new Envelope();
    var partials = PipePartials(15 + (Math.round(Math.random()*20)),this.Mode);
    SetPeriodicWave(this.Osc,partials,0);

    this.BandPass = this.Ctx.createBiquadFilter();
    this.BandPass.type = "bandpass";
    this.BandPass.frequency.value = this.Freq2;
    this.HighPass = this.Ctx.createBiquadFilter();
    this.HighPass.type = "highpass";
    this.HighPass.frequency.value = 500;

    // connect //
    this.Noise.connect(this.BandPass);
    this.BandPass.connect(this.HighPass);
    this.HighPass.connect(this.Envelope.ADSR);
    this.Envelope.connect(this.Channel);
    this.Osc.connect(this.Envelope2.ADSR);
    this.Envelope2.connect(this.Channel);

};

Pipe.prototype.trigger = function(v) {
    this.setup();
    v = v || 30;
    var velocity = v/128;
    var now = this.Ctx.currentTime;
    this.Noise.start();
    this.Noise.stop(now + (this.Attack + this.Decay + this.Release));
    this.Osc.start();
    this.Osc.stop(now + (this.Attack + this.Decay + this.Release));
    this.Osc.frequency.setValueAtTime(this.Freq3, now);
    this.BandPass.frequency.exponentialRampToValueAtTime(this.Freq3 + 10,now + this.Decay);
    this.BandPass.frequency.setValueAtTime(this.Freq2, now);
    this.BandPass.frequency.exponentialRampToValueAtTime(this.Freq2 - 100,now + this.Decay);
    this.BandPass.frequency.exponentialRampToValueAtTime(this.Freq,now + this.Decay + this.Release);
    this.Envelope.trigger(now,velocity*0.8,this.Attack,this.Decay,this.Sustain,this.Release);
    this.Envelope2.trigger(now,velocity,this.Attack,this.Decay*0.75,this.Sustain,this.Release*0.75);
};


//-------------------------------------------------------------------------------------------
//  TONE
//-------------------------------------------------------------------------------------------


function RandTone() {
    this.Tremolo = new Tone.Tremolo(25,0.3);
    this.Tremolo.type = "triangle";
    this.Tremolo.spread = 5;
    this.Tremolo.start();
    this.Channel = new Tone.Volume(-8);
    this.Channel.connect(this.Tremolo);
    this.Tremolo.connect(MasterIn);
    this.Ctx = Tone.context;
    this.Light = 0;
    this.Channel.send("reverb",-50);
}
var proto = RandTone.prototype;

proto.setup = function() {

    // randomisation //
    this.Attack = tombola.rangeFloat(3,6);
    this.Decay = 0.1;
    this.Sustain = 1;
    this.Release = tombola.rangeFloat(6,9);
    this.Freq = 82.02;
    this.Freq = 98;
    this.Tremolo.frequency.value = tombola.rangeFloat(0.5,18);
    this.Tremolo.depth.value = tombola.rangeFloat(0,0.7);

    // construct //
    this.Noise = this.Ctx.createBufferSource();
    this.Noise.loop = true;
    this.Noise.buffer = NoiseBuffer2;
    this.Envelope = new Envelope();

    this.Osc = this.Ctx.createOscillator();
    this.Osc.frequency.value = this.Freq;
    this.Envelope2 = new Envelope();
    var partials = RandomPartials(tombola.range(15,35));
    SetPeriodicWave(this.Osc,partials,0);

    this.LowPass = this.Ctx.createBiquadFilter();
    this.LowPass.type = "lowpass";
    this.LowPass.frequency.value = 4000;

    // connect //
    this.Noise.connect(this.LowPass);
    this.LowPass.connect(this.Envelope.ADSR);
    this.Envelope.connect(this.Channel);
    this.Osc.connect(this.Envelope2.ADSR);
    this.Envelope2.connect(this.Channel);
};

proto.trigger = function(v) {
    this.setup();
    v = v || 80;
    var velocity = v/128;
    var now = this.Ctx.currentTime;
    this.Noise.start();
    this.Noise.stop(now + (this.Attack + this.Decay + this.Release));
    this.Osc.start();
    this.Osc.stop(now + (this.Attack + this.Decay + this.Release));
    this.Envelope.trigger(now,velocity*0.05,this.Attack,this.Decay,this.Sustain,this.Release);
    this.Envelope2.trigger(now,velocity,this.Attack,this.Decay*0.75,this.Sustain,this.Release*0.75);
};


//-------------------------------------------------------------------------------------------
//  PLUCK
//-------------------------------------------------------------------------------------------


function Pluck() {
    this.Tremolo = new Tone.Tremolo(25,0.3);
    this.Tremolo.type = "triangle";
    this.Tremolo.spread = 5;
    this.Tremolo.start();
    this.Channel = new Tone.Volume(-2);
    this.Channel.connect(this.Tremolo);
    this.Tremolo.connect(MasterIn);
    this.Ctx = Tone.context;
    this.Light = 0;
    this.Channel.send("reverb",-5);
}
proto = Pluck.prototype;

proto.setup = function(f) {

    if (tombola.percent(30)) {
        f = f*2;
    } else {
        if (tombola.percent(30)) {
            f = f/2;
        }
    }

    this.Attack = tombola.rangeFloat(0.005,0.01);
    this.Decay = 0.01;
    this.Sustain = 0.4;
    this.Release = tombola.rangeFloat(2,3);
    this.Tremolo.frequency.value = tombola.rangeFloat(5,12);
    this.Tremolo.depth.value = tombola.rangeFloat(0.3,0.6);

    var partials;
    this.Osc = this.Ctx.createOscillator();
    partials = RandomPartials(tombola.range(10,16));
    SetPeriodicWave(this.Osc,partials,0);
    //this.Osc.type = "triangle";
    this.Osc.frequency.value = f*0.99;

    this.Osc2 = this.Ctx.createOscillator();
    partials = RandomPartials(tombola.range(10,16));
    SetPeriodicWave(this.Osc2,partials,0);
    //this.Osc2.type = "triangle";
    this.Osc2.frequency.value = f*1.015;

    this.Envelope = new Envelope();


    this.Osc.connect(this.Envelope.ADSR);
    this.Osc2.connect(this.Envelope.ADSR);
    this.Envelope.connect(this.Channel);
};

proto.trigger = function(v,f) {
    this.setup(f);
    v = v || 100;
    var velocity = v/128;
    var now = this.Ctx.currentTime;
    this.Osc.start();
    this.Osc.stop(now + (this.Attack + this.Decay + this.Release));
    this.Osc2.start();
    this.Osc2.stop(now + (this.Attack + this.Decay + this.Release));

    this.Envelope.trigger(now,velocity,this.Attack,this.Decay,this.Sustain,this.Release);
};


function PluckPlayer() {
    this.pluck = new Pluck();
    this.timer = null;
}
proto = PluckPlayer.prototype;

proto.start = function() {
    var that = this;
    this.timer = setTimeout(function(){that.phrase();},2000);
};

proto.phrase = function() {
    var notes = tombola.range(6,14);
    var quarter = 2000;
    var eighth = quarter/2;
    var sixteenth = eighth/2;
    var thirtysecond = sixteenth/2;
    var time = 0;
    var val = 0;

    var that = this;
    for (var i=0; i<notes; i++) {
        this.timer = setTimeout(function(){that.hit();},time);

        val = tombola.weightedItem([quarter,eighth,sixteenth,thirtysecond],[0.8,3,3,0.8]);
        time += val;
        if (val===thirtysecond) {
            this.timer = setTimeout(function(){that.hit();},time);
            time += val;
        }
    }
    time += (tombola.range(1,3)*quarter);
    this.timer = setTimeout(function(){that.phrase();},time);
};

proto.hit = function() {
    this.pluck.trigger(30,tombola.weightedItem(pluckScale,pluckWeight));
    if (tabFocused) {
        pips.burst();
    }
    /*var that = this;
    var time = tombola.weightedItem([1000,2000],2,1);
    this.timer = setTimeout(function(){that.hit();},time);*/
};


proto.stop = function() {
    clearTimeout(this.timer);
};


function ClapPlayer() {
    this.clap = new Clap();
    this.timer = null;
}
proto = ClapPlayer.prototype;

proto.start = function() {
    var that = this;
    this.timer = setTimeout(function(){that.hit();},7000);
};

proto.hit = function() {
    this.clap.trigger();
    if (tabFocused) {
        splitter.burst();
    }
    var that = this;
    var time = tombola.range(1000,15000);
    this.timer = setTimeout(function(){that.hit();},time);
};


proto.stop = function() {
    clearTimeout(this.timer);
};



function DronePlayer() {
    this.drone = new RandTone();
    this.timer = null;
}
proto = DronePlayer.prototype;

proto.start = function() {
    var that = this;
    this.timer = setTimeout(function(){that.hit();},1000);
};

proto.hit = function() {
    this.drone.trigger();
    if (tabFocused) {
        bursts.burst();
    }
    var that = this;
    var time = tombola.range(4000,14000);
    this.timer = setTimeout(function(){that.hit();},time);
};


proto.stop = function() {
    clearTimeout(this.timer);
};



function BassPlayer() {
    this.bass = new Kick();
    this.timer = null;
}
proto = BassPlayer.prototype;

proto.start = function() {
    var that = this;
    var time = tombola.range(9000,20000);
    this.timer = setTimeout(function(){that.hit();},time);
};

proto.hit = function() {
    this.bass.trigger();
    if (tabFocused) {
        vert.burst();
    }
    var that = this;
    var time = tombola.range(9000,20000);
    this.timer = setTimeout(function(){that.hit();},time);
};


proto.stop = function() {
    clearTimeout(this.timer);
};



function SinePlayer() {
    this.sine = new Sine();
    this.timer = null;
}
proto = SinePlayer.prototype;

proto.start = function() {
    var that = this;
    var time = tombola.range(15000,40000);
    this.timer = setTimeout(function(){that.hit();},time);
};

proto.hit = function() {
    this.sine.trigger();
    var that = this;
    var time = tombola.range(15000,40000);
    this.timer = setTimeout(function(){that.hit();},time);
};


proto.stop = function() {
    clearTimeout(this.timer);
};