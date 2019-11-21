// Globals
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

// Functions
	// Subscriptions
		// Get/Update
		function getsubscriptions() {
			if (channelid !== "") {
				if (window.location.hash === "#debug") console.log("Updating subscriptions");
				let url = "https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&channelId=" + channelid + "&maxResults=50&key=" + youtubekey;
				let nexturl = url + "&pageToken=";
				let list = [];
				fetch(url)
				.then((a) => { return a.json() })
				.then((b) => {
					let x = b.nextPageToken;
					b.items.forEach((c) => { list.push(c) });
					let s = setInterval(() => {
						if (x) {
							let d = fetch(nexturl + x)
								.then((e) => { return e.json() })
								.then((f) => {
									x = f.nextPageToken;
									f.items.forEach((g) => list.push(g));
								});
						} else {
							clearInterval(s);
							all.innerHTML = "";
							setTimeout(() => {
								let newlist = [...new Set(list)];
								newlist.sort((a, b) => a.snippet.title.localeCompare(b.snippet.title));
								newlist.forEach((a, i) => {
									setTimeout(function () {
										if (favorites.innerHTML.indexOf(a.snippet.resourceId.channelId) === -1) all.insertAdjacentHTML("beforeend", "<li class='li' data-background><span class='span listing' data-id='" + a.snippet.resourceId.channelId + "'><span class='span image'><img class='img' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' style='background-image:url(" + a.snippet.thumbnails.default.url + ");'></span><span class='span title'>" + a.snippet.title.replace(/\'/gm, "&#39;") + "</span></span><span class='span handles'><span class='span star' data-color=''><i class='fa fa-star' aria-hidden='true'></i></span><span class='span drag' data-color=''><i class='fa fa-bars' aria-hidden='true'></i></span></span></li>");
									}, 10 * i);
								});
							}, 1e3);
							setTimeout(() => localStorage.all = all.innerHTML, 5e3);
						}
					}, 1e3);
				})
				.catch((e) => supernova());
			}
		}

		// Reorder
		function reorderz() {
			let o = video.classList.contains("pin") ? subscriptions.offsetTop - screen.scrollHeight : subscriptions.offsetTop;
			zenscroll.toY(o, 500);
			let a;
			subscriptions.classList.toggle("edit");
			setTimeout(() => {
				a = subscriptions.classList.contains("edit") ? false : true;
				s1.option("disabled", a);
				s2.option("disabled", a);
			}, 100);
			setTimeout(() => {
				if (a) {
					localStorage.favorites = favorites.innerHTML;
					localStorage.all = all.innerHTML;
				}
			}, 200);
		}

	// Videos
		// Get
		function getlatest(a = "search") {
			let subscriptionname = subscriptions.querySelector(".active .title").innerText;
			let subscriptionid = subscriptions.querySelector(".active .listing").getAttribute("data-id");
			let url = "";
			let n = 1;
			if (a === "search") url = "https://www.googleapis.com/youtube/v3/search?&channelId=" + subscriptionid + "&part=snippet,id&order=date&maxResults=16&type=video&key=" + youtubekey;
			else if (a === "upload") url = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet%2C+id&playlistId=" + subscriptionid.replace(/UC/gm, "UU") + "&order=date&maxResults=16&key=" + youtubekey;
			fetch(url)
				.then((a) => { return a.json() })
				.then((b) => {
					latest.querySelector(".videos").innerHTML = "";
					latest.querySelector(".videos").setAttribute("data-page", n);
					latest.querySelector(".youtube .a").setAttribute("href", "https://www.youtube.com/channel/" + subscriptionid);
					if (a === "upload") b.items.sort((a, b) => new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt));
					b.items.forEach((c) => {
						let vid = a === "upload" ? c.snippet.resourceId.videoId : c.id.videoId;
						latest.querySelector(".videos").insertAdjacentHTML("beforeend", "<li class='li' title='" + c.snippet.title.replace(/\'/gm, "&#39;") + " - " + new Date(c.snippet.publishedAt).getDate() + " " + new Date(c.snippet.publishedAt).toLocaleString("en-us", { month: "short" }) + " " + new Date(c.snippet.publishedAt).getFullYear() + "' data-background><span class='span listing' data-id='" + vid + "' data-date='" + new Date(c.snippet.publishedAt).getDate() + " " + new Date(c.snippet.publishedAt).toLocaleString("en-us", { month: "short" }) + " " + new Date(c.snippet.publishedAt).getFullYear() + "' data-channel='" + c.snippet.channelTitle.replace(/\'/gm, "&#39;") + "' data-channel-id='" + c.snippet.channelId + "'><span class='span image'><img class='img' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' style='background-image:url(" + c.snippet.thumbnails.medium.url + "'></span><span class='span title'>" + c.snippet.title.replace(/\'/gm, "&#39;") + "</span></span><span class='save' title='Save' data-color><i class='fa fa-plus'></i></span></li>");
					});
					setactive();
				})
				.catch((e) => console.error(e));
		}

		// Load
		function loadvideo() {
			let a = document.querySelector(".videos .playing .listing").getAttribute("data-id");
			let b = window.innerWidth >= window.innerHeight ? "maxresdefault" : "hqdefault";
			document.getElementById("screen").setAttribute("data-id", a);
			document.getElementById("img").style = document.querySelector(".videos .active .listing .image .img").getAttribute("style");
			document.getElementById("hd").style = document.querySelector(".videos .active .listing .image .img").getAttribute("style").replace(/mqdefault/gm, b);
			document.getElementById("hd").style.opacity = null;
			document.getElementById("title").innerText = document.querySelector(".videos .active .listing .title").innerText;
			document.getElementById("channel").innerText = document.querySelector(".videos .active .listing").getAttribute("data-channel");
			document.getElementById("channel").parentNode.setAttribute("href", "https://www.youtube.com/channel/" + document.querySelector(".videos .active .listing").getAttribute("data-channel-id"));
			document.getElementById("date").innerText = document.querySelector(".videos .active .listing").getAttribute("data-date");
			document.getElementById("youtube").querySelector(".a").setAttribute("href", "https://www.youtube.com/channel/" + document.querySelector(".videos .active .listing").getAttribute("data-channel-id"));
			setTimeout(() => { if ((window.scrollY + screen.scrollHeight) <= (latest.offsetTop - 5)) newsize() }, 500);
			setTimeout(() => document.getElementById("hd").style.opacity = 1, 1e3);
		}
		
		// Play
		function playvideo(a = document.querySelector(".videos .playing .listing").getAttribute("data-id")) {
			if (video.querySelector(".screen iframe")) {
				let b = video.querySelector(".screen iframe");
				b.parentNode.removeChild(b);
			} else {
				video.querySelector(".screen .inner").insertAdjacentHTML("afterbegin", "<div id='x'></div>");
				new YT.Player("x", {
					videoId: a,
					playerVars: {
						autoplay: 1,
						modestbranding: 1,
						rel: 0,
						playsinline: 1,
						iv_load_policy: 3,
						origin: "https://www.youtube.com"
					},
					events: {
						"onStateChange": onPlayerStateChange
					}
				});
			}
		}

		// Autoplay
			// On video end
			function onPlayerStateChange(event) {
				if (event.data === 0) {
					let a = video.querySelector(".screen iframe");
					fadeOut(a);
					setTimeout(() => a.parentNode.removeChild(a), 1e3);
					setTimeout(() => {
						if (document.querySelector(".autoplay").classList.contains("on") && document.querySelector(".videos .playing").nextElementSibling) {
							let b;
							if (document.querySelector(".videos .playing").closest(".latest")) b = document.getElementById("latest");
							else if (document.querySelector(".videos .playing").closest(".saved")) b = document.getElementById("saved");
							let c = b.querySelector(".videos .playing").nextElementSibling;
							let d = [...c.parentNode.children].indexOf(c);
							let e = parseInt(latest.querySelector(".videos").getAttribute("data-page"));
							b.querySelector(".videos .playing").className = "li";
							c.classList = "li active playing";
							if (c.closest("#latest") && ((d === 12 && e === 3) || (d === 8 && e === 2) || (d === 4 && e === 1))) latest.querySelector(".more").click();
							setTimeout(() => loadvideo(), 500);
							setTimeout(() => playvideo(document.querySelector(".videos .playing .listing").getAttribute("data-id")), 1500);
						}
					}, 2e3);
				}
			}

			// Enabling
			function enableautoplay() {
				document.querySelectorAll(".autoplay").forEach((a) => {
					if (localStorage.autoplay) a.classList = "li autoplay " + localStorage.autoplay;
				});

				if (latest.querySelectorAll(".videos .li").length > 1) latest.querySelector(".autoplay").style.display = null;
				else latest.querySelector(".autoplay").style.display = "none";

				if (saved.querySelectorAll(".videos .li").length > 1) saved.querySelector(".autoplay").style.display = null;
				else saved.querySelector(".autoplay").style.display = "none";
			}

		// Set active
		function setactive() {
			setTimeout(() => {
				document.querySelectorAll(".videos .listing").forEach((a) => {
					if (a.getAttribute("data-id") === screen.getAttribute("data-id")) {
						if (!a.closest(".li").classList.contains("active")) {
							if (!document.querySelector(".playing")) a.closest(".li").classList = "li active playing";
							else a.closest(".li").classList = "li active";
						}
					} else a.closest(".li").classList = "li";
				});
			});
		}

	// Import/export
	function updateoptions() {
		options.forEach((a) => {
			let b = a.classList[1];
			if (!localStorage.getItem(b)) a.classList.add("hide");
			else a.classList.remove("hide");
		});
	}
	function importingexporting(a) {
		let b = win.getAttribute("data-page");
		let c = "IDs or URLs";
		let d = "Bundle code will appear here";
		let t = 500;
		if ((b !== a)) {
			fadeOut(win, t);
			setTimeout(() => {
				win.setAttribute("data-page", a);
				options.forEach((a) => a.classList.remove("active"));
				document.getElementById("input").value = "";
				document.getElementById("input").placeholder = a === "new" ? "" : "import" ? c : d;
				fadeIn(win, t);
			}, 1000);
		} else {
			document.getElementById("input").placeholder = a === "new" ? "" : "import" ? c : d;
			fadeToggle(win, t);
		}
		updateoptions();
	}
	function importurls(a) {
		let list = [];
		let newlist = [];
		let b = a.split(",");
		b.forEach((c) => {
			let y;
			if (c.includes("&list=WL")) y = c.replace(/.*?\?v=|&list=WL.*?$/gm, "");
			else if (c.includes("&list")) y = c.replace(/.*?&list=|\&.*?$/gm, "");
			else if (c.includes("&")) y = c.replace(/\&.*?$/gm, "");
			else y = c.replace(/.*?=|.*?\//gm, "");
			if (!saved.querySelector(".videos").innerHTML.includes(y)) {
				if (y.startsWith("PL")) {
					let url = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet%2C+id&playlistId=" + y + "&maxResults=50&key=" + youtubekey;
					fetch(url)
						.then((a) => { return a.json() })
						.then((b) => {
							let x = b.nextPageToken;
							let nexturl = url + "&pageToken=";
							if (!localStorage.playlists) localStorage.playlists = y;
							else if (!localStorage.playlists.includes(y)) localStorage.playlists += "," + y;
							if (window.location.hash === "#debug") {
								console.log("Items:");
								console.log(b.items);
							}
							b.items.forEach((c) => { if (!saved.querySelector(".videos").innerHTML.includes(c.snippet.resourceId.videoId)) list.push(c) });
							let s = setInterval(() => {
								if (x) {
									let d = fetch(nexturl + x)
										.then((e) => { return e.json() })
										.then((f) => {
											x = f.nextPageToken;
											f.items.forEach((g) => { if (!saved.querySelector(".videos").innerHTML.includes(g.snippet.resourceId.videoId)) list.push(g) });
										});
								} else {
									clearInterval(s);
									newlist = [...new Set(list)];
									if (window.location.hash === "#debug") {
										console.log("List:");
										console.log(list);
										console.log("New list:");
										console.log(newlist);
									}
									setTimeout(() => {
										newlist.forEach((a, i) => {
											setTimeout(function () {
												if (!saved.querySelector(".videos").innerHTML.includes(a.snippet.resourceId.videoId)) {
													let url = "https://www.googleapis.com/youtube/v3/videos?part=snippet%2C+id&id=" + a.snippet.resourceId.videoId + "&key=" + youtubekey;
													fetch(url)
														.then((a) => { return a.json() })
														.then((b) => {
															b.items.forEach((c) => { if (!saved.querySelector(".videos").innerHTML.includes(c.id)) saved.querySelector(".videos").insertAdjacentHTML("beforeend", "<li class='li' title='" + c.snippet.title.replace(/\'/gm, "&#39;") + " - " + new Date(c.snippet.publishedAt).getDate() + " " + new Date(c.snippet.publishedAt).toLocaleString("en-us", { month: "short" }) + " " + new Date(c.snippet.publishedAt).getFullYear() + "' data-background><span class='span listing' data-id='" + c.id + "' data-date='" + new Date(c.snippet.publishedAt).getDate() + " " + new Date(c.snippet.publishedAt).toLocaleString("en-us", { month: "short" }) + " " + new Date(c.snippet.publishedAt).getFullYear() + "' data-channel='" + c.snippet.channelTitle.replace(/\'/gm, "&#39;") + "' data-channel-id='" + c.snippet.channelId + "'><span class='span image'><img class='img' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' style='background-image:url(" + c.snippet.thumbnails.medium.url + "'></span><span class='span title'>" + c.snippet.title.replace(/\'/gm, "&#39;") + "</span></span><span class='save' title='Save' data-color><i class='fa fa-plus'></i></span></li>") });
														})
														.catch((e) => console.error(e));
												}
											}, 10 * i);
										});
										if (localStorage.playlists && localStorage.playlists !== "") saved.querySelector(".sync").style.display = null;
										else saved.querySelector(".sync").style.display = "none";
										setTimeout(() => enableautoplay(), 500);
									}, 1e3);
								}
							}, 1e3);
						})
						.catch((e) => console.error(e));

				} else {
					let url = "https://www.googleapis.com/youtube/v3/videos?part=snippet%2C+id&id=" + y + "&key=" + youtubekey;
					fetch(url)
						.then((a) => { return a.json() })
						.then((b) => {
							if (window.location.hash === "#debug") {
								console.log("Items:");
								console.log(b.items);
							}
							b.items.forEach((c) => { if (!saved.querySelector(".videos").innerHTML.includes(c.id)) saved.querySelector(".videos").insertAdjacentHTML("beforeend", "<li class='li' title='" + c.snippet.title.replace(/\'/gm, "&#39;") + " - " + new Date(c.snippet.publishedAt).getDate() + " " + new Date(c.snippet.publishedAt).toLocaleString("en-us", { month: "short" }) + " " + new Date(c.snippet.publishedAt).getFullYear() + "' data-background><span class='span listing' data-id='" + c.id + "' data-date='" + new Date(c.snippet.publishedAt).getDate() + " " + new Date(c.snippet.publishedAt).toLocaleString("en-us", { month: "short" }) + " " + new Date(c.snippet.publishedAt).getFullYear() + "' data-channel='" + c.snippet.channelTitle.replace(/\'/gm, "&#39;") + "' data-channel-id='" + c.snippet.channelId + "'><span class='span image'><img class='img' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' style='background-image:url(" + c.snippet.thumbnails.medium.url + "'></span><span class='span title'>" + c.snippet.title.replace(/\'/gm, "&#39;") + "</span></span><span class='save' title='Save' data-color><i class='fa fa-plus'></i></span></li>") });
						})
						.catch((e) => console.error(e));
				}
			}
		});
		setTimeout(() => { localStorage.saved = saved.querySelector(".videos").innerHTML }, 4e3);
	}

	// Navigation
		// Exit
		function exitnav(a) {
			setTimeout(() => fadeOut(win), a);
			setTimeout(() => toggle.click(), 1000 + a);
			setTimeout(() => document.getElementById("input").value = "", 2000 + a);
		}

	// Pinning
	function pinz() {
		nav.querySelector(".pin .span").classList.toggle("p");
		localStorage.pin = nav.querySelector(".pin .span").classList.contains("p") ? "pin" : "";
		pinned();
	}
	function pinned() {
		if (localStorage.pin === "pin") {
			nav.querySelector(".pin .span").classList.add("p");
			if ((window.innerWidth > window.innerHeight) && (window.scrollY > (screen.offsetTop + screen.scrollHeight))) video.classList.add("pin");
			else if (window.innerWidth <= window.innerHeight) video.classList.add("pin");
			else video.classList.remove("pin");
		} else video.classList.remove("pin");
	}

	// Theme
	function themez(e) {
		let a, b;
		if (e.shiftKey) {
			font();
			setTimeout(() => newsize(), 1e3);
		} else {
			let bc = document.body.classList;
			a = bc.contains("a") ? "a" : bc.contains("b") ? "b" : bc.contains("c") ? "c" : bc.contains("d") ? "d" : bc.contains("e") ? "e" : bc.contains("f") ? "f" : bc.contains("g") ? "g" : bc.contains("h") ? "h" : bc.contains("i") ? "i" : bc.contains("j") ? "j" : bc.contains("k") ? "k" : bc.contains("l") ? "l" : bc.contains("m") ? "m" : bc.contains("n") ? "n" : bc.contains("o") ? "o" : bc.contains("p") ? "p" : bc.contains("q") ? "q" : bc.contains("r") ? "r" : bc.contains("s") ? "s" : bc.contains("aa") ? "aa" : "bb";
			b = bc.contains("a") ? "b" : bc.contains("b") ? "c" : bc.contains("c") ? "d" : bc.contains("d") ? "e" : bc.contains("e") ? "f" : bc.contains("f") ? "g" : bc.contains("g") ? "h" : bc.contains("h") ? "i" : bc.contains("i") ? "j" : bc.contains("j") ? "k" : bc.contains("k") ? "l" : bc.contains("l") ? "m" : bc.contains("m") ? "n" : bc.contains("n") ? "o" : bc.contains("o") ? "p" : bc.contains("p") ? "q" : bc.contains("q") ? "r" : bc.contains("r") ? "s" : bc.contains("s") ? "aa" : bc.contains("aa") ? "bb" : "a";
			document.body.classList.remove(a);
			document.body.classList.add(b);
			localStorage.theme = b;
		}
	}

	// Recall theme
	function recalltheme() {
		var x = localStorage.mode ? localStorage.mode : "day";
		var y = localStorage.theme ? localStorage.theme : "aa";
		document.body.classList = "body " + x + " " + y;
		if (localStorage.font) document.body.classList.add(localStorage.font);
	}
	
	// Font change
	function font() {
		let a = localStorage.font ? localStorage.font : "prox", b = "";
		if (a === "prox") b = "helv";
		else if (a === "helv") b = "prox";
		document.body.classList.remove(a);
		document.body.classList.add(b);
		localStorage.font = b;
	}

	// Night mode
	function modez() {
		let a, b;
		if (document.body.classList.contains("day")) a = "day", b = "night";
		else a = "night", b = "day";
		document.body.classList.remove(a);
		document.body.classList.add(b);
		localStorage.mode = b;
	}

	// Resizing
	function newsize() {
		let a = document.querySelector("#info .h1").scrollHeight;
		let b = document.querySelector("#info .channel").scrollHeight >= document.querySelector("#info .date").scrollHeight ? document.querySelector("#info .channel").scrollHeight : document.querySelector("#info .date").scrollHeight;
		document.getElementById("info").style.height = a + b + "px";
	}

	// Reset
	function supernova() {
		localStorage.clear();
		setTimeout(() => toggle.click(), 1e3);
		setTimeout(() => fadeOut(nav), 2e3);
		setTimeout(() => fadeOut(main), 3e3);
		setTimeout(() => window.location.reload(true), 4e3);
	}

// Dynamic Content Interaction
	document.body.addEventListener("click", (e) => {
		let a = e.target;
		if (a.localName === "li") {
			if (a.closest(".videos")) {
				if (a.classList.contains("active")) {
					if (a.classList.contains("playing")) return false;
					else if (document.querySelector(".playing")) {
						document.querySelector(".playing").classList.remove("playing");
						a.classList.add("playing");
					}
				} else {
					if (video.querySelector(".screen iframe")) {
						if (window.confirm("Stop current video?")) {
							let b = video.querySelector(".screen iframe");
							b.parentNode.removeChild(b);
							if (document.querySelector(".videos .active")) document.querySelectorAll(".videos .active").forEach((a) => a.classList = "li");
							a.classList = "li active playing";
							loadvideo();
							setTimeout(() => setactive(), 10);
						} else return false;
					} else {
						if (document.querySelector(".videos .active")) document.querySelectorAll(".videos .active").forEach((a) => a.classList = "li");
						a.classList = "li active playing";
						loadvideo();
						setTimeout(() => setactive(), 10);
						if (video.scrollHeight === 0) {
							slideDown(video);
							setTimeout(() => { if (localStorage.pin && localStorage.pin === "pin" && (window.innerHeight > window.innerWidth)) video.classList.add("pin") }, 500);
						}
					}
					if (!video.classList.contains("pin")) zenscroll.toY(0, 500);
				}
			} else if (a.closest(".channels") && !subscriptions.classList.contains("edit")) {
				if (a.classList.contains("active")) return false;
				if (document.querySelector(".channels .active")) document.querySelector(".channels .active").classList = "li";
				a.classList.add("active");
				getlatest("upload");
				setTimeout(() => {
					if (latest.querySelector(".videos").scrollHeight === 0) latest.querySelector(".h2 .title").click();
					if (window.innerHeight > window.innerWidth) {
						let o = video.classList.contains("pin") ? latest.offsetTop - screen.scrollHeight : latest.offsetTop;
						zenscroll.toY(o, 500);
					}
				}, 250);
				setTimeout(() => enableautoplay(), 750);
			}
		} else if (a.localName === "span") {
			if (a.classList.contains("save")) {
				if (a.closest(".latest")) {
					if (saved.querySelector(".videos").innerHTML.includes(a.previousElementSibling.getAttribute("data-id"))) return false;
					a.title = "Remove";
					saved.querySelector(".videos").insertAdjacentHTML("beforeend", a.closest(".li").outerHTML);
					setTimeout(() => a.title = "Save");
				} else {
					let b = a.closest(".li");
					b.parentNode.removeChild(b);
				}
				enableautoplay();
				setTimeout(() => localStorage.saved = saved.querySelector(".videos").innerHTML, 500);

			} else if (a.classList.contains("star")) {
				let b = a.closest(".li");
				let c = a.closest(".favorites") ? all : favorites;
				c.insertAdjacentHTML("beforeend", b.outerHTML);
				b.parentNode.removeChild(b);
			}
			setactive();
		}
	});

// Misc
	// Sort
	var s1 = Sortable.create(favorites, { group: ".channels", handle: ".drag", disabled: true });
	var s2 = Sortable.create(all, { group: ".channels", handle: ".drag", disabled: true });

	// Mobile/Desktop class
	if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) document.querySelector("html").classList.add("mobile");
	else document.querySelector("html").classList.add("desktop");

// New Users
if (!localStorage.id && !localStorage.all) {
    main.insertAdjacentHTML("beforeend", "<h2 id='new' class='h2 new wait' data-color><span class='span'>New here?</span></h2>");
    document.body.addEventListener("click", (e) => {
        if (e.target.id === "new") {
            document.getElementById("toggle").click();
            importingexporting("new");
            setTimeout(() => e.target.style.display = "none", 1e3);
        }
    });
    setTimeout(() => document.getElementById("new").classList.remove("wait"), 2e3);
}
