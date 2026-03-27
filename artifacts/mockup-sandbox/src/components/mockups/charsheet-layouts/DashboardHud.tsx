import React, { useState } from 'react';
import {
  Shield, Heart, Zap, Footprints, Skull, Coins, BookOpen,
  Sword, Backpack, Target, Brain, Flame, FileText, ChevronRight,
  Crosshair, User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

// Mock Data (Russian)
const ABILITIES = [
  { id: 'str', name: 'Сила', short: 'СИЛ', score: 16, mod: '+3', skills: ['Атлетика (+5)'] },
  { id: 'dex', name: 'Ловкость', short: 'ЛОВ', score: 14, mod: '+2', skills: ['Акробатика (+2)', 'Ловкость рук (+2)', 'Скрытность (+4)'] },
  { id: 'con', name: 'Телосложение', short: 'ТЕЛ', score: 15, mod: '+2', skills: [] },
  { id: 'int', name: 'Интеллект', short: 'ИНТ', score: 10, mod: '+0', skills: ['Анализ (+0)', 'История (+2)', 'Магия (+0)', 'Природа (+0)', 'Религия (+0)'] },
  { id: 'wis', name: 'Мудрость', short: 'МУД', score: 12, mod: '+1', skills: ['Внимательность (+3)', 'Выживание (+1)', 'Медицина (+1)', 'Проницательность (+3)', 'Уход за животными (+1)'] },
  { id: 'cha', name: 'Харизма', short: 'ХАР', score: 8, mod: '-1', skills: ['Выступление (-1)', 'Запугивание (-1)', 'Обман (-1)', 'Убеждение (-1)'] },
];

const SAVES = [
  { name: 'Сила', mod: '+5', prof: true },
  { name: 'Ловкость', mod: '+2', prof: false },
  { name: 'Телосложение', mod: '+4', prof: true },
  { name: 'Интеллект', mod: '+0', prof: false },
  { name: 'Мудрость', mod: '+1', prof: false },
  { name: 'Харизма', mod: '-1', prof: false },
];

const WEAPONS = [
  { name: 'Длинный меч', attack: '+5', damage: '1к8+3 руб', reach: '5 фт.' },
  { name: 'Длинный лук', attack: '+4', damage: '1к8+2 кол', reach: '150/600 фт.' },
  { name: 'Кинжал', attack: '+5', damage: '1к4+3 кол', reach: '20/60 фт.' },
];

export function DashboardHud() {
  const [hp, setHp] = useState(38);
  const maxHp = 45;
  const tempHp = 5;

  return (
    <div
      className="min-h-screen bg-stone-950 text-stone-200 font-['Inter'] p-4 md:p-6 lg:p-8 overflow-x-hidden"
      style={{
        backgroundImage: 'linear-gradient(rgba(12, 10, 9, 0.85), rgba(12, 10, 9, 0.85)), url(/__mockup/images/dark-parchment.jpg)',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 h-full">

        {/* --- Header Strip --- */}
        <div className="col-span-full flex flex-col md:flex-row justify-between items-center bg-black/40 border border-amber-900/30 rounded-lg p-4 backdrop-blur-sm shadow-xl">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-stone-800 border-2 border-amber-700/50 flex items-center justify-center overflow-hidden shrink-0">
              <User size={32} className="text-amber-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-['Lora'] text-amber-500 tracking-wide">Торгар Медвежья Кровь</h1>
              <div className="text-sm text-stone-400 font-medium">Воин 5 • Человек • Нейтрально-добрый • Ур. 5</div>
            </div>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0 items-center">
             <div className="text-right">
                <div className="text-xs text-stone-500 uppercase font-bold tracking-wider">Бонус Мастерства</div>
                <div className="text-2xl font-black text-amber-500">+3</div>
             </div>
             <div className="text-right ml-4">
                <div className="text-xs text-stone-500 uppercase font-bold tracking-wider">Пасс. Внимательность</div>
                <div className="text-2xl font-black text-amber-500">13</div>
             </div>
          </div>
        </div>

        {/* --- Left Sidebar: Ability Scores --- */}
        <div className="md:col-span-2 flex flex-col gap-3 h-full">
          <div className="text-xs text-stone-500 uppercase font-bold tracking-wider mb-1 ml-1">Характеристики</div>
          {ABILITIES.map((ability) => (
            <Popover key={ability.id}>
              <PopoverTrigger asChild>
                <button className="group relative w-full bg-black/50 border border-amber-900/40 rounded-lg p-3 hover:bg-black/70 hover:border-amber-700/60 transition-all text-left overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-stone-800 group-hover:bg-amber-600 transition-colors" />
                  <div className="flex justify-between items-center pl-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-amber-600/90">{ability.short}</span>
                      <span className="text-[10px] text-stone-500 uppercase">{ability.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-stone-400 text-lg font-['JetBrains_Mono']">{ability.score}</span>
                      <div className="bg-stone-900 text-amber-500 font-bold px-2 py-1 rounded w-10 text-center text-lg">
                        {ability.mod}
                      </div>
                    </div>
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent side="right" className="w-56 bg-stone-900 border-amber-900/50 p-0 text-stone-200">
                <div className="p-3 border-b border-amber-900/30 bg-black/40">
                  <div className="font-bold text-amber-500">{ability.name} ({ability.mod})</div>
                </div>
                <div className="p-2 flex flex-col gap-1">
                  {ability.skills.length > 0 ? (
                    ability.skills.map(s => (
                       <div key={s} className="px-2 py-1.5 hover:bg-stone-800 rounded text-sm cursor-pointer flex justify-between">
                         <span>{s.split(' ')[0]}</span>
                         <span className="font-['JetBrains_Mono'] text-amber-600">{s.split(' ')[1]}</span>
                       </div>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-stone-500 italic">Нет связанных навыков</div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          ))}
          
          <div className="mt-4 flex flex-col gap-2 bg-black/40 border border-amber-900/30 rounded-lg p-3">
            <div className="text-xs text-stone-500 uppercase font-bold tracking-wider mb-1">Спасброски</div>
            <div className="grid grid-cols-2 gap-2">
               {SAVES.map(save => (
                  <div key={save.name} className="flex items-center gap-2 text-sm bg-stone-950/50 p-1.5 rounded border border-stone-800">
                     <div className={`w-2 h-2 rounded-full ${save.prof ? 'bg-amber-500' : 'bg-stone-700'}`} />
                     <span className="text-stone-400 truncate flex-1" title={save.name}>{save.name.substring(0,3)}</span>
                     <span className="font-['JetBrains_Mono']">{save.mod}</span>
                  </div>
               ))}
            </div>
          </div>
        </div>

        {/* --- Center: Combat & HP HUD --- */}
        <div className="md:col-span-6 flex flex-col gap-6">
          
          {/* Main Combat Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-black/60 border border-amber-900/50 rounded-lg p-4 flex flex-col items-center justify-center relative overflow-hidden group hover:border-amber-700 transition-colors cursor-pointer">
              <Shield className="absolute -right-4 -bottom-4 w-24 h-24 text-stone-800/30 group-hover:text-amber-900/20 transition-colors" />
              <div className="text-stone-400 text-sm uppercase tracking-wider font-bold z-10">КД</div>
              <div className="text-5xl font-black font-['Lora'] text-amber-500 z-10 mt-1">16</div>
              <div className="text-xs text-stone-500 z-10 mt-1">Кольчуга</div>
            </div>
            <div className="bg-black/60 border border-amber-900/50 rounded-lg p-4 flex flex-col items-center justify-center relative overflow-hidden group hover:border-amber-700 transition-colors cursor-pointer">
              <Zap className="absolute -right-4 -bottom-4 w-24 h-24 text-stone-800/30 group-hover:text-amber-900/20 transition-colors" />
              <div className="text-stone-400 text-sm uppercase tracking-wider font-bold z-10">Инициатива</div>
              <div className="text-5xl font-black font-['Lora'] text-amber-500 z-10 mt-1">+2</div>
            </div>
            <div className="bg-black/60 border border-amber-900/50 rounded-lg p-4 flex flex-col items-center justify-center relative overflow-hidden group hover:border-amber-700 transition-colors cursor-pointer">
              <Footprints className="absolute -right-4 -bottom-4 w-24 h-24 text-stone-800/30 group-hover:text-amber-900/20 transition-colors" />
              <div className="text-stone-400 text-sm uppercase tracking-wider font-bold z-10">Скорость</div>
              <div className="flex items-baseline gap-1 z-10 mt-1">
                <div className="text-5xl font-black font-['Lora'] text-amber-500">30</div>
                <div className="text-sm text-stone-500">фт.</div>
              </div>
            </div>
          </div>

          {/* Huge HP Bar HUD */}
          <div className="bg-gradient-to-b from-stone-900 to-black border-2 border-stone-800 rounded-xl p-6 relative shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-900/0 via-red-500/50 to-red-900/0" />
            <div className="flex justify-between items-end mb-4">
              <div className="flex items-center gap-3">
                <Heart className="w-8 h-8 text-red-500 fill-red-500/20" />
                <h2 className="text-2xl font-bold font-['Lora'] uppercase tracking-wider text-stone-200">Здоровье</h2>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black font-['JetBrains_Mono'] text-white">{hp}</span>
                <span className="text-xl text-stone-500 font-['JetBrains_Mono']">/ {maxHp}</span>
              </div>
            </div>

            <div className="relative h-8 bg-stone-950 rounded-full overflow-hidden border border-stone-800 mb-6">
              <div 
                className="absolute top-0 left-0 h-full bg-red-600 transition-all duration-500 ease-out"
                style={{ width: `${(hp / maxHp) * 100}%` }}
              >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
                <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20"></div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1 bg-stone-900 border-red-900/50 hover:bg-red-950/50 hover:text-red-400" onClick={() => setHp(Math.max(0, hp - 1))}>
                - Урон
              </Button>
              <Button variant="outline" className="flex-1 bg-stone-900 border-green-900/50 hover:bg-green-950/50 hover:text-green-400" onClick={() => setHp(Math.min(maxHp, hp + 1))}>
                + Лечение
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-stone-800/50">
               <div>
                  <div className="text-xs text-stone-500 uppercase tracking-wider mb-2 flex justify-between">
                     <span>Временные ХП</span>
                     <span className="text-amber-500 font-bold">{tempHp}</span>
                  </div>
                  <div className="flex gap-2">
                     <Button size="sm" variant="outline" className="w-full bg-black border-stone-800 text-stone-400 h-8">-</Button>
                     <Button size="sm" variant="outline" className="w-full bg-black border-stone-800 text-stone-400 h-8">+</Button>
                  </div>
               </div>
               <div>
                  <div className="text-xs text-stone-500 uppercase tracking-wider mb-2 flex justify-between">
                     <span>Кости Хитов</span>
                     <span className="text-amber-500 font-bold">5 / 5 (1к10)</span>
                  </div>
                  <Button size="sm" variant="outline" className="w-full bg-black border-stone-800 text-stone-400 h-8">Отдохнуть</Button>
               </div>
            </div>
            
            <div className="mt-6 p-4 bg-black/40 rounded-lg border border-stone-800">
               <div className="text-xs text-stone-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Skull size={14} /> Спасброски от смерти
               </div>
               <div className="flex items-center justify-between">
                  <div className="flex gap-2 items-center">
                     <span className="text-sm text-stone-400 w-12">Успехи</span>
                     {[1,2,3].map(i => <div key={`s-${i}`} className="w-4 h-4 rounded-full border border-stone-600 bg-stone-900 hover:bg-green-600/50 cursor-pointer transition-colors" />)}
                  </div>
                  <div className="flex gap-2 items-center">
                     <span className="text-sm text-stone-400 w-12">Провалы</span>
                     {[1,2,3].map(i => <div key={`f-${i}`} className="w-4 h-4 rounded-full border border-stone-600 bg-stone-900 hover:bg-red-600/50 cursor-pointer transition-colors" />)}
                  </div>
               </div>
            </div>
          </div>

        </div>

        {/* --- Right Panel: Accordions (Weapons, Features, Profs) --- */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <ScrollArea className="h-[calc(100vh-12rem)] pr-4 -mr-4">
            
            {/* Weapons Panel */}
            <div className="bg-black/60 border border-amber-900/30 rounded-lg overflow-hidden mb-4 shadow-lg">
               <div className="bg-stone-900/80 p-3 border-b border-amber-900/30 flex items-center gap-2">
                  <Crosshair className="text-amber-600 w-5 h-5" />
                  <h3 className="font-bold text-stone-200 tracking-wider">Атаки и Заклинания</h3>
               </div>
               <div className="p-3 flex flex-col gap-3">
                  {WEAPONS.map((w) => (
                     <div key={w.name} className="bg-stone-950 border border-stone-800 rounded p-3 hover:border-amber-900/50 transition-colors group cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                           <div className="font-bold text-amber-500 group-hover:text-amber-400 transition-colors">{w.name}</div>
                           <Badge variant="outline" className="bg-stone-900 border-stone-700 text-stone-400 rounded-sm font-['JetBrains_Mono']">{w.reach}</Badge>
                        </div>
                        <div className="flex gap-2">
                           <div className="flex-1 bg-black rounded p-2 text-center border border-stone-800">
                              <div className="text-[10px] text-stone-500 uppercase">Атака</div>
                              <div className="font-['JetBrains_Mono'] text-lg text-stone-200">{w.attack}</div>
                           </div>
                           <div className="flex-[2] bg-black rounded p-2 text-center border border-stone-800">
                              <div className="text-[10px] text-stone-500 uppercase">Урон</div>
                              <div className="font-['JetBrains_Mono'] text-lg text-red-400">{w.damage}</div>
                           </div>
                        </div>
                     </div>
                  ))}
                  <Button variant="outline" className="w-full border-dashed border-stone-700 text-stone-400 bg-transparent hover:bg-stone-900 hover:text-stone-300">
                     + Добавить атаку
                  </Button>
               </div>
            </div>

            {/* Accordion Panels */}
            <Accordion type="multiple" defaultValue={["features"]} className="space-y-4">
              <AccordionItem value="features" className="bg-black/60 border border-amber-900/30 rounded-lg overflow-hidden data-[state=open]:shadow-lg shadow-none">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-stone-900/50 transition-colors data-[state=open]:bg-stone-900/80 data-[state=open]:border-b border-amber-900/30">
                  <div className="flex items-center gap-2">
                    <Flame className="text-amber-600 w-5 h-5" />
                    <span className="font-bold tracking-wider">Умения и Особенности</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 flex flex-col gap-4 text-stone-400">
                  <div>
                    <h4 className="text-amber-500 font-bold mb-1 flex justify-between">Второе дыхание <Badge variant="secondary" className="bg-stone-800 text-xs text-stone-300">1 / Отдых</Badge></h4>
                    <p className="text-sm">В свой ход вы можете бонусным действием восстановить хиты в размере 1к10 + ваш уровень воина.</p>
                  </div>
                  <Separator className="bg-stone-800" />
                  <div>
                    <h4 className="text-amber-500 font-bold mb-1 flex justify-between">Всплеск действий <Badge variant="secondary" className="bg-stone-800 text-xs text-stone-300">1 / Отдых</Badge></h4>
                    <p className="text-sm">В свой ход вы можете совершить одно дополнительное действие помимо обычного.</p>
                  </div>
                  <Separator className="bg-stone-800" />
                  <div>
                    <h4 className="text-amber-500 font-bold mb-1">Критический удар (улучшенный)</h4>
                    <p className="text-sm">Атаки оружием совершают критическое попадание при выпадении 19 или 20.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="proficiencies" className="bg-black/60 border border-amber-900/30 rounded-lg overflow-hidden data-[state=open]:shadow-lg shadow-none">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-stone-900/50 transition-colors data-[state=open]:bg-stone-900/80 data-[state=open]:border-b border-amber-900/30">
                  <div className="flex items-center gap-2">
                    <BookOpen className="text-amber-600 w-5 h-5" />
                    <span className="font-bold tracking-wider">Владения и Языки</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 text-stone-400 space-y-4">
                  <div>
                     <div className="text-xs uppercase text-stone-500 mb-2 font-bold">Языки</div>
                     <div className="flex flex-wrap gap-2">
                        <Badge className="bg-stone-800 hover:bg-stone-700 text-stone-300 font-normal">Общий</Badge>
                        <Badge className="bg-stone-800 hover:bg-stone-700 text-stone-300 font-normal">Дварфийский</Badge>
                        <Badge className="bg-stone-800 hover:bg-stone-700 text-stone-300 font-normal">Орочий</Badge>
                     </div>
                  </div>
                  <div>
                     <div className="text-xs uppercase text-stone-500 mb-2 font-bold">Доспехи и Оружие</div>
                     <p className="text-sm">Все доспехи, щиты. Простое оружие, воинское оружие.</p>
                  </div>
                  <div>
                     <div className="text-xs uppercase text-stone-500 mb-2 font-bold">Инструменты</div>
                     <p className="text-sm">Инструменты кузнеца, Набор для игры в кости.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <div className="h-20" /> {/* Spacer for bottom scroll */}
          </ScrollArea>
        </div>

        {/* --- Bottom Panel: Inventory & Text Blocks --- */}
        <div className="col-span-full mt-4">
          <Tabs defaultValue="inventory" className="w-full">
            <div className="bg-black/50 border border-amber-900/30 rounded-lg p-1.5 flex flex-wrap gap-2 mb-4 backdrop-blur-sm shadow-lg">
               <TabsList className="bg-transparent h-auto p-0 flex flex-wrap gap-2 border-none">
                 <TabsTrigger value="inventory" className="data-[state=active]:bg-stone-800 data-[state=active]:text-amber-500 rounded px-4 py-2 border border-transparent data-[state=active]:border-amber-900/50">
                   <Backpack className="w-4 h-4 mr-2" /> Снаряжение
                 </TabsTrigger>
                 <TabsTrigger value="notes" className="data-[state=active]:bg-stone-800 data-[state=active]:text-amber-500 rounded px-4 py-2 border border-transparent data-[state=active]:border-amber-900/50">
                   <FileText className="w-4 h-4 mr-2" /> Заметки
                 </TabsTrigger>
                 <TabsTrigger value="factions" className="data-[state=active]:bg-stone-800 data-[state=active]:text-amber-500 rounded px-4 py-2 border border-transparent data-[state=active]:border-amber-900/50">
                   <Shield className="w-4 h-4 mr-2" /> Фракции и Связи
                 </TabsTrigger>
               </TabsList>
            </div>

            <TabsContent value="inventory" className="mt-0">
               <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  {/* Money */}
                  <div className="bg-black/60 border border-amber-900/30 rounded-lg p-4 flex flex-col h-[250px]">
                     <h3 className="text-sm uppercase tracking-wider font-bold text-stone-500 flex items-center gap-2 mb-4"><Coins size={16}/> Деньги</h3>
                     <div className="flex-1 grid grid-cols-2 gap-2">
                        <div className="bg-stone-900 rounded border border-stone-800 flex flex-col justify-center items-center">
                           <span className="text-amber-700 text-[10px] uppercase font-bold">ММ (CP)</span>
                           <span className="font-['JetBrains_Mono'] text-xl text-stone-300">24</span>
                        </div>
                        <div className="bg-stone-900 rounded border border-stone-800 flex flex-col justify-center items-center">
                           <span className="text-stone-400 text-[10px] uppercase font-bold">СМ (SP)</span>
                           <span className="font-['JetBrains_Mono'] text-xl text-stone-300">11</span>
                        </div>
                        <div className="bg-stone-900 rounded border border-stone-800 flex flex-col justify-center items-center">
                           <span className="text-stone-300 text-[10px] uppercase font-bold">ЭМ (EP)</span>
                           <span className="font-['JetBrains_Mono'] text-xl text-stone-300">0</span>
                        </div>
                        <div className="bg-stone-900 rounded border border-amber-700/30 flex flex-col justify-center items-center">
                           <span className="text-amber-400 text-[10px] uppercase font-bold">ЗМ (GP)</span>
                           <span className="font-['JetBrains_Mono'] text-xl text-amber-500">145</span>
                        </div>
                        <div className="col-span-2 bg-stone-900 rounded border border-purple-900/30 flex flex-col justify-center items-center py-2">
                           <span className="text-purple-400 text-[10px] uppercase font-bold">ПМ (PP)</span>
                           <span className="font-['JetBrains_Mono'] text-xl text-stone-300">0</span>
                        </div>
                     </div>
                  </div>
                  
                  {/* Items List */}
                  <div className="col-span-1 lg:col-span-3 bg-black/60 border border-amber-900/30 rounded-lg p-4 h-[250px] flex flex-col">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm uppercase tracking-wider font-bold text-stone-500">Рюкзак</h3>
                        <span className="text-xs text-stone-400 bg-stone-900 px-2 py-1 rounded">Вес: 64 / 240 ф.</span>
                     </div>
                     <ScrollArea className="flex-1 -mx-2 px-2">
                        <table className="w-full text-sm text-left">
                           <thead className="text-xs text-stone-500 bg-stone-900/50 sticky top-0 z-10">
                              <tr>
                                 <th className="px-3 py-2 font-normal rounded-l">Предмет</th>
                                 <th className="px-3 py-2 font-normal w-20 text-center">Кол-во</th>
                                 <th className="px-3 py-2 font-normal w-20 text-right">Вес</th>
                                 <th className="px-3 py-2 rounded-r"></th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-stone-800/50 text-stone-300">
                              <tr className="hover:bg-stone-900/50">
                                 <td className="px-3 py-2">Набор путешественника</td>
                                 <td className="px-3 py-2 text-center font-['JetBrains_Mono']">1</td>
                                 <td className="px-3 py-2 text-right text-stone-500">59 ф.</td>
                                 <td className="px-3 py-2 text-right">
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-stone-500 hover:text-red-400"><X size={14}/></Button>
                                 </td>
                              </tr>
                              <tr className="hover:bg-stone-900/50">
                                 <td className="px-3 py-2">Зелье лечения</td>
                                 <td className="px-3 py-2 text-center font-['JetBrains_Mono']">2</td>
                                 <td className="px-3 py-2 text-right text-stone-500">1 ф.</td>
                                 <td className="px-3 py-2 text-right">
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-stone-500 hover:text-red-400"><X size={14}/></Button>
                                 </td>
                              </tr>
                              <tr className="hover:bg-stone-900/50">
                                 <td className="px-3 py-2">Веревка (пеньковая, 50 фт)</td>
                                 <td className="px-3 py-2 text-center font-['JetBrains_Mono']">1</td>
                                 <td className="px-3 py-2 text-right text-stone-500">10 ф.</td>
                                 <td className="px-3 py-2 text-right">
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-stone-500 hover:text-red-400"><X size={14}/></Button>
                                 </td>
                              </tr>
                           </tbody>
                        </table>
                     </ScrollArea>
                  </div>
               </div>
            </TabsContent>

            <TabsContent value="notes" className="mt-0">
               <div className="bg-black/60 border border-amber-900/30 rounded-lg p-6 min-h-[250px]">
                  <h3 className="text-xl font-['Lora'] text-amber-500 mb-4">История и Характер</h3>
                  <div className="prose prose-invert prose-stone max-w-none">
                     <p>Я всегда стою на защите слабых. Мое слово — закон, а меч — инструмент справедливости.</p>
                     <p>Ищу древний артефакт своего клана, похищенный культистами Дракона.</p>
                  </div>
               </div>
            </TabsContent>

            <TabsContent value="factions" className="mt-0">
               <div className="bg-black/60 border border-amber-900/30 rounded-lg p-6 min-h-[250px]">
                  <h3 className="text-xl font-['Lora'] text-amber-500 mb-4">Союзники и Организации</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="p-4 border border-stone-800 bg-stone-900/50 rounded-lg">
                        <h4 className="font-bold text-stone-200 mb-2">Орден Перчатки</h4>
                        <p className="text-sm text-stone-400">Рыцарский орден, борющийся со злом. Я являюсь рыцарем этого ордена.</p>
                     </div>
                  </div>
               </div>
            </TabsContent>
          </Tabs>
        </div>

      </div>
    </div>
  );
}
