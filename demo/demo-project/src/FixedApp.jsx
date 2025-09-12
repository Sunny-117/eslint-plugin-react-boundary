// 这个文件符合 ESLint 规则，所有组件都被 Boundary 包裹
import { Boundary } from 'react-suspense-boundary';

export function App() {
  return (
    <Boundary>
      <div className="app">
        <h1>My App</h1>
        <UserProfile />
        <TodoList />
      </div>
    </Boundary>
  );
}

export const UserProfile = () => {
  return (
    <Boundary>
      <div className="user-profile">
        <h2>User Profile</h2>
        <p>Welcome back!</p>
      </div>
    </Boundary>
  );
};

function TodoList() {
  const todos = ['Learn React', 'Build awesome apps'];
  
  return (
    <Boundary>
      <div className="todo-list">
        <h3>Todo List</h3>
        <ul>
          {todos.map((todo, index) => (
            <li key={index}>{todo}</li>
          ))}
        </ul>
      </div>
    </Boundary>
  );
}

export default App;
