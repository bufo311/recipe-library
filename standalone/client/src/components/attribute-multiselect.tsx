import { useState } from "react";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface AttributeMultiSelectProps {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export function AttributeMultiSelect({ options, value, onChange, placeholder = "Add attributes..." }: AttributeMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const allOptions = [...new Set([...options, ...value])];
  const filtered = allOptions.filter((o) => o.toLowerCase().includes(inputValue.toLowerCase()));
  const showCreate = inputValue.length > 0 && !allOptions.some((o) => o.toLowerCase() === inputValue.toLowerCase());

  const toggle = (option: string) => {
    onChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option]);
  };

  const handleCreate = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed]);
    setInputValue("");
  };

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((attr) => (
            <Badge key={attr} variant="secondary" className="gap-1 pr-1 text-sm font-normal">
              {attr}
              <button type="button" onClick={() => onChange(value.filter((v) => v !== attr))} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between font-normal h-10 text-left">
            <span className="text-muted-foreground">{value.length > 0 ? `${value.length} selected` : placeholder}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search or type new..." value={inputValue} onValueChange={setInputValue} />
            <CommandList>
              <CommandEmpty>
                {inputValue ? (
                  <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-accent" onClick={handleCreate}>
                    <Plus className="h-4 w-4" /> Add &ldquo;{inputValue}&rdquo;
                  </button>
                ) : <p className="px-3 py-2 text-sm text-muted-foreground">No options found.</p>}
              </CommandEmpty>
              <CommandGroup>
                {filtered.map((option) => (
                  <CommandItem key={option} value={option} onSelect={() => toggle(option)}>
                    <Check className={cn("mr-2 h-4 w-4", value.includes(option) ? "opacity-100" : "opacity-0")} />
                    {option}
                  </CommandItem>
                ))}
                {showCreate && (
                  <CommandItem value={`__create__${inputValue}`} onSelect={handleCreate} className="text-primary">
                    <Plus className="mr-2 h-4 w-4" /> Add &ldquo;{inputValue}&rdquo;
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
