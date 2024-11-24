class ToDoUI {
  constructor(manager) {
    this.taskInput = document.getElementById("taskInput");
    this.addBtn = document.getElementById("add-button");
    this.toDoList = document.getElementById("list");
    this.alertComponent = document.getElementById("alert");
    this.manager = manager;

    this.setupEventListeners();
    this.showTodos(manager.list);
  }

  setupEventListeners() {
    this.addBtn.addEventListener("click", () => this.addUI());
    this.taskInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.addUI();
    });
    this.toDoList.addEventListener("click", (e) => this.handleListClick(e));
  }

  showAlertMessage(message) {
    this.alertComponent.querySelector("#alertText").textContent = message;
    this.alertComponent.classList.remove("hidden");
    this.alertComponent.style.opacity = "1";

    setTimeout(() => {
      this.alertComponent.style.opacity = "0";
      setTimeout(() => {
        this.alertComponent.classList.add("hidden");
      }, 300);
    }, 3000);
  }

  async addUI() {
    const toDoText = this.taskInput.value.trim();

    if (!toDoText) {
      this.showAlertMessage("لطفاً متن کار را وارد کنید");
      return;
    }

    if (this.checkRepetitiveTask(toDoText)) {
      this.showAlertMessage("این کار قبلاً اضافه شده است!");
      return;
    }

    const toDo = new ToDoItem(toDoText);
    this.manager.addToDo(toDo);
    await this.addTodoWithAnimation(toDo, this.manager.list.length - 1);
    this.taskInput.value = "";
  }

  async addTodoWithAnimation(todo, index) {
    const li = this.createTodoElement(todo, index);
    li.style.opacity = "0";
    li.style.transform = "translateY(20px)";
    this.toDoList.insertBefore(li, this.toDoList.firstChild);

    // Trigger reflow
    li.offsetHeight;

    li.style.transition = "all 0.3s ease-out";
    li.style.opacity = "1";
    li.style.transform = "translateY(0)";
  }

  createTodoElement(todo, index) {
    const li = document.createElement("li");
    li.setAttribute("itemId", index);
    li.setAttribute("id", "item");
    li.className = `group flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 ${
      todo.isDone ? "done bg-green-100" : ""
    }`;

    li.innerHTML = `
          <span class="todo-content text-gray-700 ${
            todo.isDone ? "completed" : ""
          }">${todo.toDo}</span>
          <div class="flex items-center space-x-3">
              <label class="inline-flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" id="DoneCB-${index}" 
                         class="checkbox form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out" 
                         ${todo.isDone ? "checked" : ""}>
                  <span class="text-sm text-gray-600">انجام شد</span>
              </label>
              <button id="delete-btn" 
                      class="px-3 py-1 text-sm text-red-600 hover:bg-red-100 rounded transition-colors duration-200">
                  حذف
              </button>
          </div>
      `;

    return li;
  }

  async handleListClick(e) {
    const target = e.target;

    if (target.id === "delete-btn") {
      const item = target.closest("#item");
      const itemId = +item.getAttribute("itemid");

      // Delete animation
      item.style.transition = "all 0.3s ease-out";
      item.style.opacity = "0";
      item.style.transform = "translateX(100px)";

      await new Promise((resolve) => setTimeout(resolve, 300));
      this.manager.deleteTodo(itemId);
      this.showTodos(this.manager.list);
    }

    if (target.classList.contains("checkbox")) {
      const item = target.closest("#item");
      const itemId = +item.getAttribute("itemid");
      const isChecked = target.checked;

      // Checkbox animation
      if (isChecked) {
        item.classList.add("done");
        item.querySelector(".todo-content").classList.add("completed");
        item.style.transition = "all 0.3s ease-out";
        item.style.backgroundColor = "rgb(220, 252, 231)"; // light green
      } else {
        item.classList.remove("done");
        item.querySelector(".todo-content").classList.remove("completed");
        item.style.backgroundColor = "";
      }

      this.manager.isDoneController(itemId, isChecked);
      this.manager.saveToLocalStorage();
    }
  }

  checkRepetitiveTask(todoText) {
    return this.manager.list.some((el) => el.toDo === todoText);
  }

  showTodos(list) {
    this.toDoList.innerHTML = "";
    list.forEach((todo, index) => {
      const li = this.createTodoElement(todo, index);
      this.toDoList.appendChild(li);
    });
  }
}

class ToDoListManager {
  constructor() {
    this.list = this.loadFromLocalStorage();
  }

  addToDo(toDoObj) {
    this.list.push(toDoObj);
    this.saveToLocalStorage();
  }

  deleteTodo(index) {
    this.list = this.list.filter((_, i) => i !== index);
    this.saveToLocalStorage();
  }

  isDoneController(itemId, isDone) {
    if (this.list[itemId]) {
      this.list[itemId].isDone = isDone;
      this.saveToLocalStorage();
    }
  }

  saveToLocalStorage() {
    localStorage.setItem("list", JSON.stringify(this.list));
  }

  loadFromLocalStorage() {
    try {
      return JSON.parse(localStorage.getItem("list")) || [];
    } catch {
      return [];
    }
  }
}

class ToDoItem {
  constructor(toDoText) {
    this.toDo = toDoText;
    this.isDone = false;
  }
}

// Initialize
const toDoListManager = new ToDoListManager();
const ui = new ToDoUI(toDoListManager);
