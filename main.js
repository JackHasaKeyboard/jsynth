document.addEventListener("DOMContentLoaded", function() {
	// context
	const
		ctx = new (window.AudioContext || window.webkitAudioContext)(),
		ctx2 = new (window.AudioContext || window.webkitAudioContext)();

		requestAnimationFrame = (window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame);

	// oscillator
	let osc = ctx.createOscillator();

	osc.connect(ctx.destination);

	// volume
	var gainNode = ctx.createGain();

	osc.connect(gainNode);
	gainNode.connect(ctx.destination);

	// todo: make work
	$("#vol").change(function(e) {
		gainNode.gain.value = e.target.value;
	});

	// key
	// white
	for (let i = 0; i < 8; i++) {
		$("#board #white").append("<div><div class='key'></div></div>");
	}

	// black
	var flat = true;
	for (let i = 0; i < 8; i++) {
		$("#board #black").append("<div></div>");

		if (i % 3 == 0 && i !== 0) {
			flat = !flat;
		}

		if (flat) {
			if (i == 0 || i == 1) {
				$("#black div:nth-child(" + (i + 1) + ")").append("<div class='key'></div>");
			}
		} else {
			if (i == 3 || i == 4 || i == 5) {
				$("#black div:nth-child(" + (i + 1) + ")").append("<div class='key'></div>");
			}
		}
	}

	// wave
	[
		"sine",
		"square",
		"sawtooth",
		"triangle"
	].forEach(function(type) {
		$("#input select").append("<option>" + type + "</option>");
	});

	$("#input select").change(function() {
		osc.type = this.value;
	});

	// note
	$("#white > div").mousedown(function() {
		let ht = parseInt($(this).css("height"));

		$(this).find(".key").css({
			"height": ht * 0.8 + "px",
			"box-shadow": "0 8px #333"
		});

		osc.frequency.value = 220 + (($(this).index() - 1) * 27.5);

		ctx.resume();
		osc.start();


		setupAudioNode();

		jsNode.onaudioprocess = function() {
			analyserNode.getByteTimeDomainData(amp);

			if (play == true) {
				requestAnimationFrame(drawTimeDomain);
			}
		}

		if (audioDat) {
			playSnd(audioDat);
		} else {
			load("asdf.ogg");
		}
	});

	$("#white div").mouseup(function() {
		let ht = parseInt($(this).css("height"));

		$(this).find(".key").css({
			"height": ht + "px",
			"box-shadow": "0 10px #333"
		});

		ctx.suspend();
	});

	// launchpad
	for (let r = 0; r < 3; r++) {
		$("#launchpad").append("<tr></tr>");

		for (let c = 0; c < 3; c++) {
			$("#launchpad tr:nth-child(" + (r + 1) + ")").append("<td><div></div></td>");
		}
	}

	$("#launchpad div").mousedown(function() {
		$(this).css({
			"box-shadow": "none"
		});
	});

	$("#launchpad div").mouseup(function() {
		$(this).css({
			"box-shadow": "1.6px 1.6px 1.6px 1.6px #161616"
		});
	});
});

AudioCtx = (window.webkitAudioContext || window.AudioContext || window.mozAudioContext);

let
	audioCtx,
	audioBuff,

	src,
	analyserNode,
	jsNode,
	audioDat,
	play = false,
	sampRate = 1024,
	amp,

	ctx;

const canv = {
	"wd": 512,
	"ht": 256
};

document.addEventListener("DOMContentLoaded", function() {
	ctx2d = document.getElementById("osc").getContext("2d");

	audioCtx = new AudioCtx();
});

function setupAudioNode() {
	src = audioCtx.createBufferSource();
	analyserNode = audioCtx.createAnalyser();
	jsNode = audioCtx.createScriptProcessor(sampRate, 1, 1);

	amp = new Uint8Array(analyserNode.frequencyBinCount);

	src.connect(audioCtx.destination);
	src.connect(analyserNode);
	analyserNode.connect(jsNode);
	jsNode.connect(audioCtx.destination);
}

function load(url) {
	const req = new XMLHttpRequest();

	req.open("GET", url, true);

	req.responseType = "arraybuffer";

	req.onload = function() {
		audioCtx.decodeAudioData(req.response, function(buff) {
			audioDat = buff;

			playSnd(audioDat);
		}, null);
	}

	req.send();
}

function playSnd(buff) {
	src.buffer = buff;

	src.start(0);

	play = true;
}

function drawTimeDomain() {
	// ctx2 = new (window.AudioContext || window.webkitAudioContext)();

	// var
	// 	canvas1 = document.getElementById("osc"),
	// 	canvas2 = document.getElementById("osc2");

	// ctx2.clearRect(0, 0, canv.wd, canv.ht);
	// ctx2.globalAlpha = 0.9;
	// ctx2.drawImage(canvas1, 0, 0);

	// ctx.clearRect(0, 0, canv.wd, canv.ht);
	// ctx.drawImage(canvas2, 0, 0);

	ctx2d.clearRect(0, 0, canv.wd, canv.ht);

	for (var i = 0; i < amp.length; i++) {
		var
			val = amp[i] / 256,
			y = canv.ht - (canv.ht * val);

		ctx2d.fillStyle = "#f0db4f";
		ctx2d.fillRect(i, y, 1.6, 1.6);
	}
}
