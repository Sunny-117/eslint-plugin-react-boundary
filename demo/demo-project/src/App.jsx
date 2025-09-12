// 这个文件会触发 ESLint 错误，因为组件没有被 Boundary 包裹

export function App() {
  return (
    <div className="app">
      <h1>My App</h1>
      <UserProfile />
      <TodoList />
    </div>
  );
}

export const UserProfile = () => {
  return (
    <div className="user-profile">
      <h2>User Profile</h2>
      <p>Welcome back!</p>
    </div>
  );
};

function TodoList() {
  const todos = ['Learn React', 'Build awesome apps'];
  
  return (
    <div className="todo-list">
      <h3>Todo List</h3>
      <ul>
        {todos.map((todo, index) => (
          <li key={index}>{todo}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
