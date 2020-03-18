// Bookmarks and Globals
const main = document.getElementById('main');
const video = document.getElementById('video');
const screen = document.getElementById('screen');
const latest = document.getElementById('latest');
const subscriptions = document.getElementById('subscriptions');
const favorites = document.getElementById('favorites');
const all = document.getElementById('all');
const saved = document.getElementById('saved');
const nav = document.getElementById('nav');
const sync = document.getElementById('sync');
const win = document.getElementById('window');
const youtubekey = 'AIzaSyAfrBvS4cGHrdMcLQYCKqcfKELVCx3qadY';
let channelid = '';

if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) document.querySelector('html').classList.add('mobile');
else document.querySelector('html').classList.add('desktop');

// New Users
if (!localStorage.id && !localStorage.all) {
    main.insertAdjacentHTML('beforeend', '<h2 id="new" class="h2 new wait" data-color><span class="span">New here?</span></h2>');
    document.body.addEventListener('click', (e) => {
        if (e.target.id === 'new') {
            document.getElementById('toggle').click();
            importingexporting('new');
            setTimeout(() => e.target.style.display = 'none', 1e3);
        }
    });
    setTimeout(() => document.getElementById('new').classList.remove('wait'), 2e3);
}

// News
if (!localStorage.news && !sessionStorage.news) {
    if (localStorage.id) {
        main.insertAdjacentHTML('beforeend', '<h2 id="news" class="h2 new wait" title="Check out the lite version of YTQ!" data-color><span class="span">Check out YTL!</span></h2>');
        document.body.addEventListener('click', (e) => {
            if (e.target.id === 'news') {
                localStorage.news = 'Seen it';
                window.location = '/ytl';
            }
        });
        setTimeout(() => document.getElementById('news').classList.remove('wait'), 2e3);
    }
}

// Populate Sections on Load
if (localStorage.id) channelid = localStorage.id;
if (localStorage.favorites) favorites.innerHTML = localStorage.favorites;
if (localStorage.all) all.innerHTML = localStorage.all;
if (localStorage.saved) saved.querySelector('.videos').innerHTML = localStorage.saved;

// Supernova Reset
function supernova() {
    localStorage.clear();
    setTimeout(() => toggle.click(), 1e3);
    setTimeout(() => fadeOut(nav), 2e3);
    setTimeout(() => fadeOut(main), 3e3);
    setTimeout(() => window.location.reload(true), 4e3);
}

var touch;
nav.querySelector('.mode').addEventListener('touchstart', () => {
    touch = setTimeout(() => supernova(), 4e3); 
}, false);
nav.querySelector('.mode').addEventListener('touchend', () => clearTimeout(touch), false);

