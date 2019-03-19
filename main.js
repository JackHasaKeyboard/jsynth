var sett = {
	"vol": -1
};

document.addEventListener("DOMContentLoaded", function() {
	const js = "#f0db4f";

	/* audio */
	const ctxAudio = new (window.AudioContext || window.webkitAudioContext)();

	var osc = ctxAudio.createOscillator();

	const sz = Math.pow(2, 10);
	var
		analyser = ctxAudio.createAnalyser(),
		proc = ctxAudio.createScriptProcessor(sz, 1, 1);

	analyser.fftSize = sz;

	// visualizer
	var data = new Uint8Array(analyser.frequencyBinCount);

	const
		canv = document.getElementById("osc"),
		ctxCanv = canv.getContext("2d");

	proc.onaudioprocess = function() {
		analyser.getByteFrequencyData(data);

		ctxCanv.fillStyle = js;
		ctxCanv.fillRect(
			0,
			0,
			canv.width,
			canv.height
		);

		for (let i = 0; i < data.length; i++) {
			ctxCanv.fillStyle = "#111";
			ctxCanv.fillRect(
				i,
				-(canv.height / 255) * data[i],
				1,
				canv.height
			);
		}
	}

	var vol = ctxAudio.createGain();

	// connect
	osc.connect(analyser);
	osc.connect(ctxAudio.destination);
	analyser.connect(proc);
	proc.connect(ctxAudio.destination);
	vol.connect(ctxAudio.destination);
	osc.connect(vol);

	osc.start();

	// volume
	vol.gain.value = sett["vol"];

	const
		pc = 100 / 2,
		val = (sett["vol"] + 1) * pc;
	$("#vol").val(val);

	$("#vol").change(function() {
		const
			pc = (2 / 100),
			val = (this.value) * pc;

		sett["vol"] = val;
	});

	// mod
	for (let i = 0; i < 8; i++) {
		$("#mod").append(
			`
			<div>
				<svg
					class="nut"
					fill="#111"
				>
					<polygon
						points="
						50, 25
						37.5, 46.666666
						12.5, 46.666666
						0, 25
						12.5, 3.333333
						37.5, 3.333333
						"
					/>
					<circle
						fill="#060606"
						cx="25"
						cy="25"
						r="12.5"
					/>
				</svg>

				<div>${(i % 2 == 0 ? "IN" : "OUT")}</div>
			</div>
			`
		);
	}

	var grab = false,
			i = null;

	function toHex(d) {
		return ("0"+(Number(d).toString(16))).slice(-2).toUpperCase()
	}

	$("#mod div").mousedown(function() {
		var no = $("#mod .cable").length,
				inc = Math.floor((0xFFFFFF / 8) / 3),

				col = (inc * no).toString(16);

		$("#mod").append(
			`
			<svg
				class="cable"
				id="active"
				width="1000px"
				fill="transparent"
				stroke="#${col}"
				stroke-width="10px"
				stroke-linecap="round"
				overflow="visible"
			>
				<path
					d="M " + start.x + ", " + start.y +
					" C " + start.x + ", " + start.y + " " + mid + ", " + (600 - mid) + " " + end.x + ", " + end.y
				/>
			</svg>
			`
		);

		const offset = {
						x: $(this).offset().left,
						y: $(this).offset().top
					},
					start = {
						x: (offset.x - 8) + ($(this).width() / 2),
						y: 25 + 8
					};

		var end = {
					x: event.clientX - 8,
					y: event.clientY - offset.y + 8
				},
				mid = start.x + (end.x - start.x) / 2;

		grab = true;

		$("#mod").mousemove(function() {
			if (grab) {
				end = {
					x: event.clientX - 8,
					y: event.clientY - offset.y + 8
				};

				mid = start.x + (end.x - start.x) / 2;

				$("#mod .cable#active path").attr(
					"d",
					"M " + start.x + ", " + start.y + " C " + start.x + ", " + start.y + " " + mid + ", " + (600 - mid) + " " + end.x + ", " + end.y
				);
			}
		});

		$("#mod div").mouseenter(function() {
			i = $(this).index();
		});

		$("#mod div").mouseleave(function() {
			i = null;
		});

		$("#mod div").mouseup(function() {
			if (i) {
				const port = $(this);

				end = {
					x: port.offset().left + 8 + 8,
					y: 25 + 8
				};

				$("#mod .cable#active path").attr(
					"d",
					"M " + start.x + ", " + start.y +
					" C " + start.x + ", " + start.y + " " + mid + ", " + (600 - mid) + " " + end.x + ", " + end.y
				);

				$(".cable#active").removeAttr("id");
			} else {
				$("#mod .cable#active").remove();
			}

			grab = false;
		});
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
	const form = {
		"sine": `
			M 0, 8
			C 0 8, 8 24, 16 8
			C 16 8, 24 -8, 32 8

			C 32 8, 40 24, 48 8
			C 48 8, 56 -8, 64 8

			C 64 8, 72 24, 80 8
			C 80 8, 88 -8, 96 8
		`,
		"square": `
			M 0, 16
			L 16, 16
			L 16, 0
			L 32, 0
			L 32, 16
			L 48, 16
			L 48, 0
			L 64, 0
			L 64, 16
			L 80, 16
			L 80, 0
			L 96, 0
		`,
		"sawtooth":`
			M 0, 16
			L 16, 0
			L 32, 16
			L 48, 0
			L 64, 16
			L 80, 0
		`,
		"triangle": `
			M 0, 16
			L 32, 0
			L 32, 16
			L 64, 0
			L 64, 16
			L 96, 0
		`
	}

	$("#wave").append(
		`
		<svg>
			<path
				stroke=${js}
				stroke-width="4px"
				stroke-linecap="round"
				fill="transparent"
			/>
		</svg>
		`
	);

	$("#wave svg path").attr("d", form["sine"]);

	for (const wave in form) {
		$("#input select").append("<option>" + wave + "</option>");
	}

	$("#input select").change(function() {
		$("#wave svg path").attr("d", form[this.value]);
	});

	// key
	const
		c4 = 261.63,
		c5 = 523.25,

		octave = Math.abs(c4 - c5);

	// white
	$("#white > div").mousedown(function() {
		$(this).find(".key").css({
			"height": "calc(calc(" + 6 + "in / 2) * 0.84)",
			"box-shadow": "0 6px #333"
		});

		const i = $(this).index();

		osc.frequency.value = c4 + (i * (octave / 8));
		vol.gain.value = sett["vol"];
	});

	$("#white div").mouseup(function() {
		$(this).find(".key").css({
			"height": "calc(" + 6 + "in / 2)",
			"box-shadow": "0 10px #333"
		});

		vol.gain.value = -1;
	});
	$("#white div").mouseleave(function() {
		$(this).find(".key").css({
			"height": "calc(" + 6 + "in / 2)",
			"box-shadow": "0 10px #333"
		});

		vol.gain.value = -1;
	});

	// black
	$("#black > div").mousedown(function() {
		$(this).find(".key").css({
			"height": (((5 / 8) * 3) * 0.84) + "in",
			"box-shadow": "0 6px #333"
		});

		vol.gain.value = sett["vol"];
	});

	$("#black div").mouseup(function() {
		$(this).find(".key").css({
			"height": ((5 / 8) * 3) + "in",
			"box-shadow": "0 10px #333"
		});

		vol.gain.value = -1;
	});
	$("#black div").mouseleave(function() {
		$(this).find(".key").css({
			"height": ((5 / 8) * 3) + "in",
			"box-shadow": "0 10px #333"
		});

		vol.gain.value = -1;
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
			"box-shadow": "0 4px 0 0 #161616"
		});
	});
});
