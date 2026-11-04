"use strict";
const api = window.API_BASE_URL.replace(/\/$/, "");
const $ = (selector) => document.querySelector(selector);
const inventory = $("#inventory");
const dialog = $("#editor");
const form = $("#vehicle-form");
const pageSize = 12;
let status = "", offset = 0, generation = 0, editingId = null, original = null, busy = false;
const money = new Intl.NumberFormat("en-US", {style:"currency",currency:"USD"});

async function request(path, options = {}) {
  let response;
  try { response = await fetch(api + path, options); }
  catch { throw new Error("Cannot reach the backend. Start FastAPI on port 8000 and check the API URL in config.js."); }
  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = data?.detail;
    throw new Error(Array.isArray(detail) ? detail.map(e => `${e.loc.slice(1).join(".")}: ${e.msg}`).join(" · ") : typeof detail === "string" ? detail : `Request failed (${response.status}).`);
  }
  return data;
}
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function showEmpty(title, message, add = false) {
  const box = element("div", "empty");
  box.append(element("h2", "", title), element("p", "", message));
  if (add) { const button = element("button", "primary", "＋ Add your first vehicle"); button.onclick = () => openEditor(); box.append(button); }
  inventory.replaceChildren(box);
}
function card(vehicle) {
  const article = element("article", "card");
  const art = element("div", "vehicle-art");
  // Neutral illustration until vehicle image endpoints are available.
  art.innerHTML = '<svg viewBox="0 0 200 90" fill="none" aria-hidden="true"><path d="M26 58 38 38h30l17-20h50l21 20h17l9 20v15H22V58Z" fill="currentColor" opacity=".45"/><path d="m76 38 13-15h42l16 15H76Z" fill="white" opacity=".7"/><circle cx="54" cy="70" r="13" fill="currentColor"/><circle cx="150" cy="70" r="13" fill="currentColor"/><circle cx="54" cy="70" r="6" fill="white"/><circle cx="150" cy="70" r="6" fill="white"/></svg>';
  art.append(element("span", `badge ${vehicle.status}`, vehicle.status));
  const body = element("div", "card-body");
  body.append(element("h2", "", `${vehicle.year} ${vehicle.make} ${vehicle.model}`), element("div", "vin", vehicle.vin));
  body.append(element("div", "specs", `${Number(vehicle.mileage).toLocaleString()} miles · #${vehicle.id}`));
  body.append(element("div", "price-label", "ASKING PRICE"), element("div", "price", money.format(vehicle.asking_price)));
  const actions = element("div", "card-actions");
  const edit = element("button", "edit", "View & edit →"); edit.onclick = () => openEditor(vehicle.id);
  const remove = element("button", "delete", "Delete"); remove.onclick = () => deleteVehicle(vehicle, remove);
  actions.append(edit, remove); body.append(actions); article.append(art, body); return article;
}
async function loadVehicles() {
  const current = ++generation;
  inventory.setAttribute("aria-busy", "true"); $("#notice").textContent = "";
  $("#previous").disabled = true; $("#next").disabled = true;
  showEmpty("Loading inventory…", "Getting the latest vehicle details.");
  try {
    const query = new URLSearchParams({limit: pageSize + 1, offset});
    if (status) query.set("status", status);
    const vehicles = await request(`/vehicles?${query}`);
    if (current !== generation) return;
    if (!vehicles.length && offset > 0) { offset = Math.max(0, offset - pageSize); return loadVehicles(); }
    const displayed = vehicles.slice(0, pageSize);
    if (!displayed.length) showEmpty(status ? `No ${status} vehicles` : "Your inventory starts here", "Add a vehicle to start organizing your lot.", true);
    else inventory.replaceChildren(...displayed.map(card));
    $("#page-label").textContent = displayed.length ? `Showing ${offset + 1}–${offset + displayed.length}` : "0 vehicles";
    $("#previous").disabled = offset === 0;
    $("#next").disabled = vehicles.length <= pageSize;
  } catch (error) {
    if (current !== generation) return;
    showEmpty("Inventory unavailable", "Check the backend connection, then use Refresh to try again.");
    $("#notice").textContent = error.message; $("#page-label").textContent = "";
  } finally { if (current === generation) inventory.setAttribute("aria-busy", "false"); }
}
function payload() {
  const values = Object.fromEntries(new FormData(form));
  for (const name of ["year", "mileage"]) values[name] = Number(values[name]);
  for (const name of ["vin", "make", "model"]) values[name] = values[name].trim();
  values.vin = values.vin.toUpperCase();
  values.description = values.description.trim() || null;
  values.bought_date = values.bought_date || null;
  return values;
}
async function openEditor(id = null) {
  if (busy) return;
  editingId = id; original = null; form.reset(); $("#form-error").textContent = "";
  $("#form-title").textContent = id ? "Vehicle details" : "Add vehicle";
  $("#save").textContent = id ? "Save changes" : "Add vehicle";
  if (id !== null) {
    busy = true;
    try {
      const vehicle = await request(`/vehicles/${id}`);
      for (const control of form.elements) if (control.name && Object.hasOwn(vehicle, control.name)) control.value = vehicle[control.name] ?? "";
      original = payload();
    } catch (error) { $("#notice").textContent = error.message; return; }
    finally { busy = false; }
  }
  dialog.showModal();
}
function closeEditor() { if (!busy) dialog.close(); }
form.addEventListener("submit", async event => {
  event.preventDefault(); if (busy) return;
  const values = payload();
  const changes = editingId === null ? values : Object.fromEntries(Object.entries(values).filter(([key, value]) => {
    if (["purchase_price", "asking_price"].includes(key)) return Number(value) !== Number(original[key]);
    return value !== original[key];
  }));
  if (!Object.keys(changes).length) { dialog.close(); return; }
  busy = true; $("#save").disabled = true; $("#form-error").textContent = "";
  try {
    await request(editingId === null ? "/vehicles" : `/vehicles/${editingId}`, {method: editingId === null ? "POST" : "PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify(changes)});
    dialog.close(); await loadVehicles();
  } catch (error) { $("#form-error").textContent = error.message; }
  finally { busy = false; $("#save").disabled = false; }
});
async function deleteVehicle(vehicle, button) {
  if (!confirm(`Permanently delete ${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.vin})? This cannot be undone. To keep its history, edit its status to sold instead.`)) return;
  button.disabled = true;
  try { await request(`/vehicles/${vehicle.id}`, {method:"DELETE"}); await loadVehicles(); }
  catch (error) { $("#notice").textContent = error.message; button.disabled = false; }
}
$("#add").onclick = () => openEditor(); $("#refresh").onclick = loadVehicles;
$("#close").onclick = closeEditor; $("#cancel").onclick = closeEditor;
dialog.addEventListener("cancel", event => { if (busy) event.preventDefault(); });
document.querySelectorAll("[data-status]").forEach(button => button.onclick = () => {
  status = button.dataset.status; offset = 0;
  document.querySelectorAll("[data-status]").forEach(tab => { tab.classList.toggle("selected", tab === button); tab.setAttribute("aria-pressed", String(tab === button)); });
  loadVehicles();
});
$("#previous").onclick = () => { offset = Math.max(0, offset - pageSize); loadVehicles(); };
$("#next").onclick = () => { offset += pageSize; loadVehicles(); };
loadVehicles();
