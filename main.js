const
	attr = {
		"osc": {
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
		},
		"lfo": {
			"rate": {
				"min": 0,
				"max": 20
			}
		},
		"mod": {
			"filter": {
				"highpass": {
					"min": 0,
					"max": 440
				},
				"lowpass": {
					"min": 0,
					"max": 440
				},
			},
			"envelope": {
				"attack": {
					"min": 0,
					"max": 100
				},
				"decay": {
					"min": 0,
					"max": 100
				},
				"sustain": {
					"min": 0,
					"max": 100
				},
				"release": {
					"min": 0,
					"max": 100
				}
			}
		},
		"vol": {
			"min": -1,
			"max": 1
		}
	},

	fn = {
		"filter": {
			"highpass": function() {
			},
			"lowpass": function() {
			}
		},
		"envelope": {
			"attack": function() {
			},
			"sustain": function() {
			},
			"decay": function() {
			},
			"release": function() {
			}
		}
	},

	form = {
		"sine": `
		M 0, 0
		C 0 0, 5 16, 10 0
		C 10 0, 15 -16, 20 0
		C 20 0, 25 16, 30 0
		C 30 0, 35 -16, 40 0
		C 40 0, 45 16, 50 0
		C 50 0, 55 -16, 60 0
		`,
		"square": `
		M 0, 5
		L 10, -5
		L 20, 5
		L 30, -5
		L 40, 5
		L 50, -5
		`,
		"triangle": `
		M 0, 5
		L 10, 5
		L 10, -5
		L 20, -5
		L 20, 5
		L 30, 5
		L 30, -5
		L 40, -5
		L 40, 5
		L 50, 5
		L 50, -5
		L 60, -5
		`,
		"sawtooth": `
		M 0, 5
		L 15, -5
		L 15, 5
		L 30, -5
		L 30, 5
		L 45, -5
		`
	};

var
	sett = {
		"vol": 0.2,
		"osc": [
			{
				"form": "square",
				"attr": {
					"de-tune": 0,
					"rate": 0,
					"gain": -1
				}
			}, {
				"form": "sine",
				"attr": {
					"de-tune": 0,
					"rate": 0,
					"gain": -1
				}
			}, {
				"form": "triangle",
				"attr": {
					"de-tune": 0,
					"rate": 0,
					"gain": -1
				}
			}, {
				"form": "sine",
				"attr": {
					"de-tune": 0,
					"rate": 0,
					"gain": -1
				}
			}
		],
		"lfo": {
			"form": "sine",
			"attr": {
				"rate": 0
			}
		},
		"mod": {
			"filter": {
				"highpass": 0,
				"lowpass": 0
			},
			"envelope": {
				"attack": 0,
				"decay": 0,
				"sustain": 0,
				"release": 0
			}
		}
	},

	dir = 1;

function cable(
	col,
	pos
) {
	return `
	<svg
		class="cable"
		id="active"
		fill="transparent"
		stroke="rgb(${col[0]}, ${col[1]}, ${col[2]})"
		stroke-width="10"
		stroke-linecap="round"
		width="100%"
		height="100%"
		overflow="visible"
	>
		<path
			d="M ${pos.start.x}, ${pos.start.y} C ${pos.start.x}, ${pos.start.y} ${pos.mid.x}, ${pos.mid.y} ${pos.end.x}, ${pos.end.y}"
		/>
	</svg>
	`;
}

function polarToCart(
	center,
	radius,
	deg
) {
	var radian = (deg - 90) * Math.PI / 180.0;

	return {
		x: center.x + (radius * Math.cos(radian)),
		y: center.y + (radius * Math.sin(radian))
	};
}

function arc(
	pos,
	radius,
	angle
) {
	var
		start = polarToCart({x: pos.x, y: pos.y}, radius, angle.end),
		end = polarToCart({x: pos.x, y: pos.y}, radius, angle.start),

		lg = angle.end - angle.start <= 180 ? "0" : "1";

	return `
		M ${start.x}, ${start.y}
		A ${radius}, ${radius}, 0, ${lg}, 0, ${end.x}, ${end.y}
	`;
}

