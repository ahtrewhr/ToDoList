function startApp() {
    const tasksStore = JSON.parse(localStorage.getItem('tasks'));
    if(tasksStore) return Object.values(tasksStore);
    return [
                {
                    _id: '165978071',
                    completed: false,
                    body:
                        'Check if everything is working correctly',
                    title: 'Add your task',
                },
            ];
}

const tasks = startApp();

(function(arrOfTasks) {
    
    const objOfTasks = arrOfTasks.reduce((acc, task) => {
        acc[task._id] = task;
        return acc;
    }, {});
    
    // elements 
    const taskList = document.querySelector('.task-list');
    const form = document.forms['addTask'];
    const inputTitle = form.elements['title'];
    const inputBody = form.elements['body'];

    // events
    renderAllTasks(objOfTasks);
    form.addEventListener('submit', onFormSubmitHandler);
    taskList.addEventListener('click', onDeleteHandler);
    taskList.addEventListener('click', onChangeHandler);
    // counterTasks();

    function renderAllTasks(tasksList) {
        if(!tasksList) {
            console.error('Передайте список задач');
            return;
        }

        const fragment = document.createDocumentFragment();
        Object.values(tasksList).forEach(task => {
            const li = listItemTemplate(task);
            fragment.appendChild(li);
        });

        taskList.appendChild(fragment);
    }

    function listItemTemplate({ _id, title, body } = {}) {
        const li = document.createElement('li');
        li.classList.add('task-list__item');
        li.setAttribute('data-task-id', _id)

        const titleList = document.createElement('h4');
        titleList.classList.add('task-list__title');
        titleList.textContent = title;

        const article = document.createElement('p');
        article.classList.add('task-list__body');
        article.textContent = body;

        const boxBtns = document.createElement('div');
        boxBtns.classList.add('buttons-box');

        const editBtn = document.createElement('button');
        editBtn.classList.add('task-list__btn', 'edit-task');
        editBtn.textContent = 'Edit task';

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('task-list__btn', 'del-task');
        deleteBtn.textContent = 'Delete task';

        boxBtns.appendChild(editBtn);
        boxBtns.appendChild(deleteBtn);

        li.appendChild(titleList);
        li.appendChild(article);
        li.appendChild(boxBtns);

        return li;
    }

    function onFormSubmitHandler(e) {
        e.preventDefault();
        const titleValue = inputTitle.value;
        const bodyValue = inputBody.value;
        
        if (!titleValue || !bodyValue) {
            alert('Заполните все поля');
            return;
        }

        const task = createNewTask(titleValue, bodyValue);
        const listItem = listItemTemplate(task);
        taskList.insertAdjacentElement('afterbegin', listItem);
        form.reset();
    }

    function createNewTask(title, body) {
        const newTask = {
            _id: `${Math.random()}`.slice(10),
            completed: false,
            body,
            title,
        };
        
        objOfTasks[newTask._id] = newTask;
        
        deleteTestTask();
        dataLocalStorage(objOfTasks);
        counterTasks();
        return { ...newTask };
    }

    function deleteTestTask() {
        const testTaskElement = document.querySelector('[data-task-id="165978071"]');
        delete objOfTasks['165978071'];
        if (!testTaskElement) return;
        deleteTaskFromHtml(true, testTaskElement);
    }

    function deleteTask(id) {
        const { title } = objOfTasks[id];
        const isConfirm = confirm(`Вы точно хотите удалить эту задачу ${title} ?`);
        if (!isConfirm) return isConfirm;
        delete objOfTasks[id];
        dataLocalStorage(objOfTasks);
        return isConfirm;
    }

    function deleteTaskFromHtml(confirmed, el) {
        if (!confirmed) return;
        el.classList.add('deleted');
        setTimeout(() =>  el.remove(), 500);
    }

    function onDeleteHandler({ target }) {
        if (target.classList.contains('del-task')) {
            const parent = target.closest('[data-task-id]');
            const id = parent.dataset.taskId;
            const confirmed = deleteTask(id);
            deleteTaskFromHtml(confirmed, parent);
            counterTasks();
        }
    }

    function onChangeHandler({ target }) {
        if (target.classList.contains('edit-task')) {
            const parent = target.closest('[data-task-id]');
            const id = parent.dataset.taskId;

            if (target.textContent !== 'ОК') {
                changeTaskFromHtml(parent, target);
            } else {
                const newData = modifiedTaskFromHtml(parent, target);
                if (newData !== undefined) {
                    changeTask(id, newData);
                }
            }
        }
    }

    function changeTaskFromHtml(el, btn) {
        btn.textContent = 'ОК';

        const titleTask = el.querySelector('h4');
        const bodyTask = el.querySelector('p');
        const sizeBodyTask = bodyTask.offsetHeight;

        const inputChange = document.createElement('input');
        inputChange.classList.add('changeTitleTask');
        inputChange.type = 'text';
        inputChange.value = titleTask.textContent;

        const textareaChange = document.createElement('textarea');
        textareaChange.classList.add('changeBodyTask');
        textareaChange.value = bodyTask.textContent;
        textareaChange.style.height = sizeBodyTask + "px";
        
        titleTask.replaceWith(inputChange);
        bodyTask.replaceWith(textareaChange);

        inputChange.focus();
    }

    function modifiedTaskFromHtml(el, btn) {
        const input = el.querySelector('.changeTitleTask');
        const textarea = el.querySelector('.changeBodyTask');

        if (input.value == '' || textarea.value == '') {
            alert('Заполните все поля');
        } else {
            const titleTask = document.createElement('h4');
            titleTask.classList.add('task-list__title');
            titleTask.textContent = input.value;
    
            const bodyTask = document.createElement('p');
            bodyTask.classList.add('task-list__body');
            bodyTask.textContent = textarea.value;
    
            input.replaceWith(titleTask);
            textarea.replaceWith(bodyTask);

            btn.textContent = 'Edit task';
    
            return { titleTask, bodyTask };
        }
    }

    function changeTask(id, { titleTask, bodyTask }) {
        objOfTasks[id].title = titleTask.textContent;
        objOfTasks[id].body = bodyTask.textContent;
        dataLocalStorage(objOfTasks);
    }

    function dataLocalStorage(objOfTasks) {
        localStorage.setItem('tasks', JSON.stringify(objOfTasks));
    }

    function counterTasks() {
        const taskList = document.querySelector('.task-list');
        const countOutput = document.querySelector('p.total');
        let count = Object.keys(objOfTasks).length;
        countOutput.textContent = `total task: ${count}`;

        if (!count) {
            const message = document.createElement('li');
            message.classList.add('task-list__message');
            message.textContent = 'The task list is empty';
            taskList.appendChild(message);
        } else if (taskList.querySelector('.task-list__message') !== null) {
            taskList.querySelector('.task-list__message').remove();
        }
    }

    counterTasks();
    
})(tasks);