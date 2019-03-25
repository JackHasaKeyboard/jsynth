const attr = {
	"de-tune": {
		"min": -50,
		"max": 50
	},
	"rate": {
		"min": 1,
		"max": 1000
	}, 
	"gain": {
		"min": 0,
		"max": 1
	}
};

var
	sett = {
		"vol": -1,
		"osc": [
			{
				"de-tune": 0,
				"rate": 0,
				"gain": 0
			}, {
				"de-tune": 0,
				"rate": 0,
				"gain": 0
			}, {
				"de-tune": 0,
				"rate": 0,
				"gain": 0
			}, {
				"de-tune": 0,
				"rate": 0,
				"gain": 0
			}
		]
	},

	dir = 1;

function polarToCart(
	centerX,
	centerY,
	radius,
	angleInDeg
) {
	var angleInRad = (angleInDeg-90) * Math.PI / 180.0;

	return {
		x: centerX + (radius * Math.cos(angleInRad)),
		y: centerY + (radius * Math.sin(angleInRad))
	};
}

function descArc(
	x,
	y,
	radius,
	startAngle,
	endAngle
) {
	var
		start = polarToCart(x, y, radius, endAngle),
		end = polarToCart(x, y, radius, startAngle),

		largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1",

		d = [
			"M", start.x, start.y,
			"A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
		].join(" ");

	return d;
}

