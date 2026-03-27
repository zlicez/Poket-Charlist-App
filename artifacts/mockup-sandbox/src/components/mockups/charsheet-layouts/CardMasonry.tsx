import React, { useState } from "react";
import { 
  Shield, 
  Heart, 
  Swords, 
  Wand2, 
  Backpack, 
  Coins, 
  ScrollText, 
  Skull,
  Plus,
  Minus,
  Dices
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

// Reusable Parchment Card
const ParchmentCard = ({ className, children, ...props }: React.ComponentProps<typeof Card>) => (
  <Card className={`break-inside-avoid mb-4 bg-[#fdfaf5] border-[#e8dcc7] shadow-sm hover:shadow-md transition-shadow ${className}`} {...props}>
    {children}
  </Card>
);

const SectionTitle = ({ children, icon: Icon }: { children: React.ReactNode, icon?: any }) => (
  <div className="flex items-center gap-2 mb-3">
    {Icon && <Icon className="w-5 h-5 text-amber-700" />}
    <h3 className="font-['Lora',serif] text-lg font-bold text-amber-900 border-b border-amber-200 w-full pb-1">
      {children}
    </h3>
  </div>
);

const AbilityCard = ({ name, score, modifier, skills }: { name: string, score: number, modifier: string, skills: {name: string, mod: string, prof: boolean}[] }) => (
  <ParchmentCard>
    <div className="flex flex-col items-center justify-center p-4 bg-amber-50/50 rounded-t-lg border-b border-amber-100">
      <span className="font-['Lora',serif] text-sm text-amber-700 uppercase tracking-wider font-semibold">{name}</span>
      <div className="font-['JetBrains_Mono',monospace] text-4xl font-bold text-amber-950 my-1">{score}</div>
      <Badge variant="outline" className="font-['JetBrains_Mono',monospace] bg-white border-amber-300 text-amber-800 text-md">
        {modifier}
      </Badge>
    </div>
    <div className="p-3 space-y-2">
      {skills.map(s => (
        <div key={s.name} className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${s.prof ? 'bg-amber-600' : 'bg-amber-200'}`} />
            <span className="text-stone-700">{s.name}</span>
          </div>
          <span className="font-['JetBrains_Mono',monospace] text-stone-600">{s.mod}</span>
        </div>
      ))}
    </div>
  </ParchmentCard>
);

const CombatStatBox = ({ label, value, subtext }: { label: string, value: string, subtext?: string }) => (
  <div className="flex flex-col items-center justify-center p-3 bg-white border border-amber-200 rounded-lg shadow-sm">
    <span className="font-['Lora',serif] text-xs text-amber-700 uppercase tracking-widest mb-1 text-center">{label}</span>
    <span className="font-['JetBrains_Mono',monospace] text-2xl font-bold text-amber-950">{value}</span>
    {subtext && <span className="text-xs text-stone-500 mt-1">{subtext}</span>}
  </div>
);

export function CardMasonry() {
  const [hp, setHp] = useState(45);
  const maxHp = 52;

  return (
    <div className="min-h-screen bg-[#f4ebd8] bg-[radial-gradient(#e5d8c3_1px,transparent_1px)] [background-size:16px_16px] p-4 md:p-8 font-['Inter',sans-serif]">
      
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 bg-[#fdfaf5] border border-[#e8dcc7] p-6 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-['Lora',serif] text-4xl font-bold text-amber-950 mb-1">Ториан "Стальной"</h1>
          <div className="flex flex-wrap gap-2 text-sm text-amber-800 font-medium">
            <span>Человек (Вариант)</span>
            <span>•</span>
            <span>Воин 5</span>
            <span>•</span>
            <span>Солдат</span>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-right border-r border-amber-200 pr-4">
            <div className="text-xs text-amber-600 uppercase tracking-wider font-bold">Уровень</div>
            <div className="font-['JetBrains_Mono',monospace] text-2xl font-bold text-amber-950">5</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-amber-600 uppercase tracking-wider font-bold">Опыт</div>
            <div className="font-['JetBrains_Mono',monospace] text-xl font-bold text-amber-950">6,500</div>
          </div>
        </div>
      </header>

      {/* Masonry Grid */}
      <main className="max-w-7xl mx-auto columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
        
        {/* HP & Main Combat */}
        <ParchmentCard className="bg-white border-red-200 border-2 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-600" />
          <CardHeader className="pb-2">
            <CardTitle className="flex justify-between items-center font-['Lora',serif] text-red-900 text-xl">
              <span className="flex items-center gap-2"><Heart className="w-5 h-5 fill-red-100" /> Хиты</span>
              <span className="font-['JetBrains_Mono',monospace] text-2xl">{hp} <span className="text-stone-400 text-lg">/ {maxHp}</span></span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={(hp/maxHp)*100} className="h-3 mb-4 bg-red-100" indicatorClassName="bg-red-600" />
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={() => setHp(Math.max(0, hp-1))}><Minus className="w-4 h-4" /></Button>
              <div className="w-16 text-center text-sm border rounded flex items-center justify-center font-['JetBrains_Mono',monospace]">1</div>
              <Button variant="outline" size="sm" onClick={() => setHp(Math.min(maxHp, hp+1))}><Plus className="w-4 h-4" /></Button>
            </div>
            
            <Separator className="my-4 bg-amber-100" />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-stone-500 uppercase tracking-wider mb-1">Кости Хитов</div>
                <div className="font-['JetBrains_Mono',monospace] text-lg">5d10</div>
              </div>
              <div>
                <div className="text-xs text-stone-500 uppercase tracking-wider mb-1">Врем. Хиты</div>
                <div className="font-['JetBrains_Mono',monospace] text-lg text-amber-600">0</div>
              </div>
            </div>
          </CardContent>
        </ParchmentCard>

        {/* Combat Stats Mini-Grid */}
        <div className="break-inside-avoid grid grid-cols-2 gap-2 mb-6">
          <CombatStatBox label="Класс Доспеха" value="18" subtext="Латы" />
          <CombatStatBox label="Инициатива" value="+2" />
          <CombatStatBox label="Скорость" value="30 фт." />
          <CombatStatBox label="Бонус Маст." value="+3" />
        </div>

        {/* Abilities */}
        <AbilityCard 
          name="Сила" score={16} modifier="+3" 
          skills={[{name: "Атлетика", mod: "+6", prof: true}]} 
        />
        
        <AbilityCard 
          name="Ловкость" score={14} modifier="+2" 
          skills={[
            {name: "Акробатика", mod: "+2", prof: false},
            {name: "Ловкость рук", mod: "+2", prof: false},
            {name: "Скрытность", mod: "+2", prof: false}
          ]} 
        />

        <AbilityCard 
          name="Телосложение" score={15} modifier="+2" 
          skills={[]} 
        />

        <AbilityCard 
          name="Интеллект" score={10} modifier="+0" 
          skills={[
            {name: "Анализ", mod: "+0", prof: false},
            {name: "История", mod: "+0", prof: false},
            {name: "Магия", mod: "+0", prof: false},
            {name: "Природа", mod: "+0", prof: false},
            {name: "Религия", mod: "+0", prof: false}
          ]} 
        />

        <AbilityCard 
          name="Мудрость" score={12} modifier="+1" 
          skills={[
            {name: "Внимательность", mod: "+4", prof: true},
            {name: "Выживание", mod: "+4", prof: true},
            {name: "Медицина", mod: "+1", prof: false},
            {name: "Проницательность", mod: "+1", prof: false},
            {name: "Уход за животными", mod: "+1", prof: false}
          ]} 
        />

        <AbilityCard 
          name="Харизма" score={10} modifier="+0" 
          skills={[
            {name: "Выступление", mod: "+0", prof: false},
            {name: "Запугивание", mod: "+3", prof: true},
            {name: "Обман", mod: "+0", prof: false},
            {name: "Убеждение", mod: "+0", prof: false}
          ]} 
        />

        {/* Saving Throws */}
        <ParchmentCard>
          <CardHeader className="pb-2">
            <SectionTitle icon={Shield}>Спасброски</SectionTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { name: "Сила", mod: "+6", prof: true },
              { name: "Ловкость", mod: "+2", prof: false },
              { name: "Телосложение", mod: "+5", prof: true },
              { name: "Интеллект", mod: "+0", prof: false },
              { name: "Мудрость", mod: "+1", prof: false },
              { name: "Харизма", mod: "+0", prof: false }
            ].map(s => (
              <div key={s.name} className="flex justify-between items-center bg-white/50 p-2 rounded border border-amber-100">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-sm border ${s.prof ? 'bg-amber-600 border-amber-700' : 'bg-transparent border-amber-300'}`} />
                  <span className="text-sm font-medium text-stone-700">{s.name}</span>
                </div>
                <span className="font-['JetBrains_Mono',monospace] text-amber-900">{s.mod}</span>
              </div>
            ))}
          </CardContent>
        </ParchmentCard>

        {/* Weapons */}
        <ParchmentCard>
          <CardHeader className="pb-2">
            <SectionTitle icon={Swords}>Атаки и Заклинания</SectionTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-white border border-stone-200 rounded-lg p-3 shadow-sm flex justify-between items-center hover:border-amber-400 cursor-pointer transition-colors">
              <div>
                <div className="font-bold text-stone-800">Длинный меч</div>
                <div className="text-xs text-stone-500">Ближний бой, Рубящий</div>
              </div>
              <div className="text-right">
                <div className="font-['JetBrains_Mono',monospace] font-bold text-amber-700">+6</div>
                <div className="font-['JetBrains_Mono',monospace] text-sm text-stone-600">1d8+3</div>
              </div>
            </div>
            
            <div className="bg-white border border-stone-200 rounded-lg p-3 shadow-sm flex justify-between items-center hover:border-amber-400 cursor-pointer transition-colors">
              <div>
                <div className="font-bold text-stone-800">Тяжелый арбалет</div>
                <div className="text-xs text-stone-500">Дальний (100/400), Колющий</div>
              </div>
              <div className="text-right">
                <div className="font-['JetBrains_Mono',monospace] font-bold text-amber-700">+5</div>
                <div className="font-['JetBrains_Mono',monospace] text-sm text-stone-600">1d10+2</div>
              </div>
            </div>

            <Button variant="outline" className="w-full mt-2 text-amber-700 border-amber-200 hover:bg-amber-50">
              <Dices className="w-4 h-4 mr-2" /> Сделать бросок
            </Button>
          </CardContent>
        </ParchmentCard>

        {/* Death Saves */}
        <ParchmentCard>
          <CardContent className="pt-6 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Skull className="w-5 h-5 text-stone-400" />
              <span className="font-['Lora',serif] font-bold text-stone-700">Спасброски от смерти</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex gap-1 items-center">
                <span className="text-xs text-stone-500 w-12 text-right">Успехи</span>
                <div className="w-3 h-3 rounded-full border border-stone-300" />
                <div className="w-3 h-3 rounded-full border border-stone-300" />
                <div className="w-3 h-3 rounded-full border border-stone-300" />
              </div>
              <div className="flex gap-1 items-center">
                <span className="text-xs text-stone-500 w-12 text-right">Провалы</span>
                <div className="w-3 h-3 rounded-full border border-stone-300" />
                <div className="w-3 h-3 rounded-full border border-stone-300" />
                <div className="w-3 h-3 rounded-full border border-stone-300" />
              </div>
            </div>
          </CardContent>
        </ParchmentCard>

        {/* Features & Traits */}
        <ParchmentCard>
          <CardHeader className="pb-2">
            <SectionTitle icon={Wand2}>Умения и Особенности</SectionTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="font-bold text-amber-900">Второе дыхание</h4>
              <p className="text-stone-600 mt-1 leading-relaxed">В свой ход вы можете бонусным действием восстановить хиты в размере 1d10 + ваш уровень воина. 1/короткий отдых.</p>
            </div>
            <div>
              <h4 className="font-bold text-amber-900">Порыв к действию</h4>
              <p className="text-stone-600 mt-1 leading-relaxed">В свой ход вы можете совершить одно дополнительное действие. 1/короткий отдых.</p>
            </div>
            <div>
              <h4 className="font-bold text-amber-900">Боевой стиль: Дуэлянт</h4>
              <p className="text-stone-600 mt-1 leading-relaxed">Пока вы держите рукопашное оружие в одной руке, и не используете другого оружия, вы получаете бонус +2 к броскам урона им.</p>
            </div>
          </CardContent>
        </ParchmentCard>

        {/* Proficiencies */}
        <ParchmentCard>
          <CardHeader className="pb-2">
            <SectionTitle icon={ScrollText}>Владения и Языки</SectionTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Броня и Оружие</h4>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="bg-amber-100/50 text-amber-800 hover:bg-amber-200/50">Легкая броня</Badge>
                  <Badge variant="secondary" className="bg-amber-100/50 text-amber-800 hover:bg-amber-200/50">Средняя броня</Badge>
                  <Badge variant="secondary" className="bg-amber-100/50 text-amber-800 hover:bg-amber-200/50">Тяжелая броня</Badge>
                  <Badge variant="secondary" className="bg-amber-100/50 text-amber-800 hover:bg-amber-200/50">Щиты</Badge>
                  <Badge variant="secondary" className="bg-amber-100/50 text-amber-800 hover:bg-amber-200/50">Простое оружие</Badge>
                  <Badge variant="secondary" className="bg-amber-100/50 text-amber-800 hover:bg-amber-200/50">Воинское оружие</Badge>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Языки</h4>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="border-amber-200 text-stone-600">Общий</Badge>
                  <Badge variant="outline" className="border-amber-200 text-stone-600">Дварфийский</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </ParchmentCard>

        {/* Money */}
        <ParchmentCard>
          <CardHeader className="pb-2">
            <SectionTitle icon={Coins}>Сокровища</SectionTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-amber-100 shadow-inner">
              <div className="text-center">
                <div className="text-[10px] text-stone-500 font-bold mb-1">ММ</div>
                <div className="font-['JetBrains_Mono',monospace] text-lg text-amber-800">12</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-stone-500 font-bold mb-1">СМ</div>
                <div className="font-['JetBrains_Mono',monospace] text-lg text-slate-500">45</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-stone-500 font-bold mb-1">ЭМ</div>
                <div className="font-['JetBrains_Mono',monospace] text-lg text-teal-700">0</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-amber-600 font-bold mb-1">ЗМ</div>
                <div className="font-['JetBrains_Mono',monospace] text-2xl font-bold text-amber-500 drop-shadow-sm">142</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-stone-500 font-bold mb-1">ПМ</div>
                <div className="font-['JetBrains_Mono',monospace] text-lg text-slate-400">0</div>
              </div>
            </div>
          </CardContent>
        </ParchmentCard>

        {/* Inventory */}
        <ParchmentCard>
          <CardHeader className="pb-2">
            <SectionTitle icon={Backpack}>Снаряжение</SectionTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-stone-700 space-y-2 font-medium divide-y divide-amber-100/50">
              <li className="flex justify-between items-center pt-2 first:pt-0">
                <span>Рюкзак</span>
                <span className="text-stone-400 text-xs">1 шт</span>
              </li>
              <li className="flex justify-between items-center pt-2">
                <span>Спальник</span>
                <span className="text-stone-400 text-xs">1 шт</span>
              </li>
              <li className="flex justify-between items-center pt-2">
                <span>Столовый набор</span>
                <span className="text-stone-400 text-xs">1 шт</span>
              </li>
              <li className="flex justify-between items-center pt-2">
                <span>Трутница</span>
                <span className="text-stone-400 text-xs">1 шт</span>
              </li>
              <li className="flex justify-between items-center pt-2">
                <span>Факел</span>
                <span className="text-stone-400 text-xs">10 шт</span>
              </li>
              <li className="flex justify-between items-center pt-2">
                <span>Рационы</span>
                <span className="text-stone-400 text-xs">10 дней</span>
              </li>
              <li className="flex justify-between items-center pt-2">
                <span>Веревка, пеньковая (50 фт)</span>
                <span className="text-stone-400 text-xs">1 шт</span>
              </li>
            </ul>
          </CardContent>
        </ParchmentCard>

        {/* Notes */}
        <ParchmentCard>
          <CardHeader className="pb-2">
            <SectionTitle>Заметки и Предыстория</SectionTitle>
          </CardHeader>
          <CardContent className="text-sm text-stone-600 italic leading-relaxed space-y-4">
            <p>
              Ветеран северных войн. Молчалив, но надежен в бою. Всегда держит свое оружие в идеальном состоянии. Не доверяет магам после инцидента в ущелье Красных Песков.
            </p>
            <div>
              <strong className="not-italic text-stone-800">Идеал:</strong> Ответственность. Я делаю то, что должен, и выполняю приказы.
            </div>
            <div>
              <strong className="not-italic text-stone-800">Привязанность:</strong> Те, кто сражается рядом со мной — достойны моей жизни.
            </div>
            <div>
              <strong className="not-italic text-stone-800">Слабость:</strong> Я допустил ужасную ошибку в бою, стоившую многих жизней, и сделаю все, чтобы сохранить это в тайне.
            </div>
          </CardContent>
        </ParchmentCard>

      </main>
    </div>
  );
}
