import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Heart, Shield, Trash2 } from "lucide-react";
import type { Character } from "@shared/schema";

interface CharacterCardProps {
  character: Character;
  onClick: () => void;
  onDelete: () => void;
  isSelected?: boolean;
}

export function CharacterCard({ character, onClick, onDelete, isSelected }: CharacterCardProps) {
  const hpPercent = Math.round((character.currentHp / character.maxHp) * 100);
  
  return (
    <Card 
      className={`stat-card p-4 cursor-pointer hover-elevate active-elevate-2 transition-all ${
        isSelected ? 'ring-2 ring-accent' : ''
      }`}
      onClick={onClick}
      data-testid={`card-character-${character.id}`}
    >
      <div className="flex items-start gap-3">
        <Avatar className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-accent/30 flex-shrink-0">
          {character.avatar ? (
            <AvatarImage src={character.avatar} alt={character.name} />
          ) : null}
          <AvatarFallback className="text-lg bg-accent/20">
            <User className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base sm:text-lg truncate" data-testid={`text-character-name-${character.id}`}>
            {character.name}
          </h3>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            <Badge variant="secondary" className="text-xs">{character.race}</Badge>
            <Badge variant="outline" className="text-xs">{character.class}</Badge>
            <Badge className="text-xs">Ур. {character.level}</Badge>
          </div>
        </div>

        <Button 
          variant="ghost" 
          size="icon"
          className="shrink-0 text-muted-foreground hover:text-destructive h-10 w-10 sm:h-9 sm:w-9"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          data-testid={`button-delete-character-${character.id}`}
        >
          <Trash2 className="w-5 h-5 sm:w-4 sm:h-4" />
        </Button>
      </div>

      <div className="mt-3 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <Heart className={`w-4 h-4 ${hpPercent > 50 ? 'text-positive' : hpPercent > 25 ? 'text-accent' : 'text-negative'}`} />
          <span className="font-mono">{character.currentHp}/{character.maxHp}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-accent" />
          <span className="font-mono">{character.armorClass}</span>
        </div>
      </div>
    </Card>
  );
}
