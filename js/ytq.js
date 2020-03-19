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
const options = document.getElementById('options');
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
            .then(a => { return a.json() })
            .then(b => {
                let x = b.nextPageToken;
                b.items.forEach(c => { list.push(c) });
                let s = setInterval(() => {
                    if (x) {
                        let d = fetch(nexturl + x)
                            .then(e => { return e.json() })
                            .then(f => {
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
                                    if (favorites.innerHTML.indexOf(a.snippet.resourceId.channelId) === -1) all.insertAdjacentHTML('beforeend', '<li class="li" data-background><span class="span listing" data-id="' + a.snippet.resourceId.channelId + '"><span class="span image"><img class="img" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="background-image:url(' + a.snippet.thumbnails.default.url + ');"></span><span class="span title">' + a.snippet.title.replace(/\'/gm, '&#39;') + '</span></span><span class="span handles"><span class="span star" data-color=""><i class="fa fa-star" aria-hidden="true"></i></span><span class="span drag" data-color=""><i class="fa fa-bars" aria-hidden="true"></i></span></span></li>');
                                }, 10 * i);
                            });
                        }, 1e3);
                        setTimeout(() => {
                            localStorage.all = all.innerHTML;
                        }, 5e3);
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

const actives = document.querySelectorAll('.active');
actives.forEach(a => a.classList = 'li');

// Videos
/// Get
function getlatest(a = 'search') {
    let subscriptionname = subscriptions.querySelector('.active .title').innerText;
    let subscriptionid = subscriptions.querySelector('.active .listing').getAttribute('data-id');
    let url = '';
    let n = 1;
    if (a === 'search') url = 'https://www.googleapis.com/youtube/v3/search?&channelId=' + subscriptionid + '&part=snippet,id&order=date&maxResults=16&type=video&key=' + youtubekey;
    else if (a === 'upload') url = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet%2C+id&playlistId=' + subscriptionid.replace(/UC/gm, 'UU') + '&order=date&maxResults=16&key=' + youtubekey;
    fetch(url)
        .then(a => { return a.json() })
        .then(b => {
            latest.querySelector('.videos').innerHTML = '';
            latest.querySelector('.videos').setAttribute('data-page', n);
            latest.querySelector('.youtube .a').setAttribute('href', 'https://www.youtube.com/channel/' + subscriptionid);
            if (a === 'upload') b.items.sort((a, b) => new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt));
            b.items.forEach(c => {
                let vid = a === 'upload' ? c.snippet.resourceId.videoId : c.id.videoId;
                latest.querySelector('.videos').insertAdjacentHTML('beforeend', '<li class="li" title="' + c.snippet.title.replace(/\'/gm, '&#39;') + ' - ' + new Date(c.snippet.publishedAt).getDate() + ' ' + new Date(c.snippet.publishedAt).toLocaleString('en-us', { month: 'short' }) + ' ' + new Date(c.snippet.publishedAt).getFullYear() + '" data-background><span class="span listing" data-id="' + vid + '" data-date="' + new Date(c.snippet.publishedAt).getDate() + ' ' + new Date(c.snippet.publishedAt).toLocaleString('en-us', { month: 'short' }) + ' ' + new Date(c.snippet.publishedAt).getFullYear() + '" data-channel="' + c.snippet.channelTitle.replace(/\'/gm, '&#39;') + '" data-channel-id="' + c.snippet.channelId + '"><span class="span image"><img class="img" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="background-image:url(' + c.snippet.thumbnails.medium.url + '"></span><span class="span title">' + c.snippet.title.replace(/\'/gm, '&#39;') + '</span></span><span class="save" title="Save" data-color><i class="fa fa-plus"></i></span></li>');
            });
            setactive();
        })
        .catch((e) => console.error(e));
}

/// Load, Play
function loadvideo() {
    let a = document.querySelector('.videos .playing .listing').getAttribute('data-id');
    let b = window.innerWidth >= window.innerHeight ? 'maxresdefault' : 'hqdefault';
    let hd = document.getElementById('hd');
    let chan = document.getElementById('channel');
    screen.setAttribute('data-id', a);
    document.getElementById('img').style = document.querySelector('.videos .active .listing .image .img').getAttribute('style');
    hd.style = document.querySelector('.videos .active .listing .image .img').getAttribute('style').replace(/mqdefault/gm, b);
    hd.style.opacity = null;
    document.getElementById('title').innerText = document.querySelector('.videos .active .listing .title').innerText;
    chan.innerText = document.querySelector('.videos .active .listing').getAttribute('data-channel');
    chan.parentNode.setAttribute('href', 'https://www.youtube.com/channel/' + document.querySelector('.videos .active .listing').getAttribute('data-channel-id'));
    document.getElementById('date').innerText = document.querySelector('.videos .active .listing').getAttribute('data-date');
    document.getElementById('youtube').querySelector('.a').setAttribute('href', 'https://www.youtube.com/channel/' + document.querySelector('.videos .active .listing').getAttribute('data-channel-id'));
    setTimeout(() => { if ((window.scrollY + screen.scrollHeight) <= (latest.offsetTop - 5)) newsize() }, 500);
    setTimeout(() => hd.style.opacity = 1, 1e3);
}
screen.addEventListener('click', () => playvideo(document.querySelector('.videos .playing .listing').getAttribute('data-id')));

function playvideo(a = document.querySelector('.videos .playing .listing').getAttribute('data-id')) {
    if (screen.querySelector('iframe')) {
        let b = screen.querySelector('iframe');
        b.parentNode.removeChild(b);
        
    } else if (YT || YT.Player) {
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
        
    } else {
        let ytf = '<iframe src="https://www.youtube.com/embed/' + a + '?autoplay=1&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3"></iframe>';
        screen.querySelector('.inner').insertAdjacentHTML('afterbegin', ytf);
    }
}

///  Autoplay
function onPlayerStateChange(event) {
    if (event.data === 0) {
        let a = video.querySelector('.screen iframe');
        fadeOut(a);
        setTimeout(() => a.parentNode.removeChild(a), 1e3);
        var si = setTimeout(() => {
            if (document.querySelector('.autoplay').classList.contains('on') && document.querySelector('.videos .playing').nextElementSibling) {
                let b;
                if (document.querySelector('.videos .playing').closest('.latest')) b = document.getElementById('latest');
                else if (document.querySelector('.videos .playing').closest('.saved')) b = document.getElementById('saved');
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
    if (localStorage.autoplay) {
        document.querySelectorAll('.autoplay').forEach(a => a.classList = 'li autoplay ' + localStorage.autoplay);
    }
    var ls = latest.querySelectorAll('.videos .li').length > 1 ? null : 'none';
    var ss = saved.querySelectorAll('.videos .li').length > 1 ? null : 'none';
    latest.querySelector('.autoplay').style.display = ls;
    saved.querySelector('.autoplay').style.display = ss;
}

document.querySelectorAll('.autoplay').forEach(a => {
    a.addEventListener('click', () => {
        var b = a.classList.contains('off') ? 'on' : 'off';
        a.classList = 'li autoplay ' + b;
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
            if (a.getAttribute('data-id') === screen.getAttribute('data-id')) {
                if (!a.closest('.li').classList.contains('active')) {
                    if (!document.querySelector('.playing')) a.closest('.li').classList = 'li active playing';
                    else a.closest('.li').classList = 'li active';
                }
            } else a.closest('.li').classList = 'li';
        });
    }, 50);
}

// Importing, Exporting

function updateoptions() {
    options.querySelectorAll('.li').forEach(a => {
        if (!localStorage.getItem(a.classList[1])) a.classList.add('hide');
        else a.classList.remove('hide');
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
            options.querySelectorAll('.li').forEach(a => a.classList.remove('active'));
            document.getElementById('input').value = '';
            document.getElementById('input').placeholder = a === 'new' ? '' : 'import' ? c : d;
            fadeIn(win, t);
        }, 1e3);
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
                    .then(a => { return a.json() })
                    .then(b => {
                        let x = b.nextPageToken;
                        let nexturl = url + '&pageToken=';
                        if (!localStorage.playlists) localStorage.playlists = y;
                        else if (!localStorage.playlists.includes(y)) localStorage.playlists += ',' + y;
                        if (window.location.hash === '#debug') {
                            console.log('Items:');
                            console.log(b.items);
                        }
                        b.items.forEach(c => { if (!saved.querySelector('.videos').innerHTML.includes(c.snippet.resourceId.videoId)) list.push(c) });
                        let s = setInterval(() => {
                            if (x) {
                                let d = fetch(nexturl + x)
                                    .then(e => { return e.json() })
                                    .then(f => {
                                        x = f.nextPageToken;
                                        f.items.forEach(g => {
                                            if (!saved.querySelector('.videos').innerHTML.includes(g.snippet.resourceId.videoId)) list.push(g);
                                        });
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
                                                let url = 'https://www.googleapis.com/youtube/v3/videos?part=snippet%2C+id&id=' + a.snippet.resourceId.videoId + '&key=' + youtubekey;
                                                fetch(url)
                                                    .then(a => { return a.json() })
                                                    .then(b => {
                                                        b.items.forEach(c => { if (!saved.querySelector('.videos').innerHTML.includes(c.id)) saved.querySelector('.videos').insertAdjacentHTML('beforeend', '<li class="li" title="' + c.snippet.title.replace(/\'/gm, '&#39;') + ' - ' + new Date(c.snippet.publishedAt).getDate() + ' ' + new Date(c.snippet.publishedAt).toLocaleString('en-us', { month: 'short' }) + ' ' + new Date(c.snippet.publishedAt).getFullYear() + '" data-background><span class="span listing" data-id="' + c.id + '" data-date="' + new Date(c.snippet.publishedAt).getDate() + ' ' + new Date(c.snippet.publishedAt).toLocaleString('en-us', { month: 'short' }) + ' ' + new Date(c.snippet.publishedAt).getFullYear() + '" data-channel="' + c.snippet.channelTitle.replace(/\'/gm, '&#39;') + '" data-channel-id="' + c.snippet.channelId + '"><span class="span image"><img class="img" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="background-image:url(' + c.snippet.thumbnails.medium.url + '"></span><span class="span title">' + c.snippet.title.replace(/\'/gm, '&#39;') + '</span></span><span class="save" title="Save" data-color><i class="fa fa-plus"></i></span></li>') });
                                                    })
                                                    .catch((e) => console.error(e));
                                            }
                                        }, 10 * i);
                                    });
                                    if (localStorage.playlists && localStorage.playlists !== '') saved.querySelector('.sync').style.display = null;
                                    else saved.querySelector('.sync').style.display = 'none';
                                    setTimeout(() => enableautoplay(), 500);
                                }, 1e3);
                            }
                        }, 1e3);
                    })
                    .catch((e) => console.error(e));

            } else {
                let url = 'https://www.googleapis.com/youtube/v3/videos?part=snippet%2C+id&id=' + y + '&key=' + youtubekey;
                fetch(url)
                    .then(a => { return a.json() })
                    .then(b => {
                        if (window.location.hash === '#debug') {
                            console.log('Items:');
                            console.log(b.items);
                        }
                        b.items.forEach(c => { if (!saved.querySelector('.videos').innerHTML.includes(c.id)) saved.querySelector('.videos').insertAdjacentHTML('beforeend', '<li class="li" title="' + c.snippet.title.replace(/\'/gm, '&#39;') + ' - ' + new Date(c.snippet.publishedAt).getDate() + ' ' + new Date(c.snippet.publishedAt).toLocaleString('en-us', { month: 'short' }) + ' ' + new Date(c.snippet.publishedAt).getFullYear() + '" data-background><span class="span listing" data-id="' + c.id + '" data-date="' + new Date(c.snippet.publishedAt).getDate() + ' ' + new Date(c.snippet.publishedAt).toLocaleString('en-us', { month: 'short' }) + ' ' + new Date(c.snippet.publishedAt).getFullYear() + '" data-channel="' + c.snippet.channelTitle.replace(/\'/gm, '&#39;') + '" data-channel-id="' + c.snippet.channelId + '"><span class="span image"><img class="img" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="background-image:url(' + c.snippet.thumbnails.medium.url + '"></span><span class="span title">' + c.snippet.title.replace(/\'/gm, '&#39;') + '</span></span><span class="save" title="Save" data-color><i class="fa fa-plus"></i></span></li>') });
                    })
                    .catch((e) => console.error(e));
            }
        }
    });
    setTimeout(() => { localStorage.saved = saved.querySelector('.videos').innerHTML }, 4e3);
}

saved.querySelector('.sync').addEventListener('click', () => {
    let a = saved.querySelector('.sync');
    let b = a.classList.contains('off') ? 'on' : 'off';
    a.classList = 'li sync ' + b;
    localStorage.synced = b;
    if (b === 'off') localStorage.playlists = '';
});

if (localStorage.playlists) {
    if (localStorage.synced && localStorage.synced === 'on') saved.querySelector('.sync').classList = 'li sync on';
    else saved.querySelector('.sync').classList = 'li sync off';
} else saved.querySelector('.sync').style.display = 'none';

function importbundle(a) {
    if (window.location.hash === '#debug') console.log('Importing...');
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

options.querySelectorAll('.li').forEach(a => {
    a.addEventListener('click', () => {
        a.classList.toggle('active');
        setTimeout(() => {
            let b = '';
            if (options.querySelector('.id').classList.contains('active')) b += '##id##' + localStorage.id;
            if (options.querySelector('.favorites').classList.contains('active')) b += '##favorites##' + localStorage.favorites;
            if (options.querySelector('.all').classList.contains('active')) b += '##all##' + localStorage.all;
            if (options.querySelector('.saved').classList.contains('active')) b += '##saved##' + localStorage.saved;
            if (options.querySelector('.playlists').classList.contains('active')) b += '##playlists##' + localStorage.playlists;
            if (options.querySelector('.theme').classList.contains('active')) b += '##theme##' + localStorage.theme;
            if (options.querySelector('.mode').classList.contains('active')) b += '##mode##' + localStorage.mode;
            if (options.querySelector('.pin').classList.contains('active')) b += '##pin##' + localStorage.pin;
            document.getElementById('input').value = b;
        }, 10);
    });
});
                            
document.getElementById('input').addEventListener('click', () => {
    if (win.getAttribute('data-page') === 'export') document.getElementById('input').select();
});

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
                {
                    if (a === 'redmond') localStorage.id = 'UCqMnpO2ok_usDfeoTm36EGA';
                    else if (a === 'victoria') localStorage.id = 'UCHPVh0gqxn5IO3geNxI6uxQ';
                    else if (a === 'charlie') localStorage.id = 'UCb2CJSF7SNz55COAHQ3-dBQ';
                    else localStorage.id = a;
                }
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
    if (localStorage.pin === 'pin') {
        nav.querySelector('.pin .span').classList.add('p');
        if ((window.innerWidth > window.innerHeight) && (window.scrollY > (screen.offsetTop + screen.scrollHeight))) video.classList.add('pin');
        else if (window.innerWidth <= window.innerHeight) video.classList.add('pin');
        else video.classList.remove('pin');
    } else video.classList.remove('pin');
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
nav.querySelectorAll('.ul .li').forEach(a => {
    a.addEventListener('click', (e) => {
        if (a.classList.contains('import')) importingexporting('import');
        else if (a.classList.contains('export')) importingexporting('export');
        else if (a.classList.contains('refresh')) {
            if (e.shiftKey) window.location.reload(true);
            else {
                if (localStorage.playlists && saved.querySelector('.sync').classList.contains('on')) importurls(localStorage.playlists);
                if (all.style.display === 'block') getsubscriptions();
            }
        } else if (a.classList.contains('theme')) themez(e);
        else if (a.classList.contains('mode')) {
            if (e.shiftKey) {
                if (window.confirm('Are you sure you want to trigger a supernova? This will reset everything!')) supernova();
                else return false;
            } else if (e.altKey) window.location = '/ytl';
            else modez();
        } else if (a.classList.contains('pin')) pinz();
    });
});

win.querySelector('.fade').addEventListener('click', () => exitnav());

// Accordion
document.querySelectorAll('h2 .title').forEach(a => {
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
document.querySelectorAll('.menu .li').forEach(a => {
    a.addEventListener('click', () => {
        if (a.closest('.latest')) {
            if (a.classList.contains('more')) {
                let n = parseInt(latest.querySelector('.videos').getAttribute('data-page')) + 1;
                latest.querySelector('.videos').setAttribute('data-page', n);
            }
        } else if (a.closest('.subscriptions')) {
            if (a.classList.contains('more')) slideDown(all, 500);
            else if (a.classList.contains('reorder')) reorderz();
            else if (a.classList.contains('refresh')) getsubscriptions();

        }
    });
});

// Dynamic Content Interaction
document.body.addEventListener('click', (e) => {
    let a = e.target;
    if (a.localName === 'li') {
        if (a.closest('.videos')) {
            if (a.classList.contains('active')) {
                if (a.classList.contains('playing')) return false;
                else if (document.querySelector('.playing')) {
                    document.querySelector('.playing').classList.remove('playing');
                    a.classList.add('playing');
                }
            } else {
                if (video.querySelector('.screen iframe')) {
                    if (window.confirm('Stop current video?')) {
                        let b = video.querySelector('.screen iframe');
                        b.parentNode.removeChild(b);
                        if (document.querySelector('.videos .active')) document.querySelectorAll('.videos .active').forEach(a => a.classList = 'li');
                        a.classList = 'li active playing';
                        loadvideo();
                        setTimeout(() => setactive(), 10);
                    } else return false;
                } else {
                    if (document.querySelector('.videos .active')) document.querySelectorAll('.videos .active').forEach(a => a.classList = 'li');
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
            if (a.classList.contains('active')) return false;
            if (document.querySelector('.channels .active')) document.querySelector('.channels .active').classList = 'li';
            a.classList.add('active');
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
        if (a.classList.contains('save')) {
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

        } else if (a.classList.contains('star')) {
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
    let bc = document.body.classList;
    a = bc.contains('a') ? 'a' : bc.contains('b') ? 'b' : bc.contains('c') ? 'c' : bc.contains('d') ? 'd' : bc.contains('e') ? 'e' : bc.contains('f') ? 'f' : bc.contains('g') ? 'g' : bc.contains('h') ? 'h' : bc.contains('i') ? 'i' : bc.contains('j') ? 'j' : bc.contains('k') ? 'k' : bc.contains('l') ? 'l' : bc.contains('m') ? 'm' : bc.contains('n') ? 'n' : bc.contains('o') ? 'o' : bc.contains('p') ? 'p' : bc.contains('q') ? 'q' : bc.contains('r') ? 'r' : bc.contains('s') ? 's' : bc.contains('aa') ? 'aa' : 'bb';
    b = bc.contains('a') ? 'b' : bc.contains('b') ? 'c' : bc.contains('c') ? 'd' : bc.contains('d') ? 'e' : bc.contains('e') ? 'f' : bc.contains('f') ? 'g' : bc.contains('g') ? 'h' : bc.contains('h') ? 'i' : bc.contains('i') ? 'j' : bc.contains('j') ? 'k' : bc.contains('k') ? 'l' : bc.contains('l') ? 'm' : bc.contains('m') ? 'n' : bc.contains('n') ? 'o' : bc.contains('o') ? 'p' : bc.contains('p') ? 'q' : bc.contains('q') ? 'r' : bc.contains('r') ? 's' : bc.contains('s') ? 'aa' : bc.contains('aa') ? 'bb' : 'a';
    document.body.classList.remove(a);
    document.body.classList.add(b);
    localStorage.theme = b;
}

var touch;
nav.querySelector('.refresh').addEventListener('touchstart', () => { touch = setTimeout(() => window.location.reload(true), 2e3) }, false);
nav.querySelector('.refresh').addEventListener('touchend', () => clearTimeout(touch), false);
nav.querySelector('.theme').addEventListener('touchstart', () => { touch = setTimeout(() => font(), 2e3) }, false);
nav.querySelector('.theme').addEventListener('touchend', () => clearTimeout(touch), false);

/// Recall theme
function recalltheme() {
    var x = localStorage.mode ? localStorage.mode : 'day';
    var y = localStorage.theme ? localStorage.theme : 'aa';
    document.body.classList = 'body ' + x + ' ' + y;
    if (localStorage.font) document.body.classList.add(localStorage.font);
}
recalltheme();

// Night Mode
function modez() {
    let a = document.body.classList.contains('day') ? 'day' : 'night';
    let b = document.body.classList.contains('day') ? 'night' : 'day';
    document.body.classList.remove(a);
    document.body.classList.add(b);
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
