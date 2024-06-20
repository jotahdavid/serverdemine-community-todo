import { TodoItem } from '@/components/TodoItem';
import TodoRepository from '@/repositories/TodoRepository';

export default async function Home() {
  const todos = await TodoRepository.getAll();

  const pendingTodos = todos.filter((todo) => !todo.completed);
  const completedTodos = todos.filter((todo) => todo.completed);

  return (
    <div className="h-[100vh] text-white flex overflow-hidden">
      <aside className="h-full bg-green-dark px-16 py-14 w-full max-w-[390px] flex flex-col justify-between overflow-y-auto">
        <header>
          <h1 className="text-5xl mb-20 font-vt323 uppercase text-center">ServerdeMine</h1>

          <div className="flex flex-col gap-y-5 mb-10 pb-10 border-b">
            <a className="text-2xl hover:underline underline-offset-2" href={process.env.NEXT_PUBLIC_DOC_URL}>
              Documentação
            </a>
          </div>

          <div>
            <strong className="text-2xl mb-5 block">Categorias</strong>
            <ul className="space-y-5">
              {['Construção', 'Exploração', 'Automação'].map((categoryName) => (
                <li key={categoryName}>
                  <a className="font-vt323 text-2xl hover:underline underline-offset-2" href="#">
                    # {categoryName}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </header>

        <footer className="mt-4">
          <img src="#" alt="Logo" />
        </footer>
      </aside>

      <main className="h-full w-full bg-[#6aa84f] bg-[url('/minepattern.png')] overflow-y-auto">
        <div className="h-full p-14 flex flex-col">
          <button className="font-vt323 w-fit bg-green-dark py-2 px-8 rounded-sm hover:bg-green-900 transition-colors">
            Nova tarefa
          </button>

          <hr className="mt-8 mb-4" />

          <h2 className="text-2xl mb-7 font-bold">A fazer</h2>

          <ul className="space-y-4 flex-1">
            {pendingTodos.map((pendingTodo) => (
              <li key={pendingTodo.id}>
                <TodoItem todo={pendingTodo} />
              </li>
            ))}
          </ul>

          <hr className="mt-8 mb-4" />

          <h2 className="text-2xl mb-7 font-bold">Concluido</h2>

          <ul className="space-y-4 pb-14">
            {completedTodos.map((completedTodo) => (
              <li key={completedTodo.id}>
                <TodoItem todo={completedTodo} />
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
