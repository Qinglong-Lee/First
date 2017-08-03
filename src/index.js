import React from 'react';
import { Component} from 'react';
import ReactDOM from 'react-dom';
import{ combineReducers } from 'Redux';
import { createStore } from 'Redux';
import { Provider } from 'react-redux';
import { connect } from 'react-redux';

/********************
 ****** REDUCES *****
 ********************/
const todo = (state, action) => {
    switch (action.type) {
        case 'ADD_TODO':
            return {
                id: action.id,
                text: action.text,
                completed: false
            };
        case 'TOGGLE_TODO':
            if(state.id !== action.id) {
                return state;
            }
            return {
                ...state,
                completed: !state.completed
            };
        default:
            return state;
    }
};

const todos = (state = [], action) => {
    switch (action.type) {
        case 'ADD_TODO':
            return [
                ...state,
                todo(undefined, action)
            ];
        case 'TOGGLE_TODO':
            return state.map(t  => todo(t, action));
        default:
            return state;
    }
};

const visibilityFilter = (
    state = 'SHOW_ALL',
    action
) => {
    switch (action.type) {
        case 'SET_VISIBILITY_FILTER':
            return action.filter;
        default:
            return state;
    }
};

const todoApp = combineReducers({
    todos,
    visibilityFilter
});


/****************************
 ****** ACTION CREATERS *****
 ****************************/
let nextTodoId = 0;
const addTodo = (text) => {
    return {
        type: 'ADD_TODO',
        id: nextTodoId++,
        text
    };
};
const setVisibilityFilter = (filter) => {
    return {
        type: 'SET_VISIBILITY_FILTER',
        filter: filter
    }
};
const toggleTodo = (id) => {
    return {
        type: 'TOGGLE_TODO',
        id
    }
};


/**************************************
 ****** PRESENTATINAL COMP TODOLIST ***
 **************************************/
const Todo = ({
    onClick,
    completed,
    text
}) => (
    <li
        onClick={onClick}
        style={{
            textDecoration:
                completed ?
                'line-through' :
                'none'
        }}>
        {text}
    </li>
);

const TodoList = ({
    todos,
    onTodoClick
}) => (
    <ul>
        {todos.map(todo =>
            <Todo
                key={todo.id}
                {...todo}
                onClick={() => onTodoClick(todo.id)}
            />
        )}
    </ul>
);

/************************************
 ****** CONTAINER COMP TODOLIST *****
 ************************************/
const mapStateToTodoListProps = (state) => {
    return {
        todos: getVisibleTodos(
            state.todos,
            state.visibilityFilter
        )
    };
};
const mapDispatchToTodoListProps = (dispatch) => {
    return {
        onTodoClick: id =>
            dispatch(toggleTodo(id))
    };
};


const VisibleTodoList = connect(
    mapStateToTodoListProps,
    mapDispatchToTodoListProps
)(TodoList);


/**************************************************
 ****** PRESENTATINAL & CONTAINER COMP ADDTODO ****
 **************************************************/
let AddTodo = ({ dispatch }) => {
    let input;
    return (
        <div>
            <input ref={node => {
                input = node;
              }}/>

            <button onClick={() => {
                dispatch(addTodo(input.value));
                input.value = '';
              }}>
                Add Todo
            </button>
        </div>
    );
};

AddTodo = connect()(AddTodo);

/**************************************
 ****** PRESENTATINAL COMP LINK *******
 **************************************/
const Link = ({
    active,
    children,
    onClick
    }) => {
    if(active) {
        return <span>{children}</span>
    }
    return (
        <a href='#'
           onClick={e => {
                e.preventDefault();
                onClick();
            }}
        >
            {children}
        </a>
    )
};

/**********************************
 ****** CONTAINER COMP LINK *******
 **********************************/
const mapStateToLinkProps = (
    state,
    ownProps
) => {
    return {
        active:
            ownProps.filter ===
            state.visibilityFilter
    };
};
const mapDispatchToLinkProps = (
    dispatch,
    ownProps
) => {
    return {
        onClick: () =>
            dispatch(setVisibilityFilter(ownProps.filter))
    };
};

/******************************************
 ****** PRESENTATINAL COMP FILTERLINK *****
 ******************************************/
const FilterLink = connect(
    mapStateToLinkProps,
    mapDispatchToLinkProps
)(Link);

/**************************************
 ****** PRESENTATINAL COMP FOOTER *****
 **************************************/
const Footer = () => (
    <p>
        Show:
        {' '}
        <FilterLink
            filter='SHOW_ALL'
        >
            All
        </FilterLink>
        {' '}
        <FilterLink
            filter='SHOW_ACTIVE'
        >
            Active
        </FilterLink>
        {' '}
        <FilterLink
            filter='SHOW_COMPLETED'
        >
            Completed
        </FilterLink>
    </p>
);

/***********************
 ****** TOOL FUNC ******
 ***********************/
const getVisibleTodos = (
    todos,
    filter
) => {
    switch (filter) {
        case 'SHOW_ALL':
            return todos;
        case 'SHOW_COMPLETED':
            return todos.filter(
                t => t.completed
            );
        case 'SHOW_ACTIVE':
            return todos.filter(
                t => !t.completed
            );
    }
};

/***************************************
 ****** PRESENTATINAL COMP TODOAOO *****
 ***************************************/
const TodoApp = () => {
    return (
      <div>
          <AddTodo  />
          <VisibleTodoList />
          <Footer />
      </div>
    );
}

/****************************
 ****** REACTDOM RENDER *****
 ****************************/
ReactDOM.render(
  <Provider store = {createStore(todoApp)}>
    <TodoApp />
  </Provider>,
  document.getElementById('root')
);


/*const combineReducers = (reducers) => {
    return (state = {}, action) => {
        return Object.keys(reducers).reduce(
            (nextState, key) => {
                nextState[key] = reducers[key](
                    state[key],
                    action
                );
                return nextState;
             },
            {}
        );
     };
 };*/


/*class Provider extends Component {
    getChildContext() {
         return {
             store: this.props.store
        };
    }
    render() {
        return this.props.children;
    }
 }

 Provider.childContextTypes = {
    store: React.PropTypes.object
 };*/


/*class VisibleTodoList extends Component {
    componentDidMount() {
        const { store } = this.context;
        this.unsubscribe = store.subscribe(() =>
        this.forceUpdate()
    );
 }
    componentWillUnmount() {
        this.unsubscribe();
    }
    render() {
        const props = this.props;
        const { store } = this.context;
        const state = store.getState();
        return (
         <TodoList
                todos={
                    getVisibleTodos(
                        state.todos,
                        state.visibilityFilter
                    )
                }
                onTodoClick={id =>
                    store.dispatch({
                        type: 'TOGGLE_TODO',
                        id
                    })
                }
            />
        );
     }
 }

 VisibleTodoList.contextTypes = {
    store: React.PropTypes.object
 }*/



/*class FilterLink extends Component {
    componentDidMount() {
        const { store } = this.context;
        this.unsubscribe = store.subscribe(() =>
            this.forceUpdate()
       );
    }
    componentWillUnmount() {
        this.unsubscribe();
    }
    render() {
        const props = this.props;
        const { store } = this.context;
        const state = store.getState();
        return (
            <Link
                active={
                    props.filter ===
                    state.visibilityFilter
                }
                onClick={() =>
                    store.dispatch({
                        type: 'SET_VISIBILITY_FILTER',
                        filter: props.filter
                    })
                }
            >
                {props.children}
            </Link>
        );
     }
 }
 FilterLink.contextTypes = {
    store: React.PropTypes.object
 }*/