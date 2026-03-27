import { useState } from "react";
import { 
  Shield, Swords, Heart, Activity, Backpack, Coins, 
  Book, ScrollText, Plus, Minus, Dices, ChevronDown, 
  ChevronRight, Circle, CheckCircle2 
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

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

export function TabbedSections() {
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
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start mb-8 bg-white/40 p-6 rounded-xl shadow-sm border border-[#d2b48c]/50 backdrop-blur-sm">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#8b4513] shadow-md flex-shrink-0">
            <img 
              src="/__mockup/images/fighter-portrait.png" 
              alt="Character Portrait" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-grow flex flex-col md:flex-row justify-between w-full gap-4">
            <div>
              <h1 className="font-serif text-4xl font-bold text-[#5c3a21] mb-1">Торвальд Гроза Орков</h1>
              <div className="flex flex-wrap gap-2 text-sm font-medium">
                <Badge variant="outline" className="border-[#8b4513] text-[#8b4513] bg-[#f4ebd8]">Воин 5</Badge>
                <Badge variant="outline" className="border-[#8b4513] text-[#8b4513] bg-[#f4ebd8]">Человек</Badge>
                <Badge variant="outline" className="border-[#8b4513] text-[#8b4513] bg-[#f4ebd8]">Солдат</Badge>
                <Badge variant="outline" className="border-[#8b4513] text-[#8b4513] bg-[#f4ebd8]">Нейтрально-добрый</Badge>
              </div>
            </div>
            <div className="flex flex-row md:flex-col gap-4 md:items-end">
              <div className="bg-[#5c3a21] text-[#f4ebd8] px-4 py-2 rounded-lg text-center shadow-inner flex items-center gap-3">
                <span className="text-xs uppercase tracking-wider opacity-80">БМ</span>
                <span className="text-xl font-bold font-mono">+3</span>
              </div>
              <div className="bg-white/60 px-4 py-2 rounded-lg text-center border border-[#d2b48c] shadow-sm flex items-center gap-3">
                <span className="text-xs uppercase tracking-wider text-[#8b4513]">Опыт</span>
                <span className="text-lg font-bold font-mono text-[#5c3a21]">6 500</span>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Tabs */}
        <Tabs defaultValue="abilities" className="w-full">
          <TabsList className="w-full flex h-auto p-1 bg-[#e6d5b8] rounded-xl shadow-inner border border-[#cdaa7d] mb-6 overflow-x-auto flex-nowrap">
            <TabsTrigger 
              value="abilities" 
              className="flex-1 py-3 text-sm md:text-base font-serif data-[state=active]:bg-[#5c3a21] data-[state=active]:text-[#f4ebd8] rounded-lg transition-all"
            >
              Характеристики
            </TabsTrigger>
            <TabsTrigger 
              value="combat" 
              className="flex-1 py-3 text-sm md:text-base font-serif data-[state=active]:bg-[#5c3a21] data-[state=active]:text-[#f4ebd8] rounded-lg transition-all"
            >
              Бой
            </TabsTrigger>
            <TabsTrigger 
              value="equipment" 
              className="flex-1 py-3 text-sm md:text-base font-serif data-[state=active]:bg-[#5c3a21] data-[state=active]:text-[#f4ebd8] rounded-lg transition-all"
            >
              Снаряжение
            </TabsTrigger>
            <TabsTrigger 
              value="features" 
              className="flex-1 py-3 text-sm md:text-base font-serif data-[state=active]:bg-[#5c3a21] data-[state=active]:text-[#f4ebd8] rounded-lg transition-all"
            >
              Способности
            </TabsTrigger>
            <TabsTrigger 
              value="notes" 
              className="flex-1 py-3 text-sm md:text-base font-serif data-[state=active]:bg-[#5c3a21] data-[state=active]:text-[#f4ebd8] rounded-lg transition-all"
            >
              Заметки
            </TabsTrigger>
          </TabsList>

          {/* ABILITIES TAB */}
          <TabsContent value="abilities" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ABILITIES.map(ability => (
                <Card key={ability.id} className="bg-white/50 border-[#d2b48c] shadow-sm">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="font-serif text-xl text-[#5c3a21]">{ability.name}</CardTitle>
                    <div className="bg-[#f4ebd8] w-12 h-12 rounded-full border-2 border-[#8b4513] flex items-center justify-center shadow-inner">
                      <span className="text-xl font-bold text-[#5c3a21] font-mono">{ability.score}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center mb-4">
                      <div className="bg-[#5c3a21] text-[#f4ebd8] px-6 py-1 rounded-full text-lg font-bold font-mono shadow">
                        {ability.mod}
                      </div>
                    </div>
                    {ability.skills.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-[#d2b48c]/50 space-y-2">
                        {ability.skills.map((skill, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                              {skill.prof ? (
                                <CheckCircle2 className="w-4 h-4 text-[#8b4513]" />
                              ) : (
                                <Circle className="w-4 h-4 text-[#d2b48c]" />
                              )}
                              <span className={skill.prof ? "font-semibold text-[#3d2b1f]" : "text-[#5c3a21]/80"}>
                                {skill.name}
                              </span>
                            </div>
                            <span className={`font-mono ${skill.prof ? "font-bold text-[#8b4513]" : "text-[#5c3a21]/80"}`}>
                              {skill.val}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-white/50 border-[#d2b48c] shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-xl text-[#5c3a21]">Спасброски</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {SAVING_THROWS.map((save, idx) => (
                    <div key={idx} className="flex flex-col items-center bg-[#f4ebd8] p-3 rounded-lg border border-[#d2b48c]/50">
                      <div className="flex items-center gap-1 mb-2">
                        {save.prof ? (
                          <CheckCircle2 className="w-3 h-3 text-[#8b4513]" />
                        ) : (
                          <Circle className="w-3 h-3 text-[#d2b48c]" />
                        )}
                        <span className="text-xs uppercase tracking-wider font-semibold text-[#5c3a21]">{save.name}</span>
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
              <Card className="md:col-span-8 bg-white/50 border-[#d2b48c] shadow-sm">
                <CardContent className="p-6">
                  <div className="flex flex-wrap md:flex-nowrap gap-6 justify-center md:justify-around items-center h-full">
                    {/* AC */}
                    <div className="flex flex-col items-center">
                      <div className="relative flex items-center justify-center w-24 h-28">
                        <Shield className="w-full h-full text-[#5c3a21] absolute" strokeWidth={1} />
                        <span className="font-mono text-3xl font-bold text-[#f4ebd8] z-10 pt-2">18</span>
                      </div>
                      <span className="font-serif font-bold text-[#8b4513] mt-2">КД</span>
                    </div>
                    
                    {/* Initiative */}
                    <div className="flex flex-col items-center">
                      <div className="bg-[#f4ebd8] w-20 h-20 rounded-xl border-2 border-[#d2b48c] flex items-center justify-center transform rotate-45 mb-4 shadow-sm">
                        <span className="font-mono text-2xl font-bold text-[#5c3a21] transform -rotate-45">+2</span>
                      </div>
                      <span className="font-serif font-bold text-[#8b4513]">Инициатива</span>
                    </div>

                    {/* Speed */}
                    <div className="flex flex-col items-center">
                      <div className="bg-[#f4ebd8] w-20 h-20 rounded-full border-2 border-[#d2b48c] flex items-center justify-center mb-2 shadow-sm">
                        <div className="flex items-baseline gap-1">
                          <span className="font-mono text-2xl font-bold text-[#5c3a21]">30</span>
                          <span className="text-xs text-[#8b4513] font-semibold">фт</span>
                        </div>
                      </div>
                      <span className="font-serif font-bold text-[#8b4513]">Скорость</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* HP Tracker */}
              <Card className="md:col-span-4 bg-[#5c3a21] text-[#f4ebd8] border-none shadow-md">
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
              <Card className="md:col-span-8 bg-white/50 border-[#d2b48c] shadow-sm">
                <CardHeader>
                  <CardTitle className="font-serif text-xl text-[#5c3a21] flex items-center gap-2">
                    <Swords className="w-5 h-5" /> Атаки и Заклинания
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-12 gap-2 text-xs font-bold uppercase tracking-wider text-[#8b4513] pb-2 border-b border-[#d2b48c]/50">
                      <div className="col-span-5">Название</div>
                      <div className="col-span-3 text-center">Бонус</div>
                      <div className="col-span-4 text-center">Урон/Тип</div>
                    </div>
                    
                    {[
                      { name: "Длинный меч", bonus: "+7", dmg: "1к8+4 руб", type: "melee" },
                      { name: "Тяжелый арбалет", bonus: "+5", dmg: "1к10+2 кол", type: "ranged" },
                      { name: "Ручной топор", bonus: "+7", dmg: "1к6+4 руб", type: "melee" },
                    ].map((w, i) => (
                      <div key={i} className="grid grid-cols-12 gap-2 items-center bg-[#f4ebd8] p-2 rounded border border-[#d2b48c]/30 hover:border-[#8b4513]/50 transition-colors cursor-pointer group">
                        <div className="col-span-5 font-semibold text-[#3d2b1f] group-hover:text-[#8b4513] transition-colors">{w.name}</div>
                        <div className="col-span-3 text-center font-mono font-bold text-lg">{w.bonus}</div>
                        <div className="col-span-4 text-center font-mono text-sm flex items-center justify-center gap-2">
                          {w.dmg} <Button variant="ghost" size="icon" className="h-6 w-6"><Dices className="w-3 h-3 text-[#5c3a21]" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Hit Dice & Death Saves */}
              <div className="md:col-span-4 space-y-6">
                <Card className="bg-white/50 border-[#d2b48c] shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-serif text-lg text-[#5c3a21] text-center">Кости Хитов</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <div className="text-3xl font-mono font-bold text-[#5c3a21] mb-2">5к10</div>
                    <div className="text-sm text-[#8b4513]">Всего: 5</div>
                  </CardContent>
                </Card>

                <Card className="bg-white/50 border-[#d2b48c] shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-serif text-lg text-[#5c3a21] text-center flex items-center justify-center gap-2">
                      <Activity className="w-4 h-4" /> Спасброски от смерти
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold uppercase text-green-700">Успехи</span>
                        <div className="flex gap-2">
                          <Circle className="w-5 h-5 text-green-700/30" />
                          <Circle className="w-5 h-5 text-green-700/30" />
                          <Circle className="w-5 h-5 text-green-700/30" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold uppercase text-red-700">Провалы</span>
                        <div className="flex gap-2">
                          <Circle className="w-5 h-5 text-red-700/30" />
                          <Circle className="w-5 h-5 text-red-700/30" />
                          <Circle className="w-5 h-5 text-red-700/30" />
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Money */}
              <Card className="lg:col-span-1 bg-[#5c3a21] text-[#f4ebd8] border-none shadow-md">
                <CardHeader>
                  <CardTitle className="font-serif text-xl flex items-center gap-2 text-white">
                    <Coins className="w-5 h-5 text-yellow-500" /> Деньги
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { label: "ММ (ММ)", val: 12, color: "text-amber-700 bg-amber-700/20" },
                      { label: "СМ (СМ)", val: 45, color: "text-slate-300 bg-slate-300/20" },
                      { label: "ЭМ (ЭМ)", val: 0, color: "text-indigo-300 bg-indigo-300/20" },
                      { label: "ЗМ (ЗМ)", val: 125, color: "text-yellow-400 bg-yellow-400/20" },
                      { label: "ПМ (ПМ)", val: 2, color: "text-zinc-100 bg-zinc-100/20" },
                    ].map((c, i) => (
                      <div key={i} className="flex items-center justify-between bg-black/20 p-2 rounded-lg">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-inner border border-white/10 ${c.color}`}>
                          {c.label.split(' ')[0]}
                        </div>
                        <span className="font-mono text-2xl font-bold">{c.val}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Inventory */}
              <Card className="lg:col-span-2 bg-white/50 border-[#d2b48c] shadow-sm flex flex-col h-full">
                <CardHeader className="pb-3 border-b border-[#d2b48c]/50">
                  <div className="flex justify-between items-center">
                    <CardTitle className="font-serif text-xl text-[#5c3a21] flex items-center gap-2">
                      <Backpack className="w-5 h-5" /> Инвентарь
                    </CardTitle>
                    <span className="text-sm font-semibold text-[#8b4513]">Вес: 65 / 270 фт</span>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex-grow">
                  <div className="h-[400px] overflow-y-auto p-4 space-y-2">
                    {[
                      { name: "Кольчуга", weight: "55 фт", qty: 1 },
                      { name: "Набор путешественника", weight: "59 фт", qty: 1 },
                      { name: "Веревка пеньковая (50 фт)", weight: "10 фт", qty: 1 },
                      { name: "Факел", weight: "1 фт", qty: 5 },
                      { name: "Рационы", weight: "2 фт", qty: 10 },
                      { name: "Бурдюк", weight: "5 фт", qty: 1 },
                      { name: "Зелье лечения", weight: "0.5 фт", qty: 2 },
                      { name: "Свиток непонятный", weight: "0 фт", qty: 1 },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-[#f4ebd8] rounded border border-[#d2b48c]/30">
                        <div className="flex items-center gap-3">
                          <span className="bg-[#5c3a21] text-[#f4ebd8] text-xs font-mono px-2 py-1 rounded">x{item.qty}</span>
                          <span className="font-semibold text-[#3d2b1f]">{item.name}</span>
                        </div>
                        <span className="text-sm text-[#8b4513] font-mono">{item.weight}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Proficiencies */}
              <Card className="lg:col-span-3 bg-white/50 border-[#d2b48c] shadow-sm">
                <CardHeader>
                  <CardTitle className="font-serif text-xl text-[#5c3a21]">Владения и Языки</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <h4 className="font-semibold text-[#8b4513] mb-2 uppercase text-sm">Доспехи</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-[#f4ebd8] text-[#5c3a21] border-[#d2b48c]">Легкие</Badge>
                        <Badge variant="secondary" className="bg-[#f4ebd8] text-[#5c3a21] border-[#d2b48c]">Средние</Badge>
                        <Badge variant="secondary" className="bg-[#f4ebd8] text-[#5c3a21] border-[#d2b48c]">Тяжелые</Badge>
                        <Badge variant="secondary" className="bg-[#f4ebd8] text-[#5c3a21] border-[#d2b48c]">Щиты</Badge>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#8b4513] mb-2 uppercase text-sm">Оружие</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-[#f4ebd8] text-[#5c3a21] border-[#d2b48c]">Простое</Badge>
                        <Badge variant="secondary" className="bg-[#f4ebd8] text-[#5c3a21] border-[#d2b48c]">Воинское</Badge>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#8b4513] mb-2 uppercase text-sm">Инструменты</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-[#f4ebd8] text-[#5c3a21] border-[#d2b48c]">Карточные игры</Badge>
                        <Badge variant="secondary" className="bg-[#f4ebd8] text-[#5c3a21] border-[#d2b48c]">Транспорт (наземный)</Badge>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#8b4513] mb-2 uppercase text-sm">Языки</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-[#f4ebd8] text-[#5c3a21] border-[#d2b48c]">Общий</Badge>
                        <Badge variant="secondary" className="bg-[#f4ebd8] text-[#5c3a21] border-[#d2b48c]">Орочий</Badge>
                        <Badge variant="secondary" className="bg-[#f4ebd8] text-[#5c3a21] border-[#d2b48c]">Дварфийский</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* FEATURES TAB */}
          <TabsContent value="features" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
            <Card className="bg-white/50 border-[#d2b48c] shadow-sm">
              <CardHeader>
                <CardTitle className="font-serif text-2xl text-[#5c3a21] flex items-center gap-2">
                  <ScrollText className="w-6 h-6" /> Умения и Особенности
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { title: "Боевой стиль: Дуэлянт", source: "Воин 1", desc: "Когда вы держите рукопашное оружие в одной руке, и не используете другого оружия, вы получаете бонус +2 к броскам урона этим оружием." },
                    { title: "Второе дыхание", source: "Воин 1", desc: "Вы обладаете ограниченным источником выносливости. Вы можете в свой ход бонусным действием восстановить хиты в размере 1к10 + ваш уровень воина. Использовав это умение, вы должны завершить короткий или продолжительный отдых, чтобы получить возможность использовать его снова." },
                    { title: "Всплеск действий", source: "Воин 2", desc: "Вы можете совершить одно дополнительное действие помимо обычного (и бонусного) действия. Использовав это умение, вы должны завершить короткий или продолжительный отдых, чтобы получить возможность использовать его снова." },
                    { title: "Архетип: Мастер боевых искусств", source: "Воин 3", desc: "Вы получаете кости превосходства (4к8) и маневры." },
                    { title: "Дополнительная атака", source: "Воин 5", desc: "Вы можете совершить две атаки вместо одной, когда в свой ход совершаете действие Атака." }
                  ].map((feat, i) => (
                    <div key={i} className="bg-[#f4ebd8] p-4 rounded-lg border border-[#d2b48c]/50">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-serif font-bold text-lg text-[#5c3a21]">{feat.title}</h3>
                        <Badge variant="outline" className="border-[#8b4513] text-[#8b4513]">{feat.source}</Badge>
                      </div>
                      <p className="text-[#3d2b1f] leading-relaxed text-sm md:text-base">{feat.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NOTES TAB */}
          <TabsContent value="notes" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/50 border-[#d2b48c] shadow-sm">
                <CardHeader>
                  <CardTitle className="font-serif text-xl text-[#5c3a21] flex items-center gap-2">
                    <Book className="w-5 h-5" /> Предыстория
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-[#8b4513] mb-1">Черта характера</h4>
                    <p className="bg-[#f4ebd8] p-3 rounded border border-[#d2b48c]/30 text-sm italic">"Я всегда вежлив и уважителен. Я не доверяю тем, кто не проявляет уважения к старшим."</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#8b4513] mb-1">Идеал</h4>
                    <p className="bg-[#f4ebd8] p-3 rounded border border-[#d2b48c]/30 text-sm italic">"Независимость. Я волен сам выбирать свой путь (Хаотичный)."</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#8b4513] mb-1">Привязанность</h4>
                    <p className="bg-[#f4ebd8] p-3 rounded border border-[#d2b48c]/30 text-sm italic">"Те, кто сражался со мной бок о бок, для меня важнее всего на свете."</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#8b4513] mb-1">Слабость</h4>
                    <p className="bg-[#f4ebd8] p-3 rounded border border-[#d2b48c]/30 text-sm italic">"Я совершил ужасную ошибку в бою, которая стоила многих жизней, и я сделаю всё, чтобы сохранить это в тайне."</p>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="bg-white/50 border-[#d2b48c] shadow-sm">
                  <CardHeader>
                    <CardTitle className="font-serif text-xl text-[#5c3a21]">Внешность</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-[#f4ebd8] p-2 rounded border border-[#d2b48c]/30 text-center">
                        <div className="text-xs uppercase text-[#8b4513] font-semibold">Возраст</div>
                        <div className="font-mono">28</div>
                      </div>
                      <div className="bg-[#f4ebd8] p-2 rounded border border-[#d2b48c]/30 text-center">
                        <div className="text-xs uppercase text-[#8b4513] font-semibold">Рост</div>
                        <div className="font-mono">185 см</div>
                      </div>
                      <div className="bg-[#f4ebd8] p-2 rounded border border-[#d2b48c]/30 text-center">
                        <div className="text-xs uppercase text-[#8b4513] font-semibold">Вес</div>
                        <div className="font-mono">90 кг</div>
                      </div>
                      <div className="bg-[#f4ebd8] p-2 rounded border border-[#d2b48c]/30 text-center">
                        <div className="text-xs uppercase text-[#8b4513] font-semibold">Глаза</div>
                        <div className="font-mono text-sm">Карие</div>
                      </div>
                      <div className="bg-[#f4ebd8] p-2 rounded border border-[#d2b48c]/30 text-center">
                        <div className="text-xs uppercase text-[#8b4513] font-semibold">Кожа</div>
                        <div className="font-mono text-sm">Смуглая</div>
                      </div>
                      <div className="bg-[#f4ebd8] p-2 rounded border border-[#d2b48c]/30 text-center">
                        <div className="text-xs uppercase text-[#8b4513] font-semibold">Волосы</div>
                        <div className="font-mono text-sm">Темные</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/50 border-[#d2b48c] shadow-sm flex-grow">
                  <CardHeader>
                    <CardTitle className="font-serif text-xl text-[#5c3a21]">Союзники и Организации</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <textarea 
                      className="w-full h-32 bg-[#f4ebd8] border border-[#d2b48c]/50 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#8b4513] resize-none"
                      placeholder="Заметки о фракциях и союзниках..."
                      defaultValue="Орден Пылающей Розы (Бывший член)
Капитан Маркус из городской стражи (Должен мне услугу)
Группа приключенцев 'Стальные Вороны'"
                    ></textarea>
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
