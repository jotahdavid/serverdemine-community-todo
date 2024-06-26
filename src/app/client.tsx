'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { AddUsernameModal } from '@/components/Modal/AddUsernameModal';
import { TodoItem } from '@/components/TodoItem';
import { NewTaskDTO, Task } from '@/repositories/TaskRepository';
import { CreateTaskModal, type NewTask as NewTask } from '@/components/Modal/CreateTaskModal';
import { Category } from '@prisma/client';
import tasksService from '@/services/tasksService';
import { Spinner } from '@/components/Spinner';
import { cn } from '@/utils/cn';
import { RotateRightIcon } from '@/components/Icons/RotateRightIcon';
import { DiscordIcon } from '@/components/Icons/DiscordIcon';
import { GithubIcon } from '@/components/Icons/GithubIcon';
import { PlayerCount } from '@/components/PlayerCount';

interface ClientComponentProps {
  categories: Category[];
  saveTask: (newTask: NewTaskDTO) => Promise<unknown>;
  toggleTaskStatus: (taskId: number) => Promise<unknown>;
  togglePlayerInTask: (playerNickname: string, taskId: number) => Promise<unknown>;
}

const LOCAL_STORAGE_KEYS = {
  MINECRAFT_NICKNAME: 'MINECRAFT_NICKNAME',
};

