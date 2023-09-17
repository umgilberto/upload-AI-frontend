import { FileVideo, Upload } from "lucide-react";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import { getFFmpeg } from "@/lib/ffmpag";
import { fetchFile } from "@ffmpeg/util";
import { api } from "@/lib/axios";

export enum Status {
  waiting = "waiting",
  converting = "converting",
  uploading = "uploading",
  generating = "generating",
  success = "success",
}

const statusMessage = {
  [Status.converting]: "Convertendo...",
  [Status.uploading]: "Carregando...",
  [Status.generating]: "Gerando...",
  [Status.success]: "Sucesso!",
};


interface Props{
  onUploadVideo: (videoId: string) => void;
}
export function VideoInputForm(props: Props) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>(Status.waiting);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);

  function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const { files } = event.currentTarget;

    if (!files) {
      return;
    }

    const [selectedFile] = files;
    setVideoFile(selectedFile);
  }

  async function convertVideoToAudio(video: File) {
    console.log("convert started");

    const ffmpeg = await getFFmpeg();
    await ffmpeg.writeFile("input.mp4", await fetchFile(video));
    // ffmpeg.on("log", (log) => console.log(log));

    ffmpeg.on("progress", (event) =>
      console.log(`Convert Progress ${Math.round(event.progress * 100)}`)
    );

    ffmpeg.exec([
      "-i",
      "input.mp4",
      "-map",
      "0:a",
      "-b:a",
      "20k",
      "-acodec",
      "libmp3lame",
      "output.mp3",
    ]);

    const data = await ffmpeg.readFile("output.mp3");
    const audioFileBlob = new Blob([data], { type: "audio/mpeg" });
    const audioFile = new File([audioFileBlob], "audio.mp3", {
      type: "audio/mpeg",
    });
    return audioFile;
  }

  async function handleUploadVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const prompt = promptInputRef.current?.value;
    if (!videoFile) return;

    setStatus(Status.converting);

    const audioFile = await convertVideoToAudio(videoFile);
    const formData = new FormData();
    formData.append("file", audioFile);

    setStatus(Status.uploading);

    const response = await api.post("/videos", formData);
    const videoId = response.data.video.id;

    setStatus(Status.generating);

    await api.post(`/videos/${videoId}/transcription`, { prompt });

    setStatus(Status.success);
    props.onUploadVideo(videoId);
    console.log("finished");
  }


  const previewURL = useMemo(() => {
    if (!videoFile) return null;

    return URL.createObjectURL(videoFile);
  }, [videoFile]);
  return (
    <>
      <form onSubmit={handleUploadVideo} className='space-y-6'>
        <Label
          htmlFor='video'
          className='relative border w-full flex rounded-md aspect-video cursor-pointer border-dashed text-sm flex-col gap-2 items-center justify-center text-muted-foreground hover:bg-primary/5'
        >
          {previewURL ? (
            <video
              src={previewURL}
              controls={false}
              className='pointer-events-none absolute inset-0 max-h-2'
            />
          ) : (
            <>
              <FileVideo />
              Selecione um video
            </>
          )}
        </Label>
        <input
          id='video'
          type='file'
          accept='video/mp4'
          className='sr-only'
          onChange={handleFileSelected}
        />

        <Separator />

        <div className='space-y-2'>
          <Label htmlFor='transcription_prompt' className=''>
            Prompt de transcrição
          </Label>
          <Textarea
            ref={promptInputRef}
            disabled={status !== Status.waiting}
            id='transcription_prompt'
            className='h-20 leading-relaxed'
            placeholder='Inclua palavras-chaves mencionadas no video separadas por vírgula (,)'
          />
        </div>
        <Button
          data-success={status === Status.success}
          type='submit'
          disabled={status !== Status.waiting}
          className='w-full data-[success=true]:bg-emerald-400'
        >
          {status === Status.waiting ? (
            <>
              Carregar video
              <Upload className='w-4 h-4 ml-2' />
            </>
          ) : (
            statusMessage[status]
          )}
        </Button>
      </form>
    </>
  );
}
