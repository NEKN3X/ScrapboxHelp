import { useState } from 'react';
import { Input } from './ui/input';

type SearchHelpProps = {
  onChange?: (text: string) => void;
};

function SearchInput({ onChange }: SearchHelpProps) {
  const [text, setText] = useState<string>('');
  return (
    <div>
      <Input
        id="search-help"
        placeholder="φ(..)"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onChange?.(e.target.value);
        }}
        className="col-span-2 h-8"
      />
    </div>
  );
}

export { SearchInput as SearchHelp };
