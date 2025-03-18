// Purpose: This file is used to add and delete chores from the list

const deleteBtn = document.getElementById("del_button")
const addBtn = document.getElementById("add_button")
const inputArea = document.getElementById("input_area")
const ulEl = document.getElementById("ul_container")

document.addEventListener("DOMContentLoaded", () => {
    inputArea.setAttribute("spellcheck", "true");
});

const hamMenu = document.querySelector(".ham-menu")
const offScreenMenu = document.querySelector(".off-screen-menu")

hamMenu.addEventListener('click', () => {
    hamMenu.classList.toggle('active')
    offScreenMenu.classList.toggle('active')
})


 function addChore() {
    const inputValue = inputArea.value.trim()

    if (inputValue === "" || inputValue.length <= 1) {
        popUp()
        return
    }

    const existingTasks = Array.from(document.querySelectorAll('#ul_container > li')).map(li => 
        li.firstChild.nodeType === Node.TEXT_NODE ? li.firstChild.textContent.trim().toLowerCase() : ""
    )
    if (existingTasks.includes(inputValue.toLowerCase())) {
        alert("Task already exists!")
        return
    }

    createTaskElement(inputValue)
    saveTasks()

    inputArea.value = ""
    inputArea.focus()
    checkInput()
}

function popUp(){
    const popup = document.getElementById('myPopup')
    popup.classList.toggle('show')

    setTimeout(() => {
        popup.classList.toggle('show')
    }, 3000)
}

function checkInput(){
    if(inputArea.value === ""){
        addBtn.disabled = true
        deleteBtn.disabled = true
    }else{
        addBtn.disabled = false
        deleteBtn.disabled = false
    }
}

// local storage
function saveTasks() {
    try {
        const tasks = Array.from(document.querySelectorAll('#ul_container > li')).map(li => {
            return li.childNodes[0].nodeType === Node.TEXT_NODE ? li.childNodes[0].textContent.trim() : "";
        });
        localStorage.setItem('chores', JSON.stringify(tasks));
    } catch (error) {
        console.error('Error saving tasks to localStorage:', error);
    }
}

function loadTasks(){
    try {
        const tasks = JSON.parse(localStorage.getItem('chores')) || []
        tasks.forEach(task => createTaskElement(task))
    } catch (error) {
        console.error('Error loading tasks from localStorage:', error)
    }
}

document.addEventListener("DOMContentLoaded", loadTasks)

function editTask(li) {
    const newText = prompt('Edit your task:', li.firstChild.textContent)
    if (newText !== null && newText.trim() !== "") {
        const existingTasks = Array.from(document.querySelectorAll('#ul_container > li')).map(item =>
            item.firstChild.nodeType === Node.TEXT_NODE ? item.firstChild.textContent.trim().toLowerCase() : ""
        )
        if (existingTasks.includes(newText.trim().toLowerCase())) {
            alert("Task already exists!")
            return
        }
        li.firstChild.textContent = newText.trim()
        saveTasks()
    }
}

function createTaskElement(taskText){
    const li = document.createElement('li')
    li.textContent = taskText

    const delBtn = document.createElement('button')
    delBtn.textContent = '❌'
    delBtn.style.marginLeft = '10px'
    delBtn.onclick = () => {
        li.remove()
        saveTasks()
    }

    const editBtn = document.createElement('button')
    editBtn.textContent = '✏️'
    editBtn.style.marginLeft = 'auto'
    editBtn.onclick = () => editTask(li)

    li.appendChild(editBtn)
    li.appendChild(delBtn)
    ulEl.appendChild(li)
}

deleteBtn.addEventListener('click', () => {
    inputArea.value = ""
    checkInput()
    saveTasks()
})

// clock

function clock(){
    let now = new Date()
    let hours = now.getHours().toString().padStart(2, '0')
    let minutes = now.getMinutes().toString().padStart(2, '0')
    let seconds = now.getSeconds().toString().padStart(2, '0')

    document.getElementById('time').innerHTML = `<time>${hours}:${minutes}:${seconds}</time>`
}

setInterval(clock, 1000)
clock()

// accesibility

document.getElementById('input_area').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        document.getElementById('add_button').click()
    }
})

document.getElementById('add_button').addEventListener('keydown', function(event) {
    if (event.key === 'Tab') {
        event.preventDefault()
        document.getElementById('del_button').focus()
    }
})

document.getElementById('del_button').addEventListener('keydown', function(event) {
    if (event.key === 'Tab') {
        event.preventDefault()
        document.getElementById('input_area').focus()
    }
})

// Event listeners for input functionality

inputArea.addEventListener('input', () => checkInput())
addBtn.addEventListener('click', async () => {
    const inputValue = inputArea.value.trim();
    if (inputValue) {
        await checkSpelling(inputValue);
    }
    addChore();
})
deleteBtn.addEventListener('click', () => {
    inputArea.value = ""
    checkInput()
})

document.getElementById('reset_link').addEventListener('click', (event) => {
    event.preventDefault() // Prevent page refresh
    ulEl.innerHTML = "" // Clear the task list
    localStorage.removeItem('chores') // Remove tasks from localStorage
    checkInput() // Update button states
})

checkInput()

// spellcheck API

async function checkSpelling(text) {
    try {
        const response = await fetch('https://api.languagetool.org/v2/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                text: text,
                language: 'en-GB',
            }),
        });

        const result = await response.json();
        if (result.matches.length > 0) {
            const suggestions = result.matches.map(match => match.replacements[0]?.value).filter(Boolean);
            alert(`Possible spelling issues detected. Suggestions: ${suggestions.join(', ')}`);
        }
    } catch (error) {
        console.error('Error checking spelling:', error);
    }
}