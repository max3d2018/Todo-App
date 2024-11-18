class ToDoUI {
  taskInput = document.getElementById("taskInput");
  addBtn = document.getElementById("add-button");
  toDoList = document.getElementById("list");
  alertComponent = document.getElementById("alert");
  body = document.querySelector("body");

  constructor(manager) {
    this.manager = manager;

    this.showTodos(manager.list);

    this.addBtn.addEventListener("click", this.addUI.bind(this));

    this.toDoList.addEventListener("click", this.deleteUI.bind(this));

    this.toDoList.addEventListener(
      "click",
      this.changeOnCheckboxState.bind(this)
    );
  }

  addUI() {
    const toDoText = this.taskInput.value;
    if (toDoText === "") {
      if (this.alertComponent.classList.contains("hidden")) {
        this.showAlertMessage(
          "Task cannot be Empty. Please fill the blank and try again."
        );
      }
      return;
    }

    if (this.checkRepetitiveTask(toDoText)) {
      this.showAlertMessage("You cannot Enter Repetitive Task!");
      return;
    }
    const toDo = new ToDoItem(toDoText);
    this.manager.addToDo(toDo);
    this.showTodos(this.manager.list);
    this.eraseInputField();
  }

  deleteUI(e) {
    const item = e.target;
    if (item.id === "delete-btn") {
      const itemId = +item.parentElement.getAttribute("itemid");
      this.manager.deleteTodo(itemId);
      this.showTodos(this.manager.list);
    }
  }

  checkRepetitiveTask(todoText) {
    return this.manager.list.some((el) => {
      return el.toDo === todoText;
    });
  }

  changeOnCheckboxState(e) {
    const item = e.target;
    if (item.classList.contains("checkbox")) {
      const parentItem = this.getListItemParent(item);
      const itemId = +parentItem.getAttribute("itemid");

      if (item.id === `DoneCB-${itemId}`) {
        if (item.checked) {
          this.changeToDoneState(parentItem);
          this.manager.isDoneController(itemId, true);
        }

        if (!item.checked) {
          this.changeToUndoneState(parentItem);
          this.manager.isDoneController(itemId, false);
        }
      }
    }

    this.manager.saveToLocalStorage();
  }

  getListItemParent(targetItem) {
    return targetItem.closest("#item");
  }

  changeToDoneState(parent) {
    parent.querySelector(".todo-content").classList.add("completed");
    parent.classList.add("done");
  }

  changeToUndoneState(parent) {
    parent.querySelector(".todo-content").classList.remove("completed");
    parent.classList.remove("done");
  }

  eraseInputField() {
    this.taskInput.value = "";
  }

  insertToDoUI(todo, index) {
    const toDoItem = `<li itemId=${index} id=item class="p-3 border border-blue-500 flex space-x-6 items-center rounded-lg transition-all ${
      todo.isDone ? "done" : " "
    }">
      <p class="text-lg mr-auto capitalize"><span class="todo-content ${
        todo.isDone ? "completed" : " "
      }  ">${todo.toDo}</span></p>
      <div class="flex flex-row items-center space-x-5">
        <label for="DoneCB-${index}" class="text-lg text-red-500">Done?</label>
        <input id="DoneCB-${index}" type="checkbox" class="accent-blue-100 checkbox" ${
      todo.isDone ? "checked" : " "
    }  />
      </div>
      <button
        id="delete-btn"
        class="border border-red-300 p-2 hover:bg-red-300  rounded-sm hover:text-white"
      >
        Delete
      </button>
    </li>`;
    this.toDoList.insertAdjacentHTML("afterbegin", toDoItem);
  }

  showAlertMessage(message) {
    this.alertComponent.textContent = message;
    this.alertComponent.classList.toggle("hidden");
    setTimeout(() => {
      this.alertComponent.classList.toggle("hidden");
    }, 5000);
  }

  showTodos(list) {
    this.toDoList.innerHTML = "";
    list.forEach((el, i) => {
      this.insertToDoUI(el, i);
    });
  }
}

//-----------------------------------------------------
class ToDoListManager {
  constructor() {
    this.list = this.loadFromLocalStorage();
  }

  addToDo(toDoObj) {
    this.list.push(toDoObj);
    this.saveToLocalStorage();
    console.log(JSON.parse(localStorage.getItem("list")));
  }

  deleteTodo(index) {
    this.list = this.list.filter((_, i) => {
      if (i !== index) return true;
    });

    this.saveToLocalStorage();
  }

  isDoneController(itemId, isDone) {
    this.list.forEach((el, i) => {
      if (i === itemId) {
        el.isDone = isDone;
      }
    });
  }

  saveToLocalStorage() {
    localStorage.setItem("list", JSON.stringify(this.list));
  }

  loadFromLocalStorage() {
    return JSON.parse(localStorage.getItem("list")) || [];
  }
}

//------------------------------------------------------------------------

class ToDoItem {
  constructor(toDoText) {
    this.toDo = toDoText;
    this.isDone = false;
  }
}

//-----------------------------------------------------------------------
const toDoListManager = new ToDoListManager();
const ui = new ToDoUI(toDoListManager);
