import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CharacterCard } from "@/components/CharacterCard";
import { useTheme } from "@/components/ThemeProvider";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { createDefaultCharacter, type Character } from "@shared/schema";
import { Plus, Scroll, Moon, Sun, Dices, Shield, Swords, LogIn, LogOut, User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

function LandingPage({ theme, toggleTheme }: { theme: string; toggleTheme: () => void }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Scroll className="w-6 h-6 text-accent" />
            <h1 className="text-lg sm:text-xl font-bold font-serif">POCKET CHARLIST</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-10 w-10"
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-accent opacity-70" />
            <Dices className="w-12 h-12 sm:w-14 sm:h-14 text-accent" />
            <Swords className="w-8 h-8 sm:w-10 sm:h-10 text-accent opacity-70" />
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-bold font-serif mb-3">POCKET CHARLIST</h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-2">
            Листы персонажей D&D 5e
          </p>
          <p className="text-sm sm:text-base text-muted-foreground mb-8">
            Создавайте и управляйте своими персонажами. 
            Автоматические расчёты, встроенные броски кубов и удобный интерфейс.
          </p>
          
          <Button 
            size="lg" 
            className="gap-2 text-base sm:text-lg px-6 sm:px-8 h-12"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-login"
          >
            <LogIn className="w-5 h-5" />
            Войти
          </Button>
          
          <p className="text-sm text-muted-foreground mt-4">
            Войдите через Google или email
          </p>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>D&D 5e Character Sheet</p>
        <p className="text-xs mt-1">Dungeons & Dragons is a trademark of Wizards of the Coast LLC</p>
      </footer>
    </div>
  );
}

export default function CharactersList() {
  const [, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { user, isLoading: isAuthLoading, isAuthenticated, logout } = useAuth();

  const { data: characters = [], isLoading } = useQuery<Character[]>({
    queryKey: ['/api/characters'],
    enabled: isAuthenticated,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const defaultCharacter = createDefaultCharacter();
      return apiRequest('POST', '/api/characters', defaultCharacter);
    },
    onSuccess: async (response) => {
      const newCharacter = await response.json();
      queryClient.invalidateQueries({ queryKey: ['/api/characters'] });
      setLocation(`/character/${newCharacter.id}`);
      toast({ title: "Создан новый персонаж", description: "Начните его настройку!" });
    },
    onError: () => {
      toast({ 
        title: "Ошибка", 
        description: "Не удалось создать персонажа",
        variant: "destructive"
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/characters/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/characters'] });
      toast({ title: "Персонаж удалён" });
      setDeleteId(null);
    },
    onError: () => {
      toast({ 
        title: "Ошибка", 
        description: "Не удалось удалить персонажа",
        variant: "destructive"
      });
    },
  });

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Dices className="w-12 h-12 mx-auto mb-4 text-accent animate-pulse" />
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage theme={theme} toggleTheme={toggleTheme} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <Scroll className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            <h1 className="text-base sm:text-xl font-bold font-serif">POCKET CHARLIST</h1>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            {user && (
              <div className="flex items-center gap-2 mr-1 sm:mr-2">
                <Avatar className="w-8 h-8">
                  {user.profileImageUrl ? (
                    <AvatarImage src={user.profileImageUrl} alt={user.firstName || "User"} />
                  ) : null}
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm hidden sm:inline">
                  {user.firstName || user.email || "Пользователь"}
                </span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-10 w-10"
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.location.href = "/api/logout"}
              className="h-10 w-10"
              data-testid="button-logout"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-3 sm:p-4">
        <div className="text-center mb-6 sm:mb-8 mt-3 sm:mt-4">
          <div className="flex items-center justify-center gap-3 mb-3 sm:mb-4">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-accent opacity-70" />
            <Dices className="w-8 h-8 sm:w-10 sm:h-10 text-accent" />
            <Swords className="w-6 h-6 sm:w-8 sm:h-8 text-accent opacity-70" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif mb-2">Листы персонажей</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
            Создавайте и управляйте своими персонажами D&D 5e. 
            Автоматические расчёты, встроенные броски кубов и удобный интерфейс.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : characters.length === 0 ? (
          <Card className="stat-card p-6 sm:p-8 text-center">
            <Scroll className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-accent opacity-50" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Нет персонажей</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              Создайте своего первого персонажа и отправляйтесь в приключение!
            </p>
            <Button 
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              className="gap-2 h-11 sm:h-10"
              data-testid="button-create-first-character"
            >
              <Plus className="w-5 h-5" />
              Создать персонажа
            </Button>
          </Card>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base sm:text-lg font-semibold">
                Ваши персонажи ({characters.length})
              </h3>
              <Button 
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
                className="gap-2 h-11 sm:h-10"
                data-testid="button-create-character"
              >
                <Plus className="w-5 h-5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Новый персонаж</span>
                <span className="sm:hidden">Новый</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {characters.map((character) => (
                <CharacterCard
                  key={character.id}
                  character={character}
                  onClick={() => setLocation(`/character/${character.id}`)}
                  onDelete={() => setDeleteId(character.id)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="mt-auto py-6 text-center text-sm text-muted-foreground">
        <p>D&D 5e Character Sheet</p>
        <p className="text-xs mt-1">Dungeons & Dragons is a trademark of Wizards of the Coast LLC</p>
      </footer>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить персонажа?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Персонаж будет удалён навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
