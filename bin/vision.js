#!/usr/bin/env node
"use strict";
const meow = require("meow");
const React = require("react");
const { render } = require("ink");
const importJsx = require("import-jsx");

const App = importJsx("./../src/app.js");
const { Canvas } = require("terminal-canvas");
const ChopStream = require("chop-stream");
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require("fluent-ffmpeg");
const Speaker = require("speaker");
const Throttle = require("stream-throttle").Throttle;
const canvas = new Canvas();
const path = require("path")
const CHARACTERS = " .,:;i1tfLCG08@".split("");
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

module.exports = ffmpeg;

function imageToAscii(data, width, height) {
	const contrastFactor = 2.95;
	let ascii = "";

	for (let y = 0; y < height; y += 2) {
		for (let x = 0; x < width; x++) {
			const offset = (y * width + x) * 3;
			const r = Math.max(
				0,
				Math.min(contrastFactor * (data[offset] - 128) + 128, 255)
			);
			const g = Math.max(
				0,
				Math.min(contrastFactor * (data[offset + 1] - 128) + 128, 255)
			);
			const b = Math.max(
				0,
				Math.min(contrastFactor * (data[offset + 2] - 128) + 128, 255)
			);
			const brightness = 1 - (0.299 * r + 0.587 * g + 0.114 * b) / 255;

			ascii += CHARACTERS[Math.round(brightness * 14)];
		}
	}

	return ascii;
}

function playVideo(video) {
	// const video = info.formats
	//   .filter(format => format.quality === "tiny" && format.audioBitrate === null)
	//   .sort(a => (a.container === "webm" ? -1 : 1))[0];
	const videoSize = { width: 960, height: 720 };
	const frameHeight = Math.round(canvas.height * 2);
	const frameWidth = Math.round(
		frameHeight * (videoSize.width / videoSize.height)
	);
	const frameSize = frameWidth * frameHeight * 3;

	return ffmpeg(video)
		.format("rawvideo")
		.videoFilters([
			{ filter: "fps", options: 30 },
			{ filter: "scale", options: frameWidth + ":-1" }
		])
		.outputOptions("-pix_fmt", "rgb24")
		.outputOptions("-update", "1")
		.on("start", () => canvas.saveScreen().reset())
		.on("end", () => canvas.restoreScreen())
		.pipe(new Throttle({ rate: frameSize * 30 }))
		.pipe(new ChopStream(frameSize))
		.on("data", function (frameData) {
			const ascii = imageToAscii(frameData, frameWidth, frameHeight);

			for (let y = 0; y < frameHeight; y++) {
				for (let x = 0; x < frameWidth; x++) {
					canvas
						.moveTo(x + (canvas.width / 2 - frameWidth / 2), y)
						.write(ascii[y * frameWidth + x] || "");
				}
			}

			canvas.flush();
		});
}

function playAudio(audio) {
	// const audio = info.formats
	//   .filter(format => format.quality === "tiny")
	//   .sort((a, b) => b.audioBitrate - a.audioBitrate)[0];
	const speaker = new Speaker();
	const updateSpeaker = codec => {
		speaker.channels = codec.audio_details[2] === "mono" ? 1 : 2;
		speaker.sampleRate = parseInt(codec.audio_details[1].match(/\d+/)[0], 10);
	};

	return ffmpeg(audio)
		.noVideo()
		.audioCodec("pcm_s16le")
		.format("s16le")
		.on("codecData", updateSpeaker)
		.pipe(speaker);
}
playVideo(path.resolve(__dirname, './../video.mp4'))
playAudio(path.resolve(__dirname, './../video.mp4'))
// playAudio(path.resolve(__dirname,'./../video.mp4'))


// process.on('SIGTERM', () => canvas.restoreScreen());
meow(`
	Usage
	  $ foo <input>

	Options
	  --rainbow, -r  Include a rainbow

	Examples
	  $ foo unicorns --rainbow
	  🌈 unicorns 🌈
`, {
	flags: {
		rainbow: {
			type: 'boolean',
			alias: 'r'
		}
	}
});

// render(React.createElement(App));
