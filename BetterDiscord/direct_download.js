const Plugin = require('../plugin');

// contains modified code from https://stackoverflow.com/a/47820271
const { dialog } = require('electron').remote;
const http = require('https');
const fs = require('fs');
let ttM = {}, iteM = {};

function saveAs(url, filename, fileExtension) {
    const userChosenPath = dialog.showSaveDialog({ defaultPath: filename, title: 'Where would you like to store the stolen memes?', buttonLabel: 'Steal this meme', filters: [{ name: "Stolen meme", extensions: [fileExtension] }] });
    if (userChosenPath) {
        download(url, userChosenPath, () => {
            const wrap = document.createElement('div');
            wrap.className = 'theme-dark';
            const gay = document.createElement('div');
            gay.style = "position: fixed; bottom: 10%; left: calc(50% - 88px);"
            gay.className = `${ttM.tooltip} ${ttM.tooltipTop} ${ttM.tooltipBlack}`;
            gay.innerHTML = 'Successfully downloaded | ' + userChosenPath;
            document.body.appendChild(wrap);
            wrap.appendChild(gay);
            setTimeout(() => wrap.remove(), 2000);
        });
    }
}
function download (url, dest, cb) {
    const file = fs.createWriteStream(dest);
    http.get(url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
            file.close(cb);
        });
    }).on('error', function(err) {
        fs.unlink(dest);
        if (cb) cb(err.message);
    });
}

function addMenuItem(url, text, filename = true, fileExtension) {
    const cmGroups = document.getElementsByClassName(iteM.itemGroup);
    if (!cmGroups || cmGroups.length == 0) return;

    const newCmItem = document.createElement('div');
    newCmItem.className = iteM.item;
    newCmItem.innerHTML = text;

    const lastGroup = cmGroups[cmGroups.length-1];
    lastGroup.appendChild(newCmItem);
    newCmItem.onclick = () => saveAs(url, filename, fileExtension);
}

// contains code modified from https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/SaveTo.plugin.js

module.exports = new Plugin({
    name: 'Direct Download',
    author: 'Joe 🎸#7070',
    description: `<del>Download files</del> Steal memes without opening a browser.`,
    color: '#18770e',

    load: async function() {
        this._cmClass = window.EDApi.findModule("contextMenu").contextMenu;
        this._contClass = window.EDApi.findModule("embedWrapper").container;
        ttM = window.EDApi.findModule('tooltipPointer');
        iteM = window.EDApi.findModule('itemBase');
        document.addEventListener("contextmenu", this.listener);
    },
    listener(e) {
        if (document.getElementsByClassName(this._cmClass).length == 0) setTimeout(() => module.exports.onContextMenu(e), 0);
        else this.onContextMenu(e);
    },
    onContextMenu(e) {
        const messageGroup = e.target.closest('.'+this._contClass);

        if (e.target.localName != "a" && e.target.localName != "img" && e.target.localName != "video" && !messageGroup && !e.target.className.includes("guildIcon") && !e.target.className.includes("image-")) return;

        let saveLabel = "Download",
            url = e.target.poster || e.target.style.backgroundImage.substring(e.target.style.backgroundImage.indexOf(`"`) + 1, e.target.style.backgroundImage.lastIndexOf(`"`)) || e.target.href || e.target.src;

        if (e.target.className.includes("guildIcon")) saveLabel = "Download Icon";
        else if (e.target.className.includes("image-")) saveLabel = "Download Avatar";


        if (!url || e.target.classList.contains("emote") || url.includes("youtube.com/watch?v=") || url.includes("youtu.be/") || url.lastIndexOf("/") > url.lastIndexOf(".")) return;

        url = url.split("?")[0];

        url = url.replace(".webp", ".png");

        let fileName = url.substring(url.lastIndexOf("/") + 1, url.lastIndexOf("."));
        const fileExtension = url.substr(url.lastIndexOf(".") + 1, url.length);

        if (saveLabel.includes("Avatar") || saveLabel.includes("Icon")) url += "?size=2048";

        if (e.target.classList.contains("emoji")) {
            saveLabel = "Download Emoji";
            fileName = e.target.alt.replace(/[^A-Za-z_-]/g, "");
        }
        //console.log({url, saveLabel, fileName, fileExtension});

        setTimeout(() => addMenuItem(url, saveLabel, fileName, fileExtension), 5);
    },
    unload: function() {
        document.removeEventListener("contextmenu", this.listener);
    }
});
