import { FFmpeg } from "@ffmpeg/ffmpeg";
import coreURL from "../components/ffmpeg/ffmpeg-core.js?url";
import wasmURL from "../components/ffmpeg/ffmpeg-core.wasm?url";
import workerURL from "../components/ffmpeg/ffmpeg-worker.js?url";

let ffmpeg: FFmpeg | null;

export async function getFFmpeg() {
    if (ffmpeg)
        return ffmpeg;

    ffmpeg = new FFmpeg();

    if (!ffmpeg.loaded)
        await ffmpeg.load({
            coreURL,
            wasmURL,
            workerURL
        });

    return ffmpeg



} 