function port(
	i
) {
	return `
	<div
		class="port"
	>
		<svg
			class="nut"
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

			<polygon
				fill="#222"
				style="filter:url(#dropShadow)"
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

		<div>${i == 1 ? "in" : "out"}</div>
	</div>
	`;
}

function dial(
	targ,
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
				width="64"
				height="64"
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
				width="64"
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
				height="32"
				transform="translate(-10, 32)"
			>
				<path
					transform="translate(42, 0)"
					d="${arc({x: 0, y: 0}, 26, {start: 0, end: 180})}"
					fill="transparent"
					stroke="#f0db4f"
					stroke-width="4"
				/>
			</svg>

			<svg
				transform="translate(44, 0)"
				class="pointer"
				width="64"
				height="64"
				overflow="visible"
			>
				<path
					transform="translate(32, 24)"
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
					${type}
				</text>

				<text
					class="mark"
					alignment-baseline="middle"
					text-anchor="end"
					transform="translate(-54, 0)"
				>
					${targ[type]["min"]}
				</text>
				<text
					class="mark"
					alignment-baseline="middle"
					text-anchor="right"
					transform="translate(54, 0)"
				>
					${targ[type]["max"]}
				</text>
			</svg>
		</div>
	</div>
	`;
}

function dialForm(
	type,
	cat
) {
	return `
	<div
		class="dial form"
	>
		<div>
			<svg
				overflow="visible"
				id="shadow"
				width="64"
				height="64"
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
				width="64"
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
				height="32"
				transform="translate(-10, 32)"
			>
				<path
					transform="translate(42, 0)"
					d="${arc({x: 0, y: 0}, 26, {start: 0, end: 180})}"
					fill="transparent"
					stroke="#f0db4f"
					stroke-width="4"
				/>
			</svg>

			<svg
				transform="translate(44, 0)"
				class="pointer"
				width="64"
				height="64"
				overflow="visible"
			>
				<path
					transform="translate(32, 24)"
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
						transform="rotate(120)">
					</use>
					<use
						xlink:href="#lines"
						transform="rotate(60)">
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
					wave-form
				</text>
			</svg>

			<svg
				overflow="visible"
				width="60"
				height="16"
				transform="translate(
					${
						polarToCart(
							{
								x: 32,
								y: 32
							},
							74,
							270
						).x - 46
					},
					${
						polarToCart(
							{
								x: 32,
								y: 32
							},
							74,
							270
						).y
					}
				)"
			>
				<path
					fill="transparent"
					stroke="grey"
					stroke-width="4"
					stroke-linecap="round"
					d="${form["sine"]}"
				/>
			</svg>

			<svg
				overflow="visible"
				width="50"
				height="16"
				transform="translate(
					${
						polarToCart(
							{
								x: 32,
								y: 32
							},
							74,
							210
						).x - 25
					},
					${
						polarToCart(
							{
								x: 32,
								y: 32
							},
							74,
							210
						).y
					}
				)"
			>
				<path
					fill="transparent"
					stroke="grey"
					stroke-width="4"
					stroke-linecap="round"
					alignment-baseline="right"
					d="${form["square"]}"
				/>
			</svg>

			<svg
				overflow="visible"
				width="60"
				height="16"
				transform="translate(
					${
						polarToCart(
							{
								x: 32,
								y: 32
							},
							74,
							150
						).x - 32
					},
					${
						polarToCart(
							{
								x: 32,
								y: 32
							},
							74,
							150
						).y
					}
				)"
			>
				<path
					fill="transparent"
					stroke="grey"
					stroke-width="4"
					stroke-linecap="round"
					d="${form["triangle"]}"
				/>
			</svg>

			<svg
				overflow="visible"
				width="45"
				height="16"
				transform="translate(
					${
						polarToCart(
							{
								x: 32,
								y: 32
							},
							74,
							90
						).x - 16
					},
					${
						polarToCart(
							{
								x: 32,
								y: 32
							},
							74,
							90
						).y
					}
				)"
			>
				<path
					fill="transparent"
					stroke="grey"
					stroke-width="4"
					stroke-linecap="round"
					d="${form["sawtooth"]}"
				/>
			</svg>
		</div>
	</div>
	`;
}

document.addEventListener("DOMContentLoaded", function() {
	const
		js = "#f0db4f",
		grey = "#323330";

	/* audio */
	const ctxAudio = new (window.AudioContext || window.webkitAudioContext)();

	const sz = Math.pow(2, 10);
	var
		analyser = ctxAudio.createAnalyser(),
		proc = ctxAudio.createScriptProcessor(sz, 1, 1);

	analyser.fftSize = sz;

	var data = new Uint8Array(analyser.frequencyBinCount);

	/* volume */
	let
		diff = Math.abs(48 - 172),

		pc = diff / Math.abs(attr["vol"]["min"] - attr["vol"]["max"]),

		pos = (sett["vol"] + 1) * pc;

	$("#vol #thumb").css(
		"margin-top",
		-pos - 12
	);
	$("#vol .active").css({
		"height": 80 - (pos - 62) + 8,
		"margin-top": (-(80 - (pos - 62))) - 8
	});

	var slide = false;
	$("#vol #thumb").mousedown(function() {
		slide = true;

		$(document).mousemove(function(e) {
			if (slide) {
				let pos;
				if (e.pageY > 48 && e.pageY < 172) {
					pos = e.pageY;
				} else {
					if (e.pageY < 48) {
						pos = 48;
					}

					if (e.pageY > 172) {
						pos = 172;
					}
				}

				const
					diff = Math.abs(48 - 172),
					delta = Math.abs(pos - 172),

					pc = Math.abs(attr["vol"]["min"] - attr["vol"]["max"]) / diff,
					val = (delta * pc) - 1;

				sett["vol"] = val;

				$("#vol #thumb").css(
					"margin-top",
					pos - (172 + 8 + 4)
				);
				$("#vol .active").css({
					"height": 80 - (pos - 84) + 8,
					"margin-top": (-(80 - (pos - 84))) - 8
				});
			}
		});

		$(document).mouseup(function() {
			slide = false;
		});
	});

	/* oscilloscope */
	const
		canv = document.getElementById("disp"),
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

		for (
			let i = 0;
			i < data.length;
			i++
		) {
			ctxCanv.fillStyle = "#111";
			ctxCanv.fillRect(
				i,
				-(canv.height / 255) * data[i],
				1,
				canv.height
			);
		}
	}

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
		$("#osc").append(`
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
				>
					<div
						class="attr"
					></div>
				</div>
			</div>
		`);

		$("#sys .node:nth-child(" + (i + 1) + ") .body .attr").append(dialForm(attr["osc"], "form"));

		let
			name = sett["osc"][i]["form"],
			idx = Object.keys(form).indexOf(name);

		const
			floor = 0,
			roof = 3,

			diff = Math.abs(floor - roof),
			inc = diff / diff,

			pc = 180 / diff,
			deg = idx * pc;

		$("#sys .node:nth-child(" + (i + 1) + ") .dial.form .active path").attr(
			"transform",
			"translate(42, 0) rotate(" + (-90 - deg) + ")"
		);
		$("#sys .node:nth-child(" + (i + 1) + ") .dial.form .pointer").attr(
			"transform",
			"rotate(" + (-90 - deg) + ")"
		);

		for (
			let inst in attr["osc"]
		) {
			$("#sys .node:nth-child(" + (i + 1) + ") .body .attr").append(dial(attr["osc"], inst));
		}
	}

	for (
		let i = 0;
		i < 4;
		i++
	) {
		for (
			let type in sett["osc"][i]["attr"]
		) {
			const
				diff = Math.abs(attr["osc"][type]["min"] - attr["osc"][type]["max"]),
				inc = diff / 8,

				pc = 180 / diff,
				deg = Math.abs(attr["osc"][type]["min"] - sett["osc"][i]["attr"][type]) * pc;

			sys[i]["osc"]["de-tune"] = sett["osc"][i]["attr"]["de-tune"];
			sys[i]["osc"]["rate"] = sett["osc"][i]["attr"]["rate"];
			sys[i]["gain"]["gain"]["value"] = sett["osc"][i]["attr"]["gain"];

			$("#sys .node:nth-child(" + (i + 1) + ") .dial." + type + " .active path").attr(
				"transform",
				"translate(42, 0) rotate(" + (-90 - deg) + ")"
			);
			$("#sys .node:nth-child(" + (i + 1) + ") .dial." + type + " .pointer").attr(
				"transform",
				"rotate(" + (-90 - deg) + ")"
			);
		}
	}

	$("#osc .dial.form").click(function() {
		const
			i = $(this).parent().parent().parent().index(),

			floor = 0,
			roof = 3,

			diff = Math.abs(floor - roof),

			inc = diff / diff;

		let
			name = sett["osc"][i]["form"],
			idx = Object.keys(form).indexOf(name);

		if (dir == 1) {
			if (idx + (inc * dir) > roof) {
				sett["osc"][i]["form"] = Object.keys(form)[roof];
			} else {
				idx++;

				let name = Object.keys(form)[idx];

				sett["osc"][i]["form"] = name;
			}
		}

		if (dir == -1) {
			if (idx + (inc * dir) < floor) {
				sett["osc"][i]["form"] = Object.keys(form)[0];
			} else {
				idx--;

				let name = Object.keys(form)[idx];

				sett["osc"][i]["form"] = name;
			}
		}

		const
			pc = 180 / diff,
			deg = idx * pc;

		$("#sys .node:nth-child(" + (i + 1) + ") .dial.form .active path").attr(
			"transform",
			"translate(42, 0) rotate(" + (-90 - deg) + ")"
		);
		$("#sys .node:nth-child(" + (i + 1) + ") .dial.form .pointer").attr(
			"transform",
			"rotate(" + (-90 - deg) + ")"
		);

		sys[i]["osc"].type = sett["osc"][i]["form"];
	});

	$("#osc .dial:not(.form)").click(function() {
		const
			i = $(this).parent().parent().index(),
			type = $(this).attr("class").split(" ")[1],

			diff = Math.abs(attr["osc"][type]["min"] - attr["osc"][type]["max"]),
			inc = diff / 8;

		if (dir == 1) {
			if (sett["osc"][i]["attr"][type] + (inc * dir) > attr["osc"][type]["max"]) {
				sett["osc"][i]["attr"][type] = attr["osc"][type]["max"];
			} else {
				sett["osc"][i]["attr"][type] += inc * dir;
			}
		}

		if (dir == -1) {
			if (sett["osc"][i]["attr"][type] + (inc * dir) < attr["osc"][type]["min"]) {
				sett["osc"][i]["attr"][type] = attr["osc"][type]["min"];
			} else {
				sett["osc"][i]["attr"][type] += inc * dir;
			}
		}

		const
			pc = 180 / diff,
			deg = Math.abs(attr["osc"][type]["min"] - sett["osc"][i]["attr"][type]) * pc;

		switch (type) {
			case "de-tune":
				let inc = (440 / diff);

				sys[i]["osc"]["detune"]["value"] = 440 + (sett["osc"][i]["attr"]["de-tune"] * inc);

				break;

			case "rate":
				sys[i]["osc"]["frequency"]["value"] = sett["osc"][i]["attr"]["rate"];

				break;
		}

		$(this).find(".active path").attr(
			"transform",
			"translate(42, 0) rotate(" + (-90 - deg) + ")"
		);
		$(this).find(".pointer").attr(
			"transform",
			"rotate(" + (-90 - deg) + ")"
		);
	});

	/* LFO */
	$("#lfo").append(
		`
		<div
			class="node"
		>
			<div
				class="head"
			>
				<h3>LFO</h3>
			</div>

			<div
				class="body"
			>
				<div
					class="attr"
				>
					${dialForm(attr["lfo"], "form")}
					${dial(attr["lfo"], "rate")}
				</div>
			<div>
		</div>
		`
	);

	var lfo = ctxAudio.createOscillator();
	lfo.frequency.value = sett["lfo"]["attr"]["rate"];
	lfo.connect(ctxAudio.destination);
	lfo.start();

	let
		name = sett["lfo"]["form"],
		idx = Object.keys(form).indexOf(name);

	(function() {
		const
			floor = 0,
			roof = 3,

			diff = Math.abs(floor - roof),
			inc = diff / diff,

			pc = 180 / diff,
			deg = idx * pc;

		$("#lfo .dial.form .active path").attr(
			"transform",
			"translate(42, 0) rotate(" + (-90 - deg) + ")"
		);
		$("#lfo .dial.form .pointer").attr(
			"transform",
			"rotate(" + (-90 - deg) + ")"
		);
	})();

	for (
		let inst in sett["lfo"]["attr"]
	) {
		const
			diff = Math.abs(attr["lfo"][inst]["min"] - attr["lfo"][inst]["max"]),
			inc = diff / 8,

			pc = 180 / diff,
			deg = Math.abs(attr["lfo"]["rate"]["min"] - sett["lfo"]["attr"]["rate"]) * pc;

		$("#lfo .dial." + inst + " .active path").attr(
			"transform",
			"translate(42, 0) rotate(" + (-90 - deg) + ")"
		);
		$("#lfo .dial." + inst + " .pointer").attr(
			"transform",
			"rotate(" + (-90 - deg) + ")"
		);
	}

	$("#lfo .dial.form").click(function() {
		const
			i = $(this).parent().parent().parent().index(),

			floor = 0,
			roof = 3,

			diff = Math.abs(floor - roof),

			inc = diff / diff;

		let
			name = sett["osc"][i]["form"],
			idx = Object.keys(form).indexOf(name);

		if (dir == 1) {
			if (idx + (inc * dir) > roof) {
				sett["osc"][i]["form"] = Object.keys(form)[roof];
			} else {
				idx++;

				let name = Object.keys(form)[idx];

				sett["osc"][i]["form"] = name;
			}
		}

		if (dir == -1) {
			if (idx + (inc * dir) < floor) {
				sett["osc"][i]["form"] = Object.keys(form)[0];
			} else {
				idx--;

				let name = Object.keys(form)[idx];

				sett["osc"][i]["form"] = name;
			}
		}

		const
			pc = 180 / diff,
			deg = idx * pc;

		$("#sys .node:nth-child(" + (i + 1) + ") .dial.form .active path").attr(
			"transform",
			"translate(42, 0) rotate(" + (-90 - deg) + ")"
		);
		$("#sys .node:nth-child(" + (i + 1) + ") .dial.form .pointer").attr(
			"transform",
			"rotate(" + (-90 - deg) + ")"
		);

		sys[i]["osc"].type = sett["osc"][i]["form"];
	});

	$("#lfo .dial:not(.form)").click(function() {
		const
			type = $(this).attr("class").split(" ")[1],

			diff = Math.abs(attr["lfo"][type]["min"] - attr["lfo"][type]["max"]),
			inc = diff / 8;

		if (dir == 1) {
			if (sett["lfo"]["attr"][type] + (inc * dir) > attr["lfo"][type]["max"]) {
				sett["lfo"]["attr"][type] = attr["lfo"][type]["max"];
			} else {
				sett["lfo"]["attr"][type] += inc * dir;
			}
		}

		if (dir == -1) {
			if (sett["lfo"][type] + (inc * dir) < attr["lfo"][type]["min"]) {
				sett["lfo"]["attr"][type] = attr["lfo"][type]["min"];
			} else {
				sett["lfo"]["attr"][type] += inc * dir;
			}
		}

		const
			pc = 180 / diff,
			deg = Math.abs(attr["lfo"][type]["min"] - sett["lfo"]["attr"][type]) * pc;

		$(this).find(".active path").attr(
			"transform",
			"translate(42, 0) rotate(" + (-90 - deg) + ")"
		);
		$(this).find(".pointer").attr(
			"transform",
			"rotate(" + (-90 - deg) + ")"
		);

		lfo["frequency"]["value"] = sett["lfo"]["attr"][type];
	});

	/* keyboard */
	const
		c4 = 261.63,
		c5 = 523.25,

		octave = Math.abs(c4 - c5);

		rng = 14;

	// white
	for (
		let i = 0;
		i < rng;
		i++
	) {
		$("#board #white").append("<div><div class='key'></div></div>");
	}

	$("#white div .key").mousedown(function() {
		$(this).css(
			"height",
			"calc(calc(" + 6 + "in / 2) * 0.84)"
		);

		const n = $(this).parent().index();

		for (
			let i = 0;
			i < 4;
			i++
		) {
			sys[i]["osc"]["frequency"]["value"] = c4 + (n * (octave / 8));
			sys[i]["gain"]["gain"]["value"] = sett["vol"];
		}
	});

	$("#white > div").mouseup(function() {
		$(this).find(".key").css(
			"height",
			"calc(" + 6 + "in / 2)"
		);

		for (
			let i = 0;
			i < 4;
			i++
		) {
			sys[i]["gain"]["gain"]["value"] = -1;
		}
	});
	$("#white > div").mouseleave(function() {
		$(this).find(".key").css(
			"height",
			"calc(" + 6 + "in / 2)"
		);

		for (
			let i = 0;
			i < 4;
			i++
		) {
			sys[i]["gain"]["gain"]["value"] = -1;
		}
	});

	// black
	var
		gap = 3,
		k = 1;
	for (
		let i = 0;
		i < rng - 1;
		i++,
		k++
	) {
		$("#board #black").append("<div></div>");

		if (k == gap) {
			k = 0;

			if (gap == 3) {
				gap = 4;
			} else if (gap == 4) {
				gap = 3;
			}
		}

		if (k) {
			$("#black div:nth-child(" + (i + 1) + ")").append("<div class='key'></div>");
		}
	}

	$("#black div .key").mousedown(function() {
		$(this).css(
			"height",
			"calc((3.5in / 2) * 0.84)"
		);

		const n = $(this).parent().index();

		for (
			let i = 0;
			i < 4;
			i++
		) {
			sys[i]["osc"]["frequency"]["value"] = c4 + ((n * (octave / 8)) + ((octave / 8) / 2));
			sys[i]["gain"]["gain"]["value"] = sett["vol"];
		}
	});

	$("#black > div").mouseup(function() {
		$(this).find(".key").css(
			"height",
			"calc(3.5in / 2)"
		);

		for (
			let i = 0;
			i < 4;
			i++
		) {
			sys[i]["gain"]["gain"]["value"] = -1;
		}
	});
	$("#black > div").mouseleave(function() {
		$(this).find(".key").css(
			"height",
			"calc(3.5in / 2)"
		);

		for (
			let i = 0;
			i < 4;
			i++
		) {
			sys[i]["gain"]["gain"]["value"] = -1;
		}
	});

	/* modular */
	for (
		let i = 0;
		i < 4;
		i++
	) {
		sys[i]["osc"].connect(analyser);
		sys[i]["osc"].connect(ctxAudio.destination);

		sys[i]["gain"].connect(analyser);
		sys[i]["gain"].connect(ctxAudio.destination);
	}

	analyser.connect(proc);
	proc.connect(ctxAudio.destination);

	// port
	$("#mod").prepend(port(0));

	for (
		let module in fn
	) {
		$("#mod > .body").append(
			`
			<div
				class="module"
				id="${module}"
			>
				<h3>${module}</h3>
			</div>
			`
		);

		for (
			let name in fn[module]
		) {
			$("#mod > .body #" + module).append(
				`
				<div
					class="port"
				>
					${dial(attr["mod"][module], name)}

					<div
						class="body"
					>
						${port(1)}
						${port(0)}
					</div>
				<div>
				`
			);
		}
	}

	$("#mod").append(port(1));

	for (
		let module in sett["mod"]
	) {
		for (
			let inst in sett["mod"][module]
		) {
			const
				diff = Math.abs(attr["mod"][module][inst]["min"] - attr["mod"][module][inst]["max"]),
				inc = diff / 8,

				pc = 180 / diff,
				deg = Math.abs(attr["mod"][module][inst]["min"] - sett["mod"][module][inst]) * pc;

			$("#mod .dial." + inst + " .active path").attr(
				"transform",
				"translate(42, 0) rotate(" + (-90 - deg) + ")"
			);
			$("#mod .dial." + inst + " .pointer").attr(
				"transform",
				"rotate(" + (-90 - deg) + ")"
			);
		}
	}

	$("#mod .dial").click(function() {
		const
			i = $(this).parent().index(),
			type = $(this).attr("class").split(" ")[1],

			module = $(this).parent().parent().attr("id"),

			diff = Math.abs(attr["mod"][module][type]["min"] - attr["mod"][module][type]["max"]),
			inc = diff / 8;

		if (dir == 1) {
			if (sett["mod"][module][type] + (inc * dir) > attr["mod"][module][type]["max"]) {
				sett["mod"][module][type] = attr["mod"][module][type]["max"];
			} else {
				sett["mod"][module][type] += inc * dir;
			}
		}

		if (dir == -1) {
			if (sett["mod"][module][type] + (inc * dir) < attr["mod"][module][type]["min"]) {
				sett["mod"][module][type] = attr["osc"][type]["min"];
			} else {
				sett["mod"][module][type] += inc * dir;
			}
		}

		const
			pc = 180 / diff,
			deg = Math.abs(attr["mod"][module][type]["min"] - sett["mod"][module][type]) * pc;

		$(this).find(".active path").attr(
			"transform",
			"translate(42, 0) rotate(" + (-90 - deg) + ")"
		);
		$(this).find(".pointer").attr(
			"transform",
			"rotate(" + (-90 - deg) + ")"
		);

		filt[i].frequency.setValueAtTime(sett["mod"][type], ctxAudio.currentTime)
	});

	// filter
	var filt = [];
	for (
		let inst in attr["mod"]
	) {
		let tmp = ctxAudio.createBiquadFilter();
		tmp.type = inst;

		for (
			let i = 0;
			i < 4;
			i++
		) {
			// sys[i].connect(tmp);
		}
		tmp.connect(ctxAudio.destination);

		filt.push(tmp);
	}

	// cable
	var
		grab = false,
		targ = null;

	var
		start;

		roof = ($("#mod .nut").length / 2);
	$("#mod .nut").mousedown(function(e) {
		let c = $("#mod .cable").length;

		if (c < roof) {
			grab = true;

			start = {
				x: $(this).offset().left + 16 + 8,
				y: $(this).offset().top + 16 + 8 
			};

			let
				end = {
					x: e.pageX,
					y: e.pageY
				},
				mid = {
					x: start.x + ((end.x - start.x) / 2),
					y: ((start.y + (end.y - start.y) / 2)) + 160
				},

				fst = [240, 219, 79],
				snd = [50, 51, 48],

				diff = [];
			for (
				let i = 0;
				i < 3;
				i++
			) {
				diff[i] = snd[i] - fst[i];
			}

			let inc = [];
			for (
				let i = 0;
				i < 3;
				i++
			) {
				inc[i] = diff[i] / (roof - 1);
			}

			let col = [];
			for (
				let i = 0;
				i < 3;
				i++
			) {
				col[i] = fst[i] + (c * inc[i]);
			}

			$("#mod").append(
				cable(
					col,
					{
						"start": start,
						"mid": mid,
						"end": end
					}
				)
			);

			$(document).mousemove(function(e) {
				if (grab) {
					end = {
						x: e.pageX,
						y: e.pageY
					};
					mid = {
						x: start.x + ((end.x - start.x) / 2),
						y: ((start.y + (end.y - start.y) / 2)) + 160
					};

					$("#mod .cable#active path").attr(
						"d",
						`M ${start.x}, ${start.y}
						C ${start.x}, ${start.y} ${mid.x}, ${mid.y} ${end.x}, ${end.y}
						`
					);

					$(".nut").mouseenter(function() {
						targ = $(this);
					});
					$(".nut").mouseleave(function() {
						targ = null;
					});
				}
			});

			$(document).mouseup(function() {
				grab = false;

				if (targ) {
					end = {
						x: targ.offset().left + 16 + 8,
						y: targ.offset().top + 16 + 8
					};
					mid = {
						x: start.x + ((end.x - start.x) / 2),
						y: ((start.y + (end.y - start.y) / 2)) + 160
					};

					$("#mod .cable#active path").attr(
						"d",
						`M ${start.x}, ${start.y} C ${start.x}, ${start.y} ${mid.x}, ${mid.y} ${end.x}, ${end.y}`
					);
					$("#mod .cable#active").removeAttr("id");
				} else {
					$("#mod .cable#active").remove();
				}
			});
		}
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
