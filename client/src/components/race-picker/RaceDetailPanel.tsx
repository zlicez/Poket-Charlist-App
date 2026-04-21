import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye, Globe, ShieldCheck, User } from "lucide-react";
import {
  ABILITY_LABELS,
  ABILITY_NAMES,
  type AbilityName,
  type RaceDefinition,
} from "@shared/schema";

import { RACE_DAMAGE_LABELS, SOURCE_LABELS } from "./constants";
import { RaceStatPill } from "./RaceStatPill";

export function RaceDetailPanel({ race }: { race: RaceDefinition | null }) {
  if (!race) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 py-10 space-y-5">
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center shrink-0">
          <User className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="space-y-1.5">
          <h3 className="font-semibold text-base">Выберите расу</h3>
          <p className="text-sm text-muted-foreground">
            Нажмите на любую расу слева — здесь появится её описание
          </p>
        </div>
        <div className="w-full max-w-[260px] space-y-3 text-left">
          <div className="flex gap-2.5 items-start">
            <span className="text-lg shrink-0">🎭</span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Раса</strong> — кем был ваш персонаж с рождения: человеком, эльфом, гоблином или кем-то ещё
            </p>
          </div>
          <div className="flex gap-2.5 items-start">
            <span className="text-lg shrink-0">⚡</span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Она даёт <strong className="text-foreground">бонусы характеристик</strong>, скорость движения и уникальные способности
            </p>
          </div>
          <div className="flex gap-2.5 items-start">
            <span className="text-lg shrink-0">📖</span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Новичкам рекомендуем <strong className="text-foreground">Книга игрока (PHB)</strong> — там стандартные сбалансированные расы
            </p>
          </div>
        </div>
      </div>
    );
  }

  const hasFixedBonuses = Object.values(race.abilityBonuses).some((v) => v !== 0);
  const sizeLabel = race.size === "Small" ? "Маленький" : race.size === "Large" ? "Большой" : "Средний";
  const sizeTip =
    race.size === "Small"
      ? "Маленький размер. Персонаж не может использовать тяжёлое двуручное оружие, зато легче прячется."
      : "Средний размер — стандарт для большинства рас. Нет особых ограничений.";

  return (
    <ScrollArea className="flex-1 min-h-0 h-full">
      <div className="p-4 space-y-4 pb-6">

        {/* Header */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold leading-tight">{race.name}</h2>
            {race.entityType === "lineage" && (
              <Badge className="text-xs bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-400/30 border">
                Линидж
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 cursor-help font-medium">
                  {race.source}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {SOURCE_LABELS[race.source] ?? race.source}
              </TooltipContent>
            </Tooltip>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-xs text-muted-foreground">{race.creatureType}</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed pt-0.5">
            {race.description}
          </p>
        </div>

        {/* Key stats row */}
        <div className="flex flex-wrap gap-2">
          <RaceStatPill
            label="Скорость"
            value={`${race.speed} фт.`}
            tooltip="Скорость — сколько футов персонаж проходит за ход (1 клетка = 5 фт.). Стандарт — 30 фт."
          />
          <RaceStatPill
            label="Размер"
            value={sizeLabel}
            tooltip={sizeTip}
          />
          <RaceStatPill
            label="Тёмное зрение"
            value={(race.darkvision ?? 0) > 0 ? `${race.darkvision} фт.` : "Нет"}
            tooltip="Тёмное зрение: видите в кромешной темноте как в тусклом свете. Очень полезно в подземельях."
          />
          {(race.altSpeeds?.swim ?? 0) > 0 && (
            <RaceStatPill label="Плавание" value={`${race.altSpeeds!.swim} фт.`}
              tooltip="Скорость плавания — плывёте без штрафов в воде." />
          )}
          {(race.altSpeeds?.climb ?? 0) > 0 && (
            <RaceStatPill label="Лазание" value={`${race.altSpeeds!.climb} фт.`}
              tooltip="Скорость лазания — карабкаетесь по вертикальным поверхностям." />
          )}
          {(race.altSpeeds?.fly ?? 0) > 0 && (
            <RaceStatPill label="Полёт" value={`${race.altSpeeds!.fly} фт.`}
              tooltip="Скорость полёта." />
          )}
        </div>

        {/* Ability bonuses */}
        <div className="space-y-1.5">
          <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Бонусы характеристик
          </h4>
          {hasFixedBonuses ? (
            <div className="flex flex-wrap gap-1.5">
              {(ABILITY_NAMES as readonly AbilityName[])
                .filter((a) => (race.abilityBonuses[a] ?? 0) !== 0)
                .map((a) => (
                  <Badge key={a} variant="secondary" className="text-xs font-medium">
                    {ABILITY_LABELS[a].ru} +{race.abilityBonuses[a]}
                  </Badge>
                ))}
            </div>
          ) : race.abilityBonusSelection ? (
            <div className="rounded-lg bg-muted/40 px-3 py-2">
              <p className="text-xs text-muted-foreground">{race.abilityBonusSelection.description}</p>
              <p className="text-[11px] text-muted-foreground/70 mt-1">
                Вы распределяете бонусы сами — это делает расу универсальной для любого класса
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">Нет фиксированных бонусов</p>
          )}
        </div>

        {/* Resistances */}
        {(race.resistances?.length ?? 0) > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Сопротивление к урону
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {race.resistances!.map((r) => (
                <Badge key={r} variant="outline"
                  className="text-xs gap-1 border-emerald-500/40 text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="w-3 h-3" />
                  {RACE_DAMAGE_LABELS[r] ?? r}
                </Badge>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Сопротивление — получаете вдвое меньше урона указанного типа
            </p>
          </div>
        )}

        {/* Immunities */}
        {(race.immunities?.length ?? 0) > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Иммунитет к урону
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {race.immunities!.map((r) => (
                <Badge key={r} variant="outline"
                  className="text-xs gap-1 border-blue-500/40 text-blue-700 dark:text-blue-400">
                  <ShieldCheck className="w-3 h-3" />
                  {RACE_DAMAGE_LABELS[r] ?? r}
                </Badge>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Иммунитет — не получаете урон указанного типа совсем
            </p>
          </div>
        )}

        {/* Traits */}
        {race.traits && race.traits.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Расовые особенности
            </h4>
            <ul className="space-y-2">
              {race.traits.map((trait, i) => {
                const text = typeof trait === "string" ? trait : `${trait.name}: ${trait.description}`;
                const colonIdx = text.indexOf(":");
                if (colonIdx > 0 && colonIdx < 45) {
                  return (
                    <li key={i} className="text-sm leading-relaxed">
                      <span className="font-medium">{text.slice(0, colonIdx).trim()}</span>
                      <span className="text-muted-foreground"> — {text.slice(colonIdx + 1).trim()}</span>
                    </li>
                  );
                }
                return (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="text-accent mt-0.5 shrink-0">•</span>
                    <span className="text-muted-foreground leading-relaxed">{text}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Spell grants */}
        {(race.spellGrants?.length ?? 0) > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Расовые заклинания
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Изучаете эти заклинания автоматически — тратить ячейки не нужно (если не указано иное)
            </p>
            <ul className="space-y-1.5">
              {race.spellGrants!.map((sg, i) => (
                <li key={i} className="flex items-baseline gap-2 text-sm">
                  <span className="font-medium">{sg.spellName}</span>
                  <span className="text-xs text-muted-foreground">
                    {sg.minLevel === 0 ? "заговор (∞)" : `с ${sg.minLevel} ур.`}
                    {sg.usesLongRest ? " · 1×/длин. отдых" : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Skill proficiencies (auto) */}
        {(race.skillProficiencies?.length ?? 0) > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Владение навыками
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {race.skillProficiencies!.map((s) => (
                <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Skill choices */}
        {race.skillChoices && race.skillChoices.count > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Выбор навыков
            </h4>
            <p className="text-xs text-muted-foreground">
              Вы выбираете {race.skillChoices.count}{" "}
              {race.skillChoices.count === 1 ? "навык" : "навыка"}{" "}
              {race.skillChoices.options === "any"
                ? "из любых доступных"
                : `из: ${(race.skillChoices.options as string[]).join(", ")}`}
            </p>
          </div>
        )}

        {/* Languages */}
        {race.languages && race.languages.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Языки</h4>
            <div className="flex flex-wrap gap-1.5">
              {race.languages.map((lang, i) => (
                <Badge key={i} variant="secondary" className="text-xs gap-1">
                  <Globe className="w-3 h-3" />
                  {lang === "Один на выбор" ? "Один на выбор (выберете после)" : lang}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Subraces */}
        {race.subraces && Object.keys(race.subraces).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Подрасы — выберете после выбора расы
            </h4>
            <div className="space-y-1.5">
              {Object.values(race.subraces).map((sub) => {
                const bonusEntries = Object.entries(sub.abilityBonuses).filter(([, v]) => v !== 0);
                return (
                  <div key={sub.id}
                    className="rounded-lg bg-muted/30 border border-border/40 px-3 py-2.5 space-y-1">
                    <div className="font-medium text-sm">{sub.name}</div>
                    {sub.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed">{sub.description}</p>
                    )}
                    {(bonusEntries.length > 0 || sub.speed || sub.darkvision) && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {bonusEntries.map(([ability, value]) => (
                          <Badge key={ability} variant="secondary" className="text-[10px] px-1.5 py-0">
                            {ABILITY_LABELS[ability as AbilityName]?.ru ?? ability} +{value}
                          </Badge>
                        ))}
                        {sub.speed && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {sub.speed} фт.
                          </Badge>
                        )}
                        {sub.darkvision && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-1">
                            <Eye className="w-2.5 h-2.5" />{sub.darkvision} фт.
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </ScrollArea>
  );
}