export function ClientComponent({ categories, saveTask, toggleTaskStatus, togglePlayerInTask }: ClientComponentProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [nickname, setNickname] = useState<string | null>(null);
  const [isAddUsernameModalOpen, setIsAddUsernameModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

  useEffect(() => {
    refreshTasks();
  }, []);

  useEffect(() => {
    const nickname = localStorage.getItem(LOCAL_STORAGE_KEYS.MINECRAFT_NICKNAME);
    setNickname(nickname);
    setIsAddUsernameModalOpen(!nickname);
  }, []);

  const handleAddUsernameSubmit = useCallback(async (nickname: string) => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.MINECRAFT_NICKNAME, nickname);
    setNickname(nickname);
    setIsAddUsernameModalOpen(false);
  }, []);

  function handleOpenCreateTaskModal() {
    setIsCreateTaskModalOpen(true);
  }

  async function refreshTasks() {
    setIsLoading(true);
    const newTasks = await tasksService.getAll();
    setTasks(newTasks);
    setIsLoading(false);
  }

  async function handleAddTask(newTask: NewTask) {
    if (!nickname) return;
    setIsCreateTaskModalOpen(false);
    setIsLoading(true);
    await saveTask({
      ...newTask,
      createdBy: nickname,
    });
    await refreshTasks();
  }

  function handleCloseCreateTaskModal() {
    setIsCreateTaskModalOpen(false);
  }

  async function handleCheckClick(task: Task) {
    setIsLoading(true);
    await toggleTaskStatus(task.id);
    await refreshTasks();
  }

  async function handleTogglePlayerInTask(task: Task) {
    if (!nickname) return;
    setIsLoading(true);
    await togglePlayerInTask(nickname, task.id);
    await refreshTasks();
  }

  function handleChangeCategory(category: Category) {
    setActiveCategory(category.id !== activeCategory?.id ? category : null);
  }

  const filteredTasks = useMemo(() => (
      activeCategory
        ? tasks.filter((task) => task.categories.find((category) => category.id === activeCategory.id))
        : tasks
  ), [activeCategory, tasks]);

  const pendingTasks = useMemo(() => filteredTasks.filter((task) => !task.completed), [filteredTasks]);

  const completedTasks = useMemo(() => filteredTasks.filter((task) => task.completed), [filteredTasks]);

  return (
    <>
      {isLoading && <Loader />}

      {isAddUsernameModalOpen && <AddUsernameModal onSubmit={handleAddUsernameSubmit} />}

      {isCreateTaskModalOpen && (
        <CreateTaskModal
          categories={categories}
          onAdd={handleAddTask}
          onClose={handleCloseCreateTaskModal}
        />
      )}

      <aside className="h-full bg-green-dark px-16 py-14 w-full max-w-[390px] flex flex-col justify-between overflow-y-auto">
        <header>
          <h1 className="text-5xl mb-1 font-vt323 uppercase text-center">
            ServerdeMine
          </h1>
          <strong className="block mb-5 text-center">IP: serverdemine.online</strong>

          <div className="mb-5">
            <PlayerCount />
          </div>

          <hr className="mb-5" />

          <div className="flex flex-col gap-y-5 mb-5">
            <a className="text-2xl hover:underline underline-offset-2" href={process.env.NEXT_PUBLIC_DOC_URL} target="_blank">
              Tutoriais
            </a>
          </div>

          <hr className="mb-5" />

          <div>
            <strong className="text-2xl mb-5 block">Categorias</strong>
            <ul className="space-y-5">
              {categories.map((category) => (
                <li key={category.id}>
                  <button
                    className={cn(
                      'font-vt323 text-2xl hover:underline underline-offset-2 px-2',
                      { 'bg-white text-black': activeCategory?.id === category.id }
                    )}
                    onClick={() => handleChangeCategory(category)}
                  >
                    # {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </header>

        <footer className="mt-10 flex flex-col items-center justify-center">
          <div className="mb-6 flex items-center justify-between max-w-[180px] w-full">
            <a href={process.env.NEXT_PUBLIC_DISCORD_URL} target="_blank" className="block">
              <DiscordIcon className="size-12 fill-white hover:fill-green-light transition-colors" />
            </a>

            <a href={process.env.NEXT_PUBLIC_GITHUB_URL} target="_blank" className="block">
              <GithubIcon className="size-12 fill-white hover:fill-green-light transition-colors" />
            </a>
          </div>
          <a href="https://studiomodus.com.br" target="_blank">
            <img src="/logo.webp" alt="Logo do StudioModus" title="Studio Modus" />
          </a>
        </footer>
      </aside>

      <main className="h-full w-full bg-[#6aa84f] bg-[url('/minepattern.png')] overflow-y-auto">
        <div className="h-full p-14 flex flex-col">
          <div className="flex items-center gap-x-2">
            <button
              className="font-vt323 text-2xl w-fit bg-green-dark py-2 px-6 rounded-sm hover:bg-green-900 transition-colors shadow-sm"
              onClick={handleOpenCreateTaskModal}
            >
              Nova tarefa
            </button>

            <button
              className="font-vt323 text-2xl w-fit bg-white text-black py-2 px-6 rounded-sm hover:bg-white/70 transition-colors flex items-center gap-x-2 shadow-sm"
              onClick={refreshTasks}
            >
              <RotateRightIcon className="size-4 fill-black transition-colors" />

              Atualizar
            </button>
          </div>

          <hr className="mt-8 mb-4" />

          <h2 className="text-2xl mb-7 font-bold">A fazer</h2>

          <ul className="space-y-4 flex-1">
            {(filteredTasks.length === 0 && !activeCategory) && (
              <p className="text-lg font-medium">Nenhuma tarefa foi criada até o momento, crie a sua já!</p>
            )}

            {(filteredTasks.length === 0 && activeCategory) && (
              <p className="text-lg font-medium">
                A categoria <strong>&quot;{activeCategory.name}&quot;</strong> não tem nenhuma tarefa.
              </p>
            )}

            {pendingTasks.map((pendingTask) => (
              <li key={pendingTask.id}>
                <TodoItem
                  onCheck={handleCheckClick}
                  onToggleAssign={handleTogglePlayerInTask}
                  todo={pendingTask}
                  isAssigned={Boolean(pendingTask.players.find((player) => player.name === nickname))}
                />
              </li>
            ))}
          </ul>

          {completedTasks.length > 0 && (
            <>
              <hr className="mt-8 mb-4" />

              <h2 className="text-2xl mb-7 font-bold">Concluido</h2>

              <ul className="space-y-4 pb-14">
                {completedTasks.map((completedTask) => (
                  <li key={completedTask.id}>
                    <TodoItem
                      onCheck={handleCheckClick}
                      onToggleAssign={handleTogglePlayerInTask}
                      todo={completedTask}
                      isAssigned={Boolean(completedTask.players.find((player) => player.name === nickname))}
                    />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </main>
    </>
  );
}

function Loader() {
  return (
    <div className="bg-green-light/80 backdrop-blur-sm absolute inset-0 z-50 flex items-center justify-center">
      <Spinner
        size="lg"
        className="text-green-dark"
      />
    </div>
  );
}
