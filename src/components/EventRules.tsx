import { EventRule } from '@/lib/types';
import { ScrollText } from 'lucide-react';

interface EventRulesProps {
  rules: EventRule[];
}

export function EventRules({ rules }: EventRulesProps) {
  if (rules.length === 0) return null;

  return (
    <div className="bg-gradient-card rounded-xl border border-border/50 overflow-hidden shadow-card">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/50 text-accent-foreground">
            <ScrollText className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-lg">Regras do Jogo</h3>
        </div>
      </div>

      <div className="p-4">
        <ul className="space-y-3">
          {rules.map((rule, index) => (
            <li
              key={rule.id}
              className="flex gap-3 text-muted-foreground animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center">
                {index + 1}
              </span>
              <span>{rule.rule_text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