function dial(
	type
) {
	return `
	<div
		class="dial ${type}"
	>
		<div>
			<svg
				overflow="visible"
				id="shadow"
			>
				<filter
					id="dropShadow"
					height="110%"
				>
					<feGaussianBlur
						in="SourceAlpha"
						stdDeviation="1.6"
					/>
					<feOffset
						dx="0"
						dy="0"
						result="offsetblur"
					/>

					<feComponentTransfer>
						<feFuncA
							type="linear"
							slope="0.32"
						/>
					</feComponentTransfer>
					<feMerge>
						<feMergeNode/>
						<feMergeNode
							in="SourceGraphic"
						/>
					</feMerge>
				</filter>

				<circle
					cx="32"
					cy="32"
					r="16"
					fill="#222"
					style="filter:url(#dropShadow)"
					overflow="visible"
					transform="translate(0, -100)"
				/>
			</svg>

			<svg
				width="84"
				height="44"
				transform="translate(0, 32)"
				fill="transparent"
				stroke="#080808"
				stroke-width="4"
			>
				<circle
					cx="32"
					cy="32"
					r="26"
					transform="translate(0, -32)"
				/>
			</svg>

			<svg
				class="active"
				width="84"
				height="64"
				transform="translate(-12, 32)"
			>
				<path
					transform="translate(42, 32)"
					d="${descArc(0, 0, 26, 0, 180)}"
					fill="transparent"
					stroke="#f0db4f"
					stroke-width="4"
				/>
			</svg>

			<svg
				class="pointer"
				width="64"
				height="64"
			>
				<path
					d="M 0, -8 L 0, 0"
					stroke="#f0db4f"
					stroke-width="4"
				/>
			</svg>

			<svg
				class="line"
				width="64"
				height="64"
				overflow="visible"
				transform="translate(32, 32)"
			>
				<g
					id="lines"
				>
					<line
						x1="34"
						x2="44"
					></line>
				</g>

				<g
					stroke="#666"
					stroke-width="4"
				>
					<use
						xlink:href="#lines"
						transform="rotate(180)">
					</use>
					<use
						xlink:href="#lines"
						transform="rotate(157.5)">
					</use>
					<use
						xlink:href="#lines"
						transform="rotate(135)">
					</use>
					<use
						xlink:href="#lines"
						transform="rotate(112.5)">
					</use>
					<use
						xlink:href="#lines"
						transform="rotate(90)">
					</use>
					<use
						xlink:href="#lines"
						transform="rotate(67.5)">
					</use>
					<use
						xlink:href="#lines"
						transform="rotate(45)">
					</use>
					<use
						xlink:href="#lines"
						transform="rotate(22.5)">
					</use>
					<use
						xlink:href="#lines"
						transform="rotate(0)">
					</use>
				</g>

				<text
					class="title"
					text-anchor="middle"
					transform="translate(0, -26)"
				>
					` + type + `
				</text>

				<text
					class="mark"
					alignment-baseline="middle"
					text-anchor="end"
					transform="translate(-54, 0)"
				>
					` + attr[type]["min"] + `
				</text>
				<text
					class="mark"
					alignment-baseline="middle"
					text-anchor="right"
					transform="translate(54, 0)"
				>
					` + attr[type]["max"] + `
				</text>
			</svg>
		</div>
	</div>
	`;
}

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

	/* oscillator */
	var sys = [];
	for (
		let i = 0;
		i < 4;
		i++
	) {
		let osc = ctxAudio.createOscillator();
		osc.connect(ctxAudio.destination);
		osc.start(); 

		let gain = ctxAudio.createGain();
		osc.connect(gain);
		gain.connect(ctxAudio.destination);
		gain.gain.value = -1;

		sys.push({
			"osc": osc,
			"gain": gain
		});
	}

	for (
		let i = 0;
		i < 4;
		i++
	) {
		$("#sys").append(`
			<div
				class="node"
			>
				<div
					class="head"
				>
					<h3>
						${i}
					</h3>
				</div>

				<div
					class="body"
				></div>
			</div>
		`);

		for (
			let inst in attr
		) {
			$("#sys .node:nth-child(" + (i + 1) + ") .body").append(dial(inst));
		}
	}

	for (
		let i = 0;
		i < 4;
		i++
	) {
		for (
			let type in sett["osc"][i]
		) {
			const
				diff = Math.abs(attr[type]["min"] - attr[type]["max"]),
				inc = diff / 8,

				pc = 180 / diff,
				deg = Math.abs(attr[type]["min"] - sett["osc"][i][type]) * pc;

			sys[i]["osc"]["de-tune"] = sett["osc"][i]["de-tune"];
			sys[i]["osc"]["rate"] = sett["osc"][i]["rate"];
			sys[i]["gain"]["gain"]["value"] = sett["osc"][i]["gain"];

			$("#sys .node:nth-child(" + (i + 1)+ ") .dial." + type + " .active path").attr(
				"transform",
				"translate(44, 0) rotate(" + (-90 - deg) + ")"
			);
			$("#sys .node:nth-child(" + (i + 1)+ ") .dial." + type + " .pointer path").attr(
				"transform",
				"translate(32, 40) rotate(" + (-90 - deg) + ")"
			);
		}
	}

	$(".dial").click(function() {
		const
			i = $(this).parent().parent().index(),
			type = $(this).attr("class").split(" ")[1],

			diff = Math.abs(attr[type]["min"] - attr[type]["max"]),
			inc = diff / 8;

		if (dir == 1) {
			if (sett["osc"][i][type] + (inc * dir) > attr[type]["max"]) {
				sett["osc"][i][type] = attr[type]["max"];
			} else {
				sett["osc"][i][type] += inc * dir;
			}
		}

		if (dir == -1) {
			if (sett["osc"][i][type] + (inc * dir) < attr[type]["min"]) {
				sett["osc"][i][type] = attr[type]["min"];
			} else {
				sett["osc"][i][type] += inc * dir;
			}
		}

		const
			pc = 180 / diff,
			deg = Math.abs(attr[type]["min"] - sett["osc"][i][type]) * pc;

		switch (type) {
			case "de-tune":
				let inc = (440 / diff);

				sys[i]["osc"]["detune"]["value"] = 440 + (sett["osc"][i]["de-tune"] * inc);

				break;

			case "rate":
				sys[i]["osc"]["frequency"]["value"] = sett["osc"][i]["rate"];

				break;

			case "gain":
				sys[i]["gain"]["gain"]["value"] = sett["osc"][i]["gain"] - 1;

				break;
		}

		$(this).find(".active path").attr(
			"transform",
			"translate(44, 0) rotate(" + (-90 - deg) + ")"
		);
		$(this).find(".pointer path").attr(
			"transform",
			"translate(32, 40) rotate(" + (-90 - deg) + ")"
		);
	});
});

$(document).keydown(function(e) {
	switch (e.key) {
		case "Alt":
			dir = -1;

			break;
	}
});

$(document).keyup(function(e) {
	dir = 1;
});
