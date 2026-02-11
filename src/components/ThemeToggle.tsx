import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '../contexts/ThemeContext';

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="relative overflow-hidden transition-all hover:scale-105"
      title={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
    >
      <Sun 
        className={`h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all ${
          resolvedTheme === 'dark' ? '-rotate-90 scale-0' : ''
        }`} 
      />
      <Moon 
        className={`absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all ${
          resolvedTheme === 'dark' ? 'rotate-0 scale-100' : ''
        }`} 
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
