const widgets = document.querySelector(".widget-bar");
const dialog = document.querySelector(".edit-dialog");
const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
const ls = localStorage;

var list = [];
var onceSet = false;

function init() {
    getList();
    addItems();
    setListeners();
}
init();

function addItems() {
    let c = document.querySelector(".content");
    document.querySelectorAll(".item-box:not(.add)").forEach(e => e.remove());
    let i = 0;
    for(let link of list) {
        c.innerHTML = `
            <div class="item-box" index="${i}">
                <div class="icon" style="background-image: url(${link.bgUrl});"></div>
                <img class="foo_img" src="${link.bgUrl}" style="display:none;" onerror="update(this)">
                <div class="info">
                    <div class="title">${link.title}</div>
                    <div class="url">${link.url}</div>
                </div>
                <div class="visits">${link.visits}</div>
            </div>
        `+c.innerHTML;
        i++;
    }
}

function setListeners() {
    if(!onceSet) dialog.querySelector(".update").addEventListener("click", ev => {
        if(!dialog.hasAttribute("item")) return;
        let val = dialog.querySelector(".url");
        let v = val.value;
        let item = dialog.getAttribute("item")*1;
        console.log(list[item], item);
        
        list[item].title = v.match(/^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)/)[1];
        list[item].url = v;
        list[item].bgUrl = ("http://"+list[item].title+"/favicon.ico").replace("//favicon.ico", "/favicon.ico");

        dialog.setAttribute("hidden", true);
        addItems();
        setListeners();
        updateList();
    })
    if(!onceSet) dialog.querySelector(".cancel").addEventListener("click", ev => {
        if(!dialog.hasAttribute("item")) return;
        dialog.setAttribute("hidden", true);
        let item = dialog.getAttribute("item")*1;
        if(list[item].url=="none") list.splice(item, 1);
        dialog.removeAttribute("item");
        addItems();
        setListeners();
    })
    if(!onceSet) widgets.querySelector(".delete").addEventListener("click", ev => {
        let p = ev.target.parentElement.parentElement;
        if(p!=document.body) {
            removeWidgets();
            list.splice(p.getAttribute("index")*1, 1);
            p.remove();
            updateList();
        }
    });
    if(!onceSet) widgets.querySelector(".edit").addEventListener("click", ev => {
        editDialog(ev.target.getAttribute("index")*1);
    });
    if(!onceSet) document.addEventListener("keyup", ev => {
        if(!dialog.hasAttribute("hidden")) return;
        if(ev.ctrlKey && ev.code.toLowerCase()=="keya") {
            ev.preventDefault();
            list.push({
                id: createID(),
                title: "Unknown",
                url: "none",
                visits: 0,
                bgUrl: "assets/unknown.png"
            });
            addItems();
            setListeners();
            editDialog(list.length-1);
        }
    });
    document.querySelector(".add").addEventListener("click", ev => {
        if(!dialog.hasAttribute("hidden")) return;
        list.push({
            id: createID(),
            title: "Unknown",
            url: "none",
            visits: 0,
            bgUrl: "assets/unknown.png"
        });
        addItems();
        setListeners();
        editDialog(list.length-1);
    });
    document.querySelectorAll(".item-box:not(.add)").forEach(e => {
        e.addEventListener("click", ev => {
            let t = ev.target;
            if(widgets!=t.parentElement) {
                list[e.getAttribute("index")*1].visits = list[e.getAttribute("index")*1].visits+1;
                updateList();
                window.location.href = e.querySelector(".url").innerHTML;
            }
        });
        e.addEventListener("mouseenter", (ev) => {
            attachWidgets(e);
        });
        e.addEventListener("mouseleave", (ev) => {
            removeWidgets();
        });
    });
    onceSet = true;
}

function attachWidgets(parent) {
    parent.appendChild(widgets);
}
function removeWidgets() {
    document.body.appendChild(widgets);
}
function editDialog(i) {
    let link = list[i];

    dialog.querySelector(".url").value=link.url.match(urlRegex)?link.url:""
    dialog.setAttribute("item", i);
    dialog.removeAttribute("hidden");
}

function createID() {
    let a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", r = "";
    for(let i = 0; i < 16; i++) r+=a.charAt(Math.round(Math.random()*(a.length-1)));
    return r;
}
function getList() {
    let name = "clickit.linkList";
    let l = ls.getItem(name);
    if(l!=null && l!="[]") {
        list = JSON.parse(l);
    } else updateList();
}
function updateList() {
    let name = "clickit.linkList";
    ls.setItem(name, JSON.stringify(list));
}
function update(e) {
    e.parentElement.querySelector(".icon").setAttribute("style", "background-image:url(assets/unknown.png);");
    list[e.parentElement.getAttribute("index")*1].bgUrl = "assets/unknown.png";
    updateList();
}