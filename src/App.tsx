import { Button } from "./components/ui/button";
import { Github, Wand2 } from "lucide-react";
import { Separator } from "./components/ui/separator";
import { Textarea } from "./components/ui/textarea";
import { Label } from "./components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { Slider } from "./components/ui/slider";
import { VideoInputForm } from "./components/video-input-form";
import { useEffect, useState } from "react";
import { IOptions, PromptSelect } from "./components/promptSelect";
import { api, baseURL } from "./lib/axios";
import { useCompletion } from "ai/react";
interface IPrompt {
  id: string;
  title: string;
  template: string;
}

interface IPromptResponse {
  data: IPrompt[];
}

export function App() {
  const [prompts, setPrompts] = useState<IOptions[]>([]);
  const [temperature, setTemperature] = useState<number>(0.5);
  const [videoId, setVideoId] = useState<string | null>(null);

  function handlePromptSelected(prompt: IOptions) {
    setInput(prompt.value);
  }

  const {
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    completion,
    isLoading,
  } = useCompletion({
    api: `${baseURL}/ai/complete`,
    body: {
      videoId,
      temperature,
    },
    headers:{
      'Content-type': 'application/json'
    }
  });
  useEffect(() => {
    api.get("/prompts").then((response: IPromptResponse) => {
      const newArray: IOptions[] = response.data.map((prompt) => ({
        value: prompt.template,
        label: prompt.title,
      }));
      setPrompts(newArray);
    });
  }, []);

  return (
    <div className='min-h-screen flex flex-col'>
      <div className='px-6 py-3 flex items-center justify-between border-b'>
        <h1 className='text-xl font-bold'>upload.ai</h1>
        <div className='flex items-center gap-3'>
          <span className='text-sm text-muted-foreground'>
            Desenvolvido com s2 no NWL da rocketseat
          </span>
          <Separator orientation='vertical' className='h-6' />
          <Button variant='outline'>
            <Github className='w-4 h-4 mr-2' />
            GitHub
          </Button>
        </div>
      </div>
      <main className='flex-1 p-6 flex gap-6'>
        <div className='flex flex-col flex-1 gap-4'>
          <div className='grid grid-rows-2 gap-4 flex-1'>
            <Textarea
              value={input}
              onChange={handleInputChange}
              placeholder='Inclua o promp para a IA'
              className='resize-none p-5 leading-relaxed'
            />
            <Textarea
              placeholder='Resultado gerado pela IA leading-relaxed'
              className='resize-none p-5'
              readOnly
              value={completion}
            />
          </div>
          <p className='text-sm text-muted-foreground'>
            Lembre-se: você pode utilizar a variável transcription no seu prompt
            para adicionar o conteúdo da{" "}
            <code className='text-violet-400'>{`{transcrição}`}</code> do vídeo
            selecionado.
          </p>
        </div>
        <aside className='w-80 space-y-6'>
          <VideoInputForm onUploadVideo={setVideoId} />

          <Separator />
          <form onSubmit={handleSubmit} className='space-y-6'>
            <PromptSelect
              label='Prompts'
              options={prompts}
              placeholder='Selecione um prompt...'
              handlePromptSelected={handlePromptSelected}
            />

            <div className='space-y-2'>
              <Label>Modelo</Label>
              <Select disabled defaultValue='gpt3.5'>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='gpt3.5'>GPT 3.5-turbo 16k</SelectItem>
                </SelectContent>
              </Select>
              <span className='block text-xs text-muted-foreground italic'>
                Você poderá customizar essa opção em breve
              </span>
            </div>

            <Separator />

            <div className='space-y-4'>
              <Label>Temperatura</Label>
              <Slider
                min={0}
                max={1}
                step={0.1}
                value={[temperature]}
                onValueChange={(value) => setTemperature(value[0])}
              />
              <span className='block text-xs text-muted-foreground italic'>
                Valores mais altos temdem a deixar o resultado mais criativo e
                com possíveiss erros
              </span>
            </div>
            <Separator />
            <Button disabled={isLoading} type='submit' className='w-full'>
              Executar
              <Wand2 className='w-4 h-4 ml-2' />
            </Button>
          </form>
        </aside>
      </main>
    </div>
  );
}
