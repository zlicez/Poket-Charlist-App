import { useState } from "react";
import { 
  Shield, Swords, Heart, Activity, Backpack, Coins, 
  Book, ScrollText, Plus, Minus, Dices, Circle, CheckCircle2,
  Bookmark, Zap, Wind, Quote, Sword, Feather, Crown, Flame, User, Target, Sparkles
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

export function TabbedRefinedB() {
  const [hp, setHp] = useState(45);
  const [tempHp, setTempHp] = useState(0);
  const maxHp = 52;

  return (
    <div 
      className="min-h-screen bg-[#f4ebd8] text-[#3d2b1f] font-sans pb-12 relative"
      style={{
        backgroundImage: 'url("/__mockup/images/parchment-bg.png")',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="container mx-auto px-4 max-w-5xl pt-6">
        {/* Header - Always Visible */}
        <div className="relative flex flex-col md:flex-row gap-6 items-center md:items-start mb-10 bg-[#fffdf7]/80 p-6 rounded-sm shadow-md border-2 border-[#8b4513]/20 backdrop-blur-sm">
          {/* Decorative corners */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#8b4513] m-2"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#8b4513] m-2"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#8b4513] m-2"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#8b4513] m-2"></div>

          <div className="w-28 h-28 rounded-full overflow-hidden border-[6px] border-[#5c3a21] shadow-xl flex-shrink-0 relative">
            <div className="absolute inset-0 border-2 border-amber-500/50 rounded-full z-10"></div>
            <img 
              src="/__mockup/images/fighter-portrait.png" 
              alt="Character Portrait" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-grow flex flex-col md:flex-row justify-between w-full gap-4">
            <div>
              <h1 className="font-serif text-5xl font-bold text-[#3a2010] mb-2 drop-shadow-sm tracking-tight flex items-center gap-3">
                Торвальд Гроза Орков
              </h1>
              <div className="flex flex-wrap gap-2 text-sm font-medium">
                <Badge variant="outline" className="border-[#8b4513] text-[#8b4513] bg-[#f4ebd8] font-serif rounded-none px-3">Воин 5</Badge>
                <Badge variant="outline" className="border-[#8b4513] text-[#8b4513] bg-[#f4ebd8] font-serif rounded-none px-3">Человек</Badge>
                <Badge variant="outline" className="border-[#8b4513] text-[#8b4513] bg-[#f4ebd8] font-serif rounded-none px-3">Солдат</Badge>
                <Badge variant="outline" className="border-[#8b4513] text-[#8b4513] bg-[#f4ebd8] font-serif rounded-none px-3">Нейтрально-добрый</Badge>
              </div>
            </div>
            
            <div className="flex flex-row md:flex-col gap-3 md:items-end">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-700 to-amber-900 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                <div className="bg-[#4a2e1b] text-[#f4ebd8] px-5 py-2 rounded-sm text-center shadow-lg flex items-center gap-3 relative border border-[#2d1b0f]">
                  <span className="text-xs uppercase tracking-widest text-amber-200 font-bold">БМ</span>
                  <span className="text-2xl font-bold font-mono text-white">+3</span>
                </div>
              </div>
              <div className="bg-white/80 px-4 py-2 rounded-sm text-center border-b-2 border-[#d2b48c] shadow flex items-center gap-3">
                <span className="text-xs uppercase tracking-wider text-[#8b4513] font-bold">Опыт</span>
                <span className="text-lg font-bold font-mono text-[#5c3a21]">6 500</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation - Ribbon Bookmarks */}
        <Tabs defaultValue="abilities" className="w-full">
          <TabsList className="w-full flex h-auto p-0 bg-transparent border-b-2 border-[#8b4513]/40 mb-8 overflow-x-auto flex-nowrap gap-1">
            {[
              { id: 'abilities', label: 'Характеристики', icon: User },
              { id: 'combat', label: 'Бой', icon: Sword },
              { id: 'equipment', label: 'Снаряжение', icon: Backpack },
              { id: 'features', label: 'Способности', icon: Crown },
              { id: 'notes', label: 'Заметки', icon: Feather }
            ].map(tab => (
              <TabsTrigger 
                key={tab.id}
                value={tab.id} 
                className={`
                  flex-1 py-3 px-4 text-sm md:text-base font-serif rounded-t-lg transition-all
                  border-t-2 border-l-2 border-r-2 border-transparent
                  data-[state=active]:bg-[#f4ebd8] data-[state=active]:border-[#8b4513]/40 data-[state=active]:border-b-[#f4ebd8]
                  data-[state=active]:text-[#5c3a21] data-[state=active]:shadow-[0_-4px_6px_-2px_rgba(0,0,0,0.05)]
                  data-[state=active]:translate-y-[2px] data-[state=active]:z-10
                  text-[#8b4513]/70 hover:text-[#5c3a21] hover:bg-white/30
                  flex items-center justify-center gap-2 relative
                `}
              >
                <tab.icon className="w-4 h-4 opacity-70" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ABILITIES TAB */}
          <TabsContent value="abilities" className="space-y-8 focus-visible:outline-none focus-visible:ring-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {ABILITIES.map(ability => (
                <Card key={ability.id} className="bg-gradient-to-br from-[#fffdf7] to-[#f4ebd8] border border-[#d2b48c] shadow-md relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#8b4513]/20"></div>
                  
                  <CardHeader className="pb-0 pt-6 flex flex-col items-center justify-center relative z-10 text-center">
                    <CardTitle className="font-serif text-2xl text-[#3a2010] uppercase tracking-widest mb-4">
                      {ability.name}
                    </CardTitle>
                    
                    {/* Ornamental Frame for Score */}
                    <div className="relative w-24 h-24 flex items-center justify-center mb-2">
                      <div className="absolute inset-0 bg-[#f4ebd8] border-4 border-double border-[#8b4513] rotate-45 transform shadow-inner"></div>
                      <div className="absolute inset-2 bg-white border border-[#d2b48c] rotate-45 transform"></div>
                      <span className="text-4xl font-bold text-[#5c3a21] font-serif z-10">{ability.score}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-2">
                    <div className="flex justify-center mb-6 relative z-10">
                      <div className="bg-[#3a2010] text-amber-100 px-6 py-1 rounded-sm border-b-2 border-amber-900 text-xl font-bold font-mono shadow-md relative">
                        {ability.mod}
                        {/* Little ribbon tails */}
                        <div className="absolute top-0 -left-2 w-0 h-0 border-t-[16px] border-t-transparent border-r-[8px] border-r-[#2a160a] border-b-[16px] border-b-transparent"></div>
                        <div className="absolute top-0 -right-2 w-0 h-0 border-t-[16px] border-t-transparent border-l-[8px] border-l-[#2a160a] border-b-[16px] border-b-transparent"></div>
                      </div>
                    </div>
                    
                    {ability.skills.length > 0 && (
                      <div className="mt-4 pt-4 border-t-2 border-dashed border-[#d2b48c] space-y-3">
                        {ability.skills.map((skill, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm group">
                            <div className="flex items-center gap-3">
                              {skill.prof ? (
                                <div className="w-4 h-4 rounded-full bg-[#8b4513] border-2 border-[#5c3a21] shadow-inner flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 bg-amber-200 rounded-full"></div>
                                </div>
                              ) : (
                                <div className="w-4 h-4 rounded-full border-2 border-[#d2b48c] bg-white shadow-inner"></div>
                              )}
                              <span className={`font-serif text-base ${skill.prof ? "font-bold text-[#3a2010]" : "text-[#5c3a21]/80"}`}>
                                {skill.name}
                              </span>
                            </div>
                            <span className={`font-mono border-b border-[#d2b48c]/30 ${skill.prof ? "font-bold text-[#8b4513]" : "text-[#5c3a21]/60"}`}>
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

            <Card className="bg-[#fffdf7] border-[#d2b48c] shadow-md border-x-4 border-x-[#8b4513]/40">
              <CardHeader className="pb-4 text-center border-b border-[#d2b48c]/30 mx-6">
                <CardTitle className="font-serif text-2xl text-[#3a2010] flex justify-center items-center gap-3">
                  <Flame className="w-5 h-5 text-amber-600" />
                  Спасброски
                  <Flame className="w-5 h-5 text-amber-600" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                  {SAVING_THROWS.map((save, idx) => (
                    <div key={idx} className="flex flex-col items-center bg-gradient-to-b from-white to-[#f4ebd8] p-4 rounded-sm border border-[#d2b48c]/50 shadow-sm relative group hover:shadow-md transition-shadow">
                      {save.prof && <div className="absolute -top-2 -right-2"><Bookmark className="w-6 h-6 text-amber-600 fill-amber-500" /></div>}
                      <span className="text-xs uppercase tracking-widest font-bold text-[#5c3a21] mb-2">{save.name}</span>
                      <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center bg-white ${save.prof ? 'border-[#8b4513] shadow-[0_0_10px_rgba(139,69,19,0.2)]' : 'border-[#d2b48c]'}`}>
                        <span className={`font-mono text-2xl ${save.prof ? "font-bold text-[#8b4513]" : "text-[#5c3a21]/60"}`}>
                          {save.val}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* COMBAT TAB */}
          <TabsContent value="combat" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Top Row Combat Stats - Iconographic blocks */}
              <div className="md:col-span-8 grid grid-cols-3 gap-4">
                {/* AC */}
                <div className="bg-gradient-to-b from-[#e3d5b8] to-[#d2b48c] p-1 rounded-t-full rounded-b-xl shadow-lg border border-[#8b4513]/30 h-full flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-1 bg-[url('/__mockup/images/dark-parchment.jpg')] bg-cover opacity-10 mix-blend-overlay"></div>
                  <div className="absolute top-2 w-full flex justify-center"><Shield className="w-6 h-6 text-[#5c3a21]/50" /></div>
                  <div className="relative z-10 flex flex-col items-center mt-6">
                    <span className="font-mono text-5xl font-bold text-[#3a2010] drop-shadow-md">18</span>
                    <span className="font-serif font-bold text-[#5c3a21] uppercase tracking-widest mt-1 text-sm bg-white/40 px-3 py-1 rounded-full border border-white/50 backdrop-blur-sm">Класс Доспеха</span>
                  </div>
                </div>
                
                {/* Initiative */}
                <div className="bg-[#fffdf7] p-4 rounded-sm shadow-md border-2 border-dashed border-[#cdaa7d] h-full flex flex-col items-center justify-center relative">
                  <Zap className="absolute top-4 right-4 w-6 h-6 text-amber-500/30 fill-amber-500/10" />
                  <div className="text-center">
                    <div className="font-mono text-4xl font-bold text-[#5c3a21] mb-2">+2</div>
                    <div className="font-serif font-bold text-[#8b4513] uppercase text-xs tracking-wider border-t border-[#d2b48c] pt-2 w-full">Инициатива</div>
                  </div>
                </div>

                {/* Speed */}
                <div className="bg-[#fffdf7] p-4 rounded-sm shadow-md border-2 border-dashed border-[#cdaa7d] h-full flex flex-col items-center justify-center relative">
                  <Wind className="absolute top-4 left-4 w-6 h-6 text-sky-700/30" />
                  <div className="text-center">
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className="font-mono text-4xl font-bold text-[#5c3a21]">30</span>
                      <span className="font-serif text-[#8b4513] font-bold text-lg">фт</span>
                    </div>
                    <div className="font-serif font-bold text-[#8b4513] uppercase text-xs tracking-wider border-t border-[#d2b48c] pt-2 w-full">Скорость</div>
                  </div>
                </div>
              </div>

              {/* HP Tracker */}
              <Card className="md:col-span-4 bg-gradient-to-br from-[#2a1b14] to-[#1a100c] text-[#f4ebd8] border-2 border-[#5c3a21] shadow-xl relative overflow-hidden">
                {/* Heartbeat pulse effect */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-red-900/20 rounded-full blur-3xl animate-pulse"></div>
                <CardHeader className="pb-0 relative z-10">
                  <CardTitle className="font-serif text-xl flex items-center justify-between text-amber-100/80 uppercase tracking-widest text-sm">
                    <span>Хиты</span>
                    <Heart className="w-5 h-5 fill-red-600 text-red-600 drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2 relative z-10">
                  <div className="flex items-end justify-center gap-2 mb-2">
                    <span className="font-mono text-6xl font-bold text-white drop-shadow-md">{hp}</span>
                    <span className="font-mono text-2xl text-amber-100/50 mb-2">/ {maxHp}</span>
                  </div>
                  
                  {tempHp > 0 && (
                    <div className="text-center mb-2">
                      <span className="bg-amber-900/40 text-amber-200 text-xs px-2 py-1 rounded font-mono border border-amber-700/50">
                        Врем. хиты: +{tempHp}
                      </span>
                    </div>
                  )}

                  <div className="h-4 bg-black/60 rounded-full mb-6 border border-white/10 overflow-hidden shadow-inner p-0.5">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-red-800 to-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-all duration-500 ease-out" 
                      style={{ width: `${(hp/maxHp)*100}%` }}
                    />
                  </div>
                  
                  <div className="flex gap-2 justify-center">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full bg-white/5 hover:bg-white/10 border-white/20 text-white shadow-sm"
                      onClick={() => setHp(Math.max(0, hp - 1))}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <div className="flex gap-2 w-full max-w-[140px]">
                      <Button variant="secondary" className="flex-1 bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-900/50 font-mono font-bold" onClick={() => setHp(Math.max(0, hp - 5))}>-5</Button>
                      <Button variant="secondary" className="flex-1 bg-green-950/60 hover:bg-green-900 text-green-200 border border-green-900/50 font-mono font-bold" onClick={() => setHp(Math.min(maxHp, hp + 5))}>+5</Button>
                    </div>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full bg-white/5 hover:bg-white/10 border-white/20 text-white shadow-sm"
                      onClick={() => setHp(Math.min(maxHp, hp + 1))}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Weapons Table */}
              <Card className="md:col-span-8 bg-[#fffdf7] border-[#d2b48c] shadow-md border-x-4 border-x-[#5c3a21]/80">
                <CardHeader className="bg-[#f4ebd8]/50 border-b border-[#d2b48c]/40 pb-3">
                  <CardTitle className="font-serif text-xl text-[#3a2010] flex items-center gap-2 uppercase tracking-wide">
                    <Target className="w-5 h-5 text-red-800" /> Атаки и Заклинания
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-0">
                    <div className="grid grid-cols-12 gap-2 text-xs font-bold uppercase tracking-widest text-[#8b4513] py-3 px-4 bg-[#e6d5b8]/30">
                      <div className="col-span-5">Название</div>
                      <div className="col-span-3 text-center">Бонус</div>
                      <div className="col-span-4 text-center">Урон / Тип</div>
                    </div>
                    
                    {[
                      { name: "Длинный меч", bonus: "+7", dmg: "1к8+4 руб", type: "melee" },
                      { name: "Тяжелый арбалет", bonus: "+5", dmg: "1к10+2 кол", type: "ranged" },
                      { name: "Ручной топор", bonus: "+7", dmg: "1к6+4 руб", type: "melee" },
                    ].map((w, i) => (
                      <div key={i} className="grid grid-cols-12 gap-2 items-center p-3 px-4 border-b border-[#d2b48c]/20 hover:bg-[#f4ebd8]/50 transition-colors group cursor-pointer">
                        <div className="col-span-5 font-serif font-bold text-lg text-[#3a2010] group-hover:text-[#8b4513] flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#8b4513] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          {w.name}
                        </div>
                        <div className="col-span-3 text-center font-mono font-bold text-xl text-[#5c3a21] bg-white rounded border border-[#d2b48c]/30 shadow-sm py-1 mx-2">{w.bonus}</div>
                        <div className="col-span-4 text-center font-mono text-sm text-[#5c3a21] flex items-center justify-center gap-2 bg-[#f4ebd8] rounded py-1.5 border border-transparent group-hover:border-[#d2b48c]/50">
                          {w.dmg} 
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-amber-200/50"><Dices className="w-3 h-3 text-[#8b4513]" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Hit Dice & Death Saves */}
              <div className="md:col-span-4 space-y-6 flex flex-col">
                <Card className="bg-[#fffdf7] border-[#d2b48c] shadow-md flex-1">
                  <CardHeader className="pb-2 bg-[#f4ebd8]/30 border-b border-[#d2b48c]/30">
                    <CardTitle className="font-serif text-lg text-[#3a2010] text-center uppercase tracking-wide">Кости Хитов</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center py-6 h-full">
                    <div className="relative">
                      <div className="absolute inset-0 bg-amber-100 rotate-12 rounded border border-amber-200"></div>
                      <div className="absolute inset-0 bg-white -rotate-6 rounded border border-amber-200"></div>
                      <div className="bg-[#fffdf7] border-2 border-[#d2b48c] p-4 rounded-lg relative z-10 shadow-sm">
                        <div className="text-4xl font-mono font-bold text-[#5c3a21]">5к10</div>
                      </div>
                    </div>
                    <div className="text-sm text-[#8b4513] mt-4 font-bold uppercase tracking-wider bg-[#f4ebd8] px-4 py-1 rounded-full">Всего: 5</div>
                  </CardContent>
                </Card>

                <Card className="bg-[#fffdf7] border-[#d2b48c] shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-red-100 rounded-bl-full opacity-50"></div>
                  <CardHeader className="pb-2">
                    <CardTitle className="font-serif text-lg text-[#3a2010] text-center flex items-center justify-center gap-2 uppercase tracking-wide">
                      <Activity className="w-4 h-4 text-red-700" /> Спасброски от смерти
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between bg-green-50/50 p-2 rounded border border-green-100">
                        <span className="text-xs font-bold uppercase tracking-widest text-green-800">Успехи</span>
                        <div className="flex gap-2">
                          <div className="w-5 h-5 rounded-full border-2 border-green-700/30 bg-green-700/10"></div>
                          <div className="w-5 h-5 rounded-full border-2 border-green-700/30 bg-green-700/10"></div>
                          <div className="w-5 h-5 rounded-full border-2 border-green-700/30 bg-white"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-red-50/50 p-2 rounded border border-red-100">
                        <span className="text-xs font-bold uppercase tracking-widest text-red-800">Провалы</span>
                        <div className="flex gap-2">
                          <div className="w-5 h-5 rounded-full border-2 border-red-700/30 bg-white"></div>
                          <div className="w-5 h-5 rounded-full border-2 border-red-700/30 bg-white"></div>
                          <div className="w-5 h-5 rounded-full border-2 border-red-700/30 bg-white"></div>
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
              
              {/* Money - Horizontal Coin Purse */}
              <Card className="lg:col-span-3 bg-[#3a2010] text-[#f4ebd8] border-none shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/__mockup/images/dark-parchment.jpg')] bg-cover opacity-20 mix-blend-overlay"></div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#5c3a21] border-2 border-[#8b4513] flex items-center justify-center shadow-inner">
                        <Coins className="w-6 h-6 text-amber-400" />
                      </div>
                      <h3 className="font-serif text-2xl uppercase tracking-widest text-amber-100">Кошель</h3>
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-4 flex-grow">
                      {[
                        { label: "ММ", val: 12, bg: "bg-gradient-to-br from-orange-300 via-orange-500 to-orange-700", text: "text-orange-950", border: "border-orange-200" },
                        { label: "СМ", val: 45, bg: "bg-gradient-to-br from-slate-100 via-slate-300 to-slate-500", text: "text-slate-800", border: "border-white" },
                        { label: "ЭМ", val: 0, bg: "bg-gradient-to-br from-indigo-200 via-blue-300 to-indigo-500", text: "text-indigo-950", border: "border-indigo-100" },
                        { label: "ЗМ", val: 125, bg: "bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600", text: "text-yellow-900", border: "border-yellow-100" },
                        { label: "ПМ", val: 2, bg: "bg-gradient-to-br from-zinc-100 via-zinc-200 to-zinc-400", text: "text-zinc-800", border: "border-white" },
                      ].map((c, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                          <div className={`w-14 h-14 rounded-full ${c.bg} ${c.text} border-2 ${c.border} shadow-[0_4px_10px_rgba(0,0,0,0.3)] flex items-center justify-center font-bold text-lg font-serif transform hover:scale-110 transition-transform`}>
                            {c.label}
                          </div>
                          <span className="font-mono text-xl font-bold bg-black/40 px-3 py-1 rounded-sm border border-white/10">{c.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Inventory List with Grouping */}
              <Card className="lg:col-span-2 bg-[#fffdf7] border-[#d2b48c] shadow-md flex flex-col h-[600px]">
                <CardHeader className="pb-3 border-b-2 border-double border-[#d2b48c] bg-[#f4ebd8]/30">
                  <div className="flex justify-between items-center">
                    <CardTitle className="font-serif text-2xl text-[#3a2010] flex items-center gap-2 uppercase tracking-wide">
                      <Backpack className="w-6 h-6" /> Инвентарь
                    </CardTitle>
                    <div className="text-sm font-bold text-[#8b4513] font-mono bg-white px-3 py-1 rounded border border-[#d2b48c]/50 shadow-sm">
                      Вес: 65 / 270 фт
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex-grow overflow-y-auto custom-scrollbar">
                  <div className="p-4 space-y-6">
                    
                    {/* Category: Оружие и Броня */}
                    <div>
                      <h4 className="font-serif font-bold text-[#8b4513] uppercase tracking-wider mb-3 flex items-center gap-2">
                        <div className="h-px bg-[#d2b48c] flex-grow"></div>
                        Оружие и Броня
                        <div className="h-px bg-[#d2b48c] flex-grow"></div>
                      </h4>
                      <div className="space-y-2">
                        {[
                          { name: "Кольчуга", weight: "55 фт", qty: 1, rarity: "border-l-slate-400" },
                          { name: "Длинный меч", weight: "3 фт", qty: 1, rarity: "border-l-slate-400" },
                        ].map((item, i) => (
                          <div key={i} className={`flex justify-between items-center p-3 bg-white rounded-sm border border-[#d2b48c]/40 border-l-4 ${item.rarity} shadow-sm`}>
                            <div className="flex items-center gap-3">
                              <span className="text-[#8b4513] font-bold text-sm">x{item.qty}</span>
                              <span className="font-serif font-bold text-[#3d2b1f] text-lg">{item.name}</span>
                            </div>
                            <span className="text-sm text-[#8b4513] font-mono bg-[#f4ebd8] px-2 py-0.5 rounded">{item.weight}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Category: Снаряжение */}
                    <div>
                      <h4 className="font-serif font-bold text-[#8b4513] uppercase tracking-wider mb-3 flex items-center gap-2">
                        <div className="h-px bg-[#d2b48c] flex-grow"></div>
                        Снаряжение
                        <div className="h-px bg-[#d2b48c] flex-grow"></div>
                      </h4>
                      <div className="space-y-2">
                        {[
                          { name: "Набор путешественника", weight: "59 фт", qty: 1, rarity: "border-l-amber-600" },
                          { name: "Веревка пеньковая (50 фт)", weight: "10 фт", qty: 1, rarity: "border-l-slate-400" },
                          { name: "Факел", weight: "1 фт", qty: 5, rarity: "border-l-slate-400" },
                          { name: "Рационы", weight: "2 фт", qty: 10, rarity: "border-l-slate-400" },
                          { name: "Бурдюк", weight: "5 фт", qty: 1, rarity: "border-l-slate-400" },
                        ].map((item, i) => (
                          <div key={i} className={`flex justify-between items-center p-3 bg-white rounded-sm border border-[#d2b48c]/40 border-l-4 ${item.rarity} shadow-sm`}>
                            <div className="flex items-center gap-3">
                              <span className="text-[#8b4513] font-bold text-sm">x{item.qty}</span>
                              <span className="font-serif font-bold text-[#3d2b1f] text-lg">{item.name}</span>
                            </div>
                            <span className="text-sm text-[#8b4513] font-mono bg-[#f4ebd8] px-2 py-0.5 rounded">{item.weight}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Category: Магические предметы */}
                    <div>
                      <h4 className="font-serif font-bold text-indigo-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <div className="h-px bg-indigo-200 flex-grow"></div>
                        Магические предметы
                        <div className="h-px bg-indigo-200 flex-grow"></div>
                      </h4>
                      <div className="space-y-2">
                        {[
                          { name: "Зелье лечения", weight: "0.5 фт", qty: 2, rarity: "border-l-green-500", bg: "bg-green-50/50" },
                          { name: "Свиток непонятный", weight: "0 фт", qty: 1, rarity: "border-l-blue-500", bg: "bg-blue-50/50" },
                        ].map((item, i) => (
                          <div key={i} className={`flex justify-between items-center p-3 ${item.bg} rounded-sm border border-[#d2b48c]/40 border-l-4 ${item.rarity} shadow-sm`}>
                            <div className="flex items-center gap-3">
                              <span className="text-[#8b4513] font-bold text-sm">x{item.qty}</span>
                              <span className="font-serif font-bold text-[#3d2b1f] text-lg">{item.name}</span>
                            </div>
                            <span className="text-sm text-[#8b4513] font-mono bg-white px-2 py-0.5 rounded shadow-sm">{item.weight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                  </div>
                </CardContent>
              </Card>
              
              {/* Proficiencies */}
              <Card className="lg:col-span-1 bg-gradient-to-br from-[#e3d5b8] to-[#d2b48c] shadow-lg border border-[#8b4513]/40 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/__mockup/images/dark-parchment.jpg')] bg-cover opacity-5 mix-blend-overlay"></div>
                <CardHeader className="bg-white/40 border-b border-[#8b4513]/20 pb-4 relative z-10">
                  <CardTitle className="font-serif text-xl text-[#3a2010] uppercase tracking-wide">Владения и Языки</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 relative z-10">
                  <div className="flex flex-col gap-6">
                    <div>
                      <h4 className="font-serif font-bold text-[#5c3a21] mb-2 uppercase tracking-widest text-sm border-b border-[#8b4513]/20 pb-1">Доспехи</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-white/60 text-[#3a2010] hover:bg-white border-[#8b4513]/30 rounded-sm font-serif">Легкие</Badge>
                        <Badge className="bg-white/60 text-[#3a2010] hover:bg-white border-[#8b4513]/30 rounded-sm font-serif">Средние</Badge>
                        <Badge className="bg-white/60 text-[#3a2010] hover:bg-white border-[#8b4513]/30 rounded-sm font-serif">Тяжелые</Badge>
                        <Badge className="bg-white/60 text-[#3a2010] hover:bg-white border-[#8b4513]/30 rounded-sm font-serif">Щиты</Badge>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-[#5c3a21] mb-2 uppercase tracking-widest text-sm border-b border-[#8b4513]/20 pb-1">Оружие</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-white/60 text-[#3a2010] hover:bg-white border-[#8b4513]/30 rounded-sm font-serif">Простое</Badge>
                        <Badge className="bg-white/60 text-[#3a2010] hover:bg-white border-[#8b4513]/30 rounded-sm font-serif">Воинское</Badge>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-[#5c3a21] mb-2 uppercase tracking-widest text-sm border-b border-[#8b4513]/20 pb-1">Инструменты</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-white/60 text-[#3a2010] hover:bg-white border-[#8b4513]/30 rounded-sm font-serif">Карточные игры</Badge>
                        <Badge className="bg-white/60 text-[#3a2010] hover:bg-white border-[#8b4513]/30 rounded-sm font-serif">Транспорт (наземный)</Badge>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-[#5c3a21] mb-2 uppercase tracking-widest text-sm border-b border-[#8b4513]/20 pb-1">Языки</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-amber-100/60 text-amber-900 hover:bg-amber-100 border-amber-900/30 rounded-sm font-serif font-bold">Общий</Badge>
                        <Badge className="bg-amber-100/60 text-amber-900 hover:bg-amber-100 border-amber-900/30 rounded-sm font-serif font-bold">Орочий</Badge>
                        <Badge className="bg-amber-100/60 text-amber-900 hover:bg-amber-100 border-amber-900/30 rounded-sm font-serif font-bold">Дварфийский</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* FEATURES TAB */}
          <TabsContent value="features" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
            <Card className="bg-[#fffdf7] border-[#d2b48c] shadow-lg border-x-4 border-x-[#8b4513]/60 relative">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#8b4513]/30"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#8b4513]/30"></div>
              
              <CardHeader className="border-b-2 border-double border-[#d2b48c] bg-[#f4ebd8]/20 pb-6 pt-8 text-center">
                <CardTitle className="font-serif text-3xl text-[#3a2010] uppercase tracking-widest flex items-center justify-center gap-4">
                  <span className="w-12 h-px bg-[#8b4513]/40"></span>
                  <ScrollText className="w-8 h-8 text-[#8b4513]" /> 
                  Умения и Особенности
                  <span className="w-12 h-px bg-[#8b4513]/40"></span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 px-4 md:px-12">
                <div className="space-y-10 relative">
                  {/* Vertical timeline line */}
                  <div className="absolute left-6 top-0 bottom-0 w-px bg-[#d2b48c]/50 hidden md:block"></div>
                  
                  {[
                    { title: "Боевой стиль: Дуэлянт", source: "Воин 1", desc: "Когда вы держите рукопашное оружие в одной руке, и не используете другого оружия, вы получаете бонус +2 к броскам урона этим оружием." },
                    { title: "Второе дыхание", source: "Воин 1", desc: "Вы обладаете ограниченным источником выносливости. Вы можете в свой ход бонусным действием восстановить хиты в размере 1к10 + ваш уровень воина. Использовав это умение, вы должны завершить короткий или продолжительный отдых, чтобы получить возможность использовать его снова." },
                    { title: "Всплеск действий", source: "Воин 2", desc: "Вы можете совершить одно дополнительное действие помимо обычного (и бонусного) действия. Использовав это умение, вы должны завершить короткий или продолжительный отдых, чтобы получить возможность использовать его снова." },
                    { title: "Архетип: Мастер боевых искусств", source: "Воин 3", desc: "Вы получаете кости превосходства (4к8) и маневры." },
                    { title: "Дополнительная атака", source: "Воин 5", desc: "Вы можете совершить две атаки вместо одной, когда в свой ход совершаете действие Атака." }
                  ].map((feat, i) => (
                    <div key={i} className="relative md:pl-16">
                      {/* Decorative timeline node */}
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-[#8b4513] rotate-45 hidden md:block outline outline-4 outline-[#fffdf7]"></div>
                      
                      <div className="bg-white p-6 rounded-sm border border-[#d2b48c]/40 shadow-sm relative group hover:shadow-md transition-shadow">
                        {/* Decorative divider before content */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 bg-[#fffdf7]">
                          <Sparkles className="w-4 h-4 text-amber-500/40" />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                          <h3 className="font-serif font-bold text-2xl text-[#3a2010]">
                            {/* Drop Cap for first letter */}
                            <span className="text-3xl text-[#8b4513] mr-0.5">{feat.title.charAt(0)}</span>
                            {feat.title.slice(1)}
                          </h3>
                          
                          {/* Banner style source badge */}
                          <div className="relative inline-block self-start sm:self-auto">
                            <div className="bg-[#8b4513] text-[#f4ebd8] font-serif font-bold px-4 py-1 text-sm shadow-md">
                              {feat.source}
                            </div>
                            <div className="absolute top-0 -right-2 w-0 h-0 border-t-[14px] border-t-transparent border-l-[8px] border-l-[#8b4513] border-b-[14px] border-b-transparent"></div>
                          </div>
                        </div>
                        <p className="text-[#3d2b1f] leading-relaxed text-lg opacity-90">{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NOTES TAB */}
          <TabsContent value="notes" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Backstory Quote Cards */}
              <div className="space-y-6">
                <Card className="bg-[#fffdf7] border-[#d2b48c] shadow-md border-t-4 border-t-[#8b4513]/60 relative">
                  <CardHeader className="bg-[#f4ebd8]/30 border-b border-[#d2b48c]/30">
                    <CardTitle className="font-serif text-2xl text-[#3a2010] flex items-center gap-3 uppercase tracking-wide">
                      <Book className="w-5 h-5 text-[#8b4513]" /> Предыстория
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    
                    {[
                      { title: "Черта характера", text: "Я всегда вежлив и уважителен. Я не доверяю тем, кто не проявляет уважения к старшим.", color: "border-l-blue-800" },
                      { title: "Идеал", text: "Независимость. Я волен сам выбирать свой путь (Хаотичный).", color: "border-l-amber-600" },
                      { title: "Привязанность", text: "Те, кто сражался со мной бок о бок, для меня важнее всего на свете.", color: "border-l-green-700" },
                      { title: "Слабость", text: "Я совершил ужасную ошибку в бою, которая стоила многих жизней, и я сделаю всё, чтобы сохранить это в тайне.", color: "border-l-red-800" }
                    ].map((item, i) => (
                      <div key={i} className="relative">
                        <Quote className="absolute top-0 right-2 w-8 h-8 text-[#d2b48c]/30 rotate-180" />
                        <h4 className="font-serif font-bold text-[#8b4513] mb-2 uppercase tracking-wider text-sm">{item.title}</h4>
                        <div className={`bg-gradient-to-r from-[#f4ebd8]/80 to-transparent p-4 rounded-r border-l-4 ${item.color} italic text-[#3d2b1f] font-serif text-lg leading-relaxed shadow-sm`}>
                          "{item.text}"
                        </div>
                      </div>
                    ))}

                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6 flex flex-col">
                {/* Appearance Block */}
                <Card className="bg-[#fffdf7] border-[#d2b48c] shadow-md">
                  <CardHeader className="bg-[#f4ebd8]/30 border-b border-[#d2b48c]/30 pb-3">
                    <CardTitle className="font-serif text-xl text-[#3a2010] uppercase tracking-wide">Внешность</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Возраст", val: "28" },
                        { label: "Рост", val: "185 см" },
                        { label: "Вес", val: "90 кг" },
                        { label: "Глаза", val: "Карие" },
                        { label: "Кожа", val: "Смуглая" },
                        { label: "Волосы", val: "Темные" }
                      ].map((attr, i) => (
                        <div key={i} className="bg-white p-3 rounded-sm border border-[#d2b48c]/40 text-center shadow-sm hover:border-[#8b4513]/40 transition-colors">
                          <div className="text-[10px] uppercase text-[#8b4513] font-bold tracking-widest mb-1">{attr.label}</div>
                          <div className="font-serif font-bold text-[#3a2010] text-lg">{attr.val}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Allies Parchment */}
                <Card className="bg-gradient-to-b from-[#e3d5b8] to-[#d2b48c] shadow-lg border border-[#8b4513]/40 flex-grow relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('/__mockup/images/dark-parchment.jpg')] bg-cover opacity-10 mix-blend-overlay"></div>
                  
                  {/* Wax Seal Decoration */}
                  <div className="absolute top-4 right-6 w-12 h-12 bg-red-800 rounded-full shadow-md flex items-center justify-center opacity-80 border-2 border-red-900 mix-blend-multiply">
                    <Crown className="w-6 h-6 text-red-950" />
                  </div>

                  <CardHeader className="relative z-10 pb-2 pt-6">
                    <CardTitle className="font-serif text-2xl text-[#3a2010] uppercase tracking-wide">Союзники и Организации</CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10 h-full pb-8">
                    <div className="bg-white/40 p-4 rounded border border-[#8b4513]/20 shadow-inner h-full min-h-[200px]">
                      <ul className="space-y-4 font-serif text-lg text-[#3d2b1f]">
                        <li className="flex gap-3">
                          <span className="text-[#8b4513] font-bold">•</span>
                          <div>
                            <strong>Орден Пылающей Розы</strong>
                            <div className="text-sm italic opacity-80">(Бывший член)</div>
                          </div>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-[#8b4513] font-bold">•</span>
                          <div>
                            <strong>Капитан Маркус из городской стражи</strong>
                            <div className="text-sm italic opacity-80">(Должен мне услугу)</div>
                          </div>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-[#8b4513] font-bold">•</span>
                          <div>
                            <strong>Группа приключенцев 'Стальные Вороны'</strong>
                          </div>
                        </li>
                      </ul>
                      
                      <div className="mt-8 pt-4 border-t border-[#8b4513]/20">
                        <textarea 
                          className="w-full bg-transparent border-none focus:outline-none focus:ring-0 resize-none font-serif italic text-[#3d2b1f] placeholder:text-[#8b4513]/40"
                          placeholder="Добавить новые записи пером..."
                          rows={3}
                        ></textarea>
                      </div>
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