// Subscriptions
/// Get/Update
function getsubscriptions() {
    if (channelid !== '') {
        if (window.location.hash === '#debug') console.log('Updating subscriptions');
        let url = 'https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&channelId=' + channelid + '&maxResults=50&key=' + youtubekey;
        let nexturl = url + '&pageToken=';
        let list = [];

        fetch(url)
            .then((a) => { return a.json(); })
            .then((b) => {
                let x = b.nextPageToken;
                b.items.forEach(c => { list.push(c); });
                let s = setInterval(() => {
                    if (x) {
                        fetch(nexturl + x)
                        .then((e) => { return e.json(); })
                        .then((f) => {
                            x = f.nextPageToken;
                            f.items.forEach(g => list.push(g));
                        });
                    } else {
                        clearInterval(s);
                        all.innerHTML = '';
                        setTimeout(() => {
                            let newlist = [...new Set(list)];
                            newlist.sort((a, b) => a.snippet.title.localeCompare(b.snippet.title));
                            newlist.forEach((a, i) => {
                                setTimeout(function () {
                                    if (favorites.innerHTML.indexOf(a.snippet.resourceId.channelId) === -1) all.insertAdjacentHTML('beforeend', '<li class="li" data-background><span class="span listing" data-id="' + a.snippet.resourceId.channelId + '"><span class="span image"><img class="img" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="background-image:url(' + a.snippet.thumbnails.default.url + ')"></span><span class="span title">' + a.snippet.title.replace(/\'/gm, '&#39;') + '</span></span><span class="span handles"><span class="span star" data-color=""><i class="fa fa-star" aria-hidden="true"></i></span><span class="span drag" data-color=""><i class="fa fa-bars" aria-hidden="true"></i></span></span></li>');
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
/// Sort
var s1 = Sortable.create(favorites, { group: '.channels', handle: '.drag', disabled: true });
var s2 = Sortable.create(all, { group: '.channels', handle: '.drag', disabled: true });

function reorderz() {
    let o = video.classList.contains('pin') ? subscriptions.offsetTop - screen.scrollHeight : subscriptions.offsetTop;
    zenscroll.toY(o, 500);
    let a;
    subscriptions.classList.toggle('edit');
    setTimeout(() => {
        a = subscriptions.classList.contains('edit') ? false : true;
        s1.option('disabled', a);
        s2.option('disabled', a);
    }, 100);
    setTimeout(() => {
        if (a) {
            localStorage.favorites = favorites.innerHTML;
            localStorage.all = all.innerHTML;
        }
    }, 200);
}

/// Auto-Update
if (localStorage.favorites || localStorage.all) {
    if (new Date().getDay() % 2) {
        // Monday, Wednesday, Friday
        if (!localStorage.recent) {
            getsubscriptions();
            localStorage.recent = 'recent';
        }
    } else if (localStorage.recent) localStorage.removeItem('recent');
} else {
    getsubscriptions();
    localStorage.recent = 'recent';
}

document.querySelectorAll('.active').forEach(a => a.classList = 'li');

// Videos
/// Get
function getlatest(a = 'search') {
    let subscriptionid = subscriptions.querySelector('.active .listing').getAttribute('data-id');
    let url = '';
    let n = 1;
    if (a === 'search') url = 'https://www.googleapis.com/youtube/v3/search?&channelId=' + subscriptionid + '&part=snippet,id&order=date&maxResults=16&type=video&key=' + youtubekey;
    else if (a === 'upload') url = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet%2C+id&playlistId=' + subscriptionid.replace(/UC/gm, 'UU') + '&order=date&maxResults=16&key=' + youtubekey;
    fetch(url)
        .then((a) => { return a.json(); })
        .then((b) => {
            latest.querySelector('.videos').innerHTML = '';
            latest.querySelector('.videos').setAttribute('data-page', n);
            latest.querySelector('.youtube .a').setAttribute('href', 'https://www.youtube.com/channel/' + subscriptionid);
            if (a === 'upload') b.items.sort((a, b) => new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt));
            b.items.forEach(c => {
                let vid = a === 'upload' ? c.snippet.resourceId.videoId : c.id.videoId;
                latest.querySelector('.videos').insertAdjacentHTML('beforeend', '<li class="li" title="' + c.snippet.title.replace(/\'/gm, '&#39;') + ' - ' + new Date(c.snippet.publishedAt).getDate() + ' ' + new Date(c.snippet.publishedAt).toLocaleString('en-us', { month: 'short' }) + ' ' + new Date(c.snippet.publishedAt).getFullYear() + '" data-background><span class="span listing" data-id="' + vid + '" data-date="' + new Date(c.snippet.publishedAt).getDate() + ' ' + new Date(c.snippet.publishedAt).toLocaleString('en-us', { month: 'short' }) + ' ' + new Date(c.snippet.publishedAt).getFullYear() + '" data-channel="' + c.snippet.channelTitle.replace(/\'/gm, '&#39;') + '" data-channel-id="' + c.snippet.channelId + '"><span class="span image"><img class="img" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="background-image:url(' + c.snippet.thumbnails.medium.url + ')"></span><span class="span title">' + c.snippet.title.replace(/\'/gm, '&#39;') + '</span></span><span class="save" title="Save" data-color><i class="fa fa-plus"></i></span></li>');
            });
            setactive();
        })
        .catch((e) => console.error(e));
}

/// Load, Play
function loadvideo() {
    let a = document.querySelector('.videos .playing .listing').getAttribute('data-id');
    let b = window.innerWidth >= window.innerHeight ? 'maxresdefault' : 'hqdefault';
    let hd = document.getElementById('hd'), channel = document.getElementById('channel');
    screen.setAttribute('data-id', a);
    document.getElementById('img').style = document.querySelector('.videos .active .listing .image .img').getAttribute('style');
    hd.style = document.querySelector('.videos .active .listing .image .img').getAttribute('style').replace(/mqdefault/gm, b);
    hd.style.opacity = null;
    document.getElementById('title').innerText = document.querySelector('.videos .active .listing .title').innerText;
    channel.innerText = document.querySelector('.videos .active .listing').getAttribute('data-channel');
    channel.parentNode.setAttribute('href', 'https://www.youtube.com/channel/' + document.querySelector('.videos .active .listing').getAttribute('data-channel-id'));
    document.getElementById('date').innerText = document.querySelector('.videos .active .listing').getAttribute('data-date');
    document.getElementById('youtube').querySelector('.a').setAttribute('href', 'https://www.youtube.com/channel/' + document.querySelector('.videos .active .listing').getAttribute('data-channel-id'));
    setTimeout(() => {
        if ((window.scrollY + screen.scrollHeight) <= (latest.offsetTop - 5)) newsize();
    }, 500);
    setTimeout(() => hd.style.opacity = 1, 1e3);
}
screen.addEventListener('click', () => playvideo(document.querySelector('.videos .playing .listing').getAttribute('data-id')));

function playvideo(a = document.querySelector('.videos .playing .listing').getAttribute('data-id')) {
    if (screen.querySelector('iframe')) {
        let b = screen.querySelector('iframe');
        b.parentNode.removeChild(b);
    } else {
        screen.querySelector('.inner').insertAdjacentHTML('afterbegin', '<div id="x"></div>');
        new YT.Player('x', {
            videoId: a,
            playerVars: {
                autoplay: 1,
                modestbranding: 1,
                rel: 0,
                playsinline: 1,
                iv_load_policy: 3,
                origin: 'https://www.youtube.com'
            },
            events: {
                'onStateChange': onPlayerStateChange
            }
        });
    }
}

///  Autoplay
function onPlayerStateChange(event) {
    if (event.data === 0) {
        let a = screen.querySelector('iframe');
        fadeOut(a);
        setTimeout(() => a.parentNode.removeChild(a), 1e3);
        var si = setTimeout(() => {
            if (document.querySelector('.autoplay').classList.contains('on') && document.querySelector('.videos .playing').nextElementSibling) {
                let b = document.querySelector('.videos .playing').closest('.latest') ? latest : document.querySelector('.videos .playing').closest('.saved') ? saved : '';
                let c = b.querySelector('.videos .playing').nextElementSibling;
                let d = [...c.parentNode.children].indexOf(c);
                let e = parseInt(latest.querySelector('.videos').getAttribute('data-page'));
                b.querySelector('.videos .playing').className = 'li';
                c.classList = 'li active playing';
                if (c.closest('#latest') && ((d === 12 && e === 3) || (d === 8 && e === 2) || (d === 4 && e === 1))) latest.querySelector('.more').click();
                setTimeout(() => loadvideo(), 500);
                setTimeout(() => playvideo(document.querySelector('.videos .playing .listing').getAttribute('data-id')), 1500);
            }
        }, 2e3);
        document.querySelectorAll('.videos li').forEach(v => {
            v.addEventListener('click', () => clearTimeout(si));
        });
    }
}

function enableautoplay() {
    document.querySelectorAll('.autoplay').forEach(a => {
        if (localStorage.autoplay) a.classList = 'li autoplay ' + localStorage.autoplay;
    });

    if (latest.querySelectorAll('.videos .li').length > 1) latest.querySelector('.autoplay').style.display = null;
    else latest.querySelector('.autoplay').style.display = 'none';

    if (saved.querySelectorAll('.videos .li').length > 1) saved.querySelector('.autoplay').style.display = null;
    else saved.querySelector('.autoplay').style.display = 'none';
}

document.querySelectorAll('.autoplay').forEach(a => {
    let classes = a.classList;
    a.addEventListener('click', () => {
        let b = classes.contains('off') ? 'on' : 'off';
        classes = 'li autoplay ' + b;
        localStorage.autoplay = b;
        enableautoplay();
    });
});


if (localStorage.autoplay) {
    latest.querySelector('.autoplay').classList = 'li autoplay ' + localStorage.autoplay;
    saved.querySelector('.autoplay').classList = 'li autoplay ' + localStorage.autoplay;
}

/// Active video
function setactive() {
    setTimeout(() => {
        document.querySelectorAll('.videos .listing').forEach(a => {
            let classes = a.closest('.li').classList;
            if (a.getAttribute('data-id') === screen.getAttribute('data-id')) {
                if (!classes.contains('active')) {
                    if (!document.querySelector('.playing')) classes = 'li active playing';
                    else classes = 'li active';
                }
            } else classes = 'li';
        });
    });
}

// Importing, Exporting
const options = document.querySelectorAll('#options .li');

function updateoptions() {
    options.forEach(a => {
        let classes = a.classList;
        if (!localStorage.getItem(classes[1])) classes.add('hide');
        else classes.remove('hide');
    });
}

function importingexporting(a) {
    let b = win.getAttribute('data-page');
    let c = 'IDs or URLs';
    let d = 'Bundle code will appear here';
    let t = 500;
    if ((b !== a)) {
        fadeOut(win, t);
        setTimeout(() => {
            win.setAttribute('data-page', a);
            options.forEach(a => a.classList.remove('active'));
            document.getElementById('input').value = '';
            document.getElementById('input').placeholder = a === 'new' ? '' : 'import' ? c : d;
            fadeIn(win, t);
        }, 1000);
    } else {
        document.getElementById('input').placeholder = a === 'new' ? '' : 'import' ? c : d;
        fadeToggle(win, t);
    }
    updateoptions();
}

function importurls(a) {
    let list = [];
    let newlist = [];
    let b = a.split(',');
    b.forEach(c => {
        let y;
        if (c.includes('&list=WL')) y = c.replace(/.*?\?v=|&list=WL.*?$/gm, '');
        else if (c.includes('&list')) y = c.replace(/.*?&list=|\&.*?$/gm, '');
        else if (c.includes('&')) y = c.replace(/\&.*?$/gm, '');
        else y = c.replace(/.*?=|.*?\//gm, '');
        if (!saved.querySelector('.videos').innerHTML.includes(y)) {
            if (y.startsWith('PL')) {
                let url = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet%2C+id&playlistId=' + y + '&maxResults=50&key=' + youtubekey;
                fetch(url)
                    .then((a) => { return a.json(); })
                    .then((b) => {
                        let x = b.nextPageToken;
                        let nexturl = url + '&pageToken=';
                        if (!localStorage.playlists) localStorage.playlists = y;
                        else if (!localStorage.playlists.includes(y)) localStorage.playlists += ',' + y;
                        if (window.location.hash === '#debug') {
                            console.log('Items:');
                            console.log(b.items);
                        }
                        b.items.forEach(c => { if (!saved.querySelector('.videos').innerHTML.includes(c.snippet.resourceId.videoId)) list.push(c); });
                        let s = setInterval(() => {
                            if (x) {
                                fetch(nexturl + x)
                                .then((e) => { return e.json(); })
                                .then((f) => {
                                    x = f.nextPageToken;
                                    f.items.forEach(g => { if (!saved.querySelector('.videos').innerHTML.includes(g.snippet.resourceId.videoId)) list.push(g); });
                                });
                            } else {
                                clearInterval(s);
                                newlist = [...new Set(list)];
                                if (window.location.hash === '#debug') {
                                    console.log('List:');
                                    console.log(list);
                                    console.log('New list:');
                                    console.log(newlist);
                                }
                                setTimeout(() => {
                                    newlist.forEach((a, i) => {
                                        setTimeout(function () {
                                            if (!saved.querySelector('.videos').innerHTML.includes(a.snippet.resourceId.videoId)) {
                                                let url = 'https://www.googleapis.com/youtube/v3/videos?part=snippet%2C+id&id=" + a.snippet.resourceId.videoId + "&key=' + youtubekey;
                                                fetch(url)
                                                    .then((a) => { return a.json(); })
                                                    .then((b) => {
                                                        b.items.forEach(c => {
                                                            if (!saved.querySelector('.videos').innerHTML.includes(c.id)) saved.querySelector('.videos').insertAdjacentHTML('beforeend', '<li class="li" title="' + c.snippet.title.replace(/\'/gm, '&#39;') + ' - ' + new Date(c.snippet.publishedAt).getDate() + ' ' + new Date(c.snippet.publishedAt).toLocaleString('en-us', { month: 'short' }) + ' ' + new Date(c.snippet.publishedAt).getFullYear() + '" data-background><span class="span listing" data-id="' + c.id + '" data-date="' + new Date(c.snippet.publishedAt).getDate() + ' ' + new Date(c.snippet.publishedAt).toLocaleString('en-us', { month: 'short' }) + ' ' + new Date(c.snippet.publishedAt).getFullYear() + '" data-channel="' + c.snippet.channelTitle.replace(/\'/gm, '&#39;') + '" data-channel-id="' + c.snippet.channelId + '"><span class="span image"><img class="img" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="background-image:url(' + c.snippet.thumbnails.medium.url + '"></span><span class="span title">' + c.snippet.title.replace(/\'/gm, '&#39;') + '</span></span><span class="save" title="Save" data-color><i class="fa fa-plus"></i></span></li>');
                                                        });
                                                    })
                                                    .catch((e) => console.error(e));
                                            }
                                        }, 10 * i);
                                    });
                                    if (localStorage.playlists && localStorage.playlists !== '') sync.style.display = null;
                                    else sync.style.display = 'none';
                                    setTimeout(() => enableautoplay(), 500);
                                }, 1e3);
                            }
                        }, 1e3);
                    })
                    .catch((e) => console.error(e));

            } else {
                let url = 'https://www.googleapis.com/youtube/v3/videos?part=snippet%2C+id&id=" + y + "&key=' + youtubekey;
                fetch(url)
                    .then((a) => { return a.json(); })
                    .then((b) => {
                        if (window.location.hash === '#debug') {
                            console.log('Items:');
                            console.log(b.items);
                        }
                        b.items.forEach(c => {
                            if (!saved.querySelector('.videos').innerHTML.includes(c.id)) saved.querySelector('.videos').insertAdjacentHTML('beforeend', '<li class="li" title="' + c.snippet.title.replace(/\'/gm, '&#39;') + ' - ' + new Date(c.snippet.publishedAt).getDate() + ' ' + new Date(c.snippet.publishedAt).toLocaleString('en-us', { month: 'short' }) + ' ' + new Date(c.snippet.publishedAt).getFullYear() + '" data-background><span class="span listing" data-id="' + c.id + '" data-date="' + new Date(c.snippet.publishedAt).getDate() + ' ' + new Date(c.snippet.publishedAt).toLocaleString('en-us', { month: 'short' }) + ' ' + new Date(c.snippet.publishedAt).getFullYear() + '" data-channel="' + c.snippet.channelTitle.replace(/\'/gm, '&#39;') + '" data-channel-id="' + c.snippet.channelId + '"><span class="span image"><img class="img" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="background-image:url(' + c.snippet.thumbnails.medium.url + ')"></span><span class="span title">' + c.snippet.title.replace(/\'/gm, '&#39;') + '</span></span><span class="save" title="Save" data-color><i class="fa fa-plus"></i></span></li>');
                        });
                    })
                    .catch((e) => console.error(e));
            }
        }
    });
    setTimeout(() => { localStorage.saved = saved.querySelector('.videos').innerHTML; }, 4e3);
}

sync.addEventListener('click', () => {
    let classes = sync.classList;
    if (classes.contains('off')) {
        classes = 'li sync on';
        localStorage.synced = 'on';
    } else {
        classes = 'li sync off';
        localStorage.synced = 'off';
        localStorage.playlists = '';
    }
});

if (localStorage.playlists) {
    if (localStorage.synced && localStorage.synced === 'on') sync.classList = 'li sync on';
    else sync.classList = 'li sync off';
} else sync.style.display = 'none';

function importbundle(a) {
    let bundleid, bundlefavorites, bundleall, bundlesaved, bundleplaylists, bundletheme, bundletime, bundlepin;
    if (a.indexOf('##id##') > -1) bundleid = /##id##(.*?)(?=##|$)/gm.exec(a);
    if (a.indexOf('##favorites##') > -1) bundlefavorites = /##favorites##(.*?)(?=##|$)/gm.exec(a);
    if (a.indexOf('##all##') > -1) bundleall = /##all##(.*?)(?=##|$)/gm.exec(a);
    if (a.indexOf('##saved##') > -1) bundlesaved = /##saved##(.*?)(?=##|$)/gm.exec(a);
    if (a.indexOf('##playlists##') > -1) bundleplaylists = /##playlists##(.*?)(?=##|$)/gm.exec(a);
    if (a.indexOf('##theme##') > -1) bundletheme = /##theme##(.*?)(?=##|$)/gm.exec(a);
    if (a.indexOf('##mode##') > -1) bundletime = /##time##(.*?)(?=##|$)/gm.exec(a);
    if (a.indexOf('##pin##') > -1) bundlepin = /##pin##(.*?)(?=##|$)/gm.exec(a);
    setTimeout(() => {
        if (bundleid && (bundleid[1] !== '' && bundleid[1] !== undefined)) localStorage.id = bundleid[1];
        if (bundlefavorites && (bundlefavorites[1] !== '' && bundlefavorites[1] !== undefined)) localStorage.favorites = bundlefavorites[1];
        if (bundleall && (bundleall[1] !== '' && bundleall[1] !== undefined)) localStorage.all = bundleall[1];
        if (bundlesaved && (bundlesaved[1] !== '' && bundlesaved[1] !== undefined)) localStorage.saved = bundlesaved[1];
        if (bundleplaylists && (bundleplaylists[1] !== '' && bundleplaylists[1] !== undefined)) localStorage.playlists = bundleplaylists[1];
        if (bundletheme && (bundletheme[1] !== '' && bundletheme[1] !== undefined)) localStorage.theme = bundletheme[1];
        if (bundletime && (bundletime[1] !== '' && bundletime[1] !== undefined)) localStorage.mode = bundletime[1];
        if (bundlepin && (bundlepin[1] !== '' && bundlepin[1] !== undefined)) localStorage.pin = bundlepin[1];
    }, 500);
}

options.forEach(a => {
    a.addEventListener('click', () => {
        a.classList.toggle('active');
        setTimeout(() => {
            let b = '';
            if (document.querySelector('#options .id').classList.contains('active')) b += '##id##' + localStorage.id;
            if (document.querySelector('#options .favorites').classList.contains('active')) b += '##favorites##' + localStorage.favorites;
            if (document.querySelector('#options .all').classList.contains('active')) b += '##all##' + localStorage.all;
            if (document.querySelector('#options .saved').classList.contains('active')) b += '##saved##' + localStorage.saved;
            if (document.querySelector('#options .playlists').classList.contains('active')) b += '##playlists##' + localStorage.playlists;
            if (document.querySelector('#options .theme').classList.contains('active')) b += '##theme##' + localStorage.theme;
            if (document.querySelector('#options .mode').classList.contains('active')) b += '##mode##' + localStorage.mode;
            if (document.querySelector('#options .pin').classList.contains('active')) b += '##pin##' + localStorage.pin;
            document.getElementById('input').value = b;
        }, 10);
    });
});
document.getElementById('input').addEventListener('click', () => { if (win.getAttribute('data-page') === 'export') document.getElementById('input').select(); });

function exitnav(a) {
    setTimeout(() => fadeOut(win), a);
    setTimeout(() => toggle.click(), 1000 + a);
    setTimeout(() => document.getElementById('input').value = '', 2000 + a);
}

document.getElementById('button').addEventListener('click', () => {
    let a = document.getElementById('input').value;
    if (a !== '') {
        if (win.getAttribute('data-page') === 'new') {
            if (a.startsWith('http')) importurls(a);
            else if (a.startsWith('##')) importbundle(a);
            else {
                if (a === 'redmond') localStorage.id = 'UCqMnpO2ok_usDfeoTm36EGA';
                else if (a === 'victoria') localStorage.id = 'UCHPVh0gqxn5IO3geNxI6uxQ';
                else if (a === 'charlie') localStorage.id = 'UCb2CJSF7SNz55COAHQ3-dBQ';
                else localStorage.id = a;
            }
            exitnav(1000);
            setTimeout(() => fadeOut(nav), 3e3);
            setTimeout(() => fadeOut(main), 4e3);
            setTimeout(() => window.location.reload(), 5e3);
        }
        else if (win.getAttribute('data-page') === 'import') {
            importurls(a);
            exitnav(1000);
        }
    }
});

document.getElementById('exit').addEventListener('click', () => exitnav());

// Pinning
function pinz() {
    nav.querySelector('.pin .span').classList.toggle('p');
    localStorage.pin = nav.querySelector('.pin .span').classList.contains('p') ? 'pin' : '';
    pinned();
}

function pinned() {
    let classes = video.classList;
    if (localStorage.pin === 'pin') {
        nav.querySelector('.pin .span').classList.add('p');
        if ((window.innerWidth > window.innerHeight) && (window.scrollY > (screen.offsetTop + screen.scrollHeight))) classes.add('pin');
        else if (window.innerWidth <= window.innerHeight) classes.add('pin');
        else classes.remove('pin');
    } else classes.remove('pin');
}

pinned();
window.addEventListener('scroll', () => pinned());
window.addEventListener('resize', () => pinned());

// Nav
document.getElementById('toggle').addEventListener('click', () => {
    let a = win.scrollHeight > 0 ? 500 : 0;
    setTimeout(() => nav.classList.toggle('active'), a);
    if (win.scrollHeight > 0) fadeOut(win, 500);
});
const navs = nav.querySelectorAll('.ul .li');
navs.forEach(a => {
    let classes = a.classList;
    a.addEventListener('click', (e) => {
        if (classes.contains('import')) importingexporting('import');
        else if (classes.contains('export')) importingexporting('export');
        else if (classes.contains('refresh')) {
            if (e.shiftKey) window.location.reload(true);
            else {
                if (localStorage.playlists && sync.classList.contains('on')) importurls(localStorage.playlists);
                getsubscriptions();
            }
        } else if (classes.contains('theme')) themez(e);
        else if (classes.contains('mode')) {
            if (e.shiftKey) {
                if (window.confirm('Are you sure you want to trigger a supernova? This will reset everything!')) supernova();
                else return false;
            } else if (e.altKey) window.location = '/ytl';
            else modez();
        } else if (classes.contains('pin')) pinz();
    });
});

win.querySelector('.fade').addEventListener('click', () => exitnav());

// Accordion
const h2s = document.querySelectorAll('h2 .title');
h2s.forEach(a => {
    a.addEventListener('click', () => {
        if (!document.getElementById('new')) {
            let h2 = a.closest('.h2');
            let div = h2.nextElementSibling;
            h2.classList.toggle('expanded');
            setTimeout(() => {
                if (h2.classList.contains('expanded')) {
                    if (a.closest('.latest') && !subscriptions.querySelector('.channels .active')) {
                        setTimeout(() => {
                            let b = favorites.querySelector('.li') ? favorites : all;
                            let r = Math.floor(Math.random() * b.querySelectorAll('.li').length);
                            b.querySelectorAll('.li')[r].click();
                            h2.querySelector('.arrow .fa').classList = 'fa fa-angle-up';
                            slideDown(div);
                        }, 1e3);
                        setTimeout(() => enableautoplay(), 2e3);
                    } else {
                        h2.querySelector('.arrow .fa').classList = 'fa fa-angle-up';
                        slideDown(div);
                        setactive();
                        enableautoplay();
                    }
                    if (document.getElementById('news')) {
                        let b = document.getElementById('news');
                        b.classList.add('wait');
                        setTimeout(() => b.parentElement.removeChild(b), 1e3);
                        sessionStorage.news = 'Seen it';
                    }
                } else {
                    h2.querySelector('.arrow .fa').classList = 'fa fa-angle-down';
                    slideUp(div);
                }
                if (a.closest('.subscriptions')) {
                    setTimeout(() => {
                        if (div.style.display === 'none') all.style = '';
                    }, 600);
                }
            });
        }
    });
});

// Section Menus
const menus = document.querySelectorAll('.menu .li');
menus.forEach(a => {
    let classes = a.classList;
    a.addEventListener('click', () => {
        if (a.closest('.latest')) {
            if (classes.contains('more')) {
                let n = parseInt(latest.querySelector('.videos').getAttribute('data-page')) + 1;
                latest.querySelector('.videos').setAttribute('data-page', n);
            }
        } else if (a.closest('.subscriptions')) {
            if (classes.contains('more')) slideDown(all, 500);
            else if (classes.contains('reorder')) reorderz();
            else if (classes.contains('refresh')) getsubscriptions();
        }
    });
});

// Dynamic Content Interaction
document.body.addEventListener('click', (e) => {
    let a = e.target;
    let classes = a.classList;
    if (a.localName === 'li') {
        if (a.closest('.videos')) {
            if (classes.contains('active')) {
                if (classes.contains('playing')) return false;
                else if (document.querySelector('.playing')) {
                    document.querySelector('.playing').classList.remove('playing');
                    classes.add('playing');
                }
            } else {
                if (screen.querySelector('iframe')) {
                    if (window.confirm('Stop current video?')) {
                        let b = screen.querySelector('iframe');
                        b.parentNode.removeChild(b);
                        if (document.querySelector('.videos .active')) document.querySelectorAll('.videos .active').forEach(a => classes = 'li');
                        a.classList = 'li active playing';
                        loadvideo();
                        setTimeout(() => setactive(), 10);
                    } else return false;
                } else {
                    if (document.querySelector('.videos .active')) document.querySelectorAll('.videos .active').forEach(a => classes = 'li');
                    a.classList = 'li active playing';
                    loadvideo();
                    setTimeout(() => setactive(), 10);
                    if (video.scrollHeight === 0) {
                        slideDown(video);
                        setTimeout(() => {
                            if (localStorage.pin && localStorage.pin === 'pin' && (window.innerHeight > window.innerWidth)) video.classList.add('pin');
                        }, 500);
                    }
                }
                if (!video.classList.contains('pin')) zenscroll.toY(0, 500);
            }
        } else if (a.closest('.channels') && !subscriptions.classList.contains('edit')) {
            if (classes.contains('active')) return false;
            if (document.querySelector('.channels .active')) document.querySelector('.channels .active').classList = 'li';
            classes.add('active');
            getlatest('upload');
            setTimeout(() => {
                if (latest.querySelector('.videos').scrollHeight === 0) latest.querySelector('.h2 .title').click();
                if (window.innerHeight > window.innerWidth) {
                    let o = video.classList.contains('pin') ? latest.offsetTop - screen.scrollHeight : latest.offsetTop;
                    zenscroll.toY(o, 500);
                }
            }, 250);
            setTimeout(() => enableautoplay(), 750);
        }
    } else if (a.localName === 'span') {
        if (classes.contains('save')) {
            if (a.closest('.latest')) {
                if (saved.querySelector('.videos').innerHTML.includes(a.previousElementSibling.getAttribute('data-id'))) return false;
                a.title = 'Remove';
                saved.querySelector('.videos').insertAdjacentHTML('beforeend', a.closest('.li').outerHTML);
                setTimeout(() => a.title = 'Save');
            } else {
                let b = a.closest('.li');
                b.parentNode.removeChild(b);
            }
            enableautoplay();
            setTimeout(() => localStorage.saved = saved.querySelector('.videos').innerHTML, 500);

        } else if (classes.contains('star')) {
            let b = a.closest('.li');
            let c = a.closest('.favorites') ? all : favorites;
            c.insertAdjacentHTML('beforeend', b.outerHTML);
            b.parentNode.removeChild(b);
        }
        setactive();
    }
});

// Theme
function themez(e) {
    let a, b;
    if (e.shiftKey) setTimeout(() => newsize(), 1e3);
    else {
        let classes = document.body.classList;
        if (classes.contains('a')) a = 'a', b = 'b';
        else if (classes.contains('b')) a = 'b', b = 'c';
        else if (classes.contains('c')) a = 'c', b = 'd';
        else if (classes.contains('d')) a = 'd', b = 'e';
        else if (classes.contains('e')) a = 'e', b = 'f';
        else if (classes.contains('f')) a = 'f', b = 'g';
        else if (classes.contains('g')) a = 'g', b = 'h';
        else if (classes.contains('h')) a = 'h', b = 'i';
        else if (classes.contains('i')) a = 'i', b = 'j';
        else if (classes.contains('j')) a = 'j', b = 'k';
        else if (classes.contains('k')) a = 'k', b = 'l';
        else if (classes.contains('l')) a = 'l', b = 'm';
        else if (classes.contains('m')) a = 'm', b = 'n';
        else if (classes.contains('n')) a = 'n', b = 'o';
        else if (classes.contains('o')) a = 'o', b = 'p';
        else if (classes.contains('p')) a = 'p', b = 'q';
        else if (classes.contains('q')) a = 'q', b = 'r';
        else if (classes.contains('r')) a = 'r', b = 's';
        else if (classes.contains('s')) a = 's', b = 'aa';
        else if (classes.contains('aa')) a = 'aa', b = 'bb';
        else a = 'bb', b = 'a';
        classes.remove(a);
        classes.add(b);
        localStorage.theme = b;
    }
}

var touch;
nav.querySelector('.refresh').addEventListener('touchstart', () => {
    touch = setTimeout(() => window.location.reload(true), 2e3);
}, false);
nav.querySelector('.refresh').addEventListener('touchend', () => clearTimeout(touch), false);

/// Recall theme
function recalltheme() {
    var x = localStorage.mode ? localStorage.mode : 'day';
    var y = localStorage.theme ? localStorage.theme : 'aa';
    document.body.classList = 'body ' + x + ' ' + y;
}
recalltheme();

// Night Mode
function modez() {
    let a, b, classes = document.body.classList;
    if (classes.contains('day')) a = 'day', b = 'night';
    else a = 'night', b = 'day';
    classes.remove(a);
    classes.add(b);
    localStorage.mode = b;
}

// Resizing
function newsize() {
    let a = document.querySelector('#info .h1').scrollHeight;
    let b = document.querySelector('#info .channel').scrollHeight >= document.querySelector('#info .date').scrollHeight ? document.querySelector('#info .channel').scrollHeight : document.querySelector('#info .date').scrollHeight;
    document.getElementById('info').style.height = a + b + 'px';
}
var resizing;
window.addEventListener('resize', () => {
    clearTimeout(resizing);
    resizing = setTimeout(() => {
        if ((window.scrollY + screen.scrollHeight) <= (latest.offsetTop - 5)) newsize();
    }, 1e3);
});
window.addEventListener('scroll', () => {
    if ((window.scrollY + screen.scrollHeight) <= (latest.offsetTop - 5)) newsize();
});
