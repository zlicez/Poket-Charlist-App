import { useState } from "react";
import { 
  Shield, Swords, Heart, Activity, Backpack, Coins, 
  Book, ScrollText, Plus, Minus, Dices, Circle, 
  CheckCircle2, Wind, Zap
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const ABILITIES = [
  { id: "str", name: "Сила", score: 18, mod: "+4", skills: [{ name: "Атлетика", prof: true, val: "+7" }] },
  { id: "dex", name: "Ловкость", score: 14, mod: "+2", skills: [
    { name: "Акробатика", prof: false, val: "+2" },
    { name: "Ловкость рук", prof: false, val: "+2" },
    { name: "Скрытность", prof: true, val: "+5" }
  ]},
  { id: "con", name: "Телосложение", score: 16, mod: "+3", skills: [] },
  { id: "int", name: "Интеллект", score: 10, mod: "+0", skills: [
    { name: "Анализ", prof: false, val: "+0" },
    { name: "История", prof: true, val: "+3" },
    { name: "Магия", prof: false, val: "+0" },
    { name: "Природа", prof: false, val: "+0" },
    { name: "Религия", prof: false, val: "+0" }
  ]},
  { id: "wis", name: "Мудрость", score: 12, mod: "+1", skills: [
    { name: "Внимательность", prof: true, val: "+4" },
    { name: "Выживание", prof: true, val: "+4" },
    { name: "Медицина", prof: false, val: "+1" },
    { name: "Проницательность", prof: false, val: "+1" },
    { name: "Уход за животными", prof: false, val: "+1" }
  ]},
  { id: "cha", name: "Харизма", score: 8, mod: "-1", skills: [
    { name: "Выступление", prof: false, val: "-1" },
    { name: "Запугивание", prof: true, val: "+2" },
    { name: "Обман", prof: false, val: "-1" },
    { name: "Убеждение", prof: false, val: "-1" }
  ]},
];

const SAVING_THROWS = [
  { name: "Сила", prof: true, val: "+7" },
  { name: "Ловкость", prof: false, val: "+2" },
  { name: "Телосложение", prof: true, val: "+6" },
  { name: "Интеллект", prof: false, val: "+0" },
  { name: "Мудрость", prof: false, val: "+1" },
  { name: "Харизма", prof: false, val: "-1" },
];

export function TabbedRefinedA() {
  const [hp, setHp] = useState(45);
  const maxHp = 52;

  return (
    <div 
      className="min-h-screen bg-[#f4ebd8] text-[#3d2b1f] font-sans pb-12"
      style={{
        backgroundImage: 'url("/__mockup/images/parchment-bg.png")',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="container mx-auto px-4 max-w-5xl pt-6">
        {/* Header - Always Visible */}
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start mb-8 bg-white/60 p-6 rounded-2xl shadow-sm border border-[#d2b48c] backdrop-blur-sm">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#8b4513] shadow-md flex-shrink-0">
            <img 
              src="/__mockup/images/fighter-portrait.png" 
              alt="Character Portrait" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-grow flex flex-col md:flex-row justify-between w-full gap-4">
            <div>
              <h1 className="font-serif text-4xl font-bold text-[#5c3a21] mb-2">Торвальд Гроза Орков</h1>
              <div className="flex flex-wrap gap-2 text-sm font-medium">
                <Badge variant="outline" className="border-[#8b4513] text-[#8b4513] bg-white/50 px-3 py-1">Воин 5</Badge>
                <Badge variant="outline" className="border-[#8b4513] text-[#8b4513] bg-white/50 px-3 py-1">Человек</Badge>
                <Badge variant="outline" className="border-[#8b4513] text-[#8b4513] bg-white/50 px-3 py-1">Солдат</Badge>
                <Badge variant="outline" className="border-[#8b4513] text-[#8b4513] bg-white/50 px-3 py-1">Нейтрально-добрый</Badge>
              </div>
            </div>
            <div className="flex flex-row md:flex-col gap-4 md:items-end">
              <div className="bg-[#5c3a21] text-[#f4ebd8] px-4 py-2 rounded-xl text-center shadow flex items-center gap-3">
                <span className="text-xs uppercase tracking-wider opacity-80">БМ</span>
                <span className="text-xl font-bold font-mono">+3</span>
              </div>
              <div className="bg-white/80 px-4 py-2 rounded-xl text-center border border-[#d2b48c] shadow-sm flex items-center gap-3">
                <span className="text-xs uppercase tracking-wider text-[#8b4513]">Опыт</span>
                <span className="text-lg font-bold font-mono text-[#5c3a21]">6 500</span>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Tabs */}
        <Tabs defaultValue="abilities" className="w-full">
          <TabsList className="w-full flex h-auto p-0 bg-transparent mb-8 overflow-x-auto flex-nowrap border-b-2 border-[#8b4513] rounded-none">
            {[
              { id: 'abilities', label: 'Характеристики' },
              { id: 'combat', label: 'Бой' },
              { id: 'equipment', label: 'Снаряжение' },
              { id: 'features', label: 'Способности' },
              { id: 'notes', label: 'Заметки' }
            ].map((tab) => (
              <TabsTrigger 
                key={tab.id}
                value={tab.id} 
                className="relative flex-1 py-3 px-6 text-sm md:text-base font-serif font-semibold rounded-t-xl border-t-2 border-l-2 border-r-2 border-transparent data-[state=active]:border-[#8b4513] data-[state=active]:bg-white/60 data-[state=active]:text-[#5c3a21] text-[#8b4513]/70 hover:text-[#5c3a21] hover:bg-white/30 transition-all mb-[-2px] data-[state=active]:z-10 shadow-none data-[state=active]:shadow-sm"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ABILITIES TAB */}
          <TabsContent value="abilities" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
              {ABILITIES.map(ability => (
                <Card key={ability.id} className="bg-white/60 border-[#d2b48c] shadow-sm rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-[#d2b48c]/50 bg-white/40">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#f4ebd8] w-12 h-12 rounded-full border-2 border-[#8b4513] flex items-center justify-center shadow-inner">
                        <span className="text-xl font-bold text-[#5c3a21] font-mono">{ability.score}</span>
                      </div>
                      <h2 className="font-serif text-xl font-bold text-[#5c3a21]">{ability.name}</h2>
                    </div>
                    <div className="bg-[#5c3a21] text-[#f4ebd8] px-4 py-1 rounded-full text-lg font-bold font-mono shadow">
                      {ability.mod}
                    </div>
                  </div>
                  {ability.skills.length > 0 && (
                    <div className="p-4 space-y-3">
                      {ability.skills.map((skill, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2">
                            {skill.prof ? (
                              <CheckCircle2 className="w-5 h-5 text-[#8b4513]" />
                            ) : (
                              <Circle className="w-5 h-5 text-[#d2b48c]" />
                            )}
                            <span className={skill.prof ? "font-semibold text-[#3d2b1f] text-base" : "text-[#5c3a21]/80 text-base"}>
                              {skill.name}
                            </span>
                          </div>
                          <span className={`font-mono text-base ${skill.prof ? "font-bold text-[#8b4513]" : "text-[#5c3a21]/80"}`}>
                            {skill.val}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>

            <Card className="bg-white/60 border-[#d2b48c] shadow-sm rounded-xl">
              <CardHeader className="pb-4">
                <CardTitle className="font-serif text-2xl text-[#5c3a21]">Спасброски</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {SAVING_THROWS.map((save, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white/70 p-4 rounded-xl border border-[#d2b48c] shadow-sm">
                      <div className="flex items-center gap-3">
                        {save.prof ? (
                          <CheckCircle2 className="w-6 h-6 text-[#8b4513]" />
                        ) : (
                          <Circle className="w-6 h-6 text-[#d2b48c]" />
                        )}
                        <span className="text-sm md:text-base uppercase tracking-wider font-bold text-[#5c3a21]">{save.name}</span>
                      </div>
                      <span className={`font-mono text-xl ${save.prof ? "font-bold text-[#8b4513]" : "text-[#5c3a21]/80"}`}>
                        {save.val}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* COMBAT TAB */}
          <TabsContent value="combat" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Top Row Combat Stats */}
              <Card className="md:col-span-8 bg-white/60 border-[#d2b48c] shadow-sm rounded-xl">
                <CardContent className="p-6">
                  <div className="flex flex-wrap md:flex-nowrap gap-6 justify-around items-center h-full">
                    {/* AC */}
                    <div className="flex flex-col items-center">
                      <div className="relative flex items-center justify-center w-20 h-24">
                        <Shield className="w-full h-full text-[#5c3a21] absolute" strokeWidth={1.5} />
                        <span className="font-mono text-2xl font-bold text-[#f4ebd8] z-10 pt-2">18</span>
                      </div>
                      <span className="font-serif font-bold text-[#8b4513] mt-3">КД</span>
                    </div>
                    
                    {/* Initiative */}
                    <div className="flex flex-col items-center">
                      <div className="relative flex items-center justify-center w-20 h-24">
                        <Zap className="w-full h-full text-[#d2b48c] absolute opacity-30" strokeWidth={1.5} />
                        <div className="w-16 h-16 rounded-full border-2 border-[#8b4513] bg-[#f4ebd8] flex items-center justify-center shadow-sm z-10">
                          <span className="font-mono text-xl font-bold text-[#5c3a21]">+2</span>
                        </div>
                      </div>
                      <span className="font-serif font-bold text-[#8b4513] mt-3">Инициатива</span>
                    </div>

                    {/* Speed */}
                    <div className="flex flex-col items-center">
                      <div className="relative flex items-center justify-center w-20 h-24">
                        <Wind className="w-full h-full text-[#d2b48c] absolute opacity-30" strokeWidth={1.5} />
                        <div className="w-16 h-16 rounded-full border-2 border-[#8b4513] bg-[#f4ebd8] flex items-center justify-center shadow-sm z-10">
                          <div className="flex items-baseline gap-1">
                            <span className="font-mono text-xl font-bold text-[#5c3a21]">30</span>
                          </div>
                        </div>
                      </div>
                      <span className="font-serif font-bold text-[#8b4513] mt-3">Скорость</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* HP Tracker */}
              <Card className="md:col-span-4 bg-[#5c3a21] text-[#f4ebd8] border-none shadow-md rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="font-serif text-xl flex items-center gap-2 text-white">
                    <Heart className="w-5 h-5 fill-red-500 text-red-500" /> Хиты
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-center gap-2 mb-4">
                    <span className="font-mono text-5xl font-bold">{hp}</span>
                    <span className="font-mono text-xl opacity-70 mb-1">/ {maxHp}</span>
                  </div>
                  <Progress value={(hp/maxHp)*100} className="h-3 bg-black/30 mb-6 [&>div]:bg-red-500" />
                  
                  <div className="flex gap-2 justify-center">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full bg-white/10 hover:bg-white/20 border-white/20 text-white"
                      onClick={() => setHp(Math.max(0, hp - 1))}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <div className="flex gap-2 w-full max-w-[120px]">
                      <Button variant="secondary" className="flex-1 bg-red-900/50 hover:bg-red-900/70 text-white border-none" onClick={() => setHp(Math.max(0, hp - 5))}>-5</Button>
                      <Button variant="secondary" className="flex-1 bg-green-900/50 hover:bg-green-900/70 text-white border-none" onClick={() => setHp(Math.min(maxHp, hp + 5))}>+5</Button>
                    </div>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full bg-white/10 hover:bg-white/20 border-white/20 text-white"
                      onClick={() => setHp(Math.min(maxHp, hp + 1))}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Weapons */}
              <Card className="md:col-span-8 bg-white/60 border-[#d2b48c] shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="font-serif text-xl text-[#5c3a21] flex items-center gap-2">
                    <Swords className="w-5 h-5" /> Атаки и Заклинания
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-12 gap-4 text-sm font-bold uppercase tracking-wider text-[#8b4513] pb-2 border-b-2 border-[#d2b48c]/50">
                      <div className="col-span-5">Название</div>
                      <div className="col-span-3 text-center">Бонус</div>
                      <div className="col-span-4 text-center">Урон/Тип</div>
                    </div>
                    
                    {[
                      { name: "Длинный меч", bonus: "+7", dmg: "1к8+4 руб", type: "melee" },
                      { name: "Тяжелый арбалет", bonus: "+5", dmg: "1к10+2 кол", type: "ranged" },
                      { name: "Ручной топор", bonus: "+7", dmg: "1к6+4 руб", type: "melee" },
                    ].map((w, i) => (
                      <div key={i} className="grid grid-cols-12 gap-4 items-center bg-white/50 p-3 rounded-lg border border-[#d2b48c]/40 hover:border-[#8b4513]/50 transition-colors cursor-pointer group shadow-sm">
                        <div className="col-span-5 font-semibold text-base text-[#3d2b1f] group-hover:text-[#8b4513] transition-colors">{w.name}</div>
                        <div className="col-span-3 text-center font-mono font-bold text-xl text-[#5c3a21]">{w.bonus}</div>
                        <div className="col-span-4 text-center font-mono text-sm md:text-base flex items-center justify-center gap-2 text-[#3d2b1f]">
                          {w.dmg} <Button variant="ghost" size="icon" className="h-8 w-8 text-[#8b4513] hover:text-[#5c3a21] hover:bg-[#d2b48c]/20"><Dices className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Hit Dice & Death Saves */}
              <div className="md:col-span-4 space-y-6">
                <Card className="bg-white/60 border-[#d2b48c] shadow-sm rounded-xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-serif text-lg text-[#5c3a21] text-center">Кости Хитов</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <div className="text-4xl font-mono font-bold text-[#5c3a21] mb-2">5к10</div>
                    <div className="text-sm font-semibold text-[#8b4513] uppercase tracking-wide">Всего: 5</div>
                  </CardContent>
                </Card>

                <Card className="bg-white/60 border-[#d2b48c] shadow-sm rounded-xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-serif text-lg text-[#5c3a21] text-center flex items-center justify-center gap-2">
                      <Activity className="w-5 h-5" /> Спасброски от смерти
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between bg-white/40 p-2 rounded-lg border border-green-700/20">
                        <span className="text-sm font-bold uppercase text-green-700 tracking-wide">Успехи</span>
                        <div className="flex gap-2">
                          <Circle className="w-6 h-6 text-green-700/30" />
                          <Circle className="w-6 h-6 text-green-700/30" />
                          <Circle className="w-6 h-6 text-green-700/30" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-white/40 p-2 rounded-lg border border-red-700/20">
                        <span className="text-sm font-bold uppercase text-red-700 tracking-wide">Провалы</span>
                        <div className="flex gap-2">
                          <Circle className="w-6 h-6 text-red-700/30" />
                          <Circle className="w-6 h-6 text-red-700/30" />
                          <Circle className="w-6 h-6 text-red-700/30" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* EQUIPMENT TAB */}
          <TabsContent value="equipment" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
            {/* Money - Horizontal */}
            <Card className="bg-white/60 border-[#d2b48c] shadow-sm rounded-xl">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
                  <div className="flex items-center gap-2 text-[#5c3a21] font-serif font-bold text-xl mr-4">
                    <Coins className="w-6 h-6 text-yellow-600" />
                    Кошелек:
                  </div>
                  {[
                    { label: "ММ", val: 12, color: "text-amber-900 bg-amber-100 border-amber-300" },
                    { label: "СМ", val: 45, color: "text-slate-700 bg-slate-100 border-slate-300" },
                    { label: "ЭМ", val: 0, color: "text-indigo-900 bg-indigo-100 border-indigo-300" },
                    { label: "ЗМ", val: 125, color: "text-yellow-800 bg-yellow-100 border-yellow-400" },
                    { label: "ПМ", val: 2, color: "text-zinc-800 bg-zinc-100 border-zinc-300" },
                  ].map((c, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white/80 p-2 pr-5 rounded-full border border-[#d2b48c] shadow-sm">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-inner border ${c.color}`}>
                        {c.label}
                      </div>
                      <span className="font-mono text-2xl font-bold text-[#5c3a21]">{c.val}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Inventory */}
              <Card className="lg:col-span-2 bg-white/60 border-[#d2b48c] shadow-sm flex flex-col h-full rounded-xl">
                <CardHeader className="pb-4 border-b border-[#d2b48c]/50 bg-white/40 rounded-t-xl">
                  <div className="flex justify-between items-center">
                    <CardTitle className="font-serif text-2xl text-[#5c3a21] flex items-center gap-2">
                      <Backpack className="w-6 h-6" /> Инвентарь
                    </CardTitle>
                    <div className="bg-[#f4ebd8] px-4 py-2 rounded-lg border border-[#d2b48c] shadow-inner text-sm font-semibold text-[#8b4513]">
                      Вес: <span className="font-mono text-base ml-1">65 / 270</span> фт
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex-grow">
                  <div className="h-[400px] overflow-y-auto p-6 space-y-3">
                    {[
                      { name: "Кольчуга", weight: "55", type: "armor", qty: 1 },
                      { name: "Набор путешественника", weight: "59", type: "gear", qty: 1 },
                      { name: "Веревка пеньковая (50 фт)", weight: "10", type: "gear", qty: 1 },
                      { name: "Факел", weight: "1", type: "consumable", qty: 5 },
                      { name: "Рационы", weight: "2", type: "consumable", qty: 10 },
                      { name: "Бурдюк", weight: "5", type: "gear", qty: 1 },
                      { name: "Зелье лечения", weight: "0.5", type: "potion", qty: 2 },
                      { name: "Свиток непонятный", weight: "0", type: "scroll", qty: 1 },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-4 bg-white/70 rounded-xl border border-[#d2b48c]/50 shadow-sm hover:border-[#8b4513]/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <span className="bg-[#8b4513] text-[#f4ebd8] text-sm font-mono px-3 py-1 rounded-md shadow-sm">x{item.qty}</span>
                          <span className="font-semibold text-base text-[#3d2b1f]">{item.name}</span>
                        </div>
                        <span className="text-sm text-[#8b4513] font-mono font-medium">{item.weight} <span className="text-xs">фт</span></span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Proficiencies */}
              <Card className="lg:col-span-1 bg-white/60 border-[#d2b48c] shadow-sm rounded-xl">
                <CardHeader className="bg-white/40 border-b border-[#d2b48c]/50 rounded-t-xl">
                  <CardTitle className="font-serif text-xl text-[#5c3a21]">Владения и Языки</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-[#8b4513] mb-3 uppercase tracking-wider text-sm border-b border-[#d2b48c]/30 pb-1">Доспехи</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-white/80 text-[#5c3a21] border-[#d2b48c] px-3 py-1 text-sm">Легкие</Badge>
                        <Badge variant="secondary" className="bg-white/80 text-[#5c3a21] border-[#d2b48c] px-3 py-1 text-sm">Средние</Badge>
                        <Badge variant="secondary" className="bg-white/80 text-[#5c3a21] border-[#d2b48c] px-3 py-1 text-sm">Тяжелые</Badge>
                        <Badge variant="secondary" className="bg-white/80 text-[#5c3a21] border-[#d2b48c] px-3 py-1 text-sm">Щиты</Badge>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#8b4513] mb-3 uppercase tracking-wider text-sm border-b border-[#d2b48c]/30 pb-1">Оружие</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-white/80 text-[#5c3a21] border-[#d2b48c] px-3 py-1 text-sm">Простое</Badge>
                        <Badge variant="secondary" className="bg-white/80 text-[#5c3a21] border-[#d2b48c] px-3 py-1 text-sm">Воинское</Badge>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#8b4513] mb-3 uppercase tracking-wider text-sm border-b border-[#d2b48c]/30 pb-1">Инструменты</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-white/80 text-[#5c3a21] border-[#d2b48c] px-3 py-1 text-sm">Карточные игры</Badge>
                        <Badge variant="secondary" className="bg-white/80 text-[#5c3a21] border-[#d2b48c] px-3 py-1 text-sm">Транспорт (наземный)</Badge>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#8b4513] mb-3 uppercase tracking-wider text-sm border-b border-[#d2b48c]/30 pb-1">Языки</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-white/80 text-[#5c3a21] border-[#d2b48c] px-3 py-1 text-sm">Общий</Badge>
                        <Badge variant="secondary" className="bg-white/80 text-[#5c3a21] border-[#d2b48c] px-3 py-1 text-sm">Орочий</Badge>
                        <Badge variant="secondary" className="bg-white/80 text-[#5c3a21] border-[#d2b48c] px-3 py-1 text-sm">Дварфийский</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* FEATURES TAB */}
          <TabsContent value="features" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
            <Card className="bg-white/60 border-[#d2b48c] shadow-sm rounded-xl">
              <CardHeader className="bg-white/40 border-b border-[#d2b48c]/50 rounded-t-xl pb-4">
                <CardTitle className="font-serif text-2xl text-[#5c3a21] flex items-center gap-2">
                  <ScrollText className="w-6 h-6" /> Умения и Особенности
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[
                    { title: "Боевой стиль: Дуэлянт", source: "Воин 1", desc: "Когда вы держите рукопашное оружие в одной руке, и не используете другого оружия, вы получаете бонус +2 к броскам урона этим оружием." },
                    { title: "Второе дыхание", source: "Воин 1", desc: "Вы обладаете ограниченным источником выносливости. Вы можете в свой ход бонусным действием восстановить хиты в размере 1к10 + ваш уровень воина. Использовав это умение, вы должны завершить короткий или продолжительный отдых, чтобы получить возможность использовать его снова." },
                    { title: "Всплеск действий", source: "Воин 2", desc: "Вы можете совершить одно дополнительное действие помимо обычного (и бонусного) действия. Использовав это умение, вы должны завершить короткий или продолжительный отдых, чтобы получить возможность использовать его снова." },
                    { title: "Архетип: Мастер боевых искусств", source: "Воин 3", desc: "Вы получаете кости превосходства (4к8) и маневры." },
                    { title: "Дополнительная атака", source: "Воин 5", desc: "Вы можете совершить две атаки вместо одной, когда в свой ход совершаете действие Атака." }
                  ].map((feat, i) => (
                    <div key={i} className="bg-white/70 p-5 rounded-xl border border-[#d2b48c]/50 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-[#8b4513]"></div>
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 gap-2">
                        <h3 className="font-serif font-bold text-xl text-[#5c3a21]">{feat.title}</h3>
                        <Badge variant="outline" className="border-[#8b4513] text-[#8b4513] bg-[#f4ebd8] md:ml-auto w-fit">{feat.source}</Badge>
                      </div>
                      <p className="text-[#3d2b1f] leading-relaxed text-base">{feat.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NOTES TAB */}
          <TabsContent value="notes" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <Card className="bg-white/60 border-[#d2b48c] shadow-sm rounded-xl">
                <CardHeader className="bg-white/40 border-b border-[#d2b48c]/50 rounded-t-xl">
                  <CardTitle className="font-serif text-2xl text-[#5c3a21] flex items-center gap-2">
                    <Book className="w-6 h-6" /> Предыстория
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  {[
                    { title: "Черта характера", content: "Я всегда вежлив и уважителен. Я не доверяю тем, кто не проявляет уважения к старшим." },
                    { title: "Идеал", content: "Независимость. Я волен сам выбирать свой путь (Хаотичный)." },
                    { title: "Привязанность", content: "Те, кто сражался со мной бок о бок, для меня важнее всего на свете." },
                    { title: "Слабость", content: "Я совершил ужасную ошибку в бою, которая стоила многих жизней, и я сделаю всё, чтобы сохранить это в тайне." }
                  ].map((item, i) => (
                    <div key={i}>
                      <h4 className="font-bold text-[#8b4513] mb-2 uppercase tracking-wide text-sm">{item.title}</h4>
                      <div 
                        contentEditable
                        suppressContentEditableWarning
                        className="bg-white/70 p-4 rounded-xl border border-[#d2b48c]/50 text-base italic text-[#3d2b1f] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#8b4513]/50 focus:border-[#8b4513]"
                      >
                        {item.content}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="bg-white/60 border-[#d2b48c] shadow-sm rounded-xl">
                  <CardHeader className="bg-white/40 border-b border-[#d2b48c]/50 rounded-t-xl">
                    <CardTitle className="font-serif text-2xl text-[#5c3a21]">Внешность</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { label: "Возраст", val: "28" },
                        { label: "Рост", val: "185 см" },
                        { label: "Вес", val: "90 кг" },
                        { label: "Глаза", val: "Карие" },
                        { label: "Кожа", val: "Смуглая" },
                        { label: "Волосы", val: "Темные" }
                      ].map((item, i) => (
                        <div key={i} className="bg-white/70 p-3 rounded-xl border border-[#d2b48c]/50 text-center shadow-sm">
                          <div className="text-xs uppercase text-[#8b4513] font-bold tracking-wider mb-1">{item.label}</div>
                          <div className="font-mono text-lg text-[#5c3a21]">{item.val}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/60 border-[#d2b48c] shadow-sm rounded-xl flex-grow">
                  <CardHeader className="bg-white/40 border-b border-[#d2b48c]/50 rounded-t-xl">
                    <CardTitle className="font-serif text-2xl text-[#5c3a21]">Союзники и Организации</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div 
                      contentEditable
                      suppressContentEditableWarning
                      className="w-full min-h-[16rem] bg-white/70 border border-[#d2b48c]/50 rounded-xl p-4 text-base focus:outline-none focus:ring-2 focus:ring-[#8b4513]/50 focus:border-[#8b4513] text-[#3d2b1f] shadow-inner leading-relaxed"
                    >
                      Орден Пылающей Розы (Бывший член)<br/><br/>
                      Капитан Маркус из городской стражи (Должен мне услугу)<br/><br/>
                      Группа приключенцев 'Стальные Вороны'
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
