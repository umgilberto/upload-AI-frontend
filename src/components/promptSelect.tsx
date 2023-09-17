import { useEffect } from "react";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export interface IOptions {
  value: string;
  label: string;
}
interface Props {
  label: string;
  placeholder?: string;
  options: IOptions[];
  defaultValue?: string;
  handlePromptSelected: (prompt: IOptions) => void;
}
export function PromptSelect({
  label,
  options,
  placeholder,
  defaultValue,
  handlePromptSelected,
}: Props) {
  function handleChange(promptId: string) {
    const selectedPrompt = options.find((prompt) => prompt.value === promptId);

    if (!selectedPrompt) return;

    return  handlePromptSelected(selectedPrompt);
  }
  return (
    <div className='space-y-2'>
      <Label>{label}</Label>
      <Select onValueChange={handleChange} defaultValue={defaultValue}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((op) => (
            <SelectItem key={op.value} value={op.value}>
              {op.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
