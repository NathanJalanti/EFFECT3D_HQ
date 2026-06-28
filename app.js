const STORAGE_KEY = "productDatabaseItemsV1";

const fields = [
  { key: "name", label: "Name", type: "text", placeholder: "Nom du produit" },
  { key: "fileName", label: "File name", type: "text", placeholder: "Nom du fichier" },
  { key: "material", label: "Material", type: "text", placeholder: "Matière" },
  { key: "mass", label: "Mass", type: "number", step: "0.001", placeholder: "Poids" },
  { key: "volume", label: "Volume", type: "number", step: "0.001", placeholder: "Volume" },
  { key: "project", label: "Project", type: "text", placeholder: "N° de projet" },
  { key: "creationDate", label: "Creation date", type: "date" },
  { key: "creationVisa", label: "Creation visa", type: "text", placeholder: "Nom du dessinateur" },
  { key: "controlDate", label: "Control date", type: "date" },
  { key: "controlVisa", label: "Control visa", type: "text", placeholder: "Nom du contrôleur" },
  { key: "stockQuantity", label: "Stock quantity", type: "number", step: "1", placeholder: "Quantité en stock" },
  { key: "soldQuantity", label: "Sold quantity", type: "number", step: "1", placeholder: "Quantité vendue" },
  { key: "price", label: "Price", type: "number", step: "0.01", placeholder: "Prix" },
  { key: "cost", label: "Cost", type: "number", step: "0.01", placeholder: "Coût" },
];

let items = loadItems();
let selectedId = null;
let dialogMode = "add";

const searchField = document.getElementById("searchField");
const searchInput = document.getElementById("searchInput");
const tableHeader = document.getElementById("tableHeader");
const itemsTable = document.getElementById("itemsTable");
const itemCounter = document.getElementById("itemCounter");
const emptyState = document.getElementById("emptyState");
const addItemBtn = document.getElementById("addItemBtn");
const editItemBtn = document.getElementById("editItemBtn");
const deleteItemBtn = document.getElementById("deleteItemBtn");
const itemDialog = document.getElementById("itemDialog");
const itemForm = document.getElementById("itemForm");
const formGrid = document.getElementById("formGrid");
const dialogTitle = document.getElementById("dialogTitle");
const closeDialogBtn = document.getElementById("closeDialogBtn");
const cancelBtn = document.getElementById("cancelBtn");

init();

function init() {
  createSearchOptions();
  createTableHeader();
  createFormFields();
  bindEvents();
  render();
}

function createSearchOptions() {
  fields.forEach((field) => {
    const option = document.createElement("option");
    option.value = field.key;
    option.textContent = field.label;
    searchField.appendChild(option);
  });
  searchField.value = "name";
}

function createTableHeader() {
  fields.forEach((field) => {
    const th = document.createElement("th");
    th.textContent = field.label;
    tableHeader.appendChild(th);
  });
}

function createFormFields() {
  fields.forEach((field) => {
    const wrapper = document.createElement("div");
    wrapper.className = "field";

    const label = document.createElement("label");
    label.htmlFor = field.key;
    label.textContent = field.label;

    const input = document.createElement("input");
    input.id = field.key;
    input.name = field.key;
    input.type = field.type;
    input.placeholder = field.placeholder || "";
    if (field.step) input.step = field.step;
    if (field.key === "name") input.required = true;

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    formGrid.appendChild(wrapper);
  });
}

function bindEvents() {
  searchInput.addEventListener("input", render);
  searchField.addEventListener("change", () => {
    const selectedField = fields.find((field) => field.key === searchField.value);
    searchInput.placeholder = `Rechercher par ${selectedField.label}...`;
    render();
  });

  addItemBtn.addEventListener("click", openAddDialog);
  editItemBtn.addEventListener("click", openEditDialog);
  deleteItemBtn.addEventListener("click", deleteSelectedItem);
  closeDialogBtn.addEventListener("click", closeDialog);
  cancelBtn.addEventListener("click", closeDialog);
  itemForm.addEventListener("submit", saveForm);
}

function render() {
  const visibleItems = getFilteredItems();
  itemsTable.innerHTML = "";

  visibleItems.forEach((item) => {
    const tr = document.createElement("tr");
    if (item.id === selectedId) tr.classList.add("selected");

    fields.forEach((field) => {
      const td = document.createElement("td");
      td.textContent = item[field.key] || "";
      tr.appendChild(td);
    });

    tr.addEventListener("click", () => selectItem(item.id));
    tr.addEventListener("dblclick", openEditDialog);
    itemsTable.appendChild(tr);
  });

  itemCounter.textContent = `${visibleItems.length} / ${items.length} items`;
  emptyState.style.display = items.length === 0 ? "block" : "none";
  updateButtons();
}

function getFilteredItems() {
  const query = searchInput.value.trim().toLowerCase();
  const fieldKey = searchField.value;

  if (!query) return items;

  return items.filter((item) => {
    const value = String(item[fieldKey] || "").toLowerCase();
    return value.includes(query);
  });
}

function selectItem(id) {
  selectedId = selectedId === id ? null : id;
  render();
}

function updateButtons() {
  const hasSelection = Boolean(selectedId);
  editItemBtn.disabled = !hasSelection;
  deleteItemBtn.disabled = !hasSelection;
}

function openAddDialog() {
  dialogMode = "add";
  selectedId = null;
  dialogTitle.textContent = "Add item";
  itemForm.reset();
  itemDialog.showModal();
  document.getElementById("name").focus();
  render();
}

function openEditDialog() {
  const item = items.find((entry) => entry.id === selectedId);
  if (!item) return;

  dialogMode = "edit";
  dialogTitle.textContent = "Edit item";

  fields.forEach((field) => {
    document.getElementById(field.key).value = item[field.key] || "";
  });

  itemDialog.showModal();
  document.getElementById("name").focus();
}

function closeDialog() {
  itemDialog.close();
}

function saveForm(event) {
  event.preventDefault();

  const formData = new FormData(itemForm);
  const data = {};

  fields.forEach((field) => {
    data[field.key] = formData.get(field.key)?.trim() || "";
  });

  if (dialogMode === "add") {
    items.push({ id: crypto.randomUUID(), ...data });
  } else {
    items = items.map((item) => item.id === selectedId ? { ...item, ...data } : item);
  }

  saveItems();
  closeDialog();
  render();
}

function deleteSelectedItem() {
  const item = items.find((entry) => entry.id === selectedId);
  if (!item) return;

  const confirmed = confirm(`Supprimer "${item.name}" ?`);
  if (!confirmed) return;

  items = items.filter((entry) => entry.id !== selectedId);
  selectedId = null;
  saveItems();
  render();
}

function loadItems() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveItems() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
