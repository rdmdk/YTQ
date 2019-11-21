// Bookmarks and Globals
const main = document.getElementById("main");
const video = document.getElementById("video");
const screen = document.getElementById("screen");
const latest = document.getElementById("latest");
const subscriptions = document.getElementById("subscriptions");
const favorites = document.getElementById("favorites");
const all = document.getElementById("all");
const saved = document.getElementById("saved");
const nav = document.getElementById("nav");
const prefs = document.getElementById("preferences");
const win = document.getElementById("window");
const youtubekey = "AIzaSyAfrBvS4cGHrdMcLQYCKqcfKELVCx3qadY";
let channelid = "";

if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) document.querySelector("html").classList.add("mobile");
else document.querySelector("html").classList.add("desktop");

