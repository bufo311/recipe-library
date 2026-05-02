import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CreatableComboboxProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CreatableCombobox({ options, value, onChange, placeholder = "Select or create..." }: CreatableComboboxProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const filtered = options.filter((o) => o.toLowerCase().includes(inputValue.toLowerCase()));
  const showCreate = inputValue.length > 0 && !options.some((o) => o.toLowerCase() === inputValue.toLowerCase());

  const handleSelect = (selected: string) => {
    onChange(selected === value ? "" : selected);
    setOpen(false);
    setInputValue("");
  };

  const handleCreate = () => {
    if (inputValue.trim()) { onChange(inputValue.trim()); setOpen(false); setInputValue(""); }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between font-normal h-10 text-left">
          <span className={cn(!value && "text-muted-foreground")}>{value || placeholder}</span>
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
                  <Plus className="h-4 w-4" /> Create &ldquo;{inputValue}&rdquo;
                </button>
              ) : <p className="px-3 py-2 text-sm text-muted-foreground">No options found.</p>}
            </CommandEmpty>
            <CommandGroup>
              {filtered.map((option) => (
                <CommandItem key={option} value={option} onSelect={() => handleSelect(option)}>
                  <Check className={cn("mr-2 h-4 w-4", value === option ? "opacity-100" : "opacity-0")} />
                  {option}
                </CommandItem>
              ))}
              {showCreate && (
                <CommandItem value={`__create__${inputValue}`} onSelect={handleCreate} className="text-primary">
                  <Plus className="mr-2 h-4 w-4" /> Create &ldquo;{inputValue}&rdquo;
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
