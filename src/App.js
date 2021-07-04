import { Suspense, useState } from 'react';
import {
  RecoilRoot,
  atom,
  selector,
  useRecoilValue,
  useRecoilState,
  useSetRecoilState
} from 'recoil'

import axios from 'axios';

function App() {
  return (
    <RecoilRoot>
      <Suspense fallback={<h1>Cargando...</h1>}>
        <UserData />
        <TodoFilter />
        <TodoStats />
        <ItemCreator />
        <TodoList />
      </Suspense>
    </RecoilRoot>
  );
}

let id = 0

const todoListState = atom({
  key: 'todoListState',
  default: []

})

const todoFilterState = atom({
  key: 'todoFilterState',
  default: "all"
})

const todoFilterSelector = selector({
  key: 'todoFilterSelector',
  get: ({get}) => {
    const list = get(todoListState)
    const filter = get(todoFilterState)

    switch (filter) {
      case "complete":
        return list.filter(item => item.isComplete)
      case "incomplete":
        return list.filter(item => !item.isComplete)
      default:
        return list
    }
  }
})

const todoStateSelector = selector({
  key: 'todoStateSelector',
  get: ({get}) => {
    const list = get(todoListState)

    const data= {
      total: list.length,
      toDo: list.filter(item => !item.isComplete).length,
      notTodo: list.filter(item => item.isComplete).length,
      completadoPercentaje: list.length === 0 ? 0 : list.filter(item => item.isComplete).length / list.length
    }
    return data
  }
})

const userDataSelector = selector({
  key: 'userDataSelector',
  get: async () => {
    const data = await axios.get('https://jsonplaceholder.typicode.com/todos/1')
    return data.data.title
  }
})

function ItemCreator() {

  const [text, setText] = useState("")
  const setNewTodo = useSetRecoilState(todoListState)

  const onChangeText = (event) => {
    setText(event.target.value)
  }

  const OnClick = () => {
    setNewTodo( oldTodoList => {
      return [...oldTodoList, { id: id++, text, isComplete: false }]
      })
    setText("")
  }

  return(
    <div>
      <input value={text} onChange={onChangeText} />
      <button onClick={OnClick}>Agregar</button>
    </div>
  )  
}

function TodoList() {
  const todos = useRecoilValue(todoFilterSelector)
  
  return (
    <div>
      {
        todos.map(item => <TodoItem {...item} />)
      }
    </div>
  )  
}

function changeItem(id, todoList, changedItem) {
  const index = todoList.findIndex(item => item.id === id)

  return [...todoList.slice(0, index), changedItem, ...todoList.slice(index + 1, todoList.length)]
}

function deleteItem(id, todoList) {
  const index = todoList.findIndex(item => item.id === id)

  return [...todoList.slice(0, index), ...todoList.slice(index + 1, todoList.length)]
}

function TodoItem({id, text, isComplete}) {

  const [todoList, setTodoList] = useRecoilState(todoListState)

  const onChangeTodoItem = (event) => {
    const textValue = event.target.value
    const changedItem = {
      id,
      text: textValue,
      isComplete
    }
    setTodoList(changeItem(id, todoList, changedItem))
  }

  const onToggleCompleted = () => {
    const changedItem = {
      id,
      text,
      isComplete: !isComplete
    }
    setTodoList(changeItem(id, todoList, changedItem))
  }

  const onClickDelete = () => {
    setTodoList(deleteItem(id, todoList))
  }

  return (
    <div>
      <input value={text} onChange={onChangeTodoItem} />
      <input type="checkbox" checked={isComplete} onChange={onToggleCompleted} />
      <button onClick={onClickDelete}>x</button>
    </div>
  )
}

function TodoFilter() {

  const [filterState, setFilterState] = useRecoilState(todoFilterState)

  const onSelectedItem = (event) => {
    const {value} = event.target
    setFilterState(value)
  }

  return (
    <div>
      Filtro
      <select value={filterState} onChange={onSelectedItem}>
        <option value="all">Todos</option>
        <option value="complete">Completos</option>
        <option value="incomplete">Incompletos</option>
      </select>
    </div>
  )
}

function TodoStats() {

  const {total, toDo, notTodo, completadoPercentaje} = useRecoilValue(todoStateSelector)
  
  return (
    <div>
      <span>Tareas totales: {total}</span> <br />
      <span>Tareas por hacer: {toDo}</span> <br />
      <span>Tareas realizazadas: {notTodo}</span> <br />
      <span>Progreso: {completadoPercentaje * 100}%</span> <br />
    </div>
  )
}

function UserData() {
  const userName = useRecoilValue(userDataSelector)
  
  return (
    <h1>
      {userName}
    </h1>
  )
}

export default App;
